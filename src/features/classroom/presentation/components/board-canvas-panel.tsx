import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
} from "react";
import {
  ArrowUpRight,
  BookOpen,
  Camera,
  Check,
  Circle,
  Download,
  Eraser,
  Feather,
  FileText,
  Hand,
  Highlighter,
  Lock,
  Maximize2,
  Minimize2,
  Minus,
  MoreHorizontal,
  MousePointer2,
  Palette,
  Pen,
  Pencil,
  Plus,
  Redo2,
  RotateCcw,
  Sparkles,
  Square,
  Trash2,
  Type,
  Undo2,
} from "lucide-react";
import type {
  BoardCanvasPoint,
  BoardCanvasStroke,
  BoardPenStyle,
  BoardStrokeKind,
  BoardSurfaceStyle,
  NotebookWidthMode,
} from "@/shared/domain";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { cn } from "@/shared/lib/utils";

// Canonical reference coordinate space so expanding space or switching layouts stays proportional.
const COORD_REF_W = 1440;
const COORD_REF_H = 900;
const INITIAL_WORLD_W = 2400;
const INITIAL_WORLD_H = 3200;
const MAX_WORLD_W = 12000;
const MAX_WORLD_H = 24000;

// Fixed-width multi-page notebook geometry mapped in canonical reference coordinates.
const NOTEBOOK_MAX_CSS_W = 820;
const NOTEBOOK_TOP_PAD_CSS = 76;
const NOTEBOOK_BOTTOM_PAD_CSS = 110;
const NOTEBOOK_PAGE_H_REF = 1860;
const NOTEBOOK_PAGE_GAP_REF = 56;
const INITIAL_NOTEBOOK_PAGES = 2;

const LIGHT_INKS = [
  "#0f172a",
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#9333ea",
  "#d97706",
  "#0d9488",
  "#db2777",
  "#475569",
];

const DARK_INKS = [
  "#f8fafc",
  "#fde047",
  "#38bdf8",
  "#4ade80",
  "#f472b6",
  "#fb923c",
  "#2dd4bf",
  "#c084fc",
  "#94a3b8",
];

const BOARD_BG_PRESETS = [
  { label: "Whiteboard", color: "#ffffff" },
  { label: "Blackboard", color: "#0b0c0e" },
  { label: "Charcoal", color: "#16181d" },
  { label: "Warm Paper", color: "#fdf8ec" },
  { label: "Cool Slate", color: "#f1f5f9" },
  { label: "Midnight", color: "#0f172a" },
];

type DockToolId =
  | "select"
  | "pan"
  | "pen"
  | "pencil"
  | "fountain"
  | "highlighter"
  | "laser"
  | "eraser"
  | "line"
  | "arrow"
  | "rect"
  | "ellipse"
  | "text";

type ToolSettingsPopupId =
  | "pen"
  | "pencil"
  | "fountain"
  | "highlighter"
  | "eraser"
  | "shape";

type EraserMode = "partial" | "stroke";

interface StrokeToolConfig {
  colorIndex: number;
  customColor: string | null;
  width: number; // 1..10
}

type StrokeToolKey = "pen" | "pencil" | "fountain" | "highlighter" | "shape";

const DEFAULT_TOOL_CONFIGS: Record<StrokeToolKey, StrokeToolConfig> = {
  pen: { colorIndex: 0, customColor: null, width: 3 },
  pencil: { colorIndex: 8, customColor: null, width: 2 },
  fountain: { colorIndex: 1, customColor: null, width: 4 },
  highlighter: { colorIndex: 2, customColor: null, width: 7 },
  shape: { colorIndex: 0, customColor: null, width: 3 },
};

const WIDTH_STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

const SURFACE_OPTIONS: Array<{
  value: "blank" | "notebook";
  label: string;
  subtitle: string;
  icon: typeof FileText;
}> = [
  {
    value: "blank",
    label: "Blank",
    subtitle: "Open 2D freeform board",
    icon: FileText,
  },
  {
    value: "notebook",
    label: "Notebook",
    subtitle: "Fixed-width ruled pages",
    icon: BookOpen,
  },
];

interface LaserSample {
  x: number;
  y: number;
  createdAt: number;
}

interface TextDraftState {
  normPoint: BoardCanvasPoint;
  value: string;
}

function normalizeHex(color: string): string {
  const cleaned = color.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(cleaned)) return cleaned.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(cleaned)) {
    return (
      "#" +
      cleaned[1] +
      cleaned[1] +
      cleaned[2] +
      cleaned[2] +
      cleaned[3] +
      cleaned[3]
    ).toLowerCase();
  }
  return "#ffffff";
}

function isDarkHex(hex: string): boolean {
  const norm = normalizeHex(hex);
  const r = parseInt(norm.slice(1, 3), 16);
  const g = parseInt(norm.slice(3, 5), 16);
  const b = parseInt(norm.slice(5, 7), 16);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance < 135;
}

function getInkPaletteForBg(bgColor: string): string[] {
  return isDarkHex(bgColor) ? DARK_INKS : LIGHT_INKS;
}

function widthLevelToCanvasPx(level: number): number {
  const clamped = Math.max(1, Math.min(10, level));
  return 1.5 + (clamped - 1) * 1.45;
}

function eraserLevelToRadiusRef(level: number): number {
  const clamped = Math.max(1, Math.min(10, level));
  return 10 + clamped * 5.5;
}

function resolveStrokeColor(
  stroke: BoardCanvasStroke,
  palette: string[],
): string {
  if (stroke.color) return stroke.color;
  return palette[stroke.colorIndex % palette.length] ?? palette[0];
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = normalizeHex(hex).slice(1);
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function computeNotebookMetrics(
  viewportW: number,
  pageCount: number,
  widthMode: NotebookWidthMode = "centered",
  zoom: number = 1,
): {
  pageDisplayW: number;
  scale: number;
  offsetX: number;
  topOffset: number;
  totalHeightCss: number;
} {
  const basePageW =
    widthMode === "full"
      ? Math.max(320, viewportW - 16)
      : Math.min(NOTEBOOK_MAX_CSS_W, Math.max(280, viewportW - 32));
  const pageDisplayW = basePageW * zoom;
  const scale = pageDisplayW / COORD_REF_W;
  const minEdge = widthMode === "full" ? 8 : 16;
  const offsetX = Math.max(minEdge, (viewportW - pageDisplayW) / 2);
  const pagesTotalRefH =
    pageCount * NOTEBOOK_PAGE_H_REF +
    Math.max(0, pageCount - 1) * NOTEBOOK_PAGE_GAP_REF;
  const totalHeightCss =
    NOTEBOOK_TOP_PAD_CSS + pagesTotalRefH * scale + NOTEBOOK_BOTTOM_PAD_CSS;
  return {
    pageDisplayW,
    scale,
    offsetX,
    topOffset: NOTEBOOK_TOP_PAD_CSS,
    totalHeightCss,
  };
}

function drawBlankSurface(
  ctx: CanvasRenderingContext2D,
  minX: number,
  minY: number,
  viewW: number,
  viewH: number,
  bgColor: string,
) {
  ctx.fillStyle = bgColor;
  ctx.fillRect(minX, minY, viewW, viewH);
}

function drawNotebookSurface(
  ctx: CanvasRenderingContext2D,
  scrollLeft: number,
  scrollTop: number,
  viewW: number,
  viewH: number,
  viewportW: number,
  pageCount: number,
  widthMode: NotebookWidthMode,
  zoom: number,
  bgColor: string,
) {
  const dark = isDarkHex(bgColor);
  const deskBg = dark ? "#040506" : "#e2e7ee";

  // Fill desk backdrop in CSS/screen pixels
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const canvas = ctx.canvas;
  ctx.fillStyle = deskBg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  const metrics = computeNotebookMetrics(viewportW, pageCount, widthMode, zoom);
  const strideRef = NOTEBOOK_PAGE_H_REF + NOTEBOOK_PAGE_GAP_REF;
  const pageBorder = dark ? "rgba(255, 255, 255, 0.14)" : "rgba(15, 23, 42, 0.12)";
  const ruleLineColor = dark
    ? "rgba(255, 255, 255, 0.12)"
    : "rgba(37, 99, 235, 0.16)";
  const headerLineColor = dark
    ? "rgba(255, 255, 255, 0.22)"
    : "rgba(37, 99, 235, 0.28)";
  const marginLineColor = dark
    ? "rgba(244, 63, 94, 0.36)"
    : "rgba(239, 68, 68, 0.3)";
  const labelColor = dark ? "rgba(255, 255, 255, 0.45)" : "rgba(15, 23, 42, 0.42)";

  const visMinYRef = (scrollTop - metrics.topOffset) / metrics.scale;
  const visMaxYRef = (scrollTop + viewH - metrics.topOffset) / metrics.scale;
  const startPage = Math.max(0, Math.floor(visMinYRef / strideRef));
  const endPage = Math.min(pageCount - 1, Math.ceil(visMaxYRef / strideRef));

  // Ignore unused scrollLeft warning while maintaining signature clarity
  void scrollLeft;
  void viewW;

  for (let p = startPage; p <= endPage; p++) {
    const pageTop = p * strideRef;
    const pageBottom = pageTop + NOTEBOOK_PAGE_H_REF;

    ctx.save();
    // Subtle paper drop shadow
    ctx.shadowColor = dark ? "rgba(0, 0, 0, 0.55)" : "rgba(15, 23, 42, 0.1)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(0, pageTop, COORD_REF_W, NOTEBOOK_PAGE_H_REF, 18);
    ctx.fill();
    ctx.restore();

    // Crisp page outline & ruled lines clipped cleanly to the page sheet
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(0, pageTop, COORD_REF_W, NOTEBOOK_PAGE_H_REF, 18);
    ctx.clip();

    // Top margin header band separator
    const topBandY = pageTop + 126;
    ctx.strokeStyle = headerLineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, topBandY);
    ctx.lineTo(COORD_REF_W, topBandY);
    ctx.stroke();

    // Horizontal ruled writing lines across body of page
    ctx.strokeStyle = ruleLineColor;
    ctx.lineWidth = 1.4;
    const lineGap = 54;
    for (let y = topBandY + lineGap; y < pageBottom - 36; y += lineGap) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(COORD_REF_W, y);
      ctx.stroke();
    }

    // Left vertical notebook margin rule
    ctx.strokeStyle = marginLineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(148, pageTop);
    ctx.lineTo(148, pageBottom);
    ctx.stroke();

    // Subtle page indicator inside top-right corner of sheet
    ctx.fillStyle = labelColor;
    ctx.font = "500 24px Inter, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(`Page ${p + 1}`, COORD_REF_W - 44, pageTop + 68);

    ctx.restore();

    // Border ring around sheet
    ctx.save();
    ctx.strokeStyle = pageBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(0, pageTop, COORD_REF_W, NOTEBOOK_PAGE_H_REF, 18);
    ctx.stroke();
    ctx.restore();
  }
}

