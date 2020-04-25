// Requires
var express = require('express');
var mongoose = require('mongoose');

//Inicializar Variables

var app = express();

// mongo connection
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDb', (err, res) => {
    if (err) { throw err; }
    console.log('Mongo Server running at port \x1b[32m%s\x1b[0m', 27017);
});


//Importar Rutas
var appRoutes = require('./Routes/app');
var usuarioRoutes = require('./Routes/usuario');
var loginRoutes = require('./Routes/login');


//Routes
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express Server running at port \x1b[32m%s\x1b[0m', 3000);
});