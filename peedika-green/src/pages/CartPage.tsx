import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight, Leaf, PartyPopper, ArrowUpRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { EcoScoreBadge } from '@/components/ui/EcoScoreBadge';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, swapProduct, subtotal, averageEcoScore, totalItems, isLoading, greenerSuggestions } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [ecoPointsToRedeem, setEcoPointsToRedeem] = useState(0);
  const [storeCreditToUse, setStoreCreditToUse] = useState(0);

  const availablePoints = user?.ecoPoints || 0;
  const availableCredit = user?.storeCredit || 0;

  const pointsDiscount = Math.floor(ecoPointsToRedeem / 100) * 10;
  const totalDiscount = pointsDiscount + storeCreditToUse;
  const finalTotal = Math.max(0, subtotal - totalDiscount);

  // Points to earn from this purchase (10% of total, 2x for high eco score items)
  const pointsToEarn = items.reduce((sum, item) => {
    const multiplier = item.product.ecoScore >= 70 ? 2 : 1;
    return sum + Math.floor((item.product.price * item.quantity * 0.1) * multiplier);
  }, 0);

  // Check if all items have the highest eco score (no greener suggestions)
  const allGreenestOptions = greenerSuggestions.length === 0 && items.length > 0;
  
  // Helper to find greener suggestion for a product
  const getGreenerSuggestion = (productId: string) => {
    return greenerSuggestions.find(s => s.current.id === productId);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 rounded-full bg-secondary mx-auto mb-6 flex items-center justify-center">
              <Leaf className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Start shopping for sustainable products and make a difference!
            </p>
            <Button size="lg" className="rounded-full" asChild>
              <Link to="/products">
                Browse Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-foreground mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground mb-8">{totalItems} items in your cart</p>

        {/* Greenest Options Banner */}
        <AnimatePresence>
          {allGreenestOptions && items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-4 rounded-xl gradient-eco flex items-center gap-4"
            >
              <PartyPopper className="h-8 w-8 text-primary-foreground" />
              <div>
                <h3 className="font-semibold text-primary-foreground">
                  Congratulations! 🎉
                </h3>
                <p className="text-sm text-primary-foreground/90">
                  You've selected the greenest options in each category. Thank you for shopping sustainably!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {isLoading && items.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              items.map((item) => {
                const greenerSuggestion = getGreenerSuggestion(item.product.id);
                const bestAlternative = greenerSuggestion?.alternatives[0];
                return (
                  <motion.div
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                  >
                    <div className="bg-card rounded-xl border border-border p-4">
                      <div className="flex gap-4">
                        {/* Image */}
                        <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-24 h-24 rounded-lg object-cover"
                          />
                        </Link>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase">
                                {item.product.brand}
                              </p>
                              <Link to={`/product/${item.product.id}`}>
                                <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                                  {item.product.name}
                                </h3>
                              </Link>
                            </div>
                            <EcoScoreBadge score={item.product.ecoScore} size="sm" />
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            {/* Quantity */}
                            <div className="flex items-center border border-border rounded-lg">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="p-2 hover:bg-secondary transition-colors"
                                disabled={isLoading}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="px-3 font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="p-2 hover:bg-secondary transition-colors"
                                disabled={isLoading}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="font-bold text-lg">
                                ₹{(item.product.price * item.quantity).toLocaleString()}
                              </span>
                              <button
                                onClick={() => removeFromCart(item.product.id)}
                                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                disabled={isLoading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Greener Alternative from Backend */}
                      {bestAlternative && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                            <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Leaf className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-primary font-medium mb-0.5">
                                🌱 Greener Alternative Available
                              </p>
                              <p className="font-medium text-sm text-foreground truncate">
                                {bestAlternative.name}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>₹{bestAlternative.price} • Score: {bestAlternative.eco_score}</span>
                                <span className="text-primary">
                                  (+{bestAlternative.improvementPercent} points)
                                </span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => swapProduct(item.product.id, bestAlternative.id)}
                              disabled={isLoading}
                            >
                              Swap
                              <ArrowUpRight className="ml-1 h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-6">Order Summary</h2>

              {/* Cart Eco Score */}
              <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-secondary/50">
                <div>
                  <p className="text-sm text-muted-foreground">Cart Eco Score</p>
                  <p className="font-semibold text-foreground">Average sustainability</p>
                </div>
                <CircularProgress value={averageEcoScore} size={60} strokeWidth={5} />
              </div>

              {/* Subtotal */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>

                {/* Eco Points Slider */}
                {isAuthenticated && availablePoints > 0 && (
                  <div className="pt-3 border-t border-border">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Redeem Eco-Points</span>
                      <span className="text-sm font-medium text-primary">
                        -{pointsDiscount > 0 ? `₹${pointsDiscount}` : '₹0'}
                      </span>
                    </div>
                    <Slider
                      value={[ecoPointsToRedeem]}
                      onValueChange={([v]) => setEcoPointsToRedeem(v)}
                      max={Math.min(availablePoints, subtotal * 10)}
                      step={100}
                      className="mb-1"
                    />
                    <p className="text-xs text-muted-foreground">
                      {ecoPointsToRedeem} of {availablePoints} points (100 pts = ₹10)
                    </p>
                  </div>
                )}

                {/* Store Credit Slider */}
                {isAuthenticated && availableCredit > 0 && (
                  <div className="pt-3 border-t border-border">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Apply Store Credit</span>
                      <span className="text-sm font-medium text-primary">
                        -{storeCreditToUse > 0 ? `₹${storeCreditToUse}` : '₹0'}
                      </span>
                    </div>
                    <Slider
                      value={[storeCreditToUse]}
                      onValueChange={([v]) => setStoreCreditToUse(v)}
                      max={Math.min(availableCredit, subtotal - pointsDiscount)}
                      step={10}
                      className="mb-1"
                    />
                    <p className="text-xs text-muted-foreground">
                      ₹{storeCreditToUse} of ₹{availableCredit} available
                    </p>
                  </div>
                )}

                {totalDiscount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Total Discount</span>
                    <span className="font-medium">-₹{totalDiscount}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-4 border-t border-border mb-4">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold">₹{finalTotal.toLocaleString()}</span>
              </div>

              {/* Points to Earn */}
              <div className="p-4 rounded-xl bg-primary/10 mb-6">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Leaf className="h-4 w-4" />
                  <span className="font-semibold">You'll earn {pointsToEarn} eco-points!</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  2x points on products with eco-score 70+
                </p>
              </div>

              {/* Checkout Button */}
              <Button size="lg" className="w-full rounded-full" asChild>
                <Link to={isAuthenticated ? `/checkout?ecoPoints=${ecoPointsToRedeem}&storeCredit=${storeCreditToUse}` : '/signin'}>
                  {isAuthenticated ? 'Proceed to Checkout' : 'Sign in to Checkout'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
