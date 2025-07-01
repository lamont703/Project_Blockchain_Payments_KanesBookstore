# API Integration Guide - Kane's Bookstore Payment System

## 🎯 Overview

This document provides comprehensive integration guidelines for Kane's Bookstore hybrid payment system, covering both Stripe and NowPayments APIs, along with custom endpoints for order management and digital asset delivery.

## 🔧 Environment Setup

### API Base URLs

```javascript
const API_ENDPOINTS = {
  development: "https://dev-api.kanesbookstore.com",
  staging: "https://staging-api.kanesbookstore.com",
  production: "https://api.kanesbookstore.com",
};

const PAYMENT_ENDPOINTS = {
  stripe: {
    test: "https://api.stripe.com/v1/",
    live: "https://api.stripe.com/v1/",
  },
  nowpayments: {
    sandbox: "https://api-sandbox.nowpayments.io/v1/",
    live: "https://api.nowpayments.io/v1/",
  },
};
```

### Authentication

```javascript
// API Key Authentication
const headers = {
  Authorization: `Bearer ${process.env.API_KEY}`,
  "Content-Type": "application/json",
  "X-API-Version": "2024-01-01",
};

// Admin Authentication
const adminHeaders = {
  Authorization: `Bearer ${process.env.ADMIN_JWT_TOKEN}`,
  "Content-Type": "application/json",
};
```

## 💳 Stripe Integration

### 1. Create Checkout Session

```javascript
// POST /api/payments/stripe/create-session
const createStripeSession = async (productId, customerId) => {
  const response = await fetch("/api/payments/stripe/create-session", {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      product_id: productId,
      customer_id: customerId,
      success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${window.location.origin}/checkout/cancel`,
    }),
  });

  const session = await response.json();

  if (session.error) {
    throw new Error(session.error);
  }

  return session;
};

// Backend Implementation
app.post("/api/payments/stripe/create-session", async (req, res) => {
  try {
    const { product_id, customer_id } = req.body;

    // Validate inputs
    const product = await Product.findById(product_id);
    const customer = await Customer.findById(customer_id);

    if (!product || !customer) {
      return res.status(400).json({ error: "Invalid product or customer" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: customer.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.title,
              description: product.description,
              images: [product.image_url],
            },
            unit_amount: Math.round(product.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: req.body.success_url,
      cancel_url: req.body.cancel_url,
      metadata: {
        product_id: product_id,
        customer_id: customer_id,
        order_type: "digital_product",
      },
    });

    res.json({
      session_id: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe session creation error:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});
```

### 2. Webhook Handler

```javascript
// POST /webhook/stripe
app.post(
  "/webhook/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case "checkout.session.completed":
        await handleStripeCheckoutCompleted(event.data.object);
        break;

      case "payment_intent.succeeded":
        await handleStripePaymentSucceeded(event.data.object);
        break;

      case "payment_intent.payment_failed":
        await handleStripePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
);

// Handle successful checkout
const handleStripeCheckoutCompleted = async (session) => {
  try {
    const { product_id, customer_id } = session.metadata;

    // Create order record
    const order = await Order.create({
      order_id: `KB-${Date.now()}-${product_id}`,
      customer_id: customer_id,
      product_id: product_id,
      amount: session.amount_total / 100,
      currency: session.currency.toUpperCase(),
      payment_method: "stripe",
      status: "completed",
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent,
      completed_at: new Date(),
    });

    // Generate download tokens
    const downloadToken = generateDownloadToken(order.id, customer_id);
    const accessToken = generateAccessToken(order.id, customer_id);

    await Order.updateOne(
      { _id: order._id },
      { download_token: downloadToken, access_token: accessToken }
    );

    // Send confirmation email
    await sendOrderConfirmationEmail(customer_id, order.id);

    // Generate NFT certificate
    await generateNFTCertificate(order.id);

    console.log(`Order ${order.order_id} completed successfully`);
  } catch (error) {
    console.error("Error handling Stripe checkout completion:", error);
  }
};
```

## ₿ NowPayments Integration

### 1. Create Crypto Payment

```javascript
// POST /api/payments/crypto/create-payment
const createCryptoPayment = async (productId, customerId, currency) => {
  const response = await fetch("/api/payments/crypto/create-payment", {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      product_id: productId,
      customer_id: customerId,
      pay_currency: currency, // btc, eth, usdc, sol, etc.
    }),
  });

  return response.json();
};

// Backend Implementation
app.post("/api/payments/crypto/create-payment", async (req, res) => {
  try {
    const { product_id, customer_id, pay_currency } = req.body;

    const product = await Product.findById(product_id);
    const customer = await Customer.findById(customer_id);

    if (!product || !customer) {
      return res.status(400).json({ error: "Invalid product or customer" });
    }

    // Create NowPayments invoice
    const nowPayments = new NowPaymentsApi({
      apiKey: process.env.NOWPAYMENTS_API_KEY,
      sandbox: process.env.NODE_ENV !== "production",
    });

    const payment = await nowPayments.createPayment({
      price_amount: product.price,
      price_currency: "usd",
      pay_currency: pay_currency,
      order_id: `KB-${Date.now()}-${product_id}`,
      order_description: product.title,
      ipn_callback_url: `${process.env.DOMAIN}/webhook/nowpayments`,
      success_url: `${process.env.DOMAIN}/checkout/crypto-success`,
      cancel_url: `${process.env.DOMAIN}/checkout/crypto-cancel`,
      customer_email: customer.email,
    });

    // Store payment record
    await CryptoTransaction.create({
      order_id: payment.order_id,
      nowpayments_payment_id: payment.payment_id,
      pay_address: payment.pay_address,
      pay_amount: payment.pay_amount,
      pay_currency: payment.pay_currency,
      price_amount: payment.price_amount,
      price_currency: payment.price_currency,
      status: payment.payment_status,
    });

    res.json(payment);
  } catch (error) {
    console.error("Crypto payment creation error:", error);
    res.status(500).json({ error: "Failed to create crypto payment" });
  }
});
```

### 2. Payment Status Checking

```javascript
// GET /api/payments/crypto/status/:paymentId
app.get("/api/payments/crypto/status/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;

    const nowPayments = new NowPaymentsApi({
      apiKey: process.env.NOWPAYMENTS_API_KEY,
      sandbox: process.env.NODE_ENV !== "production",
    });

    const status = await nowPayments.getPaymentStatus(paymentId);

    // Update local record
    await CryptoTransaction.updateOne(
      { nowpayments_payment_id: paymentId },
      {
        status: status.payment_status,
        transaction_hash: status.outcome?.hash,
        confirmations: status.outcome?.confirmations || 0,
      }
    );

    res.json(status);
  } catch (error) {
    console.error("Payment status check error:", error);
    res.status(500).json({ error: "Failed to check payment status" });
  }
});

