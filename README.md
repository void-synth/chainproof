# 🔐 ChainProof

**AI + Blockchain-Powered Copyright Protection for Creators**

[🚀 Live Demo](https://chain-proof-seven.vercel.app)

---

## 📌 Overview

ChainProof gives creators instant, legally verifiable copyright protection using a powerful combination of AI and blockchain.

With just one upload, creators can:
- ✅ Get a blockchain timestamp and IPFS link
- ✅ Run AI similarity checks for piracy detection
- ✅ Receive a proof-of-ownership certificate (PDF + QR)
- ✅ Monitor piracy alerts in a real-time dashboard

---

## 🧠 Problem Statement

Millions of creators share original content online — but most have no way to **prove ownership** or **catch theft** early. Traditional copyright registration is slow, expensive, and limited by geography.

---

## 💡 Solution

ChainProof solves this with a simple flow:
1. Upload content
2. Hash + store on blockchain & IPFS
3. AI scans the web for similar content
4. Generate proof certificate & monitor misuse

---

## 🖥 Tech Stack

| Layer         | Tool / Service                        |
|--------------|----------------------------------------|
| Frontend     | React, Tailwind CSS                    |
| Backend      | Node.js, Express (Planned)             |
| Storage      | IPFS (via Web3.storage or Pinata)      |
| Blockchain   | Polygon (Mumbai Testnet)               |
| AI Scanning  | OpenAI GPT API, Google Search API      |
| Certificate  | PDFKit, QRCode (Planned)               |
| Auth         | JWT / Firebase Auth (Planned)          |
| Hosting      | Vercel                                 |

---

## 📦 Features

### ✅ Implemented (Frontend)
- Landing page with feature overview and CTA
- Responsive design (React + Tailwind)
- Page flow explanation for judges & testers

### 🔧 In Progress / To Do (Backend)
- [ ] Blockchain file hashing + IPFS upload
- [ ] AI similarity detection via GPT + Google
- [ ] PDF certificate generation
- [ ] User dashboard for uploads, certs, alerts
- [ ] Authentication & session handling
- [ ] Email/piracy alert notifications

---

## 🚀 Getting Started

### Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/chainproof.git
cd chainproof


cd frontend
npm install
npm run dev

