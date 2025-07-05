# Wallet Connection Modal - Screen Specification

## 🎯 Screen Overview

The Wallet Connection Modal provides users with a secure and user-friendly interface to connect their cryptocurrency wallets to Kane's Bookstore. This modal supports multiple wallet types and ensures secure authentication through cryptographic signatures.

## 📱 Mobile-First Design Specifications

### Modal Layout Structure

```
┌─────────────────────────────────────────┐
│ ✕                Connect Wallet      │
├─────────────────────────────────────────┤
│                                         │
│  Choose Your Wallet                     │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │ 🦊 MetaMask                         │ │
│  │    Most popular Ethereum wallet     │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │ 🔗 WalletConnect                    │ │
│  │    Connect with QR code             │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │ 🔵 Coinbase Wallet                  │ │
│  │    Secure and easy to use           │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │ 🛡️ Trust Wallet                     │ │
│  │    Mobile-first wallet              │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  ┌─────────────────────────────────────┐ │
│  │ 👻 Phantom                          │ │
│  │    Solana wallet                    │ │
│  └─────────────────────────────────────┘ │
│                                         │
│  🔒 Your wallet will be securely       │
│      connected using cryptographic     │
│      signatures                        │
└─────────────────────────────────────────┘
```

### Connection Flow States

#### State 1: Wallet Selection

- Display list of supported wallets
- Show wallet descriptions and icons
- Detect installed wallets and highlight them

#### State 2: Connection in Progress

```
┌─────────────────────────────────────────┐
│ ✕                Connecting...        │
├─────────────────────────────────────────┤
│                                         │
│         🔄 Connecting to MetaMask       │
│                                         │
│    Please approve the connection        │
│         request in your wallet          │
│                                         │
│         [Cancel Connection]             │
│                                         │
└─────────────────────────────────────────┘
```

#### State 3: Signature Request

```
┌─────────────────────────────────────────┐
│ ✕              Sign Message           │
├─────────────────────────────────────────┤
│                                         │
│    🔏 Please sign this message to       │
│       authenticate your wallet          │
│                                         │
│    ┌─────────────────────────────────┐   │
│    │ Connect wallet to Kane's        │   │
│    │ Bookstore                       │   │
│    │                                 │   │
│    │ Nonce: abc123def456             │   │
│    │ Timestamp: 2024-01-15 14:30:25  │   │
│    └─────────────────────────────────┘   │
│                                         │
│    This signature is required for       │
│    security and will not cost any gas   │
│                                         │
└─────────────────────────────────────────┘
```

#### State 4: Connection Success

```
┌─────────────────────────────────────────┐
│ ✕            Connection Success        │
├─────────────────────────────────────────┤
│                                         │
│              ✅ Connected!              │
│                                         │
│    Wallet: 0x123...abc                  │
│    Network: Ethereum Mainnet            │
│                                         │
│    You can now access NFT-gated         │
│    content and make crypto payments     │
│                                         │
│          [Continue to Book]             │
│                                         │
└─────────────────────────────────────────┘
```

## 🎨 Design Components

### Wallet Option Cards

```css
.wallet-option {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 12px;
}

.wallet-option:hover {
  border-color: #3b82f6;
  background-color: #f8fafc;
}

.wallet-option.installed {
  border-color: #10b981;
  background-color: #f0fdf4;
}

.wallet-icon {
  width: 32px;
  height: 32px;
  margin-right: 12px;
}

.wallet-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.wallet-description {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.installed-badge {
  background-color: #10b981;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: auto;
}
```

### Loading States

```css
.connection-loading {
  text-align: center;
  padding: 40px 20px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
```

### Error States

```css
.connection-error {
  text-align: center;
  padding: 20px;
  background-color: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  margin: 16px 0;
}

.error-icon {
  font-size: 48px;
  color: #ef4444;
  margin-bottom: 16px;
}

.error-message {
  font-size: 16px;
  color: #dc2626;
  margin-bottom: 16px;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
```

## 🔧 Technical Implementation

### Modal Component Structure

