"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { theme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import {
  Group, GroupMember, GroupMessage,
  fetchGroup, fetchGroupMessages, fetchMembers, joinGroup, leaveGroup,
  sendGroupMessage, subscribeGroupMessages,
} from "@/lib/besora/groups";

export default function GroupDetailPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { user } = useAuth();
  const id = String(useParams().id);

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const bottom = useRef<HTMLDivElement>(null);

  const isMember = !!user && members.some(m => m.user_id === user.id);
  const nameById = Object.fromEntries(members.map(m => [m.user_id, m.nickname]));

  async function load() {
    setLoading(true);
    const [g, ms] = await Promise.all([fetchGroup(id), fetchMembers(id)]);
    setGroup(g); setMembers(ms);
    if (user && ms.some(m => m.user_id === user.id)) setMessages(await fetchGroupMessages(id));
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id, user]);

  // 실시간 — 멤버일 때만
  useEffect(() => {
    if (!isMember) return;
    const off = subscribeGroupMessages(id, (m) => setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, m]));
    return off;
  }, [id, isMember]);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  async function handleJoin() {
    if (!user) { router.push("/login"); return; }
    try { await joinGroup(id); await load(); } catch { /* */ }
  }
  async function handleLeave() {
    await leaveGroup(id);
    router.push("/groups");
  }
  async function send() {
    const body = text.trim();
    if (!body) return;
    setText("");
    try { await sendGroupMessage(id, body); } catch { setText(body); }
  }

  if (loading) return <Center>…</Center>;
  if (!group) return <Center>{t("grp.notReady")}</Center>;

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      {/* 헤더 */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: theme.bg, borderBottom: `1px solid ${theme.cardBorder}`, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => router.push("/groups")} style={{ fontSize: 13, color: theme.textMuted, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 10, padding: "6px 10px", cursor: "pointer", whiteSpace: "nowrap" }}>←</button>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 15.5, fontWeight: 800, color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{group.name}</span>
          <span style={{ display: "block", fontSize: 11, color: theme.textFaint }}>👥 {group.member_count}{t("grp.members")}</span>
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", padding: "14px 16px 16px" }}>
        {/* 오프라인 모임 정보 */}
        <div style={{ padding: "12px 14px", borderRadius: 14, border: `1px solid ${theme.cardBorder}`, background: theme.card, marginBottom: 14 }}>
          {group.place && <p style={{ margin: "0 0 5px", fontSize: 13.5, color: theme.text }}>📍 {group.place}</p>}
          {group.schedule && <p style={{ margin: "0 0 5px", fontSize: 13.5, color: theme.text }}>🕒 {group.schedule}</p>}
          {group.description && <p style={{ margin: "6px 0 0", fontSize: 13, color: theme.textMuted, lineHeight: 1.6 }}>{group.description}</p>}
        </div>

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
          </div>
        )}

        {/* 나눔 채팅 */}
        <p style={{ fontSize: 11, fontWeight: 800, color: theme.textFaint, letterSpacing: 0.5, margin: "0 0 8px 2px" }}>💬 {t("grp.chat")}</p>
        {!isMember ? (
          <div style={{ textAlign: "center", padding: "1.5rem 1rem", color: theme.textMuted }}>
            <p style={{ fontSize: 13.5, margin: "0 0 12px" }}>{t("grp.joinToChat")}</p>
            <button onClick={handleJoin} style={{ padding: "12px 28px", fontSize: 15, fontWeight: 800, color: "#fff", background: theme.primary, border: "none", borderRadius: 12, cursor: "pointer" }}>{t("grp.join")}</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.map(m => {
              const mine = user && m.sender === user.id;
              return (
                <div key={m.id} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "82%" }}>
                  {!mine && <span style={{ display: "block", fontSize: 10.5, color: theme.textFaint, margin: "0 0 2px 4px" }}>{nameById[m.sender] ?? "익명"}</span>}
                  <span style={{ display: "inline-block", fontSize: 14, lineHeight: 1.5, padding: "8px 12px", borderRadius: 14, background: mine ? theme.primary : theme.card, color: mine ? "#fff" : theme.text, border: mine ? "none" : `1px solid ${theme.cardBorder}`, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.body}</span>
                </div>
              );
            })}
            <div ref={bottom} />
          </div>
        )}
      </div>

      {/* 입력 / 나가기 */}
      {isMember && (
        <div style={{ position: "sticky", bottom: 0, background: theme.bg, borderTop: `1px solid ${theme.cardBorder}`, padding: "10px 12px", display: "flex", gap: 8, alignItems: "center" }}>
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === "Enter") send(); }} placeholder={t("grp.msgPh")}
            style={{ flex: 1, fontSize: 14, padding: "10px 13px", borderRadius: 20, border: `1px solid ${theme.border}`, background: "#fff", color: theme.text, outline: "none" }} />
          <button onClick={send} disabled={!text.trim()} style={{ flexShrink: 0, fontSize: 14, fontWeight: 800, color: "#fff", background: theme.primary, border: "none", borderRadius: 20, padding: "10px 16px", cursor: "pointer", opacity: text.trim() ? 1 : 0.5 }}>{t("grp.send")}</button>
        </div>
      )}
      {isMember && members.find(m => m.user_id === user?.id)?.role !== "leader" && (
        <button onClick={handleLeave} style={{ margin: "0 12px 12px", padding: "8px", fontSize: 12.5, color: theme.textFaint, background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline" }}>{t("grp.leave")}</button>
      )}
    </main>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div style={{ textAlign: "center", padding: "4rem 1.5rem", color: theme.textMuted, minHeight: "60dvh" }}>{children}</div>;
}
