var async = require('async');
var util = require('util');

var mongoose = require('lib/mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema(
    {
        tree: Object,
        username: {
            type: String,
            required:true
        }
    });

schema.statics.saveTree  = function(treeData) {
    var tree = new mongoose.models.Tree(treeData);
    tree.save(tree);
};

schema.statics.removeTree  = function(id) {

};

exports.Tree = mongoose.model('Tree', schema);


