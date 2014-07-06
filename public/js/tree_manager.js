var body = d3.selectAll("body");
var trees = loadUserTrees();
var treeList = [];

function generateTreeList(trees) {
    var options = [];
    trees.forEach(function(item) {
        options.push({value:item._id, label:item.tree.name});
    });

    return options;
}

/******CONTEXT_MENU******/
body.on("click", function() { if(treeCreator.state.contextMenuShowing) removeMenu(); });

body.on("contextmenu", function() {
    if(treeCreator.state.contextMenuShowing) {
        d3.event.preventDefault();
        d3.select(".context-menu").remove();
        treeCreator.state.contextMenuShowing = false;
    } else {
        var d3_target = d3.select(d3.event.target);
        if (d3_target.classed("node-circle") || d3_target.classed("name") || d3_target.classed("weight") ||d3_target.classed("score")) {
            d3.event.preventDefault();
            treeCreator.state.contextMenuShowing = true;
            var d = d3_target.datum();
            var menuElements = [
                {text:"add", handler:showAddForm},
                {text:"set score", handler:showScoreForm},
                {text:"remove", handler:removeNodeBehavior},
                {text:"edit tree", handler:showEditForm},
                {text:"compose tree", handler:showComposeForm}
            ];

            treeCreator.state.selectedNode = d;

            createMenu(d, menuElements);
        }
    }
});

function createMenu(d, menuElements) {
    var divMenu = body.append("div")
        .attr("class", "context-menu")
        .style("top", event.pageY + "px")
        .style("left", event.pageX + "px");
    for (var j = 0; j < menuElements.length; j++) {
        divMenu.append('ul').append("li").append("a").attr("href", "#").text(menuElements[j].text).on("click", menuElements[j].handler);
    }
}

function removeMenu() {
    treeCreator.state.contextMenuShowing = false;
    var menu = d3.selectAll("div.context-menu");
    if(menu) {
        menu.remove();
    }
}

/******FORMS******/
function showMainForm() {
    var mainForm = new FormCreator("form-main", "form-main", "GET", " ");
    mainForm.addInput("button", "btnCreate", "Create", "main()");
    mainForm.addInput("button", "btnSave", "Save", "saveTreeToDB()");
    mainForm.addInput("button", "btnDel", "Delete", "removeTreeFromDB()");
    mainForm.addInput("button", "btnShow", "Show", "loadTreeButtonBehavior()");
    var size = trees.length;
    treeList = generateTreeList(trees);

    mainForm.addSelect(treeList, size, "trees");

    document.getElementsByTagName("body")[0].appendChild(mainForm.form);

}

function showAddForm() {
    var addForm = new FormCreator("form-popup", "form-add", "GET", " ", event.pageX, event.pageY);
    addForm.addInput("text", "name", "Input name", "");
    addForm.addHTML("<p>");
    addForm.addInput("text", "weight", "Input weight", "");
    addForm.addHTML("<p>");
    addForm.addInput("button", "btnAdd", "Add", "addFormBehavior()");
    addForm.addInput("button", "btnCancel", "Cancel", "removeFormBehavior()");

    document.getElementsByTagName("body")[0].appendChild(addForm.form);
}

function showScoreForm() {
    if(treeCreator.state.selectedNode.children) return;
    var setScoreForm = new FormCreator("form-popup", "form-set-score", "GET", "", event.pageX, event.pageY);
    var max = 10, n = 21;
    var options = [];
    for(var i = 0; i <= 10; i++) {
        options[i] = {
            value:max - i,
            label:max - i
        };
        options[n-i-1] = {
            value:0 - max + i,
            label:0 - max + i
        };
    }
    setScoreForm.addSelect(options);
    setScoreForm.addHTML("<p>");
    setScoreForm.addInput("button", "btnSet", "Set", "setScoreFormBehavior()");
    setScoreForm.addInput("button", "btnCancel", "Cancel", "removeFormBehavior()");

    document.getElementsByTagName("body")[0].appendChild(setScoreForm.form);
}

function showEditForm() {
    var nodes = treeCreator.tree.nodes(treeCreator.root);
    var editForm = new FormCreator("form-popup", "form-edit", "GET", " ", event.pageX, event.pageY);
    for(var j = 0; j < nodes.length; j++) {
        editForm.addHTML("<hr>");
        editForm.addHTML("Name:<br>");
        editForm.addInput("text", nodes[j].id, nodes[j].name);
        editForm.addHTML("Weight:<br>");
        editForm.addInput("text", nodes[j].id, nodes[j].weight);
    }
    editForm.addInput("button", "btnSave", "Save", "editFormBehavior()");
    editForm.addInput("button", "btnCancel", "Cancel", "removeFormBehavior()");

    document.getElementsByTagName("body")[0].appendChild(editForm.form);
}