function getStrokeBounds(stroke: BoardCanvasStroke): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const pt of stroke.points) {
    const px = pt.x * COORD_REF_W;
    const py = pt.y * COORD_REF_H;
    if (px < minX) minX = px;
    if (py < minY) minY = py;
    if (px > maxX) maxX = px;
    if (py > maxY) maxY = py;
  }
  if (!Number.isFinite(minX)) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  const pad = Math.max(8, stroke.strokeWidth * 1.4);
  return {
    minX: minX - pad,
    minY: minY - pad,
    maxX: maxX + pad,
    maxY: maxY + pad,
  };
}

// Always-on real-time stylus stabilization to filter digitizer micro-jitter
function stabilizeLivePoint(
  prev: BoardCanvasPoint,
  raw: BoardCanvasPoint,
): BoardCanvasPoint | null {
  const dxPx = (raw.x - prev.x) * COORD_REF_W;
  const dyPx = (raw.y - prev.y) * COORD_REF_H;
  const distPx = Math.hypot(dxPx, dyPx);
  if (distPx < 1.8) return null;

  const alpha = 0.46;
  return {
    x: prev.x + (raw.x - prev.x) * alpha,
    y: prev.y + (raw.y - prev.y) * alpha,
  };
}

// Always-on corner-preserving stroke smoothing after stylus lift
function beautifyStrokePoints(points: BoardCanvasPoint[]): BoardCanvasPoint[] {
  if (points.length < 4) return points;

  const cleaned: BoardCanvasPoint[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = cleaned[cleaned.length - 1];
    const curr = points[i];
    const distPx = Math.hypot(
      (curr.x - prev.x) * COORD_REF_W,
      (curr.y - prev.y) * COORD_REF_H,
    );
    if (distPx >= 2.2) {
      cleaned.push(curr);
    }
  }
  cleaned.push(points[points.length - 1]);

  if (cleaned.length < 4) return cleaned;

  const isCorner = new Array<boolean>(cleaned.length).fill(false);
  isCorner[0] = true;
  isCorner[cleaned.length - 1] = true;
  for (let i = 1; i < cleaned.length - 1; i++) {
    const ax = (cleaned[i].x - cleaned[i - 1].x) * COORD_REF_W;
    const ay = (cleaned[i].y - cleaned[i - 1].y) * COORD_REF_H;
    const bx = (cleaned[i + 1].x - cleaned[i].x) * COORD_REF_W;
    const by = (cleaned[i + 1].y - cleaned[i].y) * COORD_REF_H;
    const magA = Math.hypot(ax, ay);
    const magB = Math.hypot(bx, by);
    if (magA > 1e-3 && magB > 1e-3) {
      const cosTheta = (ax * bx + ay * by) / (magA * magB);
      if (cosTheta < 0.48) {
        isCorner[i] = true;
      }
    }
  }

  let current = cleaned;
  for (let pass = 0; pass < 3; pass++) {
    current = current.map((pt, idx) => {
      if (isCorner[idx]) return pt;
      const prev = current[idx - 1];
      const succ = current[idx + 1];
      return {
        x: prev.x * 0.22 + pt.x * 0.56 + succ.x * 0.22,
        y: prev.y * 0.22 + pt.y * 0.56 + succ.y * 0.22,
      };
    });
  }

  return current;
}

function drawFreehandStroke(
  ctx: CanvasRenderingContext2D,
  stroke: BoardCanvasStroke,
) {
  const style: BoardPenStyle = stroke.penStyle ?? "ballpoint";

  if (stroke.points.length === 1) {
    const p = stroke.points[0];
    if (style === "pencil") {
      ctx.globalAlpha = Math.min(ctx.globalAlpha, 0.72);
    }
    ctx.beginPath();
    ctx.arc(
      p.x * COORD_REF_W,
      p.y * COORD_REF_H,
      ctx.lineWidth / 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    return;
  }

  if (style === "fountain") {
    const baseW = stroke.strokeWidth;
    let prevMidX = stroke.points[0].x * COORD_REF_W;
    let prevMidY = stroke.points[0].y * COORD_REF_H;
    for (let i = 1; i < stroke.points.length; i++) {
      const a = stroke.points[i - 1];
      const b = stroke.points[i];
      const next = stroke.points[i + 1];
      const x0 = a.x * COORD_REF_W;
      const y0 = a.y * COORD_REF_H;
      const x1 = b.x * COORD_REF_W;
      const y1 = b.y * COORD_REF_H;
      const midX = next ? (x1 + next.x * COORD_REF_W) / 2 : x1;
      const midY = next ? (y1 + next.y * COORD_REF_H) / 2 : y1;
      const dist = Math.hypot(x1 - x0, y1 - y0);
      const factor = Math.max(0.52, Math.min(1.45, 1.32 - dist / 48));
      ctx.beginPath();
      ctx.moveTo(prevMidX, prevMidY);
      if (next) {
        ctx.quadraticCurveTo(x1, y1, midX, midY);
      } else {
        ctx.lineTo(x1, y1);
      }
      ctx.lineWidth = Math.max(1, baseW * factor);
      ctx.stroke();
      prevMidX = midX;
      prevMidY = midY;
    }
    return;
  }

  if (style === "pencil" && !stroke.isHighlighter) {
    // Matte graphite softness + crisp inner core
    ctx.globalAlpha = 0.68;
    ctx.lineWidth = Math.max(1, stroke.strokeWidth * 0.92);
  } else if (style === "dashed") {
    ctx.setLineDash([
      Math.max(6, stroke.strokeWidth * 2.2),
      Math.max(5, stroke.strokeWidth * 1.7),
    ]);
  } else if (style === "marker") {
    ctx.lineCap = "square";
    ctx.lineWidth = Math.max(stroke.strokeWidth * 1.5, 7);
    if (!stroke.isHighlighter) {
      ctx.globalAlpha = 0.88;
    }
  }

  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x * COORD_REF_W, stroke.points[0].y * COORD_REF_H);
  for (let i = 1; i < stroke.points.length - 1; i++) {
    const curr = stroke.points[i];
    const next = stroke.points[i + 1];
    const midX = ((curr.x + next.x) / 2) * COORD_REF_W;
    const midY = ((curr.y + next.y) / 2) * COORD_REF_H;
    ctx.quadraticCurveTo(
      curr.x * COORD_REF_W,
      curr.y * COORD_REF_H,
      midX,
      midY,
    );
  }
  const last = stroke.points[stroke.points.length - 1];
  ctx.lineTo(last.x * COORD_REF_W, last.y * COORD_REF_H);
  ctx.stroke();
}

function drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: BoardCanvasStroke,
  palette: string[],
  isSelected = false,
) {
  if (stroke.points.length === 0) return;

  const baseColor = resolveStrokeColor(stroke, palette);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = baseColor;
  ctx.fillStyle = baseColor;
  ctx.lineWidth = stroke.isHighlighter
    ? Math.max(stroke.strokeWidth * 2.6, 16)
    : stroke.strokeWidth;
  if (stroke.isHighlighter) {
    ctx.globalAlpha = 0.3;
  }

  const kind: BoardStrokeKind = stroke.kind ?? "freehand";

  if (kind === "text" && stroke.text) {
    const anchor = stroke.points[0];
    const fontSize = Math.max(15, stroke.strokeWidth * 3.2);
    ctx.font = `500 ${fontSize}px Inter, system-ui, sans-serif`;
    ctx.textBaseline = "top";
    const lines = stroke.text.split("\n");
    lines.forEach((line, i) => {
      ctx.fillText(
        line,
        anchor.x * COORD_REF_W,
        anchor.y * COORD_REF_H + i * (fontSize * 1.25),
      );
    });
  } else if (kind === "line" && stroke.points.length >= 2) {
    const p0 = stroke.points[0];
    const p1 = stroke.points[stroke.points.length - 1];
    ctx.beginPath();
    ctx.moveTo(p0.x * COORD_REF_W, p0.y * COORD_REF_H);
    ctx.lineTo(p1.x * COORD_REF_W, p1.y * COORD_REF_H);
    ctx.stroke();
  } else if (kind === "arrow" && stroke.points.length >= 2) {
    const p0 = stroke.points[0];
    const p1 = stroke.points[stroke.points.length - 1];
    const x0 = p0.x * COORD_REF_W;
    const y0 = p0.y * COORD_REF_H;
    const x1 = p1.x * COORD_REF_W;
    const y1 = p1.y * COORD_REF_H;
    const angle = Math.atan2(y1 - y0, x1 - x0);
    const headLen = Math.max(10, stroke.strokeWidth * 3.2);

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(
      x1 - headLen * Math.cos(angle - Math.PI / 6),
      y1 - headLen * Math.sin(angle - Math.PI / 6),
    );
    ctx.moveTo(x1, y1);
    ctx.lineTo(
      x1 - headLen * Math.cos(angle + Math.PI / 6),
      y1 - headLen * Math.sin(angle + Math.PI / 6),
    );
    ctx.stroke();
  } else if (kind === "rect" && stroke.points.length >= 2) {
    const p0 = stroke.points[0];
    const p1 = stroke.points[stroke.points.length - 1];
    const x = Math.min(p0.x, p1.x) * COORD_REF_W;
    const y = Math.min(p0.y, p1.y) * COORD_REF_H;
    const w = Math.abs(p1.x - p0.x) * COORD_REF_W;
    const h = Math.abs(p1.y - p0.y) * COORD_REF_H;
    if (stroke.fill) {
      ctx.fillStyle = hexToRgba(baseColor, 0.14);
      ctx.fillRect(x, y, w, h);
    }
    ctx.strokeRect(x, y, w, h);
  } else if (kind === "ellipse" && stroke.points.length >= 2) {
    const p0 = stroke.points[0];
    const p1 = stroke.points[stroke.points.length - 1];
    const cx = ((p0.x + p1.x) / 2) * COORD_REF_W;
    const cy = ((p0.y + p1.y) / 2) * COORD_REF_H;
    const rx = Math.max(1, (Math.abs(p1.x - p0.x) * COORD_REF_W) / 2);
    const ry = Math.max(1, (Math.abs(p1.y - p0.y) * COORD_REF_H) / 2);
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    if (stroke.fill) {
      ctx.fillStyle = hexToRgba(baseColor, 0.14);
      ctx.fill();
    }
    ctx.stroke();
  } else {
    drawFreehandStroke(ctx, stroke);
  }

  if (isSelected) {
    const bounds = getStrokeBounds(stroke);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(
      bounds.minX - 4,
      bounds.minY - 4,
      bounds.maxX - bounds.minX + 8,
      bounds.maxY - bounds.minY + 8,
    );
  }

  ctx.restore();
}

