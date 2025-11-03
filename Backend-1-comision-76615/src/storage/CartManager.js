import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';


export class CartManager {
constructor(path) {
this.path = path;
}


async #read() {
try {
const data = await fs.readFile(this.path, 'utf-8');
return JSON.parse(data || '[]');
} catch (e) {
if (e.code === 'ENOENT') return [];
throw e;
}
}


async #write(list) {
await fs.writeFile(this.path, JSON.stringify(list, null, 2));
}


async createCart() {
const carts = await this.#read();
const newCart = { id: randomUUID(), products: [] };
carts.push(newCart);
await this.#write(carts);
return newCart;
}


async getById(id) {
const carts = await this.#read();
return carts.find(c => String(c.id) === String(id));
}


async addProduct(cartId, productId, qty = 1) {
const carts = await this.#read();
const idx = carts.findIndex(c => String(c.id) === String(cartId));
if (idx === -1) return null;


const cart = carts[idx];
const lineIdx = cart.products.findIndex(p => String(p.product) === String(productId));
if (lineIdx === -1) {
cart.products.push({ product: productId, quantity: qty });
} else {
cart.products[lineIdx].quantity += qty;
}


carts[idx] = cart;
await this.#write(carts);
return cart;
}
}