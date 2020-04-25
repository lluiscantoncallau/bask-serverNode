var express = require('express');
var app = express();
const fileUpload = require('express-fileupload');
var Hospital = require('../Models/hospital');
var Usuario = require('../Models/usuario');
var Medico = require('../Models/medico');
var Fs = require('fs');

app.use(fileUpload());

app.put('/:tipo/:id', (req, res) => {

    var tipo = req.params.tipo;
    var id = req.params.id;
    // tipos permitidos
    var tiposPermitidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposPermitidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no valido',
            errors: { mensaje: 'Tipo de coleccion no valido' }
        });
    }
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Ningun fichero seleccionado',
            errors: { mensaje: 'Debe de seleccionar una imagen' }
        });
    }

    // Obtener nombre archivo    
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extension = nombreCortado[nombreCortado.length - 1];
    var listaExtensionesPermitidas = ['jpg', 'png', 'gif', 'jpeg'];

    if (listaExtensionesPermitidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { mensaje: 'Las extensiones permitidas son ' + listaExtensionesPermitidas.join(',') }
        });
    }

    //Nombre Personalizado (IdUsuario-count).extension
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    //Mover el archivo
    archivo.mv(path, function (err) {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);       
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    switch (tipo) {
        case 'usuarios':
            Usuario.findById(id, (err, usuario) => {
                var pathViejo ='./uploads/usuarios/' + usuario.img;
                if(Fs.existsSync(pathViejo)){
                    Fs.unlinkSync(pathViejo);
                }

                usuario.img = nombreArchivo;
                usuario.save((err, usuarioActualizado) => {
                    usuarioActualizado.password = '';
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada',
                        usuario: usuarioActualizado                       
                    });
                 });

            });
            break;
        case 'medicos':
            Medico.findById(id, (err, medico) => {
                var pathViejo ='./uploads/medicos/' + medico.img;
                if(Fs.existsSync(pathViejo)){
                    Fs.unlinkSync(pathViejo);
                }

                medico.img = nombreArchivo;
                medico.save((err, medicoActualizado) => {
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen del medico actualizada',
                        medico: medicoActualizado                       
                    });
                 });

            });
            break;
        case 'hospitales':
            Hospital.findById(id, (err, hospital) => {
                var pathViejo ='./uploads/hospitales/' + hospital.img;
                if(Fs.existsSync(pathViejo)){
                    Fs.unlinkSync(pathViejo);
                }

                hospital.img = nombreArchivo;
                hospital.save((err, hospitalActualizado) => {
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen del hospital actualizada',
                        hospital: hospitalActualizado                       
                    });
                 });

            });
            break;
        default:
            return;
    }
}
module.exports = app;