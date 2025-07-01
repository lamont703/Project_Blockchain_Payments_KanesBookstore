# Kane's Bookstore - HTML Screens for GoHighLevel

This directory contains complete, production-ready HTML screen files for the Kane's Bookstore hybrid payment system. These files can be uploaded directly to GoHighLevel and customized for your specific products and branding.

## 📁 File Structure

```
html-screens/
├── assets/
│   ├── css/
│   │   └── kanes-bookstore.css     # Complete stylesheet
│   └── js/
│       └── kanes-bookstore.js      # Payment functionality
├── components/
│   └── payment-modal.html          # Reusable payment component
├── 01-product-detail-page.html     # Main product page
├── 02-order-confirmation.html      # Success/confirmation page
├── 03-admin-dashboard.html         # Admin analytics dashboard
├── 04-crypto-checkout.html         # Crypto payment flow
└── README.md                       # This file
```

## 🚀 Quick Start Guide

### Step 1: Upload Assets to CDN

First, you'll need to host the CSS and JavaScript files on a CDN or your server:

1. Upload `assets/css/kanes-bookstore.css` to your CDN
2. Upload `assets/js/kanes-bookstore.js` to your CDN
3. Update the file paths in all HTML files to point to your CDN URLs

### Step 2: Create Pages in GoHighLevel

#### Option A: Create Full Pages

1. Go to Sites → Pages in your GHL account
2. Create a new page
3. Choose "Custom HTML" option
4. Copy and paste the entire HTML content from any of the screen files
5. Update the asset URLs to your CDN paths
6. Publish the page

#### Option B: Use as Custom HTML Elements

1. Go to your existing GHL page
2. Add a "Custom HTML" element
3. Copy the relevant sections from the HTML files
4. Paste into the Custom HTML element
5. Save and publish

### Step 3: Configure Product Data

Update the data attributes in each HTML file with your product information:

```html
<!-- Example: Update these attributes -->
<button
  data-product-id="your-product-id"
  data-product-title="Your Product Name"
  data-product-price="99.00"
  data-product-image="https://your-cdn.com/product-image.jpg"
></button>
```

## 📋 Individual Screen Instructions

### 1. Product Detail Page (`01-product-detail-page.html`)

**Purpose**: Main product showcase with payment options

**Usage in GHL**:

- Create a new page in Sites → Pages
- Use as your main product landing page
- Link to this from your ads, emails, and funnels

**Customization**:

- Update product title, description, and images
- Modify pricing and crypto equivalents
- Add your own product features and benefits
- Update security badges and guarantees

**GHL Integration**:

```html
<!-- Add to page head for GHL contact data -->
<script>
  window.addEventListener("DOMContentLoaded", function () {
    if (typeof window.leadConnector !== "undefined") {
      const contact = window.leadConnector.getContact();
      // Auto-populate customer data
      console.log("Contact:", contact);
    }
  });
</script>
```

### 2. Order Confirmation (`02-order-confirmation.html`)

**Purpose**: Post-purchase thank you and download page

**Usage in GHL**:

- Set as success page in your payment flows
- Use URL parameters to populate order data
- Link from Stripe success redirects

**URL Parameters**:

- `?order_id=KB-2024-001` - Order identifier
- `?session_id=cs_123...` - Stripe session ID
- `?payment_id=np_456...` - Crypto payment ID

**Customization**:

- Update download links and file paths
- Modify social sharing options
- Add upsell offers or next steps
- Customize email addresses and support links

### 3. Admin Dashboard (`03-admin-dashboard.html`)

**Purpose**: Real-time analytics and transaction monitoring

**Usage in GHL**:

- Create as admin-only page with restricted access
- Use for monitoring sales and payments
- Integrate with your backend analytics API

**Features**:

- Real-time revenue tracking
- Payment method distribution charts
- Recent transactions table
- System status monitoring
- WebSocket live updates

**API Endpoints Required**:

- `/api/admin/revenue` - Revenue data
- `/api/admin/stats` - Analytics data
- `/api/admin/transactions` - Transaction list
- `/ws/admin` - WebSocket connection

### 4. Crypto Checkout (`04-crypto-checkout.html`)

**Purpose**: Dedicated cryptocurrency payment flow

**Usage in GHL**:

- Link from main product page
- Use as standalone crypto checkout
- Embed sections in existing pages

**Features**:

- Multi-currency selection (BTC, ETH, USDC, SOL)
- QR code generation
- Real-time payment tracking
- Status polling and confirmations
- Payment timer and expiration

**Integration**:

- Requires NowPayments API setup
- Need crypto exchange rate API
- WebSocket for real-time updates

### 5. Payment Modal Component (`components/payment-modal.html`)

**Purpose**: Reusable payment selection modal

**Usage in GHL**:

- Embed in any existing page
- Add to product pages as Custom HTML
- Use as popup payment option

**Implementation**:

