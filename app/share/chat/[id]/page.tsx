"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { theme } from "@/lib/theme";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";
import {
  fetchCompanion, fetchMessages, sendMessage, subscribeMessages, markRead,
  getMyId, type Companion, type ChatMessage,
} from "@/lib/besora/companions";

export default function ChatPage() {
  const params = useParams();
  const companionId = String(params.id);
  const { myLang } = useLang();

  const [myId, setMyId] = useState<string | null>(null);
  const [companion, setCompanion] = useState<Companion | null>(null);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [auto, setAuto] = useState(true);
  const [tr, setTr] = useState<Record<string, string>>({}); // 메시지별 번역 캐시
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      const id = await getMyId();
      setMyId(id);
      if (!id) { setLoading(false); return; }
      const [c, m] = await Promise.all([fetchCompanion(companionId), fetchMessages(companionId)]);
      setCompanion(c);
      setMsgs(m);
      setLoading(false);
      markRead(companionId); // 방에 들어오면 읽음 처리
      unsub = subscribeMessages(companionId, (nm) => {
        setMsgs((prev) => (prev.some((p) => p.id === nm.id) ? prev : [...prev, nm]));
        if (nm.sender !== id) markRead(companionId); // 보고 있는 중 새 메시지도 읽음
      });
    })();
    return () => unsub();
  }, [companionId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  // 상대 메시지 자동 번역 (내 언어로). 감지 기반.
  useEffect(() => {
    if (!auto || !myId) return;
    const todo = msgs.filter((m) => m.sender !== myId && tr[m.id] === undefined);
    if (todo.length === 0) return;
    let cancelled = false;
    (async () => {
      for (const m of todo) {
        try {
          const r = await fetch("/api/translate", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ q: m.body, target: myLang }),
          });
          const d = await r.json();
          if (cancelled) return;
          // 이미 같은 언어면(원문==번역) 빈 문자열로 두어 중복 표시 안 함
          const out = d?.text && d.text.trim() !== m.body.trim() ? d.text : "";
          setTr((prev) => ({ ...prev, [m.id]: out }));
        } catch {
          if (cancelled) return;
          setTr((prev) => ({ ...prev, [m.id]: "" }));
        }
      }
    })();
    return () => { cancelled = true; };
  }, [msgs, auto, myId, myLang, tr]);

  async function onSend() {
    const body = text.trim();
    if (!body) return;
    setText("");
    try { await sendMessage(companionId, body); } catch { /* ignore */ }
  }

  if (loading) {
    return <Shell><div style={{ flex: 1, display: "grid", placeItems: "center", color: theme.textMuted }}>…</div></Shell>;
  }
  if (!myId) {
    return (
      <Shell>
        <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
          <div>
            <p style={{ color: theme.textMuted, marginBottom: 16 }}>{ui(myLang, "loginToConnect")}</p>
            <Link href="/login" style={{ borderRadius: 999, background: theme.primary, color: "#fff", padding: "12px 22px", fontWeight: 700, textDecoration: "none" }}>{ui(myLang, "login")}</Link>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: `1px solid ${theme.cardBorder}`, background: "#fff", position: "sticky", top: 0, zIndex: 5 }}>
        <Link href="/share/me" aria-label={ui(myLang, "backToList")} style={{ fontSize: 18, color: theme.textMuted, textDecoration: "none" }}>‹</Link>
        <Avatar url={companion?.avatarUrl ?? null} name={companion?.nickname ?? ""} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 700, color: theme.text, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{companion?.nickname ?? "동행자"}</p>
          <p style={{ margin: 0, fontSize: 11, color: theme.gold, fontWeight: 700 }}>{ui(myLang, "companionLabel")}</p>
        </div>
        <button onClick={() => setAuto((v) => !v)}
          style={{ flexShrink: 0, fontSize: 11.5, fontWeight: 700, borderRadius: 999, padding: "6px 11px", cursor: "pointer", border: `1px solid ${theme.cardBorder}`, background: auto ? theme.primaryBg : theme.card, color: auto ? theme.primarySoft : theme.textMuted }}>
          🌐 {ui(myLang, "autoTranslate")}{auto ? " ✓" : ""}
        </button>
      </div>

      {/* 메시지 */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "14px", display: "flex", flexDirection: "column", gap: 8, background: theme.bgGrad }}>
        {msgs.map((m) => {
          const mine = m.sender === myId;
          const t = tr[m.id];
          return (
            <div key={m.id} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "82%" }}>
              <div style={{ borderRadius: 16, padding: "9px 13px", fontSize: 15, lineHeight: 1.5,
                background: mine ? theme.primary : theme.card, color: mine ? "#fff" : theme.text,
                border: mine ? "none" : `1px solid ${theme.cardBorder}`,
                borderBottomRightRadius: mine ? 4 : 16, borderBottomLeftRadius: mine ? 16 : 4 }}>
                {m.body}
                {!mine && t ? (
                  <div style={{ marginTop: 5, paddingTop: 5, borderTop: `1px solid ${theme.cardBorder}`, fontSize: 13.5, color: theme.textMuted }}>🌐 {t}</div>
                ) : null}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* 입력 */}
      <div style={{ display: "flex", gap: 8, padding: "10px 12px", paddingBottom: "calc(10px + env(safe-area-inset-bottom))", borderTop: `1px solid ${theme.cardBorder}`, background: "#fff", flexShrink: 0 }}>
        <input value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onSend(); }}
          placeholder={ui(myLang, "chatPlaceholder")}
          style={{ flex: 1, borderRadius: 999, border: `1px solid ${theme.cardBorder}`, background: "#f2f7fb", padding: "11px 16px", fontSize: 15, color: theme.text, outline: "none" }} />
        <button onClick={onSend} disabled={!text.trim()}
          style={{ flexShrink: 0, borderRadius: 999, background: theme.gold, color: "#08263a", border: "none", padding: "0 18px", fontSize: 14, fontWeight: 800, cursor: "pointer", opacity: text.trim() ? 1 : 0.4 }}>
          {ui(myLang, "send")}
        </button>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", height: "100dvh", display: "flex", flexDirection: "column" }}>{children}</div>
  );
}

function Avatar({ url, name }: { url: string | null; name: string }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} width={36} height={36} style={{ borderRadius: 999, objectFit: "cover", flexShrink: 0 }} />;
  }
  return (
    <div style={{ width: 36, height: 36, borderRadius: 999, flexShrink: 0, background: theme.goldLight, color: theme.gold, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 15 }}>
      {(name || "·").charAt(0)}
    </div>
  );
}
