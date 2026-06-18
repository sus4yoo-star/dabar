"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import {
  Group, GroupMember, GroupMessage, GroupPhoto, MAX_MEMBERS,
  fetchGroup, fetchGroupMessages, fetchMembers, fetchPhotos, joinGroup, leaveGroup,
  sendGroupMessage, subscribeGroupMessages, updateNotice, uploadPhoto, deletePhoto,
  setGroupPublic, deleteGroup,
} from "@/lib/besora/groups";
import { PushState, disablePush, enablePush, getPushState, notifyGroup } from "@/lib/besora/push";
import { useConfirm } from "@/components/ConfirmModal";
import { Skeleton } from "@/components/Skeleton";
import { ACCENT } from "@/lib/ui";

export default function GroupDetailPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { user, nickname } = useAuth();
  const { show, view } = useToast();
  const { confirm, view: confirmView } = useConfirm();
  const id = String(useParams().id);

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [editingNotice, setEditingNotice] = useState(false);
  const [noticeDraft, setNoticeDraft] = useState("");
  const [photos, setPhotos] = useState<GroupPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [push, setPush] = useState<PushState>("off");
  const fileRef = useRef<HTMLInputElement>(null);
  const bottom = useRef<HTMLDivElement>(null);

  const isMember = !!user && members.some(m => m.user_id === user.id);
  const amLeader = !!user && !!group && group.leader === user.id;
  const full = !!group && !isMember && group.member_count >= MAX_MEMBERS;
  const nameById = Object.fromEntries(members.map(m => [m.user_id, m.nickname]));

  async function saveNotice() {
    try {
      await updateNotice(id, noticeDraft);
      setGroup(g => g ? { ...g, notice: noticeDraft.trim() || null } : g);
    } catch { /* */ }
    setEditingNotice(false);
  }

  async function load() {
    setLoading(true);
    const [g, ms] = await Promise.all([fetchGroup(id), fetchMembers(id)]);
    setGroup(g); setMembers(ms);
    if (user && ms.some(m => m.user_id === user.id)) {
      const [msgs, phs] = await Promise.all([fetchGroupMessages(id), fetchPhotos(id)]);
      setMessages(msgs); setPhotos(phs);
    }
    setLoading(false);
  }

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    const ok = files.filter(f => f.size <= 10 * 1024 * 1024);
    if (ok.length < files.length) show(t("grp.photoBig"));
    if (!ok.length) return;
    setUploading(true);
    try { for (const f of ok) await uploadPhoto(id, f); setPhotos(await fetchPhotos(id)); }
    catch { show(t("grp.notReady")); }
    setUploading(false);
  }
  async function togglePush() {
    if (push === "on") { await disablePush(); setPush("off"); }
    else { const st = await enablePush(); setPush(st); if (st === "denied") show(t("grp.notReady")); }
  }
  async function onDeletePhoto(p: GroupPhoto) {
    if (!(await confirm({ title: t("grp.delPhoto"), confirmLabel: t("acct.delete"), danger: true }))) return;
    await deletePhoto(p);
    setPhotos(prev => prev.filter(x => x.id !== p.id));
    setLightbox(null);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id, user]);

  // 실시간 — 멤버일 때만
  useEffect(() => {
    if (!isMember) return;
    const off = subscribeGroupMessages(id, (m) => setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, m]));
    return off;
  }, [id, isMember]);

  // 알림 상태 — 멤버일 때 1회 조회
  useEffect(() => {
    if (!isMember) return;
    getPushState().then(setPush).catch(() => {});
  }, [isMember]);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  async function handleJoin() {
    if (!user) { router.push("/login"); return; }
    try { await joinGroup(id); await load(); }
    catch (e) { if ((e as Error)?.message === "full") { show(t("grp.fullMsg")); await load(); } }
  }
  async function handleLeave() {
    await leaveGroup(id);
    router.push("/groups");
  }
  async function toggleVisibility() {
    if (!group) return;
    const next = !group.is_public;
    try { await setGroupPublic(id, next); setGroup(g => g ? { ...g, is_public: next } : g); show(t("grp.visChanged")); }
    catch { show(t("grp.notReady")); }
  }
  async function removeGroup() {
    if (!(await confirm({ title: t("grp.deleteGroup"), message: t("grp.delGroupConfirm"), confirmLabel: t("grp.deleteGroup"), danger: true }))) return;
    try { await deleteGroup(id); router.push("/groups"); }
    catch { show(t("grp.notReady")); }
  }
  async function inviteKakao() {
    if (!group) return;
    const url = `https://dabar.theamov.com/groups/${id}`;
    const lines = [
      `${group.name} ${t("grp.inviteTitle")}`,
      group.place ? `📍 ${group.place}` : "",
      group.schedule ? `🕒 ${group.schedule}` : "",
      `${t("grp.inviteJoin")} → ${url}`,
    ].filter(Boolean);
    const textMsg = lines.join("\n");
    try {
      if (navigator.share) await navigator.share({ title: group.name, text: textMsg, url });
      else { await navigator.clipboard.writeText(textMsg); show(t("grp.inviteCopied")); }
    } catch { /* 취소됨 */ }
  }
  async function send() {
    const body = text.trim();
    if (!body) return;
    setText("");
    try {
      await sendGroupMessage(id, body);
      if (group) notifyGroup(id, group.name, `${nickname}: ${body}`.slice(0, 120));
    } catch { setText(body); }
  }

  if (loading) return <Center><div style={{ width: "100%", maxWidth: 380 }}><Skeleton w="55%" h={18} /><Skeleton w="100%" h={70} r={14} style={{ marginTop: 14 }} /><Skeleton w="100%" h={48} r={12} style={{ marginTop: 12 }} /><Skeleton w="80%" h={14} style={{ marginTop: 16 }} /></div></Center>;
  if (!group) return <Center>{t("grp.notReady")}</Center>;

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", height: "100dvh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* 헤더 */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: theme.bg, borderBottom: `1px solid ${theme.cardBorder}`, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => router.push("/groups")} aria-label={t("common.back")} style={{ fontSize: 14, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 10, padding: "7px 12px", cursor: "pointer", whiteSpace: "nowrap" }}>←</button>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 15.5, fontWeight: 800, color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{group.name}</span>
          <span style={{ display: "block", fontSize: 11, color: theme.textFaint }}>👥 {group.member_count}/{MAX_MEMBERS}{t("grp.members")}{full ? ` · ${t("grp.full")}` : ""}</span>
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", padding: "14px 16px 16px" }}>
        {/* 공지 (리더 작성) */}
        {(group.notice || amLeader) && (
          <div style={{ padding: "12px 14px", borderRadius: 14, border: `1px solid ${ACCENT.blue.border}`, background: ACCENT.blue.bg, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: ACCENT.blue.fg }}>📌 {t("grp.notice")}</span>
              {amLeader && !editingNotice && (
                <button onClick={() => { setNoticeDraft(group.notice ?? ""); setEditingNotice(true); }} style={{ fontSize: 11.5, fontWeight: 700, color: theme.primarySoft, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>✏️ {t("grp.noticeEdit")}</button>
              )}
            </div>
            {editingNotice ? (
              <div>
                <textarea value={noticeDraft} onChange={e => setNoticeDraft(e.target.value)} placeholder={t("grp.noticePh")} rows={3}
                  style={{ width: "100%", boxSizing: "border-box", fontSize: 13.5, padding: "9px 11px", borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.card, color: theme.text, outline: "none", resize: "vertical", lineHeight: 1.5 }} />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button onClick={() => setEditingNotice(false)} style={{ flex: 1, padding: 9, fontSize: 13, fontWeight: 700, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 9, cursor: "pointer" }}>{t("grp.cancel")}</button>
                  <button onClick={saveNotice} style={{ flex: 2, padding: 9, fontSize: 13, fontWeight: 800, color: "#fff", background: theme.primary, border: "none", borderRadius: 9, cursor: "pointer" }}>{t("grp.save")}</button>
                </div>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 13.5, color: group.notice ? theme.text : theme.textFaint, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{group.notice || t("grp.noNotice")}</p>
            )}
          </div>
        )}

        {/* 오프라인 모임 정보 */}
        <div style={{ padding: "12px 14px", borderRadius: 14, border: `1px solid ${theme.cardBorder}`, background: theme.card, marginBottom: 14 }}>
          {group.place && <p style={{ margin: "0 0 5px", fontSize: 13.5, color: theme.text }}>📍 {group.place}</p>}
          {group.schedule && <p style={{ margin: "0 0 5px", fontSize: 13.5, color: theme.text }}>🕒 {group.schedule}</p>}
          {group.description && <p style={{ margin: "6px 0 0", fontSize: 13, color: theme.textMuted, lineHeight: 1.6 }}>{group.description}</p>}
        </div>

        {/* 카카오톡으로 초대하기 (멤버) — 링크 공유 → 받은 사람이 열면 참여 */}
        {isMember && (
          <button onClick={inviteKakao} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", marginBottom: 14, fontSize: 14, fontWeight: 800, color: ACCENT.blue.fg, background: ACCENT.blue.chip, border: `1px solid ${ACCENT.blue.border}`, borderRadius: 12, cursor: "pointer" }}>{t("grp.invite")}</button>
        )}

        {/* 리더 설정 — 공개/비공개 전환 · 모임 삭제 */}
        {amLeader && (
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <button onClick={toggleVisibility} style={{ flex: 1, padding: "9px", fontSize: 12.5, fontWeight: 700, color: theme.primarySoft, background: theme.primaryBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 10, cursor: "pointer", whiteSpace: "nowrap" }}>
              {group.is_public ? t("grp.makePrivate") : t("grp.makePublic")}
            </button>
            <button onClick={removeGroup} style={{ flex: 1, padding: "9px", fontSize: 12.5, fontWeight: 700, color: theme.wrong, background: theme.wrongBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 10, cursor: "pointer", whiteSpace: "nowrap" }}>
              {t("grp.deleteGroup")}
            </button>
          </div>
        )}
        {!group.is_public && (
          <p style={{ margin: "0 0 14px", fontSize: 11.5, color: theme.textMuted, textAlign: "center" }}>🔒 {t("grp.private")}</p>
        )}

        {/* 사진 (멤버) */}
        {isMember && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 7px 2px" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: theme.textFaint, letterSpacing: 0.5 }}>📷 {t("grp.photos")}{photos.length ? ` · ${photos.length}` : ""}</span>
              <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ fontSize: 12, fontWeight: 700, color: theme.primarySoft, background: theme.primaryBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 8, padding: "5px 11px", cursor: "pointer" }}>{uploading ? t("grp.uploading") : t("grp.addPhoto")}</button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={onPickPhoto} style={{ display: "none" }} />
            {photos.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                {photos.map((p, idx) => {
                  const canDel = (user && p.uploader === user.id) || amLeader;
                  return (
                    <div key={p.id} style={{ position: "relative", aspectRatio: "1 / 1", borderRadius: 10, overflow: "hidden", border: `1px solid ${theme.cardBorder}` }}>
                      <img src={p.url} alt={t("grp.photos")} onClick={() => setLightbox(idx)} style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer", display: "block" }} />
                      {canDel && (
                        <button onClick={() => onDeletePhoto(p)} aria-label={t("acct.delete")} style={{ position: "absolute", top: 4, insetInlineEnd: 4, width: 22, height: 22, borderRadius: 999, border: "none", background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 13, lineHeight: "22px", cursor: "pointer", padding: 0 }}>×</button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 참여자 */}
        {members.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: theme.textFaint, letterSpacing: 0.5, margin: "0 0 7px 2px" }}>{t("grp.membersTitle")} · {members.length}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {members.map(m => (
                <span key={m.user_id} style={{ fontSize: 12.5, fontWeight: 600, color: m.role === "leader" ? theme.primarySoft : theme.text, background: m.role === "leader" ? theme.primaryBg : theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 999, padding: "4px 11px" }}>
                  {m.role === "leader" ? "👑 " : ""}{m.nickname}
                </span>
              ))}
            </div>
            {/* 모임 나가기 (리더 아닌 멤버) */}
            {isMember && members.find(m => m.user_id === user?.id)?.role !== "leader" && (
              <button onClick={handleLeave} style={{ marginTop: 10, padding: "4px 0", fontSize: 12, color: theme.textFaint, background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" }}>{t("grp.leave")}</button>
            )}
          </div>
        )}

        {/* 나눔 채팅 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 8px 2px" }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: theme.textFaint, letterSpacing: 0.5 }}>💬 {t("grp.chat")}</span>
          {isMember && push !== "unsupported" && (
            <button onClick={togglePush} style={{ fontSize: 11.5, fontWeight: 700, color: push === "on" ? ACCENT.blue.fg : theme.textMuted, background: push === "on" ? ACCENT.blue.chip : theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 999, padding: "4px 11px", cursor: "pointer" }}>{push === "on" ? t("grp.notifOn") : t("grp.notifOff")}</button>
          )}
        </div>
        {!isMember ? (
          <div style={{ textAlign: "center", padding: "1.5rem 1rem", color: theme.textMuted }}>
            <p style={{ fontSize: 13.5, margin: "0 0 12px" }}>{full ? t("grp.fullMsg") : t("grp.joinToChat")}</p>
            <button onClick={handleJoin} disabled={full} style={{ padding: "13px 30px", fontSize: 15, fontWeight: 800, color: "#fff", background: full ? theme.textFaint : "linear-gradient(135deg,#1f9bef 0%,#1577c2 100%)", border: "none", borderRadius: 13, cursor: full ? "default" : "pointer", opacity: full ? 0.7 : 1, boxShadow: full ? "none" : "0 8px 20px rgba(31,155,239,0.25)" }}>{full ? t("grp.full") : t("grp.join")}</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.length === 0 && (
              <p style={{ fontSize: 13, color: theme.textFaint, textAlign: "center", padding: "1.25rem 0" }}>{t("grp.chatEmpty")}</p>
            )}
            {messages.map((m, i) => {
              const mine = user && m.sender === user.id;
              const showDay = i === 0 || new Date(m.created_at).toDateString() !== new Date(messages[i - 1].created_at).toDateString();
              return (
                <div key={m.id} style={{ display: "contents" }}>
                {showDay && (
                  <div style={{ alignSelf: "center", margin: "8px 0 2px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted, background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 999, padding: "3px 12px" }}>{fmtDay(m.created_at, t)}</span>
                  </div>
                )}
                <div style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "82%", display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start" }}>
                  {!mine && <span style={{ display: "block", fontSize: 10.5, color: theme.textFaint, margin: "0 0 2px 4px" }}>{nameById[m.sender] ?? "익명"}</span>}
                  <span style={{ display: "inline-block", fontSize: 14, lineHeight: 1.5, padding: "8px 12px", borderRadius: 14, background: mine ? theme.primary : theme.card, color: mine ? "#fff" : theme.text, border: mine ? "none" : `1px solid ${theme.cardBorder}`, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.body}</span>
                  <span style={{ fontSize: 9.5, color: theme.textFaint, margin: "2px 4px 0" }}>{fmtTime(m.created_at)}</span>
                </div>
                </div>
              );
            })}
            <div ref={bottom} />
          </div>
        )}
      </div>

      {/* 입력 / 나가기 */}
      {isMember && (
        <div style={{ flexShrink: 0, background: theme.bg, borderTop: `1px solid ${theme.cardBorder}`, padding: "10px 12px calc(10px + env(safe-area-inset-bottom))", display: "flex", gap: 8, alignItems: "center" }}>
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} placeholder={t("grp.msgPh")}
            style={{ flex: 1, fontSize: 14, padding: "10px 13px", borderRadius: 20, border: `1px solid ${theme.border}`, background: theme.card, color: theme.text, outline: "none" }} />
          <button onClick={send} disabled={!text.trim()} style={{ flexShrink: 0, fontSize: 14, fontWeight: 800, color: "#fff", background: "linear-gradient(135deg,#1f9bef 0%,#1577c2 100%)", border: "none", borderRadius: 20, padding: "10px 18px", cursor: "pointer", opacity: text.trim() ? 1 : 0.5, boxShadow: text.trim() ? "0 4px 12px rgba(31,155,239,0.28)" : "none" }}>{t("grp.send")}</button>
        </div>
      )}
      {lightbox !== null && photos[lightbox] && (
        <Lightbox photos={photos} index={lightbox} onIndex={setLightbox} onClose={() => setLightbox(null)} />
      )}
      {confirmView}
      {view}
    </main>
  );
}

// 앱 내 사진 크게 보기 — 좌우 넘기기(버튼·스와이프·키보드), 배경 탭하면 닫기
function Lightbox({ photos, index, onIndex, onClose }: { photos: GroupPhoto[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const n = photos.length;
  const go = useCallback((d: number) => onIndex((index + d + n) % n), [index, n, onIndex]);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  const navBtn: React.CSSProperties = { position: "absolute", top: "50%", transform: "translateY(-50%)", width: 42, height: 42, borderRadius: 999, border: "none", background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 22, cursor: "pointer", display: "grid", placeItems: "center" };

  return (
    <div role="dialog" aria-modal="true" onClick={onClose}
      onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={e => { const s = touchX.current; if (s == null) return; const dx = e.changedTouches[0].clientX - s; if (Math.abs(dx) > 45) go(dx > 0 ? -1 : 1); touchX.current = null; }}
      style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.92)", display: "grid", placeItems: "center" }}>
      <button onClick={onClose} aria-label="close" style={{ position: "absolute", top: 14, insetInlineEnd: 14, width: 38, height: 38, borderRadius: 999, border: "none", background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 20, cursor: "pointer" }}>×</button>
      {n > 1 && <button onClick={e => { e.stopPropagation(); go(-1); }} aria-label="prev" style={{ ...navBtn, insetInlineStart: 10 }}>‹</button>}
      <img src={photos[index].url} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: "94vw", maxHeight: "84vh", objectFit: "contain", borderRadius: 8 }} />
      {n > 1 && <button onClick={e => { e.stopPropagation(); go(1); }} aria-label="next" style={{ ...navBtn, insetInlineEnd: 10 }}>›</button>}
      {n > 1 && <span style={{ position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)", color: "#fff", fontSize: 12.5, opacity: 0.85 }}>{index + 1} / {n}</span>}
    </div>
  );
}

function fmtTime(iso: string): string {
  try { return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); } catch { return ""; }
}

function fmtDay(iso: string, t: (k: string) => string): string {
  try {
    const d = new Date(iso); const now = new Date();
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = Math.round((today.getTime() - day.getTime()) / 86400000);
    if (diff === 0) return t("grp.today");
    if (diff === 1) return t("grp.yesterday");
    return d.toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" });
  } catch { return ""; }
}

function Center({ children }: { children: React.ReactNode }) {
  return <div style={{ textAlign: "center", padding: "4rem 1.5rem", color: theme.textMuted, minHeight: "60dvh" }}>{children}</div>;
}
