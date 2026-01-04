// Backend product interface (from MongoDB)
export interface BackendProduct {
  _id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  description: string;
  materials: string[];
  packaging: string;
  shipping_type: string;
  eco_tags: string[];
  eco_score: number;
  eco_breakdown: {
    materials: number;
    ethics: number;
    packaging: number;
    shipping: number;
    lifespan: number;
  };
  ai_label: 'high' | 'medium' | 'low';
  ai_confidence: number;
  ai_keywords: {
    positive: string[];
    negative: string[];
  };
  image?: string;
  createdAt: string;
}

// Frontend product interface (normalized from backend)
export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  description: string;
  ecoScore: number;
  sustainability: {
    materials: number;
    manufacturingEthics: number;
    packaging: number;
    shipping: number;
    lifespan: number;
  };
  ecoTags: string[];
  materialsInfo?: string;
  packagingInfo?: string;
  shippingInfo?: string;
  inStock: boolean;
  // Additional backend fields
  aiLabel?: 'high' | 'medium' | 'low';
  aiConfidence?: number;
  aiKeywords?: {
    positive: string[];
    negative: string[];
  };
}

// Transform backend product to frontend format
export const transformProduct = (p: BackendProduct): Product => ({
  id: p._id,
  name: p.name,
  brand: p.brand || '',
  price: p.price,
  image: p.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
  category: p.category,
  description: p.description,
  ecoScore: p.eco_score,
  sustainability: {
    materials: p.eco_breakdown?.materials || 50,
    manufacturingEthics: p.eco_breakdown?.ethics || 50,
    packaging: p.eco_breakdown?.packaging || 50,
    shipping: p.eco_breakdown?.shipping || 50,
    lifespan: p.eco_breakdown?.lifespan || 50,
  },
  ecoTags: p.eco_tags || [],
  materialsInfo: p.materials?.join(', '),
  packagingInfo: p.packaging,
  shippingInfo: p.shipping_type,
  inStock: true,
  aiLabel: p.ai_label,
  aiConfidence: p.ai_confidence,
  aiKeywords: p.ai_keywords,
});

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  memberSince: string;
  ecoPoints: number;
  storeCredit: number;
  lifetimePoints: number;
}

export type EcoScoreLevel = 'high' | 'medium' | 'low';

export const getEcoScoreLevel = (score: number): EcoScoreLevel => {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
};

export const categories = [
  { id: 'mens-fashion', name: "Men's Fashion", icon: '👕', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=300&fit=crop' },
  { id: 'womens-fashion', name: "Women's Fashion", icon: '👗', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=300&fit=crop' },
  { id: 'mobiles-computers', name: 'Mobiles & Computers', icon: '📱', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop' },
  { id: 'electronics', name: 'Electronics', icon: '💻', image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&h=300&fit=crop' },
  { id: 'appliances', name: 'Appliances', icon: '🏠', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop' },
  { id: 'home-living', name: 'Home & Living', icon: '🛋️', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop' },
  { id: 'personal-care', name: 'Personal Care', icon: '✨', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop' },
  { id: 'groceries', name: 'Groceries', icon: '🥗', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop' },
];

export const ecoTags = [
  'Organic',
  'Recycled',
  'Biodegradable',
  'Fair Trade',
  'Carbon Neutral',
  'Vegan',
  'Zero Waste',
  'Locally Sourced',
  'Renewable Energy',
  'Plastic-Free',
];
