"use client";

import { useRouter } from "next/navigation";
import AppShell from "@/components/besora/AppShell";
import { useLang } from "@/lib/besora/LanguageContext";
import { ui } from "@/lib/besora/i18n";

export default function Setup() {
  const router = useRouter();
  const { myLang, setMyLang, languages } = useLang();

  return (
    <AppShell>
      <h1 className="mb-1 font-serif text-2xl font-semibold text-gospel-parch">
        {ui(myLang, "setMyLanguage")}
      </h1>
      <p className="mb-6 text-sm text-muted">{ui(myLang, "myLanguage")}</p>

      <div className="grid grid-cols-2 gap-3">
        {languages.map((l) => (
          <button
            key={l.code}
            onClick={() => {
              setMyLang(l.code);
              router.push("/share");
            }}
            className={`rounded-2xl border px-4 py-4 text-left ${
              l.code === myLang
                ? "border-gospel-gold bg-ink-3"
                : "border-white/10 bg-ink-2"
            }`}
          >
            <span className="block font-semibold text-gospel-parch">
              {l.name_native}
            </span>
            <span className="text-xs text-muted">{l.name_en}</span>
          </button>
        ))}
      </div>
    </AppShell>
  );
}
