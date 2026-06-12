"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { theme } from "@/lib/theme";
import AppShell from "@/components/besora/AppShell";
import InvitePanel from "@/components/besora/InvitePanel";
import { getSupabase } from "@/lib/besora/supabase";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";
import { fetchChatList, chatTime, getMyId, type ChatListItem } from "@/lib/besora/companions";

export default function Me() {
  const { myLang } = useLang();
  const [total, setTotal] = useState<number | null>(null);
  const [decided, setDecided] = useState<number | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    const sb = getSupabase();
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setLoggedIn(false); return; }
      setLoggedIn(true);
      setMyId(data.user.id);
      const { count: t } = await sb.from("sessions").select("*", { count: "exact", head: true });
      const { count: d } = await sb.from("sessions").select("*", { count: "exact", head: true }).eq("decided", true);
      setTotal(t ?? 0);
      setDecided(d ?? 0);
      try { setChats(await fetchChatList()); } catch { /* ignore */ }
    });
  }, []);

  return (
    <AppShell>
      <h1 style={{ marginBottom: 20, fontFamily: "'Noto Serif KR',serif", fontSize: 24, fontWeight: 600, color: theme.text }}>{ui(myLang, "myRecords")}</h1>

      {!loggedIn ? (
        <p style={{ borderRadius: 16, border: `1px solid ${theme.cardBorder}`, background: theme.card, padding: 20, fontSize: 14, color: theme.textMuted, lineHeight: 1.6 }}>
          {ui(myLang, "loginToConnect")} (게스트로도 전도는 자유롭게 가능합니다.)
          <Link href="/login" style={{ display: "inline-block", marginTop: 12, borderRadius: 999, background: theme.primary, color: "#fff", padding: "10px 20px", fontWeight: 700, textDecoration: "none" }}>{ui(myLang, "login")}</Link>
        </p>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ borderRadius: 16, background: theme.card, border: `1px solid ${theme.cardBorder}`, padding: 20 }}>
              <p style={{ fontSize: 12, color: theme.textMuted, margin: 0 }}>전한 횟수</p>
              <p style={{ marginTop: 4, fontFamily: "'Noto Serif KR',serif", fontSize: 36, color: theme.gold, margin: "4px 0 0" }}>{total ?? "…"}</p>
            </div>
            <div style={{ borderRadius: 16, background: theme.card, border: `1px solid ${theme.cardBorder}`, padding: 20 }}>
              <p style={{ fontSize: 12, color: theme.textMuted, margin: 0 }}>함께 결단</p>
              <p style={{ marginTop: 4, fontFamily: "'Noto Serif KR',serif", fontSize: 36, color: theme.correct, margin: "4px 0 0" }}>{decided ?? "…"}</p>
            </div>
          </div>

          {/* 동행 */}
          <div style={{ marginTop: 28 }}>
            <h2 style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 18, fontWeight: 700, color: theme.text, margin: "0 0 6px" }}>🤝 {ui(myLang, "companions")}</h2>
            <p style={{ fontSize: 13, color: theme.textMuted, margin: "0 0 14px", lineHeight: 1.55 }}>{ui(myLang, "inviteDesc")}</p>

            {chats.length === 0 ? (
              <p style={{ fontSize: 13.5, color: theme.textFaint, margin: "0 0 16px" }}>{ui(myLang, "noCompanions")}</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {chats.map((c) => {
                  const mine = c.lastSender && myId && c.lastSender === myId;
                  const preview = c.lastBody ? (mine ? `나: ${c.lastBody}` : c.lastBody) : ui(myLang, "companionLabel");
                  return (
                    <Link key={c.id} href={`/share/chat/${c.id}`}
                      style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: 14, border: `1px solid ${theme.cardBorder}`, background: theme.card, padding: "12px 14px", textDecoration: "none" }}>
                      {c.avatarUrl
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={c.avatarUrl} alt="" width={46} height={46} style={{ borderRadius: 999, objectFit: "cover", flexShrink: 0 }} />
                        : <div style={{ width: 46, height: 46, borderRadius: 999, flexShrink: 0, background: theme.goldLight, color: theme.gold, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 17 }}>{(c.nickname || "·").charAt(0)}</div>}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                          <p style={{ margin: 0, fontWeight: 700, color: theme.text, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.nickname}</p>
                          <span style={{ flexShrink: 0, fontSize: 11, color: theme.textFaint, marginLeft: "auto" }}>{chatTime(c.lastAt)}</span>
                        </div>
                        <p style={{ margin: "2px 0 0", fontSize: 13, color: c.unread > 0 ? theme.text : theme.textMuted, fontWeight: c.unread > 0 ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{preview}</p>
                      </div>
                      {c.unread > 0 && (
                        <span style={{ flexShrink: 0, minWidth: 20, height: 20, padding: "0 6px", borderRadius: 999, background: theme.wrong, color: "#fff", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center" }}>{c.unread > 99 ? "99+" : c.unread}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}

            <InvitePanel />
          </div>
        </>
      )}
    </AppShell>
  );
}
