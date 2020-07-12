'use strict'

var User = require('../models/user.model');
var Tweet = require('../models/tweet.model');
var Followed = require('../models/follower.model');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');

function comands(req, res){
    var user = new User();
    var params = req.body;
    var command = params.command.split(" ")

    if(command[0].toLowerCase() == 'register'){
        if(command.length == 5){
            User.findOne({$or:[{email: command[2]}, {username: command[3]}]}, (err, userFind) =>{
                if(err){
                    res.status(500).send({message: 'Error general', err});
                }else if(userFind){
                    res.send({message: 'usuario o correo ya utilizado'});
                }else{
                    user.name = command[1];
                    user.email = command[2];
                    user.username = command[3];
                    
                    bcrypt.hash(command[4], null, null, (err, passwordHash)=>{
                        if(err){
                            res.status(500).send({message: 'Error al encriptar contraseña', err});
                        }else if(passwordHash){
                            user.password = passwordHash;

                            user.save((err, userSaved)=>{
                                if(err){
                                    res.status(500).send({message: 'Error general', err});
                                }else if(userSaved){
                                    res.send({message: 'Usuario guardado', user: userSaved});
                                }else{
                                    res.status(404).send({message: 'Usuario no guardado'});
                                }
                            });
                        }else{
                            res.status(410).send({message: 'Error inesperado'});
                        }
                    })
                }
            })
        }else{
            res.send({message: 'Datos insuficientes para registrarse, orden (register name email username password)'});
        }

    }else if(command[0].toLowerCase() == "login"){
        if(command.length == 3){
            User.findOne({$or:[{email: command[1]}, {username: command[1]}]}, (err, check)=>{
                if(err){
                    res.status(500).send({message: 'Error general', err});
                }else if(check){
                    bcrypt.compare(command[2], check.password, (err, passworOk)=>{
                        if(err){
                            res.status(500).send({message: 'Error al comparar', err})
                        }else if(passworOk){
                            if(params.gettoken = 'true'){
                                res.send({token: jwt.createToken(check), user: check.name});
                            }else{
                                res.send({message: 'Error en el servidor al generar autenticación'});
                            }
                        }else{
                            res.send({message: 'Contraseña incorrecta'})
                        }
                    })
                }else{
                    res.send({message: 'Datos de usuario incorrectos, orden (login (email o username) password)'})
                }
            })
        }else{
            res.send({message: 'Error al iniciar sesión, orden (login (email o username) password)'});
        }

    }else if(command[0].toLowerCase() == 'add_tweet'){
        if(command.length >= 2){
            var userId = req.user.sub;
            var tweet = new Tweet();
            var t = "";

            for(var i = 1; i < command.length; i++){
                var t = t + command[i] + " "; 
            }

            tweet.text = t;

            User.findByIdAndUpdate(userId, {$push:{tweets: tweet}}, {new: true}, (err, tweetOk)=>{
                if(err){
                    res.status(500).send({message: 'Error general', err});
                }else if(tweetOk){
                    res.send({message: 'Tweet Creado exitosamente', User: tweetOk.name, Tweets: tweetOk.tweets});
                }else{
                    res.status(404).send({message: 'Error al crear tweet'});
                }
            })
        }else{
            res.send({message: 'Datos insuficientes, orden (add_tweet texto_tweet)'})
        }

    }else if(command[0].toLowerCase() == 'delete_tweet'){
        if(command.length == 2){
            var userId = req.user.sub;
            var tweetId = command[1];

            User.findOneAndUpdate({_id: userId, "tweets._id": tweetId}, {$pull:{tweets:{_id: tweetId}}}, {new: true}, (err, tweetdelete)=>{
                if(err){
                    res.status(500).send({message: 'Error general', err});
                }else if(tweetdelete){
                    res.send({message: 'Tweet eliminado exitosamente', User: tweetdelete.name, Tweets: tweetdelete.tweets});
                }else{
                    res.status(418).send({message: 'No existe el tweet o no puedes eliminarlo'});
                }
            })
        }else{
            res.send({message: 'Error al eliminar tweet, orden (delete_tweet idTweet)'})
        }

    }else if(command[0].toLowerCase() == 'edit_tweet'){
        if(command.length >= 3){
            var userId = req.user.sub;
            var tweetId = command[1];
            var t = "";

            for(let i = 2; i < command.length; i++){
                t = t + command[i] + " ";
            }

            User.findOne({_id: userId}, (err, userOk)=>{
                if(err){
                    res.status(500).send({message: 'Error general', err});
                }else if(userOk){
                    User.findOneAndUpdate({_id: userId, "tweets._id": tweetId}, {"tweets.$.text": t}, {new: true}, (err, tweetEdit)=>{
                        if(err){
                            res.status(500).send({message: 'Error general', err});
                        }else if(tweetEdit){
                            res.send({message: 'Tweet editado', User: tweetEdit.name, Tweets: tweetEdit.tweets});
                        }else{
                            res.status(418).send({message: 'No existe o no puede editar este tweet'});
                        }
                    })
                }else{
                    res.status(404).send({message: 'Usuario o Tweet inexistente'});
                }
            })
        }else{
            res.send({message: 'Error al editar tweet, orden (edit_tweet idTweet texto_del_Nuevo_Tweet'})
        }
    }

    else if(command[0].toLowerCase() == 'view_tweets'){
        if(command.length == 2){
            
            User.findOne({username: command[1]}, (err, userOk)=>{
                if(err){
                    res.status(500).send({message: 'Error general', err});
                }else if(userOk){
                    res.send({message: 'Usuario encontrado', User: userOk.name, Username: userOk.username, Tweets: userOk.tweets});
                }else{
                    res.status(404).send({message: 'Usuario no encontrado'});
                }
            })
        }else{
            res.send({message: 'Error al mostrar tweets, orden (view_tweets username)'})
        }

    }else if(command[0].toLowerCase() == 'follow'){
        if(command.length == 2){
            var follower = new Followed();
            var user = req.user;

            if(user.username == command[1]){
                res.send({message: 'No te puedes seguir tu mismo'});
            }else{
                follower._id = user.sub;
                follower.name = user.name;
                follower.username = user.username;

                User.findOneAndUpdate({username: command[1], "followers._id": user.sub}, null, {new: true}, (err, userOk)=>{
                    if(err){
                        res.send({message: 'Error general', err});
                    }else if(userOk){
                        res.send({message: 'Ya sigues a este usuario'});
                    }else{
                        User.findOneAndUpdate({username: command[1]}, {$push:{followers: follower}}, {new: true}, (err, followerOk)=>{
                            if(err){
                                res.status(500).send({message: 'Error general', err});
                            }else if(followerOk){
                                follower._id = followerOk._id;
                                follower.name = followerOk.name;
                                follower.username = followerOk.username;

                                User.findOneAndUpdate({_id: user.sub}, {$push:{followed: follower}}, {new: true}, (err, followedOk)=>{
                                    if(err){
                                        res.status(500).send({message: 'Error general', err});
                                    }else if(followedOk){
                                        res.send({message: 'Usuario seguido', User: followedOk.name, Username: followedOk.username, Followed: followedOk.followed});
                                    }else{
                                        res.send({message: 'Error al intentar seguir al usuario'});
                                    }
                                })
                            }else{
                                res.send({message: 'Usuario inexistente'});
                            }
                        })
                    }
                })
            }
        }else{
            res.send({message: 'Error al seguir usuario, orden (follow username)'})
        }
    }

    else if(command[0].toLowerCase() == 'unfollow'){
        if(command.length == 2){
            var user = req.user;

            if(user.username == command[1]){
                res.send({message: 'No te puedes dejar de seguirte tu mismo'});
            }else{

                User.findOneAndUpdate({_id: user.sub, "followed.username": command[1]}, {$pull:{followed:{username: command[1]}}}, {new: true}, (err, userOk)=>{
                    if(err){
                        res.send({message: 'Error general', err});
                    }else if(userOk){
                        User.findOneAndUpdate({username: command[1], "followers._id": user.sub}, {$pull:{followers:{_id: user.sub}}}, {new: true}, (err, userdelete)=>{
                            if(err){
                                res.status(500).send({message: 'Error general', err});
                            }else if(userdelete){
                                res.send({message: 'Dejaste de seguir al usuario', User: userOk.name, Username: userOk.username, Followed: userOk.followed});
                            }else{
                                res.send({message: 'Error al dejar de seguir al usuario'})
                            }
                        })
                    }else{
                        res.send({message: 'No existe o no sigues al usuario'});
                    }
                })
            } 
        }else{
            res.send({message: 'Error al dejar de seguir usuario, orden (unfollow username)'})
        }
    }

    else if(command[0].toLowerCase() == 'profile'){
        if(command.length == 2){
            var user = req.user

            if(command[1] == user.username){
                User.findOne({username: command[1]}, (err, userOk)=>{
                    if(err){
                        res.status(500).send({message: 'Error general', err});
                    }else if(userOk){
                            res.send({message: 'Mi perfil', Name: userOk.name,
                                                                    Username: userOk.username,
                                                                    Email: userOk.email,
                                                                    Password: userOk.password,
                                                                    Tweets: userOk.tweets,
                                                                    Followed: userOk.followed,
                                                                    Followers: userOk.followers});
                    }else{
                        res.send({message: 'Perfil no encontrado'})
                    }
                });
            }else{
                res.send({message: 'Este comando solo puede mostar los datos de tu perfil'})
            }
        }else{
            res.send({message: 'Error para ingresar al perfil, orden (profile  username)'})
        }
    }

    else{
        res.send({message: 'comando no reconocido'});
    }
}



module.exports = {
    comands
}