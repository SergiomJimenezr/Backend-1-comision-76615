import { Cart } from '../models/Cart.js';
import mongoose from 'mongoose';

export class CartManager {
  constructor() {
    // Ya no necesita path, usa MongoDB
  }

  // Crear carrito
  async createCart() {
    const newCart = new Cart({ products: [] });
    return await newCart.save();
  }

  // Obtener carrito por ID con populate
  async getById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Cart.findById(id).populate('products.product').lean();
  }

  // Agregar producto al carrito
  async addProduct(cartId, productId, qty = 1) {
    if (!mongoose.Types.ObjectId.isValid(cartId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return null;
    }

    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    // Buscar si el producto ya existe en el carrito
    const productIndex = cart.products.findIndex(
      item => item.product.toString() === productId
    );

    if (productIndex === -1) {
      // Producto no existe, agregarlo
      cart.products.push({ product: productId, quantity: qty });
    } else {
      // Producto existe, incrementar cantidad
      cart.products[productIndex].quantity += qty;
    }

    return await cart.save();
  }

  // Eliminar producto del carrito
  async removeProduct(cartId, productId) {
    if (!mongoose.Types.ObjectId.isValid(cartId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return null;
    }

    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    cart.products = cart.products.filter(
      item => item.product.toString() !== productId
    );

    return await cart.save();
  }

  // Actualizar todos los productos del carrito
  async updateCart(cartId, products) {
    if (!mongoose.Types.ObjectId.isValid(cartId)) {
      return null;
    }

    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    cart.products = products;
    return await cart.save();
  }

  // Actualizar cantidad de un producto en el carrito
  async updateProductQuantity(cartId, productId, quantity) {
    if (!mongoose.Types.ObjectId.isValid(cartId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return null;
    }

    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    const productIndex = cart.products.findIndex(
      item => item.product.toString() === productId
    );

    if (productIndex === -1) return null;

    cart.products[productIndex].quantity = quantity;
    return await cart.save();
  }

  // Eliminar todos los productos del carrito
  async clearCart(cartId) {
    if (!mongoose.Types.ObjectId.isValid(cartId)) {
      return null;
    }

    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    cart.products = [];
    return await cart.save();
  }
}