function distPointToSegmentSq(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) {
    const ddx = px - x1;
    const ddy = py - y1;
    return ddx * ddx + ddy * ddy;
  }
  const t = Math.max(
    0,
    Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)),
  );
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  const ddx = px - projX;
  const ddy = py - projY;
  return ddx * ddx + ddy * ddy;
}

function findHitStroke(
  point: BoardCanvasPoint,
  strokes: BoardCanvasStroke[],
  thresholdRef = 16,
): BoardCanvasStroke | null {
  const px = point.x * COORD_REF_W;
  const py = point.y * COORD_REF_H;
  const thresholdSq = thresholdRef * thresholdRef;

  for (let idx = strokes.length - 1; idx >= 0; idx--) {
    const stroke = strokes[idx];
    const kind: BoardStrokeKind = stroke.kind ?? "freehand";

    if (kind === "text") {
      const b = getStrokeBounds(stroke);
      if (
        px >= b.minX - thresholdRef &&
        px <= b.maxX + thresholdRef &&
        py >= b.minY - thresholdRef &&
        py <= b.maxY + thresholdRef
      ) {
        return stroke;
      }
      continue;
    }

    if ((kind === "rect" || kind === "ellipse") && stroke.points.length >= 2) {
      const p0 = stroke.points[0];
      const p1 = stroke.points[stroke.points.length - 1];
      const minX = Math.min(p0.x, p1.x) * COORD_REF_W;
      const maxX = Math.max(p0.x, p1.x) * COORD_REF_W;
      const minY = Math.min(p0.y, p1.y) * COORD_REF_H;
      const maxY = Math.max(p0.y, p1.y) * COORD_REF_H;
      if (
        px >= minX - thresholdRef &&
        px <= maxX + thresholdRef &&
        py >= minY - thresholdRef &&
        py <= maxY + thresholdRef
      ) {
        if (stroke.fill) return stroke;
        const nearBorder =
          Math.abs(px - minX) <= thresholdRef ||
          Math.abs(px - maxX) <= thresholdRef ||
          Math.abs(py - minY) <= thresholdRef ||
          Math.abs(py - maxY) <= thresholdRef;
        if (nearBorder) return stroke;
      }
      continue;
    }

    if ((kind === "line" || kind === "arrow") && stroke.points.length >= 2) {
      const p0 = stroke.points[0];
      const p1 = stroke.points[stroke.points.length - 1];
      if (
        distPointToSegmentSq(
          px,
          py,
          p0.x * COORD_REF_W,
          p0.y * COORD_REF_H,
          p1.x * COORD_REF_W,
          p1.y * COORD_REF_H,
        ) <= thresholdSq
      ) {
        return stroke;
      }
      continue;
    }

    if (stroke.points.length === 1) {
      const p0 = stroke.points[0];
      const dx = px - p0.x * COORD_REF_W;
      const dy = py - p0.y * COORD_REF_H;
      if (dx * dx + dy * dy <= thresholdSq) return stroke;
      continue;
    }

    for (let i = 0; i < stroke.points.length - 1; i++) {
      const a = stroke.points[i];
      const b = stroke.points[i + 1];
      if (
        distPointToSegmentSq(
          px,
          py,
          a.x * COORD_REF_W,
          a.y * COORD_REF_H,
          b.x * COORD_REF_W,
          b.y * COORD_REF_H,
        ) <= thresholdSq
      ) {
        return stroke;
      }
    }
  }
  return null;
}

// Geometric partial eraser: removes only the touched segments inside eraser radius and preserves remaining stroke parts.
function subdividePolyline(
  pts: Array<{ x: number; y: number }>,
  stepPx = 5,
): Array<{ x: number; y: number }> {
  if (pts.length <= 1) return pts;
  const out: Array<{ x: number; y: number }> = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    const steps = Math.max(1, Math.ceil(dist / stepPx));
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  }
  return out;
}

function strokeToEraseablePxPoints(
  stroke: BoardCanvasStroke,
): Array<{ x: number; y: number }> | null {
  const kind: BoardStrokeKind = stroke.kind ?? "freehand";
  if (kind === "text") return null;
  if (stroke.points.length === 0) return null;

  if (kind === "line") {
    const p0 = stroke.points[0];
    const p1 = stroke.points[stroke.points.length - 1];
    return subdividePolyline([
      { x: p0.x * COORD_REF_W, y: p0.y * COORD_REF_H },
      { x: p1.x * COORD_REF_W, y: p1.y * COORD_REF_H },
    ]);
  }

  if (kind === "rect" && stroke.points.length >= 2 && !stroke.fill) {
    const p0 = stroke.points[0];
    const p1 = stroke.points[stroke.points.length - 1];
    const x0 = Math.min(p0.x, p1.x) * COORD_REF_W;
    const x1 = Math.max(p0.x, p1.x) * COORD_REF_W;
    const y0 = Math.min(p0.y, p1.y) * COORD_REF_H;
    const y1 = Math.max(p0.y, p1.y) * COORD_REF_H;
    return subdividePolyline([
      { x: x0, y: y0 },
      { x: x1, y: y0 },
      { x: x1, y: y1 },
      { x: x0, y: y1 },
      { x: x0, y: y0 },
    ]);
  }

  if (kind === "ellipse" && stroke.points.length >= 2 && !stroke.fill) {
    const p0 = stroke.points[0];
    const p1 = stroke.points[stroke.points.length - 1];
    const cx = ((p0.x + p1.x) / 2) * COORD_REF_W;
    const cy = ((p0.y + p1.y) / 2) * COORD_REF_H;
    const rx = Math.max(1, (Math.abs(p1.x - p0.x) * COORD_REF_W) / 2);
    const ry = Math.max(1, (Math.abs(p1.y - p0.y) * COORD_REF_H) / 2);
    const segs = 48;
    const ring: Array<{ x: number; y: number }> = [];
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      ring.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry });
    }
    return subdividePolyline(ring);
  }

  if (kind === "arrow" || stroke.fill) {
    return null;
  }

  return subdividePolyline(
    stroke.points.map((pt) => ({
      x: pt.x * COORD_REF_W,
      y: pt.y * COORD_REF_H,
    })),
    5,
  );
}

function erasePartialAlongSegment(
  strokes: BoardCanvasStroke[],
  segStartNorm: BoardCanvasPoint,
  segEndNorm: BoardCanvasPoint,
  radiusRefPx: number,
): { changed: boolean; nextStrokes: BoardCanvasStroke[] } {
  const ax = segStartNorm.x * COORD_REF_W;
  const ay = segStartNorm.y * COORD_REF_H;
  const bx = segEndNorm.x * COORD_REF_W;
  const by = segEndNorm.y * COORD_REF_H;
  const rSq = radiusRefPx * radiusRefPx;
  const minEraseX = Math.min(ax, bx) - radiusRefPx;
  const maxEraseX = Math.max(ax, bx) + radiusRefPx;
  const minEraseY = Math.min(ay, by) - radiusRefPx;
  const maxEraseY = Math.max(ay, by) + radiusRefPx;

  let changed = false;
  const nextStrokes: BoardCanvasStroke[] = [];

  for (const stroke of strokes) {
    const b = getStrokeBounds(stroke);
    if (
      b.maxX < minEraseX ||
      b.minX > maxEraseX ||
      b.maxY < minEraseY ||
      b.minY > maxEraseY
    ) {
      nextStrokes.push(stroke);
      continue;
    }

    const pxPoints = strokeToEraseablePxPoints(stroke);
    if (!pxPoints) {
      // Whole-object fallback for text/arrow/filled shapes when touched
      const hit = findHitStroke(segEndNorm, [stroke], radiusRefPx);
      if (hit) {
        changed = true;
      } else {
        nextStrokes.push(stroke);
      }
      continue;
    }

    if (pxPoints.length === 1) {
      const pt = pxPoints[0];
      if (distPointToSegmentSq(pt.x, pt.y, ax, ay, bx, by) <= rSq) {
        changed = true;
      } else {
        nextStrokes.push(stroke);
      }
      continue;
    }

    const keptRuns: Array<Array<{ x: number; y: number }>> = [];
    let currentRun: Array<{ x: number; y: number }> = [];
    let strokeTouched = false;

    for (const pt of pxPoints) {
      const inside = distPointToSegmentSq(pt.x, pt.y, ax, ay, bx, by) <= rSq;
      if (inside) {
        strokeTouched = true;
        if (currentRun.length >= 2) {
          keptRuns.push(currentRun);
        }
        currentRun = [];
      } else {
        currentRun.push(pt);
      }
    }
    if (currentRun.length >= 2) {
      keptRuns.push(currentRun);
    }

    if (!strokeTouched) {
      nextStrokes.push(stroke);
      continue;
    }

    changed = true;
    keptRuns.forEach((run, idx) => {
      nextStrokes.push({
        ...stroke,
        id:
          idx === 0
            ? stroke.id
            : `${stroke.id}-p${Date.now().toString(36)}-${idx}`,
        kind: "freehand",
        points: run.map((pt) => ({
          x: pt.x / COORD_REF_W,
          y: pt.y / COORD_REF_H,
        })),
      });
    });
  }

  return { changed, nextStrokes };
}

