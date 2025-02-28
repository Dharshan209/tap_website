import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AnimatedBook = () => {
  const [isBookOpen, setIsBookOpen] = useState(false);
  
  const toggleBook = () => {
    setIsBookOpen(!isBookOpen);
  };

  return (
    <div 
      className="relative w-full max-w-lg md:max-w-xl lg:max-w-2xl perspective cursor-pointer" 
      onClick={toggleBook}
      aria-label="Click to open book"
    >
      {/* Book cover */}
      <motion.div
        className="relative z-20 transform-3d rounded-xl overflow-hidden border border-border/40"
        animate={{
          rotateY: isBookOpen ? '-160deg' : '0deg',
        }}
        transition={{
          type: "spring",
          stiffness: 80,
          damping: 12
        }}
        style={{
          transformOrigin: 'left center',
        }}
      >
        <div className="aspect-[5/4] w-full bg-gradient-to-r from-primary/30 to-accent/30 flex items-center justify-center">
          <div className="absolute inset-0 bg-shine bg-[length:200%_100%] animate-background-shine opacity-50"></div>
          <img 
            src="/assets/images/s2.png" 
            alt="Book cover" 
            className="w-full h-full object-cover relative z-10"
          />
        </div>
        
        {/* Book spine effect */}
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/20 to-transparent"></div>
      </motion.div>
      
      {/* Right page (visible when book opens) */}
      <motion.div
        className="absolute inset-0 rounded-xl overflow-hidden border border-border/40 bg-white"
        initial={{ z: 10 }}
        animate={{ z: isBookOpen ? 15 : 10 }}
        style={{
          transformOrigin: 'left center'
        }}
      >
        <div className="h-full w-full relative">
          <img 
            src="/assets/images/s1.png" 
            alt="Inside of storybook with child's artwork" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmMGYyZjUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIyNCIgZmlsbD0iaHNsKHZhcigtLXByaW1hcnkpKSI+U3RvcnlCb29rIFBhZ2U8L3RleHQ+PC9zdmc+';
            }}
          />
        </div>
        
        {/* Page shadow/fold effect */}
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/10 to-transparent"></div>
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/30 to-transparent"></div>
      </motion.div>
      
      {/* Book base/shadow */}
      <div className="absolute inset-x-10 -bottom-6 h-6 rounded-b-xl bg-gradient-to-r from-primary/40 to-accent/40 blur-sm"></div>
      <div className="absolute inset-x-14 -bottom-10 h-6 rounded-b-xl bg-gradient-to-r from-primary/20 to-accent/20 blur-md"></div>
      
      {/* Decorative elements */}
      <motion.div 
        className="absolute -right-8 -top-8 z-30 w-24 h-24 glass-effect rounded-xl rotate-12 flex items-center justify-center shadow-lg pointer-events-none"
        animate={{ 
          y: [0, -10, 0],
          rotate: [12, 8, 12]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 4,
          ease: "easeInOut"
        }}
      >
        <img 
          src="/assets/images/c1.jpg"
          alt="Child's artwork" 
          className="w-16 h-16 object-cover rounded-lg" 
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJoc2woMjUyLDk1JSw1OCUpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiNmZmYiPkFydDwvdGV4dD48L3N2Zz4=';
          }}
        />
      </motion.div>
      
      <motion.div 
        className="absolute -left-8 bottom-4 z-30 w-32 h-16 glass-effect rounded-xl -rotate-12 flex items-center justify-center shadow-lg pointer-events-none"
        animate={{ 
          y: [0, -8, 0],
          rotate: [-12, -8, -12]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 5,
          ease: "easeInOut",
          delay: 0.5
        }}
      >
        <span className="font-medium text-lg bg-gradient-highlight bg-clip-text text-transparent">Magic!</span>
      </motion.div>
    </div>
  );
};

export default AnimatedBook;