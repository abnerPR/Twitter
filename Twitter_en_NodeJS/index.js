'use strict'

var moongose = require('mongoose');
var port = 3800;
var app = require("./app");

moongose.Promise = global.Promise;

moongose.connect('mongodb://localhost:27017/Twitter', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
    .then(()=>{
        console.log('Conexión a la DB correcta');
        app.listen(port, ()=>{
            console.log('Servidor de express corriendo, en el puerto: ' + port + ' Ruta de postman: http://localhost:3800/twitter/v1');
        });
    }).catch(err => {
        console.log('Error al conectarse', err);
    })