const TOOL_BUTTONS: Array<{
  id: DockToolId;
  label: string;
  shortcut: string;
  icon: typeof Pen;
  group: "nav" | "draw" | "shape";
  settingsGroup?: ToolSettingsPopupId;
}> = [
  { id: "select", label: "Select & Move", shortcut: "V", icon: MousePointer2, group: "nav" },
  { id: "pan", label: "Hand / Scroll", shortcut: "H", icon: Hand, group: "nav" },
  { id: "pen", label: "Pen", shortcut: "P", icon: Pen, group: "draw", settingsGroup: "pen" },
  { id: "pencil", label: "Pencil", shortcut: "C", icon: Pencil, group: "draw", settingsGroup: "pencil" },
  { id: "fountain", label: "Fountain Pen", shortcut: "F", icon: Feather, group: "draw", settingsGroup: "fountain" },
  { id: "highlighter", label: "Highlighter", shortcut: "M", icon: Highlighter, group: "draw", settingsGroup: "highlighter" },
  { id: "laser", label: "Laser Pointer", shortcut: "L", icon: Sparkles, group: "draw" },
  { id: "eraser", label: "Eraser", shortcut: "E", icon: Eraser, group: "draw", settingsGroup: "eraser" },
  { id: "line", label: "Line", shortcut: "/", icon: Minus, group: "shape", settingsGroup: "shape" },
  { id: "arrow", label: "Arrow", shortcut: "A", icon: ArrowUpRight, group: "shape", settingsGroup: "shape" },
  { id: "rect", label: "Rectangle", shortcut: "R", icon: Square, group: "shape", settingsGroup: "shape" },
  { id: "ellipse", label: "Ellipse", shortcut: "O", icon: Circle, group: "shape", settingsGroup: "shape" },
  { id: "text", label: "Text", shortcut: "T", icon: Type, group: "shape", settingsGroup: "shape" },
];

const POPUP_TITLES: Record<ToolSettingsPopupId, string> = {
  pen: "Pen",
  pencil: "Pencil",
  fountain: "Fountain Pen",
  highlighter: "Highlighter",
  eraser: "Eraser",
  shape: "Shapes & Text",
};

function getStrokeToolKey(tool: DockToolId): StrokeToolKey | null {
  if (
    tool === "pen" ||
    tool === "pencil" ||
    tool === "fountain" ||
    tool === "highlighter"
  ) {
    return tool;
  }
  if (
    tool === "line" ||
    tool === "arrow" ||
    tool === "rect" ||
    tool === "ellipse" ||
    tool === "text"
  ) {
    return "shape";
  }
  return null;
}

