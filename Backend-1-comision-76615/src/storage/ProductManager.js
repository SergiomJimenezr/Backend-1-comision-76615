import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';


export class ProductManager {
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


async getAll() {
return this.#read();
}


async getById(id) {
const items = await this.#read();
return items.find(p => String(p.id) === String(id));
}


async add({ title, description, code, price, status, stock, category, thumbnails = [] }) {
const items = await this.#read();
const newItem = {
id: randomUUID(),
title,
description,
code,
price,
status,
stock,
category,
thumbnails
};
items.push(newItem);
await this.#write(items);
return newItem;
}


async updateById(id, updates) {
const items = await this.#read();
const idx = items.findIndex(p => String(p.id) === String(id));
if (idx === -1) return null;


const { id: _ignoreId, ...rest } = updates;
items[idx] = { ...items[idx], ...rest };
await this.#write(items);
return items[idx];
}


async deleteById(id) {
const items = await this.#read();
const before = items.length;
const filtered = items.filter(p => String(p.id) !== String(id));
if (filtered.length === before) return false;
await this.#write(filtered);
return true;
}
}

