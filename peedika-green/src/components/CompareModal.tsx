import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { Product, BackendProduct, transformProduct, getEcoScoreLevel } from '@/types/product';
import { productsAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProduct: Product;
}

export const CompareModal = ({ isOpen, onClose, currentProduct }: CompareModalProps) => {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([currentProduct]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch related products from backend when modal opens
  useEffect(() => {
    if (isOpen && currentProduct) {
      const fetchRelated = async () => {
        setIsLoading(true);
        try {
          const response = await productsAPI.getProducts({
            category: currentProduct.category,
            limit: 10,
          });
          const products = response.data.products
            .filter((p: BackendProduct) => p._id !== currentProduct.id)
            .map(transformProduct);
          setRelatedProducts(products);
        } catch (error) {
          console.error('Failed to fetch related products:', error);
          setRelatedProducts([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchRelated();
      setSelectedProducts([currentProduct]);
    }
  }, [isOpen, currentProduct]);

  const toggleProduct = (product: Product) => {
    if (selectedProducts.find(p => p.id === product.id)) {
      if (product.id !== currentProduct.id) {
        setSelectedProducts(prev => prev.filter(p => p.id !== product.id));
      }
    } else if (selectedProducts.length < 4) {
      setSelectedProducts(prev => [...prev, product]);
    }
  };

  const sustainabilityKeys = ['materials', 'manufacturingEthics', 'packaging', 'shipping', 'lifespan'] as const;
  const sustainabilityLabels: Record<string, string> = {
    materials: 'Materials',
    manufacturingEthics: 'Manufacturing',
    packaging: 'Packaging',
    shipping: 'Shipping',
    lifespan: 'Lifespan',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Compare Products</DialogTitle>
        </DialogHeader>

        {/* Product Selection */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-3">
            Select up to 4 products to compare (current product already selected)
          </p>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {relatedProducts.map((product) => {
                const isSelected = selectedProducts.find(p => p.id === product.id);
                return (
                  <button
                    key={product.id}
                    onClick={() => toggleProduct(product)}
                    className={cn(
                      'flex-shrink-0 w-20 p-2 rounded-xl border-2 transition-all',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full aspect-square rounded-lg object-cover mb-1"
                    />
                    <p className="text-xs font-medium text-foreground truncate">{product.name}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Product</th>
                {selectedProducts.map((product) => (
                  <th key={product.id} className="text-center py-3 px-4 min-w-[180px]">
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-24 h-24 rounded-xl object-cover mx-auto mb-2"
                      />
                      {product.id !== currentProduct.id && (
                        <button
                          onClick={() => toggleProduct(product)}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                      {product.id === currentProduct.id && (
                        <span className="absolute top-0 right-0 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-foreground text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Price */}
              <tr className="border-b border-border">
                <td className="py-4 px-2 font-medium text-muted-foreground">Price</td>
                {selectedProducts.map((product) => (
                  <td key={product.id} className="text-center py-4 px-4">
                    <span className="font-bold text-lg text-foreground">
                      ₹{product.price.toLocaleString()}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Eco Score */}
              <tr className="border-b border-border bg-secondary/30">
                <td className="py-4 px-2 font-medium text-muted-foreground">Eco Score</td>
                {selectedProducts.map((product) => (
                  <td key={product.id} className="text-center py-4 px-4">
                    <div className="flex justify-center">
                      <CircularProgress
                        value={product.ecoScore}
                        size={70}
                        strokeWidth={6}
                        label=""
                      />
                    </div>
                  </td>
                ))}
              </tr>

              {/* Sustainability Breakdown */}
              {sustainabilityKeys.map((key) => (
                <tr key={key} className="border-b border-border">
                  <td className="py-3 px-2 font-medium text-muted-foreground text-sm">
                    {sustainabilityLabels[key]}
                  </td>
                  {selectedProducts.map((product) => {
                    const value = product.sustainability[key];
                    const level = getEcoScoreLevel(value);
                    return (
                      <td key={product.id} className="text-center py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                level === 'high' && 'bg-eco-high',
                                level === 'medium' && 'bg-eco-medium',
                                level === 'low' && 'bg-eco-low'
                              )}
                              style={{ width: `${value}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{value}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Eco Tags */}
              <tr className="border-b border-border">
                <td className="py-4 px-2 font-medium text-muted-foreground">Eco Tags</td>
                {selectedProducts.map((product) => (
                  <td key={product.id} className="text-center py-4 px-4">
                    <div className="flex flex-wrap justify-center gap-1">
                      {product.ecoTags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-xs"
                        >
                          <Check className="h-2.5 w-2.5" />
                          {tag}
                        </span>
                      ))}
                      {product.ecoTags.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{product.ecoTags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
};
