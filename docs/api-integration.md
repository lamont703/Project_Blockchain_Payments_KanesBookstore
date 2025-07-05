# API Integration Guide - Kane's Bookstore Payment System

## 🎯 Overview

This document provides comprehensive integration guidelines for Kane's Bookstore hybrid payment system, covering both Stripe and NowPayments APIs, along with custom endpoints for order management, digital asset delivery, **wallet connection functionality, NFT validation, and gated ebook reader access**.

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

const BLOCKCHAIN_ENDPOINTS = {
  ethereum: {
    mainnet: "https://mainnet.infura.io/v3/YOUR_PROJECT_ID",
    testnet: "https://goerli.infura.io/v3/YOUR_PROJECT_ID",
  },
  polygon: {
    mainnet: "https://polygon-rpc.com",
    testnet: "https://rpc-mumbai.matic.today",
  },
  solana: {
    mainnet: "https://api.mainnet-beta.solana.com",
    testnet: "https://api.testnet.solana.com",
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

// Wallet Authentication
const walletHeaders = {
  Authorization: `Bearer ${process.env.WALLET_SESSION_TOKEN}`,
  "Content-Type": "application/json",
  "X-Wallet-Address": connectedWalletAddress,
  "X-Chain-ID": chainId.toString(),
};
```

## 🔗 Wallet Connection API

### 1. Initiate Wallet Connection

```javascript
// POST /api/wallet/connect/initiate
const initiateWalletConnection = async (walletType, chainId) => {
  const response = await fetch("/api/wallet/connect/initiate", {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      wallet_type: walletType, // 'metamask', 'walletconnect', 'coinbase', etc.
      chain_id: chainId,
      timestamp: Date.now(),
    }),
  });

  const result = await response.json();
  return result;
};

