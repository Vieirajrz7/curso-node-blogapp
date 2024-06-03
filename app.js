// Carregando modulos
const express = require('express'); // Framework do Node.js, trabalha com rotas.
const handlebars = require('express-handlebars'); // Integra a linguagem de template Handlebars com o Express.
const bodyParser = require('body-parser'); // Pega as informações das requisições feitas e armazena no req.body.
const app = express(); // Instancia do express.
const admin = require('./routes/admin'); // Pega o router de outro arquivo que cria as rotas.
const path = require('path'); // Facilita essa conexão entre um arquivo e o outro (modulo do express).
const mongoose = require('mongoose'); // Nos permite trabalhar com o MongoDB usando Node.js.
const session = require('express-session'); // Permite gerenciar sessões do lado do servidor.
const flash = require('connect-flash'); // Modulo para adicionar mensagens Flash para um melhor feedback informativo
require('./models/Postagem');
const Postagem = mongoose.model('postagens');
require('./models/Categoria');
const Categoria = mongoose.model('categorias');
const usuarios = require('./routes/usuario');
const passport = require('passport');
require('./config/auth')(passport);
const { isLogged } = require('./helpers/isLogged');
const db = require('./config/db');

// Configurações

// Sessão
app.use(session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg"); // Criação de variaveis globais para guardar a mensagem de sucesso e de erro
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// BodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Handlebars
app.engine('handlebars', handlebars.engine({ defaultLayout: 'main', }))
app.set('view engine', 'handlebars');

// Mongoose - Conectando ao MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(db.mongoURI)
    .then(() => {
        console.log("Conectado ao MongoDB");
    }).catch((err) => {
        console.log("Erro ao se conectar", + err);
    })

// Public
app.use(express.static(path.join(__dirname, "public"))); // .static() vai servir os arquivos estaticos. E o path.join() vai mostrar o caminho para a pasta "public" onde se encontra os meus arquivos estaticos

// app.use((req, res, next) => { // Criando um Middlewares
//     console.log('OI EU SOU UM MIDDLEWARE');
//     next(); // Serve para a aplicação continuar rodando dps de passa pelo Middleware
// })
// Rotas


// Rotas

app.use('/admin', admin); // Esse e o roteador (router) que leva para as as minhas rotas admin
app.use('/usuarios', usuarios);

app.get('/', (req, res) => {

    Postagem.find().lean().populate("categoria").sort({ date: "desc" }).then((postagens) => {
        res.render('index', { postagens: postagens });
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar as Postagens Recentes');
        res.redirect('/404');
    })

});

app.get('/404', (req, res) => {
    res.send('Error 404');
});

app.get('/postagem/:slug', isLogged, (req, res) => {
    Postagem.findOne({ slug: req.params.slug }).lean().then((postagem) => {
        if (postagem) {
            res.render('postagem/index', { postagem: postagem });
        } else {
            req.flash('error_msg', 'Esta postagem não existe!!!');
            res.redirect('/');
        }
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno')
        res.redirect('/');
    })
})


app.get('/categorias', isLogged, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('categoria/index', { categorias: categorias });
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno ao renderizar as categorias');
        res.redirect('/');
    })
});

app.get('/categorias/:slug', isLogged, (req, res) => {
    Categoria.findOne({ slug: req.params.slug }).lean().then((categoria) => {
        if (categoria) {

            Postagem.find({ categoria: categoria._id }).lean().then((postagens) => {

                res.render('categoria/postagens', { postagens: postagens, categoria: categoria });

            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao listar os posts!');
                res.redirect('/')
            })

        } else {
            req.flash('error_msg', 'Esta categoria não existe!!!');
            res.redirect('/')
        }
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar a categoria desejada!');
        res.redirect('/');
    })
})

// Outros

// const PORT = 3334;
const PORT = process.env.PORT || 3334;
app.listen(PORT, () => {
    console.log('Servidor rodando...');
});