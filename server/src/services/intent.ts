export type Intent =
  | "PRODUCT_INFO"
  | "RECOMMEND"
  | "CART_EVAL"
  | "GREENER_ALTERNATIVES"
  | "FAQ"
  | "UNKNOWN";

export const detectIntent = (message: string): Intent => {
  const m = message.toLowerCase();

  // Cart evaluation
  if (m.includes("cart") && (m.includes("eco") || m.includes("score")))
    return "CART_EVAL";

  // Greener alternatives
  if (m.includes("alternative") || m.includes("greener") || m.includes("better option"))
    return "GREENER_ALTERNATIVES";

  // Product recommendations
  if (m.includes("recommend") || m.includes("show me") || m.includes("find") || m.includes("suggest"))
    return "RECOMMEND";

  // Product info - expanded patterns for questions about specific products
  if (
    m.includes("why") ||
    m.includes("explain") ||
    m.includes("tell me") ||
    m.includes("what makes") ||
    m.includes("how is") ||
    m.includes("about the") ||
    m.includes("about this") ||
    m.includes("more about") ||
    m.includes("info on") ||
    m.includes("information") ||
    m.includes("details") ||
    m.includes("describe") ||
    // Common product question patterns
    (m.includes("what") && (m.includes("product") || m.includes("item"))) ||
    (m.includes("how") && m.includes("sustainable")) ||
    (m.includes("is") && m.includes("eco"))
  )
    return "PRODUCT_INFO";

  // FAQ - general sustainability questions
  if (
    m.includes("sustainable") ||
    m.includes("eco friendly") ||
    m.includes("eco-friendly") ||
    m.includes("environment") ||
    m.includes("green")
  )
    return "PRODUCT_INFO"; // Treat sustainability questions as product info if a product is mentioned

  return "UNKNOWN";
};
