# Stock-Tracking-and-Portfolio-Management-Platform

Stock Tracking and Portfolio Management Platform is a comprehensive web application designed for stock trading, portfolio management, and market analysis. It provides users with tools to track stocks, manage their investments, view market news, and interact with an AI assistant for financial insights. The platform caters to regular users, brokers, and administrators, each with dedicated functionalities.

## ✨ Key Features

* **User Authentication:** Secure registration and login for users, brokers, and admins. Includes Google OAuth integration and password reset functionality (OTP via email & Redis).

* **User Roles:**
    * **Users:** Manage portfolio, watchlist, transactions, profile, wallet, interact with chatbot. Requires admin verification for full features.
    * **Brokers:** Manage assigned clients, view/process transactions (TBD - needs backend logic).
    * **Admin:** User management (view, verify, reject, potentially disable), dashboard with statistics, view pending verifications.

* **Portfolio Management:** Track owned stocks, average prices, quantities, total value, and overall gains/losses.

* **Watchlist:** Add and remove stocks for easy tracking.

* **Stock Information:** Browse stock listings, view detailed stock pages with charts and company information.

* **Market Data & News:** View market summaries, top stocks, and fetch latest financial news (via Finnhub API, currently using mock data).

* **Trading Simulation:** Buy and sell stocks (updates portfolio and wallet balance, records transactions).

* **AI Chatbot:** Integrated chatbot (using OpenRouter API) to answer stock-related questions, potentially leveraging user portfolio context.

* **Wallet System:** Users have a virtual wallet, can add funds via Stripe integration.

* **User Verification:** Admin approval workflow for user accounts, including proof document upload (e.g., License, Passport) stored via Multer.

* **Profile Management:** Users can view and update their profile information (name, contact, address). Admins can potentially update user status.

* **Responsive UI:** Built with React and Bootstrap for adaptability across devices.

* **State Management:** Uses Redux Toolkit for managing application state, particularly authentication.

* **Theming:** Includes a theme provider structure (currently only light theme implemented).

## 👥 User Roles & Flows

1. **Public Visitor:**
   * Lands on the `HomePage`.
   * Can browse general stock information (`StockListingPage`, limited?).
   * Can view Market News.
   * Can register as a User (`RegisterPage`) or Broker (`BrokerRegisterPage`).
   * Can log in (`LoginPage`).
   * Can request password reset (`ForgotPasswordPage`, `ResetPasswordPage`).

2. **Registered User (Pending/Rejected Verification):**
   * Logs in (`LoginPage`).
   * Can view their `ProfilePage` and upload verification documents.
   * Can view basic site features (e.g., stock listings, news).
   * **Cannot** access portfolio, watchlist, or execute trades until approved.
   * Receives email notification on verification status change.

3. **Registered User (Approved):**
   * Logs in.
   * Accesses their personalized `DashboardPage`.
   * Manages their `PortfolioSummary`.
   * Manages their `WatchlistPreview`.
   * Views their `RecentTransactions`.
   * Can Buy/Sell stocks via Modals (triggered from `StockListingPage` or potentially portfolio/watchlist).
   * Can add funds to their `WalletComponent` via Stripe.
   * Can use the AI `ChatBot`.
   * Manages their `ProfilePage`.
   * Logs out.

4. **Broker:**
   * Registers via `BrokerRegisterPage` (pending admin approval).
   * Logs in.
   * Accesses `BrokerDashboardPage` with client/transaction stats (currently mock data).
   * Manages clients via `ClientsManagementPage`.
   * Views and processes transactions via `TransactionsPage` (approval/rejection logic likely needed on backend).
   * Manages their own `ProfilePage`.
   * Logs out.

5. **Admin:**
   * Logs in (uses standard login, backend identifies admin type).
   * Redirected to `AdminDashboardPage`.
   * Views dashboard statistics (user counts, registrations).
   * Manages all users via `UsersManagementPage`.
   * Verifies/Rejects pending user accounts via `UserVerificationPage`.
   * Can view user details and verification documents (`UserDetailsModal`).
   * Potentially manages listed stocks (`StocksManagementPage` - currently uses mock data).
   * Logs out.

## 🛠️ Technology Stack

| Category | Technology |
| :------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend** | React, Vite, React Router, Redux Toolkit, React-Bootstrap, Axios, Formik, Yup, Recharts, Stripe.js, Google OAuth Client |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose, JWT (JSON Web Tokens), Bcrypt, Axios, Multer (File Uploads), Nodemailer (Email), Stripe API, Redis (OTP), dotenv, cors |
| **Database** | MongoDB |
| **Cache** | Redis (Used for storing Password Reset OTPs) |
| **APIs** | Finnhub (Market Data - *Note: Mock data heavily used*), OpenRouter (AI Chatbot), Google OAuth, Stripe (Payments) |
| **Styling** | Bootstrap, React-Bootstrap, Custom CSS (`theme.css`, `main.css`) |
| **Linting** | ESLint |

