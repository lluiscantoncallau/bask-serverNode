var express = require('express');
var Usuario = require('../Models/usuario');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
const { OAuth2Client } = require('google-auth-library');
var CLIENT_ID = require('../config/config').CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);
var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.post('/', (req, res) => {
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

        if (!bcrypt.compareSync(body.password, userDb.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: err
            });
        }

        //Crear Token
        userDb.password = '';
        var token = jwt.sign({ usuario: userDb }, SEED, { expiresIn: 14400 });
        res.status(200).json({
            ok: true,
            usuario: userDb,
            token: token,
            id: userDb.id
        });
    });

});


async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();   
    return {
        nombre: payload.name,
        google: true,
        email: payload.email,
        img: payload.picture
    }
}

app.post('/google', async (req, res) => {
    console.log(req.body);
    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(e=> {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no valido'
            });
        });

    Usuario.findOne({email: googleUser.email}, (err, usuarioDb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error en mongo DB',
                errors: err
            });
        }
        if (usuarioDb) {
            if(!usuarioDb.google) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su authenticacion de la aplicacion',
                    errors: err
                });
            }

            usuarioDb.password = '';
            var token = jwt.sign({ usuario: usuarioDb }, SEED, { expiresIn: 14400 });
            return res.status(200).json({
                ok: true,
                usuario: usuarioDb,
                token: token,
                id: usuarioDb.id
            });

        }

        var usuario = new Usuario({
            nombre: googleUser.nombre,
            email: googleUser.email,          
            img: googleUser.img,
            google: true,
            password: ':)'           
        });
    
        usuario.save((err, usuarioDb) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error en mongo DB',
                    errors: err
                });
            }
            var token = jwt.sign({ usuario: usuarioDb }, SEED, { expiresIn: 14400 });
            return res.status(201).json({
                ok: true,
                usuario: usuarioDb,
                token: token,
                id: usuarioDb._id
            });
        });

    });

    // return res.status(200).json({
    //     ok: true,
    //     mensaje: 'Ok',
    //     googleUser: googleUser,
    //     token: token,
    //     id: usuarioDb.id
    // });
});


module.exports = app;