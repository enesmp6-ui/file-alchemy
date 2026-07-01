import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
      // Pre-flight: filter to accepted formats
      const accepted = files.filter((f) => {
        if (ACCEPTED_MIME_LIST.includes(f.type)) return true;
        const k = detectKind(f);
        return k !== "unknown";
      });
      if (!accepted.length) return;

      const oversize = accepted.find((f) => f.size > maxBytes);
      if (oversize) {
        onBlocked(`${oversize.name} · ${Math.round(maxBytes / (1024 * 1024))}MB üstünde.`);
        return;
      }
      if (!canConsume(accepted.length)) {
        onBlocked("Haftalık limitine ulaştın. Ücretsiz üye ol veya Pro'yu dene.");
        return;
      }

      // Create item rows immediately so UI shows queue
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

        // Reserve one slot per source file (PDFs count as one file even if many pages).
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
                ? "Dosya sınırı aşıldı"
                : "Haftalık limit doldu",
          });
          onBlocked(
            reservation.reason === "file_too_large"
              ? `${file.name} sunucunun izin verdiği boyutu aşıyor.`
              : "Haftalık limitine ulaştın.",
          );
          break;
        }

        setItem(row.id, { status: "running", progress: 5 });

        try {
          // Decode exotic sources to a raster Blob first.
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
              // Collect for a single merged PDF at the end
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
            // Multi-page source (PDF) exported as raster — zip them under one entry
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

      // Finalize merged PDF (one file for the whole batch)
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

  const doneCount = items.filter((i) => i.status === "done").length;
  const busy = items.some((i) => i.status === "running" || i.status === "queued");

  return (
    <div className="glass-card p-6 sm:p-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dönüştürücü</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Tüm işlem tarayıcında. PNG · JPG · WEBP · GIF · BMP · TIFF · PDF.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["png", "jpeg", "webp", "pdf"] as TargetFormat[]).map((f) => (
            <button
              key={f}
              onClick={() => setTarget(f)}
              className={`rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wider transition ${
                target === f
                  ? "bg-foreground text-background"
                  : "border border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {target !== "png" && target !== "pdf" && (
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Kalite</span>
            <span className="tabular-nums text-foreground/80">%{quality}</span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="mt-2 w-full accent-foreground"
          />
        </div>
      )}

      {/* Advanced panel */}
      <div className="mt-6">
        <button
          onClick={() => setAdvanced((v) => !v)}
          className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground"
        >
          <span>{advanced ? "− Gelişmiş" : "+ Gelişmiş"}</span>
        </button>
        <AnimatePresence initial={false}>
          {advanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-5 grid gap-6 md:grid-cols-3">
                {/* Resize */}
                <div className="rounded-2xl border border-border bg-card/50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Yeniden boyutlandır
                  </p>
                  <div className="mt-3 flex gap-2">
                    <input
                      type="number"
                      min={1}
                      placeholder="Maks G"
                      value={maxW}
                      onChange={(e) => setMaxW(e.target.value ? Number(e.target.value) : "")}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/40"
                    />
                    <input
                      type="number"
                      min={1}
                      placeholder="Maks Y"
                      value={maxH}
                      onChange={(e) => setMaxH(e.target.value ? Number(e.target.value) : "")}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/40"
                    />
                  </div>
                  <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={keepAspect}
                      onChange={(e) => setKeepAspect(e.target.checked)}
                      className="accent-foreground"
                    />
                    En-boy oranını koru
                  </label>
                </div>

                {/* Crop */}
                <div className="rounded-2xl border border-border bg-card/50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Kırp
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(["original", "1:1", "4:3", "16:9"] as CropAspect[]).map((a) => (
                      <button
                        key={a}
                        onClick={() => setCrop(a)}
                        className={`rounded-full px-3 py-1.5 text-xs transition ${
                          crop === a
                            ? "bg-foreground text-background"
                            : "border border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {a === "original" ? "Orijinal" : a}
                      </button>
                    ))}
                  </div>
                  {target === "pdf" && (
                    <label className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={mergePdf}
                        onChange={(e) => setMergePdf(e.target.checked)}
                        className="accent-foreground"
                      />
                      Tüm dosyaları tek PDF'te birleştir
                    </label>
                  )}
                </div>

                {/* Watermark */}
                <div className="rounded-2xl border border-border bg-card/50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Filigran
                  </p>
                  <input
                    type="text"
                    placeholder="Metin"
                    value={wmText}
                    onChange={(e) => setWmText(e.target.value)}
                    className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/40"
                  />
                  <div className="mt-3 grid grid-cols-3 gap-1">
                    {POSITIONS.map((p) => (
                      <button
                        key={p}
                        onClick={() => setWmPos(p)}
                        aria-label={p}
                        className={`h-6 rounded transition ${
                          wmPos === p ? "bg-foreground" : "bg-muted hover:bg-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <select
                      value={wmSize}
                      onChange={(e) => setWmSize(e.target.value as WMSize)}
                      className="rounded-lg border border-border bg-background px-2 py-1.5 outline-none"
                    >
                      <option value="s">Küçük</option>
                      <option value="m">Orta</option>
                      <option value="l">Büyük</option>
                    </select>
                    <select
                      value={wmColor}
                      onChange={(e) => setWmColor(e.target.value as WMColor)}
                      className="rounded-lg border border-border bg-background px-2 py-1.5 outline-none"
                    >
                      <option value="white">Beyaz</option>
                      <option value="black">Siyah</option>
                    </select>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Opaklık</span>
                      <span className="tabular-nums">%{Math.round(wmOpacity * 100)}</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      value={Math.round(wmOpacity * 100)}
                      onChange={(e) => setWmOpacity(Number(e.target.value) / 100)}
                      className="mt-1 w-full accent-foreground"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void processBatch(Array.from(e.dataTransfer.files));
        }}
        onClick={() => inputRef.current?.click()}
        className={`mt-8 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-16 text-center transition ${
          dragOver ? "border-foreground/60 bg-muted/40" : "border-border hover:border-foreground/30"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_ACCEPT_ATTR}
          multiple
          hidden
          onChange={(e) => e.target.files && void processBatch(Array.from(e.target.files))}
        />
        <p className="text-lg font-medium">Dosyaları sürükleyip bırak</p>
        <p className="mt-2 text-sm text-muted-foreground">PNG · JPG · WEBP · GIF · BMP · TIFF · PDF</p>
      </div>

      {busy && (
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{doneCount}/{items.length} tamamlandı</span>
            <span className="tabular-nums">%{overallProgress}</span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-to-r from-foreground to-foreground/60 transition-[width] duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      )}

      <AnimatePresence>
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground/80">
                {items.length} dosya
              </h4>
              {doneCount > 1 && (
                <button
                  onClick={downloadZip}
                  className="rounded-full bg-foreground px-5 py-2 text-xs font-medium text-background transition hover:opacity-90"
                >
                  Hepsini ZIP Olarak İndir
                </button>
              )}
            </div>
            <ul className="mt-4 divide-y divide-border">
              {items.map((r) => {
                const reduction =
                  r.status === "done" && r.originalSize
                    ? Math.max(0, Math.round((1 - r.newSize / r.originalSize) * 100))
                    : 0;
                return (
                  <li key={r.id} className="py-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-foreground">{r.outName}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {r.status === "done" && (
                            <>
                              {(r.originalSize / 1024).toFixed(0)}KB →{" "}
                              {(r.newSize / 1024).toFixed(0)}KB ·{" "}
                              <span className="text-foreground/80">
                                Saved {reduction}%
                              </span>
                            </>
                          )}
                          {r.status === "running" && "Dönüştürülüyor…"}
                          {r.status === "queued" && "Kuyrukta"}
                          {r.status === "error" && `Hata · ${r.error ?? ""}`}
                          {r.status === "blocked" && `Engellendi · ${r.error ?? ""}`}
                        </p>
                        {(r.status === "running" || r.status === "queued") && (
                          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-foreground transition-[width] duration-200"
                              style={{ width: `${r.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                      {r.status === "done" && r.url && (
                        <a
                          href={r.url}
                          download={r.outName}
                          className="shrink-0 rounded-full border border-border px-4 py-1.5 text-xs text-foreground/80 transition hover:bg-muted"
                        >
                          İndir
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
