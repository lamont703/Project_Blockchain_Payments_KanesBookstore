# Product Detail Page - Screen Specification

## 🎯 Screen Overview

**Updated Version 2.0** - The Product Detail Page now includes wallet connection functionality and NFT-gated access options alongside traditional payment methods. This page serves as the main entry point for customers to view book details, connect their crypto wallet, and choose between purchasing or accessing via NFT ownership.

## 📱 Mobile-First Design Specifications

### Layout Structure

```
┌─────────────────────────────────────────┐
│ Kane's Bookstore Logo    [Connect Wallet]│
├─────────────────────────────────────────┤
│                                         │
│          Product Image                  │
│         (4:3 aspect ratio)              │
│                                         │
├─────────────────────────────────────────┤
│ Product Title                           │
│ (Typography: 24px, Bold)                │
├─────────────────────────────────────────┤
│ 🔒 Access Level: [Premium NFT Required] │
├─────────────────────────────────────────┤
│ 💰 Dual Pricing Display                │
│ $25.00 USD                              │
│ ≈ 50 Tomlin Coins                       │
│ ≈ 0.0008 BTC                            │
├─────────────────────────────────────────┤
│ 🎯 NFT Access Panel                     │
│ Required: Kane's Premium Collection     │
│ [Check Your NFTs] [Wallet: 0x123...]    │
├─────────────────────────────────────────┤
│ Product Description                     │
│ (Typography: 16px, Regular)             │
├─────────────────────────────────────────┤
│ [📖 Read Now] (if NFT valid)            │
│ [💳 Buy with Card ($25)]                │
│ [₿ Buy with Crypto]                     │
├─────────────────────────────────────────┤
│ Additional Info                         │
│ • Instant download                      │
│ • 30-day guarantee                      │
│ • NFT certificate included              │
│ • Ebook reader access                   │
├─────────────────────────────────────────┤
│ 🔒 Security Badges                      │
│ SSL | Stripe | NowPayments | Web3       │
└─────────────────────────────────────────┘
```

## 🎨 Design Components

### Header Section

- **Logo**: Kane's Bookstore branding
- **Wallet Connection**: Connect/disconnect wallet button with address display
- **Chain Selector**: Network selection dropdown (Ethereum, Polygon, BSC)
- **Navigation**: Minimal for focus
- **Background**: Clean white/light gray

### Wallet Connection Component

- **Button States**:
  - Disconnected: "Connect Wallet" button
  - Connecting: "Connecting..." with loading spinner
  - Connected: "0x123...abc" with disconnect option
- **Supported Wallets**: MetaMask, WalletConnect, Coinbase Wallet, Trust Wallet
- **Error Handling**: Clear error messages for connection failures

### NFT Access Panel

- **Required Collection**: Display NFT collection name and contract address
- **Validation Status**:
  - Not Connected: "Connect wallet to check NFT access"
  - Checking: "Validating NFT ownership..." with spinner
  - Valid: "✅ Access granted! NFT verified"
  - Invalid: "❌ No qualifying NFT found"
- **Qualifying NFTs**: Display owned NFTs that grant access

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

.btn-read-now {
  background: #10b981;
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 18px;
  display: none; /* Show only when NFT is valid */
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

.btn-connect-wallet {
  background: #8b5cf6;
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
  <!-- Header with Wallet Connection -->
  <div class="header-section">
    <div class="logo">Kane's Bookstore</div>
    <div class="wallet-connection">
      <button
        id="connect-wallet-btn"
        class="btn-connect-wallet"
        onclick="connectWallet()"
      >
        Connect Wallet
      </button>
      <div id="wallet-info" class="wallet-info" style="display: none;">
        <span id="wallet-address"></span>
        <button onclick="disconnectWallet()" class="btn-disconnect">
          Disconnect
        </button>
      </div>
    </div>
  </div>

  <div class="product-image-section">
    <img
      src="{{product.image_url}}"
      alt="{{product.title}}"
      class="product-image"
    />
  </div>

  <div class="product-info-section">
    <h1 class="product-title">{{product.title}}</h1>

    <!-- Access Level Badge -->
    <div class="access-level-badge">
      <span class="badge {{product.access_level}}"
        >{{product.access_level}} Access</span
      >
    </div>

    <!-- NFT Access Panel -->
    <div class="nft-access-panel" id="nft-access-panel">
      <div class="nft-requirement">
        <h3>NFT Access Required</h3>
        <p>Required Collection: {{product.required_nft_collection}}</p>
        <p>Contract: {{product.nft_contract_address}}</p>
      </div>

      <div class="nft-validation" id="nft-validation">
        <button
          id="check-nfts-btn"
          onclick="checkNFTAccess()"
          class="btn-check-nfts"
        >
          Check Your NFTs
        </button>
        <div id="nft-status" class="nft-status"></div>
      </div>
    </div>

    <div class="pricing-container">
      <div class="usd-price">${{product.price_usd}}</div>
      <div class="crypto-equivalent">
        ≈ {{product.price_tokens}} Tomlin Coins<br />
        ≈ {{product.price_btc}} BTC
      </div>
    </div>

    <div class="product-description">{{product.description}}</div>

    <div class="payment-buttons">
      <button
        id="btn-read-now"
        class="btn-read-now"
        onclick="openEbookReader()"
        style="display: none;"
      >
        📖 Read Now
      </button>
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
        <li>✓ Ebook reader access</li>
      </ul>
    </div>
  </div>
</div>
```

### JavaScript Functions

```javascript
// Global variables
let connectedWallet = null;
let currentChainId = null;
let hasNFTAccess = false;

// Wallet Connection Functions
async function connectWallet() {
  try {
    document.getElementById("connect-wallet-btn").innerText = "Connecting...";

    // Check if MetaMask is installed
    if (typeof window.ethereum !== "undefined") {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        connectedWallet = accounts[0];
        currentChainId = await window.ethereum.request({
          method: "eth_chainId",
        });

        // Verify wallet signature
        await verifyWalletSignature(connectedWallet);

        updateWalletUI();
        await checkNFTAccess();
      }
    } else {
      alert("Please install MetaMask to connect your wallet");
    }
  } catch (error) {
    console.error("Wallet connection failed:", error);
    document.getElementById("connect-wallet-btn").innerText = "Connect Wallet";
  }
}

async function verifyWalletSignature(walletAddress) {
  try {
    // Get nonce from server
    const initResponse = await fetch("/api/wallet/connect/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet_type: "metamask",
        chain_id: parseInt(currentChainId),
        timestamp: Date.now(),
      }),
    });

    const { nonce, message } = await initResponse.json();

    // Sign message
    const signature = await window.ethereum.request({
      method: "personal_sign",
      params: [message, walletAddress],
    });

    // Verify signature
    const verifyResponse = await fetch("/api/wallet/connect/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet_address: walletAddress,
        signature: signature,
        nonce: nonce,
      }),
    });

    const verifyResult = await verifyResponse.json();

    if (verifyResult.success) {
      // Store session token
      localStorage.setItem("wallet_session_token", verifyResult.session_token);
      return true;
    } else {
      throw new Error("Signature verification failed");
    }
  } catch (error) {
    console.error("Wallet verification failed:", error);
    throw error;
  }
}

