# NowPayments Crypto Checkout Screen - Screen Specification

## 🎯 Screen Overview

The NowPayments Crypto Checkout Screen provides a comprehensive cryptocurrency payment interface supporting multiple digital currencies including BTC, ETH, USDC, SOL, and more.

## 📱 Crypto Checkout Layout

### Layout Structure

```
┌─────────────────────────────────────────┐
│ 🔙 Back to Kane's Bookstore             │
├─────────────────────────────────────────┤
│ ₿ Crypto Checkout - Powered by          │
│   NOWPayments                           │
├─────────────────────────────────────────┤
│ 📦 Order Summary                        │
│ Digital Marketing Mastery               │
│ $25.00 USD                              │
├─────────────────────────────────────────┤
│ 🪙 Select Cryptocurrency                │
│ ┌─────────────────────────────────────┐ │
│ │ ₿ Bitcoin (BTC)                     │ │
│ │ ≈ 0.0008 BTC                        │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ Ξ Ethereum (ETH)                    │ │
│ │ ≈ 0.0156 ETH                        │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 💎 USD Coin (USDC)                  │ │
│ │ ≈ 25.00 USDC                        │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ ☀️ Solana (SOL)                     │ │
│ │ ≈ 0.58 SOL                          │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ 💰 Amount to Pay: 0.0008 BTC           │
│ 📍 Wallet Address:                      │
│ bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfj   │
│ [📋 Copy Address]                       │
├─────────────────────────────────────────┤
│ 📱 QR Code                              │
│ ┌─────────────────┐                     │
│ │ █▀▀▀▀▀▀▀▀▀▀▀▀█ │                     │
│ │ █ ▄▄▄▄▄ ▀▀▀ █ │                     │
│ │ █ █   █ ▀▀▀ █ │                     │
│ │ █ █▄▄▄█ ▀▀▀ █ │                     │
│ │ █▄▄▄▄▄▄▄▄▄▄▄▄█ │                     │
│ └─────────────────┘                     │
├─────────────────────────────────────────┤
│ ⏰ Complete payment within 15:00        │
│ 🔄 Status: Waiting for Payment          │
│ 💡 Send exact amount to address above   │
└─────────────────────────────────────────┘
```

## 🔧 NowPayments Integration

### Payment Creation API

```javascript
// Backend - Create NowPayments Invoice
const createCryptoPayment = async (productId, customerId, currency = "btc") => {
  const nowPayments = require("@nowpaymentsio/nowpayments-api-js");

  const npClient = new nowPayments({
    apiKey: process.env.NOWPAYMENTS_API_KEY,
    sandbox: process.env.NODE_ENV !== "production",
  });

  const payment = await npClient.createPayment({
    price_amount: product.price_usd,
    price_currency: "usd",
    pay_currency: currency,
    order_id: `KB-${Date.now()}-${productId}`,
    order_description: product.title,
    ipn_callback_url: `${process.env.DOMAIN}/webhook/nowpayments`,
    success_url: `${process.env.DOMAIN}/checkout/crypto-success`,
    cancel_url: `${process.env.DOMAIN}/checkout/crypto-cancel`,
    customer_email: customer.email,
    is_fee_paid_by_user: false,
  });

  return payment;
};
```

### Frontend Currency Selection

