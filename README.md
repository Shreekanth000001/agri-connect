# 🌾 Agri-Connect

> **A Next-Generation Digital Mandi & Produce Marketplace**  
> Connecting farmers directly with agricultural wholesalers and consumers through real-time auctions, live negotiation WebSockets, and AI-powered farming assistance — eliminating middlemen and ensuring fair prices.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![WebSocket](https://img.shields.io/badge/WebSockets-Live_Chat-010101?style=flat-square&logo=socketdotio)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel)](https://agriconnect.shreek.me)

---

## 🚩 Problem Statement

Traditional agricultural supply chains in India force farmers to lose **30-40% of produce value** to intermediary commission agents. **Agri-Connect** provides a transparent, tech-driven platform where farmers list produce auctions, engage in direct price negotiations, and receive AI-backed market insights — retaining 100% of earned produce value.

---

## ✨ Key Features

- 🧑‍🌾 **Farmer & Buyer Dashboards:** Dedicated role-based portals for listing produce, monitoring active auctions, and tracking incoming bids.
- ⚡ **Transparent Produce Auctions:** Instant bidding mechanisms with starting bid floors, automatic expiration timers, and bid acceptance controls.
- 💬 **Live Negotiation Chat (WebSockets):** Real-time counter-offer proposals and instant messaging powered by persistent WebSocket (`wss://`) channels.
- 🤖 **AgriConnect AI Assistant:** Embedded slide-over drawer offering SSE streaming (`/api/v1/ai/chat`) for crop advice, soil health, and market negotiation strategies.
- 🥪 **Sandwich Card Image Preview:** Interactive overlapping card deck previews with photo counter badges and instant removal controls during auction creation.
- 📍 **Farm Location & Distance Resolution:** Automatic proximity calculation and interactive Leaflet map integration displaying straight-line displacement between buyer and farm locations.
- 🔒 **Decoupled Architecture:** High-speed communication between Next.js frontend and Python FastAPI backend via centralized `apiClient`.

---

## 🛠 Tech Stack

| Layer | Technology & Tools |
| :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router, Turbopack, React 19) |
| **Language & Styling** | TypeScript (Strict Mode), Tailwind CSS |
| **Backend API** | Python FastAPI, Pydantic, Uvicorn |
| **Real-time Engine** | WebSockets (`ws://` / `wss://`), Server-Sent Events (SSE) |
| **Image Management** | Cloudinary & Next.js Image Optimization |
| **Deployment** | Vercel (Frontend), Hosted FastAPI (Backend API) |

---

## 🔑 Demo Test Accounts

Test accounts are pre-configured for instant platform exploration:

| Account Type | Email Pattern | Password | Role |
| :--- | :--- | :--- | :--- |
| **Farmers** | `farmer1@agriconnect.com` to `farmer15@agriconnect.com` | `password` | Produce Seller |
| **Buyers** | `buyer1@agriconnect.com` to `buyer5@agriconnect.com` | `password` | Produce Purchaser |

---

## ⚡ Getting Started Locally

### 1. Prerequisites
- Node.js `v18.0.0` or higher
- npm `v9.0.0` or higher

### 2. Installation
```bash
git clone https://github.com/your-repo/agri-connect-v2.git
cd agri-connect-v2
npm install
```

### 3. Environment Configuration (`.env`)
Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_API_URL=https://backend.shreek.me/api/v1
NEXT_PUBLIC_WS_URL=wss://backend.shreek.me/api/v1
SESSION_SECRET=your-secure-session-key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
```

---

## 📸 Screenshots

<img alt="Screenshot from 2026-03-29 09-56-38" src="https://github.com/user-attachments/assets/addcd983-ecd8-46c7-9929-d24fc6f55607" />
<img alt="Screenshot from 2026-03-29 09-57-03" src="https://github.com/user-attachments/assets/c4a65e43-d0d2-4e8c-a84b-b51b50274ae1" />
<img alt="Screenshot from 2026-03-29 09-58-10" src="https://github.com/user-attachments/assets/b4f90715-417c-4bc0-9330-0dbed205c5f1" />

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
