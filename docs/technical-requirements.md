# Technical Requirements - Kane's Bookstore Payment System

## 🎯 System Overview

Kane's Bookstore requires a hybrid payment checkout system built on GoHighLevel that supports both traditional USD payments via Stripe and cryptocurrency payments via NowPayments. The system must be scalable, secure, and provide real-time transaction monitoring. **NEW: The system now includes wallet connection functionality and a gated ebook reader that validates NFT ownership for access to digital content.**

## 🏗 Architecture Requirements

### Frontend Requirements

- **Platform**: GoHighLevel (GHL) Custom Components
- **Responsive Design**: Mobile-first approach (320px to 2560px)
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Performance**: Page load time < 3 seconds, LCP < 2.5 seconds
- **Accessibility**: WCAG 2.1 AA compliance
- **Wallet Integration**: MetaMask, WalletConnect, Coinbase Wallet, Trust Wallet
- **Ebook Reader**: PDF.js-based reader with NFT-gated access controls

### Backend Requirements

- **API Framework**: Node.js with Express.js or GoHighLevel Webhooks
- **Database**: GoHighLevel CRM + MongoDB/PostgreSQL for extended data
- **Caching**: Redis for session management and rate limiting
- **Queue System**: Bull/Agenda for background processing
- **File Storage**: AWS S3 or Google Cloud Storage for digital assets
- **Blockchain Integration**: Web3.js/Ethers.js for NFT validation
- **NFT Standards**: ERC-721, ERC-1155 support across multiple chains

### Security Requirements

- **SSL/TLS**: End-to-end encryption (TLS 1.3)
- **PCI Compliance**: Level 1 merchant requirements
- **API Security**: JWT tokens, rate limiting, input validation
- **Data Protection**: GDPR and CCPA compliance
- **Fraud Prevention**: Real-time transaction monitoring
- **Wallet Security**: Secure signature verification, nonce-based authentication
- **NFT Validation**: On-chain verification with fallback to cached metadata

## 🔌 Integration Requirements

### Payment Processors

#### Stripe Integration

```json
{
  "stripe_requirements": {
    "account_type": "Standard Connect",
    "api_version": "2023-10-16",
    "required_capabilities": ["card_payments", "transfers"],
    "webhook_events": [
      "checkout.session.completed",
      "payment_intent.succeeded",
      "payment_intent.payment_failed",
      "invoice.payment_succeeded"
    ],
    "supported_payment_methods": ["card", "apple_pay", "google_pay", "link"]
  }
}
```

#### NowPayments Integration

```json
{
  "nowpayments_requirements": {
    "api_version": "v1",
    "supported_currencies": [
      "btc",
      "eth",
      "usdc",
      "usdt",
      "sol",
      "ada",
      "dot",
      "matic"
    ],
    "webhook_events": [
      "payment.waiting",
      "payment.confirming",
      "payment.confirmed",
      "payment.sending",
      "payment.finished",
      "payment.failed",
      "payment.refunded"
    ],
    "required_features": ["fixed_rate", "underpaid_amount", "overpaid_amount"]
  }
}
```

### Wallet Connection Integration

```json
{
  "wallet_requirements": {
    "supported_wallets": [
      "metamask",
      "walletconnect",
      "coinbase_wallet",
      "trust_wallet",
      "phantom",
      "rainbow"
    ],
    "supported_chains": [
      {
        "name": "Ethereum",
        "chainId": 1,
        "rpcUrl": "https://mainnet.infura.io/v3/YOUR_PROJECT_ID"
      },
      {
        "name": "Polygon",
        "chainId": 137,
        "rpcUrl": "https://polygon-rpc.com"
      },
      {
        "name": "Binance Smart Chain",
        "chainId": 56,
        "rpcUrl": "https://bsc-dataseed.binance.org"
      },
      {
        "name": "Solana",
        "chainId": 101,
        "rpcUrl": "https://api.mainnet-beta.solana.com"
      }
    ],
    "authentication_methods": ["signature_verification", "message_signing"],
    "session_management": "jwt_with_wallet_address"
  }
}
```

### NFT Validation Integration

```json
{
  "nft_validation_requirements": {
    "supported_standards": ["ERC-721", "ERC-1155", "SPL-Token"],
    "validation_methods": ["on_chain_query", "metadata_cache", "opensea_api"],
    "required_attributes": [
      "token_id",
      "contract_address",
      "owner_address",
      "metadata_uri",
      "collection_name"
    ],
    "access_control": {
      "book_access": "nft_ownership_verification",
      "chapter_unlock": "specific_trait_verification",
      "exclusive_content": "premium_nft_validation"
    }
  }
}
```

### GoHighLevel Integration

```json
{
  "ghl_requirements": {
    "version": "2.0",
    "required_features": [
      "custom_fields",
      "webhooks",
      "automation_workflows",
      "email_templates",
      "custom_components"
    ],
    "custom_fields": [
      "payment_method",
      "transaction_id",
      "crypto_currency",
      "nft_certificate_id",
      "download_token",
      "wallet_address",
      "connected_wallet_type",
      "owned_nfts",
      "book_access_level",
      "last_read_chapter"
    ]
  }
}
```

