import type { backendInterface } from "../backend";

export const mockBackend: backendInterface = {
  analyzeImage: async (_imageData: string, _mimeType: string) => ({
    __kind__: "ok" as const,
    ok: [
      {
        stage: "small_bud",
        boundingBox: { x: 0.1, y: 0.1, width: 0.15, height: 0.15 },
        confidence: 0.91,
      },
      {
        stage: "big_bud",
        boundingBox: { x: 0.35, y: 0.25, width: 0.2, height: 0.2 },
        confidence: 0.87,
      },
      {
        stage: "bloom",
        boundingBox: { x: 0.6, y: 0.4, width: 0.25, height: 0.25 },
        confidence: 0.95,
      },
    ],
  }),
  transform: async (input) => ({
    status: BigInt(200),
    body: input.response.body,
    headers: input.response.headers,
  }),
};
