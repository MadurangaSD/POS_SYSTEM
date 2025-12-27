# POS System - Frontend

A modern Point of Sale (POS) system built with React, Vite, Tailwind CSS, and ShadCN UI.

## 🚀 Features Implemented

### ✅ Phase 1 - Core Functionality (Completed)

#### 1. Authentication & Access Control
- **Login Screen** with role-based routing
  - Username/Password authentication
  - Auto-focus on username field
  - Numeric keypad for touch screens
  - Large touch-friendly buttons


#### 2. Main POS Checkout Screen
- **3-Column Layout:**
  - **Left:** Barcode scanner, product search, quick-select grid
  - **Middle:** Shopping cart with quantity controls, bill summary
  - **Right:** Payment action buttons
  
- **Keyboard Shortcuts:**
  - `F1`: New Bill | `F2`: Payment | `F3`: Search | `F4`: Inc. Qty | `ESC`: Cancel

#### 3. Payment Module
- Multiple payment methods (Cash, Card, QR/UPI)
- Numeric keypad for cash entry
- Auto-calculate change

#### 4. Receipt Printing
- Receipt component using `react-to-print`
- ESC/POS thermal printer format

#### 5. Admin Dashboard
- Metric cards (Sales, Bills, Inventory, Users)
- Top 5 products display
- Quick navigation

## 📦 Tech Stack

React 19 • Vite 7 • React Router • Tailwind CSS v4 • ShadCN UI • Axios • React-to-Print • Recharts • date-fns

## 🎮 Getting Started

```bash
npm install
npm run dev      # http://localhost:5173/
npm run build
```

## 📋 Next Steps (Phase 2)

- Product Management, Inventory, Sales Reports, Customer Management, Returns/Refunds, Employee Management, Settings, Backend Integration

---

**Status:** Phase 1 Complete ✅
