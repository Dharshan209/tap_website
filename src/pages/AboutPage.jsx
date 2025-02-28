import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Book, Sparkles, Heart, Award, Users, ArrowRight, Target, Rocket } from 'lucide-react';

const CoreValueCard = ({ icon, title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
    className="bg-background border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
  >
    <div className="bg-primary/10 text-primary h-12 w-12 rounded-full flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </motion.div>
);

const AboutPage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-background" />
        
        <div className="container-custom mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Transforming <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Creativity</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8"
            >
              Empowering families to turn children's artwork into lasting memories through innovative AI technology
            </motion.p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16">
        <div className="container-custom mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-6">Our Journey</h2>
              <div className="space-y-4 text-lg">
                <p>
                  TAP – Turn Art into Pages was born from a simple yet powerful observation: every child's artwork tells a unique story waiting to be told.
                </p>
                <p>
                  Founded in 2023 by a team passionate about preserving childhood creativity, we believe that every crayon stroke, paint splatter, and pencil line represents a moment of pure imagination.
                </p>
                <p>
                  Our mission is to transform these fleeting moments into timeless keepsakes. By combining advanced AI technology with professional printing, we create personalized storybooks that celebrate each child's artistic journey.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="/assets/images/About.png" 
                  alt="Children creating art" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x600?text=Our+Story';
                  }}
                />
              </div>
              
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/10 rounded-xl -z-10" />
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-accent/10 rounded-full -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 bg-muted/30">
        <div className="container-custom mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Guiding Principles</h2>
            <p className="text-muted-foreground text-lg">
              The foundational beliefs that drive every aspect of our mission
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <CoreValueCard 
              icon={<Target className="h-6 w-6" />}
              title="Innovation"
              description="Continuously pushing the boundaries of technology to create meaningful experiences for families."
            />
            <CoreValueCard 
              icon={<Rocket className="h-6 w-6" />}
              title="Imagination"
              description="Believing in the boundless creativity of children and their unique storytelling abilities."
            />
            <CoreValueCard 
              icon={<Heart className="h-6 w-6" />}
              title="Connection"
              description="Strengthening family bonds by preserving and celebrating childhood creativity."
            />
            <CoreValueCard 
              icon={<Award className="h-6 w-6" />}
              title="Quality"
              description="Delivering professional-grade storybooks that become cherished family heirlooms."
            />
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/5 to-accent/5" />
        
        <div className="container-custom mx-auto relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold mb-6"
            >
              Ready to Preserve Your Child's Creativity?
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8"
            >
              Start creating a personalized storybook that captures the magic of childhood imagination.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/product"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                Create Your Book
                <Book className="ml-2 h-4 w-4" />
              </Link>
              
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Contact Us
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;