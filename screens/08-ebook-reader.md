# Ebook Reader - Screen Specification

## 🎯 Screen Overview

The Ebook Reader provides a secure, NFT-gated reading experience for Kane's Bookstore customers. This reader validates NFT ownership before granting access and includes features like progress tracking, watermarking, and content protection.

## 📱 Mobile-First Design Specifications

### Reader Layout Structure

```
┌─────────────────────────────────────────┐
│ ← Back    Kane's Bookstore    🔒 0x123..│
├─────────────────────────────────────────┤
│                                         │
│              PDF Content                │
│                                         │
│        ┌─────────────────────────────┐   │
│        │                             │   │
│        │        Book Page            │   │
│        │                             │   │
│        │    [Watermark: 0x123...]    │   │
│        │                             │   │
│        │                             │   │
│        │                             │   │
│        │                             │   │
│        └─────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│ Progress: ████████░░ 80%                │
├─────────────────────────────────────────┤
│ ⏪ 📖 Chapter 5 📖 ⏩   🔍 💾 ⚙️        │
└─────────────────────────────────────────┘
```

### Authentication Flow

#### Step 1: Access Validation

```
┌─────────────────────────────────────────┐
│        🔐 Validating Access             │
├─────────────────────────────────────────┤
│                                         │
│     Checking NFT ownership...           │
│                                         │
│     ⏳ Please wait                      │
│                                         │
│     Wallet: 0x123...abc                 │
│     Required: Kane's Premium Collection │
│                                         │
└─────────────────────────────────────────┘
```

#### Step 2: Access Granted

```
┌─────────────────────────────────────────┐
│           ✅ Access Granted             │
├─────────────────────────────────────────┤
│                                         │
│     NFT Verified Successfully!          │
│                                         │
│     Book: Blockchain Fundamentals       │
│     NFT: Kane's Premium #1234           │
│     Access Level: Full                  │
│                                         │
│          [Start Reading]                │
│                                         │
└─────────────────────────────────────────┘
```

#### Step 3: Access Denied

```
┌─────────────────────────────────────────┐
│           ❌ Access Denied              │
├─────────────────────────────────────────┤
│                                         │
│     No qualifying NFT found             │
│                                         │
│     Required: Kane's Premium Collection │
│     Contract: 0xabc...123               │
│                                         │
│     [View Collection] [Buy Book]        │
│                                         │
└─────────────────────────────────────────┘
```

## 🎨 Design Components

### Reader Interface

```css
.ebook-reader {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1a1a1a;
  color: #ffffff;
}

.reader-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #2d2d2d;
  border-bottom: 1px solid #404040;
}

.reader-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
  background: #ffffff;
  color: #000000;
}

.reader-footer {
  padding: 12px 20px;
  background: #2d2d2d;
  border-top: 1px solid #404040;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #404040;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  transition: width 0.3s ease;
}

.reader-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-controls {
  display: flex;
  gap: 16px;
}

.reader-tools {
  display: flex;
  gap: 12px;
}
```

### PDF Viewer Component

```css
.pdf-viewer {
  width: 100%;
  height: 100%;
  position: relative;
}

.pdf-canvas {
  width: 100%;
  height: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.pdf-watermark {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.3);
  font-family: monospace;
  pointer-events: none;
  user-select: none;
}

.pdf-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  background: #f9f9f9;
  border-radius: 8px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

### Access Control Components

```css
.access-validation {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f8fafc;
  padding: 20px;
}

.validation-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.validation-message {
  text-align: center;
  max-width: 400px;
}

