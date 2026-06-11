import sharp from "sharp";

export interface SketchWatermarkText {
  studioName: string;
  bookingUrl: string;
}

/** Dark semi-transparent fill for white sketch backgrounds; custom color could be a studio setting later. */
const WATERMARK_FILL = "rgba(0, 0, 0, 0.3)";
/** Subtle light stroke so text remains visible on darker image areas. */
const WATERMARK_STROKE = "rgba(255, 255, 255, 0.2)";
const WATERMARK_STROKE_WIDTH = 0.75;

function escapeSvgText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildWatermarkSvg(
  width: number,
  height: number,
  text: SketchWatermarkText
): string {
  const fontSize = Math.round(Math.max(14, Math.min(width, height) / 28));
  const lineGap = Math.round(fontSize * 1.35);
  const tileWidth = Math.round(Math.max(width * 1.35, fontSize * 20));
  const tileHeight = Math.round(lineGap * 5.5);
  const line1 = escapeSvgText(text.studioName);
  const line2 = escapeSvgText(text.bookingUrl);

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="flash-sketch-watermark" patternUnits="userSpaceOnUse" width="${tileWidth}" height="${tileHeight}" patternTransform="rotate(-35)">
      <text x="0" y="${fontSize}" fill="${WATERMARK_FILL}" stroke="${WATERMARK_STROKE}" stroke-width="${WATERMARK_STROKE_WIDTH}" paint-order="stroke fill" font-size="${fontSize}" font-family="Arial, Helvetica, sans-serif" font-weight="600">${line1}</text>
      <text x="0" y="${fontSize + lineGap}" fill="${WATERMARK_FILL}" stroke="${WATERMARK_STROKE}" stroke-width="${WATERMARK_STROKE_WIDTH}" paint-order="stroke fill" font-size="${Math.round(fontSize * 0.82)}" font-family="Arial, Helvetica, sans-serif">${line2}</text>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#flash-sketch-watermark)"/>
</svg>`;
}

export async function applySketchWatermark(
  inputBuffer: Buffer,
  text: SketchWatermarkText
): Promise<Buffer> {
  const image = sharp(inputBuffer, { failOn: "none" });
  const metadata = await image.metadata();
  const width = metadata.width ?? 1200;
  const height = metadata.height ?? 1200;
  const svg = Buffer.from(buildWatermarkSvg(width, height, text));
  const composited = image.composite([{ input: svg, blend: "over" }]);

  switch (metadata.format) {
    case "png":
      return composited.png().toBuffer();
    case "webp":
      return composited.webp({ quality: 90 }).toBuffer();
    case "gif":
      return composited.png().toBuffer();
    default:
      return composited.jpeg({ quality: 90 }).toBuffer();
  }
}
