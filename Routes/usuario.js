var express = require('express');
var Usuario = require('../Models/usuario');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var mdAuthenticacion = require('../middlewares/authenticacion');

var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get('/', (req, res, next) => {

    var skip = req.query.skip || 0;
    skip = Number(skip);
    var take = req.query.take || 5;
    take = Number(take);

    Usuario.find({}, '_id nombre email img role google')
        .skip(skip)
        .limit(take)
        .exec((err, usuarios) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error en mongo DB',
                errors: err
            });
        }
        Usuario.count({}, (err, conteo)=> {
            res.status(200).json({
                ok: true,
                usuarios: usuarios,
                total: conteo
            });
        });
      

    });

});

app.put('/:id', [mdAuthenticacion.verificaToken, mdAuthenticacion.verificaAdminRoleOrMismoUsuario], (req, res) => {
    var body = req.body;
    var id = req.params.id;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error en mongo DB',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                message: 'el usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usarioAlmacenado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error en mongo DB',
                    errors: err
                });
            }
            usarioAlmacenado.password = '';
            res.status(201).json({
                ok: true,
                usuario: usarioAlmacenado
            });
        });
    });
});

app.post('/', (req, res) => {
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usarioAlmacenado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error en mongo DB',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usarioAlmacenado,
            usuarioToken: req.usuario
        });
    });


});

app.delete('/:id', [mdAuthenticacion.verificaToken, mdAuthenticacion.verificaAdminRole], (req, res) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error en mongo DB',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                message: 'el usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            usuario: usuario
        });
    });
});


module.exports = app;