```javascript
// Frontend - Crypto Currency Selection
class CryptoCurrencySelector {
  constructor() {
    this.supportedCurrencies = [
      {
        symbol: "btc",
        name: "Bitcoin",
        icon: "₿",
        color: "#f7931a",
        network: "Bitcoin",
      },
      {
        symbol: "eth",
        name: "Ethereum",
        icon: "Ξ",
        color: "#627eea",
        network: "Ethereum",
      },
      {
        symbol: "usdc",
        name: "USD Coin",
        icon: "💎",
        color: "#2775ca",
        network: "Ethereum",
      },
      {
        symbol: "sol",
        name: "Solana",
        icon: "☀️",
        color: "#9945ff",
        network: "Solana",
      },
    ];

    this.selectedCurrency = null;
    this.exchangeRates = {};
  }

  async loadExchangeRates() {
    try {
      const response = await fetch("/api/crypto-rates");
      this.exchangeRates = await response.json();
      this.updateCurrencyDisplay();
    } catch (error) {
      console.error("Failed to load exchange rates:", error);
    }
  }

  selectCurrency(currencySymbol) {
    this.selectedCurrency = currencySymbol;
    this.updateSelectedDisplay();
    this.createPaymentInvoice(currencySymbol);

    // Analytics
    gtag("event", "select_crypto_currency", {
      currency: currencySymbol,
      product_id: product.id,
      usd_amount: product.price_usd,
    });
  }

  async createPaymentInvoice(currency) {
    try {
      showLoadingIndicator();

      const response = await fetch("/api/create-crypto-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          currency: currency,
          customer_id: getCurrentCustomerId(),
        }),
      });

      const payment = await response.json();

      if (payment.error) {
        throw new Error(payment.error);
      }

      this.displayPaymentDetails(payment);
    } catch (error) {
      hideLoadingIndicator();
      showErrorMessage("Unable to create crypto payment. Please try again.");
    }
  }

  displayPaymentDetails(payment) {
    document.getElementById("payment-amount").textContent = `${
      payment.pay_amount
    } ${payment.pay_currency.toUpperCase()}`;

    document.getElementById("wallet-address").textContent = payment.pay_address;

    this.generateQRCode(
      payment.pay_address,
      payment.pay_amount,
      payment.pay_currency
    );
    this.startPaymentTimer(payment.created_at, payment.time_limit);
    this.startStatusPolling(payment.payment_id);
  }
}
```

## 🎨 UI Components

### Currency Selection Cards

```css
.currency-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.currency-card {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.currency-card:hover {
  border-color: #3182ce;
  box-shadow: 0 4px 12px rgba(49, 130, 206, 0.1);
  transform: translateY(-2px);
}

.currency-card.selected {
  border-color: #48bb78;
  background: #f0fff4;
}

.currency-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.currency-icon {
  font-size: 24px;
}

.currency-name {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.currency-amount {
  font-size: 16px;
  color: #718096;
  font-weight: 500;
}

.currency-network {
  font-size: 12px;
  color: #a0aec0;
  margin-top: 4px;
}
```

### Payment Details Section

```css
.payment-details {
  background: #f7fafc;
  border-radius: 12px;
  padding: 24px;
  margin: 24px 0;
}

.payment-amount {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 16px;
}

.wallet-address-section {
  margin: 20px 0;
}

.wallet-address {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  font-family: monospace;
  font-size: 14px;
  word-break: break-all;
  margin: 8px 0;
}

.copy-button {
  background: #4299e1;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.copy-button:hover {
  background: #3182ce;
}

.copy-button.copied {
  background: #48bb78;
}
```

### QR Code Display

```javascript
// QR Code Generation
function generateQRCode(address, amount, currency) {
  const qrContainer = document.getElementById("qr-code-container");

  // Create payment URI for better UX
  const paymentURI = createPaymentURI(address, amount, currency);

  // Generate QR code using QRCode.js library
  const qr = new QRCode(qrContainer, {
    text: paymentURI,
    width: 200,
    height: 200,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M,
  });
}

function createPaymentURI(address, amount, currency) {
  switch (currency.toLowerCase()) {
    case "btc":
      return `bitcoin:${address}?amount=${amount}`;
    case "eth":
    case "usdc":
      return `ethereum:${address}?value=${amount}`;
    case "sol":
      return `solana:${address}?amount=${amount}`;
    default:
      return address;
  }
}
```

## ⏰ Payment Timer & Status Polling

### Payment Timer Implementation