.validation-details {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.access-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}
```

## 🔧 Technical Implementation

### Reader HTML Structure

```html
<div id="ebook-reader" class="ebook-reader">
  <!-- Access Validation Overlay -->
  <div id="access-validation" class="access-validation">
    <div class="validation-icon">🔐</div>
    <div class="validation-message">
      <h2>Validating Access</h2>
      <p>Checking NFT ownership...</p>
      <div class="validation-details">
        <p>Wallet: <span id="validation-wallet"></span></p>
        <p>Required: <span id="required-collection"></span></p>
      </div>
    </div>
  </div>

  <!-- Main Reader Interface -->
  <div id="reader-interface" class="reader-interface" style="display: none;">
    <!-- Header -->
    <div class="reader-header">
      <div class="header-left">
        <button onclick="goBack()" class="btn-back">← Back</button>
        <span class="brand">Kane's Bookstore</span>
      </div>
      <div class="header-right">
        <span class="wallet-indicator"
          >🔒 <span id="reader-wallet"></span
        ></span>
      </div>
    </div>

    <!-- Content Area -->
    <div class="reader-content">
      <div id="pdf-viewer" class="pdf-viewer">
        <div id="pdf-loading" class="pdf-loading">
          <div class="loading-spinner"></div>
        </div>
        <canvas id="pdf-canvas" class="pdf-canvas"></canvas>
        <div id="pdf-watermark" class="pdf-watermark"></div>
      </div>
    </div>

    <!-- Footer Controls -->
    <div class="reader-footer">
      <div class="progress-bar">
        <div id="progress-fill" class="progress-fill"></div>
      </div>
      <div class="progress-text">
        Progress: <span id="progress-percentage">0%</span>
      </div>

      <div class="reader-controls">
        <div class="nav-controls">
          <button onclick="previousPage()" class="btn-nav">⏪</button>
          <span class="page-info">
            📖 Page <span id="current-page">1</span> of
            <span id="total-pages">1</span>
          </span>
          <button onclick="nextPage()" class="btn-nav">⏩</button>
        </div>

        <div class="reader-tools">
          <button onclick="zoomIn()" class="btn-tool">🔍+</button>
          <button onclick="zoomOut()" class="btn-tool">🔍-</button>
          <button onclick="bookmarkPage()" class="btn-tool">📑</button>
          <button onclick="showSettings()" class="btn-tool">⚙️</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Access Denied Screen -->
  <div id="access-denied" class="access-validation" style="display: none;">
    <div class="validation-icon">❌</div>
    <div class="validation-message">
      <h2>Access Denied</h2>
      <p>No qualifying NFT found in your wallet</p>
      <div class="validation-details">
        <p>Required: <span id="denied-collection"></span></p>
        <p>Contract: <span id="denied-contract"></span></p>
      </div>
      <div class="access-actions">
        <button onclick="viewCollection()" class="btn-secondary">
          View Collection
        </button>
        <button onclick="buyBook()" class="btn-primary">Buy Book</button>
      </div>
    </div>
  </div>
</div>
```

### JavaScript Implementation

```javascript
// Global variables
let currentPage = 1;
let totalPages = 1;
let pdfDocument = null;
let sessionToken = null;
let walletAddress = null;
let zoomLevel = 1.0;

// Initialize reader
async function initializeReader() {
  try {
    // Get session token from URL
    const urlParams = new URLSearchParams(window.location.search);
    sessionToken = urlParams.get("session");

    if (!sessionToken) {
      showAccessDenied("No valid session token");
      return;
    }

    // Validate access
    await validateAccess();
  } catch (error) {
    console.error("Reader initialization failed:", error);
    showAccessDenied("Failed to initialize reader");
  }
}

// Validate NFT access
async function validateAccess() {
  try {
    showAccessValidation();

    // Verify session token and access
    const response = await fetch(`/api/reader/book/${bookId}/access`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    const accessData = await response.json();

    if (accessData.success && accessData.has_access) {
      walletAddress = accessData.wallet_address;
      await loadBook();
    } else {
      showAccessDenied("No qualifying NFT found");
    }
  } catch (error) {
    console.error("Access validation failed:", error);
    showAccessDenied("Validation failed");
  }
}

// Load book content
async function loadBook() {
  try {
    // Get book content with session token
    const response = await fetch(`/api/reader/book/${bookId}/content`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    if (response.ok) {
      const pdfBlob = await response.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Load PDF with PDF.js
      pdfjsLib.getDocument(pdfUrl).promise.then((pdf) => {
        pdfDocument = pdf;
        totalPages = pdf.numPages;

        // Update UI
        document.getElementById("total-pages").textContent = totalPages;
        updateWatermark();

        // Show reader interface
        showReaderInterface();

        // Load first page
        loadPage(1);
      });
    } else {
      throw new Error("Failed to load book content");
    }
  } catch (error) {
    console.error("Book loading failed:", error);
    showAccessDenied("Failed to load book");
  }
}

// Load specific page
async function loadPage(pageNumber) {
  try {
    if (!pdfDocument) return;

    showLoading();

    const page = await pdfDocument.getPage(pageNumber);
    const viewport = page.getViewport({ scale: zoomLevel });

    const canvas = document.getElementById("pdf-canvas");
    const context = canvas.getContext("2d");

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    // Update current page
    currentPage = pageNumber;
    document.getElementById("current-page").textContent = currentPage;

    // Update progress
    updateProgress();

    // Save reading progress
    saveProgress();

    hideLoading();
  } catch (error) {
    console.error("Page loading failed:", error);
    hideLoading();
  }
}

// Navigation functions
function nextPage() {
  if (currentPage < totalPages) {
    loadPage(currentPage + 1);
  }
}

function previousPage() {
  if (currentPage > 1) {
    loadPage(currentPage - 1);
  }
}

// Zoom functions
function zoomIn() {
  zoomLevel = Math.min(zoomLevel + 0.25, 3.0);
  loadPage(currentPage);
}

function zoomOut() {
  zoomLevel = Math.max(zoomLevel - 0.25, 0.5);
  loadPage(currentPage);
}

// Progress tracking
function updateProgress() {
  const progressPercentage = Math.round((currentPage / totalPages) * 100);
  document.getElementById("progress-percentage").textContent =
    progressPercentage + "%";
  document.getElementById("progress-fill").style.width =
    progressPercentage + "%";
}

async function saveProgress() {
  try {
    await fetch("/api/reader/progress", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        book_id: bookId,
        chapter: currentPage,
        wallet_address: walletAddress,
        timestamp: Date.now(),
      }),
    });
  } catch (error) {
    console.error("Failed to save progress:", error);
  }
}

