const bcrypt = require('bcrypt');
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost', // Cambiar si es necesario
  user: 'root',      // Cambiar si es necesario
  password: '13072130Rj.',      // Cambiar si es necesario
  database: 'diplomatura', // Cambiar si es necesario
});

db.connect(async (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.message);
    process.exit(1);
  }

  console.log('Conexión a la base de datos exitosa');

  const query = 'SELECT id, password FROM users';
  db.query(query, async (err, results) => {
    if (err) {
      console.error('Error al obtener usuarios:', err.message);
      process.exit(1);
    }

    for (const user of results) {
      if (!user.password.startsWith('$2b$')) { // Verificar si ya está encriptada
        const hashedPassword = await bcrypt.hash(user.password, 10);
        db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id], (err) => {
          if (err) {
            console.error(`Error al actualizar usuario ${user.id}:`, err.message);
          } else {
            console.log(`Usuario ${user.id} actualizado correctamente`);
          }
        });
      }
    }

    console.log('Actualización de contraseñas completada');
    process.exit(0);
  });
});
