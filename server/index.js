require('dotenv').config(); // Variables de entorno
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Configuración de la conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Cambia si usas otro usuario
  password: '13072130Rj.', // Coloca tu contraseña
  database: 'diplomatura', // Verifica que el nombre de la base de datos sea correcto
});

// Probar conexión a MySQL
db.connect((err) => {
  if (err) {
    console.error('Error al conectar a MySQL:', err.message);
    process.exit(1);
  }
  console.log('Conexión exitosa a MySQL');

  db.query('SELECT * FROM products;', (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta:', err.message);
      return;
    }
    console.log('Resultados:', results);
  });
});

// Middleware para autenticar token y verificar admin
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('Token faltante');
    return res.sendStatus(401); // No autorizado
  }

  jwt.verify(token, 'secreto', (err, user) => {
    if (err) {
      console.log('Error al verificar token:', err.message);
      return res.sendStatus(403); // Token inválido
    }
    console.log('Token válido. Usuario decodificado:', user);
    req.user = user;
    next();
  });
};


const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    console.log('Rol insuficiente o usuario no autenticado:', req.user?.role || 'Desconocido');
    return res.status(403).send('No tienes permiso para realizar esta acción.');
  }
  next();
};

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente.');
});


// Ruta para registrar usuarios
app.post('/api/register', async (req, res) => {
  const {
    firstName,
    lastName,
    dni,
    phone,
    email,
    password,
    street,
    city,
    state,
    zip_code, // Asegúrate de que el frontend está enviando zip_code
  } = req.body;

  console.log('Datos recibidos del cliente:', req.body); // Log para verificar los datos recibidos

 // Validación de campos obligatorios
  if (!firstName || !lastName || !dni || !phone || !email || !password || !street || !city || !state || !zip_code) {
    console.error('Error: Faltan datos obligatorios');
    return res.status(400).send('Faltan datos obligatorios');
  }

  try {
    console.log('Generando hash de la contraseña');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Consulta SQL para insertar usuario, asignando 'user' como valor predeterminado para role
    const query = `
      INSERT INTO users (first_name, last_name, dni, phone, email, password, street, city, state, zip_code, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'user');
    `;

    console.log('Ejecutando query:', query);

    db.query(
      query,
      [firstName, lastName, dni, phone, email, hashedPassword, street, city, state, zip_code],
      (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            console.error('Error: El usuario ya existe');
            return res.status(400).send('El usuario ya existe');
          }
          console.error('Error al insertar usuario en la base de datos:', err.message);
          return res.status(500).send('Error del servidor');
        }

        console.log('Usuario registrado con éxito:', result);
        res.status(201).send('Usuario registrado con éxito');
      }
    );
  } catch (err) {
    console.error('Error general al registrar usuario:', err.message);
    res.status(500).send('Error del servidor');
  }
});

// Ruta para iniciar sesión
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  console.log('Intentando iniciar sesión con:', { email, password }); // Log de credenciales ingresadas

  const query = 'SELECT id, email, first_name AS firstName, last_name AS lastName, phone, dni, street, city, state, zip_code AS zipCode, role, password FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Error al buscar usuario en la base de datos:', err.message);
      return res.status(500).send('Error del servidor');
    }

    console.log('Resultado de la consulta SQL:', results); // Log de los resultados obtenidos de la base de datos

    if (results.length === 0) {
      console.log('Correo no encontrado en la base de datos:', email); // Log si el correo no existe
      return res.status(404).send('Usuario no encontrado');
    }

    const user = results[0];
    console.log('Usuario encontrado en la base de datos:', user); // Log del usuario encontrado

    try {
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Resultado de comparación de contraseñas:', isMatch); // Log del resultado de la comparación

      if (!isMatch) {
        console.log('Contraseña incorrecta para el usuario:', email); // Log si la contraseña es incorrecta
        return res.status(401).send('Contraseña incorrecta');
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role }, // Incluye el rol
        'secreto',
        { expiresIn: '1h' }
      );
      console.log('Token generado:', token); // Agrega este log para confirmar
      

      console.log('Usuario autenticado con éxito. Datos enviados al cliente:', {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          phone: user.phone,
          dni: user.dni,
          street: user.street,
          city: user.city,
          state: user.state,
          zipCode: user.zipCode,
        },
      });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          phone: user.phone,
          dni: user.dni,
          street: user.street,
          city: user.city,
          state: user.state,
          zipCode: user.zipCode,
        },
      });
    } catch (compareErr) {
      console.error('Error al comparar contraseñas:', compareErr.message); // Log del error al comparar contraseñas
      res.status(500).send('Error al autenticar al usuario');
    }
  });
});

// Ruta para obtener productos
app.get('/api/products', (req, res) => {
  const query = 'SELECT * FROM products';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener productos:', err.message);
      return res.status(500).send('Error al obtener productos');
    }
    const formattedResults = results.map((product) => ({
      ...product,
      price: parseFloat(product.price),
    }));
    res.json(formattedResults);
  });
});


