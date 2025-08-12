# Slack Connect

Slack Connect is a full-stack application that enables users to connect their Slack workspace via OAuth 2.0, send messages immediately, and schedule messages for future delivery. This app demonstrates secure token management, scheduled task handling, and seamless Slack integration.

## 🚀 Live Demo & Source Code

- **Frontend (Next.js + Tailwind CSS)**

  GitHub: [freak3123/slack-connect](freak3123/slack-connect)

  Live: [https://slack-connect-silk.vercel.app/](https://slack-connect-silk.vercel.app/)

- **Backend (Node.js + Express + MongoDB)**

  GitHub: [freak3123/slack-connect-backend](freak3123/slack-connect-backend)

  Live: [https://slack-connect-backend-1.onrender.com](https://slack-connect-backend-1.onrender.com)

## 📦 Setup Instructions

### Prerequisites

- Node.js (v16+ recommended)

- npm or yarn

## Setup

**1.** Clone the frontend repo:

```bash
git clone https://github.com/Freak3123/slack-connect.git
cd slack-connect
```

**2.** Install dependencies:

```bash
npm install
```

**3.** Create a `.env` file in the root directory with:

```bash
BACKEND_URL=https://slack-connect-backend-1.onrender.com
NEXT_PUBLIC_BACKEND_URL=https://slack-connect-backend-1.onrender.com
```

Note: Local backend URLs will not work due to Slack OAuth redirect URL restrictions (Slack does not allow HTTP redirect URIs). Use deployed backend URLs or set up HTTPS tunnels like ngrok for local testing.

**4.** Run the development server:

```bash
npm run dev
```

**5.** Open your browser at `http://localhost:3000` (or your configured port).

# 🏗 Architectural Overview

This project implements a Slack integration frontend using Next.js with the App Router, structured to provide OAuth connection, token management, and scheduled message handling within a clean modular design.

## Directory Structure Highlights

```
freak3123-slack-connect/
├── app/                        #  Contains the core application entry points and API routes.
│   ├── page.tsx                # Main client-side page that controls UI flow between Slack connection and messaging.
│   └── api/                    # RESTful API endpoints to interface with backend services for Slack actions like sending messages, scheduling, canceling schedules, fetching recipients and teams.
│       ├── delete-schedule/    # Cancel scheduled messages
│       ├── direct-msg/         # Send direct messages
│       ├── messages/           # Fetch scheduled & sent messages
│       ├── recipient/          # Fetch recipient data (channels/users)
│       └── teams/              # Fetch Slack teams info
├── components/                 # React UI components separated by functionality for clarity and reuse.
│   ├── ConnectSlack.tsx        # Handles Slack OAuth connection UI and triggers OAuth flow.
│   ├── MessageComposer.tsx     # UI for composing immediate or scheduled messages.
│   ├── MessagesList.tsx        # Displays scheduled and sent messages per selected recipient.
│   └── ui/                     # Shared UI primitives (button, input, card, etc.)
└── lib/
└── utils.ts                    # Utility functions

```

### OAuth and Token Management

- The OAuth flow is initiated through the ConnectSlack component, which upon user interaction triggers a Slack OAuth redirect.

- Upon successful OAuth, the backend exchanges the authorization code for access and refresh tokens and securely stores them.

- The frontend maintains a connection state (isConnected) and fetches necessary data only after successful authentication.

- Token management is abstracted mostly on the backend, while the frontend interacts via protected API routes to perform Slack actions using valid tokens.

### Scheduled Task Handling

- Users can compose messages for immediate sending or schedule them for later.

- Scheduled messages and sent message history are fetched via API endpoints under `app/api/`:
 
  - schedule/route.ts manages scheduling new messages.

  - delete-schedule/route.ts handles cancellations.

  - messages/route.ts fetches both scheduled and sent messages for a selected recipient.

- The frontend components update the UI reactively based on API responses to provide real-time feedback on scheduled tasks.

- Scheduled tasks are represented as distinct entities with statuses like "pending," "sent," or "cancelled," enabling clear state management in the UI.

This modular design ensures a clear separation of concerns between UI components, OAuth flow management, and backend API interactions — facilitating scalability and maintainability.



## Challenges & Learnings

### Challenges


- **OAuth Integration Complexity**  
  Handling Slack’s OAuth flow—including authorization code exchange and token refresh—required careful coordination between frontend redirects and backend token management. Ensuring secure storage and timely token refresh was critical to maintaining session validity.

- **Token Rotation & Expiry Handling**  
  Implementing token rotation and managing token expiry demanded precise timing and robust error handling to prevent failed API calls and ensure a smooth user experience.

- **Scheduling and State Synchronization**  
  Keeping the frontend UI synchronized with backend scheduled tasks, including reflecting cancellations or updates in near real-time, required effective state management and reliable API communication.

- **TypeScript Typing with API Data**  
  Mapping various API response formats (such as scheduled messages and sent messages) into consistent frontend types was challenging and required flexible yet type-safe definitions.

### Learnings

- Modularizing the UI into reusable components improved code maintainability and helped manage complexity.
- Proper use of React hooks and effect dependencies allowed for responsive and dynamic UI updates.
- Offloading OAuth logic to the backend enhanced security and simplified frontend implementation.
- Designing clear, responsibility-driven API endpoints (e.g., for scheduling, deleting scheduled messages, and fetching messages) streamlined communication and error handling.
- Leveraging mock data during early UI development accelerated progress before backend APIs were fully available.