## 💾 Database Schema

### Orders Collection

```sql
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    customer_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method ENUM('stripe', 'crypto') NOT NULL,
    payment_currency VARCHAR(10), -- BTC, ETH, etc. for crypto
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    stripe_session_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    nowpayments_invoice_id VARCHAR(255),
    transaction_hash VARCHAR(255), -- For crypto transactions
    download_token VARCHAR(255),
    access_token VARCHAR(255),
    nft_certificate_id VARCHAR(255),
    wallet_address VARCHAR(255), -- Connected wallet address
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,

    INDEX idx_customer_id (customer_id),
    INDEX idx_order_id (order_id),
    INDEX idx_status (status),
    INDEX idx_payment_method (payment_method),
    INDEX idx_wallet_address (wallet_address),
    INDEX idx_created_at (created_at)
);
```

### Crypto Transactions Collection

```sql
CREATE TABLE crypto_transactions (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    nowpayments_payment_id VARCHAR(255) UNIQUE,
    pay_address VARCHAR(255) NOT NULL,
    pay_amount DECIMAL(20,8) NOT NULL,
    pay_currency VARCHAR(10) NOT NULL,
    price_amount DECIMAL(10,2) NOT NULL,
    price_currency VARCHAR(3) DEFAULT 'USD',
    network VARCHAR(50),
    transaction_hash VARCHAR(255),
    confirmations INTEGER DEFAULT 0,
    required_confirmations INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'waiting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP NULL,

    FOREIGN KEY (order_id) REFERENCES orders(id),
    INDEX idx_payment_id (nowpayments_payment_id),
    INDEX idx_status (status),
    INDEX idx_transaction_hash (transaction_hash)
);
```

### Wallet Connections Collection

```sql
CREATE TABLE wallet_connections (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    wallet_address VARCHAR(255) NOT NULL,
    wallet_type ENUM('metamask', 'walletconnect', 'coinbase', 'trust', 'phantom') NOT NULL,
    chain_id INTEGER NOT NULL,
    signature VARCHAR(500), -- Authentication signature
    message VARCHAR(500), -- Signed message
    is_active BOOLEAN DEFAULT TRUE,
    last_connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_customer_wallet (customer_id, wallet_address),
    INDEX idx_wallet_address (wallet_address),
    INDEX idx_customer_id (customer_id),
    INDEX idx_chain_id (chain_id)
);
```

### NFT Ownership Collection

```sql
CREATE TABLE nft_ownership (
    id BIGSERIAL PRIMARY KEY,
    wallet_address VARCHAR(255) NOT NULL,
    contract_address VARCHAR(255) NOT NULL,
    token_id VARCHAR(255) NOT NULL,
    chain_id INTEGER NOT NULL,
    metadata_uri VARCHAR(1000),
    collection_name VARCHAR(255),
    token_name VARCHAR(255),
    attributes JSON,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_valid BOOLEAN DEFAULT TRUE,

    UNIQUE KEY unique_nft (contract_address, token_id, chain_id),
    INDEX idx_wallet_address (wallet_address),
    INDEX idx_contract_address (contract_address),
    INDEX idx_collection_name (collection_name),
    INDEX idx_verified_at (verified_at)
);
```

### Book Access Collection

```sql
CREATE TABLE book_access (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    access_type ENUM('full', 'chapter', 'preview') NOT NULL,
    access_method ENUM('purchase', 'nft_validation', 'admin_grant') NOT NULL,
    wallet_address VARCHAR(255),
    qualifying_nft_id BIGINT, -- Links to nft_ownership table
    expires_at TIMESTAMP NULL,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_chapter INTEGER DEFAULT 1,
    reading_progress JSON, -- Track reading progress per chapter
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (qualifying_nft_id) REFERENCES nft_ownership(id),
    UNIQUE KEY unique_customer_book (customer_id, book_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_book_id (book_id),
    INDEX idx_wallet_address (wallet_address),
    INDEX idx_access_type (access_type)
);
```

### Books Collection

```sql
CREATE TABLE books (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url VARCHAR(1000),
    pdf_file_url VARCHAR(1000),
    total_chapters INTEGER DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    nft_collection_address VARCHAR(255), -- Required NFT collection for access
    required_nft_traits JSON, -- Specific traits required for access
    access_level ENUM('public', 'premium', 'exclusive') DEFAULT 'public',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_title (title),
    INDEX idx_author (author),
    INDEX idx_nft_collection (nft_collection_address),
    INDEX idx_access_level (access_level)
);
```

## 🚀 Performance Requirements

### Response Time Targets

- **Product Page Load**: < 2 seconds
- **Payment Processing**: < 5 seconds
- **Wallet Connection**: < 3 seconds
- **NFT Validation**: < 5 seconds
- **Ebook Reader Load**: < 4 seconds
- **API Response**: < 500ms (95th percentile)
- **Database Queries**: < 100ms average
- **File Downloads**: < 3 seconds for 10MB files

### Scalability Requirements

