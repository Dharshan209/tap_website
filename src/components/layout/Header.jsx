import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../ui/theme-provider';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { Menu, X, Sun, Moon, ShoppingCart, User, ChevronDown, LogOut, ShoppingBag, Settings, Crown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { cartItems, cartTotal, isCartEmpty } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // Handle scrolling effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const goToCart = () => navigate('/cart');
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Header variants for animation
  const headerVariants = {
    visible: { 
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.3,
        ease: "easeInOut" 
      }
    },
    hidden: { 
      opacity: 0,
      y: -20,
      transition: { 
        duration: 0.3,
        ease: "easeInOut" 
      }
    }
  };

  // Mobile menu variants for animation
  const mobileMenuVariants = {
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        staggerChildren: 0.07,
        delayChildren: 0.1
      }
    },
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05,
        staggerDirection: -1,
        when: "afterChildren"
      }
    }
  };

  const menuItemVariants = {
    open: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    },
    closed: {
      y: 20,
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  // Dropdown menu variants
  const dropdownVariants = {
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    closed: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <motion.header 
      initial="visible"
      animate="visible"
      variants={headerVariants}
      className={cn(
        "sticky top-0 z-50 w-full backdrop-blur transition-all duration-300",
        isScrolled 
          ? "bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm" 
          : "bg-transparent"
      )}
    >
      <div className="container-custom mx-auto">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative overflow-hidden transition-all duration-300 shadow-sm group-hover:shadow-md">
              <img 
                src="/assets/images/logo.png" 
                alt="TAP Logo" 
                className="h-10 md:h-12 w-auto object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="text-sm md:text-base font-medium hidden sm:inline-block">Turn Art into Pages</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/product">Create Book</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </Button>

            {/* Cart Button */}
            <div className="relative">
              <Button
                onClick={goToCart}
                variant="ghost"
                size="icon-sm"
                className="rounded-full"
                aria-label="Cart"
              >
                <ShoppingCart size={18} />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {cartItems.length}
                  </span>
                )}
              </Button>
            </div>

            {/* User Menu */}
            {user ? (
              <div className="relative user-menu-container" ref={userMenuRef}>
                <Button
                  onClick={toggleUserMenu}
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-1 rounded-full"
                  aria-label="User menu"
                  aria-expanded={isUserMenuOpen}
                >
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="h-8 w-8 rounded-full object-cover border-2 border-primary/20" 
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User size={16} />
                    </div>
                  )}
                  <span className="hidden md:inline-block text-sm font-medium max-w-[100px] truncate">
                    {user.displayName || 'Account'}
                  </span>
                  <ChevronDown size={16} className={cn(
                    "transition-transform duration-200",
                    isUserMenuOpen && "rotate-180"
                  )} />
                </Button>
                
                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div 
                      initial="closed"
                      animate="open"
                      exit="closed"
                      variants={dropdownVariants}
                      className="absolute right-0 mt-2 w-56 origin-top-right bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden"
                    >
                      {/* User info */}
                      <div className="p-3 border-b border-border bg-muted/50">
                        <div className="flex items-center space-x-3">
                          {user.photoURL ? (
                            <img 
                              src={user.photoURL} 
                              alt={user.displayName || 'User profile'} 
                              className="h-10 w-10 rounded-full object-cover border-2 border-background" 
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              <User size={20} />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">
                              {user.displayName || 'User'}
                            </span>
                            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu links */}
                      <div className="py-1">
                        <MenuItem 
                          to="/profile" 
                          icon={<User size={16} />}
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Your Profile
                        </MenuItem>
                        
                        <MenuItem 
                          to="/profile?tab=orders" 
                          icon={<ShoppingBag size={16} />}
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Order History
                        </MenuItem>
                        
                        <MenuItem 
                          to="/profile?tab=settings" 
                          icon={<Settings size={16} />}
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Account Settings
                        </MenuItem>
                        
                        {isAdmin && (
                          <MenuItem 
                            to="/admin" 
                            icon={<Crown size={16} />}
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Admin Dashboard
                          </MenuItem>
                        )}
                        
                        <div className="border-t border-border mt-1 pt-1">
                          <button
                            onClick={() => {
                              logout();
                              setIsUserMenuOpen(false);
                            }}
                            className="flex w-full items-center px-4 py-2 text-sm text-danger hover:bg-muted"
                          >
                            <LogOut size={16} className="mr-2" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:block">
                <Link to="/login">
                  <Button
                    variant="gradient"
                    size="sm"
                    className="rounded-full"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
            
            {/* Mobile Menu Button */}
            <Button
              className="md:hidden"
              variant="ghost"
              size="icon-sm"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial="closed"
              animate="open"
              exit="closed"
              variants={mobileMenuVariants}
              className="md:hidden overflow-hidden border-t border-border"
            >
              <motion.nav className="flex flex-col py-4 space-y-1">
                <MobileMenuItem 
                  to="/" 
                  onClick={() => setIsMenuOpen(false)}
                  variants={menuItemVariants}
                >
                  Home
                </MobileMenuItem>
                
                <MobileMenuItem 
                  to="/product" 
                  onClick={() => setIsMenuOpen(false)}
                  variants={menuItemVariants}
                >
                  Create Book
                </MobileMenuItem>
                
                <MobileMenuItem 
                  to="/about" 
                  onClick={() => setIsMenuOpen(false)}
                  variants={menuItemVariants}
                >
                  About
                </MobileMenuItem>
                
                <MobileMenuItem 
                  to="/contact" 
                  onClick={() => setIsMenuOpen(false)}
                  variants={menuItemVariants}
                >
                  Contact
                </MobileMenuItem>
                
                <MobileMenuItem 
                  to="/cart" 
                  onClick={() => setIsMenuOpen(false)}
                  variants={menuItemVariants}
                >
                  <div className="flex items-center">
                    Cart 
                    <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                      {cartItems.length}
                    </span>
                  </div>
                </MobileMenuItem>
                
                {!user ? (
                  <motion.div variants={menuItemVariants} className="pt-2">
                    <Link to="/login">
                      <Button
                        variant="gradient"
                        className="w-full rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign In
                      </Button>
                    </Link>
                  </motion.div>
                ) : (
                  <>
                    <MobileMenuItem 
                      to="/profile" 
                      onClick={() => setIsMenuOpen(false)}
                      variants={menuItemVariants}
                    >
                      Your Profile
                    </MobileMenuItem>
                    
                    {isAdmin && (
                      <MobileMenuItem 
                        to="/admin" 
                        onClick={() => setIsMenuOpen(false)}
                        variants={menuItemVariants}
                      >
                        Admin Dashboard
                      </MobileMenuItem>
                    )}
                    
                    <motion.div variants={menuItemVariants} className="pt-2">
                      <Button
                        variant="outline"
                        className="w-full text-danger border-danger/20 hover:bg-danger/10"
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                      >
                        <LogOut size={16} className="mr-2" />
                        Sign Out
                      </Button>
                    </motion.div>
                  </>
                )}
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

// Custom desktop nav link component
const NavLink = ({ to, children }) => {
  return (
    <Link
      to={to}
      className="relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary group"
    >
      {children}
      <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-primary to-accent transition-all group-hover:w-full" />
    </Link>
  );
};

// Custom mobile menu item component
const MobileMenuItem = ({ to, onClick, children, variants }) => {
  return (
    <motion.div variants={variants}>
      <Link
        to={to}
        className="flex items-center text-sm font-medium p-3 hover:bg-muted rounded-lg transition-colors"
        onClick={onClick}
      >
        {children}
      </Link>
    </motion.div>
  );
};

// Custom dropdown menu item component
const MenuItem = ({ to, icon, onClick, children }) => {
  return (
    <Link
      to={to}
      className="flex items-center px-4 py-2 text-sm hover:bg-muted transition-colors"
      onClick={onClick}
    >
      {icon && <span className="mr-2 text-muted-foreground">{icon}</span>}
      {children}
    </Link>
  );
};

export default Header;