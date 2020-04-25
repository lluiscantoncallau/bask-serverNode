var express = require('express');
var Usuario = require('../Models/usuario');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
var app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.post('/', (req, res)=> {
    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, userDb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error en mongo DB',
                errors: err
            });
        }

        if (!userDb) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: err
            });
        }

        if(!bcrypt.compareSync(body.password, userDb.password)){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: err
            });
        }

        //Crear Token
        userDb.password = '';
        var token = jwt.sign({ usuario: userDb}, SEED, { expiresIn: 14400 }); 
        res.status(200).json({
            ok: true,
           usuario: userDb,
           token: token,
           id: userDb.id
        });
    });
   
});

module.exports = app;