var express = require('express');
var Medico = require('../Models/medico');
var bodyParser = require('body-parser');
var mdAuthenticacion = require('../middlewares/authenticacion');

var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get('/', (req, res, next) => {
    Medico.find({}, '_id nombre img hospital', (err, medicos) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error en mongo DB',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            medicos: medicos
        });

    });

});

app.put('/:id', mdAuthenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var id = req.params.id;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error en mongo DB',
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el medico con el id ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }
        medico.nombre = body.nombre;        
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoAlmacenado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error en mongo DB',
                    errors: err
                });
            }           
            res.status(201).json({
                ok: true,
                medico: medicoAlmacenado
            });
        });
    });
});

app.post('/', mdAuthenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre, 
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoAlmacenado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error en mongo DB',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoAlmacenado,
            usuarioToken: req.usuario
        });
    });


});

app.delete('/:id', mdAuthenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error en mongo DB',
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el medico con el id ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            medico: medico
        });
    });
});


module.exports = app;