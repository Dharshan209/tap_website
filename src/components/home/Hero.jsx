import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { ArrowRight, Sparkles, BookOpen, Palette } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 bg-grid-pattern" />
      
      {/* Background blobs for light/dark modes */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-blob" style={{ animationDelay: '6s' }}></div>
      </div>

      <div className="container-custom mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium"
            >
              <Sparkles size={14} className="animate-pulse-slow" />
              <span>AI-powered storybooks</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight"
            >
              Turn 
              <span className="relative mx-2">
                <span className="relative z-10 bg-gradient-highlight bg-clip-text text-transparent">Art</span>
                <span className="absolute -bottom-1.5 left-0 w-full h-4 md:h-5 bg-secondary/30 -rotate-1 dark:bg-secondary/20 rounded-sm -z-10"></span>
              </span>
              <br className="hidden md:block" />
              into magical 
              <span className="relative mx-2">
                <span className="relative z-10 bg-gradient-highlight bg-clip-text text-transparent">Pages</span>
                <span className="absolute -bottom-1.5 left-0 w-full h-4 md:h-5 bg-accent/30 rotate-1 dark:bg-accent/20 rounded-sm -z-10"></span>
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl"
            >
              Transform your child's artwork into beautifully illustrated storybooks they'll cherish forever. Our AI technology creates personalized stories from your uploaded images.
            </motion.p>
            
            {/* Features list */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 space-y-3"
            >
              <FeatureItem icon={<Palette size={18} />}>
                Upload any artwork your child creates
              </FeatureItem>
              <FeatureItem icon={<Sparkles size={18} />}>
                AI generates a unique story based on the art
              </FeatureItem>
              <FeatureItem icon={<BookOpen size={18} />}>
                Receive a beautiful printed storybook
              </FeatureItem>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <Button
                asChild
                variant="gradient"
                size="lg"
                className="rounded-xl shadow-lg group"
                glow="true"
              >
                <Link to="/product">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-xl"
              >
                <Link to="/about">
                  Learn More
                </Link>
              </Button>
            </motion.div>
            
            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-12 flex items-center gap-4"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-background bg-primary/10 text-primary flex items-center justify-center text-xs font-bold`}>
                    {i}
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">1,000+</span> happy families have created books
              </div>
            </motion.div>
          </div>
          
          {/* Image/3D Book Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-lg md:max-w-xl lg:max-w-2xl perspective">
              {/* Main book mockup */}
              <div className="relative z-10 transform-3d rotate-y-6 rotate-x-12 shadow-2xl rounded-xl overflow-hidden border border-border/40">
                <div className="aspect-[5/4] w-full bg-card overflow-hidden">
                  <div className="h-full w-full relative bg-gradient-to-r from-primary/10 to-accent/10 flex items-center justify-center">
                    <div className="absolute inset-0 bg-shine bg-[length:200%_100%] animate-background-shine opacity-50"></div>
                    <img 
                      src="/assets/images/hero-book-cover.jpg" 
                      alt="Children's storybook created from artwork" 
                      className="w-full h-full object-cover relative z-10 transition-opacity duration-500"
                      loading="eager"
                      onLoad={(e) => {
                        e.target.classList.add('opacity-100');
                      }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/800x640?text=TAP+Book+Example';
                        e.target.classList.add('opacity-100');
                      }}
                      style={{ opacity: 0 }}
                    />
                  </div>
                </div>
                
                {/* Book spine effect */}
                <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/20 to-transparent"></div>
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-l from-black/20 to-transparent"></div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -right-8 -top-8 z-20 w-24 h-24 glass-effect rounded-xl rotate-12 flex items-center justify-center shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                <img 
                  src="/assets/images/child-art-sample.jpg"
                  alt="Child's artwork" 
                  className="w-16 h-16 object-cover rounded-lg" 
                  loading="eager"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJoc2woMjUyLDk1JSw1OCUpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiNmZmYiPkFydDwvdGV4dD48L3N2Zz4=';
                  }}
                />
              </div>
              
              <div className="absolute -left-8 bottom-4 z-20 w-32 h-16 glass-effect rounded-xl -rotate-12 flex items-center justify-center shadow-lg animate-float" style={{ animationDelay: '0.5s' }}>
                <span className="font-medium text-lg bg-gradient-highlight bg-clip-text text-transparent">Magic!</span>
              </div>
              
              {/* Stacked books illusion */}
              <div className="absolute inset-x-10 -bottom-6 h-6 rounded-b-xl bg-gradient-to-r from-primary/40 to-accent/40 blur-sm -z-10"></div>
              <div className="absolute inset-x-14 -bottom-10 h-6 rounded-b-xl bg-gradient-to-r from-primary/20 to-accent/20 blur-md -z-20"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Feature item with icon
const FeatureItem = ({ icon, children }) => (
  <div className="flex items-start space-x-3">
    <div className="flex-shrink-0 mt-1">
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
    </div>
    <span className="text-base">{children}</span>
  </div>
);

export default Hero;