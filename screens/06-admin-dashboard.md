# Admin Dashboard - Screen Specification

## 🎯 Screen Overview

The Admin Dashboard provides comprehensive management and analytics for Kane's Bookstore's dual payment system, allowing administrators to monitor both Stripe and crypto transactions, manage orders, and track business metrics.

## 📱 Dashboard Layout

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Kane's Bookstore Admin                🔧 ⚙️ 👤 Logout  │
├─────────────────────────────────────────────────────────┤
│ 📊 Dashboard Overview - December 15, 2024               │
├─────────────────────────────────────────────────────────┤
│ 💰 Today's Revenue                                      │
│ ┌──────────────┬──────────────┬──────────────┬────────┐ │
│ │ 💳 Stripe    │ ₿ Crypto     │ 📈 Total     │ 📊 YTD │ │
│ │ $1,250       │ $750         │ $2,000       │ $45K   │ │
│ │ +12% ↗       │ +8% ↗        │ +10% ↗       │ +25% ↗ │ │
│ └──────────────┴──────────────┴──────────────┴────────┘ │
├─────────────────────────────────────────────────────────┤
│ 📈 Quick Stats                                          │
│ ┌──────────────┬──────────────┬──────────────┬────────┐ │
│ │ 🛒 Orders    │ 💎 NFTs      │ 📧 Emails    │ 👥 Users│ │
│ │ 42 today     │ 38 issued    │ 42 sent      │ 156 new│ │
│ └──────────────┴──────────────┴──────────────┴────────┘ │
├─────────────────────────────────────────────────────────┤
│ 📋 Recent Transactions                          [🔍 All] │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ID | Product | Amount | Method | Status | Time      │ │
│ │ KB-001 | Marketing | $25 | Stripe | ✅ | 2:30 PM  │ │
│ │ KB-002 | SEO Guide | $30 | BTC    | ✅ | 2:15 PM  │ │
│ │ KB-003 | Social    | $20 | ETH    | ⏳ | 2:00 PM  │ │
│ │ KB-004 | Analytics | $35 | Stripe | ✅ | 1:45 PM  │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ 🔧 Management Tools                                     │
│ [💳 Stripe Dashboard] [₿ Crypto Dashboard] [📧 Emails]  │
│ [🎁 NFT Manager] [⚙️ Settings] [📊 Analytics]          │
├─────────────────────────────────────────────────────────┤
│ 📊 Revenue Chart (Last 30 Days)                        │
│ ┌─────────────────────────────────────────────────────┐ │
│ │     ▄▄▄     ▄▄▄▄▄▄    Stripe: $15,420             │ │
│ │   ▄▄   ▄▄ ▄▄      ▄▄  Crypto: $8,940              │ │
│ │ ▄▄       ▄▄          ▄ Total: $24,360              │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 🎨 Design Components

### Header Navigation

```css
.admin-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-logo {
  font-size: 20px;
  font-weight: 700;
}

.admin-nav {
  display: flex;
  gap: 16px;
  align-items: center;
}

.nav-icon {
  padding: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: background 0.3s;
}

.nav-icon:hover {
  background: rgba(255, 255, 255, 0.2);
}
```

### Revenue Cards

```css
.revenue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.revenue-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-left: 4px solid;
}

.revenue-card.stripe {
  border-left-color: #635bff;
}

.revenue-card.crypto {
  border-left-color: #f59e0b;
}

.revenue-card.total {
  border-left-color: #10b981;
}

.revenue-card.ytd {
  border-left-color: #6366f1;
}

.revenue-amount {
  font-size: 32px;
  font-weight: 800;
  color: #1a202c;
  margin-bottom: 8px;
}

.revenue-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
}

.revenue-change.positive {
  color: #10b981;
}

.revenue-change.negative {
  color: #ef4444;
}
```

### Transaction Table

```css
.transactions-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.transactions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
}

.transactions-table th {
  background: #f7fafc;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 2px solid #e2e8f0;
}

.transactions-table td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.completed {
  background: #d4edda;
  color: #155724;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.failed {
  background: #f8d7da;
  color: #721c24;
}

.payment-method-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.payment-method-badge.stripe {
  background: #e6f3ff;
  color: #0066cc;
}

.payment-method-badge.crypto {
  background: #fff4e6;
  color: #cc6600;
}
```

## 🔧 Technical Implementation

### Dashboard Controller