// Frontend polling implementation
class PaymentStatusPoller {
  constructor(paymentId, onUpdate) {
    this.paymentId = paymentId;
    this.onUpdate = onUpdate;
    this.interval = null;
    this.attempts = 0;
    this.maxAttempts = 180; // 30 minutes
  }

  start() {
    this.interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/payments/crypto/status/${this.paymentId}`
        );
        const status = await response.json();

        this.onUpdate(status);

        if (["finished", "failed", "expired"].includes(status.payment_status)) {
          this.stop();
        }

        this.attempts++;
        if (this.attempts >= this.maxAttempts) {
          this.stop();
        }
      } catch (error) {
        console.error("Status polling error:", error);
      }
    }, 10000); // Poll every 10 seconds
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
```

### 3. IPN Webhook Handler

```javascript
// POST /webhook/nowpayments
app.post(
  "/webhook/nowpayments",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["x-nowpayments-sig"];
    const payload = req.body;

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha512", process.env.NOWPAYMENTS_IPN_SECRET)
      .update(payload)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Invalid NowPayments webhook signature");
      return res.status(400).send("Invalid signature");
    }

    const data = JSON.parse(payload);

    try {
      await handleCryptoPaymentUpdate(data);
      res.status(200).send("OK");
    } catch (error) {
      console.error("Crypto payment webhook error:", error);
      res.status(500).send("Internal error");
    }
  }
);

const handleCryptoPaymentUpdate = async (data) => {
  const { payment_id, payment_status, order_id } = data;

  // Update transaction record
  await CryptoTransaction.updateOne(
    { nowpayments_payment_id: payment_id },
    {
      status: payment_status,
      transaction_hash: data.outcome?.hash,
      confirmations: data.outcome?.confirmations || 0,
      updated_at: new Date(),
    }
  );

  if (payment_status === "finished") {
    // Payment completed successfully
    const transaction = await CryptoTransaction.findOne({
      nowpayments_payment_id: payment_id,
    });

    if (transaction) {
      // Create order record
      const order = await Order.create({
        order_id: order_id,
        customer_id: transaction.customer_id,
        product_id: transaction.product_id,
        amount: transaction.price_amount,
        currency: transaction.price_currency,
        payment_method: "crypto",
        payment_currency: transaction.pay_currency,
        status: "completed",
        nowpayments_invoice_id: payment_id,
        transaction_hash: data.outcome?.hash,
        completed_at: new Date(),
      });

      // Generate tokens and send confirmations
      await completeOrder(order.id);
    }
  }
};
```

## 🔄 Order Management API

### 1. Get Order Details

```javascript
// GET /api/orders/:orderId
app.get("/api/orders/:orderId", authenticateUser, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({
      order_id: orderId,
      customer_id: userId,
    })
      .populate("product_id")
      .populate("customer_id");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Include download links if order is completed
    let downloadLinks = {};
    if (order.status === "completed" && order.download_token) {
      downloadLinks = {
        product: `/api/download/product/${order.product_id._id}?token=${order.download_token}`,
        nft: `/api/download/nft/${order.nft_certificate_id}?token=${order.download_token}`,
      };
    }

    res.json({
      order: {
        id: order.order_id,
        status: order.status,
        amount: order.amount,
        currency: order.currency,
        payment_method: order.payment_method,
        payment_currency: order.payment_currency,
        transaction_id:
          order.stripe_payment_intent_id || order.transaction_hash,
        created_at: order.created_at,
        completed_at: order.completed_at,
      },
      product: {
        id: order.product_id._id,
        title: order.product_id.title,
        description: order.product_id.description,
        image_url: order.product_id.image_url,
      },
      customer: {
        id: order.customer_id._id,
        name: order.customer_id.name,
        email: order.customer_id.email,
      },
      download_links: downloadLinks,
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ error: "Failed to retrieve order" });
  }
});
```

### 2. Download Endpoints

```javascript
// GET /api/download/product/:productId
app.get(
  "/api/download/product/:productId",
  validateDownloadToken,
  async (req, res) => {
    try {
      const { productId } = req.params;
      const { order_id, customer_id } = req.downloadAuth;

      // Verify order ownership
      const order = await Order.findOne({
        id: order_id,
        customer_id: customer_id,
        product_id: productId,
        status: "completed",
      });

      if (!order) {
        return res.status(403).json({ error: "Access denied" });
      }

      const product = await Product.findById(productId);

      // Track download
      await DownloadLog.create({
        order_id: order_id,
        customer_id: customer_id,
        product_id: productId,
        download_type: "product",
        ip_address: req.ip,
        user_agent: req.headers["user-agent"],
      });

      // Serve file
      const filePath = path.join(
        process.env.DIGITAL_ASSETS_PATH,
        product.file_path
      );
      res.download(filePath, product.download_filename);
    } catch (error) {
      console.error("Product download error:", error);
      res.status(500).json({ error: "Download failed" });
    }
  }
);

// GET /api/download/nft/:certificateId
app.get(
  "/api/download/nft/:certificateId",
  validateDownloadToken,
  async (req, res) => {
    try {
      const { certificateId } = req.params;
      const { order_id, customer_id } = req.downloadAuth;

      const certificate = await NFTCertificate.findOne({
        id: certificateId,
        order_id: order_id,
        customer_id: customer_id,
      });

      if (!certificate) {
        return res.status(404).json({ error: "Certificate not found" });
      }

      // Track download
      await DownloadLog.create({
        order_id: order_id,
        customer_id: customer_id,
        certificate_id: certificateId,
        download_type: "nft",
        ip_address: req.ip,
        user_agent: req.headers["user-agent"],
      });

      // Serve NFT certificate
      const filePath = path.join(
        process.env.NFT_CERTIFICATES_PATH,
        certificate.file_path
      );
      res.download(filePath, `${certificate.name}.pdf`);
    } catch (error) {
      console.error("NFT download error:", error);
      res.status(500).json({ error: "Certificate download failed" });
    }
  }
);
```

## 📊 Analytics & Reporting API

### 1. Revenue Analytics

```javascript
// GET /api/admin/revenue
app.get("/api/admin/revenue", requireAdminAuth, async (req, res) => {
  try {
    const { period = "today", start_date, end_date } = req.query;

    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case "today":
        dateFilter = {
          created_at: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          },
        };
        break;
      case "week":
        dateFilter = {
          created_at: {
            $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            $lt: now,
          },
        };
        break;
      case "custom":
        if (start_date && end_date) {
          dateFilter = {
            created_at: {
              $gte: new Date(start_date),
              $lt: new Date(end_date),
            },
          };
        }
        break;
    }

    const revenue = await Order.aggregate([
      { $match: { status: "completed", ...dateFilter } },
      {
        $group: {
          _id: "$payment_method",
          total_amount: { $sum: "$amount" },
          transaction_count: { $sum: 1 },
          average_order_value: { $avg: "$amount" },
        },
      },
    ]);

    res.json({
      period: period,
      revenue: revenue,
      total: revenue.reduce((sum, r) => sum + r.total_amount, 0),
      transactions: revenue.reduce((sum, r) => sum + r.transaction_count, 0),
    });
  } catch (error) {
    console.error("Revenue analytics error:", error);
    res.status(500).json({ error: "Failed to fetch revenue data" });
  }
});
```

## 🔒 Security Implementations

### Rate Limiting

```javascript
const rateLimit = require("express-rate-limit");

// Payment creation rate limiting
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 payment requests per windowMs
  message: "Too many payment attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/payments/", paymentLimiter);

// API key rate limiting
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each API key to 100 requests per minute
  keyGenerator: (req) => req.headers["x-api-key"] || req.ip,
  message: "API rate limit exceeded",
});

app.use("/api/", apiLimiter);
```

### Input Validation

```javascript
const { body, validationResult } = require("express-validator");

// Payment validation middleware
const validatePaymentRequest = [
  body("product_id").isMongoId().withMessage("Invalid product ID"),
  body("customer_id").isMongoId().withMessage("Invalid customer ID"),
  body("pay_currency")
    .optional()
    .isIn(["btc", "eth", "usdc", "sol"])
    .withMessage("Invalid currency"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

app.post(
  "/api/payments/crypto/create-payment",
  validatePaymentRequest,
  async (req, res) => {
    // Implementation here
  }
);
```

---

**API Version**: 2024-01-01
**Last Updated**: December 2024
**Support**: api-support@kanesbookstore.com
