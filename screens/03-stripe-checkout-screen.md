# Stripe Checkout Screen - Screen Specification

## 🎯 Screen Overview
The Stripe Checkout Screen provides a secure, PCI-compliant payment interface for credit/debit card transactions. This screen follows Stripe's best practices for conversion optimization and security.

## 📱 Stripe Hosted Checkout Layout

### Layout Structure
```
┌─────────────────────────────────────────┐
│ 🔙 Back to Kane's Bookstore             │
├─────────────────────────────────────────┤
│ 🔒 Secure Checkout - Powered by Stripe  │
├─────────────────────────────────────────┤
│ 📦 Order Summary                        │
│ Digital Marketing Mastery               │
│ $25.00                                  │
├─────────────────────────────────────────┤
│ 📧 Email address                        │
│ [user@example.com          ]            │
├─────────────────────────────────────────┤
│ 💳 Card information                     │
│ [1234 5678 9012 3456      ]            │
│ [MM/YY]    [CVC]                        │
├─────────────────────────────────────────┤
│ 📍 Billing address                      │
│ [Country dropdown ▼]                    │
│ [ZIP code            ]                  │
├─────────────────────────────────────────┤
│           [💰 Pay $25.00]               │
├─────────────────────────────────────────┤
│ 🔒 Secured by Stripe                    │
│ 256-bit SSL • PCI DSS Compliant        │
└─────────────────────────────────────────┘
```

## 🔧 Stripe Integration Implementation

