import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';

// Configuración de JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export { JWT_SECRET, JWT_EXPIRES_IN };

// Función para generar token JWT
export const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Estrategia Local para login
passport.use('login', new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      // Buscar usuario por email
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        return done(null, false, { message: 'Usuario no encontrado' });
      }

      // Verificar contraseña
      if (!user.comparePassword(password)) {
        return done(null, false, { message: 'Contraseña incorrecta' });
      }

      // Usuario autenticado correctamente
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Estrategia JWT para validar tokens
passport.use('jwt', new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET
  },
  async (payload, done) => {
    try {
      // Buscar usuario por ID del payload
      const user = await User.findById(payload.id).select('-password');
      
      if (!user) {
        return done(null, false, { message: 'Usuario no encontrado' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Estrategia "current" para validar usuario logueado
passport.use('current', new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromExtractors([
      ExtractJwt.fromAuthHeaderAsBearerToken(),
      ExtractJwt.fromUrlQueryParameter('token'),
      (req) => {
        let token = null;
        if (req && req.cookies) {
          token = req.cookies['jwt'];
        }
        return token;
      }
    ]),
    secretOrKey: JWT_SECRET
  },
  async (payload, done) => {
    try {
      // Buscar usuario por ID del payload y poblar el carrito
      const user = await User.findById(payload.id)
        .select('-password')
        .populate('cart');
      
      if (!user) {
        return done(null, false, { message: 'Usuario no encontrado' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

export default passport;