// Ruta para disminuir el stock de un producto
app.post('/api/products/reduce-stock', (req, res) => {
  const { productId, quantity } = req.body;

  console.log('Datos recibidos para disminuir stock:', { productId, quantity });

  if (!productId || !quantity) {
    return res.status(400).send('Faltan datos: productId y quantity son necesarios');
  }

  const query = `
    UPDATE products
    SET stock = stock - ?
    WHERE id = ? AND stock >= ?;
  `;

  db.query(query, [quantity, productId, quantity], (err, results) => {
    if (err) {
      console.error('Error al actualizar el stock:', err.message);
      return res.status(500).send('Error al actualizar el stock');
    }

    if (results.affectedRows === 0) {
      return res.status(400).send('No hay suficiente stock disponible o el producto no existe');
    }

    res.status(200).send('Stock actualizado correctamente');
  });
});


//TICKETs
app.post('/api/orders', (req, res) => {
  const { customerDni, cartItems, totalPrice, deliveryOption, shippingAddress } = req.body;

  console.log('Datos recibidos para la orden:', {
    customerDni,
    cartItems,
    totalPrice,
    deliveryOption,
    shippingAddress,
  });

  if (!customerDni || !cartItems || cartItems.length === 0 || !totalPrice || !deliveryOption || !shippingAddress) {
    console.error('Error: Datos faltantes o inválidos:', {
      customerDni,
      cartItems,
      totalPrice,
      deliveryOption,
      shippingAddress,
    });
    return res.status(400).send('Faltan datos obligatorios o el carrito está vacío.');
  }
  

  const ticketQuery = `
    INSERT INTO tickets (ticket_number, customer_dni, created_at, total_price, delivery_option, shipping_address)
    VALUES (?, ?, NOW(), ?, ?, ?)
  `;
  const ticketNumber = `TICKET-${Date.now()}`;

  db.query(ticketQuery, [ticketNumber, customerDni, totalPrice, deliveryOption, shippingAddress], (err, result) => {
    if (err) {
      console.error('Error al crear la orden:', err.message);
      return res.status(500).send('Error al crear la orden');
    }

    console.log('Orden creada:', { ticketId: result.insertId, ticketNumber });

    const ticketId = result.insertId;

    const ticketItemsQuery = `
      INSERT INTO ticket_items (ticket_id, product_id, quantity, price)
      VALUES ?
    `;
    const ticketItemsData = cartItems.map((item) => [
      ticketId,
      item.id,
      item.quantity || 1,
      parseFloat(item.price),
    ]);

    console.log('Productos que se insertarán en la orden:', ticketItemsData);

    db.query(ticketItemsQuery, [ticketItemsData], (err) => {
      if (err) {
        console.error('Error al insertar productos en la orden:', err.message);
        return res.status(500).send('Error al registrar los productos de la orden');
      }

      console.log('Productos insertados correctamente en la orden.');
      res.status(201).send({ ticketId, ticketNumber, totalPrice });
    });
  });
});


// Ruta para actualizar producto
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const fields = req.body;

  if (Object.keys(fields).length === 0) {
    console.log('No se recibieron campos para actualizar');
    return res.status(400).send('No se recibieron campos para actualizar');
  }

  // Construir consulta SQL dinámica
  const updates = [];
  const values = [];

  for (const key in fields) {
    updates.push(`${key} = ?`);
    values.push(fields[key]);
  }

  const query = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;
  values.push(id);

  console.log('Consulta SQL construida:', query, values);

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error al actualizar el producto:', err.message);
      return res.status(500).send('Error al actualizar el producto');
    }

    if (result.affectedRows === 0) {
      return res.status(404).send('Producto no encontrado');
    }

    console.log('Producto actualizado correctamente:', result);
    res.send('Producto actualizado correctamente');
  });
});

//Ruta para crear productos
app.post('/api/products', (req, res) => {
  const { name, price, stock, category } = req.body;

  if (!name || !price || !stock) {
    return res.status(400).send('Faltan datos obligatorios');
  }

  const query = 'INSERT INTO products (name, price, stock, category) VALUES (?, ?, ?, ?)';
  db.query(query, [name, price, stock, category || 'Sin categoría'], (err, result) => {
    if (err) {
      console.error('Error al crear producto:', err.message);
      return res.status(500).send('Error al crear producto');
    }

    const newProduct = { id: result.insertId, name, price, stock, category };
    res.status(201).json(newProduct);
  });
});


// Ruta para eliminar producto
app.delete('/api/products/:id',  (req, res) => {
  const { id } = req.params;

  console.log('Solicitud para eliminar producto:', id);

  const query = 'DELETE FROM products WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar el producto:', err.message);
      return res.status(500).send('Error al eliminar el producto');
    }

    if (result.affectedRows === 0) {
      return res.status(404).send('Producto no encontrado');
    }

    console.log('Producto eliminado correctamente:', result);
    res.send('Producto eliminado correctamente');
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
