//var User = require('models/user').User;
var Tree = require('models/tree').Tree;

module.exports = function(req, res, next) {

    if(req.user) {
        req.trees = res.locals.trees = null;

        Tree.find({username:req.user.username}, function(err, trees) {
            if(err) return next(err);
            req.trees = res.locals.trees = trees;
            next();
        });
    } else next();
};
