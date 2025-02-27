import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

// Sample testimonials data
const testimonials = [
  {
    id: 1,
    quote: "My daughter was absolutely thrilled when she saw her drawings transformed into a real storybook. The AI-generated story was creative and captured her imagination perfectly!",
    author: "Sarah Johnson",
    role: "Mother of Emma, 7",
    avatar: "/assets/images/passport.png",
  },
  {
    id: 2,
    quote: "What an incredible way to preserve my son's artwork! The quality of the printed book exceeded my expectations, and the story woven around his drawings was magical.",
    author: "Michael Chen",
    role: "Father of Lucas, 5",
    avatar: "/assets/images/passport.png",
  },
  {
    id: 3,
    quote: "TAP created the perfect birthday gift for my niece. She loves reading 'her book' every night, and it's helped boost her confidence in her artistic abilities too.",
    author: "Rebecca Taylor",
    role: "Aunt of Sophia, 8",
    avatar: "/assets/images/passport.png",
  },
  {
    id: 4,
    quote: "As a teacher, I've recommended TAP to many parents. It's a wonderful way to encourage creativity and develop a love for reading. The books are absolutely beautiful.",
    author: "David Rodriguez",
    role: "Elementary School Teacher",
    avatar: "/assets/images/passport.png",
  },
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">What Our Customers Say</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl">
            Don't just take our word for it. Hear from families who have transformed their children's artwork into lasting memories.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Testimonial Cards */}
          <div className="relative h-[320px] md:h-[280px] overflow-hidden">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className="absolute inset-0 flex flex-col items-center bg-background border border-border rounded-xl p-6 md:p-8 shadow-sm"
                initial={{ opacity: 0, x: 100 }}
                animate={{
                  opacity: index === activeIndex ? 1 : 0,
                  x: index === activeIndex ? 0 : 100,
                  zIndex: index === activeIndex ? 10 : 0,
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {/* Quote Icon */}
                <div className="bg-primary/10 text-primary p-3 rounded-full mb-6">
                  <Quote className="h-6 w-6" />
                </div>

                {/* Quote Text */}
                <p className="text-lg text-center mb-6 max-w-3xl">"{testimonial.quote}"</p>

                {/* Author */}
                <div className="flex items-center mt-auto">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.author}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold">{testimonial.author}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-center items-center space-x-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="p-2 rounded-full bg-background border border-border hover:bg-muted transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {/* Dots Indicator */}
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full ${
                    index === activeIndex ? 'bg-primary' : 'bg-border'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            
            <button
              onClick={nextTestimonial}
              className="p-2 rounded-full bg-background border border-border hover:bg-muted transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;