```html
<div id="wallet-connection-modal" class="modal-overlay">
  <div class="modal-content">
    <div class="modal-header">
      <h2>Connect Wallet</h2>
      <button class="close-btn" onclick="closeWalletModal()">&times;</button>
    </div>

    <div class="modal-body">
      <!-- Wallet Selection State -->
      <div id="wallet-selection" class="wallet-selection">
        <h3>Choose Your Wallet</h3>

        <div class="wallet-options">
          <div class="wallet-option" onclick="connectMetaMask()">
            <img
              src="/assets/metamask-icon.svg"
              alt="MetaMask"
              class="wallet-icon"
            />
            <div class="wallet-info">
              <div class="wallet-name">MetaMask</div>
              <div class="wallet-description">Most popular Ethereum wallet</div>
            </div>
            <div
              id="metamask-badge"
              class="installed-badge"
              style="display: none;"
            >
              Installed
            </div>
          </div>

          <div class="wallet-option" onclick="connectWalletConnect()">
            <img
              src="/assets/walletconnect-icon.svg"
              alt="WalletConnect"
              class="wallet-icon"
            />
            <div class="wallet-info">
              <div class="wallet-name">WalletConnect</div>
              <div class="wallet-description">Connect with QR code</div>
            </div>
          </div>

          <div class="wallet-option" onclick="connectCoinbase()">
            <img
              src="/assets/coinbase-icon.svg"
              alt="Coinbase Wallet"
              class="wallet-icon"
            />
            <div class="wallet-info">
              <div class="wallet-name">Coinbase Wallet</div>
              <div class="wallet-description">Secure and easy to use</div>
            </div>
          </div>

          <div class="wallet-option" onclick="connectTrustWallet()">
            <img
              src="/assets/trust-wallet-icon.svg"
              alt="Trust Wallet"
              class="wallet-icon"
            />
            <div class="wallet-info">
              <div class="wallet-name">Trust Wallet</div>
              <div class="wallet-description">Mobile-first wallet</div>
            </div>
          </div>

          <div class="wallet-option" onclick="connectPhantom()">
            <img
              src="/assets/phantom-icon.svg"
              alt="Phantom"
              class="wallet-icon"
            />
            <div class="wallet-info">
              <div class="wallet-name">Phantom</div>
              <div class="wallet-description">Solana wallet</div>
            </div>
          </div>
        </div>

        <div class="security-notice">
          <p>
            🔒 Your wallet will be securely connected using cryptographic
            signatures
          </p>
        </div>
      </div>

      <!-- Connection Loading State -->
      <div
        id="connection-loading"
        class="connection-loading"
        style="display: none;"
      >
        <div class="loading-spinner"></div>
        <h3>Connecting to <span id="connecting-wallet-name"></span></h3>
        <p>Please approve the connection request in your wallet</p>
        <button class="btn-secondary" onclick="cancelConnection()">
          Cancel Connection
        </button>
      </div>

      <!-- Signature Request State -->
      <div
        id="signature-request"
        class="signature-request"
        style="display: none;"
      >
        <div class="signature-icon">🔏</div>
        <h3>Sign Message</h3>
        <p>Please sign this message to authenticate your wallet</p>

        <div class="signature-message">
          <pre id="signature-message-text"></pre>
        </div>

        <div class="signature-notice">
          <p>
            This signature is required for security and will not cost any gas
          </p>
        </div>
      </div>

      <!-- Connection Success State -->
      <div
        id="connection-success"
        class="connection-success"
        style="display: none;"
      >
        <div class="success-icon">✅</div>
        <h3>Connected!</h3>

        <div class="connection-details">
          <p>Wallet: <span id="connected-address"></span></p>
          <p>Network: <span id="connected-network"></span></p>
        </div>

        <p>You can now access NFT-gated content and make crypto payments</p>

        <button class="btn-primary" onclick="continueToBook()">
          Continue to Book
        </button>
      </div>

      <!-- Error State -->
      <div
        id="connection-error"
        class="connection-error"
        style="display: none;"
      >
        <div class="error-icon">❌</div>
        <div class="error-message" id="error-message-text"></div>

        <div class="error-actions">
          <button class="btn-secondary" onclick="retryConnection()">
            Try Again
          </button>
          <button class="btn-primary" onclick="showWalletSelection()">
            Choose Different Wallet
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
```

### JavaScript Functions

