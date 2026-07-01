/// <reference lib="webworker" />
// Image transform worker. Decodes with createImageBitmap and re-encodes via
// OffscreenCanvas. Accepts a Blob (already decoded to a raster on the main
// thread for exotic formats like PDF/TIFF).

export type WatermarkOpts = {
  text: string;
  position:
    | "tl" | "tc" | "tr"
    | "cl" | "cc" | "cr"
    | "bl" | "bc" | "br";
  opacity: number; // 0..1
  size: "s" | "m" | "l";
  color: "white" | "black";
};

export type CropAspect = "original" | "1:1" | "4:3" | "16:9";

export type TransformInput = {
  id: string;
  blob: Blob;
  target: "png" | "jpeg" | "webp";
  quality: number; // 0..1
  resize?: { maxW?: number; maxH?: number; keepAspect: boolean };
  crop?: CropAspect;
  watermark?: WatermarkOpts | null;
};

export type TransformProgress =
  | { id: string; type: "progress"; progress: number }
  | { id: string; type: "done"; blob: Blob; width: number; height: number }
  | { id: string; type: "error"; error: string };

function post(msg: TransformProgress, transfer: Transferable[] = []) {
  (self as unknown as Worker).postMessage(msg, transfer);
}

function computeCrop(w: number, h: number, aspect: CropAspect) {
  if (aspect === "original") return { sx: 0, sy: 0, sw: w, sh: h };
  const [aw, ah] = aspect.split(":").map(Number);
  const target = aw / ah;
  const cur = w / h;
  let sw = w;
  let sh = h;
  if (cur > target) sw = Math.round(h * target);
  else sh = Math.round(w / target);
  return { sx: Math.round((w - sw) / 2), sy: Math.round((h - sh) / 2), sw, sh };
}

function computeResize(
  w: number,
  h: number,
  r: TransformInput["resize"],
): { w: number; h: number } {
  if (!r) return { w, h };
  const maxW = r.maxW && r.maxW > 0 ? r.maxW : Infinity;
  const maxH = r.maxH && r.maxH > 0 ? r.maxH : Infinity;
  if (w <= maxW && h <= maxH) return { w, h };
  if (r.keepAspect) {
    const ratio = Math.min(maxW / w, maxH / h);
    return { w: Math.max(1, Math.round(w * ratio)), h: Math.max(1, Math.round(h * ratio)) };
  }
  return {
    w: Math.min(w, maxW === Infinity ? w : maxW),
    h: Math.min(h, maxH === Infinity ? h : maxH),
  };
}

function drawWatermark(ctx: OffscreenCanvasRenderingContext2D, cw: number, ch: number, wm: WatermarkOpts) {
  const sizePx = wm.size === "s" ? Math.round(cw * 0.025) : wm.size === "m" ? Math.round(cw * 0.045) : Math.round(cw * 0.07);
  ctx.font = `600 ${Math.max(12, sizePx)}px system-ui, -apple-system, "Inter", sans-serif`;
  ctx.globalAlpha = wm.opacity;
  ctx.fillStyle = wm.color === "white" ? "#ffffff" : "#000000";
  const pad = Math.round(cw * 0.03);
  const metrics = ctx.measureText(wm.text);
  const tw = metrics.width;
  const th = sizePx;
  const [vpart, hpart] = [wm.position[0], wm.position[1]];
  let x = pad;
  let y = pad + th;
  if (hpart === "c") x = (cw - tw) / 2;
  else if (hpart === "r") x = cw - tw - pad;
  if (vpart === "c") y = (ch + th) / 2;
  else if (vpart === "b") y = ch - pad;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(wm.text, x, y);
  ctx.globalAlpha = 1;
}

async function transform(input: TransformInput) {
  const { id, blob, target, quality, resize, crop, watermark } = input;
  try {
    post({ id, type: "progress", progress: 10 });
    const bitmap = await createImageBitmap(blob);
    post({ id, type: "progress", progress: 40 });

    const cropBox = computeCrop(bitmap.width, bitmap.height, crop ?? "original");
    const resized = computeResize(cropBox.sw, cropBox.sh, resize);

    const canvas = new OffscreenCanvas(resized.w, resized.h);
    const ctx = canvas.getContext("2d")!;
    if (target !== "png") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, resized.w, resized.h);
    }
    ctx.drawImage(
      bitmap,
      cropBox.sx, cropBox.sy, cropBox.sw, cropBox.sh,
      0, 0, resized.w, resized.h,
    );
    bitmap.close();
    post({ id, type: "progress", progress: 75 });

    if (watermark && watermark.text.trim()) {
      drawWatermark(ctx, resized.w, resized.h, watermark);
    }

    const out = await canvas.convertToBlob({
      type: `image/${target}`,
      quality: target === "png" ? undefined : quality,
    });
    post({ id, type: "progress", progress: 100 });
    post({ id, type: "done", blob: out, width: resized.w, height: resized.h });
  } catch (e) {
    post({ id, type: "error", error: (e as Error).message || "transform_failed" });
  }
}

self.addEventListener("message", (e: MessageEvent<TransformInput>) => {
  void transform(e.data);
});
