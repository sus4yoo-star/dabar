"use client";

import { getSupabase } from "@/lib/besora/supabase";

// 공개 VAPID 키(비밀 아님). 서버는 짝이 되는 비밀키(VAPID_PRIVATE_KEY)를 환경변수로 사용.
export const VAPID_PUBLIC_KEY =
  "BIpALnramBB_b99FS7kdN54QsUOZIvbSh64qx77NxwJQ119mWsg6btsPAH7dkW_ExQx0VL-xd8kN2vLVcwy_ieo";

export function pushSupported(): boolean {
  return typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export type PushState = "unsupported" | "denied" | "off" | "on";

export async function getPushState(): Promise<PushState> {
  if (!pushSupported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = reg ? await reg.pushManager.getSubscription() : null;
    return sub ? "on" : "off";
  } catch { return "off"; }
}

// 알림 켜기: SW 등록 → 권한 요청 → 구독 → DB 저장
export async function enablePush(): Promise<PushState> {
  if (!pushSupported()) return "unsupported";
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return perm === "denied" ? "denied" : "off";

  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    });
  }

  const json: any = sub.toJSON();
  const sb = getSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return "off";
  await sb.from("push_subscriptions").upsert(
    { endpoint: json.endpoint, user_id: auth.user.id, p256dh: json.keys.p256dh, auth: json.keys.auth },
    { onConflict: "endpoint" }
  );
  return "on";
}

export async function disablePush(): Promise<void> {
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = reg ? await reg.pushManager.getSubscription() : null;
    if (sub) {
      await getSupabase().from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
      await sub.unsubscribe();
    }
  } catch { /* ignore */ }
}

// 동행 상대에게 푸시 보내기 (메시지 전송 후 호출)
export async function notifyPeer(companionId: string, title: string, body: string): Promise<void> {
  try {
    const sb = getSupabase();
    const { data } = await sb.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    await fetch("/api/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ companionId, title, body, url: `/share/chat/${companionId}` }),
    });
  } catch { /* ignore */ }
}

// 소그룹 모임의 다른 멤버들에게 푸시 (그룹 메시지 전송 후 호출)
export async function notifyGroup(groupId: string, title: string, body: string): Promise<void> {
  try {
    const sb = getSupabase();
    const { data } = await sb.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    await fetch("/api/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ groupId, title, body, url: `/groups/${groupId}` }),
    });
  } catch { /* ignore */ }
}
