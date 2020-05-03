var SEED = require('../config/config').SEED;
var jwt = require('jsonwebtoken');

exports.verificaToken = function (req, res, next) {
    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                message: 'Token no authorizado',
                errors: err
            });
        }
        req.usuario = decoded.usuario;
        next();
    });
}

exports.verificaAdminRole = function (req, res, next) {
    var usario = req.usuario;
    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    }
    else {
        return res.status(401).json({
            ok: false,
            message: 'Token no authorizado',
            errors: err
        });
    }
}

exports.verificaAdminRoleOrMismoUsuario = function (req, res, next) {
    var usario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id ) {
        next();
        return;
    }
    else {
        return res.status(401).json({
            ok: false,
            message: 'Token no authorizado',
            errors: err
        });
    }
}