// Backend Implementation
app.post("/api/wallet/connect/initiate", async (req, res) => {
  try {
    const { wallet_type, chain_id, timestamp } = req.body;

    // Generate nonce for signature verification
    const nonce = crypto.randomBytes(16).toString("hex");
    const message = `Connect wallet to Kane's Bookstore\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

    // Store nonce temporarily (expires in 10 minutes)
    await redis.setex(
      `wallet_nonce_${nonce}`,
      600,
      JSON.stringify({
        wallet_type,
        chain_id,
        timestamp,
        created_at: new Date().toISOString(),
      })
    );

    res.json({
      success: true,
      nonce,
      message,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Wallet connection initiation error:", error);
    res.status(500).json({ error: "Failed to initiate wallet connection" });
  }
});
```

### 2. Verify Wallet Signature

```javascript
// POST /api/wallet/connect/verify
const verifyWalletSignature = async (walletAddress, signature, nonce) => {
  const response = await fetch("/api/wallet/connect/verify", {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      wallet_address: walletAddress,
      signature: signature,
      nonce: nonce,
    }),
  });

  const result = await response.json();
  return result;
};

// Backend Implementation
app.post("/api/wallet/connect/verify", async (req, res) => {
  try {
    const { wallet_address, signature, nonce } = req.body;

    // Retrieve nonce data
    const nonceData = await redis.get(`wallet_nonce_${nonce}`);
    if (!nonceData) {
      return res.status(400).json({ error: "Invalid or expired nonce" });
    }

    const { wallet_type, chain_id, timestamp } = JSON.parse(nonceData);
    const message = `Connect wallet to Kane's Bookstore\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

    // Verify signature using Web3
    const recoveredAddress = await verifySignature(
      message,
      signature,
      wallet_type
    );

    if (recoveredAddress.toLowerCase() !== wallet_address.toLowerCase()) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Create or update wallet connection
    const connection = await WalletConnection.findOneAndUpdate(
      { wallet_address: wallet_address.toLowerCase() },
      {
        wallet_address: wallet_address.toLowerCase(),
        wallet_type,
        chain_id,
        signature,
        message,
        is_active: true,
        last_connected_at: new Date(),
      },
      { upsert: true, new: true }
    );

    // Generate session token
    const sessionToken = jwt.sign(
      {
        wallet_address: wallet_address.toLowerCase(),
        wallet_type,
        chain_id,
        connection_id: connection._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Clean up nonce
    await redis.del(`wallet_nonce_${nonce}`);

    res.json({
      success: true,
      session_token: sessionToken,
      wallet_address: wallet_address.toLowerCase(),
      wallet_type,
      chain_id,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Wallet signature verification error:", error);
    res.status(500).json({ error: "Failed to verify wallet signature" });
  }
});
```

### 3. Get Wallet NFTs

```javascript
// GET /api/wallet/nfts/:walletAddress
const getWalletNFTs = async (walletAddress, chainId) => {
  const response = await fetch(
    `/api/wallet/nfts/${walletAddress}?chain_id=${chainId}`,
    {
      method: "GET",
      headers: walletHeaders,
    }
  );

  const nfts = await response.json();
  return nfts;
};

// Backend Implementation
app.get("/api/wallet/nfts/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { chain_id } = req.query;

    // Validate wallet ownership
    const isOwner = await validateWalletOwnership(req.headers, walletAddress);
    if (!isOwner) {
      return res.status(403).json({ error: "Unauthorized wallet access" });
    }

    // Get NFTs from multiple sources
    const [alchemyNFTs, moralisNFTs, cachedNFTs] = await Promise.all([
      getAlchemyNFTs(walletAddress, chain_id),
      getMoralisNFTs(walletAddress, chain_id),
      getCachedNFTs(walletAddress, chain_id),
    ]);

    // Merge and deduplicate NFTs
    const allNFTs = mergeNFTData(alchemyNFTs, moralisNFTs, cachedNFTs);

    // Update cache
    await updateNFTCache(walletAddress, chain_id, allNFTs);

    res.json({
      success: true,
      wallet_address: walletAddress,
      chain_id: parseInt(chain_id),
      nfts: allNFTs,
      last_updated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get wallet NFTs error:", error);
    res.status(500).json({ error: "Failed to retrieve wallet NFTs" });
  }
});
```

## 🛡️ NFT Validation API

### 1. Validate NFT Ownership

```javascript
// POST /api/nft/validate
const validateNFTOwnership = async (
  walletAddress,
  contractAddress,
  tokenId,
  chainId
) => {
  const response = await fetch("/api/nft/validate", {
    method: "POST",
    headers: walletHeaders,
    body: JSON.stringify({
      wallet_address: walletAddress,
      contract_address: contractAddress,
      token_id: tokenId,
      chain_id: chainId,
    }),
  });

  const result = await response.json();
  return result;
};

// Backend Implementation
app.post("/api/nft/validate", async (req, res) => {
  try {
    const { wallet_address, contract_address, token_id, chain_id } = req.body;

    // Validate wallet ownership
    const isOwner = await validateWalletOwnership(req.headers, wallet_address);
    if (!isOwner) {
      return res.status(403).json({ error: "Unauthorized wallet access" });
    }

    // Perform on-chain validation
    const provider = getProvider(chain_id);
    const contract = new ethers.Contract(
      contract_address,
      ERC721_ABI,
      provider
    );

    let ownerAddress;
    try {
      ownerAddress = await contract.ownerOf(token_id);
    } catch (error) {
      return res
        .status(400)
        .json({ error: "NFT does not exist or invalid contract" });
    }

    const isValid = ownerAddress.toLowerCase() === wallet_address.toLowerCase();

    if (isValid) {
      // Get NFT metadata
      const metadata = await getNFTMetadata(
        contract_address,
        token_id,
        chain_id
      );

      // Store/update NFT ownership record
      await NFTOwnership.findOneAndUpdate(
        { contract_address, token_id, chain_id },
        {
          wallet_address: wallet_address.toLowerCase(),
          contract_address,
          token_id,
          chain_id,
          metadata_uri: metadata.tokenURI,
          collection_name: metadata.collection_name,
          token_name: metadata.name,
          attributes: metadata.attributes,
          last_verified_at: new Date(),
          is_valid: true,
        },
        { upsert: true, new: true }
      );
    }

    res.json({
      success: true,
      is_valid: isValid,
      owner_address: ownerAddress,
      wallet_address: wallet_address.toLowerCase(),
      contract_address,
      token_id,
      chain_id,
      verified_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("NFT validation error:", error);
    res.status(500).json({ error: "Failed to validate NFT ownership" });
  }
});
```

### 2. Check Book Access

```javascript
// GET /api/books/:bookId/access
const checkBookAccess = async (bookId, walletAddress) => {
  const response = await fetch(`/api/books/${bookId}/access`, {
    method: "GET",
    headers: walletHeaders,
  });

  const access = await response.json();
  return access;
};

// Backend Implementation
app.get("/api/books/:bookId/access", async (req, res) => {
  try {
    const { bookId } = req.params;
    const walletAddress = req.headers["x-wallet-address"];

    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address required" });
    }

    // Get book requirements
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Check existing access
    const existingAccess = await BookAccess.findOne({
      book_id: bookId,
      wallet_address: walletAddress.toLowerCase(),
    });

    if (existingAccess && existingAccess.expires_at > new Date()) {
      return res.json({
        success: true,
        has_access: true,
        access_type: existingAccess.access_type,
        access_method: existingAccess.access_method,
        expires_at: existingAccess.expires_at,
      });
    }

    // Check NFT-based access
    if (book.nft_collection_address) {
      const nfts = await NFTOwnership.find({
        wallet_address: walletAddress.toLowerCase(),
        contract_address: book.nft_collection_address,
        is_valid: true,
      });

      if (nfts.length > 0) {
        // Check if any NFT meets the trait requirements
        const qualifyingNFT = nfts.find((nft) =>
          matchesTraitRequirements(nft.attributes, book.required_nft_traits)
        );

        if (qualifyingNFT) {
          // Grant access
          await BookAccess.findOneAndUpdate(
            { book_id: bookId, wallet_address: walletAddress.toLowerCase() },
            {
              book_id: bookId,
              wallet_address: walletAddress.toLowerCase(),
              access_type: "full",
              access_method: "nft_validation",
              qualifying_nft_id: qualifyingNFT._id,
              last_accessed_at: new Date(),
            },
            { upsert: true, new: true }
          );

          return res.json({
            success: true,
            has_access: true,
            access_type: "full",
            access_method: "nft_validation",
            qualifying_nft: qualifyingNFT,
          });
        }
      }
    }

    res.json({
      success: true,
      has_access: false,
      required_nft_collection: book.nft_collection_address,
      required_traits: book.required_nft_traits,
    });
  } catch (error) {
    console.error("Book access check error:", error);
    res.status(500).json({ error: "Failed to check book access" });
  }
});
```

## 📖 Ebook Reader API

### 1. Generate Reading Session

```javascript
// POST /api/reader/session
const generateReadingSession = async (bookId, walletAddress) => {
  const response = await fetch("/api/reader/session", {
    method: "POST",
    headers: walletHeaders,
    body: JSON.stringify({
      book_id: bookId,
      wallet_address: walletAddress,
    }),
  });

  const session = await response.json();
  return session;
};

// Backend Implementation
app.post("/api/reader/session", async (req, res) => {
  try {
    const { book_id, wallet_address } = req.body;

    // Validate wallet ownership
    const isOwner = await validateWalletOwnership(req.headers, wallet_address);
    if (!isOwner) {
      return res.status(403).json({ error: "Unauthorized wallet access" });
    }

    // Check book access
    const hasAccess = await checkBookAccess(book_id, wallet_address);
    if (!hasAccess) {
      return res.status(403).json({ error: "No access to this book" });
    }

    // Generate reading session token
    const sessionToken = jwt.sign(
      {
        book_id,
        wallet_address: wallet_address.toLowerCase(),
        access_type: "reader",
        session_id: crypto.randomUUID(),
      },
      process.env.READER_JWT_SECRET,
      { expiresIn: "15m" } // Short-lived token
    );

    res.json({
      success: true,
      session_token: sessionToken,
      book_id,
      wallet_address: wallet_address.toLowerCase(),
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Reading session generation error:", error);
    res.status(500).json({ error: "Failed to generate reading session" });
  }
});
```

### 2. Get Book Content

```javascript
// GET /api/reader/book/:bookId/content
const getBookContent = async (bookId, sessionToken) => {
  const response = await fetch(`/api/reader/book/${bookId}/content`, {
    method: "GET",
    headers: {
      ...headers,
      Authorization: `Bearer ${sessionToken}`,
    },
  });

  const content = await response.json();
  return content;
};

// Backend Implementation
app.get("/api/reader/book/:bookId/content", async (req, res) => {
  try {
    const { bookId } = req.params;
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Reading session token required" });
    }

    // Verify session token
    const decoded = jwt.verify(token, process.env.READER_JWT_SECRET);

    if (decoded.book_id !== bookId) {
      return res.status(403).json({ error: "Invalid session for this book" });
    }

    // Get book
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Get PDF content with watermark
    const pdfBuffer = await generateWatermarkedPDF(
      book.pdf_file_url,
      decoded.wallet_address
    );

    // Update reading progress
    await updateReadingProgress(decoded.wallet_address, bookId);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="book.pdf"',
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error("Book content retrieval error:", error);
    res.status(500).json({ error: "Failed to retrieve book content" });
  }
});
```

### 3. Update Reading Progress

```javascript
// POST /api/reader/progress
const updateReadingProgress = async (bookId, chapter, walletAddress) => {
  const response = await fetch("/api/reader/progress", {
    method: "POST",
    headers: walletHeaders,
    body: JSON.stringify({
      book_id: bookId,
      chapter: chapter,
      wallet_address: walletAddress,
      timestamp: Date.now(),
    }),
  });

  const result = await response.json();
  return result;
};

// Backend Implementation
app.post("/api/reader/progress", async (req, res) => {
  try {
    const { book_id, chapter, wallet_address, timestamp } = req.body;

    // Validate wallet ownership
    const isOwner = await validateWalletOwnership(req.headers, wallet_address);
    if (!isOwner) {
      return res.status(403).json({ error: "Unauthorized wallet access" });
    }

    // Update reading progress
    await BookAccess.findOneAndUpdate(
      { book_id, wallet_address: wallet_address.toLowerCase() },
      {
        current_chapter: chapter,
        last_accessed_at: new Date(timestamp),
        $push: {
          reading_progress: {
            chapter,
            timestamp: new Date(timestamp),
          },
        },
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      book_id,
      chapter,
      wallet_address: wallet_address.toLowerCase(),
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Reading progress update error:", error);
    res.status(500).json({ error: "Failed to update reading progress" });
  }
});
```

## 💳 Stripe Integration

### 1. Create Checkout Session

```javascript
// POST /api/payments/stripe/create-session
const createStripeSession = async (
  productId,
  customerId,
  walletAddress = null
) => {
  const response = await fetch("/api/payments/stripe/create-session", {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      product_id: productId,
      customer_id: customerId,
      wallet_address: walletAddress, // Optional: Link payment to wallet
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
    const { product_id, customer_id, wallet_address } = req.body;

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
        wallet_address: wallet_address || "",
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
    const { product_id, customer_id, wallet_address } = session.metadata;

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
      wallet_address: wallet_address || null,
      completed_at: new Date(),
    });

    // Generate download tokens
    const downloadToken = generateDownloadToken(order.id, customer_id);
    const accessToken = generateAccessToken(order.id, customer_id);

    await Order.updateOne(
      { _id: order._id },
      { download_token: downloadToken, access_token: accessToken }
    );

    // Grant book access if wallet is connected
    if (wallet_address) {
      await BookAccess.findOneAndUpdate(
        { book_id: product_id, wallet_address: wallet_address.toLowerCase() },
        {
          book_id: product_id,
          wallet_address: wallet_address.toLowerCase(),
          access_type: "full",
          access_method: "purchase",
          last_accessed_at: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    // Send confirmation email
    await sendOrderConfirmationEmail(customer_id, order.id);

    // Generate NFT certificate
    await generateNFTCertificate(order.id);

    console.log(`Order ${order.order_id} completed successfully`);

    // Update GoHighLevel contact
    await updateGHLContact(customer_id, {
      payment_method: "stripe",
      transaction_id: session.payment_intent,
      order_id: order.order_id,
      wallet_address: wallet_address || "",
      book_access: "granted",
    });
  } catch (error) {
    console.error("Stripe checkout completion error:", error);
    throw error;
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
