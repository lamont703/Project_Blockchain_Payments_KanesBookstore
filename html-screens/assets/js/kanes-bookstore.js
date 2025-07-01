// Kane's Bookstore - Payment System JavaScript
// Version: 1.0.0

class KanesBookstore {
  constructor() {
    this.currentProduct = null;
    this.currentCustomer = null;
    this.exchangeRates = {};
    this.paymentStatusPoller = null;
    this.paymentTimer = null;
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.loadExchangeRates();
    this.detectGoHighLevelData();
  }
  
  // Detect and load GoHighLevel contact/product data
  detectGoHighLevelData() {
    // Try to get product data from page
    const productData = document.querySelector('[data-product-id]');
    if (productData) {
      this.currentProduct = {
        id: productData.dataset.productId,
        title: productData.dataset.productTitle || 'Digital Product',
        price: parseFloat(productData.dataset.productPrice) || 25.00,
        image_url: productData.dataset.productImage || '',
        description: productData.dataset.productDescription || ''
      };
    }
    
    // Try to get customer data from GHL
    if (typeof window.leadConnector !== 'undefined') {
      const contact = window.leadConnector.getContact();
      if (contact) {
        this.currentCustomer = {
          id: contact.id,
          name: contact.name || contact.firstName + ' ' + contact.lastName,
          email: contact.email,
          phone: contact.phone
        };
      }
    }
  }
  
