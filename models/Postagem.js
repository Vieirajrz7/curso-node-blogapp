const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('../models/Categoria'); // Chama o Arquivo
const Categoria = mongoose.model('categorias'); // Passa a referencia do seu model para uma variável


const Postagem = new Schema({
    titulo: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: true
    },

    conteudo: {
        type: String,
        required: true
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: "categorias"
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

mongoose.model("postagens", Postagem);