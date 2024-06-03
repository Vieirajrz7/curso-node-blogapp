if(process.env.NODE_ENV == "production") {
    module.exports = {
        mongoURI: "mongodb+srv://mvieirajrz:997444691Mae@@db-marcelo.dmy28a0.mongodb.net/?retryWrites=true&w=majority&appName=DB-Marcelo"
    }
} else {
    module.exports = {
        mongoURI: "mongodb://localhost/blogapp"
    }
}