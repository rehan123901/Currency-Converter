# Acme Store

A simple Node/Express e-commerce demo using EJS templates and sessions-based cart.

## Features
- Product listing and product detail pages
- Sessions-based cart (add, update quantities, remove)
- Checkout form with order confirmation
- File-backed storage for products JSON and simple orders log
- Bootstrap-based layout

## Tech Stack
- Node.js + Express
- EJS for server-side views
- express-session for cart persistence in session

## Getting Started

### Prerequisites
- Node.js 18+ (works with Node 20/22 too)

### Install
```bash
npm install
```

### Run (development)
```bash
npm run dev
```
Then open `http://localhost:3000`.

### Run (production)
```bash
npm start
```

## Project Structure
```
src/
  app.js            # Express app and routes
  server.js         # App bootstrap
  data/
    products.json   # Sample product catalog
    orders.json     # Created on first order
  utils/
    store.js        # Read/write helpers for data files
  views/            # EJS templates
    partials/
  public/
    styles.css
```

## Environment
- `SESSION_SECRET` (optional): Secret for session signing. Defaults to a dev value.

## Notes
- This demo uses in-memory sessions and JSON files for storage; not suitable for production.
- Images hotlink to Unsplash; replace with your own assets for production use.
