import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type AnalyzeResponse = {
    __kind__: "ok";
    ok: Array<DetectionResult>;
} | {
    __kind__: "err";
    err: string;
};
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface BoundingBox {
    x: number;
    y: number;
    height: number;
    width: number;
}
export interface DetectionResult {
    stage: string;
    boundingBox: BoundingBox;
    confidence: number;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface backendInterface {
    analyzeImage(imageData: string, mimeType: string): Promise<AnalyzeResponse>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
