'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var key = 'clave_secreta';

exports.ensureAuth = (req, res, next)=> {
    var command = req.body.command.split(" ");

    if(command[0].toLowerCase() == 'register' || command[0].toLowerCase() == 'login'){
        next();
    }else{
        if(!req.headers.authotization){
            return res.status(403).send({message: 'Petición sin autenticación'});
        }else{
            var token = req.headers.authotization.replace(/['"]+/g, '');
    
            try{
                var payload = jwt.decode(token, key);
                if(payload.exp <= moment().unix()){
                    return res.status(401).send({message: 'Token expirado'});
                }
            }catch(ex){
                return res.status(404).send({message: 'Token no valido'})
            }
    
            req.user = payload;
            next();
        }
    }
}