```javascript
// Admin Dashboard Controller
class AdminDashboardController {
  constructor() {
    this.dateRange = "today";
    this.refreshInterval = 30000; // 30 seconds
    this.charts = {};
  }

  async initialize() {
    await this.loadDashboardData();
    this.renderDashboard();
    this.setupRealTimeUpdates();
    this.initializeCharts();
    this.setupEventListeners();
  }

  async loadDashboardData() {
    try {
      const [revenue, stats, transactions, analytics] = await Promise.all([
        this.fetchRevenueData(),
        this.fetchQuickStats(),
        this.fetchRecentTransactions(),
        this.fetchAnalyticsData(),
      ]);

      this.data = {
        revenue,
        stats,
        transactions,
        analytics,
      };
    } catch (error) {
      console.error("Dashboard data loading error:", error);
      this.showErrorState();
    }
  }

  async fetchRevenueData() {
    const response = await fetch("/api/admin/revenue?period=today");
    return response.json();
  }

  async fetchQuickStats() {
    const response = await fetch("/api/admin/stats?period=today");
    return response.json();
  }

  async fetchRecentTransactions() {
    const response = await fetch("/api/admin/transactions?limit=10");
    return response.json();
  }

  renderDashboard() {
    this.renderRevenueCards();
    this.renderQuickStats();
    this.renderTransactionsTable();
    this.renderManagementTools();
  }

  renderRevenueCards() {
    const container = document.getElementById("revenue-cards");
    const { stripe, crypto, total, ytd } = this.data.revenue;

    container.innerHTML = `
      <div class="revenue-card stripe">
        <h3>💳 Stripe Revenue</h3>
        <div class="revenue-amount">$${stripe.amount.toLocaleString()}</div>
        <div class="revenue-change ${
          stripe.change >= 0 ? "positive" : "negative"
        }">
          ${stripe.change >= 0 ? "↗" : "↘"} ${Math.abs(stripe.change)}%
        </div>
      </div>
      
      <div class="revenue-card crypto">
        <h3>₿ Crypto Revenue</h3>
        <div class="revenue-amount">$${crypto.amount.toLocaleString()}</div>
        <div class="revenue-change ${
          crypto.change >= 0 ? "positive" : "negative"
        }">
          ${crypto.change >= 0 ? "↗" : "↘"} ${Math.abs(crypto.change)}%
        </div>
      </div>
      
      <div class="revenue-card total">
        <h3>📈 Total Revenue</h3>
        <div class="revenue-amount">$${total.amount.toLocaleString()}</div>
        <div class="revenue-change ${
          total.change >= 0 ? "positive" : "negative"
        }">
          ${total.change >= 0 ? "↗" : "↘"} ${Math.abs(total.change)}%
        </div>
      </div>
      
      <div class="revenue-card ytd">
        <h3>📊 Year to Date</h3>
        <div class="revenue-amount">$${ytd.amount.toLocaleString()}</div>
        <div class="revenue-change ${
          ytd.change >= 0 ? "positive" : "negative"
        }">
          ${ytd.change >= 0 ? "↗" : "↘"} ${Math.abs(ytd.change)}%
        </div>
      </div>
    `;
  }

  renderTransactionsTable() {
    const container = document.getElementById("transactions-table");
    const transactions = this.data.transactions;

    const tableHTML = `
      <table class="transactions-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Product</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Status</th>
            <th>Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${transactions
            .map(
              (tx) => `
            <tr>
              <td><a href="/admin/orders/${tx.id}">${tx.order_id}</a></td>
              <td>${tx.product_name}</td>
              <td>$${tx.amount}</td>
              <td><span class="payment-method-badge ${
                tx.payment_method
              }">${tx.payment_method.toUpperCase()}</span></td>
              <td><span class="status-badge ${tx.status}">${
                tx.status
              }</span></td>
              <td>${this.formatTime(tx.created_at)}</td>
              <td>
                <button onclick="viewTransaction('${
                  tx.id
                }')" class="btn-sm">View</button>
                ${
                  tx.status === "pending"
                    ? `<button onclick="cancelTransaction('${tx.id}')" class="btn-sm btn-danger">Cancel</button>`
                    : ""
                }
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;

    container.innerHTML = tableHTML;
  }
}
```

### Real-Time Updates

```javascript
// WebSocket Integration for Real-Time Updates
class DashboardWebSocket {
  constructor(dashboardController) {
    this.dashboard = dashboardController;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/admin`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log("Dashboard WebSocket connected");
      this.reconnectAttempts = 0;
      this.sendAuth();
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.ws.onclose = () => {
      console.log("Dashboard WebSocket disconnected");
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error("Dashboard WebSocket error:", error);
    };
  }

  handleMessage(data) {
    switch (data.type) {
      case "new_order":
        this.dashboard.addNewTransaction(data.transaction);
        this.dashboard.updateRevenue(data.revenue_update);
        this.showNotification("New order received!", "success");
        break;

      case "payment_completed":
        this.dashboard.updateTransactionStatus(
          data.transaction_id,
          "completed"
        );
        this.dashboard.updateRevenue(data.revenue_update);
        break;

      case "payment_failed":
        this.dashboard.updateTransactionStatus(data.transaction_id, "failed");
        this.showNotification("Payment failed", "warning");
        break;

      case "revenue_update":
        this.dashboard.updateRevenueCards(data.revenue);
        break;
    }
  }

  sendAuth() {
    this.ws.send(
      JSON.stringify({
        type: "auth",
        token: localStorage.getItem("admin_token"),
      })
    );
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect();
      }, 1000 * this.reconnectAttempts);
    }
  }
}
```

### Analytics Charts

```javascript
// Chart.js Integration
const initializeCharts = () => {
  // Revenue Chart
  const revenueCtx = document.getElementById("revenue-chart").getContext("2d");
  const revenueChart = new Chart(revenueCtx, {
    type: "line",
    data: {
      labels: getLast30Days(),
      datasets: [
        {
          label: "Stripe Revenue",
          data: data.analytics.stripe_daily,
          borderColor: "#635bff",
          backgroundColor: "rgba(99, 91, 255, 0.1)",
          tension: 0.4,
        },
        {
          label: "Crypto Revenue",
          data: data.analytics.crypto_daily,
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Revenue Trends (Last 30 Days)",
        },
        legend: {
          position: "top",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "$" + value.toLocaleString();
            },
          },
        },
      },
    },
  });

  // Payment Method Distribution
  const methodCtx = document
    .getElementById("payment-method-chart")
    .getContext("2d");
  const methodChart = new Chart(methodCtx, {
    type: "doughnut",
    data: {
      labels: ["Stripe", "Bitcoin", "Ethereum", "USDC", "Other Crypto"],
      datasets: [
        {
          data: [
            data.analytics.payment_methods.stripe,
            data.analytics.payment_methods.btc,
            data.analytics.payment_methods.eth,
            data.analytics.payment_methods.usdc,
            data.analytics.payment_methods.other_crypto,
          ],
          backgroundColor: [
            "#635bff",
            "#f7931a",
            "#627eea",
            "#2775ca",
            "#9945ff",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Payment Method Distribution",
        },
      },
    },
  });
};
```

## 🔒 Admin Security

### Authentication & Authorization

```javascript
// Admin Authentication Middleware
const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Admin token required" });
    }

    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    const admin = await User.findById(decoded.user_id);

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid admin token" });
  }
};

