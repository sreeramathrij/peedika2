import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

// Unsplash API for images (free tier: 50 requests/hour)
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || "";

interface ScrapedProduct {
  name: string;
  brand: string;
  category: string;
  price: number;
  description: string;
  image: string;
}

// Category-specific image search terms for Unsplash
const categoryImageTerms: Record<string, string> = {
  "mens-fashion": "mens clothing sustainable",
  "womens-fashion": "womens dress organic",
  "mobile-computers": "laptop computer eco",
  "home-living": "home decor sustainable",
  "beauty-health": "organic skincare natural",
  "grocery": "organic food vegetables",
};

// Sample eco-friendly brands by category
const ecoBrands: Record<string, string[]> = {
  "mens-fashion": ["EcoThread", "GreenWear", "Patagonia", "Tentree", "Pact"],
  "womens-fashion": ["Reformation", "Eileen Fisher", "Amour Vert", "People Tree", "Thought"],
  "mobile-computers": ["Fairphone", "Framework", "Dell Refurbished", "HP Renew", "Apple Certified"],
  "home-living": ["West Elm", "Coyuchi", "Avocado", "Boll & Branch", "Brooklinen"],
  "beauty-health": ["Herbivore", "Tata Harper", "RMS Beauty", "Kjaer Weis", "ILIA"],
  "grocery": ["Nature's Path", "Amy's", "Organic Valley", "Annie's", "Lundberg"],
};

// Materials by category for eco scoring
const ecoMaterials: Record<string, { good: string[], bad: string[] }> = {
  "mens-fashion": {
    good: ["organic cotton", "hemp", "recycled polyester", "tencel", "linen"],
    bad: ["polyester", "nylon", "acrylic", "conventional cotton"]
  },
  "womens-fashion": {
    good: ["organic cotton", "silk", "hemp", "bamboo", "recycled materials"],
    bad: ["polyester", "synthetic", "fast fashion", "plastic"]
  },
  "mobile-computers": {
    good: ["recycled aluminum", "recycled plastic", "modular design", "energy efficient"],
    bad: ["non-recyclable", "planned obsolescence", "rare earth metals"]
  },
  "home-living": {
    good: ["bamboo", "organic cotton", "recycled glass", "reclaimed wood", "natural fibers"],
    bad: ["plastic", "MDF", "synthetic", "chemical treated"]
  },
  "beauty-health": {
    good: ["organic", "natural ingredients", "vegan", "cruelty-free", "recyclable packaging"],
    bad: ["parabens", "sulfates", "synthetic fragrance", "microplastics"]
  },
  "grocery": {
    good: ["organic", "non-gmo", "locally sourced", "fair trade", "minimal packaging"],
    bad: ["processed", "preservatives", "excessive packaging", "imported"]
  }
};

