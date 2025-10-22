const fs = require('fs').promises;
const path = require('path');

const productsPath = path.join(__dirname, '..', 'data', 'products.json');
const ordersPath = path.join(__dirname, '..', 'data', 'orders.json');

async function readJson(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content);
}

async function writeJson(filePath, data) {
  const json = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, json, 'utf8');
}

async function ensureOrdersFileExists() {
  try {
    await fs.access(ordersPath);
  } catch {
    await writeJson(ordersPath, []);
  }
}

async function getAllProducts() {
  return await readJson(productsPath);
}

async function getProductById(id) {
  const products = await getAllProducts();
  return products.find((p) => String(p.id) === String(id));
}

async function saveOrder(order) {
  await ensureOrdersFileExists();
  const orders = await readJson(ordersPath);
  orders.push(order);
  await writeJson(ordersPath, orders);
  return order;
}

module.exports = {
  getAllProducts,
  getProductById,
  saveOrder,
};
