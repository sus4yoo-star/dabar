"use client";

import { useState } from "react";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";

export default function LanguageToggle() {
  const { myLang, seekerLang, setSeekerLang, setMyLang, languages } = useLang();
  const [open, setOpen] = useState<null | "my" | "seeker">(null);

  const nameOf = (code: string) =>
    languages.find((l) => l.code === code)?.name_native ?? code;

  return (
    <div className="relative">
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => setOpen(open === "my" ? null : "my")}
          className="rounded-full bg-ink-3 px-3 py-1.5 text-gospel-parch"
        >
          {nameOf(myLang)}
        </button>
        <span className="text-muted">↔</span>
        <button
          onClick={() => setOpen(open === "seeker" ? null : "seeker")}
          className="rounded-full px-3 py-1.5 font-semibold text-gospel-gold ring-1 ring-gospel-gold/50"
        >
          {seekerLang ? nameOf(seekerLang) : ui(myLang, "seekerLanguage")}
        </button>
      </div>

      {open && (
        <div className="absolute right-0 z-50 mt-2 max-h-72 w-56 overflow-auto rounded-2xl border border-white/10 bg-ink-2 p-2 shadow-2xl">
          <p className="px-2 py-1 text-xs text-muted">
            {open === "my" ? ui(myLang, "myLanguage") : ui(myLang, "seekerLanguage")}
          </p>
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                if (open === "my") setMyLang(l.code);
                else setSeekerLang(l.code);
                setOpen(null);
              }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-gospel-parch hover:bg-ink-3"
            >
              <span>{l.name_native}</span>
              <span className="text-xs text-muted">{l.name_en}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