function disconnectWallet() {
  connectedWallet = null;
  currentChainId = null;
  hasNFTAccess = false;

  // Clear session
  localStorage.removeItem("wallet_session_token");

  // Update UI
  updateWalletUI();
  updateNFTAccessUI();
}

function updateWalletUI() {
  const connectBtn = document.getElementById("connect-wallet-btn");
  const walletInfo = document.getElementById("wallet-info");
  const walletAddress = document.getElementById("wallet-address");

  if (connectedWallet) {
    connectBtn.style.display = "none";
    walletInfo.style.display = "block";
    walletAddress.innerText = `${connectedWallet.substring(
      0,
      6
    )}...${connectedWallet.substring(38)}`;
  } else {
    connectBtn.style.display = "block";
    connectBtn.innerText = "Connect Wallet";
    walletInfo.style.display = "none";
  }
}

// NFT Access Functions
async function checkNFTAccess() {
  if (!connectedWallet) {
    alert("Please connect your wallet first");
    return;
  }

  try {
    const checkBtn = document.getElementById("check-nfts-btn");
    const statusDiv = document.getElementById("nft-status");

    checkBtn.innerText = "Checking...";
    statusDiv.innerHTML = "Validating NFT ownership...";

    // Get wallet session token
    const sessionToken = localStorage.getItem("wallet_session_token");

    // Check book access
    const response = await fetch(`/api/books/${product.id}/access`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "X-Wallet-Address": connectedWallet,
        "X-Chain-ID": currentChainId,
      },
    });

    const accessData = await response.json();

    if (accessData.has_access) {
      hasNFTAccess = true;
      statusDiv.innerHTML = "✅ Access granted! NFT verified";
      statusDiv.className = "nft-status success";

      // Show "Read Now" button
      document.getElementById("btn-read-now").style.display = "block";
    } else {
      hasNFTAccess = false;
      statusDiv.innerHTML = "❌ No qualifying NFT found in your wallet";
      statusDiv.className = "nft-status error";

      // Hide "Read Now" button
      document.getElementById("btn-read-now").style.display = "none";
    }

    checkBtn.innerText = "Check Your NFTs";
  } catch (error) {
    console.error("NFT access check failed:", error);
    document.getElementById("nft-status").innerHTML =
      "Error checking NFT access";
    document.getElementById("check-nfts-btn").innerText = "Check Your NFTs";
  }
}

function updateNFTAccessUI() {
  const statusDiv = document.getElementById("nft-status");
  const readNowBtn = document.getElementById("btn-read-now");

  if (!connectedWallet) {
    statusDiv.innerHTML = "Connect wallet to check NFT access";
    statusDiv.className = "nft-status";
    readNowBtn.style.display = "none";
  }
}

// Ebook Reader Functions
async function openEbookReader() {
  if (!hasNFTAccess) {
    alert("NFT access required to read this book");
    return;
  }

  try {
    // Generate reading session
    const sessionToken = localStorage.getItem("wallet_session_token");

    const response = await fetch("/api/reader/session", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        book_id: product.id,
        wallet_address: connectedWallet,
      }),
    });

    const sessionData = await response.json();

    if (sessionData.success) {
      // Open ebook reader with session token
      window.open(
        `/reader/${product.id}?session=${sessionData.session_token}`,
        "_blank"
      );
    } else {
      alert("Failed to start reading session");
    }
  } catch (error) {
    console.error("Failed to open ebook reader:", error);
    alert("Error opening ebook reader");
  }
}

// Stripe Payment Initiation
function initiateStripePayment() {
  // Track event
  gtag("event", "begin_checkout", {
    currency: "USD",
    value: parseFloat(product.price_usd),
    payment_method: "stripe",
  });

  // Include wallet address if connected
  const walletParam = connectedWallet
    ? `&wallet_address=${connectedWallet}`
    : "";

  // Redirect to Stripe Checkout
  window.location.href = `/checkout/stripe?product_id=${product.id}${walletParam}`;
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