- **Concurrent Users**: Support 1,000 simultaneous users
- **Concurrent Readers**: Support 500 simultaneous ebook readers
- **Transaction Volume**: 10,000 transactions per day
- **NFT Validations**: 50,000 validations per day
- **Peak Load**: 5x normal load during promotions
- **Database**: Auto-scaling read replicas
- **CDN**: Global content delivery for static assets

### Monitoring Requirements

```json
{
  "monitoring_stack": {
    "application_monitoring": "New Relic / Datadog",
    "log_aggregation": "ELK Stack / Splunk",
    "uptime_monitoring": "Pingdom / StatusCake",
    "error_tracking": "Sentry",
    "analytics": "Google Analytics 4 + Mixpanel",
    "blockchain_monitoring": "Alchemy / Moralis",
    "wallet_analytics": "DappRadar / WalletConnect Analytics"
  },
  "alerts": {
    "payment_failures": "5+ failures in 5 minutes",
    "wallet_connection_errors": "10+ errors in 10 minutes",
    "nft_validation_failures": "20+ failures in 15 minutes",
    "ebook_reader_errors": "15+ errors in 10 minutes",
    "api_response_time": "> 2 seconds average",
    "database_connections": "> 80% pool usage",
    "server_resources": "CPU > 80%, Memory > 85%"
  }
}
```

## 🔒 Security Requirements

### Wallet Security

- **Signature Verification**: All wallet connections must be verified via cryptographic signatures
- **Nonce Management**: Prevent replay attacks with time-based nonces
- **Address Validation**: Checksummed address validation for all wallet addresses
- **Session Management**: JWT tokens with wallet address binding
- **Rate Limiting**: 10 connection attempts per minute per IP

### NFT Validation Security

- **On-Chain Verification**: Primary validation against blockchain data
- **Metadata Verification**: Cross-reference with trusted metadata sources
- **Cache Poisoning Protection**: Signature verification for cached NFT data
- **Access Control**: Time-based access tokens with NFT ownership verification
- **Audit Trail**: Complete logging of all NFT validation attempts

### Ebook Reader Security

- **Content Protection**: DRM-like protection for PDF content
- **Access Token Validation**: Short-lived tokens (15 minutes) for content access
- **Watermarking**: Dynamic watermarks with user wallet address
- **Download Prevention**: Disable right-click, print, and save functionality
- **Session Binding**: Reader sessions tied to validated wallet connections

## 📱 Mobile Requirements

### Wallet Connection on Mobile

- **Mobile Wallet Support**: Deep linking to mobile wallets (MetaMask, Trust Wallet, etc.)
- **QR Code Connection**: WalletConnect QR codes for desktop-to-mobile connection
- **Responsive Design**: Touch-optimized wallet connection interface
- **Error Handling**: Clear error messages for mobile wallet connection issues

### Mobile Reading Experience

- **Touch Navigation**: Swipe gestures for page navigation
- **Zoom Controls**: Pinch-to-zoom for PDF content
- **Reading Mode**: Optimized typography and spacing for mobile reading
- **Offline Caching**: Limited offline access for authenticated users
- **Progress Sync**: Reading progress synchronization across devices

## 🧪 Testing Requirements

### Automated Testing

- **Unit Tests**: 90% code coverage for all wallet and NFT validation functions
- **Integration Tests**: End-to-end wallet connection and NFT validation flows
- **Load Testing**: 1000 concurrent users with wallet connections
- **Security Testing**: Penetration testing for wallet authentication
- **Cross-Browser Testing**: All major browsers and mobile devices

### Manual Testing

- **Wallet Compatibility**: Test with all supported wallet types
- **NFT Validation**: Test with various NFT collections and traits
- **Reader Functionality**: Test ebook reader across different PDF types
- **Error Scenarios**: Test network failures, invalid NFTs, expired sessions
- **User Experience**: Usability testing for wallet connection flow

## 🚀 Deployment Requirements

### Infrastructure

- **Load Balancer**: NGINX or AWS ALB with SSL termination
- **Application Servers**: PM2 cluster mode with auto-restart
- **Database**: Master-slave configuration with read replicas
- **Redis Cluster**: High availability session storage
- **CDN**: CloudFlare or AWS CloudFront for global content delivery
- **Monitoring**: Full-stack monitoring with 99.9% uptime target

### Environment Variables

```bash
# Wallet Integration
WEB3_INFURA_PROJECT_ID=your_infura_project_id
WEB3_ALCHEMY_API_KEY=your_alchemy_api_key
WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# NFT Validation
OPENSEA_API_KEY=your_opensea_api_key
MORALIS_API_KEY=your_moralis_api_key
NFT_STORAGE_API_KEY=your_nft_storage_api_key

# Ebook Reader
PDF_ENCRYPTION_KEY=your_pdf_encryption_key
WATERMARK_API_KEY=your_watermark_api_key
CONTENT_PROTECTION_SECRET=your_content_protection_secret
```

This comprehensive technical requirements document now includes all the necessary specifications for implementing wallet connection functionality and the gated ebook reader system, ensuring secure NFT validation and seamless user experience across all platforms.

---

**Document Version**: 1.0
**Last Updated**: December 2024
**Next Review**: March 2025
