"use client";
import { useEffect, useRef } from "react";

// 모달 포커스 트랩 — 열려 있는 동안 Tab/Shift+Tab 이 모달 안에서만 순환하고,
// 열릴 때 첫 포커스 가능한 요소(보통 버튼)로 포커스를 옮긴다. (키보드 접근성)
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!active || !el) return;
    const SEL = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';
    const focusables = () => Array.from(el.querySelectorAll<HTMLElement>(SEL)).filter((x) => x.offsetParent !== null);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const f = focusables();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [active]);
  return ref;
}
