import {
  AlertCircle,
  Camera,
  CheckCircle2,
  RotateCcw,
  ScanLine,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import { useDetection } from "../hooks/use-detection";
import { STAGE_COLORS, STAGE_LABELS } from "../types/detection";
import type { DetectionResult, MaturityStage } from "../types/detection";

// ─── Bounding-box canvas overlay ────────────────────────────────────────────

interface AnnotationCanvasProps {
  imageUrl: string;
  detections: DetectionResult[];
}

function AnnotationCanvas({ imageUrl, detections }: AnnotationCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 1, h: 1 });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const imgAR = imgNaturalSize.w / imgNaturalSize.h;
    const boxAR = rect.width / rect.height;
    let drawW: number;
    let drawH: number;
    let offsetX: number;
    let offsetY: number;
    if (imgAR > boxAR) {
      drawW = rect.width;
      drawH = rect.width / imgAR;
      offsetX = 0;
      offsetY = (rect.height - drawH) / 2;
    } else {
      drawH = rect.height;
      drawW = rect.height * imgAR;
      offsetX = (rect.width - drawW) / 2;
      offsetY = 0;
    }

    for (const det of detections) {
      const { x, y, width, height } = det.boundingBox;
      const colors = STAGE_COLORS[det.stage];
      const bx = offsetX + x * drawW;
      const by = offsetY + y * drawH;
      const bw = width * drawW;
      const bh = height * drawH;

      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([]);
      ctx.strokeRect(bx, by, bw, bh);

      const label = `${STAGE_LABELS[det.stage]} ${Math.round(det.confidence * 100)}%`;
      ctx.font = "bold 12px Inter, sans-serif";
      const textW = ctx.measureText(label).width;
      const padX = 8;
      const padY = 5;
      const labelH = 22;
      const labelY = by > labelH + 4 ? by - labelH - 4 : by + 4;
      const rx = bx;
      const ry = labelY;
      const rw = textW + padX * 2;
      const rh = labelH;
      const r = 4;

      ctx.fillStyle = colors.bg;
      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(rx + r, ry);
      ctx.lineTo(rx + rw - r, ry);
      ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r);
      ctx.lineTo(rx + rw, ry + rh - r);
      ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh);
      ctx.lineTo(rx + r, ry + rh);
      ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r);
      ctx.lineTo(rx, ry + r);
      ctx.quadraticCurveTo(rx, ry, rx + r, ry);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.text;
      ctx.fillText(label, rx + padX, ry + padY + 10);
    }
  }, [detections, imgNaturalSize]);

  useEffect(() => {
    draw();
    const observer = new ResizeObserver(draw);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [draw]);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ minHeight: "280px" }}
    >
      <img
        src={imageUrl}
        alt="Jasmine flowers under analysis"
        className="w-full h-full object-contain"
        onLoad={(e) => {
          const img = e.currentTarget;
          setImgNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
        }}
        style={{ display: "block" }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ position: "absolute", top: 0, left: 0 }}
      />
    </div>
  );
}

// ─── Camera capture dialog ───────────────────────────────────────────────────

interface CameraModalProps {
  onCapture: (dataUrl: string, mimeType: string) => void;
  onClose: () => void;
}

function CameraModal({ onCapture, onClose }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setReady(true);
        }
      })
      .catch(() =>
        setCameraError("Camera access denied. Please allow camera permission."),
      );

    return () => {
      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) {
          track.stop();
        }
      }
    };
  }, []);

  const capture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
    }
    onCapture(dataUrl, "image/jpeg");
  };

  return (
    <dialog
      open
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4 m-0 w-full max-w-none max-h-none border-none"
      aria-label="Camera capture"
    >
      <div className="bg-card rounded-lg shadow-elevated w-full max-w-sm overflow-hidden border border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="font-display font-semibold text-sm text-foreground">
            Camera
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
            aria-label="Close camera"
          >
            ✕
          </button>
        </div>
        <div className="aspect-[4/3] bg-muted relative">
          {cameraError ? (
            <div className="absolute inset-0 flex items-center justify-center text-center px-6">
              <p className="text-sm text-muted-foreground">{cameraError}</p>
            </div>
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
          )}
        </div>
        <div className="px-4 py-3 flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            data-ocid="camera-cancel"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={capture}
            disabled={!ready}
            className="flex-1"
            data-ocid="camera-capture-btn"
          >
            <Camera className="w-4 h-4 mr-1.5" />
            Capture
          </Button>
        </div>
      </div>
    </dialog>
  );
}

