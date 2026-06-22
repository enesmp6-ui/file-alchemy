import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import JSZip from "jszip";

type Format = "png" | "jpeg" | "webp";

type Result = {
  name: string;
  originalSize: number;
  newSize: number;
  url: string;
  blob: Blob;
};

async function convertFile(file: File, format: Format, quality: number): Promise<Blob> {
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = dataUrl;
  });
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  if (format !== "png") {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);
  const mime = `image/${format}`;
  return new Promise<Blob>((res, rej) => {
    canvas.toBlob(
      (b) => (b ? res(b) : rej(new Error("convert failed"))),
      mime,
      quality,
    );
  });
}

export function Converter({
  maxBytes,
  canConsume,
  consume,
  onBlocked,
}: {
  maxBytes: number;
  canConsume: (n: number) => boolean;
  consume: (n: number) => void;
  onBlocked: (msg: string) => void;
}) {
  const [format, setFormat] = useState<Format>("webp");
  const [quality, setQuality] = useState(80);
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files).filter((f) =>
        ["image/png", "image/jpeg", "image/jpg"].includes(f.type),
      );
      if (!arr.length) return;

      const oversize = arr.find((f) => f.size > maxBytes);
      if (oversize) {
        onBlocked(
          `${oversize.name} dosya boyutu limitini aşıyor (maks ${Math.round(maxBytes / (1024 * 1024))}MB).`,
        );
        return;
      }
      if (!canConsume(arr.length)) {
        onBlocked("Haftalık limitine ulaştın. Ücretsiz üye ol veya Pro'yu dene.");
        return;
      }

      setBusy(true);
      const out: Result[] = [];
      for (const f of arr) {
        try {
          const blob = await convertFile(f, format, quality / 100);
          out.push({
            name: f.name.replace(/\.[^.]+$/, "") + "." + (format === "jpeg" ? "jpg" : format),
            originalSize: f.size,
            newSize: blob.size,
            url: URL.createObjectURL(blob),
            blob,
          });
        } catch (e) {
          console.error(e);
        }
      }
      consume(out.length);
      setResults((prev) => [...out, ...prev]);
      setBusy(false);
    },
    [format, quality, maxBytes, canConsume, consume, onBlocked],
  );

  const downloadZip = async () => {
    const zip = new JSZip();
    results.forEach((r) => zip.file(r.name, r.blob));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.zip";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card p-6 sm:p-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dönüştürücü</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Tüm işlem tarayıcında. Hiçbir dosya sunucuya gitmez.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["png", "jpeg", "webp"] as Format[]).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wider transition ${
                format === f
                  ? "bg-white text-black"
                  : "border border-white/15 text-white/70 hover:bg-white/5"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Kalite</span>
          <span className="tabular-nums text-white/80">%{quality}</span>
        </div>
        <input
          type="range"
          min={1}
          max={100}
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          className="mt-2 w-full accent-white"
        />
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
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`mt-8 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-16 text-center transition ${
          dragOver ? "border-white/60 bg-white/5" : "border-white/15 hover:border-white/30"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          multiple
          hidden
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <p className="text-lg font-medium">Dosyaları sürükleyip bırak</p>
        <p className="mt-2 text-sm text-muted-foreground">veya seçmek için tıkla — PNG, JPG</p>
      </div>

      {busy && (
        <p className="mt-6 text-center text-sm text-muted-foreground">Dönüştürülüyor…</p>
      )}

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-white/80">
                {results.length} dosya hazır
              </h4>
              <button
                onClick={downloadZip}
                className="rounded-full bg-white px-5 py-2 text-xs font-medium text-black transition hover:bg-white/90"
              >
                Hepsini ZIP Olarak İndir
              </button>
            </div>
            <ul className="mt-4 divide-y divide-white/5">
              {results.map((r, i) => {
                const reduction = Math.max(
                  0,
                  Math.round((1 - r.newSize / r.originalSize) * 100),
                );
                return (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-4 py-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-white/90">{r.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {(r.originalSize / 1024).toFixed(0)}KB →{" "}
                        {(r.newSize / 1024).toFixed(0)}KB ·{" "}
                        <span className="text-white/80">Dosyanız %{reduction} küçüldü</span>
                      </p>
                    </div>
                    <a
                      href={r.url}
                      download={r.name}
                      className="shrink-0 rounded-full border border-white/15 px-4 py-1.5 text-xs text-white/80 transition hover:bg-white/5"
                    >
                      İndir
                    </a>
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
