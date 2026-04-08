import Types "../types/detection";
import OutCall "mo:caffeineai-http-outcalls/outcall";
import Runtime "mo:core/Runtime";

module {
  public func analyzeImage(imageData : Text, mimeType : Text, transform : OutCall.Transform) : async Types.AnalyzeResponse {
    Runtime.trap("not implemented");
  };
};