```javascript
// Modal management
function openWalletModal() {
  document.getElementById("wallet-connection-modal").style.display = "flex";
  checkInstalledWallets();
}

function closeWalletModal() {
  document.getElementById("wallet-connection-modal").style.display = "none";
  resetModalState();
}

function showState(stateId) {
  // Hide all states
  const states = [
    "wallet-selection",
    "connection-loading",
    "signature-request",
    "connection-success",
    "connection-error",
  ];
  states.forEach((state) => {
    document.getElementById(state).style.display = "none";
  });

  // Show specific state
  document.getElementById(stateId).style.display = "block";
}

function checkInstalledWallets() {
  // Check for MetaMask
  if (typeof window.ethereum !== "undefined") {
    document.getElementById("metamask-badge").style.display = "block";
    document.querySelector(".wallet-option").classList.add("installed");
  }

  // Check for other wallets
  // Implementation depends on wallet-specific detection methods
}

// Wallet connection functions
async function connectMetaMask() {
  try {
    showState("connection-loading");
    document.getElementById("connecting-wallet-name").textContent = "MetaMask";

    if (typeof window.ethereum === "undefined") {
      throw new Error("MetaMask is not installed");
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (accounts.length > 0) {
      const walletAddress = accounts[0];
      const chainId = await window.ethereum.request({ method: "eth_chainId" });

      await authenticateWallet(walletAddress, chainId, "metamask");
    }
  } catch (error) {
    showConnectionError(error.message);
  }
}

async function connectWalletConnect() {
  try {
    showState("connection-loading");
    document.getElementById("connecting-wallet-name").textContent =
      "WalletConnect";

    // WalletConnect implementation
    // This would use @walletconnect/web3-provider
  } catch (error) {
    showConnectionError(error.message);
  }
}

async function authenticateWallet(walletAddress, chainId, walletType) {
  try {
    // Show signature request
    showState("signature-request");

    // Get nonce from server
    const initResponse = await fetch("/api/wallet/connect/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet_type: walletType,
        chain_id: parseInt(chainId, 16),
        timestamp: Date.now(),
      }),
    });

    const { nonce, message } = await initResponse.json();

    // Display message to user
    document.getElementById("signature-message-text").textContent = message;

    // Request signature
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

    const result = await verifyResponse.json();

    if (result.success) {
      // Store session token
      localStorage.setItem("wallet_session_token", result.session_token);

      // Show success state
      showConnectionSuccess(walletAddress, chainId, walletType);
    } else {
      throw new Error("Signature verification failed");
    }
  } catch (error) {
    showConnectionError(error.message);
  }
}

function showConnectionSuccess(walletAddress, chainId, walletType) {
  showState("connection-success");

  document.getElementById(
    "connected-address"
  ).textContent = `${walletAddress.substring(0, 6)}...${walletAddress.substring(
    38
  )}`;

  // Get network name
  const networkName = getNetworkName(chainId);
  document.getElementById("connected-network").textContent = networkName;

  // Update parent page
  if (typeof updateWalletUI === "function") {
    connectedWallet = walletAddress;
    currentChainId = chainId;
    updateWalletUI();
  }
}

function showConnectionError(message) {
  showState("connection-error");
  document.getElementById("error-message-text").textContent = message;
}

function getNetworkName(chainId) {
  const networks = {
    "0x1": "Ethereum Mainnet",
    "0x89": "Polygon",
    "0x38": "Binance Smart Chain",
    "0x4": "Ethereum Testnet",
  };
  return networks[chainId] || "Unknown Network";
}

function continueToBook() {
  closeWalletModal();
  // Trigger NFT access check if available
  if (typeof checkNFTAccess === "function") {
    checkNFTAccess();
  }
}

function resetModalState() {
  showState("wallet-selection");
}
```

## 🔒 Security Features

### Signature Verification

- **Cryptographic Signatures**: Use personal_sign for secure authentication
- **Nonce Protection**: Prevent replay attacks with unique nonces
- **Message Verification**: Server-side signature validation

### Error Handling

- **Connection Failures**: Handle wallet rejection gracefully
- **Network Errors**: Provide clear error messages
- **Installation Checks**: Detect and guide users to install wallets

## 📱 Mobile Considerations

### Mobile Wallet Integration

- **Deep Links**: Direct links to mobile wallet apps
- **QR Codes**: WalletConnect QR codes for cross-device connection
- **Touch Optimization**: Large touch targets for mobile users

### Responsive Design

- **Modal Sizing**: Appropriate sizing for mobile screens
- **Touch Gestures**: Swipe to close modal
- **Keyboard Handling**: Proper keyboard navigation

## 🧪 Testing Scenarios

### Connection Testing

- **Multiple Wallets**: Test with all supported wallet types
- **Network Switching**: Test different blockchain networks
- **Error Scenarios**: Test wallet rejection, network errors
- **Mobile Testing**: Test mobile wallet connections

### Security Testing

- **Signature Verification**: Verify cryptographic signatures
- **Nonce Validation**: Test nonce expiration and reuse
- **Session Management**: Test session token handling

This comprehensive wallet connection modal provides a secure, user-friendly interface for connecting cryptocurrency wallets to Kane's Bookstore, enabling NFT-gated access and crypto payments.
