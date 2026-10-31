# CareConnect: Accessible Healthcare Appointment Booking Platform
**HCI Mini-Project | Manipal University Jaipur**  
*Department of Computer Science & Engineering*

---

## 1. Project Overview

**CareConnect** is an accessible, universal healthcare appointment booking web application engineered according to Human-Computer Interaction (HCI) principles, Nielsen’s Usability Heuristics, and WCAG 2.1 AA/AAA accessibility guidelines.

The system addresses the cognitive and physical barriers that commonly prevent **elderly individuals**, **visually impaired users**, and **first-time digital healthcare patients** from booking medical consultations online.

---

## 2. Key HCI Features & Usability Heuristics

| Nielsen's Usability Heuristic | CareConnect Implementation | HCI Justification |
| :--- | :--- | :--- |
| **#1: Visibility of System Status** | • 4-step progressive booking stepper (*Doctor $\rightarrow$ Date/Time $\rightarrow$ Review $\rightarrow$ Confirmed*).<br>• Real-time slot status badges (*Available* / *Booked*). | Eliminates user anxiety by making current progress and system responses immediately obvious. |
| **#2: Match Between System & Real World** | • Natural categorization into Morning (9 AM–12 PM) and Afternoon (2 PM–5 PM).<br>• Plain, empathetic language free of medical or database jargon. | Leverages existing real-world mental models of clinic hours. |
| **#3: User Control & Freedom** | • Clear "Back" buttons at every step of booking.<br>• One-click cancellation with confirmation dialog.<br>• Unrestricted reset of search filters. | Patients can explore without fear of making permanent, irreversible errors. |
| **#4: Consistency & Standards** | • Predictable top accessibility bar and navigation bar on every screen.<br>• Universal healthcare cross and calendar iconography paired with explicit text. | Promotes recognition and reduces learning time for novice users. |
| **#5: Error Prevention** | • PostgreSQL row-level locks (`SELECT ... FOR UPDATE`) prevent concurrent double-booking.<br>• Irreversible past dates are blocked from selection. | High-cost booking conflicts are caught at the database engine level. |
| **#6: Recognition Rather Than Recall** | • Persistent summary card displaying selected doctor, clinic, date, time, and fee during checkout. | Protects short-term working memory limits of elderly users. |
| **#7: Flexibility & Efficiency of Use** | • Keyboard navigation (`Tab`, `Enter`, `Space`, `Esc`).<br>• Quick preset buttons for font sizes (`A`, `A+`, `A++`). | Equitably serves both novice touchscreen users and power keyboard users. |
| **#8: Aesthetic & Minimalist Design** | • Generous white space, calm healthcare teal palette, no popups or banner ads. | Prevents cognitive fatigue and sensory overload. |
| **#9: Help Users Recognize & Recover from Errors** | • Human-readable inline validation (e.g. *"Please enter an email address with an @ symbol"*).<br>• Helpful empty states with one-click filter resets. | Eliminates cryptic numeric error codes (e.g., 500, 404). |
| **#10: Universal Design & Multimodal Interaction** | • Native Web Speech API Text-to-Speech (`Read Page Aloud`).<br>• High-contrast toggle (WCAG 2.1 AAA).<br>• Minimum 48px touch targets for motor tremors. | Enables equitable access across diverse sensory abilities. |

---

## 3. Technology Stack (PERN)

* **Frontend:** React.js 18 (Vite), Tailwind CSS, Lucide React icons, Web Speech API.
* **Backend:** Node.js 24, Express.js (REST API, JWT authentication, centralized error handling).
* **Database:** PostgreSQL 14+ (Normalized schema, UUID primary keys, row-level locks, transactions).
* **Architecture:** Modular client-server architecture with centralized accessibility context.

---

## 4. Quick Setup & Run Instructions

### Prerequisites
* **Node.js** (v18 or higher)
* **PostgreSQL** (v14 or higher running on `127.0.0.1:5432`)

### Step 1: Database Setup
1. Ensure your local PostgreSQL service is running:
   ```bash
   brew services start postgresql@14
   ```
2. Create the database:
   ```bash
   createdb -h 127.0.0.1 careconnect_db
   ```
3. Run migrations and database seeding from the server directory:
   ```bash
   cd server
   npm install
   npm run db:migrate
   npm run db:seed
   ```
   *This automatically generates specializations, 7 fictional doctors with verified credentials, and 14 days of consultation slots!*

### Step 2: Start the Backend Server
```bash
cd server
npm start
# Server starts on http://localhost:5000
# Health check available at http://localhost:5000/api/health
```

### Step 3: Start the Frontend Client
In a new terminal window:
```bash
cd client
npm install
npm run dev
# Frontend starts on http://localhost:5173
```

Open your browser at **`http://localhost:5173`**.

---

## 5. Pre-Configured Demo Accounts (For Viva / Evaluation)

For fast testing and viva demonstration, pre-seeded accounts are provided:

| Role | Email | Password | Pre-configured Profile |
| :--- | :--- | :--- | :--- |
| **Patient (Senior)** | `ramesh@careconnect.org` | `Password123!` | Elderly patient with pre-seeded upcoming and past appointments. *One-click autofill is available directly on the login page!* |
| **Patient (A11y)** | `priya@careconnect.org` | `Password123!` | Pre-configured high-contrast preference. |
| **Administrator** | `admin@careconnect.org` | `Password123!` | Healthcare coordinator account. |

*You can also create a new patient account in seconds using the "Register" form.*

---

## 6. Academic Usability Evaluation Protocol

The system is instrumented to support an empirical academic usability study:

1. **Benchmark Tasks:**
   * **Task 1:** Adjust font size to Large (`A+`) and enable High Contrast.
   * **Task 2:** Find a Geriatric Medicine or Cardiology specialist.
   * **Task 3:** Complete an appointment booking using the 4-step wizard.
   * **Task 4:** View confirmed appointments on the dashboard and cancel a booking.
2. **Metrics Measured:**
   * **Task Completion Rate (TCR):** Target 100% across all age demographics.
   * **Time on Task (ToT):** Average booking time $< 90$ seconds.
   * **Error Frequency:** Recorded double-booking or form validation slips.
   * **System Usability Scale (SUS):** 10-item post-test survey (Target SUS $> 80$).

---

## 7. Viva Defense Talking Points

1. **How is double-booking prevented?**  
   *We enforce row-level locking via `SELECT ... FOR UPDATE` inside an atomic PostgreSQL transaction. If two patients attempt to book the same slot simultaneously, the second transaction is queued; once the lock releases, it detects `status = 'BOOKED'` and rejects the transaction with a friendly `409 Conflict` error.*

2. **How does CareConnect support screen-reader users in a Single Page App (SPA)?**  
   *CareConnect features an active `RouteAnnouncer` component containing an `aria-live="polite"` region. Upon route transitions, it announces the page title and moves keyboard focus to the main content container, preventing blind users from losing spatial context.*

3. **Why use dual persistence for accessibility preferences?**  
   *Preferences (font scale, high contrast, voice guidance) are stored immediately in `localStorage` to eliminate Flash of Unstyled Content (FOUC), and synchronized to the PostgreSQL `user_accessibility_preferences` table when logged in for cross-device continuity.*