function showComposeForm() {
    var formCompose = new FormCreator("form-popup", "form-compose", "GET", " ", event.pageX, event.pageY);

    treeList = generateTreeList(trees);
    formCompose.addSelect(treeList, treeList.length, "tree-list");
    formCompose.addInput("text", "weight", "Input root weight");
    formCompose.addInput("button", "btnCompose", "Compose", "composeTreeBehavior()");
    formCompose.addInput("button", "btnCancel", "Cancel", "removeFormBehavior()");

    document.getElementsByTagName("body")[0].appendChild(formCompose.form);
}

function removeFormBehavior() {
    var el = document.getElementsByClassName("form-popup")[0];
    el.parentNode.removeChild(el);
}

/******BEHAVIORS******/
function addFormBehavior() {
    var name = document.forms["form-add"].elements["name"].value,
        weight = parseInt(document.forms["form-add"].elements["weight"].value);

    treeCreator.addNode(treeCreator.state.selectedNode, null, name, weight);

    removeFormBehavior();
}

function setScoreFormBehavior() {
    var score = parseInt(document.forms["form-set-score"].elements[0].value);

    treeCreator.setScore(treeCreator.state.selectedNode, score);

    removeFormBehavior();
}

function removeNodeBehavior() {
    treeCreator.removeNode(treeCreator.state.selectedNode);
}

function editFormBehavior() {
    var el = document.forms["form-edit"].elements;

    treeCreator.editTree(el);

    treeCreator.renderTree();

    removeFormBehavior();
}

function composeTreeBehavior() {
    var selectList = document.forms["form-compose"].elements["tree-list"];
    var selectedIndex = selectList.selectedIndex;
    var value = selectList.options[selectedIndex].value;
    var tree = loadTreeFromDb(value);
    var weight = parseInt(document.forms["form-compose"].elements["weight"].value);
    treeCreator.addNode(treeCreator.state.selectedNode, tree[0], tree[0].name, weight);

    removeFormBehavior();
}

function loadTreeButtonBehavior() {
    var selectList = document.forms["form-main"].elements["trees"];
    var selectedIndex = selectList.selectedIndex;
    var value = selectList.options[selectedIndex].value;
    var treeData = loadTreeFromDb(value);
    treeCreator.removeTree();
    treeCreator = new TreeCreator(width, height, treeData);
    treeCreator.renderTree();
}

/******UTILS******/
function loadUserTrees() {
    var params = "type=" + "load_trees";
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/dss', false);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Content-length", params.length);
    xhr.setRequestHeader("Connection", "close");
    var trees = [];
    xhr.onreadystatechange = function() {
        if (this.readyState != 4) return;
        if (this.status != 200) {return;}
        trees = JSON.parse(this.responseText);
    };

    xhr.send(params);

    return trees;
}

function loadTreeFromDb(treeId) {

    var params = "type=" + "load_tree" + "&tree_id="+treeId;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/dss', false);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Content-length", params.length);
    xhr.setRequestHeader("Connection", "close");
    var treeData = [];

    xhr.onreadystatechange = function() {
        if (this.readyState != 4) return;
        if (this.status != 200) {return;}
        var responseObj = JSON.parse(this.responseText);
        treeData.push(responseObj[0].tree);
    };

    xhr.send(params);

    return treeData;
}

function saveTreeToDB() {
    var treeData = this.treeCreator.exportTreeData();

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/dss', true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xhr.onreadystatechange = function() {
        if (this.readyState != 4) return;
        if (this.status != 200) {return;}
    };

    xhr.send(treeData);
}

function removeTreeFromDB() {
    var selectList = document.forms["form-main"].elements["trees"];
    var selectedIndex = selectList.selectedIndex;
    var value = selectList.options[selectedIndex].value;
    var params = "type=" + "del_tree" + "&tree_id=" + value;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/dss', true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Content-length", params.length);
    xhr.setRequestHeader("Connection", "close");
    xhr.send(params);
//    location.reload()
}

// handle download data
function downloadTree() {
    var blob = new Blob([treeCreator.exportTreeData()], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "tree.json");
}

//handle uploaded data
function uploadTree() {
    document.getElementById("hidden-file-upload").addEventListener("change", onFilesSelect, false);
    document.getElementById("hidden-file-upload").click();

    function onFilesSelect() {
        var uploadFile = this.files[0];
        var filereader = new window.FileReader();

        filereader.onload = function() {
            var txtRes = filereader.result;
            // TODO better error handling
            var jsonObj = JSON.parse(txtRes);
            treeCreator.removeTree();
            treeCreator = new TreeCreator(width, height, [jsonObj]);
            treeCreator.renderTree();
        };

        filereader.readAsText(uploadFile);
    }
}

function createTree(treeData) {
    var docEl = document.documentElement,
        bodyEl = document.getElementsByTagName('body')[0];

    var width = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth,
        height =  window.innerHeight|| docEl.clientHeight|| bodyEl.clientHeight;

    if(!treeData) {
        treeData = [
            {
                "name": "Top Node", "weight": 1,
                "children": []
            }
        ];
    }

    return new TreeCreator(width, height, treeData);
}