import { promises as fs } from 'fs';
import { resolvePath } from './paths.js';


export async function ensureDataFiles() {
const dataDir = resolvePath('data');
const productsFile = resolvePath('data/products.json');
const cartsFile = resolvePath('data/carts.json');


try { await fs.mkdir(dataDir, { recursive: true }); } catch {}


try { await fs.access(productsFile); } catch { await fs.writeFile(productsFile, '[]'); }
try { await fs.access(cartsFile); } catch { await fs.writeFile(cartsFile, '[]'); }}