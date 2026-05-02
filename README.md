# 🗳️ VoteWise AI — Your Personal Election Guide

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-orange?logo=firebase)](https://firebase.google.com)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-blue?logo=google)](https://ai.google.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

> AI-powered election guide covering **13 countries** and **16 languages** — with a storytelling mode for children and first-time voters.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Chat** | Gemini 2.5 Flash answers any election question |
| 📖 **Story Mode** | Explains elections via stories for kids & uneducated voters |
| 🌍 **16 Languages** | Responds in Hindi, Tamil, French, Arabic, Japanese & more |
| 🎤 **Voice I/O** | Speak questions, hear answers in your language |
| 🖼️ **AI Illustrations** | Auto-generates story art via Pollinations.ai |
| 📅 **Election Calendar** | 150+ real events across 13 countries with audio reminders |
| 🗳️ **Eligibility Quiz** | Country-specific voter eligibility check before journey |
| ☁️ **Cloud Sync** | Downloads & chat history saved to Firebase (anonymous) |
| ⚖️ **Country Compare** | Side-by-side electoral system comparison |
| 👥 **Community** | Voter tips, FAQ, and community posts |

## 🌐 Supported Countries

🇮🇳 India · 🇺🇸 USA · 🇬🇧 UK · 🇦🇺 Australia · 🇨🇦 Canada · 🇫🇷 France  
🇩🇪 Germany · 🇯🇵 Japan · 🇧🇷 Brazil · 🇿🇦 South Africa · 🇵🇰 Pakistan · 🇧🇩 Bangladesh · 🇱🇰 Sri Lanka

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Google AI Studio](https://aistudio.google.com) API key (free)
- A Firebase project with Firestore + Anonymous Auth enabled

### Installation

```bash
git clone https://github.com/your-username/votewise-ai.git
cd votewise-ai
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔒 Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /conversations/{doc} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.uid;
      allow create: if request.auth != null;
    }
    match /downloads/{doc} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.uid;
      allow create: if request.auth != null;
    }
  }
}
```

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/chat/route.ts   # Gemini API route (rate-limited, sanitized)
│   ├── layout.tsx          # SEO metadata, fonts
│   └── page.tsx            # Root page with nav router
├── components/
│   ├── AIChat.tsx          # Main chat interface (story + regular mode)
│   ├── TopNav.tsx          # Language/country selector + download
│   ├── LeftNavStrip.tsx    # Animated sidebar navigation
│   ├── SidebarLeft.tsx     # Voting journey + eligibility quiz
│   ├── SidebarRight.tsx    # Country comparison + recent results
│   └── views/              # Calendar, Cloud, Community, Settings, History
├── data/
│   └── electionEvents.ts   # 150+ real election events (13 countries)
├── lib/
│   ├── firebase.ts         # Firebase init + anonymous auth
│   └── firestore.ts        # Typed Firestore CRUD helpers
├── store/
│   └── useAppStore.ts      # Zustand global state with localStorage persist
└── hooks/
    └── useAnonymousAuth.ts # Silent Firebase anonymous auth hook
```

---

## 🛡️ Security

This project implements strict, production-grade security measures:

API Key Management: The highly sensitive Gemini AI API key is strictly isolated in server-side Google Cloud environment variables.
Firebase Security: The Firebase Web API keys are exposed to the client by design for SDK initialization. However, database integrity is fiercely protected via Firestore Security Rules which only allow authenticated, ephemeral, session-scoped reads/writes.
DDoS Protection & Rate Limiting: The AI endpoint is hardened with an in-memory IP-based rate limiter (max 20 requests/minute) to prevent abuse and API exhaustion.
Input Sanitization: All incoming user data is aggressively sanitized and length-capped to prevent XSS and prompt-injection attacks.
---

## 📦 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **AI**: Google Gemini 2.5 Flash
- **Database**: Firebase Firestore
- **Auth**: Firebase Anonymous Auth
- **State**: Zustand (with localStorage persist)
- **Animation**: Framer Motion
- **Images**: Pollinations.ai (free, no key needed)
- **Speech**: Web Speech API (Chrome/Edge)
- **Fonts**: Google Fonts (Outfit + Inter)

---

## 📄 License

MIT © VoteWise AI
