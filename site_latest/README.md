# JUMPINKICKZZ

A modern streetwear storefront for browsing products, viewing product details, managing a cart, and checking out with Stripe.

## Features

- Streetwear-focused catalog and brand pages
- Product detail pages
- Size selection for apparel and footwear
- Interactive shoe product viewer
- Search, filtering, and sorting
- Persistent shopping cart using browser storage
- Checkout flow with Stripe Checkout
- Responsive layout for desktop and mobile

## Project structure

- `index.html` — homepage
- `catalog.html` — full catalog
- `product.html` — product detail page
- `checkout.html` — checkout page
- `balenciaga.html`, `dior.html`, `purple.html`, etc. — brand/category pages
- `products.js` — product catalog data
- `store.js` — shared storefront/cart behavior
- `store.css` / `style.css` — storefront styling
- `server.js` — local Node/Express server and Stripe checkout endpoint
- `.env.example` — environment-variable template
- `package.json` — Node dependencies and scripts

## Run locally

1. Install Node.js.
2. Open a terminal in the folder containing `package.json`.
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file from `.env.example`.
5. Add your Stripe secret key to `.env`.
6. Start the server:

```bash
npm start
```

7. Open the local address printed by the server.

Do not put a Stripe secret key in HTML, client-side JavaScript, or any file that is committed to Git.

## Stripe

The project uses Stripe Checkout for payments. Use Stripe test keys while developing and testing. Before accepting real payments, configure the live Stripe account, production domain, webhook/fulfillment handling, and required business/legal information.

## Git

Before the first commit, make sure `.env`, `node_modules/`, logs, and operating-system files are ignored by `.gitignore`.

## License

The original source code in this project is provided under the MIT License in `LICENSE`.

Third-party trademarks, brand names, product names, product photographs, logos, and other third-party assets are **not** automatically covered by that license and remain subject to their respective owners' rights.
