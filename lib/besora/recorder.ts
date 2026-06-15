// 화면 마이크 녹음 → 16kHz mono LINEAR16(PCM) base64 로 변환.
// iOS 사파리는 Web Speech(실시간 음성인식)를 지원하지 않으므로,
// getUserMedia + Web Audio 로 직접 녹음해 서버(구글 STT)로 보낸다. (안드로이드/데스크톱도 동일 동작 가능)

export type Recorder = {
  stop: () => Promise<{ base64: string; rate: number }>;
  cancel: () => void;
};

export function canRecord(): boolean {
  return typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof window !== "undefined" &&
    !!(window.AudioContext || (window as any).webkitAudioContext);
}

// 오디오 컨텍스트는 한 번만 만들어 재사용한다. 매번 생성·종료하면 느리고,
// iOS 사파리는 권한 팝업 이후(=제스처 밖에서) 만든 컨텍스트가 suspended 로 남아
// 첫 녹음이 무음으로 잡히는 버그가 있다.
let _ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = (window.AudioContext || (window as any).webkitAudioContext);
  if (!AC) return null;
  if (!_ctx || _ctx.state === "closed") _ctx = new AC();
  return _ctx;
}

// 사용자 탭(제스처) 안에서 "동기"로 호출 — 컨텍스트를 미리 깨워 둔다.
// (resume 이 권한 팝업 이후로 밀리면 iOS 가 첫 녹음을 무음으로 잡음)
export function primeAudio(): void {
  const ctx = getCtx();
  if (ctx && ctx.state === "suspended") { ctx.resume().catch(() => {}); }
}

export async function startRecording(): Promise<Recorder> {
  const ctx = getCtx();
  if (!ctx) throw new Error("no-audio-context");
  try { await ctx.resume(); } catch { /* ignore */ }
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const inRate = ctx.sampleRate;
  const source = ctx.createMediaStreamSource(stream);
  const processor = ctx.createScriptProcessor(4096, 1, 1);
  const chunks: Float32Array[] = [];
  processor.onaudioprocess = (e: any) => {
    chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
  };
  source.connect(processor);
  processor.connect(ctx.destination);

  const cleanup = () => {
    try { processor.disconnect(); } catch { /* ignore */ }
    try { source.disconnect(); } catch { /* ignore */ }
    stream.getTracks().forEach((t) => t.stop());
    // 컨텍스트는 닫지 않고 재사용 — 다음 녹음이 빠르고 안정적.
  };

  return {
    cancel: cleanup,
    stop: async () => {
      cleanup();
      const len = chunks.reduce((a, c) => a + c.length, 0);
      const merged = new Float32Array(len);
      let off = 0;
      for (const c of chunks) { merged.set(c, off); off += c.length; }

      // 16kHz 로 다운샘플 + Int16(LINEAR16)
      const targetRate = 16000;
      const ratio = inRate / targetRate;
      const outLen = Math.max(0, Math.floor(merged.length / ratio));
      const out = new Int16Array(outLen);
      for (let i = 0; i < outLen; i++) {
        const s = merged[Math.floor(i * ratio)] || 0;
        const v = Math.max(-1, Math.min(1, s));
        out[i] = v < 0 ? v * 0x8000 : v * 0x7fff;
      }

      // base64 (작은 청크로 나눠 호출 스택 보호)
      const bytes = new Uint8Array(out.buffer);
      let bin = "";
      const CH = 0x8000;
      for (let i = 0; i < bytes.length; i += CH) {
        bin += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + CH)) as any);
      }
      return { base64: typeof btoa !== "undefined" ? btoa(bin) : Buffer.from(bin, "binary").toString("base64"), rate: targetRate };
    },
  };
}