```javascript
class PaymentTimer {
  constructor(timeLimit = 900) {
    // 15 minutes default
    this.timeLimit = timeLimit;
    this.startTime = Date.now();
    this.timerElement = document.getElementById("payment-timer");
    this.interval = null;
  }

  start() {
    this.interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const remaining = Math.max(0, this.timeLimit - elapsed);

      if (remaining === 0) {
        this.onTimeout();
        return;
      }

      this.updateDisplay(remaining);
    }, 1000);
  }

  updateDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    this.timerElement.textContent = `Complete payment within ${minutes}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  onTimeout() {
    clearInterval(this.interval);
    this.showTimeoutMessage();

    // Analytics
    gtag("event", "crypto_payment_timeout", {
      payment_method: "crypto",
      timeout_duration: this.timeLimit,
    });
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
```

### Status Polling

```javascript
class PaymentStatusPoller {
  constructor(paymentId) {
    this.paymentId = paymentId;
    this.pollInterval = 10000; // 10 seconds
    this.maxAttempts = 180; // 30 minutes max
    this.attempts = 0;
    this.polling = false;
  }

  start() {
    this.polling = true;
    this.poll();
  }

  async poll() {
    if (!this.polling || this.attempts >= this.maxAttempts) {
      this.stop();
      return;
    }

    try {
      const response = await fetch(`/api/payment-status/${this.paymentId}`);
      const status = await response.json();

      this.updateStatusDisplay(status);

      if (status.payment_status === "finished") {
        this.onPaymentComplete(status);
        return;
      }

      if (
        status.payment_status === "failed" ||
        status.payment_status === "expired"
      ) {
        this.onPaymentFailed(status);
        return;
      }

      this.attempts++;
      setTimeout(() => this.poll(), this.pollInterval);
    } catch (error) {
      console.error("Status polling error:", error);
      this.attempts++;
      setTimeout(() => this.poll(), this.pollInterval);
    }
  }

  updateStatusDisplay(status) {
    const statusElement = document.getElementById("payment-status");
    const statusMap = {
      waiting: "🔄 Waiting for Payment",
      confirming: "⏳ Confirming Transaction",
      confirmed: "✅ Payment Confirmed",
      sending: "📤 Processing Payment",
      finished: "✅ Payment Complete",
      failed: "❌ Payment Failed",
      expired: "⏰ Payment Expired",
    };

    statusElement.textContent =
      statusMap[status.payment_status] || status.payment_status;

    if (status.confirmations) {
      statusElement.textContent += ` (${status.confirmations} confirmations)`;
    }
  }

  onPaymentComplete(status) {
    this.stop();

    // Analytics
    gtag("event", "purchase", {
      transaction_id: status.payment_id,
      value: status.price_amount,
      currency: "USD",
      payment_method: "crypto",
      crypto_currency: status.pay_currency,
    });

    // Redirect to success page
    window.location.href = `/checkout/crypto-success?payment_id=${status.payment_id}`;
  }

  stop() {
    this.polling = false;
  }
}
```

## 🔒 Security Features

### Webhook Verification

```javascript
// NowPayments IPN Handler
app.post(
  "/webhook/nowpayments",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const receivedSignature = req.headers["x-nowpayments-sig"];
    const payload = req.body;

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha512", process.env.NOWPAYMENTS_IPN_SECRET)
      .update(payload)
      .digest("hex");

    if (receivedSignature !== expectedSignature) {
      console.error("Invalid webhook signature");
      return res.status(400).send("Invalid signature");
    }

    const data = JSON.parse(payload);

    // Process payment update
    handleCryptoPaymentUpdate(data);

    res.status(200).send("OK");
  }
);
```

## 📊 Analytics & Tracking

### Crypto-Specific Events

```javascript
const cryptoAnalytics = {
  currencySelection: (currency, amount) => {
    gtag("event", "select_crypto_currency", {
      currency: currency,
      amount_usd: amount,
      conversion_rate: exchangeRates[currency],
    });
  },

  addressCopy: (currency) => {
    gtag("event", "copy_wallet_address", {
      currency: currency,
    });
  },

  qrCodeView: (currency) => {
    gtag("event", "view_qr_code", {
      currency: currency,
    });
  },

  paymentTimeout: (currency, timeElapsed) => {
    gtag("event", "crypto_payment_timeout", {
      currency: currency,
      time_elapsed: timeElapsed,
    });
  },
};
```

## ✅ Testing Checklist

### Functional Testing

- [ ] Currency selection works
- [ ] Payment creation successful
- [ ] QR code generation
- [ ] Address copying
- [ ] Timer countdown
- [ ] Status polling
- [ ] Webhook processing
- [ ] Success/failure handling

### Cryptocurrency Testing

- [ ] Bitcoin testnet payments
- [ ] Ethereum testnet payments
- [ ] USDC testnet payments
- [ ] Solana devnet payments
- [ ] Multiple confirmation levels
- [ ] Payment expiration handling

---

**Implementation Priority**: High (Core crypto payment processor)
**Development Time**: 4-5 days
**Dependencies**: NowPayments account, webhook endpoints, testnet currencies
