# TAP Website - Vercel Deployment Guide

This is the official repository for the TAP (Turn Art into Pages) website, a platform that transforms children's artwork into professionally printed storybooks using AI technology.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Vercel Deployment](#vercel-deployment)
4. [Firebase Setup](#firebase-setup)
5. [Razorpay Integration](#razorpay-integration)
6. [Project Structure](#project-structure)
7. [SEO Optimization](#seo-optimization)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following:
- Node.js (v16 or later)
- npm or yarn
- A Vercel account
- A Firebase account (for authentication and database)
- A Razorpay account (for payment processing)
- A domain name (optional but recommended)

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tap_website-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Vercel Deployment

### Option 1: Deploy from GitHub

1. **Push your repository to GitHub**

2. **Connect Vercel to your GitHub repository**
   - Login to your [Vercel dashboard](https://vercel.com/dashboard)
   - Click "Import Project"
   - Select "Import Git Repository" and choose your GitHub repository
   - Click "Select" to proceed

3. **Configure the deployment**
   - Project name: Choose a suitable name
   - Framework preset: Select "Vite"
   - Root Directory: Leave as default (or specify if in a subfolder)
   - Build Command: `npm run build` or `yarn build`
   - Output Directory: `dist`
   - Install Command: `npm install` or `yarn install`

4. **Set environment variables**
   - Click "Environment Variables" to expand the section
   - Add all variables from your `.env` file

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

### Option 2: Deploy with Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   # or
   yarn global add vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy the project**
   ```bash
   vercel
   ```

4. **Set environment variables (if not set during deployment)**
   ```bash
   vercel env add VITE_FIREBASE_API_KEY
   # Repeat for all variables
   ```

5. **Redeploy with production settings**
   ```bash
   vercel --prod
   ```

### Custom Domain Setup

1. **Go to your project dashboard in Vercel**
2. **Click on "Domains" in the top navigation**
3. **Enter your domain name and click "Add"**
4. **Follow Vercel's instructions to configure your DNS settings**

## Firebase Setup

1. **Create a Firebase project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup wizard

2. **Enable Authentication**
   - In your Firebase project, navigate to "Authentication"
   - Go to "Sign-in method"
   - Enable the authentication methods you need (Email/Password, Google, etc.)

3. **Set up Firestore Database**
   - In your Firebase project, navigate to "Firestore Database"
   - Click "Create database"
   - Start in production mode or test mode as needed
   - Choose a location close to your target audience

4. **Set up Firebase Storage**
   - In your Firebase project, navigate to "Storage"
   - Click "Get started" and follow the setup wizard

5. **Add your domain to authorized domains**
   - In Firebase Authentication settings, add your Vercel domain to the authorized domains list

## Razorpay Integration

1. **Create a Razorpay account**
   - Sign up at [Razorpay](https://razorpay.com/)
   - Complete the verification process for your business

2. **Get API credentials**
   - Log in to your Razorpay Dashboard
   - Go to "Settings" > "API Keys"
   - Generate API key and secret (or use existing ones)
   - Add these to your environment variables

3. **Webhook Setup**
   - In Razorpay Dashboard, go to "Settings" > "Webhooks"
   - Add a new webhook for your Vercel domain
   - Set the webhook URL to `https://yourdomain.com/api/razorpay/webhook`
   - Select relevant events (payment.authorized, payment.failed, etc.)

## Project Structure

```
tap_website-main/
├── public/            # Static assets
├── src/
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   ├── services/      # API and service functions
│   ├── styles/        # Global styles and theme
│   ├── utils/         # Utility functions
│   ├── App.jsx        # Main application component
│   └── main.jsx       # Entry point
├── vercel.json        # Vercel configuration
├── vite.config.js     # Vite configuration
├── tailwind.config.js # Tailwind CSS configuration
└── package.json       # Project dependencies
```

## SEO Optimization

This project includes the following SEO optimizations:

1. **Meta Tags**
   - Proper title, description, and OpenGraph tags
   - Structured data for rich snippets

2. **Performance Optimization**
   - Code splitting with lazy loading
   - Image optimization
   - Efficient caching with service worker

3. **Crawling Optimization**
   - robots.txt configuration
   - sitemap.xml generation
   - Proper semantic HTML structure

4. **Mobile Optimization**
   - Responsive design
   - Mobile-friendly UI
   - PWA capabilities

## Troubleshooting

### Common Issues and Solutions

1. **Routing issues after refresh**
   - The `vercel.json` file includes SPA routing configuration that redirects all requests to index.html
   - If you're still experiencing issues, check the routes in `App.jsx` and ensure they match your navigation
   - Ensure that Vercel's "Rewrites" are properly configured

2. **Images not loading**
   - Check image paths (should be relative paths or full URLs)
   - Ensure images exist in the public directory
   - Verify that the Firebase Storage bucket is properly configured and accessible
   - Use the Image component with proper loading strategies (lazy loading)

3. **Firebase authentication issues**
   - Verify that your Firebase project is correctly configured
   - Ensure your domain is added to the authorized domains list in Firebase
   - Check that environment variables are correctly set in Vercel

4. **Razorpay payment issues**
   - Verify that Razorpay API keys are correctly set
   - Ensure the webhook URL is properly configured
   - Test payments in test mode before going live

### Performance Optimization

1. **Reduce initial load time**
   ```bash
   npm run build
   npm run preview
   ```
   - Check the network tab in browser dev tools
   - Optimize any large bundles or assets

2. **Analyze bundle size**
   ```bash
   npm run build -- --mode=analyze
   ```
   - Review the visualization to identify large dependencies
   - Consider lazy loading or code splitting for large components

## Maintenance and Updates

1. **Deploying updates**
   - Push changes to your GitHub repository
   - Vercel will automatically deploy updates from the connected branch
   - Alternatively, use `vercel` command to manually deploy

2. **Monitoring**
   - Use Vercel Analytics to monitor performance
   - Set up Firebase Analytics for user behavior tracking
   - Regularly check Vercel logs for any errors or issues

---

For detailed documentation on specific features, please refer to the [Wiki](https://github.com/your-username/tap_website/wiki).

If you have any questions or need assistance, please contact the development team.