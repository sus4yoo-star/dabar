"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { theme } from "@/lib/theme";
import AppShell from "@/components/besora/AppShell";
import ShareSection from "@/components/besora/ShareSection";
import InvitePanel from "@/components/besora/InvitePanel";
import PushToggle from "@/components/besora/PushToggle";
import { getSupabase } from "@/lib/besora/supabase";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";
import { fetchChatList, chatTime, getMyId, type ChatListItem } from "@/lib/besora/companions";

export default function Me() {
  const { myLang } = useLang();
  const [total, setTotal] = useState<number | null>(null);
  const [decided, setDecided] = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    const sb = getSupabase();
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setLoggedIn(false); return; }
      setLoggedIn(true);
      setMyId(data.user.id);
      const uid = data.user.id;
      // 본인 기록만 집계 (예전엔 전체를 세어 "나의 기록"이 부정확했음)
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
      const [{ count: t }, { count: d }, { count: m }] = await Promise.all([
        sb.from("sessions").select("*", { count: "exact", head: true }).eq("evangelist_id", uid),
        sb.from("sessions").select("*", { count: "exact", head: true }).eq("evangelist_id", uid).eq("decided", true),
        sb.from("sessions").select("*", { count: "exact", head: true }).eq("evangelist_id", uid).gte("created_at", monthStart.toISOString()),
      ]);
      setTotal(t ?? 0);
      setDecided(d ?? 0);
      setMonth(m ?? 0);
      try { setChats(await fetchChatList()); } catch { /* ignore */ }
    });
  }, []);

  return (
    <AppShell title={ui(myLang, "myRecords")}>
      {!loggedIn ? (
        <p style={{ borderRadius: 16, border: `1px solid ${theme.cardBorder}`, background: theme.card, padding: 20, fontSize: 14, color: theme.textMuted, lineHeight: 1.6 }}>
          {ui(myLang, "loginToConnect")} (게스트로도 전도는 자유롭게 가능합니다.)
          <Link href="/login" style={{ display: "inline-block", marginTop: 12, borderRadius: 999, background: theme.primary, color: "#fff", padding: "10px 20px", fontWeight: 700, textDecoration: "none" }}>{ui(myLang, "login")}</Link>
        </p>
      ) : (
        <>
          {/* 통계 3칸 — '전한 횟수'는 골드(핵심), '결단'은 의미색(초록), '이번 달' 골드 카드 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div style={{ borderRadius: 16, background: "var(--t-sacredLight)", border: `1px solid var(--t-sacredBorder)`, padding: "16px 12px" }}>
              <p style={{ fontSize: 12.5, color: theme.textMuted, margin: 0 }}>{ui(myLang, "statShared")}</p>
              <p className="serif" style={{ fontSize: 32, color: "var(--t-sacred)", margin: "4px 0 0", fontWeight: 700 }}>{total ?? "…"}</p>
            </div>
            <div style={{ borderRadius: 16, background: theme.card, border: `1px solid ${theme.cardBorder}`, padding: "16px 12px" }}>
              <p style={{ fontSize: 12.5, color: theme.textMuted, margin: 0 }}>{ui(myLang, "statDecided")}</p>
              <p className="serif" style={{ fontSize: 32, color: theme.correct, margin: "4px 0 0", fontWeight: 700 }}>{decided ?? "…"}</p>
            </div>
            <div style={{ borderRadius: 16, background: theme.card, border: `1px solid ${theme.cardBorder}`, padding: "16px 12px" }}>
              <p style={{ fontSize: 12.5, color: theme.textMuted, margin: 0 }}>{ui(myLang, "statMonth")}</p>
              <p className="serif" style={{ fontSize: 32, color: theme.primarySoft, margin: "4px 0 0", fontWeight: 700 }}>{month ?? "…"}</p>
            </div>
          </div>
          {(total ?? 0) > 0 && (
            <p style={{ margin: "12px 2px 0", fontSize: 13.5, color: theme.textMuted, lineHeight: 1.6, textAlign: "center" }}>{ui(myLang, "encourage")}</p>
          )}

          {/* 동행 — 골드 섹션 라벨 */}
          <div style={{ marginTop: 18 }}>
            <ShareSection icon="userPlus">{ui(myLang, "companions")}</ShareSection>
            <p style={{ fontSize: 13, color: theme.textMuted, margin: "0 0 12px", lineHeight: 1.55 }}>{ui(myLang, "inviteDesc")}</p>

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
                        : <div style={{ width: 46, height: 46, borderRadius: 999, flexShrink: 0, background: "var(--t-sacredLight)", color: "var(--t-sacred)", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 17 }}>{(c.nickname || "·").charAt(0)}</div>}
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

            <PushToggle />
            <InvitePanel />
          </div>
        </>
      )}
    </AppShell>
  );
}
