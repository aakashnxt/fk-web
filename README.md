# Flipkart Theme - Online Shop

Same structure as the original "New folder" e-commerce site, with a **Flipkart-style theme**: blue header (#2874f0), yellow accents (#ffe500), clean layout.

## Pages

- **index.html** → redirects to home
- **home.html** – Home with product grid, search bar, cart drawer
- **product2.html** – Advanced product UI (gallery + offers + reviews + sticky actions)
- **cart.html** – Cart list, Place Order
- **checkout.html** – Address form
- **payment.html** – Payment (COD/UPI) and place order

## Run locally

```bash
npm start
```

Then open http://localhost:3000

Or open `index.html` / `home.html` directly in the browser (no server needed for basic use).

## Structure

- `css/flipkart.css` – Flipkart theme styles
- `js/app.js` – Product data and helpers (localStorage, no backend)
- `assets/new/` – Put your product images here (recommended)
- Cart and address are stored in `localStorage`.

## Product image naming (recommended)

For automatic gallery pickup on product page:

- `productimg/1-1.jpg`, `productimg/1-2.jpg`, `productimg/1-3.jpg`
- `productimg/2-1.jpg`, `productimg/2-2.jpg` ...
- `assets/new/1-1.jpg`, `assets/new/1-2.jpg`, `assets/new/1-3.jpg`
- `assets/new/2-1.jpg`, `assets/new/2-2.jpg` ...

Here `1`, `2`, `3` are product IDs.

## Theme colors

- Primary blue: `#2874f0`
- Yellow accent: `#ffe500`
- Green (off/delivery): `#388e3c`
