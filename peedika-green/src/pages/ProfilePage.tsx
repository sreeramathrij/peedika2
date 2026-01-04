import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Leaf, Gift, ShoppingBag, TrendingUp, LogOut, ArrowRight, Coins, CreditCard, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

const ProfilePage = () => {
  const { user, isAuthenticated, logout, convertPointsToCredit } = useAuth();
  const { items, subtotal, averageEcoScore } = useCart();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-full bg-secondary mx-auto mb-6 flex items-center justify-center">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Sign in to view your profile</h1>
          <p className="text-muted-foreground mb-6">
            Track your eco-points, view shopping history, and manage your account.
          </p>
          <Button size="lg" className="rounded-full" asChild>
            <Link to="/signin">
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const memberSinceDate = new Date(user.memberSince).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  const howItWorks = [
    { icon: ShoppingBag, title: 'Shop Sustainably', desc: 'Earn points on every purchase' },
    { icon: TrendingUp, title: 'Get 2x Points', desc: 'On products with 70+ eco-score' },
    { icon: CreditCard, title: 'Convert to Credit', desc: '500 points = ₹100 store credit' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* User Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-6 mb-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full gradient-eco flex items-center justify-center text-2xl font-bold text-primary-foreground">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                <p className="text-muted-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground">Member since {memberSinceDate}</p>
              </div>
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Eco Points Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="gradient-eco rounded-2xl p-6 text-primary-foreground"
            >
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="h-6 w-6" />
                <h2 className="text-xl font-bold">Eco-Points</h2>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-3xl font-bold">{user.ecoPoints.toLocaleString()}</p>
                  <p className="text-sm opacity-80">Available</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">₹{user.storeCredit}</p>
                  <p className="text-sm opacity-80">Store Credit</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{user.lifetimePoints.toLocaleString()}</p>
                  <p className="text-sm opacity-80">Lifetime</p>
                </div>
              </div>

              <Button
                variant="secondary"
                className="w-full"
                disabled={user.ecoPoints < 500}
                onClick={() => convertPointsToCredit(500)}
              >
                <Coins className="h-4 w-4 mr-2" />
                Convert 500 points → ₹100 Credit
              </Button>
              {user.ecoPoints < 500 && (
                <p className="text-xs text-center mt-2 opacity-80">
                  Earn {500 - user.ecoPoints} more points to convert
                </p>
              )}
            </motion.div>

            {/* Shopping Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Shopping Stats</h2>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Items in Cart</span>
                  <span className="font-semibold text-foreground">{items.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cart Value</span>
                  <span className="font-semibold text-foreground">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-muted-foreground text-sm">Cart Eco Impact</p>
                    <p className="text-sm text-foreground">Average eco-score</p>
                  </div>
                  {items.length > 0 ? (
                    <CircularProgress value={averageEcoScore} size={60} strokeWidth={5} />
                  ) : (
                    <span className="text-muted-foreground text-sm">No items</span>
                  )}
                </div>
              </div>

              {items.length > 0 && (
                <Button className="w-full mt-4 rounded-full" asChild>
                  <Link to="/cart">
                    View Cart
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </motion.div>
          </div>

          {/* How Eco-Points Work */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Award className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">How Eco-Points Work</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {howItWorks.map((item, index) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
