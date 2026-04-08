module {
  public type BoundingBox = {
    x : Float;
    y : Float;
    width : Float;
    height : Float;
  };

  public type DetectionResult = {
    boundingBox : BoundingBox;
    stage : Text;
    confidence : Float;
  };

  public type AnalyzeResponse = {
    #ok : [DetectionResult];
    #err : Text;
  };
};
