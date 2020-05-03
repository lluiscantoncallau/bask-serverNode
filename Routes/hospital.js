var express = require('express');
var Hospital = require('../Models/hospital');
var bodyParser = require('body-parser');
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

    Hospital.find({})
        .skip(skip)
        .limit(take)
        .populate('usuario', 'nomre email')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error en mongo DB',
                    errors: err
                });
            }
            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                });
            });

        });

});

app.put('/:id', mdAuthenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var id = req.params.id;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error en mongo DB',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                message: 'el hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;
        hospital.save((err, hospitalAlmacenado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error en mongo DB',
                    errors: err
                });
            }
            res.status(201).json({
                ok: true,
                hospital: hospitalAlmacenado
            });
        });
    });
});

app.post('/', mdAuthenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalAlmacenado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error en mongo DB',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalAlmacenado,
            usuarioToken: req.usuario
        });
    });


});

app.delete('/:id', mdAuthenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error en mongo DB',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                message: 'el hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospital
        });
    });
});

app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error al buscar hospital',
                    errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    message: 'El hospital con el id ' + id + ' no existe',
                    errors: {
                        message: 'No existe un hospital con ese ID'
                    }
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        });
});

module.exports = app;