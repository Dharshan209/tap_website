import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Sparkles, BookOpen } from 'lucide-react';

const HowItWorks = () => {
  // Steps data
  const steps = [
    {
      id: 1,
      title: 'Upload 10 Images',
      description: 'Select and upload 10 of your child\'s best artwork or drawings.',
      icon: <Upload className="h-10 w-10" />,
      color: 'bg-primary/10 text-primary',
    },
    {
      id: 2,
      title: 'AI Generates a Story',
      description: 'Our AI technology creates a personalized story based on the artwork.',
      icon: <Sparkles className="h-10 w-10" />,
      color: 'bg-secondary/10 text-secondary',
    },
    {
      id: 3,
      title: 'Get a Printed Book',
      description: 'Receive a professionally printed hardcover book delivered to your door.',
      icon: <BookOpen className="h-10 w-10" />,
      color: 'bg-accent/10 text-accent',
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
          <p className="text-muted-foreground mt-4">
            Creating a personalized storybook with your child's artwork is easy.
            Follow these simple steps to transform their creativity into a keepsake.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
        >
          {steps.map((step) => (
            <motion.div
              key={step.id}
              variants={itemVariants}
              className="flex flex-col items-center text-center"
            >
              {/* Step Number */}
              <div className="relative mb-6">
                <div className={`flex items-center justify-center w-20 h-20 rounded-full ${step.color}`}>
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-sm font-bold">{step.id}</span>
                </div>
              </div>

              {/* Step Content */}
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Path Connector (visible on desktop) */}
        <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-border z-0" />
      </div>
    </section>
  );
};

export default HowItWorks;