import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Check, Scale, Leaf, Box, Truck, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EcoScoreBadge } from '@/components/ui/EcoScoreBadge';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { ProductCard } from '@/components/ProductCard';
import { CompareModal } from '@/components/CompareModal';
import { productsAPI } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { getEcoScoreLevel, Product, BackendProduct, transformProduct } from '@/types/product';

const sustainabilityWeights = {
  materials: { label: 'Materials', weight: 30, icon: Leaf },
  manufacturingEthics: { label: 'Manufacturing Ethics', weight: 20, icon: Box },
  packaging: { label: 'Packaging', weight: 15, icon: Box },
  shipping: { label: 'Shipping', weight: 20, icon: Truck },
  lifespan: { label: 'Lifespan', weight: 15, icon: Clock },
};

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchProduct = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const response = await productsAPI.getProduct(id);
        const backendProduct: BackendProduct = response.data;
        setProduct(transformProduct(backendProduct));
        
        // Fetch alternatives/related products
        try {
          const altResponse = await productsAPI.getAlternatives(id);
          const alternatives: BackendProduct[] = altResponse.data || [];
          setRelatedProducts(alternatives.map(transformProduct));
        } catch (error) {
          // If alternatives endpoint fails, try to get products from same category
          const productsResponse = await productsAPI.getProducts({
            category: backendProduct.category,
            limit: 4,
          });
          const related = productsResponse.data.products
            .filter((p: BackendProduct) => p._id !== id)
            .slice(0, 4)
            .map(transformProduct);
          setRelatedProducts(related);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product not found</h1>
          <Button asChild>
            <Link to="/products">Back to Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const images = product.images || [product.image];
  const ecoLevel = getEcoScoreLevel(product.ecoScore);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Image Gallery */}
          <div className="space-y-4">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square rounded-2xl overflow-hidden bg-card border border-border"
            >
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'w-20 h-20 rounded-xl overflow-hidden border-2 transition-all',
                      selectedImage === index
                        ? 'border-primary'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
              {product.brand}
            </p>
            <h1 className="text-3xl font-bold text-foreground mb-4">{product.name}</h1>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-foreground">
                ₹{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                  <span className="px-2 py-1 rounded-md bg-destructive text-destructive-foreground text-sm font-medium">
                    Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Eco Score */}
            <div className="bg-card rounded-2xl border border-border p-6 mb-6">
              <div className="flex items-start gap-6">
                <CircularProgress
                  value={product.ecoScore}
                  size={100}
                  strokeWidth={8}
                  label="Eco Score"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">Sustainability Rating</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {ecoLevel === 'high' && 'Excellent choice! This product meets our highest sustainability standards.'}
                    {ecoLevel === 'medium' && 'Good choice! This product has moderate sustainability credentials.'}
                    {ecoLevel === 'low' && 'Consider alternatives. This product has room for improvement.'}
                  </p>
                  {/* Eco Tags */}
                  <div className="flex flex-wrap gap-2">
                    {product.ecoTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm"
                      >
                        <Check className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sustainability Breakdown */}
            <div className="bg-card rounded-2xl border border-border p-6 mb-6">
              <h3 className="font-semibold text-foreground mb-4">Sustainability Breakdown</h3>
              <div className="space-y-4">
                {Object.entries(sustainabilityWeights).map(([key, { label, weight, icon: Icon }]) => {
                  const value = product.sustainability[key as keyof typeof product.sustainability];
                  const percentage = (value / weight) * 100;
                  const level = getEcoScoreLevel(percentage);
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">{label}</span>
                        </div>
                        <span className="text-sm font-semibold">{value} / {weight}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={cn(
                            'h-full rounded-full',
                            level === 'high' && 'bg-eco-high',
                            level === 'medium' && 'bg-eco-medium',
                            level === 'low' && 'bg-eco-low'
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Materials, Packaging, Shipping */}
            {(product.materialsInfo || product.packagingInfo || product.shippingInfo) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {product.materialsInfo && (
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <Leaf className="h-5 w-5 text-primary mb-2" />
                    <h4 className="font-medium text-sm text-foreground mb-1">Materials</h4>
                    <p className="text-xs text-muted-foreground">{product.materialsInfo}</p>
                  </div>
                )}
                {product.packagingInfo && (
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <Box className="h-5 w-5 text-primary mb-2" />
                    <h4 className="font-medium text-sm text-foreground mb-1">Packaging</h4>
                    <p className="text-xs text-muted-foreground">{product.packagingInfo}</p>
                  </div>
                )}
                {product.shippingInfo && (
                  <div className="bg-secondary/50 rounded-xl p-4">
                    <Truck className="h-5 w-5 text-primary mb-2" />
                    <h4 className="font-medium text-sm text-foreground mb-1">Shipping</h4>
                    <p className="text-xs text-muted-foreground">{product.shippingInfo}</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Quantity */}
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-foreground hover:bg-secondary transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 text-foreground hover:bg-secondary transition-colors"
                >
                  +
                </button>
              </div>

              <Button
                size="lg"
                className="flex-1 rounded-full"
                onClick={() => addToCart(product, quantity)}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="rounded-full"
                onClick={() => setIsCompareOpen(true)}
              >
                <Scale className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Compare Modal */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        currentProduct={product}
      />
    </div>
  );
};

export default ProductDetailPage;