// ─── Stage legend pill ───────────────────────────────────────────────────────

function StagePill({ stage }: { stage: MaturityStage }) {
  const colors = STAGE_COLORS[stage];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border"
      style={{
        borderColor: colors.stroke,
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: colors.stroke }}
      />
      {STAGE_LABELS[stage]}
    </span>
  );
}

// ─── Main Home page ──────────────────────────────────────────────────────────

export default function HomePage() {
  const {
    screen,
    imageDataUrl,
    detections,
    isAnalyzing,
    error,
    setImageFromFile,
    setImageFromDataUrl,
    analyzeImage,
    reset,
  } = useDetection();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const newFileInputRef = useRef<HTMLInputElement>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFromFile(file);
      e.target.value = "";
    }
  };

  const handleCameraCapture = (dataUrl: string, mimeType: string) => {
    setImageFromDataUrl(dataUrl, mimeType);
    setShowCamera(false);
  };

  const handleDetect = async () => {
    const results = await analyzeImage();
    toast.success("Detection complete", {
      description: `Found ${results.length} jasmine flower${results.length !== 1 ? "s" : ""}`,
    });
  };

  const summaryByStage = detections.reduce<Record<string, number>>((acc, d) => {
    acc[d.stage] = (acc[d.stage] ?? 0) + 1;
    return acc;
  }, {});

  const hasImage = imageDataUrl !== null;
  const isResults = screen === "results";

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-start py-6 px-4">
        <div className="w-full max-w-xl space-y-5">
          {/* Image canvas area */}
          <div
            className="bg-card border border-border rounded-lg overflow-hidden shadow-subtle relative"
            style={{ minHeight: "300px" }}
            data-ocid="image-canvas"
          >
            {hasImage ? (
              isResults && detections.length > 0 ? (
                <AnnotationCanvas
                  imageUrl={imageDataUrl}
                  detections={detections}
                />
              ) : (
                <img
                  src={imageDataUrl}
                  alt="Jasmine flowers for analysis"
                  className="w-full object-contain"
                  style={{ maxHeight: "420px", display: "block" }}
                />
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-muted-foreground"
                    aria-hidden="true"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="8.5"
                      cy="8.5"
                      r="1.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M21 15l-5-5L5 21"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground text-sm">
                    No flower selected
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload a photo or use your camera to capture jasmine flowers
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  {(["small_bud", "big_bud", "bloom"] as const).map((s) => (
                    <StagePill key={s} stage={s} />
                  ))}
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg"
                aria-live="polite"
                aria-busy="true"
              >
                <div className="flex flex-col items-center gap-3">
                  <ScanLine className="w-8 h-8 text-primary animate-pulse" />
                  <p className="text-sm font-medium text-foreground">
                    Analyzing flowers…
                  </p>
                  <div className="w-40 h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full w-3/5" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive/30 rounded text-destructive text-sm"
              role="alert"
              data-ocid="error-message"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Results summary */}
          {isResults && detections.length > 0 && (
            <div
              className="bg-card border border-border rounded-lg p-4 shadow-subtle"
              data-ocid="results-summary"
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold font-display text-foreground">
                  {detections.length} flower{detections.length !== 1 ? "s" : ""}{" "}
                  detected
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {Object.entries(summaryByStage).map(([stage, count]) => (
                  <span
                    key={stage}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border"
                    style={{
                      borderColor: STAGE_COLORS[stage as MaturityStage]?.stroke,
                      backgroundColor: STAGE_COLORS[stage as MaturityStage]?.bg,
                      color: STAGE_COLORS[stage as MaturityStage]?.text,
                    }}
                    data-ocid={`stage-badge-${stage}`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          STAGE_COLORS[stage as MaturityStage]?.stroke,
                      }}
                    />
                    {STAGE_LABELS[stage as MaturityStage]} × {count}
                  </span>
                ))}
              </div>
              <div className="space-y-1.5">
                {detections.map((det, i) => (
                  <div
                    key={`${det.stage}-${i}`}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded border"
                    style={{
                      borderColor: STAGE_COLORS[det.stage]?.stroke,
                      backgroundColor: STAGE_COLORS[det.stage]?.bg,
                    }}
                    data-ocid={`detection-row-${i}`}
                  >
                    <span
                      className="font-medium"
                      style={{ color: STAGE_COLORS[det.stage]?.text }}
                    >
                      {STAGE_LABELS[det.stage]}
                    </span>
                    <span
                      className="font-mono font-semibold"
                      style={{ color: STAGE_COLORS[det.stage]?.stroke }}
                    >
                      {Math.round(det.confidence * 100)}%
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Confidence scale: ≥90% high · 80–89% medium · 70–79% low ·
                &lt;70% uncertain
              </p>
            </div>
          )}

          {/* Primary capture actions (shown when no image or during capture) */}
          {!isResults && (
            <div className="grid grid-cols-2 gap-3" data-ocid="capture-actions">
              <Button
                type="button"
                size="lg"
                onClick={() => fileInputRef.current?.click()}
                className="w-full font-display font-semibold text-sm"
                data-ocid="upload-btn"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={() => setShowCamera(true)}
                className="w-full font-display font-semibold text-sm border-primary text-primary hover:bg-primary/10"
                data-ocid="camera-btn"
              >
                <Camera className="w-4 h-4 mr-2" />
                Camera Capture
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                aria-label="Upload flower photo"
                data-ocid="file-input"
              />
            </div>
          )}

          {/* Detect + Reset (when image loaded, not yet results) */}
          {hasImage && !isResults && (
            <div
              className="grid grid-cols-2 gap-3"
              data-ocid="analysis-actions"
            >
              <Button
                type="button"
                size="lg"
                onClick={handleDetect}
                disabled={isAnalyzing}
                className="w-full font-display font-semibold text-sm"
                data-ocid="detect-btn"
              >
                <ScanLine className="w-4 h-4 mr-2" />
                {isAnalyzing ? "Detecting…" : "Detect Objects"}
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={reset}
                className="w-full font-display font-semibold text-sm"
                data-ocid="reset-btn"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          )}

          {/* Results actions: new upload, camera, reset */}
          {isResults && (
            <div className="grid grid-cols-3 gap-2" data-ocid="results-actions">
              <Button
                type="button"
                size="lg"
                onClick={() => newFileInputRef.current?.click()}
                className="font-display font-semibold text-sm"
                data-ocid="new-upload-btn"
              >
                <Upload className="w-4 h-4 mr-1.5" />
                Upload
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={() => setShowCamera(true)}
                className="font-display font-semibold text-sm border-primary text-primary hover:bg-primary/10"
                data-ocid="camera-btn-results"
              >
                <Camera className="w-4 h-4 mr-1.5" />
                Camera
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={reset}
                className="font-display font-semibold text-sm"
                data-ocid="reset-btn-results"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Reset
              </Button>
              <input
                ref={newFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                aria-label="Upload new flower photo"
              />
            </div>
          )}
        </div>
      </div>

      {showCamera && (
        <CameraModal
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </Layout>
  );
}