export function BoardCanvasPanel({
  strokes,
  surfaceStyle,
  boardBgColor,
  notebookWidthMode: controlledNotebookWidthMode,
  notebookPages: controlledNotebookPages,
  isReadOnly,
  readOnlyReason,
  canUndo,
  canRedo,
  isSavingSnapshot,
  canSaveSnapshot,
  onAddStroke,
  onMoveStroke,
  onRemoveStroke,
  onReplaceStrokes,
  onUndoStroke,
  onRedoStroke,
  onClearCanvas,
  onSurfaceStyleChange,
  onBoardBgColorChange,
  onNotebookWidthModeChange,
  onNotebookPagesChange,
  onSaveSnapshot,
  children,
}: {
  strokes: BoardCanvasStroke[];
  surfaceStyle: BoardSurfaceStyle;
  boardBgColor: string;
  notebookWidthMode?: NotebookWidthMode;
  notebookPages?: number;
  isReadOnly: boolean;
  readOnlyReason?: string;
  canUndo?: boolean;
  canRedo?: boolean;
  isSavingSnapshot?: boolean;
  canSaveSnapshot?: boolean;
  onAddStroke: (stroke: BoardCanvasStroke) => void;
  onMoveStroke: (strokeId: string, dxNorm: number, dyNorm: number) => void;
  onRemoveStroke: (strokeId: string) => void;
  onReplaceStrokes?: (
    nextStrokes: BoardCanvasStroke[],
    snapshotToPush?: BoardCanvasStroke[],
  ) => void;
  onUndoStroke: () => void;
  onRedoStroke: () => void;
  onClearCanvas: () => void;
  onSurfaceStyleChange: (style: BoardSurfaceStyle) => void;
  onBoardBgColorChange: (color: string) => void;
  onNotebookWidthModeChange?: (mode: NotebookWidthMode) => void;
  onNotebookPagesChange?: (pages: number) => void;
  onSaveSnapshot?: (file: File) => void;
  children?: ReactNode;
}) {
  const normalizedSurface: "blank" | "notebook" =
    surfaceStyle === "notebook" ? "notebook" : "blank";
  const isNotebook = normalizedSurface === "notebook";
  const isDarkBoard = isDarkHex(boardBgColor);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const dockRef = useRef<HTMLDivElement | null>(null);
  const laserTrailRef = useRef<LaserSample[]>([]);
  const rafRef = useRef<number | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const holdTriggeredRef = useRef(false);
  const holdStartPosRef = useRef<{ x: number; y: number } | null>(null);

  const draggingRef = useRef<
    | {
        mode: "pan";
        startClientX: number;
        startClientY: number;
        startScrollLeft: number;
        startScrollTop: number;
      }
    | { mode: "move-stroke"; strokeId: string; lastNorm: BoardCanvasPoint }
    | null
  >(null);

  const eraserDragRef = useRef<{
    active: boolean;
    lastNorm: BoardCanvasPoint;
    preDragSnapshot: BoardCanvasStroke[];
    hasPushedHistory: boolean;
  } | null>(null);

  const [worldSize, setWorldSize] = useState({
    width: INITIAL_WORLD_W,
    height: INITIAL_WORLD_H,
  });
  const [localNotebookPages, setLocalNotebookPages] = useState(
    INITIAL_NOTEBOOK_PAGES,
  );
  const [localNotebookWidthMode, setLocalNotebookWidthMode] =
    useState<NotebookWidthMode>("centered");
  const lastAutoPageAtRef = useRef(0);

  const notebookPages = Math.max(
    1,
    controlledNotebookPages ?? localNotebookPages,
  );
  const notebookWidthMode: NotebookWidthMode =
    controlledNotebookWidthMode ?? localNotebookWidthMode;

  const updateNotebookPages = useCallback(
    (updater: number | ((prev: number) => number)) => {
      const next = Math.max(
        1,
        typeof updater === "function" ? updater(notebookPages) : updater,
      );
      if (onNotebookPagesChange) {
        onNotebookPagesChange(next);
      } else {
        setLocalNotebookPages(next);
      }
    },
    [notebookPages, onNotebookPagesChange],
  );

  const updateNotebookWidthMode = useCallback(
    (mode: NotebookWidthMode) => {
      if (onNotebookWidthModeChange) {
        onNotebookWidthModeChange(mode);
      } else {
        setLocalNotebookWidthMode(mode);
      }
    },
    [onNotebookWidthModeChange],
  );
  const [viewportSize, setViewportSize] = useState({
    width: 1200,
    height: 800,
  });
  const [tool, setTool] = useState<DockToolId>("pen");
  const [toolConfigs, setToolConfigs] =
    useState<Record<StrokeToolKey, StrokeToolConfig>>(DEFAULT_TOOL_CONFIGS);
  const [eraserMode, setEraserMode] = useState<EraserMode>("partial");
  const [eraserSize, setEraserSize] = useState<number>(4);
  const [shapeFilled, setShapeFilled] = useState(false);

  const [openPopup, setOpenPopup] = useState<
    ToolSettingsPopupId | "background" | null
  >(null);
  const [holdingTool, setHoldingTool] = useState<DockToolId | null>(null);

  const [zoom, setZoom] = useState(1);
  const pendingZoomScrollRef = useRef<{ left: number; top: number } | null>(
    null,
  );
  const [selectedStrokeId, setSelectedStrokeId] = useState<string | null>(null);
  const [activeStroke, setActiveStroke] = useState<BoardCanvasStroke | null>(
    null,
  );
  const [textDraft, setTextDraft] = useState<TextDraftState | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  const palette = getInkPaletteForBg(boardBgColor);
  const activeStrokeKey = getStrokeToolKey(tool) ?? "pen";
  const activeToolConfig = toolConfigs[activeStrokeKey];
  const activeColor =
    activeToolConfig.customColor ??
    (palette[activeToolConfig.colorIndex % palette.length] ?? palette[0]);
  const activeCanvasWidth = widthLevelToCanvasPx(activeToolConfig.width);

  const notebookMetrics = computeNotebookMetrics(
    viewportSize.width,
    notebookPages,
    notebookWidthMode,
    zoom,
  );
  const effectiveScale = isNotebook ? notebookMetrics.scale : zoom;

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const scroller = scrollRef.current;
    if (!canvas || !scroller) return;

    const viewW = scroller.clientWidth;
    const viewH = scroller.clientHeight;
    if (viewW <= 0 || viewH <= 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetWidth = Math.round(viewW * dpr);
    const targetHeight = Math.round(viewH * dpr);
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scrollLeft = scroller.scrollLeft;
    const scrollTop = scroller.scrollTop;

    ctx.save();
    if (isNotebook) {
      const m = computeNotebookMetrics(
        viewW,
        notebookPages,
        notebookWidthMode,
        zoom,
      );
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.translate(-scrollLeft + m.offsetX, -scrollTop + m.topOffset);
      ctx.scale(m.scale, m.scale);

      drawNotebookSurface(
        ctx,
        scrollLeft,
        scrollTop,
        viewW,
        viewH,
        viewW,
        notebookPages,
        notebookWidthMode,
        zoom,
        boardBgColor,
      );
    } else {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.translate(-scrollLeft, -scrollTop);
      ctx.scale(zoom, zoom);

      drawBlankSurface(
        ctx,
        scrollLeft / zoom,
        scrollTop / zoom,
        viewW / zoom,
        viewH / zoom,
        boardBgColor,
      );
    }

    for (const s of strokes) {
      drawStroke(ctx, s, palette, s.id === selectedStrokeId);
    }
    if (activeStroke) {
      drawStroke(ctx, activeStroke, palette, false);
    }

    // Ephemeral fading laser pointer
    const now = Date.now();
    const activeLaser = laserTrailRef.current.filter(
      (pt) => now - pt.createdAt < 850,
    );
    laserTrailRef.current = activeLaser;

    if (activeLaser.length > 0) {
      for (let i = 1; i < activeLaser.length; i++) {
        const prev = activeLaser[i - 1];
        const curr = activeLaser[i];
        const ageRatio = 1 - (now - curr.createdAt) / 850;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(prev.x * COORD_REF_W, prev.y * COORD_REF_H);
        ctx.lineTo(curr.x * COORD_REF_W, curr.y * COORD_REF_H);
        ctx.strokeStyle = `rgba(239, 68, 68, ${Math.max(0.05, ageRatio * 0.85)})`;
        ctx.lineWidth = Math.max(2, 7 * ageRatio);
        ctx.lineCap = "round";
        ctx.shadowColor = "rgba(239, 68, 68, 0.7)";
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();
      }
      const head = activeLaser[activeLaser.length - 1];
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        head.x * COORD_REF_W,
        head.y * COORD_REF_H,
        5,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = "#ef4444";
      ctx.shadowColor = "rgba(239, 68, 68, 0.9)";
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }, [
    activeStroke,
    boardBgColor,
    isNotebook,
    notebookPages,
    notebookWidthMode,
    palette,
    selectedStrokeId,
    strokes,
    zoom,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas, viewportSize, worldSize]);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const updateSize = () => {
      setViewportSize({
        width: scroller.clientWidth,
        height: scroller.clientHeight,
      });
    };
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, []);

  // Dismiss any open dock settings popup when clicking anywhere outside popup & dock triggers
  useEffect(() => {
    if (!openPopup) return;
    const onWindowPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (popupRef.current?.contains(target)) return;
      if (dockRef.current?.contains(target)) return;
      setOpenPopup(null);
    };
    window.addEventListener("pointerdown", onWindowPointerDown, true);
    return () =>
      window.removeEventListener("pointerdown", onWindowPointerDown, true);
  }, [openPopup]);

  const ensureLaserLoop = useCallback(() => {
    if (rafRef.current !== null) return;
    const tick = () => {
      renderCanvas();
      if (laserTrailRef.current.length > 0) {
        rafRef.current = window.requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };
    rafRef.current = window.requestAnimationFrame(tick);
  }, [renderCanvas]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      if (holdTimerRef.current !== null) {
        window.clearTimeout(holdTimerRef.current);
      }
    };
  }, []);

  // Keyboard shortcuts for tools, undo/redo, and deleting selected stroke
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        if (isReadOnly) return;
        event.preventDefault();
        if (event.shiftKey) {
          onRedoStroke();
        } else {
          onUndoStroke();
        }
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
        if (isReadOnly) return;
        event.preventDefault();
        onRedoStroke();
        return;
      }

      if (
        (event.key === "Backspace" || event.key === "Delete") &&
        selectedStrokeId &&
        !isReadOnly
      ) {
        event.preventDefault();
        onRemoveStroke(selectedStrokeId);
        setSelectedStrokeId(null);
        return;
      }

      const key = event.key.toLowerCase();
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const matched = TOOL_BUTTONS.find(
        (item) => item.shortcut.toLowerCase() === key,
      );
      if (matched) {
        setTool(matched.id);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    isReadOnly,
    onRedoStroke,
    onRemoveStroke,
    onUndoStroke,
    selectedStrokeId,
  ]);

  const toNormalizedPoint = (
    clientX: number,
    clientY: number,
  ): BoardCanvasPoint => {
    const scroller = scrollRef.current;
    if (!scroller) return { x: 0.5, y: 0.5 };
    const rect = scroller.getBoundingClientRect();

    if (isNotebook) {
      const m = computeNotebookMetrics(
        scroller.clientWidth,
        notebookPages,
        notebookWidthMode,
        zoom,
      );
      const virtualX =
        (clientX - rect.left + scroller.scrollLeft - m.offsetX) / m.scale;
      const virtualY =
        (clientY - rect.top + scroller.scrollTop - m.topOffset) / m.scale;
      return {
        x: virtualX / COORD_REF_W,
        y: virtualY / COORD_REF_H,
      };
    }

    const virtualX = (clientX - rect.left + scroller.scrollLeft) / zoom;
    const virtualY = (clientY - rect.top + scroller.scrollTop) / zoom;
    return {
      x: virtualX / COORD_REF_W,
      y: virtualY / COORD_REF_H,
    };
  };

  const updateCursorFromClient = (clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setCursorPos({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
  };

  const handleScroll = () => {
    renderCanvas();
    const scroller = scrollRef.current;
    if (!scroller) return;

    if (isNotebook) {
      const nearBottom =
        scroller.scrollTop + scroller.clientHeight >=
        scroller.scrollHeight - 80;
      const now = Date.now();
      if (nearBottom && now - lastAutoPageAtRef.current > 350) {
        lastAutoPageAtRef.current = now;
        updateNotebookPages((prev) => prev + 1);
      }
      return;
    }

    const nearRight =
      scroller.scrollLeft + scroller.clientWidth >=
      worldSize.width * zoom - 120;
    const nearBottom =
      scroller.scrollTop + scroller.clientHeight >=
      worldSize.height * zoom - 120;

    if (
      (nearRight && worldSize.width < MAX_WORLD_W) ||
      (nearBottom && worldSize.height < MAX_WORLD_H)
    ) {
      setWorldSize((prev) => ({
        width: nearRight
          ? Math.min(MAX_WORLD_W, prev.width + 640)
          : prev.width,
        height: nearBottom
          ? Math.min(MAX_WORLD_H, prev.height + 900)
          : prev.height,
      }));
    }
  };

  const commitTextDraft = () => {
    if (!textDraft) return;
    const trimmed = textDraft.value.trim();
    if (trimmed) {
      const cfg = toolConfigs.shape;
      onAddStroke({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        points: [textDraft.normPoint],
        colorIndex: cfg.colorIndex,
        color: cfg.customColor ?? undefined,
        strokeWidth: widthLevelToCanvasPx(cfg.width),
        isHighlighter: false,
        kind: "text",
        text: trimmed,
      });
    }
    setTextDraft(null);
  };

  const runEraserAt = (segStart: BoardCanvasPoint, segEnd: BoardCanvasPoint) => {
    const radiusRef = eraserLevelToRadiusRef(eraserSize);

    if (eraserMode === "stroke") {
      const hit = findHitStroke(segEnd, strokes, Math.max(14, radiusRef * 0.7));
      if (hit) {
        onRemoveStroke(hit.id);
      }
      return;
    }

    const drag = eraserDragRef.current;
    const result = erasePartialAlongSegment(
      strokes,
      segStart,
      segEnd,
      radiusRef,
    );
    if (result.changed) {
      if (onReplaceStrokes) {
        const snapshot =
          drag && !drag.hasPushedHistory ? drag.preDragSnapshot : undefined;
        if (drag && !drag.hasPushedHistory) {
          drag.hasPushedHistory = true;
        }
        onReplaceStrokes(result.nextStrokes, snapshot);
      } else {
        const hit = findHitStroke(segEnd, strokes, radiusRef);
        if (hit) onRemoveStroke(hit.id);
      }
    }
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    updateCursorFromClient(event.clientX, event.clientY);
    setOpenPopup(null);

    if (textDraft) {
      commitTextDraft();
    }

    const scroller = scrollRef.current;
    if (!scroller) return;

    if (tool === "pan" || event.button === 1) {
      event.currentTarget.setPointerCapture(event.pointerId);
      draggingRef.current = {
        mode: "pan",
        startClientX: event.clientX,
        startClientY: event.clientY,
        startScrollLeft: scroller.scrollLeft,
        startScrollTop: scroller.scrollTop,
      };
      return;
    }

    if (isReadOnly) return;

    const pt = toNormalizedPoint(event.clientX, event.clientY);

    if (tool === "laser") {
      event.currentTarget.setPointerCapture(event.pointerId);
      laserTrailRef.current.push({ ...pt, createdAt: Date.now() });
      ensureLaserLoop();
      return;
    }

    if (tool === "text") {
      setTextDraft({
        normPoint: pt,
        value: "",
      });
      return;
    }

    if (tool === "select") {
      const hit = findHitStroke(pt, strokes);
      if (hit) {
        setSelectedStrokeId(hit.id);
        event.currentTarget.setPointerCapture(event.pointerId);
        draggingRef.current = {
          mode: "move-stroke",
          strokeId: hit.id,
          lastNorm: pt,
        };
      } else {
        setSelectedStrokeId(null);
      }
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);

    if (tool === "eraser") {
      eraserDragRef.current = {
        active: true,
        lastNorm: pt,
        preDragSnapshot: strokes,
        hasPushedHistory: false,
      };
      runEraserAt(pt, pt);
      return;
    }

    setSelectedStrokeId(null);
    const kind: BoardStrokeKind =
      tool === "line" ||
      tool === "arrow" ||
      tool === "rect" ||
      tool === "ellipse"
        ? tool
        : "freehand";

    const penStyleForStroke: BoardPenStyle | undefined =
      tool === "pen"
        ? "ballpoint"
        : tool === "pencil"
          ? "pencil"
          : tool === "fountain"
            ? "fountain"
            : undefined;

    setActiveStroke({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      points: kind === "freehand" ? [pt] : [pt, pt],
      colorIndex: activeToolConfig.colorIndex,
      color: activeToolConfig.customColor ?? undefined,
      strokeWidth: activeCanvasWidth,
      isHighlighter: tool === "highlighter",
      kind,
      penStyle: penStyleForStroke,
      fill:
        (kind === "rect" || kind === "ellipse") && shapeFilled
          ? true
          : undefined,
    });
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    updateCursorFromClient(event.clientX, event.clientY);

    const scroller = scrollRef.current;
    const drag = draggingRef.current;

    if (drag?.mode === "pan" && scroller) {
      scroller.scrollLeft =
        drag.startScrollLeft - (event.clientX - drag.startClientX);
      scroller.scrollTop =
        drag.startScrollTop - (event.clientY - drag.startClientY);
      return;
    }

    if (isReadOnly) return;

    const pt = toNormalizedPoint(event.clientX, event.clientY);

    if (tool === "laser" && event.buttons === 1) {
      laserTrailRef.current.push({ ...pt, createdAt: Date.now() });
      ensureLaserLoop();
      return;
    }

    if (drag?.mode === "move-stroke") {
      const dxNorm = pt.x - drag.lastNorm.x;
      const dyNorm = pt.y - drag.lastNorm.y;
      if (Math.abs(dxNorm) > 0.0005 || Math.abs(dyNorm) > 0.0005) {
        onMoveStroke(drag.strokeId, dxNorm, dyNorm);
        draggingRef.current = { ...drag, lastNorm: pt };
      }
      return;
    }

    if (tool === "eraser" && eraserDragRef.current?.active) {
      const prevNorm = eraserDragRef.current.lastNorm;
      eraserDragRef.current.lastNorm = pt;
      runEraserAt(prevNorm, pt);
      return;
    }

    if (!activeStroke) return;
    const kind = activeStroke.kind ?? "freehand";
    if (kind === "freehand") {
      const coalesced =
        typeof event.nativeEvent.getCoalescedEvents === "function"
          ? event.nativeEvent.getCoalescedEvents()
          : [];
      const samples = coalesced.length > 0 ? coalesced : [event.nativeEvent];

      const nextPoints = [...activeStroke.points];
      for (const sample of samples) {
        const rawPt = toNormalizedPoint(sample.clientX, sample.clientY);
        const lastPt = nextPoints[nextPoints.length - 1];
        const stabilized = lastPt ? stabilizeLivePoint(lastPt, rawPt) : rawPt;
        if (stabilized) {
          nextPoints.push(stabilized);
        }
      }

      if (nextPoints.length !== activeStroke.points.length) {
        setActiveStroke({
          ...activeStroke,
          points: nextPoints,
        });
      }
    } else {
      setActiveStroke({
        ...activeStroke,
        points: [activeStroke.points[0], pt],
      });
    }
  };

  const finishStroke = () => {
    draggingRef.current = null;
    eraserDragRef.current = null;
    if (activeStroke) {
      const kind = activeStroke.kind ?? "freehand";
      const finalStroke =
        kind === "freehand" && activeStroke.points.length >= 4
          ? {
              ...activeStroke,
              points: beautifyStrokePoints(activeStroke.points),
            }
          : activeStroke;
      onAddStroke(finalStroke);
      setActiveStroke(null);
    }
  };

  useEffect(() => {
    const target = pendingZoomScrollRef.current;
    const scroller = scrollRef.current;
    if (!target || !scroller) return;
    pendingZoomScrollRef.current = null;
    scroller.scrollLeft = target.left;
    scroller.scrollTop = target.top;
  }, [zoom]);

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();

    const scroller = scrollRef.current;
    const clampedDelta = Math.max(-24, Math.min(24, event.deltaY));
    const scaleFactor = Math.exp(-clampedDelta * 0.0022);
    const nextZoom = Math.max(0.5, Math.min(2.5, zoom * scaleFactor));
    if (Math.abs(nextZoom - zoom) < 0.0005) return;

    if (scroller) {
      const rect = scroller.getBoundingClientRect();
      const cursorX = event.clientX - rect.left;
      const cursorY = event.clientY - rect.top;

      if (isNotebook) {
        const currM = computeNotebookMetrics(
          scroller.clientWidth,
          notebookPages,
          notebookWidthMode,
          zoom,
        );
        const nextM = computeNotebookMetrics(
          scroller.clientWidth,
          notebookPages,
          notebookWidthMode,
          nextZoom,
        );
        const refX = (scroller.scrollLeft + cursorX - currM.offsetX) / currM.scale;
        const refY = (scroller.scrollTop + cursorY - currM.topOffset) / currM.scale;
        pendingZoomScrollRef.current = {
          left:
            nextZoom <= 1.01
              ? 0
              : Math.max(0, refX * nextM.scale + nextM.offsetX - cursorX),
          top: Math.max(0, refY * nextM.scale + nextM.topOffset - cursorY),
        };
      } else {
        const worldX = (scroller.scrollLeft + cursorX) / zoom;
        const worldY = (scroller.scrollTop + cursorY) / zoom;
        pendingZoomScrollRef.current = {
          left: Math.max(0, worldX * nextZoom - cursorX),
          top: Math.max(0, worldY * nextZoom - cursorY),
        };
      }
    }

    setZoom(nextZoom);
  };

  const handleExportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `learning-board-${Date.now()}.png`;
    anchor.click();
  };

  const handleSaveSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas || !onSaveSnapshot) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `board-snapshot-${Date.now()}.png`, {
        type: "image/png",
      });
      onSaveSnapshot(file);
    }, "image/png");
  };

  const clearHoldTimer = () => {
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setHoldingTool(null);
  };

  const handleDockButtonPointerDown = (
    item: (typeof TOOL_BUTTONS)[number],
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    holdTriggeredRef.current = false;
    holdStartPosRef.current = { x: event.clientX, y: event.clientY };

    if (!item.settingsGroup || (isReadOnly && item.id !== "pan")) {
      return;
    }

    setHoldingTool(item.id);
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
    }
    holdTimerRef.current = window.setTimeout(() => {
      holdTriggeredRef.current = true;
      setTool(item.id);
      setOpenPopup(item.settingsGroup ?? null);
      setHoldingTool(null);
    }, 850);
  };

  const handleDockButtonPointerMove = (
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (!holdStartPosRef.current) return;
    const moved = Math.hypot(
      event.clientX - holdStartPosRef.current.x,
      event.clientY - holdStartPosRef.current.y,
    );
    if (moved > 8) {
      clearHoldTimer();
    }
  };

  const handleDockButtonClick = (item: (typeof TOOL_BUTTONS)[number]) => {
    clearHoldTimer();
    if (holdTriggeredRef.current) {
      holdTriggeredRef.current = false;
      return;
    }
    setTool(item.id);
    setOpenPopup(null);
  };

  const usesCustomCursor =
    !isReadOnly &&
    (tool === "pen" ||
      tool === "pencil" ||
      tool === "fountain" ||
      tool === "highlighter" ||
      tool === "laser" ||
      tool === "eraser");

  const cursorClass =
    tool === "pan"
      ? "cursor-grab active:cursor-grabbing"
      : tool === "select"
        ? "cursor-default"
        : tool === "text"
          ? "cursor-text"
          : isReadOnly
            ? "cursor-default"
            : "cursor-none";

  // Custom OneNote dot or round duster indicator metrics
  const dotDiameter =
    tool === "highlighter"
      ? Math.max(10, activeCanvasWidth * 1.4)
      : Math.max(5.5, Math.min(13, activeToolConfig.width * 1.1 + 3));

  const dusterDiameter =
    eraserMode === "partial"
      ? Math.max(16, eraserLevelToRadiusRef(eraserSize) * 2 * effectiveScale)
      : Math.max(24, (18 + eraserSize * 3.5) * effectiveScale);

  const popupToolKey: StrokeToolKey | null =
    openPopup === "pen" ||
    openPopup === "pencil" ||
    openPopup === "fountain" ||
    openPopup === "highlighter" ||
    openPopup === "shape"
      ? openPopup
      : null;

  const popupConfig = popupToolKey ? toolConfigs[popupToolKey] : null;
  const popupInkColor = popupConfig
    ? (popupConfig.customColor ??
      (palette[popupConfig.colorIndex % palette.length] ?? palette[0]))
    : activeColor;

  return (
    <TooltipProvider delay={300}>
      <div
        ref={containerRef}
        onPointerLeave={() => setCursorPos(null)}
        className="relative h-full w-full overflow-hidden select-none"
      >
        {/* Scrollable Board Viewport */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onWheel={handleWheel}
          className={cn(
            "h-full w-full scroll-auto",
            isNotebook && zoom <= 1.01
              ? "overflow-x-hidden overflow-y-auto"
              : "overflow-auto",
          )}
        >
          <div
            style={{
              width: isNotebook
                ? zoom > 1.01
                  ? Math.max(viewportSize.width, notebookMetrics.pageDisplayW + 32)
                  : "100%"
                : worldSize.width * zoom,
              height: isNotebook
                ? notebookMetrics.totalHeightCss
                : worldSize.height * zoom,
            }}
            className="relative"
          >
            {/* Viewport-sticky HiDPI Canvas */}
            <canvas
              ref={canvasRef}
              className={cn("sticky top-0 left-0 z-0 block touch-none", cursorClass)}
              style={{
                width: `${viewportSize.width}px`,
                height: `${viewportSize.height}px`,
              }}
              onPointerEnter={(event) =>
                updateCursorFromClient(event.clientX, event.clientY)
              }
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={finishStroke}
              onPointerCancel={finishStroke}
            />

            {/* Spatial On-Board Questions & Materials scroll together with canvas */}
            <div className="pointer-events-none absolute inset-0 z-10">
              {children}
            </div>

            {isNotebook ? (
              <div className="pointer-events-auto absolute right-0 bottom-16 left-0 z-10 flex justify-center">
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  className="rounded-full bg-background/90 shadow-xs backdrop-blur-sm"
                  onClick={() => updateNotebookPages((prev) => prev + 1)}
                >
                  <Plus className="size-3.5" />
                  Add page (Page {notebookPages + 1})
                </Button>
              </div>
            ) : null}

            {/* Inline Floating Text Input Overlay */}
            {textDraft ? (
              <textarea
                autoFocus
                rows={2}
                placeholder="Type text..."
                value={textDraft.value}
                onChange={(event) =>
                  setTextDraft({ ...textDraft, value: event.target.value })
                }
                onBlur={commitTextDraft}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setTextDraft(null);
                  } else if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    commitTextDraft();
                  }
                }}
                style={{
                  left: isNotebook
                    ? notebookMetrics.offsetX +
                      Math.max(16, textDraft.normPoint.x * COORD_REF_W * notebookMetrics.scale)
                    : Math.max(16, textDraft.normPoint.x * COORD_REF_W * zoom),
                  top: isNotebook
                    ? notebookMetrics.topOffset +
                      Math.max(
                        16,
                        textDraft.normPoint.y * COORD_REF_H * notebookMetrics.scale - 12,
                      )
                    : Math.max(
                        64,
                        textDraft.normPoint.y * COORD_REF_H * zoom - 12,
                      ),
                  color: activeColor,
                  fontSize: `${Math.max(15, activeCanvasWidth * 3.2) * effectiveScale}px`,
                }}
                className="absolute z-30 min-w-44 max-w-sm resize-none rounded-md border border-primary/50 bg-background/85 px-2.5 py-1.5 font-sans font-medium shadow-md backdrop-blur-sm focus:outline-none"
              />
            ) : null}
          </div>
        </div>

        {/* Custom Canvas Pointer Indicator (OneNote Dot for Pens / Visible Round Duster for Eraser) */}
        {usesCustomCursor && cursorPos ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 z-15"
            style={{
              transform: `translate(${cursorPos.x}px, ${cursorPos.y}px) translate(-50%, -50%)`,
            }}
          >
            {tool === "eraser" ? (
              <div
                className="flex items-center justify-center rounded-full shadow-sm transition-[width,height] duration-75"
                style={{
                  width: `${dusterDiameter}px`,
                  height: `${dusterDiameter}px`,
                  backgroundColor: isDarkBoard
                    ? "rgba(255, 255, 255, 0.16)"
                    : "rgba(15, 23, 42, 0.08)",
                  border: isDarkBoard
                    ? "2px solid rgba(248, 250, 252, 0.88)"
                    : "2px solid rgba(15, 23, 42, 0.72)",
                  boxShadow: isDarkBoard
                    ? "0 0 0 1px rgba(0, 0, 0, 0.45)"
                    : "0 0 0 1px rgba(255, 255, 255, 0.65)",
                }}
              >
                {eraserMode === "stroke" ? (
                  <span
                    className="size-1.5 rounded-full"
                    style={{
                      backgroundColor: isDarkBoard ? "#f8fafc" : "#0f172a",
                    }}
                  />
                ) : null}
              </div>
            ) : (
              <div
                className="rounded-full"
                style={{
                  width: `${dotDiameter}px`,
                  height: `${dotDiameter}px`,
                  backgroundColor: tool === "laser" ? "#ef4444" : activeColor,
                  opacity: tool === "highlighter" ? 0.65 : 1,
                  border: isDarkBoard
                    ? "1.5px solid rgba(255, 255, 255, 0.92)"
                    : "1.5px solid rgba(15, 23, 42, 0.75)",
                  boxShadow: isDarkBoard
                    ? "0 0 0 1px rgba(0,0,0,0.5)"
                    : "0 0 0 1px rgba(255,255,255,0.8)",
                }}
              />
            )}
          </div>
        ) : null}

        {/* Read-Only Notice */}
        {isReadOnly ? (
          <div className="pointer-events-none absolute top-20 left-1/2 z-20 -translate-x-1/2">
            <Badge
              variant="secondary"
              className="gap-1.5 rounded-full border border-border/80 bg-background/90 px-3 py-1 text-xs shadow-sm backdrop-blur-md"
            >
              <Lock className="size-3" />
              {readOnlyReason || "View only — drawing locked"}
            </Badge>
          </div>
        ) : null}

        {/* Bottom-Left Zoom, Top Reset & Surface Selector (Blank vs Notebook) */}
        <div className="pointer-events-auto absolute bottom-4 left-4 z-20 flex items-center gap-1.5">
          <div className="flex items-center rounded-xl border border-border/80 bg-background/92 p-1 shadow-sm backdrop-blur-md">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-7 transition-transform duration-150 active:scale-[0.95]"
                    aria-label="Zoom out"
                    onClick={() =>
                      setZoom((z) =>
                        Math.max(0.5, Number((z - 0.1).toFixed(2))),
                      )
                    }
                  />
                }
              >
                <Minus className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent>Zoom out</TooltipContent>
            </Tooltip>

            <button
              type="button"
              onClick={() => {
                setZoom(1);
                scrollRef.current?.scrollTo({
                  top: 0,
                  left: 0,
                  behavior: "smooth",
                });
              }}
              className="min-w-12 px-1.5 text-center text-xs font-medium text-foreground tabular-nums hover:text-primary"
              title="Reset zoom & scroll to top-left"
            >
              {Math.round(zoom * 100)}%
            </button>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-7 transition-transform duration-150 active:scale-[0.95]"
                    aria-label="Zoom in"
                    onClick={() =>
                      setZoom((z) =>
                        Math.min(2.5, Number((z + 0.1).toFixed(2))),
                      )
                    }
                  />
                }
              >
                <Plus className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent>Zoom in</TooltipContent>
            </Tooltip>

            {isNotebook ? (
              <>
                <div className="mx-0.5 h-4 w-px bg-border/80" />
                <span className="px-2 text-xs font-medium text-muted-foreground tabular-nums">
                  {notebookPages} {notebookPages === 1 ? "page" : "pages"}
                </span>
              </>
            ) : null}

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-7 transition-transform duration-150 active:scale-[0.95]"
                    aria-label="Scroll back to top"
                    onClick={() =>
                      scrollRef.current?.scrollTo({
                        top: 0,
                        left: 0,
                        behavior: "smooth",
                      })
                    }
                  />
                }
              >
                <RotateCcw className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent>Back to top</TooltipContent>
            </Tooltip>

            <div className="mx-1 h-4 w-px bg-border/80" />

            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    className="h-7 gap-1.5 rounded-lg px-2 text-xs font-medium"
                  />
                }
              >
                {isNotebook ? (
                  <BookOpen className="size-3.5 text-muted-foreground" />
                ) : (
                  <FileText className="size-3.5 text-muted-foreground" />
                )}
                <span className="hidden sm:inline">
                  {isNotebook ? "Notebook" : "Blank"}
                </span>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="start"
                className="w-72 space-y-3 rounded-2xl p-3"
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">
                    Board surface
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Adapts ruling lines to your board background
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SURFACE_OPTIONS.map((opt) => {
                    const active = normalizedSurface === opt.value;
                    const ruleTint = isDarkBoard
                      ? "rgba(255,255,255,0.22)"
                      : "rgba(37,99,235,0.32)";
                    const marginTint = isDarkBoard
                      ? "rgba(244,63,94,0.48)"
                      : "rgba(239,68,68,0.45)";
                    const previewBg =
                      opt.value === "notebook"
                        ? {
                            backgroundColor: boardBgColor,
                            backgroundImage: `linear-gradient(to right, transparent 14px, ${marginTint} 14px, ${marginTint} 15px, transparent 15px), repeating-linear-gradient(to bottom, transparent 0, transparent 9px, ${ruleTint} 9px, ${ruleTint} 10px)`,
                          }
                        : {
                            backgroundColor: boardBgColor,
                          };

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onSurfaceStyleChange(opt.value)}
                        className={cn(
                          "group relative flex flex-col overflow-hidden rounded-xl border p-1.5 text-left transition-all active:scale-[0.98]",
                          active
                            ? "border-primary bg-primary/8 ring-1 ring-primary/40"
                            : "border-border/80 bg-background hover:border-border hover:bg-muted/50",
                        )}
                      >
                        <div
                          className="relative mb-1.5 flex h-12 w-full items-center justify-center rounded-lg border border-black/15 dark:border-white/15"
                          style={previewBg}
                        >
                          {active ? (
                            <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                              <Check className="size-2.5" />
                            </span>
                          ) : null}
                        </div>
                        <span className="px-0.5 text-xs font-medium text-foreground">
                          {opt.label}
                        </span>
                        <span className="px-0.5 text-[10px] text-muted-foreground">
                          {opt.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Press-and-Hold / Tray Contextual Settings Popup (Vertically Aligned) */}
        {openPopup ? (
          <div
            ref={popupRef}
            className="pointer-events-auto absolute bottom-[4.6rem] left-1/2 z-30 w-64 -translate-x-1/2 rounded-2xl border border-border/80 bg-background/96 p-3.5 shadow-lg backdrop-blur-md"
          >
            {openPopup === "background" ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Board background
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Blackboard, whiteboard, or custom color
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {BOARD_BG_PRESETS.map((preset) => {
                    const selected =
                      normalizeHex(boardBgColor) === normalizeHex(preset.color);
                    return (
                      <button
                        key={preset.color}
                        type="button"
                        onClick={() => onBoardBgColorChange(preset.color)}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-xl border p-1.5 transition-all active:scale-[0.96]",
                          selected
                            ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                            : "border-border/70 hover:bg-muted/60",
                        )}
                      >
                        <span
                          className="relative flex h-6 w-full items-center justify-center rounded-md border border-black/15 dark:border-white/15"
                          style={{ backgroundColor: preset.color }}
                        >
                          {selected ? (
                            <Check
                              className={cn(
                                "size-3",
                                isDarkHex(preset.color)
                                  ? "text-white"
                                  : "text-slate-900",
                              )}
                            />
                          ) : null}
                        </span>
                        <span className="text-[10px] font-medium text-foreground">
                          {preset.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border/80 bg-muted/40 px-2.5 py-1.5 text-xs hover:bg-muted/70">
                  <span className="font-medium text-foreground">
                    Custom board color
                  </span>
                  <span
                    className="size-5 rounded-full border border-border shadow-2xs"
                    style={{ backgroundColor: boardBgColor }}
                  />
                  <input
                    type="color"
                    aria-label="Custom board background color"
                    value={normalizeHex(boardBgColor)}
                    onChange={(event) => onBoardBgColorChange(event.target.value)}
                    className="sr-only"
                  />
                </label>
              </div>
            ) : openPopup === "eraser" ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">
                    Eraser settings
                  </p>
                  <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
                    Size {eraserSize}
                  </span>
                </div>

                {/* Eraser Mode */}
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEraserMode("partial")}
                    className={cn(
                      "rounded-xl border px-2.5 py-2 text-left transition-all active:scale-[0.97]",
                      eraserMode === "partial"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/80 hover:bg-muted/60",
                    )}
                  >
                    <p className="text-xs font-semibold">Partial area</p>
                    <p className="text-[10px] opacity-80">Cleans touched ink</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEraserMode("stroke")}
                    className={cn(
                      "rounded-xl border px-2.5 py-2 text-left transition-all active:scale-[0.97]",
                      eraserMode === "stroke"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/80 hover:bg-muted/60",
                    )}
                  >
                    <p className="text-xs font-semibold">Whole stroke</p>
                    <p className="text-[10px] opacity-80">Removes entire stroke</p>
                  </button>
                </div>

                {/* Round Duster Preview */}
                <div
                  className="flex h-16 w-full items-center justify-center rounded-xl border border-border/80"
                  style={{ backgroundColor: boardBgColor }}
                >
                  <div
                    className="rounded-full transition-all duration-100"
                    style={{
                      width: `${Math.min(54, Math.max(12, 10 + eraserSize * 4.4))}px`,
                      height: `${Math.min(54, Math.max(12, 10 + eraserSize * 4.4))}px`,
                      backgroundColor: isDarkBoard
                        ? "rgba(255,255,255,0.16)"
                        : "rgba(15,23,42,0.08)",
                      border: isDarkBoard
                        ? "2px solid rgba(248,250,252,0.88)"
                        : "2px solid rgba(15,23,42,0.72)",
                    }}
                  />
                </div>

                {/* Eraser Width Scroller (1 to 10) */}
                <div
                  className="space-y-1.5"
                  onWheel={(event) => {
                    event.preventDefault();
                    const step = event.deltaY < 0 ? 1 : -1;
                    setEraserSize((prev) =>
                      Math.max(1, Math.min(10, prev + step)),
                    );
                  }}
                >
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    aria-label="Eraser width"
                    value={eraserSize}
                    onChange={(event) =>
                      setEraserSize(Number(event.target.value))
                    }
                    className="h-1.5 w-full cursor-pointer accent-primary"
                  />
                  <div className="flex items-center justify-between text-[10px] tabular-nums">
                    {WIDTH_STEPS.map((step) => (
                      <button
                        key={step}
                        type="button"
                        onClick={() => setEraserSize(step)}
                        className={cn(
                          "flex size-5 items-center justify-center rounded-md transition-colors",
                          eraserSize === step
                            ? "bg-primary font-semibold text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted",
                        )}
                      >
                        {step}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : popupToolKey && popupConfig ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-foreground">
                    {POPUP_TITLES[openPopup]}
                  </p>
                  <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
                    Width {popupConfig.width}
                  </span>
                </div>

                {/* 1. Color Picker Grid */}
                <div className="grid grid-cols-5 gap-2">
                  {palette.map((color, idx) => {
                    const active =
                      popupConfig.customColor === null &&
                      popupConfig.colorIndex === idx;
                    return (
                      <button
                        key={color}
                        type="button"
                        aria-label={`Color swatch ${idx + 1}`}
                        onClick={() =>
                          setToolConfigs((prev) => ({
                            ...prev,
                            [popupToolKey]: {
                              ...prev[popupToolKey],
                              customColor: null,
                              colorIndex: idx,
                            },
                          }))
                        }
                        className={cn(
                          "size-8 rounded-full border transition-transform hover:scale-105 active:scale-95",
                          active
                            ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                            : "border-border/80",
                        )}
                        style={{ backgroundColor: color }}
                      />
                    );
                  })}

                  <label
                    className={cn(
                      "flex size-8 cursor-pointer items-center justify-center rounded-full border transition-transform hover:scale-105 active:scale-95",
                      popupConfig.customColor
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "border-dashed border-border",
                    )}
                    style={{
                      background:
                        popupConfig.customColor ??
                        "conic-gradient(from 0deg, #ef4444, #f59e0b, #10b981, #3b82f6, #a855f7, #ef4444)",
                    }}
                    title="Custom color"
                  >
                    <input
                      type="color"
                      aria-label="Custom ink color"
                      value={popupConfig.customColor ?? popupInkColor}
                      onChange={(event) =>
                        setToolConfigs((prev) => ({
                          ...prev,
                          [popupToolKey]: {
                            ...prev[popupToolKey],
                            customColor: event.target.value,
                          },
                        }))
                      }
                      className="sr-only"
                    />
                  </label>
                </div>

                {/* 2. Inverted S Curve Sample reflecting chosen color & width */}
                <div
                  className="flex h-14 w-full items-center justify-center rounded-xl border border-border/80 px-2"
                  style={{ backgroundColor: boardBgColor }}
                >
                  <svg
                    viewBox="0 0 180 48"
                    className="h-11 w-full"
                    fill="none"
                  >
                    <path
                      d="M 18 30 C 44 6, 66 6, 90 24 C 114 42, 136 42, 162 18"
                      stroke={popupInkColor}
                      strokeOpacity={
                        popupToolKey === "highlighter"
                          ? 0.42
                          : popupToolKey === "pencil"
                            ? 0.72
                            : 1
                      }
                      strokeWidth={widthLevelToCanvasPx(popupConfig.width)}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* 3. Width Scroller (1 to 10) */}
                <div
                  className="space-y-1.5"
                  onWheel={(event) => {
                    event.preventDefault();
                    const step = event.deltaY < 0 ? 1 : -1;
                    setToolConfigs((prev) => ({
                      ...prev,
                      [popupToolKey]: {
                        ...prev[popupToolKey],
                        width: Math.max(
                          1,
                          Math.min(10, prev[popupToolKey].width + step),
                        ),
                      },
                    }));
                  }}
                >
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    aria-label="Stroke width"
                    value={popupConfig.width}
                    onChange={(event) => {
                      const nextWidth = Number(event.target.value);
                      setToolConfigs((prev) => ({
                        ...prev,
                        [popupToolKey]: {
                          ...prev[popupToolKey],
                          width: nextWidth,
                        },
                      }));
                    }}
                    className="h-1.5 w-full cursor-pointer accent-primary"
                  />
                  <div className="flex items-center justify-between text-[10px] tabular-nums">
                    {WIDTH_STEPS.map((step) => (
                      <button
                        key={step}
                        type="button"
                        onClick={() =>
                          setToolConfigs((prev) => ({
                            ...prev,
                            [popupToolKey]: {
                              ...prev[popupToolKey],
                              width: step,
                            },
                          }))
                        }
                        className={cn(
                          "flex size-5 items-center justify-center rounded-md transition-colors",
                          popupConfig.width === step
                            ? "bg-primary font-semibold text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted",
                        )}
                      >
                        {step}
                      </button>
                    ))}
                  </div>
                </div>

                {popupToolKey === "shape" ? (
                  <button
                    type="button"
                    onClick={() => setShapeFilled((prev) => !prev)}
                    className={cn(
                      "w-full rounded-xl border px-2.5 py-1.5 text-xs font-medium transition-colors",
                      shapeFilled
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-muted",
                    )}
                  >
                    {shapeFilled ? "Shape fill: Tinted" : "Shape fill: Outline only"}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Bottom-Center Floating Main Drawing Dock */}
        <div
          ref={dockRef}
          className="pointer-events-auto absolute bottom-4 left-1/2 z-20 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-2xl border border-border/80 bg-background/95 p-1.5 shadow-md backdrop-blur-md"
        >
          {TOOL_BUTTONS.map((item, idx) => {
            const Icon = item.icon;
            const prevGroup = idx > 0 ? TOOL_BUTTONS[idx - 1].group : item.group;
            const disabled = isReadOnly && item.id !== "pan";
            const toolCfgKey = getStrokeToolKey(item.id);
            const toolCfg = toolCfgKey ? toolConfigs[toolCfgKey] : null;
            const dotColor = toolCfg
              ? (toolCfg.customColor ??
                (palette[toolCfg.colorIndex % palette.length] ?? palette[0]))
              : null;
            const isHolding = holdingTool === item.id;

            return (
              <div key={item.id} className="flex items-center">
                {idx > 0 && item.group !== prevGroup ? (
                  <div className="mx-1 h-5 w-px bg-border/80" />
                ) : null}
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        size="icon"
                        variant={tool === item.id ? "default" : "ghost"}
                        disabled={disabled}
                        aria-label={item.label}
                        className={cn(
                          "relative size-8 shrink-0 rounded-xl transition-transform duration-150 active:scale-[0.94]",
                          isHolding && "ring-2 ring-primary ring-offset-1",
                        )}
                        onPointerDown={(event) =>
                          handleDockButtonPointerDown(item, event)
                        }
                        onPointerMove={handleDockButtonPointerMove}
                        onPointerUp={clearHoldTimer}
                        onPointerLeave={clearHoldTimer}
                        onPointerCancel={clearHoldTimer}
                        onContextMenu={(event) => {
                          if (!item.settingsGroup || disabled) return;
                          event.preventDefault();
                          setTool(item.id);
                          setOpenPopup(item.settingsGroup);
                        }}
                        onClick={() => handleDockButtonClick(item)}
                      />
                    }
                  >
                    <Icon className="size-4" />
                    {dotColor ? (
                      <span
                        className="absolute right-1 bottom-1 size-1.5 rounded-full ring-1 ring-background"
                        style={{ backgroundColor: dotColor }}
                      />
                    ) : null}
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>{item.label}</span>
                    <kbd className="ml-1 rounded bg-background/20 px-1 text-[10px]">
                      {item.shortcut}
                    </kbd>
                    {item.settingsGroup ? (
                      <span className="ml-1.5 opacity-75">· Hold for settings</span>
                    ) : null}
                  </TooltipContent>
                </Tooltip>
              </div>
            );
          })}

          <div className="mx-1 h-5 w-px bg-border/80" />

          {/* Separate Board Background Selector in the same tray */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  size="icon"
                  variant={openPopup === "background" ? "secondary" : "ghost"}
                  aria-label="Board background color"
                  className="relative size-8 shrink-0 rounded-xl transition-transform duration-150 active:scale-[0.94]"
                  onClick={() =>
                    setOpenPopup((prev) =>
                      prev === "background" ? null : "background",
                    )
                  }
                />
              }
            >
              <Palette className="size-4" />
              <span
                className="absolute right-1 bottom-1 size-2 rounded-full border border-border ring-1 ring-background"
                style={{ backgroundColor: boardBgColor }}
              />
            </TooltipTrigger>
            <TooltipContent>Board background</TooltipContent>
          </Tooltip>

          {isNotebook ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    size="icon"
                    variant={notebookWidthMode === "full" ? "secondary" : "ghost"}
                    aria-label={
                      notebookWidthMode === "full"
                        ? "Center notebook page"
                        : "Expand notebook to full width"
                    }
                    className="size-8 shrink-0 rounded-xl transition-transform duration-150 active:scale-[0.94]"
                    onClick={() =>
                      updateNotebookWidthMode(
                        notebookWidthMode === "full" ? "centered" : "full",
                      )
                    }
                  />
                }
              >
                {notebookWidthMode === "full" ? (
                  <Minimize2 className="size-4" />
                ) : (
                  <Maximize2 className="size-4" />
                )}
              </TooltipTrigger>
              <TooltipContent>
                {notebookWidthMode === "full"
                  ? "Centered notebook"
                  : "Full width notebook"}
              </TooltipContent>
            </Tooltip>
          ) : null}

          <div className="mx-1 h-5 w-px bg-border/80" />

          {/* History + Canvas Actions */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={isReadOnly || (!canUndo && strokes.length === 0)}
                  aria-label="Undo"
                  className="size-8 shrink-0 rounded-xl transition-transform duration-150 active:scale-[0.94]"
                  onClick={onUndoStroke}
                />
              }
            >
              <Undo2 className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={isReadOnly || !canRedo}
                  aria-label="Redo"
                  className="size-8 shrink-0 rounded-xl transition-transform duration-150 active:scale-[0.94]"
                  onClick={onRedoStroke}
                />
              }
            >
              <Redo2 className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Canvas options"
                  className="size-8 shrink-0 rounded-xl transition-transform duration-150 active:scale-[0.94]"
                />
              }
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" className="w-56">
              {canSaveSnapshot && onSaveSnapshot ? (
                <DropdownMenuItem
                  disabled={isSavingSnapshot}
                  onClick={handleSaveSnapshot}
                >
                  <Camera className="size-4" />
                  {isSavingSnapshot
                    ? "Saving snapshot..."
                    : "Save snapshot to board"}
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem onClick={handleExportPng}>
                <Download className="size-4" />
                Export visible canvas as PNG
              </DropdownMenuItem>
              {!isNotebook ? (
                <DropdownMenuItem
                  onClick={() =>
                    setWorldSize((prev) => ({
                      width: Math.min(MAX_WORLD_W, prev.width + 800),
                      height: Math.min(MAX_WORLD_H, prev.height + 1000),
                    }))
                  }
                >
                  <Plus className="size-4" />
                  Add more canvas space
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => updateNotebookPages((prev) => prev + 1)}
                >
                  <Plus className="size-4" />
                  Add notebook page
                </DropdownMenuItem>
              )}
              {!isReadOnly ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={strokes.length === 0}
                    onClick={onClearCanvas}
                  >
                    <Trash2 className="size-4" />
                    Clear drawing layer
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  );
}
