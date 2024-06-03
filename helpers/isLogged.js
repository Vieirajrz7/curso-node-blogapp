module.exports = {
    isLogged: function(req, res, next) {

        if(req.isAuthenticated())
            return next();

        req.flash('error_msg', 'Você precisa estar logado em um conta para acessar esta página!');
        res.redirect('/');
        
    }
}