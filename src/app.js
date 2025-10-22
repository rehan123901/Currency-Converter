const path = require('path');
const express = require('express');
const session = require('express-session');
const {
  getAllProducts,
  getProductById,
  saveOrder,
} = require('./utils/store');

const app = express();

// View engine and static files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Body parsing
app.use(express.urlencoded({ extended: false }));

// Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
  })
);

// Cart initializer and cart count for navbar
app.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = {};
  }
  res.locals.cartCount = Object.values(req.session.cart).reduce(
    (sum, qty) => sum + qty,
    0
  );
  next();
});

async function buildCartFromSession(cart) {
  const products = await getAllProducts();
  const items = [];
  let total = 0;
  for (const [id, quantity] of Object.entries(cart)) {
    const product = products.find((p) => String(p.id) === String(id));
    if (!product) continue;
    const lineTotal = product.price * quantity;
    total += lineTotal;
    items.push({ product, quantity, lineTotal });
  }
  return { items, total };
}

// Routes
app.get('/', async (req, res, next) => {
  try {
    const products = await getAllProducts();
    const featured = products.slice(0, 4);
    res.render('index', { title: 'Home', products: featured });
  } catch (err) {
    next(err);
  }
});

app.get('/products', async (req, res, next) => {
  try {
    const products = await getAllProducts();
    res.render('products', { title: 'Products', products });
  } catch (err) {
    next(err);
  }
});

app.get('/products/:id', async (req, res, next) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) return res.status(404).render('not-found', { title: 'Not Found' });
    res.render('product', { title: product.name, product });
  } catch (err) {
    next(err);
  }
});

app.get('/cart', async (req, res, next) => {
  try {
    const { items, total } = await buildCartFromSession(req.session.cart);
    res.render('cart', { title: 'Your Cart', items, total });
  } catch (err) {
    next(err);
  }
});

app.post('/cart/add', async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const product = await getProductById(productId);
    if (!product) return res.status(404).send('Product not found');
    const qty = Math.max(1, parseInt(quantity || '1', 10));
    req.session.cart[product.id] = (req.session.cart[product.id] || 0) + qty;
    res.redirect('/cart');
  } catch (err) {
    next(err);
  }
});

app.post('/cart/remove/:id', (req, res) => {
  delete req.session.cart[req.params.id];
  res.redirect('/cart');
});

app.post('/cart/update', (req, res) => {
  const { productId = [], quantity = [] } = req.body;
  const ids = Array.isArray(productId) ? productId : [productId];
  const qtys = Array.isArray(quantity) ? quantity : [quantity];
  const newCart = {};
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const qty = Math.max(0, parseInt(qtys[i] || '0', 10));
    if (qty > 0) newCart[id] = qty;
  }
  req.session.cart = newCart;
  res.redirect('/cart');
});

app.get('/checkout', async (req, res, next) => {
  try {
    const { items, total } = await buildCartFromSession(req.session.cart);
    if (!items.length) return res.redirect('/products');
    res.render('checkout', { title: 'Checkout', items, total });
  } catch (err) {
    next(err);
  }
});

app.post('/checkout', async (req, res, next) => {
  try {
    const { name, email, address } = req.body;
    const { items, total } = await buildCartFromSession(req.session.cart);
    if (!items.length) return res.redirect('/products');

    const orderId = Date.now().toString(36);
    const order = {
      id: orderId,
      customer: { name, email, address },
      items: items.map((i) => ({
        id: i.product.id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
      })),
      total,
      createdAt: new Date().toISOString(),
    };

    await saveOrder(order);
    req.session.cart = {};
    res.redirect(`/order/confirmation/${orderId}`);
  } catch (err) {
    next(err);
  }
});

app.get('/order/confirmation/:orderId', (req, res) => {
  res.render('order-confirmation', {
    title: 'Order Confirmation',
    orderId: req.params.orderId,
  });
});

app.use((req, res) => {
  res.status(404).render('not-found', { title: 'Not Found' });
});

app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).send('Internal Server Error');
});

module.exports = app;
