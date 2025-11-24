import { Router } from 'express';
import { ProductManager } from '../storage/ProductManager.js';
import { resolvePath } from '../utils/paths.js';


const router = Router();
const productsPath = resolvePath('data/products.json');
const pm = new ProductManager(productsPath);


// GET /api/products
router.get('/', async (req, res, next) => {
try {
const products = await pm.getAll();
res.json({ status: 'success', payload: products });
} catch (err) { next(err); }
});


// GET /api/products/:pid
router.get('/:pid', async (req, res, next) => {
try {
const { pid } = req.params;
const product = await pm.getById(pid);
if (!product) return res.status(404).json({ status: 'error', error: 'Product not found' });
res.json({ status: 'success', payload: product });
} catch (err) { next(err); }
});


// POST /api/products
router.post('/', async (req, res, next) => {
try {
const { title, description, code, price, status, stock, category, thumbnails } = req.body;


// Validaciones mínimas
const missing = [];
for (const [k, v] of Object.entries({ title, description, code, price, status, stock, category })) {
if (v === undefined) missing.push(k);
}
if (missing.length) return res.status(400).json({ status: 'error', error: `Missing fields: ${missing.join(', ')}` });


const newProduct = await pm.add({ title, description, code, price, status, stock, category, thumbnails: thumbnails ?? [] });
// Emitir evento socket para actualizar la vista en tiempo real
const io = req.app.get('io');
if (io) {
  const products = await pm.getAll();
  io.emit('productsUpdated', products);
}
res.status(201).json({ status: 'success', payload: newProduct });
} catch (err) { next(err); }
});


// PUT /api/products/:pid
router.put('/:pid', async (req, res, next) => {
try {
const { pid } = req.params;
if ('id' in req.body) return res.status(400).json({ status: 'error', error: 'Cannot update id field' });
const updated = await pm.updateById(pid, req.body);
if (!updated) return res.status(404).json({ status: 'error', error: 'Product not found' });
res.json({ status: 'success', payload: updated });
} catch (err) { next(err); }
});

// DELETE /api/products/:pid
router.delete('/:pid', async (req, res, next) => {
try {
const { pid } = req.params;
const ok = await pm.deleteById(pid);
if (!ok) return res.status(404).json({ status: 'error', error: 'Product not found' });
// Emitir evento socket para actualizar la vista en tiempo real
const io = req.app.get('io');
if (io) {
  const products = await pm.getAll();
  io.emit('productsUpdated', products);
}
res.json({ status: 'success', message: 'Product deleted' });
} catch (err) { next(err); }
});


export default router;
