var mongoose = require('lib/mongoose');
var async = require('async');
var log = require('lib/log')(module);

async.series([
    open,
    dropDatabase,
    requireModels,
    createUsers,
    createTrees
], function(err) {
  console.log(arguments);
  mongoose.disconnect();
  process.exit(err ? 255 : 0);
});

function open(callback) {
  mongoose.connection.on('open', callback);
}

function dropDatabase(callback) {
  var db = mongoose.connection.db;
  db.dropDatabase(callback);
}

function requireModels(callback) {
    require('models/user');
    require('models/tree');

    async.each(Object.keys(mongoose.models), function(modelName, callback) {
        mongoose.models[modelName].ensureIndexes(callback);
    }, callback);
}

function createUsers(callback) {

  var users = [
    {username: 'test1', password: '1234'},
    {username: 'test2', password: '123'},
    {username: 'admin', password: 'thetruehero'}
  ];

  async.each(users, function(userData, callback) {
    var user = new mongoose.models.User(userData);
    user.save(callback);
  }, callback);
}

function createTrees(callback) {
    var trees = [
        {
            username: "admin",
            tree: {
                "name": "Вечеринка", "weight": 1,
                "children": [
                    {
                        "name": "Еда", "weight": 4,
                        "children": [
                            {
                                "name": "Вкусность",
                                "weight": 5
                            },
                            {
                                "name": "Полезность",
                                "weight": 4
                            }
                        ]
                      },
                    {"name": "Общение", "weight": 10},
                    {"name": "Алкоголь", "weight": 3},
                    {"name": "Транспорт", "weight": 3},
                    {"name": "Музыка", "weight": 8}
                ]
            }
        },
        {
            username: "admin",
            tree: {
                "name": "Node", "weight": 1,
                "children": [
                    {
                        "name": "level1-1", "weight": 1
                    },
                    {
                        "name": "level1-2", "weight": 2,
                        "children": [
                            {
                                "name": "level2-1", "weight":5
                            }
                        ]
                    }
                ]
            }
        }

    ];
    async.each(trees, function(treeData, callback) {
        var tree = new mongoose.models.Tree(treeData);
        tree.save();
    }, callback);
}