  setupEventListeners() {
    // Payment button listeners
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="stripe-payment"]')) {
        e.preventDefault();
        this.initiateStripePayment();
      }
      
      if (e.target.matches('[data-action="crypto-payment"]')) {
        e.preventDefault();
        this.showCryptoOptions();
      }
      
      if (e.target.matches('[data-action="show-payment-modal"]')) {
        e.preventDefault();
        this.showPaymentModal();
      }
      
      if (e.target.matches('[data-action="close-modal"]')) {
        e.preventDefault();
        this.closeModal();
      }
      
      if (e.target.matches('[data-action="copy-address"]')) {
        e.preventDefault();
        this.copyWalletAddress();
      }
      
      if (e.target.matches('.currency-card')) {
        e.preventDefault();
        const currency = e.target.dataset.currency;
        if (currency) {
          this.selectCurrency(currency);
        }
      }
    });
    
    // Keyboard listeners
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });
    
    // Click outside modal to close
    document.addEventListener('click', (e) => {
      if (e.target.matches('.modal-overlay')) {
        this.closeModal();
      }
    });
  }
  
  // Load cryptocurrency exchange rates
  async loadExchangeRates() {
    try {
      const response = await fetch('/api/crypto-rates');
      this.exchangeRates = await response.json();
      this.updateCryptoPricing();
    } catch (error) {
      console.error('Failed to load exchange rates:', error);
    }
  }
  
  updateCryptoPricing() {
    if (!this.currentProduct || !this.exchangeRates) return;
    
    const priceUSD = this.currentProduct.price;
    
    // Update BTC pricing
    const btcElements = document.querySelectorAll('[data-crypto="btc"] .currency-amount');
    btcElements.forEach(el => {
      if (this.exchangeRates.btc) {
        el.textContent = `≈ ${(priceUSD / this.exchangeRates.btc).toFixed(8)} BTC`;
      }
    });
    
    // Update ETH pricing
    const ethElements = document.querySelectorAll('[data-crypto="eth"] .currency-amount');
    ethElements.forEach(el => {
      if (this.exchangeRates.eth) {
        el.textContent = `≈ ${(priceUSD / this.exchangeRates.eth).toFixed(4)} ETH`;
      }
    });
    
    // Update USDC pricing
    const usdcElements = document.querySelectorAll('[data-crypto="usdc"] .currency-amount');
    usdcElements.forEach(el => {
      el.textContent = `≈ ${priceUSD.toFixed(2)} USDC`;
    });
    
    // Update SOL pricing
    const solElements = document.querySelectorAll('[data-crypto="sol"] .currency-amount');
    solElements.forEach(el => {
      if (this.exchangeRates.sol) {
        el.textContent = `≈ ${(priceUSD / this.exchangeRates.sol).toFixed(3)} SOL`;
      }
    });
  }
  
  // Show payment method selection modal
  showPaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // Analytics
      this.trackEvent('view_checkout_options', {
        product_id: this.currentProduct?.id,
        currency: 'USD',
        value: this.currentProduct?.price
      });
    }
  }
  
  // Close modal
  closeModal() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
      modal.classList.remove('active');
    });
    document.body.style.overflow = 'auto';
  }
  
  // Initiate Stripe payment
  async initiateStripePayment() {
    if (!this.currentProduct) {
      this.showError('Product information not found');
      return;
    }
    
    try {
      this.showLoading();
      
      // Track analytics
      this.trackEvent('begin_checkout', {
        currency: 'USD',
        value: this.currentProduct.price,
        payment_method: 'stripe',
        items: [{
          item_id: this.currentProduct.id,
          item_name: this.currentProduct.title,
          quantity: 1,
          price: this.currentProduct.price
        }]
      });
      
      // Create checkout session
      const response = await fetch('/api/payments/stripe/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: this.currentProduct.id,
          customer_id: this.currentCustomer?.id,
          customer_email: this.currentCustomer?.email
        })
      });
      
      const session = await response.json();
      
      if (session.error) {
        throw new Error(session.error);
      }
      
      // Redirect to Stripe Checkout
      window.location.href = session.url;
      
    } catch (error) {
      this.hideLoading();
      this.showError('Unable to process payment. Please try again.');
      console.error('Stripe checkout error:', error);
    }
  }
  
  // Show crypto payment options
  showCryptoOptions() {
    this.closeModal();
    
    // Track analytics
    this.trackEvent('select_payment_method', {
      payment_method: 'crypto',
      product_id: this.currentProduct?.id
    });
    
    // Show crypto selection screen
    const cryptoScreen = document.getElementById('crypto-selection');
    if (cryptoScreen) {
      cryptoScreen.style.display = 'block';
      cryptoScreen.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  // Select cryptocurrency
  async selectCurrency(currency) {
    // Update UI
    document.querySelectorAll('.currency-card').forEach(card => {
      card.classList.remove('selected');
    });
    document.querySelector(`[data-currency="${currency}"]`).classList.add('selected');
    
    // Track analytics
    this.trackEvent('select_crypto_currency', {
      currency: currency,
      product_id: this.currentProduct?.id,
      usd_amount: this.currentProduct?.price
    });
    
    try {
      this.showLoading();
      
      // Create crypto payment
      const response = await fetch('/api/payments/crypto/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: this.currentProduct.id,
          customer_id: this.currentCustomer?.id,
          pay_currency: currency
        })
      });
      
      const payment = await response.json();
      
      if (payment.error) {
        throw new Error(payment.error);
      }
      
      this.displayPaymentDetails(payment);
      
    } catch (error) {
      this.hideLoading();
      this.showError('Unable to create crypto payment. Please try again.');
      console.error('Crypto payment error:', error);
    }
  }
  
  // Display crypto payment details
  displayPaymentDetails(payment) {
    this.hideLoading();
    
    // Hide currency selection and show payment details
    const selectionScreen = document.getElementById('crypto-selection');
    const paymentScreen = document.getElementById('crypto-payment');
    
    if (selectionScreen) selectionScreen.style.display = 'none';
    if (paymentScreen) {
      paymentScreen.style.display = 'block';
      paymentScreen.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Update payment amount
    const amountElement = document.getElementById('payment-amount');
    if (amountElement) {
      amountElement.textContent = `${payment.pay_amount} ${payment.pay_currency.toUpperCase()}`;
    }
    
    // Update wallet address
    const addressElement = document.getElementById('wallet-address');
    if (addressElement) {
      addressElement.textContent = payment.pay_address;
      addressElement.dataset.address = payment.pay_address;
    }
    
    // Generate QR code
    this.generateQRCode(payment.pay_address, payment.pay_amount, payment.pay_currency);
    
    // Start payment timer
    this.startPaymentTimer(900); // 15 minutes
    
    // Start status polling
    this.startStatusPolling(payment.payment_id);
  }
  
  // Generate QR code
  generateQRCode(address, amount, currency) {
    const qrContainer = document.getElementById('qr-code-container');
    if (!qrContainer) return;
    
    // Clear previous QR code
    qrContainer.innerHTML = '';
    
    // Create payment URI
    const paymentURI = this.createPaymentURI(address, amount, currency);
    
    // Generate QR code using qrcode.js library
    if (typeof QRCode !== 'undefined') {
      new QRCode(qrContainer, {
        text: paymentURI,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
      });
    }
  }
  
  createPaymentURI(address, amount, currency) {
    switch (currency.toLowerCase()) {
      case 'btc':
        return `bitcoin:${address}?amount=${amount}`;
      case 'eth':
      case 'usdc':
        return `ethereum:${address}?value=${amount}`;
      case 'sol':
        return `solana:${address}?amount=${amount}`;
      default:
        return address;
    }
  }
  
  // Copy wallet address to clipboard
  async copyWalletAddress() {
    const addressElement = document.getElementById('wallet-address');
    if (!addressElement) return;
    
    const address = addressElement.dataset.address || addressElement.textContent;
    
    try {
      await navigator.clipboard.writeText(address);
      
      // Update button text
      const copyButton = document.querySelector('[data-action="copy-address"]');
      if (copyButton) {
        const originalText = copyButton.textContent;
        copyButton.textContent = '✓ Copied!';
        copyButton.classList.add('copied');
        
        setTimeout(() => {
          copyButton.textContent = originalText;
          copyButton.classList.remove('copied');
        }, 2000);
      }
      
      // Track analytics
      this.trackEvent('copy_wallet_address', {
        currency: this.getCurrentCurrency()
      });
      
    } catch (error) {
      console.error('Failed to copy address:', error);
      this.showError('Failed to copy address');
    }
  }
  
  getCurrentCurrency() {
    const selectedCard = document.querySelector('.currency-card.selected');
    return selectedCard ? selectedCard.dataset.currency : null;
  }
  
  // Start payment timer
  startPaymentTimer(timeLimit = 900) {
    const timerElement = document.getElementById('payment-timer');
    if (!timerElement) return;
    
    let remaining = timeLimit;
    
    this.paymentTimer = setInterval(() => {
      remaining--;
      
      if (remaining <= 0) {
        this.onPaymentTimeout();
        return;
      }
      
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      timerElement.textContent = `Complete payment within ${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      // Change color when time is running out
      if (remaining <= 60) {
        timerElement.style.color = 'var(--danger-color)';
      } else if (remaining <= 300) {
        timerElement.style.color = 'var(--warning-color)';
      }
    }, 1000);
  }
  
  onPaymentTimeout() {
    if (this.paymentTimer) {
      clearInterval(this.paymentTimer);
      this.paymentTimer = null;
    }
    
    this.showError('Payment time expired. Please start a new payment.');
    
    // Track analytics
    this.trackEvent('crypto_payment_timeout', {
      payment_method: 'crypto',
      timeout_duration: 900
    });
  }
  
  // Start polling payment status
  startStatusPolling(paymentId) {
    if (!paymentId) return;
    
    this.paymentStatusPoller = new PaymentStatusPoller(paymentId, (status) => {
      this.updatePaymentStatus(status);
    });
    
    this.paymentStatusPoller.start();
  }
  
  updatePaymentStatus(status) {
    const statusElement = document.getElementById('payment-status');
    if (!statusElement) return;
    
    const statusMap = {
      'waiting': '🔄 Waiting for Payment',
      'confirming': '⏳ Confirming Transaction',
      'confirmed': '✅ Payment Confirmed',
      'sending': '📤 Processing Payment',
      'finished': '✅ Payment Complete',
      'failed': '❌ Payment Failed',
      'expired': '⏰ Payment Expired'
    };
    
    statusElement.textContent = statusMap[status.payment_status] || status.payment_status;
    
    if (status.confirmations) {
      statusElement.textContent += ` (${status.confirmations} confirmations)`;
    }
    
    // Handle completed payment
    if (status.payment_status === 'finished') {
      this.onPaymentComplete(status);
    }
    
    // Handle failed payment
    if (status.payment_status === 'failed' || status.payment_status === 'expired') {
      this.onPaymentFailed(status);
    }
  }
  
  onPaymentComplete(status) {
    // Stop polling and timer
    if (this.paymentStatusPoller) {
      this.paymentStatusPoller.stop();
    }
    if (this.paymentTimer) {
      clearInterval(this.paymentTimer);
    }
    
    // Track purchase completion
    this.trackEvent('purchase', {
      transaction_id: status.payment_id,
      value: status.price_amount,
      currency: 'USD',
      payment_method: 'crypto',
      crypto_currency: status.pay_currency
    });
    
    // Redirect to success page
    setTimeout(() => {
      window.location.href = `/checkout/crypto-success?payment_id=${status.payment_id}`;
    }, 2000);
  }
  
  onPaymentFailed(status) {
    // Stop polling and timer
    if (this.paymentStatusPoller) {
      this.paymentStatusPoller.stop();
    }
    if (this.paymentTimer) {
      clearInterval(this.paymentTimer);
    }
    
    this.showError('Payment failed. Please try again or contact support.');
  }
  
  // Utility functions
  showLoading() {
    const existingOverlay = document.querySelector('.loading-overlay');
    if (existingOverlay) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="loading"></div>';
    document.body.appendChild(overlay);
  }
  
  hideLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
      overlay.remove();
    }
  }
  
  showError(message) {
    // Create and show error notification
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--danger-color);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-lg);
      z-index: 10000;
      max-width: 300px;
      font-weight: 500;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
  
  // Analytics tracking
  trackEvent(eventName, parameters = {}) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, parameters);
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
      fbq('track', this.mapEventToFBPixel(eventName), parameters);
    }
    
    // Custom analytics
    if (typeof analytics !== 'undefined') {
      analytics.track(this.mapEventToCustom(eventName), parameters);
    }
    
    console.log('Event tracked:', eventName, parameters);
  }
  
  mapEventToFBPixel(eventName) {
    const eventMap = {
      'begin_checkout': 'InitiateCheckout',
      'purchase': 'Purchase',
      'view_checkout_options': 'AddToCart'
    };
    return eventMap[eventName] || 'CustomEvent';
  }
  
  mapEventToCustom(eventName) {
    const eventMap = {
      'begin_checkout': 'Checkout Started',
      'purchase': 'Order Completed',
      'view_checkout_options': 'Payment Options Viewed'
    };
    return eventMap[eventName] || eventName;
  }
}

// Payment Status Polling Class
class PaymentStatusPoller {
  constructor(paymentId, onUpdate) {
    this.paymentId = paymentId;
    this.onUpdate = onUpdate;
    this.interval = null;
    this.attempts = 0;
    this.maxAttempts = 180; // 30 minutes
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
      const response = await fetch(`/api/payments/crypto/status/${this.paymentId}`);
      const status = await response.json();
      
      this.onUpdate(status);
      
      if (['finished', 'failed', 'expired'].includes(status.payment_status)) {
        this.stop();
        return;
      }
      
      this.attempts++;
      setTimeout(() => this.poll(), 10000); // Poll every 10 seconds
      
    } catch (error) {
      console.error('Status polling error:', error);
      this.attempts++;
      setTimeout(() => this.poll(), 10000);
    }
  }
  
  stop() {
    this.polling = false;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.kanesBookstore = new KanesBookstore();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KanesBookstore, PaymentStatusPoller };
} 