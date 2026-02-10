import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { Cart } from './Cart.js';

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 0
  },
  password: {
    type: String,
    required: true
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart',
    default: null
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin']
  }
}, {
  timestamps: true
});

// Middleware pre-save para encriptar la contraseña
userSchema.pre('save', async function(next) {
  // Solo encriptar si la contraseña fue modificada o es nueva
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Encriptar la contraseña usando bcrypt.hashSync
    this.password = bcrypt.hashSync(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};

// Método para crear un carrito si no existe
userSchema.methods.ensureCart = async function() {
  if (!this.cart) {
    const newCart = new Cart({ products: [] });
    await newCart.save();
    this.cart = newCart._id;
    await this.save();
  }
  return this.cart;
};

export const User = mongoose.model('User', userSchema);