// Admin Action Logging
const logAdminAction = async (adminId, action, details = {}) => {
  await AdminLog.create({
    admin_id: adminId,
    action: action,
    details: details,
    ip_address: req.ip,
    user_agent: req.headers["user-agent"],
    timestamp: new Date(),
  });
};
```

## 📊 Export & Reporting

### Data Export Functions

```javascript
// Export Dashboard Data
const exportDashboardData = {
  // Export transactions to CSV
  transactions: async (startDate, endDate, format = "csv") => {
    const transactions = await fetchTransactions(startDate, endDate);

    if (format === "csv") {
      const csv = Papa.unparse(transactions);
      return {
        data: csv,
        filename: `transactions_${startDate}_${endDate}.csv`,
        mimetype: "text/csv",
      };
    }

    if (format === "excel") {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(transactions);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

      return {
        data: XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }),
        filename: `transactions_${startDate}_${endDate}.xlsx`,
        mimetype:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };
    }
  },

  // Export revenue report
  revenue: async (period) => {
    const revenueData = await generateRevenueReport(period);

    return {
      data: JSON.stringify(revenueData, null, 2),
      filename: `revenue_report_${period}.json`,
      mimetype: "application/json",
    };
  },
};
```

## ✅ Testing Checklist

### Dashboard Functionality

- [ ] Revenue cards display correctly
- [ ] Transaction table loads
- [ ] Real-time updates work
- [ ] Charts render properly
- [ ] Export functions work
- [ ] Admin authentication
- [ ] WebSocket connections
- [ ] Mobile responsiveness

### Data Accuracy

- [ ] Revenue calculations correct
- [ ] Transaction status updates
- [ ] Payment method tracking
- [ ] Time zone handling
- [ ] Currency conversions
- [ ] Analytics accuracy

### Security Testing

- [ ] Admin authentication required
- [ ] Action logging functional
- [ ] Data access controls
- [ ] Token validation
- [ ] CSRF protection
- [ ] XSS prevention

---

**Implementation Priority**: High (Business management tool)
**Development Time**: 5-7 days
**Dependencies**: Authentication system, database queries, WebSocket setup, charting library
