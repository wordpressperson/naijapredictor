# NaijaPredictor 🇳🇬🔮

NaijaPredictor is a Next.js-based prediction market platform where users can place wagers on various outcomes using a virtual points system. The platform allows users to bet on "yes" or "no" for different market questions, and provides dynamic payouts based on the betting pool.

## 🚀 Tech Stack

* **Frontend:** [Next.js 14](https://nextjs.org/) (App Router), React 18
* **Language:** TypeScript
* **Backend/Database:** [Supabase](https://supabase.com/) (PostgreSQL)
* **Authentication:** Supabase Auth

## 🛠️ Technical Documentation

### Database Architecture

The application relies on a PostgreSQL database hosted via Supabase, comprising three primary tables:

1. **`profiles`**: Extends the default `auth.users` table. 
   * Tracks user `points` (balance), `email`, and an `is_admin` boolean flag.
   * New users automatically receive 10 initial points via the `handle_new_user` trigger.
2. **`markets`**: Stores the prediction questions.
   * Tracks the `question`, `status` (open/resolved), `outcome` (yes/no), and the total pooled points for both `total_yes` and `total_no`.
3. **`bets`**: Records individual wagers.
   * Links `user_id` and `market_id`.
   * Stores the `amount` wagered and the user's `choice` ('yes' or 'no').

### Core Logic (Stored Procedures)

The core betting logic is handled securely at the database level using PostgreSQL PL/pgSQL functions:

* **`place_bet(p_market_id, p_amount, p_choice)`**: 
  * Verifies user has sufficient points and the market is still 'open'.
  * Deducts the bet amount from the user's profile.
  * Inserts the bet record and updates the total pool for the chosen side in the `markets` table.
* **`resolve_market(p_market_id, p_outcome)`**: 
  * Only executable by users with `is_admin = true`.
  * Closes the market and sets the winning outcome.
  * Calculates proportional payouts for winning bets based on the total pool size.
  * If the winning pool is empty, refunds all bets.

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables in a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## 📈 Areas for Improvement

While the core functionality is intact, several areas can be enhanced to improve scalability, user experience, and platform robustness:

### 1. Advanced Market Mechanics (AMM)
* Currently, payouts are calculated proportionally after the market resolves (pari-mutuel system). Implementing an Automated Market Maker (AMM) like CPMM (Constant Product Market Maker) would allow users to buy and sell shares dynamically before the market resolves, allowing for changing odds and early cash-outs.

### 2. Real-Time Updates
* Integrate Supabase Realtime subscriptions to instantly update the UI when new bets are placed or when a market is resolved. This will create a more engaging, live betting experience without requiring page refreshes.

### 3. User Experience & Social Features
* **Leaderboard:** Create a ranking page showing the most profitable predictors.
* **Transaction History:** Add a dashboard where users can see their active bets, past bets, and net profit/loss.
* **Comments/Discussion:** Allow users to discuss specific markets directly on the market page.

### 4. Admin Dashboard UI
* Currently, market resolution and creation rely on direct database interaction or basic scripts. Building a dedicated, secure Admin UI within the Next.js app to create markets, close betting, and resolve outcomes will streamline platform management.

### 5. Testing & CI/CD
* Add comprehensive unit and integration tests (e.g., using Jest and Cypress/Playwright) specifically for the database RPC calls and the betting edge cases (e.g., zero-point bets, betting on closed markets).

### 6. Monetization / Fiat Integration
* Transition from virtual points to a real-money or cryptocurrency model. This would involve integrating payment gateways (like Paystack/Flutterwave for the Nigerian market) or Web3 wallets for deposits and withdrawals.
