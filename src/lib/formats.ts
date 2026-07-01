// Format registry + decoders for exotic sources (PDF, TIFF) that need a lib
// before the worker can re-encode them.

export type TargetFormat = "png" | "jpeg" | "webp" | "pdf";
export type SourceKind = "png" | "jpeg" | "webp" | "gif" | "bmp" | "tiff" | "pdf" | "unknown";

export const ACCEPTED_MIME_LIST = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/x-ms-bmp",
  "image/tiff",
  "application/pdf",
];
export const ACCEPTED_ACCEPT_ATTR = ACCEPTED_MIME_LIST.join(",") + ",.tif,.tiff,.bmp,.pdf,.gif";

export function detectKind(file: File): SourceKind {
  const t = file.type.toLowerCase();
  const n = file.name.toLowerCase();
  if (t === "application/pdf" || n.endsWith(".pdf")) return "pdf";
  if (t === "image/tiff" || n.endsWith(".tif") || n.endsWith(".tiff")) return "tiff";
  if (t === "image/bmp" || t === "image/x-ms-bmp" || n.endsWith(".bmp")) return "bmp";
  if (t === "image/gif" || n.endsWith(".gif")) return "gif";
  if (t === "image/webp" || n.endsWith(".webp")) return "webp";
  if (t === "image/png" || n.endsWith(".png")) return "png";
  if (t === "image/jpeg" || t === "image/jpg" || n.endsWith(".jpg") || n.endsWith(".jpeg")) return "jpeg";
  return "unknown";
}

type UtifIfd = { width: number; height: number };
type UtifLib = {
  decode: (b: Uint8Array) => UtifIfd[];
  decodeImage: (b: Uint8Array, ifd: UtifIfd) => void;
  toRGBA8: (ifd: UtifIfd) => Uint8Array;
};

/** Decode a TIFF file to a PNG blob using UTIF (main thread). */
export async function tiffToPngBlob(file: File): Promise<Blob> {
  const mod = (await import("utif")) as unknown as {
    default?: UtifLib;
  } & UtifLib;
  const UTIF: UtifLib = mod.default ?? mod;
  const buf = new Uint8Array(await file.arrayBuffer());
  const ifds = UTIF.decode(buf);
  UTIF.decodeImage(buf, ifds[0]);
  const rgba = UTIF.toRGBA8(ifds[0]);
  const w = ifds[0].width;
  const h = ifds[0].height;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const imgData = ctx.createImageData(w, h);
  imgData.data.set(rgba);
  ctx.putImageData(imgData, 0, 0);
  return new Promise<Blob>((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("tiff_encode_failed"))), "image/png"),
  );
}

/** Decode a PDF to per-page PNG blobs at 2x device pixel ratio. */
export async function pdfToPngBlobs(file: File, baseName: string): Promise<{ name: string; blob: Blob }[]> {
  const pdfjs = await import("pdfjs-dist");
  // Use bundled worker
  const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  (pdfjs as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = workerSrc;

  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  const out: { name: string; blob: Blob }[] = [];
  const scale = 2;
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    const blob = await new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error("pdf_page_encode_failed"))), "image/png"),
    );
    out.push({ name: `${baseName}-p${i}.png`, blob });
  }
  return out;
}

/** Encode a list of raster blobs into a single PDF. */
export async function blobsToPdf(items: { name: string; blob: Blob }[]): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  for (let i = 0; i < items.length; i++) {
    if (i > 0) pdf.addPage();
    const dataUrl = await new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(items[i].blob);
    });
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = rej;
      im.src = dataUrl;
    });
    const ratio = Math.min(pageW / img.width, pageH / img.height);
    const w = img.width * ratio;
    const h = img.height * ratio;
    const x = (pageW - w) / 2;
    const y = (pageH - h) / 2;
    const fmt = items[i].blob.type === "image/jpeg" ? "JPEG" : "PNG";
    pdf.addImage(dataUrl, fmt, x, y, w, h);
  }
  return pdf.output("blob");
}
