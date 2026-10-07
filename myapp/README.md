# Social Connect — Frontend Discovery & Messaging Web Application

A responsive, polished college mini-project built entirely on the frontend with **React 18**, **Vite**, **Context API**, **useReducer**, and **localStorage**.

---

## 🚀 Key Features

1. **Smart Discovery Engine**
   - Live search by Name, City, Area, or Interests.
   - Multi-criteria filters: Age slider, Location (Ahmedabad, Surat, Vadodara, Gandhinagar, Rajkot), Locality (Satellite, SG Highway, Bopal, etc.), Online status, Free/Premium accounts, and tag-based Interest matching.
   - Dynamic sorting: Recommended, Recently Active, Age (Low/High), Name (A-Z).

2. **Real-time-like Messaging System**
   - Split-screen conversation list on desktop, optimized fullscreen conversation on mobile.
   - Live unread badges, sent/read checkmarks, timestamp display.
   - Free vs. Premium gating: Free users cannot initiate chats with VIP Premium profiles without upgrading.
   - Auto-scrolling to newest message via `useRef`.

3. **Likes & Favorites Management**
   - Double-way like tracking: "Who Liked Me" vs "Profiles I Liked".
   - Bookmark favorites for quick access.
   - Visual toggle feedback with animated toast popups.

4. **Premium Membership & Mock Payment Gateway**
   - 3 Plan tiers: Weekly (₹250), Monthly (₹500), Yearly (₹1,800).
   - Mock card checkout with live formatting (`#### #### #### ####`, `MM/YY`), CVV validation, UPI ID option, and net banking.
   - Instant activation, plan expiry calculations, and gold crown badge on user profile and cards.

5. **Safety, Privacy & Moderation**
   - Block users with confirmation modal (removes from discovery & chat).
   - Report users with structured reason options.
   - Privacy controls: Toggle Online Status visibility, Last Seen visibility, and Discovery visibility.
   - Developer Reset: Restore demo data back to default in 1 click.

---

## 👤 Quick Demo Accounts

For immediate testing and college presentation, use the pre-seeded credentials:

| Name | Email | Password | Account Type | Location |
| :--- | :--- | :--- | :--- | :--- |
| **Rahul Mehta** | `rahul@demo.com` | `demo123` | Free Member | Ahmedabad (Satellite) |
| **Priya Sharma** | `priya@demo.com` | `demo123` | Premium Member | Ahmedabad (SG Highway) |
| **Amit Patel** | `amit@demo.com` | `demo123` | Free Member | Ahmedabad (Bopal) |

Or click the **1-Click Demo Buttons** right on the Login page!

---

## 🛠️ Tech Stack

- **Core**: React 18, Vite, JavaScript (ES6+)
- **Routing**: React Router DOM v6
- **State Management**: React Context API (`AuthContext`, `UserContext`, `ChatContext`, `SubscriptionContext`, `NotificationContext`)
- **Complex State**: `useReducer` for chat engine transitions
- **Persistence**: Safe `localStorage` wrappers with JSON fallbacks
- **Icons**: Lucide React
- **Design System**: Vanilla CSS with custom design tokens, glassmorphism, responsive breakpoints, and animations

---

## 💻 How to Run Locally

```bash
cd myapp
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.
