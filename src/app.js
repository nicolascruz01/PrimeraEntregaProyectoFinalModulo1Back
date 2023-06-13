const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// Rutas para productos
const productsRouter = express.Router();

// Ruta raíz GET /api/products
productsRouter.get('/', (req, res) => {
  const limit = req.query.limit;
  fs.readFile('productos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al leer los productos' });
    }

    let products = JSON.parse(data);
    if (limit) {
      products = products.slice(0, limit);
    }

    res.json(products);
  });
});

// Ruta GET /api/products/:pid
productsRouter.get('/:pid', (req, res) => {
  const productId = req.params.pid;
  fs.readFile('productos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al leer los productos' });
    }

    const products = JSON.parse(data);
    const product = products.find((p) => p.id === productId);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
  });
});

// Ruta POST /api/products
productsRouter.post('/', (req, res) => {
  const { title, description, code, price, stock, category, thumbnails } = req.body;
  const product = {
    id: uuidv4(),
    title,
    description,
    code,
    price,
    status: true,
    stock,
    category,
    thumbnails
  };

  fs.readFile('productos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al leer los productos' });
    }

    const products = JSON.parse(data);
    products.push(product);

    fs.writeFile('productos.json', JSON.stringify(products), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al guardar el producto' });
      }

      res.json(product);
    });
  });
});

// Ruta PUT /api/products/:pid
productsRouter.put('/:pid', (req, res) => {
  const productId = req.params.pid;
  const updatedFields = req.body;

  fs.readFile('productos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al leer los productos' });
    }

    let products = JSON.parse(data);
    const productIndex = products.findIndex((p) => p.id === productId);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    products[productIndex] = { ...products[productIndex], ...updatedFields };

    fs.writeFile('productos.json', JSON.stringify(products), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al actualizar el producto' });
      }

      res.json(products[productIndex]);
    });
  });
});

// Ruta DELETE /api/products/:pid
productsRouter.delete('/:pid', (req, res) => {
  const productId = req.params.pid;

  fs.readFile('productos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al leer los productos' });
    }

    let products = JSON.parse(data);
    const productIndex = products.findIndex((p) => p.id === productId);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    products.splice(productIndex, 1);

    fs.writeFile('productos.json', JSON.stringify(products), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al eliminar el producto' });
      }

      res.sendStatus(204);
    });
  });
});

app.use('/api/products', productsRouter);

// Rutas para carritos
const cartsRouter = express.Router();

// Ruta POST /api/carts
cartsRouter.post('/', (req, res) => {
  const cartId = uuidv4();
  const cart = {
    id: cartId,
    products: []
  };

  fs.writeFile('carrito.json', JSON.stringify(cart), (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al crear el carrito' });
    }

    res.json(cart);
  });
});

// Ruta GET /api/carts/:cid
cartsRouter.get('/:cid', (req, res) => {
  const cartId = req.params.cid;
  fs.readFile('carrito.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al leer el carrito' });
    }

    const cart = JSON.parse(data);
    if (cart.id !== cartId) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    res.json(cart.products);
  });
});

// Ruta POST /api/carts/:cid/product/:pid
cartsRouter.post('/:cid/product/:pid', (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;

  fs.readFile('carrito.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al leer el carrito' });
    }

    let cart = JSON.parse(data);
    if (cart.id !== cartId) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const existingProduct = cart.products.find((p) => p.product === productId);
    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    fs.writeFile('carrito.json', JSON.stringify(cart), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al agregar el producto al carrito' });
      }

      res.json(cart.products);
    });
  });
});

app.use('/api/carts', cartsRouter);

// Iniciar el servidor en el puerto 8080
app.listen(8080, () => {
  console.log('Servidor escuchando en el puerto 8080');
});
