import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { checkoutAPI } from '@/lib/api';
import { toast } from 'sonner';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, subtotal } = useCart();
  const { refreshUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Get discount values from CartPage (these would ideally come from URL params or context)
  const [ecoPointsToUse] = useState(0);
  const [storeCreditToUse] = useState(0);

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await checkoutAPI.createOrder({
        useEcoPoints: ecoPointsToUse,
        useStoreCredit: storeCreditToUse,
      });

      // Update user data with new eco-points and credits
      await refreshUser();

      setOrderId(response.data.order.id);
      setOrderPlaced(true);
      toast.success(response.data.message || 'Order placed successfully!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to place order';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center px-4"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Order Placed!</h1>
          <p className="text-muted-foreground mb-2">
            Thank you for shopping sustainably with Peedika.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Order ID: <span className="font-mono">{orderId}</span>
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/products')} variant="outline">
              Continue Shopping
            </Button>
            <Button onClick={() => navigate('/profile')}>
              View Profile
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Add some products before checking out.
          </p>
          <Button onClick={() => navigate('/products')}>
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => navigate('/cart')}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </button>

          <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

          {/* Order Summary */}
          <div className="bg-card rounded-xl border border-border p-6 mb-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Order Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items ({items.length})</span>
                <span className="font-medium">₹{subtotal.toLocaleString()}</span>
              </div>

              {ecoPointsToUse > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Eco-Points Discount</span>
                  <span>-₹{Math.floor(ecoPointsToUse / 10)}</span>
                </div>
              )}

              {storeCreditToUse > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Store Credit</span>
                  <span>-₹{storeCreditToUse}</span>
                </div>
              )}

              <div className="pt-3 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold">
                    ₹{(subtotal - Math.floor(ecoPointsToUse / 10) - storeCreditToUse).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-card rounded-xl border border-border p-6 mb-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Payment Method</h2>
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <p className="font-medium text-foreground">Cash on Delivery (COD)</p>
              <p className="text-sm text-muted-foreground mt-1">
                Pay when your order arrives
              </p>
            </div>
          </div>

          {/* Place Order Button */}
          <Button
            size="lg"
            className="w-full rounded-full"
            onClick={handlePlaceOrder}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Place Order - ₹${(subtotal - Math.floor(ecoPointsToUse / 10) - storeCreditToUse).toLocaleString()}`
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            By placing this order, you agree to our terms and conditions
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
