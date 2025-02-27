import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ShieldCheck, RefreshCw } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const LegalPage = () => {
  const [activeSection, setActiveSection] = useState('terms');
  const location = useLocation();
  
  useEffect(() => {
    // Check URL query params
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    
    // Check localStorage
    const storedSection = localStorage.getItem('legalSection');
    
    // Set section based on query param or localStorage
    if (section && ['terms', 'privacy', 'refund'].includes(section)) {
      setActiveSection(section);
    } else if (storedSection && ['terms', 'privacy', 'refund'].includes(storedSection)) {
      setActiveSection(storedSection);
      // Clear localStorage after using it
      localStorage.removeItem('legalSection');
    }
  }, [location]);

  const sectionVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.4,
        ease: "easeInOut" 
      }
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'terms':
        return (
          <motion.div 
            key="terms"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-3xl font-bold mb-6">Terms of Service</h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="text-sm text-right">Last Updated: February 27, 2025</p>
              
              <p>Welcome to TAP (Turn Art into Pages). These Terms of Service ("Terms") govern your use of our website, mobile application, and services. By accessing or using our services, you agree to be bound by these Terms. If you do not agree with any part of these Terms, you may not use our services.</p>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">1. Services Overview</h3>
              <p>TAP provides a platform that allows users to transform children's artwork into personalized storybooks through our website and mobile application. Our services include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Accepting user-uploaded artwork and content</li>
                <li>Creating personalized storybooks based on uploaded content</li>
                <li>Providing digital proofs for user review</li>
                <li>Printing and delivering physical storybooks</li>
                <li>Offering digital versions of storybooks</li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">2. Account Registration</h3>
              <p>To use certain features of our services, you may need to create an account. When creating an account, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the confidentiality of your password</li>
                <li>Take responsibility for all activities that occur under your account</li>
                <li>Promptly notify us of any unauthorized use of your account or security breaches</li>
              </ul>
              <p>We reserve the right to suspend or terminate accounts that violate these Terms.</p>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">3. User Content and Licenses</h3>
              <p>When you upload content to our platform, including artwork, images, text, and other materials ("User Content"):</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You retain ownership of your User Content</li>
                <li>You grant TAP a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute your User Content for the purpose of providing our services</li>
                <li>You represent and warrant that you have the right to grant this license and that your User Content does not violate any third party's intellectual property or other rights</li>
                <li>You acknowledge that User Content may be processed by AI technology to create storybooks</li>
                <li>You are responsible for the legality, reliability, and appropriateness of all User Content</li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">4. Intellectual Property Rights</h3>
              <p>The TAP platform, including our website, mobile application, branding, logos, designs, and technology, is protected by copyright, trademark, and other intellectual property laws:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All content created by TAP, including AI-generated stories, illustrations, and book designs, is the intellectual property of TAP</li>
                <li>The final book product combines your User Content with our creative elements, resulting in a co-created work</li>
                <li>You may not copy, modify, distribute, or create derivative works from our content without explicit permission</li>
                <li>The personal storybook created for you is for personal use only and may not be commercially reproduced or distributed</li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">5. Payment Terms</h3>
              <p>By making a purchase through our platform, you agree to the following payment terms:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All prices are in Indian Rupees (₹) unless otherwise specified</li>
                <li>Payment is required at the time of order</li>
                <li>We accept various payment methods through our secure payment processors</li>
                <li>Prices are subject to change, but changes will not affect orders already placed</li>
                <li>All applicable taxes and shipping fees will be clearly displayed before checkout</li>
                <li>Refunds are subject to our Refund Policy</li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">6. Prohibited Activities</h3>
              <p>You agree not to engage in any of the following activities:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Using our services for any illegal purpose</li>
                <li>Uploading content that infringes on intellectual property rights</li>
                <li>Uploading content that is offensive, harmful, or inappropriate for children</li>
                <li>Attempting to gain unauthorized access to our systems or user accounts</li>
                <li>Using automated systems or software to extract data from our website</li>
                <li>Interfering with the proper working of our services</li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">7. Limitation of Liability</h3>
              <p>To the maximum extent permitted by law:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>TAP provides its services "as is" and "as available" without warranties of any kind</li>
                <li>We are not liable for any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Our total liability for any claims arising from these Terms shall not exceed the amount you paid for the specific service giving rise to the claim</li>
                <li>We are not responsible for delays or failures in performance due to circumstances beyond our reasonable control</li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">8. Indemnification</h3>
              <p>You agree to indemnify, defend, and hold harmless TAP and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, costs, or expenses, including legal fees, arising from:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your use of our services</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another person or entity</li>
                <li>Your User Content</li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">9. Modifications to Terms</h3>
              <p>We reserve the right to modify these Terms at any time. We will notify users of material changes by posting a notice on our website or sending an email. Your continued use of our services after changes constitutes acceptance of the modified Terms.</p>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">10. Governing Law</h3>
              <p>These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in Tamil Nadu, India.</p>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">11. Contact Information</h3>
              <p>If you have any questions about these Terms, please contact us at:</p>
              <p className="mt-2">
                Email: support@tapyourstory.in<br />
                Address: 77 Natukal Main Road, Ponnamaravathy, Tamil Nadu-622407, India
              </p>
              
              <div className="bg-muted p-4 rounded-lg mt-6">
                <p className="text-sm">By using TAP's services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
              </div>
            </div>
          </motion.div>
        );
      
      case 'privacy':
        return (
          <motion.div 
            key="privacy"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-3xl font-bold mb-6">Privacy Policy</h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="text-sm text-right">Last Updated: February 27, 2025</p>
              
              <p>At TAP (Turn Art into Pages), we are committed to protecting your privacy and the privacy of your children. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our website, mobile application, and services.</p>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">1. Information We Collect</h3>
              <p>We collect the following types of information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> When you register, we collect your name, email address, and password.</li>
                <li><strong>Profile Information:</strong> Optional information such as your child's name and age (for book customization only).</li>
                <li><strong>Order Information:</strong> Billing address, shipping address, payment method details, and order history.</li>
                <li><strong>User Content:</strong> Artwork, images, and text that you upload to our platform for creating storybooks.</li>
                <li><strong>Communication Data:</strong> Messages when you contact our customer support.</li>
                <li><strong>Technical Information:</strong> IP address, device information, browser type, and operating system.</li>
                <li><strong>Usage Data:</strong> Information about how you interact with our services.</li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">2. How We Use Your Information</h3>
              <p>We use your information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To create and manage your account</li>
                <li>To process and fulfill your orders</li>
                <li>To personalize your storybooks based on your uploads</li>
                <li>To communicate with you about orders, services, and promotions</li>
                <li>To improve our website, products, and services</li>
                <li>To provide customer support</li>
                <li>To comply with legal obligations</li>
                <li>To detect and prevent fraudulent transactions</li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">3. Data Storage and Protection</h3>
              <p>We implement robust security measures to protect your personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All personal information is stored on secure servers</li>
                <li>Payment information is processed through secure, PCI-compliant payment processors</li>
                <li>We use encryption to protect sensitive data transmitted through our website</li>
                <li>We regularly review our security practices and procedures</li>
                <li>Access to personal data is restricted to authorized personnel only</li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">4. Sharing Your Information</h3>
              <p>We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Providers:</strong> Companies that help us deliver our services (payment processors, shipping companies, print fulfillment partners)</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental authority</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>
              <p className="font-medium mt-2">We do NOT sell your personal information to third parties.</p>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">5. Children's Privacy</h3>
              <p>Our services are directed to parents and adults, not to children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately at privacy@tapyourstory.in.</p>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">6. Your Rights and Choices</h3>
              <p>Depending on your location, you may have the following rights:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access and receive a copy of your personal data</li>
                <li>Correct inaccurate personal data</li>
                <li>Delete your personal data</li>
                <li>Object to or restrict processing of your personal data</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p>To exercise these rights, contact us at privacy@tapyourstory.in.</p>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">7. Cookies and Tracking Technologies</h3>
              <p>We use cookies and similar technologies to enhance your browsing experience. You can control cookies through your browser settings.</p>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">8. Changes to This Privacy Policy</h3>
              <p>We may update this Privacy Policy periodically. We will notify you of significant changes by posting a notice on our website or sending you an email.</p>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">9. Contact Us</h3>
              <p>If you have questions or concerns about this Privacy Policy, please contact us at:</p>
              <p className="mt-2">
                Email: privacy@tapyourstory.in<br />
                Address: 77 Natukal Main Road, Ponnamaravathy, Tamil Nadu-622407, India
              </p>
              
              <div className="bg-muted p-4 rounded-lg mt-6">
                <p className="text-sm">By using our services, you acknowledge that you have read and understood this Privacy Policy.</p>
              </div>
            </div>
          </motion.div>
        );
      
      case 'refund':
        return (
          <motion.div 
            key="refund"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-3xl font-bold mb-6">Refund Policy</h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="text-sm text-right">Last Updated: February 27, 2025</p>
              
              <p>At TAP (Turn Art into Pages), customer satisfaction is our priority. This Refund Policy outlines the terms and conditions for refunds and returns of our personalized storybooks and related products.</p>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">1. Order Approval Process</h3>
              <p>Our order process includes a digital proof review stage to ensure your satisfaction:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>After submitting your order, you will receive a digital proof of your storybook</li>
                <li>You have 7 days to review the proof and request revisions</li>
                <li>Production begins after you approve the digital proof</li>
                <li>Your approval confirms that the content, design, and layout meet your expectations</li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">2. Cancellation Policy</h3>
              <p>You may cancel your order under the following conditions:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Before Digital Proof:</strong> 100% refund of the order amount</li>
                <li><strong>During Digital Proof Review:</strong> 90% refund (10% design fee is non-refundable)</li>
                <li><strong>After Proof Approval:</strong> No refund as production will have commenced</li>
                <li><strong>Subscription Plans:</strong> Pro-rated refund for unused portion minus any applicable discounts</li>
              </ul>
              <p>To cancel your order, contact us at support@tapyourstory.in with your order number and cancellation reason.</p>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">3. Quality Assurance and Defects</h3>
              <p>If you receive a product with a manufacturing defect or damage:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Notify us within 7 days of receiving your order</li>
                <li>Include clear photos showing the defect</li>
                <li>We will either replace the product at no additional cost or provide a full refund</li>
                <li>Return shipping for defective products will be covered by TAP</li>
              </ul>
              
              <div className="bg-info/10 border border-info/20 rounded-lg p-4 mt-2">
                <p className="text-info flex items-start">
                  <span className="font-medium mr-2">What constitutes a defect:</span>
                  <span>Printing errors, binding issues, missing pages, incorrect content, damaged covers, or significant color deviations from the approved proof.</span>
                </p>
              </div>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">4. Non-Refundable Items</h3>
              <p>The following items are non-refundable due to their personalized nature:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Customized books with approved digital proofs</li>
                <li>Digital products that have been downloaded</li>
                <li>Books created with customer-uploaded content and specifications</li>
                <li>Promotional items or gifts included with orders</li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">5. Shipping and Delivery Issues</h3>
              <p>For shipping-related issues:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Lost Packages:</strong> If your order is marked as delivered but you haven't received it, contact us within 7 days</li>
                <li><strong>Delayed Shipments:</strong> While we're not responsible for shipping carrier delays, we will assist in tracking your package</li>
                <li><strong>Wrong Address:</strong> Additional shipping fees may apply if incorrect shipping information was provided</li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">6. Refund Process</h3>
              <p>When a refund is approved:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Refunds will be processed to the original payment method</li>
                <li>Processing time is typically 5-7 business days</li>
                <li>Bank or credit card processing times may vary</li>
                <li>You will receive an email confirmation when your refund is processed</li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">7. Exceptions and Special Circumstances</h3>
              <p>We understand that special situations arise. Please contact our customer service team if you have extenuating circumstances not covered by this policy. We'll work with you to find a fair resolution.</p>
              
              <h3 className="text-xl font-semibold mt-6 text-foreground">8. Contact Information</h3>
              <p>For refund requests or questions about this policy, please contact us at:</p>
              <p className="mt-2">
                Email: support@tapyourstory.in<br />
                Phone: +91 6378920207<br />
                Address: 77 Natukal Main Road, Ponnamaravathy, Tamil Nadu-622407, India
              </p>
              
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-6">
                <p className="text-primary font-medium flex items-start">
                  <span className="mr-2">Note:</span>
                  <span>This Refund Policy is subject to change without notice. The policy in effect at the time of your purchase will apply to your order.</span>
                </p>
              </div>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom mx-auto">
        <div className="max-w-4xl mx-auto">
          {/* Section Navigation */}
          <div className="flex justify-center mb-12 space-x-4">
            <button
              onClick={() => setActiveSection('terms')}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-all ${
                activeSection === 'terms' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Terms of Service</span>
            </button>
            
            <button
              onClick={() => setActiveSection('privacy')}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-all ${
                activeSection === 'privacy' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Privacy Policy</span>
            </button>
            
            <button
              onClick={() => setActiveSection('refund')}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-all ${
                activeSection === 'refund' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refund Policy</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="bg-background border border-border rounded-xl p-8 shadow-sm">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;