```html
<!-- Add anywhere on your page -->
<button onclick="openPaymentModal()">Buy Now</button>

<!-- Include the modal HTML -->
<!-- Copy from payment-modal.html -->
```

## ⚙️ Backend API Requirements

These HTML screens require the following backend endpoints:

### Payment APIs

```
POST /api/payments/stripe/create-session
POST /api/payments/crypto/create-payment
GET  /api/payments/crypto/status/:paymentId
POST /webhook/stripe
POST /webhook/nowpayments
```

### Order Management

```
GET  /api/orders/:orderId
GET  /api/download/product/:productId
GET  /api/download/nft/:certificateId
```

### Admin APIs

```
GET  /api/admin/revenue
GET  /api/admin/stats
GET  /api/admin/transactions
```

### Utility APIs

```
GET  /api/crypto-rates
GET  /health
```

## 🎨 Customization Guide

### Branding

1. **Colors**: Update CSS variables in `kanes-bookstore.css`

```css
:root {
  --primary-color: #your-brand-color;
  --secondary-color: #your-accent-color;
}
```

2. **Logo**: Replace "Kane's Bookstore" text with your brand
3. **Fonts**: Add Google Fonts or custom typography
4. **Images**: Update placeholder images with your products

### Payment Methods

1. **Stripe**: Update publishable key and webhook endpoints
2. **Crypto**: Configure NowPayments API credentials
3. **Additional Methods**: Add PayPal, Apple Pay, etc.

### Products

1. **Multiple Products**: Create variants for different products
2. **Pricing**: Update amounts and currency displays
3. **Features**: Modify product benefits and features
4. **Downloads**: Configure file paths and access tokens

## 🔐 Security Considerations

### GoHighLevel Setup

1. **SSL**: Ensure all pages use HTTPS
2. **API Keys**: Store sensitive keys in environment variables
3. **Webhooks**: Validate webhook signatures
4. **Downloads**: Implement token-based access control

### Production Checklist

- [ ] Update all placeholder URLs and API endpoints
- [ ] Configure proper error handling
- [ ] Set up monitoring and logging
- [ ] Test payment flows thoroughly
- [ ] Implement rate limiting
- [ ] Add GDPR compliance notices
- [ ] Configure backup and recovery

## 📱 Mobile Optimization

All screens are built with mobile-first responsive design:

- **Breakpoints**: 320px, 480px, 768px, 1024px, 1200px
- **Touch Targets**: Minimum 44px for buttons
- **Viewport**: Optimized meta viewport tag
- **Performance**: Optimized images and minimal JavaScript

## 🔧 Troubleshooting

### Common Issues

**1. CSS/JS Not Loading**

- Check CDN URLs are correct and accessible
- Verify CORS headers for cross-origin requests
- Ensure files are properly uploaded

**2. Payment Buttons Not Working**

- Check API endpoint URLs
- Verify API keys are configured
- Check browser console for JavaScript errors

**3. GoHighLevel Integration Issues**

- Ensure Custom HTML elements are enabled
- Check for conflicting JavaScript
- Verify contact data access permissions

**4. Mobile Display Problems**

- Check viewport meta tag is present
- Verify responsive CSS is loading
- Test on actual devices, not just browser tools

### Debug Mode

Add this to any page for debugging:

```html
<script>
  // Enable debug mode
  window.KB_DEBUG = true;
  console.log("Kane's Bookstore Debug Mode Enabled");
</script>
```

## 📊 Analytics Integration

### Google Analytics 4

```html
<!-- Add to page head -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "GA_MEASUREMENT_ID");
</script>
```

### Facebook Pixel

```html
<!-- Add to page head -->
<script>
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    "script",
    "https://connect.facebook.net/en_US/fbevents.js"
  );
  fbq("init", "YOUR_PIXEL_ID");
  fbq("track", "PageView");
</script>
```

## 🚀 Performance Optimization

### Loading Speed

1. **Minify**: CSS and JavaScript files
2. **CDN**: Use fast, global CDN for assets
3. **Images**: Optimize and use WebP format
4. **Lazy Loading**: Implement for non-critical content

### Code Splitting

```html
<!-- Load critical CSS inline -->
<style>
  /* Critical above-the-fold styles */
</style>

<!-- Load non-critical CSS async -->
<link
  rel="preload"
  href="styles.css"
  as="style"
  onload="this.onload=null;this.rel='stylesheet'"
/>
```

## 📞 Support

For technical support with these HTML screens:

1. **Documentation**: Refer to the main project documentation
2. **Issues**: Check the troubleshooting section above
3. **Custom Development**: Contact for additional customization
4. **Updates**: Check for new versions and improvements

## 📜 License

These HTML screens are part of the Kane's Bookstore payment system project. Please refer to the main project license for usage terms and conditions.

---

**Note**: Remember to test all payment flows thoroughly in a staging environment before deploying to production. Always follow payment processing best practices and comply with relevant regulations.
