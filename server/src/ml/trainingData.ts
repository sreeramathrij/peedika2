export type SustainabilityLabel = "high" | "medium" | "low";

export interface TrainingSample {
  text: string;
  label: SustainabilityLabel;
}

export const trainingData: TrainingSample[] = [
  // HIGH
  {
    text: "organic cotton shirt biodegradable packaging fair trade ethically sourced",
    label: "high"
  },
  {
    text: "made from recycled plastic bottles eco friendly reusable materials",
    label: "high"
  },
  {
    text: "reusable metal water bottle plastic free packaging sustainable product",
    label: "high"
  },

  // MEDIUM
  {
    text: "standard cotton shirt regular packaging shipped by ground transport",
    label: "medium"
  },
  {
    text: "polyester shirt durable product normal supply chain",
    label: "medium"
  },

  // LOW
  {
    text: "single use plastic bottle disposable packaging",
    label: "low"
  },
  {
    text: "fast fashion synthetic materials shipped by air",
    label: "low"
  },
  {
    text: "cheap plastic toy non recyclable harmful materials",
    label: "low"
  }
];
