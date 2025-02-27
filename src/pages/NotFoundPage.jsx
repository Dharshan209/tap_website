import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Book } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-4"
    >
      <div className="p-4 rounded-full bg-primary/10 text-primary mb-6">
        <Book className="h-12 w-12" />
      </div>
      
      <h1 className="text-4xl font-bold tracking-tight mb-2 text-center">
        Page Not Found
      </h1>
      
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        Oops! The page you're looking for seems to have gone on its own adventure.
        Let's get you back on track.
      </p>
      
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <Home className="mr-2 h-4 w-4" />
          Return Home
        </Link>
        
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </button>
      </div>
    </motion.div>
  );
};

export default NotFoundPage;