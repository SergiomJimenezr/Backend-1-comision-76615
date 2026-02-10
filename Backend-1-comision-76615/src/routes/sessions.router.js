import { Router } from 'express';
import passport from 'passport';
import { generateToken } from '../config/passport.config.js';
import { User } from '../models/User.js';
import { Cart } from '../models/Cart.js';

const router = Router();

// POST /api/sessions/register - Registrar nuevo usuario
router.post('/register', async (req, res, next) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;

    // Validar campos requeridos
    if (!first_name || !last_name || !email || !age || !password) {
      return res.status(400).json({
        status: 'error',
        error: 'Todos los campos son requeridos: first_name, last_name, email, age, password'
      });
    }

    // Validar que el email no exista
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        error: 'El email ya está registrado'
      });
    }

    // Crear carrito para el usuario
    const newCart = new Cart({ products: [] });
    await newCart.save();

    // Crear nuevo usuario (la contraseña se encriptará automáticamente en el pre-save)
    const newUser = new User({
      first_name,
      last_name,
      email: email.toLowerCase(),
      age,
      password, // Se encriptará en el pre-save hook
      cart: newCart._id,
      role: 'user'
    });

    await newUser.save();

    // Generar token JWT
    const token = generateToken(newUser);

    res.status(201).json({
      status: 'success',
      message: 'Usuario registrado exitosamente',
      payload: {
        user: {
          id: newUser._id,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          email: newUser.email,
          age: newUser.age,
          role: newUser.role,
          cart: newUser.cart
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/sessions/login - Login de usuario
router.post('/login', async (req, res, next) => {
  passport.authenticate('login', async (err, user, info) => {
    try {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({
          status: 'error',
          error: info.message || 'Error de autenticación'
        });
      }

      // Asegurar que el usuario tenga un carrito
      await user.ensureCart();

      // Generar token JWT
      const token = generateToken(user);

      res.json({
        status: 'success',
        message: 'Login exitoso',
        payload: {
          user: {
            id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            age: user.age,
            role: user.role,
            cart: user.cart
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  })(req, res, next);
});

// GET /api/sessions/current - Obtener usuario actual mediante JWT
router.get('/current', 
  passport.authenticate('current', { session: false }),
  async (req, res, next) => {
    try {
      // El usuario ya está disponible en req.user gracias a la estrategia 'current'
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          error: 'Usuario no autenticado'
        });
      }

      res.json({
        status: 'success',
        payload: {
          user: {
            id: req.user._id,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            age: req.user.age,
            role: req.user.role,
            cart: req.user.cart
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

