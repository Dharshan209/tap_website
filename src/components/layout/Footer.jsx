import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Heart, ArrowUp, MapPin, Phone, Globe } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="relative border-t border-border overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10 bg-muted/50" />
      
      {/* Scroll to top button */}
      <div className="container-custom mx-auto relative">
        <div className="absolute right-4 md:right-6 -top-6">
          <Button 
            onClick={scrollToTop} 
            size="icon" 
            variant="secondary"
            className="rounded-full shadow-lg"
            aria-label="Scroll to top"
          >
            <ArrowUp size={18} />
          </Button>
        </div>
      </div>
      
      {/* Decorative wave */}
      <div className="relative h-10 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <svg className="absolute bottom-0 w-full h-10 text-background" viewBox="0 0 1440 74" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 24L60 34C120 44 240 64 360 68C480 72 600 60 720 46C840 32 960 16 1080 14C1200 12 1320 24 1380 30L1440 36V74H1380C1320 74 1200 74 1080 74C960 74 840 74 720 74C600 74 480 74 360 74C240 74 120 74 60 74H0V24Z" fill="currentColor" />
        </svg>
      </div>
      
      {/* Main footer content */}
      <div className="bg-background pt-16 pb-12">
        <div className="container-custom mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-8 md:gap-12">
            {/* Brand Column */}
            <div className="md:col-span-2 lg:col-span-4">
              <Link to="/" className="inline-block">
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  TAP
                </span>
              </Link>
              
              <p className="mt-6 text-base text-muted-foreground max-w-md">
                Turn your child's artwork into a professionally printed storybook. 
                Preserve their creativity and imagination forever with our AI-powered platform.
              </p>
              
              <div className="mt-8 flex space-x-2">
                <FooterSocialLink 
                  href="https://www.facebook.com/tapyourstory" 
                  icon={<Facebook size={18} />} 
                  label="Facebook" 
                />
                <FooterSocialLink 
                  href="https://www.instagram.com/tapyourstory" 
                  icon={<Instagram size={18} />} 
                  label="Instagram" 
                />
                <FooterSocialLink 
                  href="https://www.twitter.com/tapyourstory" 
                  icon={<Twitter size={18} />} 
                  label="Twitter" 
                />
                <FooterSocialLink 
                  href="mailto:info@tapyourstory.in" 
                  icon={<Mail size={18} />} 
                  label="Email" 
                />
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-2 lg:col-span-2">
              <h3 className="text-base font-semibold">Quick Links</h3>
              <ul className="mt-6 space-y-4">
                <FooterLink to="/">Home</FooterLink>
                <FooterLink to="/product">Create Book</FooterLink>
                <FooterLink to="/about">About Us</FooterLink>
                <FooterLink to="/contact">Contact</FooterLink>
              </ul>
            </div>

            {/* Legal */}
            <div className="md:col-span-2 lg:col-span-2">
              <h3 className="text-base font-semibold">Legal</h3>
              <ul className="mt-6 space-y-4">
                <FooterLink to="/legal" onClick={() => localStorage.setItem('legalSection', 'terms')}>Terms of Service</FooterLink>
                <FooterLink to="/legal" onClick={() => localStorage.setItem('legalSection', 'privacy')}>Privacy Policy</FooterLink>
                <FooterLink to="/legal" onClick={() => localStorage.setItem('legalSection', 'refund')}>Refund Policy</FooterLink>
                <FooterLink to="/faq">FAQ</FooterLink>
              </ul>
            </div>

            {/* Contact */}
            <div className="md:col-span-2 lg:col-span-4">
              <h3 className="text-base font-semibold">Contact Us</h3>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start space-x-3">
                  <MapPin size={18} className="flex-shrink-0 text-secondary mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                  77 Natukal Main road<br/>
                  Ponnamaravathy,TamilNadu-622407
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <Phone size={18} className="flex-shrink-0 text-secondary" />
                  <a 
                    href="tel:+916378920207" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                     +91 6378920207
                  </a>
                </li>
                <li className="flex items-center space-x-3">
                  <Mail size={18} className="flex-shrink-0 text-secondary" />
                  <a 
                    href="mailto:info@tapyourstory.in" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    info@tapyourstory.in
                  </a>
                </li>
                <li className="flex items-center space-x-3">
                  <Globe size={18} className="flex-shrink-0 text-secondary" />
                  <a 
                    href="https://www.tapyourstory.in" 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    www.tapyourstory.in
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="mt-16 mb-12 p-6 bg-muted/50 border border-border rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium">Join our newsletter</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get updates on new features, promotions, and creative inspiration for your next book.
                </p>
              </div>
              <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Your email address"
                  className="input flex-grow"
                  aria-label="Email address"
                  required
                />
                <Button 
                  type="submit" 
                  variant="gradient" 
                  className="whitespace-nowrap"
                >
                  Subscribe
                </Button>
              </form>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {currentYear} TAP Your Story. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground mt-4 md:mt-0 flex items-center">
              Made with <Heart size={14} className="mx-1 text-danger animate-pulse-slow" /> for creative families everywhere
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Footer link component
const FooterLink = ({ to, children }) => (
  <li>
    <Link 
      to={to} 
      className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block"
    >
      {children}
    </Link>
  </li>
);

// Footer social link component
const FooterSocialLink = ({ href, icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-center h-10 w-10 rounded-full bg-muted/80 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
    aria-label={label}
  >
    {icon}
  </a>
);

export default Footer;