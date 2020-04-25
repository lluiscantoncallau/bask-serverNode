var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;
var rolesValidos = { values: ['ADMIN_ROLE','USER_ROLE'], message: '{VALUE} no es un rol permitido'};

var usuarioSchema = new Schema({
    nombre: {type: String, required: [true, 'Nombre obligatorio']},
    email: {type: String, unique: true, required: [true, 'Email obligatorio']},
    password: {type: String, required: [true, 'Clave obligatoria']},
    img: {type: String, required: false},
    role: {type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
});

usuarioSchema.plugin(uniqueValidator, { message: 'El {PATH} ya existe en la BD'});

module.exports = mongoose.model('Usuario', usuarioSchema);