// Fetch images from Unsplash
async function fetchUnsplashImages(query: string, count: number = 10): Promise<string[]> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.log("No Unsplash API key, using placeholder images");
    return Array(count).fill("https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80");
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=squarish`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );
    
    const data = await response.json();
    return data.results?.map((img: any) => img.urls?.regular || img.urls?.small) || [];
  } catch (error) {
    console.error("Failed to fetch from Unsplash:", error);
    return [];
  }
}

// Generate eco score based on materials and category
function generateEcoScore(materials: string[], category: string): {
  score: number;
  breakdown: { materials: number; ethics: number; packaging: number; shipping: number; lifespan: number };
  label: "high" | "medium" | "low";
  keywords: { positive: string[]; negative: string[] };
} {
  const catMaterials = ecoMaterials[category] || ecoMaterials["mens-fashion"]!;
  
  const positiveMatches = materials.filter(m => 
    catMaterials!.good.some(g => m.toLowerCase().includes(g.toLowerCase()))
  );
  const negativeMatches = materials.filter(m => 
    catMaterials!.bad.some(b => m.toLowerCase().includes(b.toLowerCase()))
  );

  // Calculate scores out of max values
  const materialsScore = Math.min(30, 15 + positiveMatches.length * 5 - negativeMatches.length * 3);
  const ethicsScore = Math.min(20, 10 + Math.random() * 10);
  const packagingScore = Math.min(15, 8 + Math.random() * 7);
  const shippingScore = Math.min(20, 10 + Math.random() * 10);
  const lifespanScore = Math.min(15, 8 + Math.random() * 7);

  const totalScore = Math.round(materialsScore + ethicsScore + packagingScore + shippingScore + lifespanScore);

  return {
    score: totalScore,
    breakdown: {
      materials: Math.round(materialsScore),
      ethics: Math.round(ethicsScore),
      packaging: Math.round(packagingScore),
      shipping: Math.round(shippingScore),
      lifespan: Math.round(lifespanScore),
    },
    label: totalScore >= 70 ? "high" : totalScore >= 50 ? "medium" : "low",
    keywords: {
      positive: positiveMatches,
      negative: negativeMatches,
    },
  };
}

// Generate products for a category
async function generateCategoryProducts(category: string, count: number = 10): Promise<any[]> {
  const brands = ecoBrands[category] || ecoBrands["mens-fashion"]!;
  const materials = ecoMaterials[category] || ecoMaterials["mens-fashion"]!;
  const imageQuery = categoryImageTerms[category] || "sustainable product";
  
  // Fetch real images from Unsplash
  const images = await fetchUnsplashImages(imageQuery, count);
  
  const products: any[] = [];
  
  for (let i = 0; i < count; i++) {
    const isEcoFriendly = Math.random() > 0.3; // 70% eco-friendly products
    const selectedMaterials = isEcoFriendly
      ? materials!.good.slice(0, 1 + Math.floor(Math.random() * 2))
      : materials!.bad.slice(0, 1 + Math.floor(Math.random() * 2));
    
    const brand = brands![Math.floor(Math.random() * brands!.length)];
    const basePrice = 500 + Math.floor(Math.random() * 5000);
    
    const ecoData = generateEcoScore(selectedMaterials, category);
    
    const productNames: Record<string, string[]> = {
      "mens-fashion": ["Classic T-Shirt", "Slim Fit Jeans", "Casual Shirt", "Pullover Hoodie", "Chino Pants", "Denim Jacket", "Polo Shirt", "Cargo Shorts"],
      "womens-fashion": ["Summer Dress", "Blouse", "Maxi Skirt", "Cardigan", "Jumpsuit", "Palazzo Pants", "Wrap Top", "A-Line Dress"],
      "mobile-computers": ["Laptop", "Smartphone", "Tablet", "Wireless Earbuds", "Smart Watch", "Keyboard", "Monitor", "Webcam"],
      "home-living": ["Throw Blanket", "Cushion Cover", "Bedsheet Set", "Curtains", "Table Lamp", "Storage Basket", "Wall Art", "Rug"],
      "beauty-health": ["Face Serum", "Moisturizer", "Lip Balm", "Shampoo Bar", "Body Lotion", "Face Mask", "Sunscreen", "Essential Oil"],
      "grocery": ["Granola", "Olive Oil", "Honey", "Quinoa", "Almond Butter", "Oats", "Coffee Beans", "Dried Fruits"],
    };
    
    const names = productNames[category] || productNames["mens-fashion"]!;
    const productName = names![Math.floor(Math.random() * names!.length)] || "Product";
    
    const packagingOptions = isEcoFriendly 
      ? ["recyclable cardboard", "paper bag", "compostable packaging", "minimal packaging"]
      : ["plastic wrap", "styrofoam", "mixed materials", "non-recyclable"];
    
    const shippingOptions = isEcoFriendly
      ? ["ground", "consolidated", "carbon-neutral"]
      : ["air", "express", "international"];

    products.push({
      name: `${brand} ${productName} ${i + 1}`,
      brand,
      category,
      price: basePrice,
      description: `${isEcoFriendly ? "Sustainably made" : "Affordable"} ${productName.toLowerCase()} from ${brand}. Made with ${selectedMaterials.join(", ")}.`,
      materials: selectedMaterials,
      packaging: packagingOptions[Math.floor(Math.random() * packagingOptions.length)],
      shipping_type: shippingOptions[Math.floor(Math.random() * shippingOptions.length)],
      eco_tags: isEcoFriendly ? ["sustainable", "eco-friendly"] : ["budget", "conventional"],
      eco_score: ecoData.score,
      eco_breakdown: ecoData.breakdown,
      ai_label: ecoData.label,
      ai_confidence: 0.7 + Math.random() * 0.25,
      ai_keywords: ecoData.keywords,
      image: images[i] || images[0] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80",
    });
  }
  
  return products;
}

// Main scraping function
async function scrapeAndSeed(productsPerCategory: number = 10) {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing products (optional)
    const clearExisting = process.argv.includes("--clear");
    if (clearExisting) {
      await Product.deleteMany({});
      console.log("Cleared existing products");
    }

    const categories = [
      "mens-fashion",
      "womens-fashion", 
      "mobile-computers",
      "home-living",
      "beauty-health",
      "grocery"
    ];

    let totalInserted = 0;

    for (const category of categories) {
      console.log(`\nGenerating products for ${category}...`);
      const products = await generateCategoryProducts(category, productsPerCategory);
      
      // Add delay between categories to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await Product.insertMany(products);
      totalInserted += result.length;
      console.log(`  Inserted ${result.length} products`);
    }

    console.log(`\n✅ Successfully inserted ${totalInserted} products total`);
    
  } catch (error) {
    console.error("Scraping error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run if executed directly
scrapeAndSeed(10);

export { scrapeAndSeed, fetchUnsplashImages, generateCategoryProducts };
