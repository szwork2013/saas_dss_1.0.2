exports.get = function(req, res) {
  res.render('dss');
};

exports.post = function(req, res) {
    var Tree = require('models/tree').Tree;

    if(req.body.type === "load_tree") {
        Tree.find({_id:req.body.tree_id}).lean().exec(function(err, docs) {
            res.send(docs);
        })
    } else if(req.body.type === "load_trees") {
        if(req.user) {
            Tree.find({username:req.user.username}, function(err, trees) {
                if(err) return next(err);
                res.send(trees);
            });
        }
    } else if(req.body.type === "del_tree") {
        Tree.remove({_id:req.body.tree_id}).exec();
    } else {//save tree
        var treeData = {
            username:req.user.username,
            tree:req.body,
            open:false
        };
        Tree.saveTree(treeData);
    }
};