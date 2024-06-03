const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Chama o mongoose
require('../models/Categoria'); // Chama o Arquivo
const Categoria = mongoose.model('categorias'); // Passa a referencia do seu model para uma variável
require('../models/Postagem');
const Postagem = mongoose.model('postagens');
const {isAdmin} = require('../helpers/isAdmin');




// Rotas
router.get('/', isAdmin, (req, res) => {
    res.render('./admin/index')
});

// Página Principal das Categorias
router.get('/categorias', isAdmin, (req, res) => {
    Categoria.find().sort({ date: "desc" }).lean().then((categorias) => {
        res.render('admin/categorias', { categorias: categorias });
    }).catch(() => {
        req.flash("error_msg", "Houve um erro ao listar as categorias");
        res.redirect('/admin');
    });

});

// Rota Para o Formulário de Criar Categoria
router.get('/categorias/add', isAdmin, (req, res) => {
    res.render('admin/addcategorias');
})

// Rota q Cria a Categoria
router.post('/categorias/nova', isAdmin, (req, res) => {

    var erros = [];

    // Validação de Formulário
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({
            textoErro: "Nome Inválido"
        });
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({
            textoErro: "Slug Inválido"
        })
    }

    if (req.body.nome.length < 2) {
        erros.push({
            textoErro: "Nome da categoria muito curto"
        })
    }

    if (erros.length > 0) {
        res.render("admin/addcategorias", { erros: erros });
    } else {
        // Valores que são passados no Formulário
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso")
            res.redirect("/admin/categorias");
            console.log('Categoria Salva com sucesso!!');
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar a a categoria tente novamente")
            res.redirect("/admin");
        })
    }
});


// Rota do Formulário de Edição de Categorias
router.get('/categorias/edit/:id', isAdmin, (req, res) => {
    Categoria.findOne({ _id: req.params.id }).lean().then((categoria) => {
        res.render('admin/editcategorias', { categoria: categoria });

    }).catch((err) => {
        req.flash('error_msg', "Esta Categoria Não Existe!");
        res.redirect('/admin/categorias');
    })
});

// Rota que Manipula os valores passados no Formulário e edita a Categoria
router.post('/categorias/edit', isAdmin, (req, res) => {
    // Procura por um id que ja existe e ve se igual ao id passado no url
    Categoria.findOne({ _id: req.body.id }).then((categoria) => {

        var erros = [];
        //Validação de Fomulário
        if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
            erros.push({
                textoErro: "Nome Inválido"
            });
        }

        if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
            erros.push({
                textoErro: "Slug Inválido"
            })
        }

        if (req.body.nome.length < 2) {
            erros.push({
                textoErro: "Nome da categoria muito curto"
            })
        }

        if (erros.length > 0) {
            res.render("admin/addcategorias", { erros: erros });
        } else {

            // Validação caso tente editar a Categoria sem alterar os dados dela.
            if (categoria.nome === req.body.nome || categoria.slug === req.body.slug) {
                req.flash('error_msg', 'Altere os valores para a categoria ser editada!');
                res.redirect('/admin/categorias');
            } else {

                // Pega os valores que estão salvos na categoria.nome e atribui
                //ao valor que esta vindo do formulário.
                categoria.nome = req.body.nome;
                categoria.slug = req.body.slug;

                categoria.save().then(() => {
                    req.flash('success_msg', 'Categoria Editada Com Sucesso');
                    res.redirect('/admin/categorias');
                }).catch((err) => {
                    req.flash('error_msg', 'Houve um Erro Interno Ao Salvar a Categoria')
                })

            }
        }

    }).catch((err) => {
        req.flash('error_msg', 'houve um error ao editar a categoria')
    })

});

router.post("/categorias/delete", isAdmin, (req, res) => {
    Categoria.deleteOne({ _id: req.body.id }).then(() => {
        req.flash('success_msg', "Categoria Deletada Com Sucesso!");
        res.redirect('/admin/categorias');
    }).catch((err) => {
        req.flash('error_msg', 'Houve um Erro Ao Deletar a Categoria!');
        res.redirect('/admin/categorias');
    })
});


// =>*=======Postagens=======*=>


router.get('/postagens', isAdmin, (req, res) => {

    Postagem.find().lean().populate("categoria").sort({ date: "desc" }).then((postagens, categorias) => {
        res.render('admin/postagens', { postagens: postagens, categorias: categorias });
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao exibir postagem!");
        res.redirect('/admin');
    });
});

router.get('/postagens/add', isAdmin, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('admin/addpostagem', { categorias: categorias });
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário!");
        res.redirect("/admin");
    })
});

router.post('/postagens/nova', isAdmin, (req, res) => {

    let erros = [];


    // Valida o input de categorias
    if (req.body.categoria == "0") {
        erros.push({ errorText: "Categoria inválida, registre uma categoria" });
    }
    if (erros.length > 0) {
        res.render("admin/addpostagem", { erros: erros });
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            categoria: req.body.categoria,
            conteudo: req.body.conteudo
        };

        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', 'Postagem Criada com sucesso!');
            res.redirect('/admin/postagens');
        }).catch((err) => {
            req.flash('error_msg', "Houve um erro ao salvar a postagem!");
            res.redirect("/admin/postagens");
            console.log("ERRO: =>" + err);
        })
    }

});

router.get('/postagem/edit/:id', isAdmin, (req, res) => {
    Postagem.findOne({ _id: req.params.id }).lean().then((postagem) => {
        Categoria.find().lean().then((categorias) => {
            res.render('admin/editpostagem', { categorias: categorias, postagem: postagem });
            req.flash('success_msg', 'Postagem Editada com sucesso!');
        }).catch((err) => {
            req.flash('error_msg', 'houve um erro ao listar as categorias');
            res.redirect('/admin/postagens');
            console.log('ERRO ==>' + err);
        })

    }).catch((err) => {
        req.flash('error_msg', "Houve um erro ao carregar o formulario de edição!");
        res.redirect('/admin/postagens');
    })

});

router.post('/postagem/edit', isAdmin, (req, res) => {

    //FAZER VALIDAÇÃO

    Postagem.findOne({ _id: req.body.id }).then((postagem) => {

        postagem.titulo = req.body.titulo;
        postagem.slug = req.body.slug;
        postagem.descricao = req.body.descricao;
        postagem.conteudo = req.body.conteudo;
        postagem.categoria = req.body.categoria;

        postagem.save().then(() => {
            req.flash('success_msg', 'Postagem editada com sucesso');
            res.redirect('/admin/postagens');
        }).catch((err) => {
            req.flash('error_msg', 'Erro interno!');
            res.redirect('/admin/postagens');
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro o salvar a edição");
        res.redirect("/admin/postagens");
        console.log(err);
    })
});


router.post('/postagem/delete/:id', isAdmin, (req, res) => {
    Postagem.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Postagem deletada com sucesso!');
        res.redirect('/admin/postagens');
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao deletar a Postagem!');
        res.redirect('/admin/postagens');
    })
})

module.exports = router;








// // Valida input de titulo
// if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
//     erros.push({
//         errorText: "Titulo Inválido!"
//     });
// }

// // Valida input de slug
// if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
//     erros.push({
//         errorText: "Slug Inválido!"
//     });
// }

// // Valida input de descricao
// if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
//     erros.push({
//         errorText: "Descrição Inválida!"
//     });
// }

// // Valida input de conteudo
// if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null) {
//     erros.push({
//         errorText: "Conteudo Inválido!"
//     });
// }