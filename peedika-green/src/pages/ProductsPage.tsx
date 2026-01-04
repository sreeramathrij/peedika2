import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ProductCard } from '@/components/ProductCard';
import { productsAPI } from '@/lib/api';
import { Product, BackendProduct, transformProduct, categories, ecoTags } from '@/types/product';
import { cn } from '@/lib/utils';

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [ecoScoreRange, setEcoScoreRange] = useState([0, 100]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('eco-score');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Map frontend sort to backend sort
        let backendSort: 'eco_desc' | 'eco_asc' | 'price_asc' | 'price_desc' | undefined;
        switch (sortBy) {
          case 'eco-score':
            backendSort = 'eco_desc';
            break;
          case 'price-low':
            backendSort = 'price_asc';
            break;
          case 'price-high':
            backendSort = 'price_desc';
            break;
          default:
            backendSort = undefined;
        }

        const response = await productsAPI.getProducts({
          page: currentPage,
          limit: 24,
          category: selectedCategory || undefined,
          minScore: ecoScoreRange[0] > 0 ? ecoScoreRange[0] : undefined,
          maxPrice: priceRange[1] < 5000 ? priceRange[1] : undefined,
          sort: backendSort,
        });

        const backendProducts: BackendProduct[] = response.data.products;
        const transformedProducts = backendProducts.map(transformProduct);
        
        // Apply client-side filters that backend doesn't support
        let filtered = transformedProducts;
        
        // Search filter (client-side)
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(
            p =>
              p.name.toLowerCase().includes(query) ||
              p.brand.toLowerCase().includes(query) ||
              p.category.toLowerCase().includes(query)
          );
        }
        
        // Eco tags filter (client-side)
        if (selectedTags.length > 0) {
          filtered = filtered.filter(p => selectedTags.some(tag => p.ecoTags.includes(tag)));
        }
        
        setProducts(filtered);
        setTotalProducts(response.data.total);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, priceRange, ecoScoreRange, sortBy, currentPage, searchQuery, selectedTags]);

  const filteredProducts = products;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setPriceRange([0, 5000]);
    setEcoScoreRange([0, 100]);
    setSelectedTags([]);
  };

  const hasActiveFilters =
    selectedCategory ||
    priceRange[0] > 0 ||
    priceRange[1] < 5000 ||
    ecoScoreRange[0] > 0 ||
    ecoScoreRange[1] < 100 ||
    selectedTags.length > 0;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h4 className="font-semibold text-foreground mb-3">Categories</h4>
        <div className="space-y-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(selectedCategory === category.id ? '' : category.id)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2',
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-semibold text-foreground mb-3">Price Range</h4>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            min={0}
            max={5000}
            step={100}
            className="mb-3"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Eco Score Range */}
      <div>
        <h4 className="font-semibold text-foreground mb-3">Eco Score</h4>
        <div className="px-2">
          <Slider
            value={ecoScoreRange}
            onValueChange={setEcoScoreRange}
            min={0}
            max={100}
            step={5}
            className="mb-3"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{ecoScoreRange[0]}</span>
            <span>{ecoScoreRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Eco Tags */}
      <div>
        <h4 className="font-semibold text-foreground mb-3">Eco Tags</h4>
        <div className="space-y-2">
          {ecoTags.map(tag => (
            <label key={tag} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedTags.includes(tag)}
                onCheckedChange={() => toggleTag(tag)}
              />
              <span className="text-sm text-muted-foreground">{tag}</span>
            </label>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {searchQuery ? `Search: "${searchQuery}"` : 'All Products'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {filteredProducts.length} sustainable products
          </p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-card rounded-xl p-6 sticky top-24 border border-border">
              <h3 className="font-semibold text-lg text-foreground mb-4">Filters</h3>
              <FilterContent />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              {/* Mobile Filter Button */}
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {hasActiveFilters && (
                      <span className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {(selectedCategory ? 1 : 0) + (selectedTags.length > 0 ? 1 : 0)}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Active Filters Pills */}
              <div className="hidden lg:flex flex-wrap gap-2 flex-1">
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                  >
                    {categories.find(c => c.id === selectedCategory)?.name}
                    <X className="h-3 w-3" />
                  </button>
                )}
                {selectedTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                  >
                    {tag}
                    <X className="h-3 w-3" />
                  </button>
                ))}
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eco-score">Highest Eco Score</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground mb-4">No products found</p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
