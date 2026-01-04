import natural from "natural";

let classifier: natural.BayesClassifier;

export const loadModel = async () => {
  return new Promise<void>((resolve, reject) => {
    natural.BayesClassifier.load("ml-model.json", null, (err, loaded) => {
      if (err || !loaded) {
        console.error("Failed to load ML model", err);
        reject(err);
      } else {
        classifier = loaded;
        console.log("ML model loaded");
        resolve();
      }
    });
  });
};

export const classifySustainability = (
  text: string
): "high" | "medium" | "low" => {
  return classifier.classify(text.toLowerCase()) as any;
};

export const getClassProbabilities = (text: string) => {
  return classifier.getClassifications(text.toLowerCase());
};
