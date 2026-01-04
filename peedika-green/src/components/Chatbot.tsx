import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Leaf, Sparkles, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { copilotAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { transformProduct, BackendProduct } from '@/types/product';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: any[];
  intent?: string;
  score?: number;
}

const quickActions = [
  'Recommend eco-friendly products',
  'Evaluate my cart',
  'Find greener alternatives',
];

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your sustainability assistant. How can I help you shop greener today? 🌿",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const location = useLocation();

  // Extract product ID from URL if on a product detail page
  const productIdMatch = location.pathname.match(/^\/product\/([^/]+)/);
  const currentProductId = productIdMatch ? productIdMatch[1] : undefined;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      if (!isAuthenticated) {
        // Not authenticated - provide helpful response
        const response: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Please sign in to get personalized eco-friendly recommendations and cart analysis! 🌱",
        };
        setMessages((prev) => [...prev, response]);
        setIsTyping(false);
        return;
      }

      const result = await copilotAPI.sendMessage(messageText, currentProductId);
      const data = result.data;

      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.aiMessage || data.response || data.message || "I'm here to help you shop sustainably!",
        products: data.products,
        intent: data.intent,
        score: data.score,
      };

      setMessages((prev) => [...prev, response]);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Sorry, I couldn't process that request. Please try again!";
      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessage,
      };
      setMessages((prev) => [...prev, response]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAddToCart = async (product: BackendProduct) => {
    const transformedProduct = transformProduct(product);
    await addToCart(transformedProduct, 1);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-eco shadow-xl flex items-center justify-center group',
          isOpen && 'hidden'
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="h-6 w-6 text-primary-foreground" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full flex items-center justify-center">
          <Sparkles className="h-2.5 w-2.5 text-primary" />
        </span>
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden"
          >
            {/* Header */}
            <div className="gradient-eco p-6 flex flex-col items-center relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-primary-foreground hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
              <div className="flex flex-col items-center gap-2">
                <img
                  src="/peedika.png"
                  alt="Peedika"
                  className="w-32 h-28 object-contain"
                />
                <span className="text-base font-semibold text-primary-foreground tracking-wide">AI Assistant</span>
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex flex-col',
                    message.role === 'user' ? 'items-end' : 'items-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] px-4 py-2.5 rounded-2xl text-sm',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-secondary text-secondary-foreground rounded-bl-md'
                    )}
                  >
                    {message.content}
                    
                    {/* Show cart score if available */}
                    {message.score !== undefined && (
                      <div className="mt-2 p-2 bg-primary/10 rounded-lg">
                        <span className="font-semibold">Cart Eco Score: {message.score}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Product recommendations */}
                  {message.products && message.products.length > 0 && (
                    <div className="mt-2 w-full space-y-2">
                      {message.products.slice(0, 3).map((product: any) => (
                        <div 
                          key={product._id}
                          className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg"
                        >
                          <img 
                            src={product.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=50&h=50&fit=crop'} 
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ₹{product.price} • Score: {product.eco_score}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => handleAddToCart(product)}
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-secondary text-secondary-foreground px-4 py-2.5 rounded-2xl rounded-bl-md">
                    <span className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => handleSend(action)}
                  className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-4 border-t border-border flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about sustainable shopping..."
                className="rounded-full"
              />
              <Button type="submit" size="icon" className="rounded-full flex-shrink-0" disabled={isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
