# Product Detail Page - Screen Specification

## 🎯 Screen Overview

The Product Detail Page is the primary conversion point where users learn about products and choose their payment method. This screen showcases dual pricing and provides clear payment options.

## 📱 Mobile-First Design Specifications

### Layout Structure

```
┌─────────────────────────────────────────┐
│ Kane's Bookstore Logo                   │
├─────────────────────────────────────────┤
│                                         │
│          Product Image                  │
│         (4:3 aspect ratio)              │
│                                         │
├─────────────────────────────────────────┤
│ Product Title                           │
│ (Typography: 24px, Bold)                │
├─────────────────────────────────────────┤
│ 💰 Dual Pricing Display                │
│ $25.00 USD                              │
│ ≈ 50 Tomlin Coins                       │
│ ≈ 0.0008 BTC                            │
├─────────────────────────────────────────┤
│ Product Description                     │
│ (Typography: 16px, Regular)             │
├─────────────────────────────────────────┤
│ [💳 Buy with Card ($25)]                │
│ [₿ Buy with Crypto]                     │
├─────────────────────────────────────────┤
│ Additional Info                         │
│ • Instant download                      │
│ • 30-day guarantee                      │
│ • NFT certificate included              │
├─────────────────────────────────────────┤
│ 🔒 Security Badges                      │
│ SSL | Stripe | NowPayments              │
└─────────────────────────────────────────┘
```

## 🎨 Design Components

### Header Section

- **Logo**: Kane's Bookstore branding
- **Navigation**: Minimal for focus
- **Background**: Clean white/light gray

### Product Image

- **Dimensions**: 400x300px (mobile), 800x600px (desktop)
- **Format**: WebP with PNG fallback
- **Loading**: Lazy loading with placeholder
- **Alt Text**: Product name + description

### Product Title

- **Typography**:
  - Mobile: 20px, Font-weight: 700
  - Desktop: 28px, Font-weight: 700
- **Color**: #1a1a1a
- **Line Height**: 1.2

### Dual Pricing Display

```css
.pricing-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
  border-radius: 12px;
  margin: 20px 0;
}

.usd-price {
  font-size: 32px;
  font-weight: 800;
  color: #2c3e50;
}

.crypto-equivalent {
  font-size: 16px;
  color: #7f8c8d;
  margin-top: 8px;
}
```

### Payment Buttons

```css
.payment-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 24px 0;
}

.btn-stripe {
  background: #635bff;
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 18px;
}

.btn-crypto {
  background: #f59e0b;
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 18px;
}
```

## 🔧 Technical Implementation

### GoHighLevel Custom Element

```html
<div class="product-detail-container">
  <div class="product-image-section">
    <img
      src="{{product.image_url}}"
      alt="{{product.title}}"
      class="product-image"
    />
  </div>

  <div class="product-info-section">
    <h1 class="product-title">{{product.title}}</h1>

    <div class="pricing-container">
      <div class="usd-price">${{product.price_usd}}</div>
      <div class="crypto-equivalent">
        ≈ {{product.price_tokens}} Tomlin Coins<br />
        ≈ {{product.price_btc}} BTC
      </div>
    </div>

    <div class="product-description">{{product.description}}</div>

    <div class="payment-buttons">
      <button class="btn-stripe" onclick="initiateStripePayment()">
        💳 Buy with Card (${{product.price_usd}})
      </button>
      <button class="btn-crypto" onclick="showCryptoOptions()">
        ₿ Buy with Crypto
      </button>
    </div>

    <div class="product-features">
      <ul>
        <li>✓ Instant download</li>
        <li>✓ 30-day money-back guarantee</li>
        <li>✓ NFT certificate included</li>
      </ul>
    </div>
  </div>
</div>
```

### JavaScript Functions

```javascript
// Stripe Payment Initiation
function initiateStripePayment() {
  // Track event
  gtag("event", "begin_checkout", {
    currency: "USD",
    value: parseFloat(product.price_usd),
    payment_method: "stripe",
  });

  // Redirect to Stripe Checkout
  window.location.href = `/checkout/stripe?product_id=${product.id}`;
}

// Crypto Payment Options
function showCryptoOptions() {
  // Track event
  gtag("event", "begin_checkout", {
    currency: "USD",
    value: parseFloat(product.price_usd),
    payment_method: "crypto",
  });

  // Show crypto selection modal or redirect
  showModal("crypto-payment-modal");
}

// Dynamic Pricing Updates
function updateCryptoPricing() {
  fetch("/api/crypto-rates")
    .then((response) => response.json())
    .then((rates) => {
      document.querySelector(".crypto-equivalent").innerHTML = `
        ≈ ${(product.price_usd / rates.btc).toFixed(8)} BTC<br>
        ≈ ${(product.price_usd / rates.eth).toFixed(4)} ETH<br>
        ≈ ${product.price_usd} USDC
      `;
    });
}
```

## 📊 Analytics Integration

### Google Analytics 4 Events

```javascript
// Page View
gtag('event', 'page_view', {
  page_title: 'Product Detail - {{product.title}}',
  page_location: window.location.href,
  product_id: '{{product.id}}'
});

// Product View
gtag('event', 'view_item', {
  currency: 'USD',
  value: {{product.price_usd}},
  items: [{
    item_id: '{{product.id}}',
    item_name: '{{product.title}}',
    category: '{{product.category}}',
    price: {{product.price_usd}},
    quantity: 1
  }]
});
```

## 🎯 Conversion Optimization

### A/B Testing Elements

- **Payment Button Order**: Stripe first vs Crypto first
- **Pricing Display**: USD prominent vs Crypto prominent
- **Button Colors**: Current vs Alternative color schemes
- **Copy Variations**: "Buy with Card" vs "Pay with Credit Card"

### Trust Elements

- **Security Badges**: SSL, Stripe, NowPayments logos
- **Guarantee Badge**: 30-day money-back guarantee
- **Download Promise**: "Instant download" messaging
- **NFT Bonus**: Highlight NFT certificate value

## 📱 Responsive Breakpoints

### Mobile (320px - 768px)

- Single column layout
- Stacked payment buttons
- Compressed product image
- Simplified pricing display

### Tablet (768px - 1024px)

- Two-column layout option
- Side-by-side payment buttons
- Larger product image
- Extended product description

### Desktop (1024px+)

- Full two-column layout
- Large product image with gallery
- Inline payment buttons
- Detailed product specifications

## 🔒 Security Considerations

### Data Protection

- No sensitive data stored in frontend
- Secure API calls for pricing updates
- CSP headers for XSS protection
- HTTPS enforcement

### Payment Security

- No card data collection on this page
- Secure redirects to payment processors
- Session management for payment flow
- Fraud detection integration

## ✅ Testing Checklist

### Functional Testing

- [ ] Product information displays correctly
- [ ] Pricing updates in real-time
- [ ] Payment buttons redirect properly
- [ ] Mobile responsiveness works
- [ ] Analytics events fire correctly

### Performance Testing

- [ ] Page load time < 3 seconds
- [ ] Image optimization working
- [ ] JavaScript execution < 1 second
- [ ] API calls respond quickly

### User Experience Testing

- [ ] Clear payment method differentiation
- [ ] Intuitive navigation flow
- [ ] Accessible for screen readers
- [ ] Error handling for failed loads

---

**Implementation Priority**: High (Core conversion page)
**Development Time**: 3-5 days
**Dependencies**: Product catalog, pricing API, payment processor setup
