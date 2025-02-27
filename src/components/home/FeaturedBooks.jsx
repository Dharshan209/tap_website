import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Sample featured books data
const featuredBooks = [
  {
    id: 'book1',
    title: "Emma's Space Adventure",
    theme: 'Space',
    price: 499,
    image: '/assets/images/f2.png',
  },
  {
    id: 'book2',
    title: "Noah's Dinosaur Discovery",
    theme: 'Dinosaurs',
    price: 499,
    image: '/assets/images/f3.png',
  },
  {
    id: 'book3',
    title: "Lily's Magical Forest",
    theme: 'Fantasy',
    price: 499,
    image: '/assets/images/f4.png',
  },
  {
    id: 'book4',
    title: "Max's Superhero Journey",
    theme: 'Superheroes',
    price: 499,
    image: '/assets/images/f5.png',
  },
];

const FeaturedBooks = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Featured Books</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl">
            Browse through our collection of custom storybooks created by families just like yours.
            Each book is uniquely crafted to match your child's imagination.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {featuredBooks.map((book) => (
            <motion.div
              key={book.id}
              variants={itemVariants}
              className="bg-background border border-border rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-primary/50 group"
            >
              {/* Book Cover Image */}
              <div className="aspect-[3/4] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10" />
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-3 left-3 z-20">
                  <span className="px-2 py-1 bg-primary/80 text-primary-foreground text-xs font-medium rounded-full">
                    {book.theme}
                  </span>
                </div>
              </div>

              {/* Book Details */}
              <div className="p-4">
                <h3 className="font-semibold truncate">{book.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-medium">@{book.price.toFixed(2)}</span>
                  <Link
                    to="/product"
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    Create Similar
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="flex justify-center mt-10">
          <Link
            to="/product"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Create Your Own Book
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBooks;