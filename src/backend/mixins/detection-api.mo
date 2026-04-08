import Types "../types/detection";
import DetectionLib "../lib/detection";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import Runtime "mo:core/Runtime";

mixin () {
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    Runtime.trap("not implemented");
  };

  public shared func analyzeImage(imageData : Text, mimeType : Text) : async Types.AnalyzeResponse {
    Runtime.trap("not implemented");
  };
};
