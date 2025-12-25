import { Product } from '../models/Product.js';
import mongoose from 'mongoose';

export class ProductManager {
  constructor() {
    // Ya no necesita path, usa MongoDB
  }

  // Obtener todos los productos (sin paginación, para compatibilidad)
  async getAll() {
    return await Product.find().lean();
  }

  // Obtener productos con paginación, filtros y ordenamiento
  async getPaginated({ limit = 10, page = 1, sort, query }) {
    const skip = (page - 1) * limit;
    
    // Construir filtro de búsqueda
    let filter = {};
    if (query) {
      // Intentar parsear como JSON primero
      try {
        const parsedQuery = typeof query === 'string' ? JSON.parse(query) : query;
        if (typeof parsedQuery === 'object' && parsedQuery !== null) {
          filter = parsedQuery;
        } else {
          // Si no es un objeto, tratar como string simple
          if (query === 'true' || query === 'false') {
            filter.status = query === 'true';
          } else {
            filter.category = { $regex: query, $options: 'i' }; // Búsqueda case-insensitive
          }
        }
      } catch (e) {
        // Si no es JSON válido, buscar por categoría o disponibilidad
        if (query === 'true' || query === 'false') {
          filter.status = query === 'true';
        } else {
          filter.category = { $regex: query, $options: 'i' }; // Búsqueda case-insensitive
        }
      }
    }

    // Construir opciones de ordenamiento
    let sortOption = {};
    if (sort === 'asc') {
      sortOption = { price: 1 };
    } else if (sort === 'desc') {
      sortOption = { price: -1 };
    }

    // Ejecutar consulta
    const [products, totalDocs] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalDocs / limit);
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;

    return {
      products,
      pagination: {
        totalPages,
        prevPage: hasPrevPage ? page - 1 : null,
        nextPage: hasNextPage ? page + 1 : null,
        page,
        hasPrevPage,
        hasNextPage,
        totalDocs
      }
    };
  }

  // Obtener producto por ID
  async getById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Product.findById(id).lean();
  }

  // Agregar producto
  async add({ title, description, code, price, status, stock, category, thumbnails = [] }) {
    const newProduct = new Product({
      title,
      description,
      code,
      price,
      status: status !== undefined ? status : true,
      stock,
      category,
      thumbnails
    });
    return await newProduct.save();
  }

  // Actualizar producto por ID
  async updateById(id, updates) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const { _id, id: _ignoreId, ...rest } = updates;
    const updated = await Product.findByIdAndUpdate(
      id,
      { $set: rest },
      { new: true, runValidators: true }
    ).lean();
    
    return updated;
  }

  // Eliminar producto por ID
  async deleteById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await Product.findByIdAndDelete(id);
    return result !== null;
  }
}
