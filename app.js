  const express = require('express');
  const bodyParser = require('body-parser');
  const jwt = require('jsonwebtoken');
  const cors = require('cors');
  // Simular una base de datos.
  let { infoUsuarios } = require('./usuarios.js');
  const fs = require('fs');
  const bcryptjs = require('bcryptjs');
  const path = require('path');
const e = require('express');
  const app = express();
  require('dotenv').config(); // Cargar variables de entorno desde .env
  const secretKey = process.env.SECRET_KEY; // Acceder a la clave secreta


  app.use(cors());
  app.use(bodyParser.json());
  
  app.get('/', (req, res) => {
    res.send('¡Bienvenido al backend de NDeveloper!');
  });


  app.post('/registro', (req, res) => {
    const nuevoUsuario = req.body; // Datos del nuevo usuario enviados en el cuerpo de la solicitud

    // Asignar un nuevo ID al usuario (puedes usar algún método para generar un ID único)
    nuevoUsuario.id = infoUsuarios.usuarios.length + 1;

    // Generar un salt (factor de aleatoriedad)
    const saltRounds = 10;
    let plaintextPassword = nuevoUsuario.password;

    // Hashing de la contraseña
    bcryptjs.genSalt(saltRounds, function(err, salt) {
        bcryptjs.hash(plaintextPassword, salt, function(err, hash) {
            if (err) {
                console.error(err);
                res.status(500).json({ success: false, message: "Error al registrar el usuario" });
                return;
            }
            console.log('Contraseña hasheada:', hash);
            nuevoUsuario.password = hash;
            // Aquí puedes almacenar el 'hash' en tu base de datos
            // Agregar el nuevo usuario al array de usuarios
            infoUsuarios.usuarios.push(nuevoUsuario);
            guardarUsuariosEnArchivo();
            res.json({ success: true, message: "Usuario registrado correctamente" });
        });
    });
});


  app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Buscar el usuario en el array de usuarios
    const usuarioEncontrado = infoUsuarios.usuarios.find(usuario => usuario.email === email);

    if (usuarioEncontrado) {
      // Comparar la contraseña proporcionada con el hash almacenado en la base de datos
      bcryptjs.compare(password, usuarioEncontrado.password, function(err, result) {
        if (err) {
          console.error(err);
          res.status(500).json({ message: 'Error en el servidor' });
          return;
        }

        
        if (result) {
          const payload = {
            email: usuarioEncontrado.id
          };

          // Generar token de acceso con expiración corta (15 minutos)
          const accessToken = jwt.sign(payload, secretKey, { expiresIn: '1s' });

          // Generar token de refresco con expiración más larga (7 días)
          const refreshToken = jwt.sign(payload, secretKey, { expiresIn: '1s' });

          res.json({ accessToken, refreshToken });
        } else {
          res.status(401).json({ message: 'Contraseña incorrecta' });
        }
      });
    } else {
      res.status(402).json({ message: 'Usuario no encontrado' });
    }
  });



  app.get('/usuarios', (req, res) => {
    const token = req.headers.authorization;
  
    if (!token) {
      return res.status(401).json({ message: 'Acceso no Autorizado sin TOKEN' });
    }
  
    // Eliminar el prefijo "Bearer" y obtener solo el token
    const tokenSinPrefijo = token.replace('Bearer ', '');
  
    jwt.verify(tokenSinPrefijo, secretKey, (error, decoded) => {
      if (error) {
        return res.status(401).json({ message: 'Token inválido' });
      }
  
      res.json({ message: 'Acceso a recurso protegido exitoso', user: decoded });
    });
  });
  

  const port = process.env.port ?? 8080;

  app.listen(port, () => {
    console.log(`Servidor en funcionamiento en el puerto ${port}`);
  });

  // guardar usuarios

  function guardarUsuariosEnArchivo() {
    const contenido = `const infoUsuarios = ${JSON.stringify(infoUsuarios, null, 2)};\n\nmodule.exports = { infoUsuarios };`;

    try {
      fs.writeFileSync('./usuarios.js', contenido, 'utf8');
      console.log('Usuarios guardados en el archivo usuarios.js correctamente.');
    } catch (err) {
      console.error('Error al guardar usuarios en el archivo:', err);
    }
  }


  // TOKEN

  app.post('/refresh-token', (req, res) => {
    const { refreshToken } = req.body;
  
    if (!refreshToken || !refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ message: 'Token de refresco no válido' });
    }
  
    const newAccessToken = generateAccessToken();
    const refreshTokenIndex = refreshTokens.indexOf(refreshToken);
    refreshTokens[refreshTokenIndex] = generateRefreshToken();
  
    res.json({ accessToken: newAccessToken, message: 'Token de acceso actualizado' });
  });
  

