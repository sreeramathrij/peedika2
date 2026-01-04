import { Link } from 'react-router-dom';
import { Leaf, Mail, Instagram, Twitter, Facebook, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img
                src="/peedika.png"
                alt="Peedika Logo"
                className="w-44 h-40 object-contain"
              />
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Shop sustainably. Every purchase makes a difference for our planet.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary hover:text-primary-foreground">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary hover:text-primary-foreground">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary hover:text-primary-foreground">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary hover:text-primary-foreground">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['Products', 'Categories', 'About Us', 'Contact'].map((link) => (
                <li key={link}>
                  <Link
                    to={`/${link.toLowerCase().replace(' ', '-')}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2">
              {['FAQ', 'Shipping', 'Returns', 'Privacy Policy', 'Terms of Service'].map((link) => (
                <li key={link}>
                  <Link
                    to="/"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Stay Updated</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe for sustainable living tips and exclusive offers.
            </p>
            <form className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Your email"
                  className="pl-10 rounded-full"
                />
              </div>
              <Button type="submit" className="rounded-full px-6">
                Join
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Peedika. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Leaf className="h-4 w-4 text-primary" />
            <span>Committed to carbon-neutral shipping</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
