import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/I18nContext";
import { AnimatePresence, motion } from "framer-motion";
import JSZip from "jszip";
import type {
  CropAspect,
  TransformInput,
  TransformProgress,
  WatermarkOpts,
} from "@/workers/convert.worker";
import type { TargetFormat } from "@/lib/formats";
import {
  ACCEPTED_ACCEPT_ATTR,
  ACCEPTED_MIME_LIST,
  blobsToPdf,
  detectKind,
  pdfToPngBlobs,
  tiffToPngBlob,
} from "@/lib/formats";
import { Upload, Download, Settings, Trash2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type ItemStatus = "queued" | "running" | "done" | "error" | "blocked";

type Item = {
  id: string;
  name: string;
  outName: string;
  originalSize: number;
  newSize: number;
  status: ItemStatus;
  progress: number;
  url?: string;
  blob?: Blob;
  error?: string;
  sourceKind: string;
};

type Position = WatermarkOpts["position"];
type WMSize = WatermarkOpts["size"];
type WMColor = WatermarkOpts["color"];

const POSITIONS: Position[] = ["tl", "tc", "tr", "cl", "cc", "cr", "bl", "bc", "br"];

export type ConsumeResult = {
  allowed: boolean;
  reason?: "file_too_large" | "weekly_limit_reached";
  remaining: number;
  maxBytes: number;
};

let workerSingleton: Worker | null = null;
function getWorker(): Worker | null {
  if (typeof window === "undefined") return null;
  if (workerSingleton) return workerSingleton;
  try {
    workerSingleton = new Worker(
      new URL("../workers/convert.worker.ts", import.meta.url),
      { type: "module" },
    );
  } catch (e) {
    console.error("[converter] worker init failed", e);
    workerSingleton = null;
  }
  return workerSingleton;
}

function nameWith(base: string, ext: string) {
  return base.replace(/\.[^.]+$/, "") + "." + ext;
}

export function Converter({
  maxBytes,
  canConsume,
  consumeOne,
  onBlocked,
}: {
  maxBytes: number;
  canConsume: (n: number) => boolean;
  consumeOne: (meta: {
    fileSizeBytes: number;
    sourceFormat?: string;
    targetFormat?: string;
  }) => Promise<ConsumeResult>;
  onBlocked: (msg: string) => void;
}) {
  const { t } = useI18n();
  const [target, setTarget] = useState<TargetFormat>("webp");
  const [quality, setQuality] = useState(80);
  const [items, setItems] = useState<Item[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [advanced, setAdvanced] = useState(false);

  // Advanced settings
  const [maxW, setMaxW] = useState<number | "">("");
  const [maxH, setMaxH] = useState<number | "">("");
  const [keepAspect, setKeepAspect] = useState(true);
  const [crop, setCrop] = useState<CropAspect>("original");
  const [wmText, setWmText] = useState("");
  const [wmPos, setWmPos] = useState<Position>("br");
  const [wmOpacity, setWmOpacity] = useState(0.6);
  const [wmSize, setWmSize] = useState<WMSize>("m");
  const [wmColor, setWmColor] = useState<WMColor>("white");
  const [mergePdf, setMergePdf] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const resolversRef = useRef<Map<string, (m: TransformProgress) => void>>(new Map());
  const setItem = useCallback((id: string, patch: Partial<Item>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }, []);

  useEffect(() => {
    const w = getWorker();
    if (!w) return;
    const onMsg = (e: MessageEvent<TransformProgress>) => {
      const cb = resolversRef.current.get(e.data.id);
      if (cb) cb(e.data);
    };
    w.addEventListener("message", onMsg);
    return () => w.removeEventListener("message", onMsg);
  }, []);

  const runOne = useCallback(
    (input: TransformInput, onProgress: (p: number) => void) =>
      new Promise<{ blob: Blob }>((resolve, reject) => {
        const w = getWorker();
        if (!w) {
          reject(new Error("worker_unavailable"));
          return;
        }
        resolversRef.current.set(input.id, (m) => {
          if (m.type === "progress") onProgress(m.progress);
          else if (m.type === "done") {
            resolversRef.current.delete(input.id);
            resolve({ blob: m.blob });
          } else if (m.type === "error") {
            resolversRef.current.delete(input.id);
            reject(new Error(m.error));
          }
        });
        w.postMessage(input);
      }),
    [],
  );

  const rasterTarget: "png" | "jpeg" | "webp" = target === "pdf" ? "jpeg" : target;
  const targetExt = target === "pdf" ? "pdf" : target === "jpeg" ? "jpg" : target;

  const wmPayload: WatermarkOpts | null = wmText.trim()
    ? { text: wmText.trim(), position: wmPos, opacity: wmOpacity, size: wmSize, color: wmColor }
    : null;

  const processBatch = useCallback(
    async (files: File[]) => {
      const accepted = files.filter((f) => {
        if (ACCEPTED_MIME_LIST.includes(f.type)) return true;
        const k = detectKind(f);
        return k !== "unknown";
      });
      if (!accepted.length) return;

      const oversize = accepted.find((f) => f.size > maxBytes);
      if (oversize) {
        onBlocked(`${oversize.name} · ${t("converter.blocked", { msg: `${Math.round(maxBytes / (1024 * 1024))}MB` })}`);
        return;
      }
      if (!canConsume(accepted.length)) {
        onBlocked(t("limits.countdownStart"));
        return;
      }

      const rows: Item[] = accepted.map((f, i) => ({
        id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`,
        name: f.name,
        outName: nameWith(f.name, targetExt),
        originalSize: f.size,
        newSize: 0,
        status: "queued",
        progress: 0,
        sourceKind: detectKind(f),
      }));
      setItems((prev) => [...rows, ...prev]);

      const producedForPdf: { name: string; blob: Blob }[] = [];

      for (let i = 0; i < accepted.length; i++) {
        const file = accepted[i];
        const row = rows[i];
        const kind = row.sourceKind as ReturnType<typeof detectKind>;

        const reservation = await consumeOne({
          fileSizeBytes: file.size,
          sourceFormat: kind,
          targetFormat: target,
        });
        if (!reservation.allowed) {
          setItem(row.id, {
            status: "blocked",
            error:
              reservation.reason === "file_too_large"
                ? t("converter.error", { msg: "file_too_large" })
                : t("converter.error", { msg: "weekly_limit_reached" }),
          });
          onBlocked(
            reservation.reason === "file_too_large"
              ? t("converter.blocked", { msg: "file_too_large" })
              : t("limits.countdownStart"),
          );
          break;
        }

        setItem(row.id, { status: "running", progress: 5 });

        try {
          const sources: { name: string; blob: Blob }[] = [];
          if (kind === "pdf") {
            const pages = await pdfToPngBlobs(file, file.name.replace(/\.[^.]+$/, ""));
            sources.push(...pages);
          } else if (kind === "tiff") {
            sources.push({ name: file.name, blob: await tiffToPngBlob(file) });
          } else {
            sources.push({ name: file.name, blob: file });
          }

          const converted: { name: string; blob: Blob }[] = [];
          for (let s = 0; s < sources.length; s++) {
            const src = sources[s];
            const { blob } = await runOne(
              {
                id: `${row.id}-${s}`,
                blob: src.blob,
                target: rasterTarget,
                quality: quality / 100,
                resize:
                  maxW || maxH
                    ? { maxW: Number(maxW) || undefined, maxH: Number(maxH) || undefined, keepAspect }
                    : undefined,
                crop,
                watermark: wmPayload,
              },
              (p) => {
                const overall = Math.round(((s + p / 100) / sources.length) * 100);
                setItem(row.id, { progress: overall });
              },
            );
            converted.push({ name: nameWith(src.name, targetExt), blob });
          }

          if (target === "pdf") {
            if (mergePdf) {
              producedForPdf.push(...converted);
              setItem(row.id, { status: "done", progress: 100, newSize: converted.reduce((a, c) => a + c.blob.size, 0) });
            } else {
              const pdfBlob = await blobsToPdf(converted);
              const url = URL.createObjectURL(pdfBlob);
              setItem(row.id, {
                status: "done",
                progress: 100,
                blob: pdfBlob,
                url,
                newSize: pdfBlob.size,
                outName: nameWith(file.name, "pdf"),
              });
            }
          } else if (converted.length === 1) {
            const c = converted[0];
            const url = URL.createObjectURL(c.blob);
            setItem(row.id, {
              status: "done",
              progress: 100,
              blob: c.blob,
              url,
              newSize: c.blob.size,
              outName: c.name,
            });
          } else {
            const zip = new JSZip();
            converted.forEach((c) => zip.file(c.name, c.blob));
            const bundle = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(bundle);
            setItem(row.id, {
              status: "done",
              progress: 100,
              blob: bundle,
              url,
              newSize: bundle.size,
              outName: nameWith(file.name, "zip"),
            });
          }
        } catch (err) {
          console.error(err);
          setItem(row.id, { status: "error", error: (err as Error).message });
        }
      }

      if (target === "pdf" && mergePdf && producedForPdf.length) {
        try {
          const merged = await blobsToPdf(producedForPdf);
          const url = URL.createObjectURL(merged);
          setItems((prev) => [
            {
              id: `merged-${Date.now()}`,
              name: "merged.pdf",
              outName: "iflexi-merged.pdf",
              originalSize: producedForPdf.reduce((a, c) => a + c.blob.size, 0),
              newSize: merged.size,
              status: "done",
              progress: 100,
              blob: merged,
              url,
              sourceKind: "batch",
            },
            ...prev,
          ]);
        } catch (e) {
          console.error(e);
        }
      }
    },
    [
      maxBytes, canConsume, consumeOne, onBlocked, setItem, runOne,
      target, targetExt, rasterTarget, quality, maxW, maxH, keepAspect,
      crop, wmPayload, mergePdf,
    ],
  );

  const downloadZip = async () => {
    const ready = items.filter((i) => i.status === "done" && i.blob);
    if (!ready.length) return;
    const zip = new JSZip();
    ready.forEach((r) => zip.file(r.outName, r.blob!));
    const bundle = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(bundle);
    const a = document.createElement("a");
    a.href = url;
    a.download = "iflexi-batch.zip";
    a.click();
    URL.revokeObjectURL(url);
  };

  const overallProgress = useMemo(() => {
    if (!items.length) return 0;
    const running = items.filter((i) => i.status === "running" || i.status === "queued");
    if (!running.length) return 100;
    const sum = items.reduce((a, i) => a + i.progress, 0);
    return Math.round(sum / items.length);
  }, [items]);

  const busy = items.some((i) => i.status === "running" || i.status === "queued");

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <h3 className="text-3xl font-black tracking-tighter uppercase sm:text-4xl">{t("converter.title")}</h3>
          <p className="mt-4 text-base font-medium text-muted-foreground leading-relaxed">
            {t("converter.description")}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {(["png", "jpeg", "webp", "pdf"] as TargetFormat[]).map((f) => (
            <button
              key={f}
              onClick={() => setTarget(f)}
              className={`flex-1 rounded-xl px-6 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 sm:flex-none ${
                target === f
                  ? "bg-brand text-background neon-glow"
                  : "bg-card/50 border border-border/40 text-muted-foreground hover:border-brand/40 hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              processBatch(Array.from(e.dataTransfer.files));
            }}
            onClick={() => inputRef.current?.click()}
            className={`group relative flex min-h-[400px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all duration-500 ${
              dragOver 
                ? "border-brand bg-brand/5 neon-glow" 
                : "border-border/40 bg-card/20 hover:border-brand/40 hover:bg-card/30"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              accept={ACCEPTED_ACCEPT_ATTR}
              onChange={(e) => processBatch(Array.from(e.target.files || []))}
            />
            
            <div className="flex flex-col items-center gap-6">
              <div className={`rounded-2xl bg-card/50 p-6 transition-transform duration-500 group-hover:scale-110 ${dragOver ? "scale-110 border-brand/40" : "border-border/40"}`}>
                <Upload className={`h-10 w-10 ${dragOver ? "text-brand" : "text-muted-foreground/60"}`} />
              </div>
              <div className="text-center">
                <p className="text-xl font-black tracking-tight uppercase">{t("converter.drop")}</p>
                <p className="mt-2 text-sm font-medium text-muted-foreground">{t("converter.orClick")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="rounded-3xl border border-border/40 bg-card/20 p-8">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                <Settings size={14} />
                {t("converter.advanced")}
              </h4>
              <button 
                onClick={() => setAdvanced(!advanced)}
                className="text-[10px] font-black uppercase tracking-widest text-brand hover:neon-text"
              >
                {advanced ? "Kapat" : "Düzenle"}
              </button>
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <span>{t("converter.quality")}</span>
                  <span className="text-foreground">%{quality}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="mt-4 w-full accent-brand"
                />
              </div>

              {advanced && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 pt-6 border-t border-border/40"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Genişlik</span>
                      <input 
                        type="number" 
                        value={maxW} 
                        onChange={e => setMaxW(e.target.value ? Number(e.target.value) : "")}
                        placeholder="Auto"
                        className="mt-2 w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-xs font-bold outline-none focus:border-brand/40"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Yükseklik</span>
                      <input 
                        type="number" 
                        value={maxH} 
                        onChange={e => setMaxH(e.target.value ? Number(e.target.value) : "")}
                        placeholder="Auto"
                        className="mt-2 w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-xs font-bold outline-none focus:border-brand/40"
                      />
                    </label>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={keepAspect} 
                      onChange={e => setKeepAspect(e.target.checked)}
                      className="h-4 w-4 rounded border-border/40 bg-background/50 text-brand focus:ring-brand"
                    />
                    <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">Oranları Koru</span>
                  </label>
                </motion.div>
              )}
            </div>
          </div>

          {items.length > 0 && (
            <div className="flex-1 rounded-3xl border border-border/40 bg-card/20 p-8 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Liste ({items.length})</h4>
                <button 
                  onClick={() => setItems([])}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto max-h-[300px] space-y-3 pr-2">
                {items.map((it) => (
                  <div key={it.id} className="group relative rounded-2xl bg-background/50 p-4 border border-border/20">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-foreground/90">{it.name}</p>
                        <p className="mt-1 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                          {it.status === "done" ? `${(it.newSize / 1024).toFixed(1)} KB` : it.status}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        {it.status === "running" && <Loader2 className="h-4 w-4 animate-spin text-brand" />}
                        {it.status === "done" && <CheckCircle2 className="h-4 w-4 text-brand" />}
                        {it.status === "error" && <AlertCircle className="h-4 w-4 text-destructive" />}
                        {it.url && (
                          <a 
                            href={it.url} 
                            download={it.outName}
                            className="rounded-lg bg-brand/10 p-2 text-brand hover:bg-brand hover:text-background transition-all"
                          >
                            <Download size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                    {it.status === "running" && (
                      <div className="absolute bottom-0 left-0 h-0.5 bg-brand transition-all duration-300" style={{ width: `${it.progress}%` }} />
                    )}
                  </div>
                ))}
              </div>

              {items.some(i => i.status === "done") && (
                <button
                  onClick={downloadZip}
                  className="mt-6 w-full rounded-xl bg-foreground py-4 text-xs font-black uppercase tracking-widest text-background transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                >
                  <Download size={16} />
                  Tümünü İndir (.ZIP)
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
