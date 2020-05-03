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
                message: 'Error en mongo DB',
                errors: err
            });
        }

        if (!userDb) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, userDb.password)) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas',
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
            id: userDb.id,
            menu: obtenerMenu(usuario.role)
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
    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                message: 'Token no valido'
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error en mongo DB',
                errors: err
            });
        }
        if (usuarioDb) {
            if (!usuarioDb.google) {
                return res.status(400).json({
                    ok: false,
                    message: 'Debe de usar su authenticacion de la aplicacion',
                    errors: err
                });
            }

            usuarioDb.password = '';
            var token = jwt.sign({ usuario: usuarioDb }, SEED, { expiresIn: 14400 });
            return res.status(200).json({
                ok: true,
                usuario: usuarioDb,
                token: token,
                id: usuarioDb.id,
                menu: obtenerMenu(usuarioDb.role)
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
                    message: 'Error en mongo DB',
                    errors: err
                });
            }
            var token = jwt.sign({ usuario: usuarioDb }, SEED, { expiresIn: 14400 });
            return res.status(201).json({
                ok: true,
                usuario: usuarioDb,
                token: token,
                id: usuarioDb._id,
                menu: obtenerMenu(usuarioDb.role)
            });
        });

    });

    // return res.status(200).json({
    //     ok: true,
    //     message: 'Ok',
    //     googleUser: googleUser,
    //     token: token,
    //     id: usuarioDb.id
    // });
});

function obtenerMenu(ROLE) {
    let menu = [
        {
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'ProgressBar', url: '/progress' },
                { titulo: 'Gráficas', url: '/graficas1' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'Rxjs', url: '/rxjs' },
            ]
        },
        {
            titulo: 'Mantenimientos',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [              
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Medicos', url: '/medicos' },
            ]
        }
    ];
    
    if (ROLE === 'ADMIN_ROLE'){
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
    }

    return menu;

}

module.exports = app;