// UI state management
function showAccessValidation() {
  document.getElementById("access-validation").style.display = "flex";
  document.getElementById("reader-interface").style.display = "none";
  document.getElementById("access-denied").style.display = "none";

  // Update validation info
  document.getElementById("validation-wallet").textContent =
    walletAddress || "Validating...";
  document.getElementById("required-collection").textContent =
    requiredCollection;
}

function showReaderInterface() {
  document.getElementById("access-validation").style.display = "none";
  document.getElementById("reader-interface").style.display = "flex";
  document.getElementById("access-denied").style.display = "none";

  // Update reader info
  document.getElementById(
    "reader-wallet"
  ).textContent = `${walletAddress.substring(0, 6)}...${walletAddress.substring(
    38
  )}`;
}

function showAccessDenied(message) {
  document.getElementById("access-validation").style.display = "none";
  document.getElementById("reader-interface").style.display = "none";
  document.getElementById("access-denied").style.display = "flex";

  // Update denied info
  document.getElementById("denied-collection").textContent = requiredCollection;
  document.getElementById("denied-contract").textContent = contractAddress;
}

function showLoading() {
  document.getElementById("pdf-loading").style.display = "flex";
  document.getElementById("pdf-canvas").style.display = "none";
}

function hideLoading() {
  document.getElementById("pdf-loading").style.display = "none";
  document.getElementById("pdf-canvas").style.display = "block";
}

function updateWatermark() {
  const watermark = document.getElementById("pdf-watermark");
  watermark.textContent = `${walletAddress.substring(
    0,
    10
  )}...${walletAddress.substring(32)}`;
}

// Content protection
function disableRightClick() {
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });
}

function disableTextSelection() {
  document.addEventListener("selectstart", function (e) {
    e.preventDefault();
  });
}

function disableKeyboardShortcuts() {
  document.addEventListener("keydown", function (e) {
    // Disable Ctrl+S, Ctrl+P, F12, etc.
    if ((e.ctrlKey && (e.key === "s" || e.key === "p")) || e.key === "F12") {
      e.preventDefault();
    }
  });
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function () {
  initializeReader();
  disableRightClick();
  disableTextSelection();
  disableKeyboardShortcuts();
});
```

## 🔒 Security Features

### Content Protection

- **Watermarking**: Dynamic watermarks with wallet addresses
- **Download Prevention**: Disabled right-click and keyboard shortcuts
- **Session Tokens**: Short-lived tokens (15 minutes) for content access
- **DRM Protection**: Canvas-based rendering prevents easy copying

### Access Control

- **Real-time Validation**: Continuous NFT ownership verification
- **Session Binding**: Reader sessions tied to wallet connections
- **Token Expiration**: Automatic session expiration for security
- **Audit Trail**: Complete logging of reading sessions

## 📱 Mobile Optimization

### Touch Controls

- **Swipe Navigation**: Swipe left/right for page navigation
- **Pinch to Zoom**: Touch-based zoom controls
- **Touch Targets**: Large, touch-friendly buttons
- **Gesture Support**: Tap to toggle UI elements

### Performance

- **Lazy Loading**: Load pages on demand
- **Memory Management**: Efficient PDF rendering
- **Offline Caching**: Limited offline access for authenticated users
- **Progress Sync**: Real-time progress synchronization

## 🧪 Testing Scenarios

### Access Testing

- **Valid NFTs**: Test with qualifying NFT ownership
- **Invalid NFTs**: Test with non-qualifying NFTs
- **Expired Sessions**: Test session token expiration
- **Network Errors**: Test connectivity issues

### Reader Testing

- **PDF Rendering**: Test with various PDF formats
- **Page Navigation**: Test all navigation methods
- **Zoom Functionality**: Test zoom in/out capabilities
- **Progress Tracking**: Test reading progress saves

### Security Testing

- **Content Protection**: Test download prevention
- **Watermarking**: Verify watermark rendering
- **Session Security**: Test token validation
- **Access Control**: Test unauthorized access attempts

This comprehensive ebook reader specification provides a secure, user-friendly reading experience with robust NFT-based access control and content protection features.
