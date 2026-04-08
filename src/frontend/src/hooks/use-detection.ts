import { useCallback, useRef, useState } from "react";
import type {
  AppScreen,
  DetectionResult,
  MaturityStage,
} from "../types/detection";

// Simulate backend detection with realistic jasmine-stage results
// In production, replace simulateDetection with: actor.analyzeImage(imageData, mimeType)
function simulateDetection(imageDataUrl: string): Promise<DetectionResult[]> {
  return new Promise((resolve) => {
    // Use a short delay to mimic network call
    setTimeout(() => {
      // Generate 2-4 realistic detections based on image hash for determinism
      const hash = imageDataUrl.length % 7;
      const stages: MaturityStage[] = ["small_bud", "big_bud", "bloom"];
      const count = 2 + (hash % 3);
      const results: DetectionResult[] = [];

      for (let i = 0; i < count; i++) {
        const stage = stages[i % stages.length];
        const col = i % 3;
        const x = 0.08 + col * 0.3 + (hash % 3) * 0.02;
        const y = 0.12 + (i > 2 ? 0.35 : 0) + (hash % 5) * 0.02;
        results.push({
          stage,
          confidence: 0.82 + ((hash + i * 3) % 17) / 100,
          boundingBox: {
            x,
            y,
            width: 0.18 + (i % 2) * 0.06,
            height: 0.32 + (i % 3) * 0.08,
          },
        });
      }
      resolve(results);
    }, 1500);
  });
}

export interface UseDetectionReturn {
  screen: AppScreen;
  imageDataUrl: string | null;
  imageMimeType: string;
  detections: DetectionResult[];
  isAnalyzing: boolean;
  error: string | null;
  setImageFromFile: (file: File) => void;
  setImageFromDataUrl: (dataUrl: string, mimeType?: string) => void;
  analyzeImage: () => Promise<DetectionResult[]>;
  reset: () => void;
}

export function useDetection(): UseDetectionReturn {
  const [screen, setScreen] = useState<AppScreen>("capture");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const setImageFromFile = useCallback((file: File) => {
    setError(null);
    setDetections([]);
    setImageMimeType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        setImageDataUrl(result);
        setScreen("capture");
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const setImageFromDataUrl = useCallback(
    (dataUrl: string, mimeType = "image/jpeg") => {
      setError(null);
      setDetections([]);
      setImageDataUrl(dataUrl);
      setImageMimeType(mimeType);
      setScreen("capture");
    },
    [],
  );

  const analyzeImage = useCallback(async (): Promise<DetectionResult[]> => {
    if (!imageDataUrl) return [];
    setIsAnalyzing(true);
    setError(null);
    setScreen("analyzing");
    abortRef.current = false;

    try {
      // Strip the data URL prefix to get raw base64 for backend
      const base64 = imageDataUrl.split(",")[1] ?? imageDataUrl;
      // In production: const results = await actor.analyzeImage(base64, imageMimeType);
      const results = await simulateDetection(base64);
      if (!abortRef.current) {
        setDetections(results);
        setScreen("results");
      }
      return abortRef.current ? [] : results;
    } catch (err) {
      if (!abortRef.current) {
        setError(
          err instanceof Error
            ? err.message
            : "Detection failed. Please try again.",
        );
        setScreen("capture");
      }
      return [];
    } finally {
      if (!abortRef.current) {
        setIsAnalyzing(false);
      }
    }
  }, [imageDataUrl]);

  const reset = useCallback(() => {
    abortRef.current = true;
    setScreen("capture");
    setImageDataUrl(null);
    setDetections([]);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return {
    screen,
    imageDataUrl,
    imageMimeType,
    detections,
    isAnalyzing,
    error,
    setImageFromFile,
    setImageFromDataUrl,
    analyzeImage,
    reset,
  };
}
