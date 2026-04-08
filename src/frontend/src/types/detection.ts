export type MaturityStage = "small_bud" | "big_bud" | "bloom";

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectionResult {
  boundingBox: BoundingBox;
  stage: MaturityStage;
  confidence: number;
}

export type AppScreen = "capture" | "analyzing" | "results";

export const STAGE_LABELS: Record<MaturityStage, string> = {
  small_bud: "Small Bud",
  big_bud: "Big Bud",
  bloom: "Bloom",
};

export const STAGE_COLORS: Record<
  MaturityStage,
  { stroke: string; bg: string; text: string }
> = {
  small_bud: {
    stroke: "oklch(0.55 0.18 125)",
    bg: "oklch(0.55 0.18 125 / 0.15)",
    text: "oklch(0.30 0.12 125)",
  },
  big_bud: {
    stroke: "oklch(0.72 0.18 90)",
    bg: "oklch(0.72 0.18 90 / 0.15)",
    text: "oklch(0.38 0.12 90)",
  },
  bloom: {
    stroke: "oklch(0.65 0.2 32)",
    bg: "oklch(0.65 0.2 32 / 0.15)",
    text: "oklch(0.38 0.15 32)",
  },
};