### Checkout Session Creation
```javascript
// Backend API - Create Stripe Checkout Session
const createStripeSession = async (productId, customerId) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: customer.email,
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.title,
          description: product.description,
          images: [product.image_url],
        },
        unit_amount: product.price_usd * 100, // Amount in cents
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.DOMAIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.DOMAIN}/products/${productId}?checkout=cancelled`,
    metadata: {
      product_id: productId,
      customer_id: customerId,
      order_type: 'digital_product'
    },
    payment_intent_data: {
      metadata: {
        product_id: productId,
        customer_id: customerId
      }
    }
  });
  
  return session;
};
```

### Frontend Redirect Logic
```javascript
// Frontend - Initiate Stripe Checkout
async function initiateStripeCheckout(productId) {
  try {
    // Show loading state
    showLoadingIndicator();
    
    // Track checkout initiation
    gtag('event', 'begin_checkout', {
      currency: 'USD',
      value: product.price_usd,
      items: [{
        item_id: productId,
        item_name: product.title,
        category: product.category,
        quantity: 1,
        price: product.price_usd
      }]
    });
    
    // Create checkout session
    const response = await fetch('/api/create-stripe-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        customer_id: getCurrentCustomerId()
      })
    });
    
    const session = await response.json();
    
    if (session.error) {
      throw new Error(session.error);
    }
    
    // Redirect to Stripe Checkout
    window.location.href = session.url;
    
  } catch (error) {
    hideLoadingIndicator();
    showErrorMessage('Unable to process payment. Please try again.');
    console.error('Stripe checkout error:', error);
  }
}
```

## 🎨 Custom Styling Options

### Stripe Appearance Customization
```javascript
const session = await stripe.checkout.sessions.create({
  // ... other options
  ui_mode: 'hosted',
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#4fc3f7', // Kane's Bookstore brand color
      colorBackground: '#ffffff',
      colorText: '#1a1a1a',
      colorDanger: '#df1b41',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px'
    },
    rules: {
      '.Label': {
        fontWeight: '600',
        fontSize: '14px'
      },
      '.Input': {
        padding: '12px',
        fontSize: '16px'
      },
      '.Button': {
        padding: '16px',
        fontSize: '16px',
        fontWeight: '600'
      }
    }
  }
});
```

## 📊 Success/Failure Handling

### Success Flow
```javascript
// Success Page Handler
app.get('/checkout/success', async (req, res) => {
  const { session_id } = req.query;
  
  try {
    // Retrieve session details
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status === 'paid') {
      // Update order status
      await updateOrderStatus(session.metadata.product_id, 'completed');
      
      // Send confirmation email
      await sendOrderConfirmationEmail(session.customer_email, session.metadata);
      
      // Generate NFT certificate
      await generateNFTCertificate(session.metadata.customer_id, session.metadata.product_id);
      
      // Track purchase completion
      gtag('event', 'purchase', {
        transaction_id: session.payment_intent,
        value: session.amount_total / 100,
        currency: session.currency.toUpperCase(),
        items: [{
          item_id: session.metadata.product_id,
          item_name: session.line_items.data[0].description,
          quantity: 1,
          price: session.amount_total / 100
        }]
      });
      
      // Redirect to confirmation page
      res.redirect(`/order-confirmation?order_id=${session.payment_intent}`);
    } else {
      res.redirect('/checkout/error?reason=payment_failed');
    }
  } catch (error) {
    console.error('Success handler error:', error);
    res.redirect('/checkout/error?reason=session_error');
  }
});
```

### Failure Flow
```javascript
// Cancel/Error Page Handler
app.get('/checkout/cancel', (req, res) => {
  // Track checkout abandonment
  gtag('event', 'checkout_abandonment', {
    checkout_step: 'stripe_redirect',
    payment_method: 'stripe'
  });
  
  res.redirect('/products?checkout=cancelled');
});
```

## 🔒 Security Implementation

### Webhook Signature Verification
```javascript
// Stripe Webhook Handler
app.post('/webhook/stripe', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      handleSuccessfulPayment(session);
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      handleFailedPayment(failedPayment);
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  res.json({received: true});
});
```

### Data Validation
```javascript
// Input Validation
const validateCheckoutData = (productId, customerId) => {
  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error('Invalid product ID');
  }
  
  if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
    throw new Error('Invalid customer ID');
  }
  
  return true;
};
```

## 📱 Mobile Optimization

### Responsive Design
```css
/* Stripe automatically handles mobile optimization, but custom styling: */
@media (max-width: 768px) {
  .stripe-checkout-container {
    padding: 16px;
  }
  
  .order-summary {
    margin-bottom: 20px;
  }
  
  .back-button {
    font-size: 14px;
    padding: 8px 16px;
  }
}
```

### Mobile-Specific Features
- **Apple Pay Integration**: Automatic detection and display
- **Google Pay Integration**: For Android devices
- **Touch ID/Face ID**: Biometric authentication support
- **Mobile Wallets**: Samsung Pay, etc.

## 📊 Analytics & Tracking

### Enhanced E-commerce Tracking
```javascript
// Stripe-specific analytics
const trackStripeCheckout = {
  // Checkout initiation
  initiate: (productData) => {
    gtag('event', 'begin_checkout', {
      currency: 'USD',
      value: productData.price,
      checkout_option: 'stripe',
      items: [productData]
    });
  },
  
  // Payment method selection
  paymentMethod: (method) => {
    gtag('event', 'set_checkout_option', {
      checkout_step: 1,
      checkout_option: method // 'card', 'apple_pay', 'google_pay'
    });
  },
  
  // Purchase completion
  purchase: (sessionData) => {
    gtag('event', 'purchase', {
      transaction_id: sessionData.payment_intent,
      value: sessionData.amount_total / 100,
      currency: 'USD',
      payment_method: 'stripe',
      items: sessionData.line_items
    });
  }
};
```

## 🔄 Error Handling & Recovery

### Common Error Scenarios
```javascript
const errorHandling = {
  // Declined card
  cardDeclined: (error) => {
    return {
      message: 'Your card was declined. Please try a different payment method.',
      action: 'retry_payment',
      supportLink: '/support/payment-issues'
    };
  },
  
  // Insufficient funds
  insufficientFunds: (error) => {
    return {
      message: 'Insufficient funds. Please use a different card or payment method.',
      action: 'change_payment_method',
      alternatives: ['crypto_payment', 'different_card']
    };
  },
  
  // Network issues
  networkError: (error) => {
    return {
      message: 'Connection issue. Please check your internet and try again.',
      action: 'retry_payment',
      retryDelay: 3000
    };
  }
};
```

## ✅ Testing Checklist

### Stripe Test Cards
```javascript
const testCards = {
  success: '4242424242424242',
  declined: '4000000000000002',
  insufficientFunds: '4000000000009995',
  expiredCard: '4000000000000069',
  cvcFail: '4000000000000127'
};
```

### Testing Scenarios
- [ ] Successful payment flow
- [ ] Card declined handling
- [ ] Network error recovery
- [ ] Webhook delivery
- [ ] Success page display
- [ ] Email confirmation sending
- [ ] NFT generation
- [ ] Mobile payment methods
- [ ] Browser back button behavior
- [ ] Session timeout handling

---

**Implementation Priority**: Critical (Core payment processor)
**Development Time**: 2-3 days
**Dependencies**: Stripe account setup, webhook endpoints, SSL certificate 