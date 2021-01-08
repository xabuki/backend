'use strict'

var bcrypt = require('bcrypt-nodejs');
const { urlencoded } = require('body-parser');
var User = require('../models/user');
var Follow = require('../models/follow');
var Publication = require('../models/publication');
const { use } = require('../routes/user');
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');

var jwt = require('../services/jwt');

//pruebas
function home(req, res) {
    res.status(200).send({
        message: 'Hola mundo desde el servidor de NodeJS'
    });
}
function pruebas(req, res) {
    console.log(req.body);
    res.status(200).send({
        message: 'Hola mundo desde el servidor de NodeJS'
    });
}
//registro
function saveUser(req, res) {
    var params = req.body;
    var user = new User();

    if (params.name && params.surname &&
        params.nick && params.email && params.password) {
        user.name = params.name;
        user.surname = params.surname;
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;

        //controlar usuarios duplicados
        User.find({
            $or: [
                { email: user.email.toLowerCase() },
                { nick: user.nick.toLowerCase() }
            ]
        }).exec((err, users) => {
            if (err) return res.status(500).send({ message: 'Error en la petición de usuarios' })
            if (users && users.length >= 1) {
                return res.status(200).send({ message: 'El usuario que intentas registrar ya existe! CABRÓN!' });
            } else {
                //encriptar contraseñas
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;
                    user.save((err, userStored) => {
                        if (err) return res.status(500).send({ message: 'Error al guardar el usuario' })

                        if (userStored) {
                            res.status(200).send({ user: userStored });
                        } else {
                            res.status(404).send({ message: 'No se ha registrado el usuario' })
                        }
                    })
                });
            }
        });


    } else {
        res.status(200).send({
            message: 'Envia todos los campos necesarios! hijoputa!'
        });
    }
}
//login
function loginUser(req, res) {
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({ email: email }, (err, user) => {
        if (err) return res.status(500).send({ message: 'error en la peticion' });

        if (user) {
            bcrypt.compare(password, user.password, (err, check) => {
                if (check) {
                    //devolver datos
                    if (params.gettoken) {
                        //devolver token y generar el tokengenerar el toke
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    } else {
                        //devolver datos del usuario
                        user.password = undefined;//con esto hacemos que no devuelva la password
                        return res.status(200).send({ user });
                    }

                } else {
                    return res.status(404).send({ message: 'el usuario no se ha podido logear' });
                }
            })
        } else {
            return res.status(404).send({ message: 'el usuario no se ha podido identificar!!' });
        }
    })
}

//conseguir datos de usuario
function getUser(req, res) {
    var userId = req.params.id;

    User.findById(userId, (err, user) => {
        if (err) return res.status(500).send({ message: 'Error en la petición' });

        if (!user) return res.status(404).send({ message: 'El usuario no existe' });

        followThisUser(req.user.sub, userId).then((value) => {
            user.password = undefined;
            return res.status(200).send({
                user,
                following: value.following,
                followed: value.followed
            });
        });
    });
}

async function followThisUser(identity_user_id, user_id) {
    var following = await Follow.findOne({ "user": identity_user_id, "followed": user_id }).exec().then((follow) => {
        return follow;
    }).catch((err) => {
        return handleError(err);
    });

    var followed = await Follow.findOne({ "user": user_id, "followed": identity_user_id }).exec().then((follow) => {
        return follow;
    }).catch((err) => {
        return handleError(err);
    });

    return {
        following: following,
        followed: followed
    }
}

//Devolver un listado de usuarios paginadoo
function getUsers(req, res) {
    var user_id = req.user.sub;

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    var itemsPerPage = 5;

    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
        if (err) return res.status(500).send({ message: "Error en la peticion", err });
        if (!users) return res.status(404).send({ message: "No hay Usuarios" });

        followUserIds(user_id).then((response) => {
            return res.status(200).send({ message: "Resultados", users, users_following: response.following, users_followed: response.followed, total, pages: Math.ceil(total / itemsPerPage) });
        });
    });
}

async function followUserIds(user_id) {

    var following = await Follow.find({ 'user': user_id }).select({ '_id': 0, '__v': 0, 'user': 0 }).exec()
        .then((follows) => {
            return follows;
        })
        .catch((err) => {
            return handleError(err);
        });
    var followed = await Follow.find({ followed: user_id }).select({ '_id': 0, '__v': 0, 'followed': 0 }).exec()
        .then((follows) => {
            return follows;
        })
        .catch((err) => {
            return handleError(err);
        });

    var following_clean = [];

    following.forEach((follow) => {
        following_clean.push(follow.followed);
    });
    var followed_clean = [];

    followed.forEach((follow) => {
        followed_clean.push(follow.user);
    });
    //console.log(following_clean);
    return {
         following: following_clean, 
         followed: followed_clean 
        }

}

const getCounters = (req, res) => {
    var userId = req.user.sub;
    if(req.params.id){
        userId = req.params.id;      
    }
    getCountFollow(userId).then((value) => {
        return res.status(200).send(value);
    })
}
 
const getCountFollow = async (user_id) => {
    try{
        // Lo hice de dos formas. "following" con callback de countDocuments y "followed" con una promesa
        var following = await Follow.countDocuments({"user": user_id},(err, result) => { return result });
        var followed = await Follow.countDocuments({"followed": user_id}).then(count => count);
        var publications = await Publication.countDocuments({"User": user_id}).then(count => count);
 
        return { following, followed, publications}
        
    } catch(e){
        console.log(e);
    }
}

//actualizar los datos de un usuario
function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    //borrar propiedad password
    delete update.password;

    if (userId != req.user.sub) {
        return res.status(500).send({ message: 'no tienes permiso para actualizar lo datos del usuario' });
    }

    User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdated) => {
        if (err) return res.status(500).send({ message: 'error en la peticion' });

        if (!userUpdated) return res.status(404).send({ message: 'no se ha podido actualizar el  usuario' });

        return res.status(200).send({ user: userUpdated });
    })
}

//subir archivos de imagen/avatar de usuario
function uploadImage(req, res) {
    var userId = req.params.id;


    if (req.files) {
        var file_path = req.files.image.path;
        console.log(file_path);
        var file_split = file_path.split('\\');
        console.log(file_split);

        var file_name = file_split[2];
        console.log(file_name);

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];
        console.log(file_ext);
        if (userId != req.user.sub) {
            return removeFilesOfUploads(res, file_path, 'Usuario sin permiso');
        }

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {

            //Actualizar documento de usuario logueado
            User.findByIdAndUpdate(userId, { image: file_name }, { new: true }, (err, userUpdated) => {
                if (err) return res.status(500).send({ message: 'error en la peticion' });
                if (!userUpdated) return res.status(404).send({ message: 'no se ha podido actualizar el  usuario' });

                return res.status(200).send({ user: userUpdated });
            });

        } else {
            return removeFilesOfUploads(res, file_path, 'Extension no valida');
        }

    } else {
        return res.status(200).send({ message: 'No se han subido imagen' });
    }

}

function removeFilesOfUploads(res, file_path, message) {
    fs.unlink(file_path, (err) => {
        return res.status(200).send({ message: message });
    })
}

function getImageFile(req, res) {
    var image_file = req.params.imageFile;
    var path_file = './uploads/users/' + image_file;

    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({ message: 'no existe la imagen' });
        }
    });

}

module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    getCounters,
    updateUser,
    uploadImage,
    getImageFile

}