// Requires
var express = require('express');
var mongoose = require('mongoose');

//Inicializar Variables

var app = express();

//CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
  });


// mongo connection
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDb', (err, res) => {
    if (err) { throw err; }
    console.log('Mongo Server running at port \x1b[32m%s\x1b[0m', 27017);
});


//Importar Rutas
var appRoutes = require('./Routes/app');
var usuarioRoutes = require('./Routes/usuario');
var loginRoutes = require('./Routes/login');
var hospitalRoutes = require('./Routes/hospital');
var medicoRoutes = require('./Routes/medico');
var busquedaRoutes = require('./Routes/busqueda');
var uploadRoutes = require('./Routes/upload');
var imagenesRoutes = require('./Routes/imagenes');

//Routes
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express Server running at port \x1b[32m%s\x1b[0m', 3000);
});