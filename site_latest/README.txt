JUMPINKICKZZ — Stripe checkout setup

This version adds a Stripe Checkout payment method in TEST mode.

IMPORTANT:
- For real sales, the Stripe account and business/payment setup should be handled by an adult/legal business owner where required.
- Never send your Stripe secret key to anyone or put it in a browser HTML/JS file.
- Start with Stripe TEST mode before accepting real payments.

SETUP
1. Install Node.js on the computer running the store.
2. Open a terminal in this folder.
3. Run: npm install
4. Copy .env.example to .env
5. Put your Stripe TEST secret key in .env as STRIPE_SECRET_KEY.
6. Run: npm start
7. Open http://localhost:4242 in your browser.

Do not open index.html directly for checkout; the Node server provides the /api endpoint.

The server validates product IDs and prices from the server-side product list before creating the Stripe Checkout Session.
