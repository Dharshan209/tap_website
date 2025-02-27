import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ErrorAlert, SuccessAlert } from '../components/ui/alert';
import Spinner from '../components/ui/spinner';

// FAQ data
const faqItems = [
  {
    question: "How does the TAP storybook creation process work?",
    answer: "Our process is simple! First, upload 10 images of your child's artwork to our platform. Then, our AI technology analyzes the artwork and generates a personalized story that connects all the images. Finally, we professionally print and bind your book before shipping it directly to your door."
  },
  {
    question: "How long does it take to receive my book after ordering?",
    answer: "Once your order is confirmed and your images are uploaded, it typically takes 7-10 business days for your book to be created, printed, and delivered to your address. International shipping may take longer depending on your location."
  },
  {
    question: "What type of artwork works best for creating a storybook?",
    answer: "Almost any type of artwork created by your child will work! Drawings, paintings, collages, and even crafts (photographed) can be used. The most important thing is that the images are clear and well-lit. We recommend selecting artwork that has clear subjects or elements that can inspire a story."
  },
  {
    question: "Can I preview the book before it's printed?",
    answer: "Yes! Before your book goes to print, you'll receive a digital proof that allows you to review the story and layout. You can request reasonable changes at this stage to ensure you're completely satisfied with the final product."
  },
  {
    question: "What age range is appropriate for TAP storybooks?",
    answer: "Our storybooks are perfect for children of all ages! The AI-generated stories adjust their complexity based on the age you provide during the ordering process. We've created books for children as young as 2 and as old as 12."
  },
  {
    question: "Do you offer bulk orders for schools or organizations?",
    answer: "Absolutely! We offer special pricing for schools, libraries, and other organizations looking to create multiple books. Please contact our support team directly for more information about bulk pricing and options."
  }
];

const ContactPage = () => {
  // State for form handling
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [formState, setFormState] = useState({
    isSubmitting: false,
    isSubmitted: false,
    error: null
  });
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      setFormState({
        ...formState,
        error: 'Please fill in all required fields'
      });
      return;
    }
    
    setFormState({
      ...formState,
      isSubmitting: true,
      error: null
    });
    
    try {
      // Simulate form submission with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success state
      setFormState({
        isSubmitting: false,
        isSubmitted: true,
        error: null
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
    } catch (error) {
      // Error state
      setFormState({
        isSubmitting: false,
        isSubmitted: false,
        error: 'There was an error submitting your message. Please try again.'
      });
    }
  };
  
  // Reset form after submission
  const handleReset = () => {
    setFormState({
      isSubmitting: false,
      isSubmitted: false,
      error: null
    });
  };
  
  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/5 to-background" />
        
        <div className="container-custom mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Contact <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Us</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8"
            >
              Have a question about our services or need assistance? We're here to help.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-16">
        <div className="container-custom mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Contact Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="bg-primary/10 text-primary h-12 w-12 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Address</h3>
                  <p className="text-muted-foreground">
                  77 Natukal Main road<br/>
                  Ponnamaravathy,TamilNadu-622407
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="bg-primary/10 text-primary h-12 w-12 rounded-full flex items-center justify-center mb-4">
                    <Phone className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Phone</h3>
                  <p className="text-muted-foreground">
                    <a href="tel:+12345678900" className="hover:text-primary transition-colors">
                    +91 6378920207
                    </a>
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Monday to Friday, 9am - 5pm EST
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="bg-primary/10 text-primary h-12 w-12 rounded-full flex items-center justify-center mb-4">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p className="text-muted-foreground">
                    <a href="mailto:info@turnartintopages.com" className="hover:text-primary transition-colors">
                    info@tapyourstory.in
                    </a>
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    We typically respond within 24 hours
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="bg-primary/10 text-primary h-12 w-12 rounded-full flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Business Hours</h3>
                  <p className="text-muted-foreground">
                    Monday - Friday: 9am - 5pm<br />
                    Saturday: 10am - 2pm<br />
                    Sunday: Closed
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-muted/30">
        <div className="container-custom mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
              <p className="text-muted-foreground mb-8">
                Have a question or feedback? Fill out the form below and our team will get back to you as soon as possible.
              </p>
              
              {/* Google Map Embed */}
              <div className="aspect-video rounded-lg overflow-hidden border border-border">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.1583091352!2d-74.11976373946229!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sin!4v1613457723468!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="TAP Office Location"
                ></iframe>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {formState.isSubmitted ? (
                <Card className="border-success/50">
                  <CardContent className="p-8">
                    <div className="text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success/20 text-success mb-4">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Message Sent Successfully!</h3>
                      <p className="text-muted-foreground mb-6">
                        Thank you for reaching out. We've received your message and will get back to you shortly.
                      </p>
                      <Button
                        onClick={handleReset}
                        variant="outline"
                      >
                        Send Another Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6">
                    {formState.error && (
                      <div className="mb-6">
                        <ErrorAlert 
                          title="Form Error" 
                          size="sm"
                        >
                          {formState.error}
                        </ErrorAlert>
                      </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name Input */}
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium mb-2">
                            Your Name <span className="text-danger">*</span>
                          </label>
                          <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="John Doe"
                          />
                        </div>
                        
                        {/* Email Input */}
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium mb-2">
                            Your Email <span className="text-danger">*</span>
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>
                      
                      {/* Subject Input */}
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium mb-2">
                          Subject
                        </label>
                        <input
                          id="subject"
                          name="subject"
                          type="text"
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full px-3 py-2 rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-primary/30"
                          placeholder="How can we help you?"
                        />
                      </div>
                      
                      {/* Message Input */}
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium mb-2">
                          Your Message <span className="text-danger">*</span>
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows="5"
                          className="w-full px-3 py-2 rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-primary/30"
                          placeholder="Please provide details about your inquiry..."
                        ></textarea>
                      </div>
                      
                      {/* Submit Button */}
                      <div>
                        <Button
                          type="submit"
                          variant="gradient"
                          disabled={formState.isSubmitting}
                          className="w-full"
                        >
                          {formState.isSubmitting ? (
                            <>
                              <Spinner size="sm" className="mr-2" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container-custom mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-lg">
              Find answers to common questions about our services and process
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
            {faqItems.map((item, index) => (
              <FaqItem 
                key={index} 
                question={item.question} 
                answer={item.answer} 
                index={index} 
              />
            ))}
          </div>
          
          <div className="text-center mt-10">
            <p className="text-muted-foreground mb-2">
              Still have questions?
            </p>
            <Button
              as="a"
              href="mailto:support@turnartintopages.com"
              variant="outline"
              className="rounded-full"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Customer Support
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

// FAQ Item Component
const FaqItem = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className={`transition-all duration-300 ${isOpen ? 'border-primary/50' : ''}`}>
        <CardContent className="p-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full text-left p-4 focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-md"
            aria-expanded={isOpen}
          >
            <h3 className="font-medium">{question}</h3>
            <div className={`h-6 w-6 rounded-full flex items-center justify-center border transition-transform ${isOpen ? 'border-primary text-primary rotate-45' : ''}`}>
              <span className="text-lg font-semibold leading-none">+</span>
            </div>
          </button>
          
          <div className={`overflow-hidden transition-all ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
            <div className="p-4 pt-0 border-t border-border">
              <p className="text-muted-foreground">{answer}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ContactPage;