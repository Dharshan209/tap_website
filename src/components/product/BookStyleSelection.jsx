import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Palette, ImageIcon, Brush } from 'lucide-react';

const BookStyleSelection = ({ onStyleSelect, selectedStyle }) => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Choose Your Book Style</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select the style for your custom storybook before uploading artwork
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Realistic Option */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`p-6 rounded-xl border-2 cursor-pointer overflow-hidden ${
            selectedStyle === 'realistic' 
              ? 'border-primary bg-primary/5 shadow-md' 
              : 'border-muted hover:border-primary/50'
          }`}
          onClick={() => onStyleSelect('realistic')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-full ${
              selectedStyle === 'realistic' ? 'bg-primary/20' : 'bg-muted'
            }`}>
              <Brush className={`h-6 w-6 ${
                selectedStyle === 'realistic' ? 'text-primary' : 'text-muted-foreground'
              }`} />
            </div>
            <div className="text-right">
              <span className="text-xl font-bold">₹599</span>
            </div>
          </div>
          
          <h3 className="text-xl font-bold mb-2">Realistic Story</h3>
          <p className="text-muted-foreground mb-4">
            Professional quality with detailed AI-enhanced illustrations based on 10-15 artworks
          </p>
          
          <div className="relative h-64 mb-6 overflow-hidden rounded-lg border bg-background/40">
            <img 
              src="/src/assets/images/product1.png" 
              alt="Realistic Book Style Example" 
              className="object-cover w-full h-full transition-all hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="h-4 w-4 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm">10-15 images required</span>
            </div>
            <div className="flex items-center">
              <div className="h-4 w-4 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm">Maintains authentic style</span>
            </div>
            <div className="flex items-center">
              <div className="h-4 w-4 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm">20-page hardcover book</span>
            </div>
          </div>

          <button 
            className={`mt-6 w-full flex items-center justify-center rounded-md px-4 py-3 text-sm font-medium ${
              selectedStyle === 'realistic'
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Select Style <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </motion.div>
        
        {/* Animated Option */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`p-6 rounded-xl border-2 cursor-pointer overflow-hidden ${
            selectedStyle === 'animated' 
              ? 'border-primary bg-primary/5 shadow-md' 
              : 'border-muted hover:border-primary/50'
          }`}
          onClick={() => onStyleSelect('animated')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-full ${
              selectedStyle === 'animated' ? 'bg-primary/20' : 'bg-muted'
            }`}>
              <Palette className={`h-6 w-6 ${
                selectedStyle === 'animated' ? 'text-primary' : 'text-muted-foreground'
              }`} />
            </div>
            <div className="text-right">
              <span className="text-xl font-bold">₹599</span>
            </div>
          </div>
          
          <h3 className="text-xl font-bold mb-2">Animated Story</h3>
          <p className="text-muted-foreground mb-4">
            Colorful animated illustrations generated from a single character drawing
          </p>
          
          <div className="relative h-64 mb-6 overflow-hidden rounded-lg border bg-background/40">
            <img 
              src="/src/assets/images/product2.png" 
              alt="Animated Book Style Example" 
              className="object-cover w-full h-full transition-all hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="h-4 w-4 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm">Only 1 image required</span>
            </div>
            <div className="flex items-center">
              <div className="h-4 w-4 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm">Cartoon-style illustrations</span>
            </div>
            <div className="flex items-center">
              <div className="h-4 w-4 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm">16-page hardcover book</span>
            </div>
          </div>

          <button 
            className={`mt-6 w-full flex items-center justify-center rounded-md px-4 py-3 text-sm font-medium ${
              selectedStyle === 'animated'
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Select Style <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </motion.div>
      </div>
      
      {selectedStyle && (
        <div className="text-center mt-10">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-8 py-3 bg-primary rounded-md text-primary-foreground font-medium text-lg shadow-md hover:bg-primary/90 transition-colors"
            onClick={() => onStyleSelect(selectedStyle)}
          >
            Continue with {selectedStyle === 'realistic' ? 'Realistic' : 'Animated'} Style
            <ArrowRight className="ml-2 h-5 w-5 inline" />
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default BookStyleSelection;