const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Usuario');
const Usuario = mongoose.model('usuarios');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const isAdmin = require('../helpers/isAdmin');

router.get('/registro', (req, res) => {
    res.render('usuarios/registro')
});

router.post('/registro', (req, res) => {

    var erros = [];

    if (!req.body.name || typeof req.body.name == undefined || req.body.name == null) {
        erros.push({ errorText: "Nome Inválido" });
    }

    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ errorText: "Email Inválido" });
    }

    if (!req.body.password || typeof req.body.password == undefined || req.body.password == null) {
        erros.push({ errorText: "Senha Inválida" });
    }

    if (req.body.password.length < 4)
        erros.push({ errorText: "Senha muita curta. min 4 caracteres" });

    if (req.body.password != req.body.password2)
        erros.push({ errorText: "As senhas não são iguais" });

    if (erros.length > 0) {
        res.render('usuarios/registro', { erros: erros });

    } else {

        Usuario.findOne({ email: req.body.email }).lean().then((usuario) => {

            if (usuario) {
                req.flash('error_msg', 'Uma conta com este Email já existe!');
                res.redirect('/usuarios/registro');
            } else {

                const newUsuario = new Usuario({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                });

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(newUsuario.password, salt, (erro, hash) => {
                        if (erro) {
                            req.flash('error_msg', 'Houve um erro durante o salvamento do usuário');
                            res.redirect('/');
                        }

                        newUsuario.password = hash;

                        newUsuario.save().then(() => {
                            req.flash('success_msg', 'Conta criada com sucesso!');
                            res.redirect('/');
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve um erro ao criar usuário, tente novamente!')
                            res.redirect('usuarios/registro');
                        })
                    })
                })

            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno');
            res.redirect('/');
        })

    }

});

router.get('/login', (req, res) => {
    res.render('usuarios/login');
});

router.post('/login', (req, res, next) => {

    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)

})

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success_msg', 'Deslogado com Sucesso!');
        res.redirect('/');
    });
})


module.exports = router;