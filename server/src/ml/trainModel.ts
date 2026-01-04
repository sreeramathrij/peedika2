import natural from "natural";
import fs from "fs";
import { trainingData } from "./trainingData";

const classifier = new natural.BayesClassifier();

for (const sample of trainingData) {
  classifier.addDocument(sample.text.toLowerCase(), sample.label);
}

classifier.train();

classifier.save("ml-model.json", (err) => {
  if (err) console.error("Error saving model:", err);
  else console.log("ML model saved successfully.");
});