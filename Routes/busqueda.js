var express = require('express');
var app = express();

var Hospital = require('../Models/hospital');
var Usuario = require('../Models/usuario');
var Medico = require('../Models/medico');

app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var expr = new RegExp(busqueda, 'i');
    var promesa;

    switch (tabla) {
        case "medicos":
            promesa = buscarMedicos(busqueda, expr);
            break;
        case "hospitales":
            promesa = buscarHospitales(busqueda, expr);
            break;
        case "usuarios":
            promesa = buscarUsuarios(busqueda, expr);

            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: "La tabla no existe",
                error: { mensaje: 'La tabla no existe ' }
            });
    }

    promesa.then(data => {
        res.status(200).json({
            ok: false,
            [tabla]: data
        });
    });

});

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var expr = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales(busqueda, expr),
        buscarMedicos(busqueda, expr),
        buscarUsuarios(busqueda, expr)
    ]).then(respuestas => {
        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2],
        });

    });


});

function buscarHospitales(busqueda, expr) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: expr })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                }
                resolve(hospitales);
            });
    });
}

function buscarMedicos(busqueda, expr) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: expr })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos', err);
                }
                resolve(medicos);
            });
    });
}

function buscarUsuarios(busqueda, expr) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ nombre: expr }, { email: expr }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                }
                resolve(usuarios);
            });
    });
}


module.exports = app;