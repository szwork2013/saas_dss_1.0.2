//"use strict";
var TreeCreator = function(width, height, treeData) {

    this.width = width;

    this.state = {
        selectedNode: null,
        nodeId: 0
    };

    this.treeData = treeData ||
        [{ "name": "Top Node", "weight": 1, "children": null }];

    this.root = this.treeData[0];

    this.svg = d3.select("body").append("svg")
        .attr("width", width + this.consts.MARGIN.right + this.consts.MARGIN.left)
        .attr("height", 2*height + this.consts.MARGIN.top + this.consts.MARGIN.bottom)
        .call(d3.behavior.zoom().scaleExtent([0.5, 10]).on("zoom", function() {
            var x = d3.event.translate[0] * (-1);
            thisSvg.attr("transform", "translate(" + x + "," + d3.event.translate[1] + ")scale(" + d3.event.scale + ")");
        }))
        .append("g")
        .attr("transform", "translate(" + this.consts.MARGIN.left + "," + this.consts.MARGIN.top + ")");


    var thisSvg = this.svg;

    this.tree = d3.layout.tree()
        .size([height, width]);

    this.diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; });

    this.root.parent = this.root;
    this.root.px = this.root.x;
    this.root.py = this.root.y;

    this.tree.nodes(this.root).forEach(function(d) {
        d.score = 0;
    })
};

TreeCreator.prototype.consts = {
    POSITIVE_COLOR: "#83AF9B",
    NEGATIVE_COLOR: "#AF4933",
    NODE_RADIUS: 30,
    DEPTH: 180,
    DURATION: 750,
    MARGIN: {top: 20, right: 120, bottom: 20, left:120 }
};

TreeCreator.prototype.addNode = function(parentNode, node, name, weight) {
    var newNode;
    if(node) {
        newNode = node;
        newNode.parent = parentNode;
        newNode.name = name;
        newNode.weight = weight;
        newNode.score = 0;
    } else {
        newNode = { "name": name, "weight": weight, "parent" : parentNode, "score": 0 };
    }

    if (parentNode.children) {
        parentNode.children.push(newNode)
    } else parentNode.children = [newNode];

    this.renderTree();
};

TreeCreator.prototype.setScore = function(selectedNode, score) {
    selectedNode.score = score;
    this.recomputeScores(selectedNode);
    this.renderTree();
};

TreeCreator.prototype.removeNode = function(removedNode) {
    removedNode.parent.children.forEach(function(item, i) {
        if(item.id == removedNode.id)
            removedNode.parent.children.splice(i, 1);
    });

    this.recomputeScores(removedNode.parent);
    this.renderTree();
};

TreeCreator.prototype.recomputeScores = function(node) {
    if(node.id === 1) return;
    var max = 0, sum = 0;
    node.parent.score = 0;
    for(var j = 0; j < node.parent.children.length; j++) {
        max += 10 * node.parent.children[j].weight;
        sum += node.parent.children[j].score * node.parent.children[j].weight;
    }
    var per = sum/max*100;
    node.parent.score = 0.1 * per;
    this.recomputeScores(node.parent);
};

//на входе массив в котором идут подряд значения name, weight
//Должно быть в таком же порядке как tree.nodes(root)
TreeCreator.prototype.editTree = function(el) {
    var k = 0;
    d3.selectAll("g.node")[0].forEach(function(item) {
        var name = item.__data__.name;
        var weight = item.__data__.weight;

        if(name !== el[k].value)
            item.__data__.name = el[k].value;

        k++;

        if(weight !== el[k].value)
            item.__data__.weight = el[k].value;

        k++;
    });
};

TreeCreator.prototype.updateTextWeights = function() {
    d3.selectAll("text.weight").text(function(d) { return d.weight; });
};

TreeCreator.prototype.updateNodeNames = function() {
    d3.selectAll("text.name").text(function(d) { return d.name; });
};

TreeCreator.prototype.updateTextScore = function () {
    d3.selectAll("text.score").text(function(d) { return d.score; });
};

TreeCreator.prototype.setCirclesColor = function() {
    var thisTree = this;
    d3.selectAll("circle").style("fill", function(d) { return d.score >= 0 ? thisTree.consts.POSITIVE_COLOR : thisTree.consts.NEGATIVE_COLOR; });
};

TreeCreator.prototype.normalizeDepth = function(nodes) {
    var thisTree = this;
    nodes.forEach(function(d) { d.y = d.depth * thisTree.consts.DEPTH; });
};

TreeCreator.prototype.exportTreeData = function() {
    return JSON.stringify(this.root, ["name", "weight", "children"]);
};

TreeCreator.prototype.removeTree = function() {
    d3.select("body").selectAll("svg").remove();
};

TreeCreator.prototype.addNameToNode = function(nodeEnter) {
    nodeEnter.append("text")
        .attr("class", "name")
        .text(function(d) { return d.name; } );
};

TreeCreator.prototype.addWeightToNode = function(nodeEnter) {
    nodeEnter.append("text")
        .attr("class", "weight")
        .attr("transform","translate(0, 12)")
        .text(function(d) { return d.weight; } );
};

TreeCreator.prototype.addScoreToNode = function(nodeEnter) {
    nodeEnter.append("text")
        .attr("class", "score")
        .attr("transform","translate(0, 24)")
        .text(function(d) { return d.score; } );
};

TreeCreator.prototype.renderTree = function() {
    var thisTree = this;

    var levelWidth = [1];
    var childCount = function(level, n) {

        if (n.children && n.children.length > 0) {
            if (levelWidth.length <= level + 1)
                levelWidth.push(0);

            levelWidth[level + 1] += n.children.length;
            n.children.forEach(function(d) {
                childCount(level + 1, d);
            });
        }
    };
    childCount(0, this.root);
    var newHeight = d3.max(levelWidth) * 90; // 25 pixels per line
    thisTree.tree = thisTree.tree.size([newHeight, this.width]);

    var nodes = this.tree.nodes(this.root);

    this.normalizeDepth(nodes);

    // Recompute the layout and data join.
    var node = this.svg.selectAll(".node")
        .data(nodes, function (d) {
            d.px = d.x;
            d.py = d.y;
            d.score = d.score || 0;
            return d.id || (d.id = ++thisTree.state.nodeId);
        });

    // Add entering nodes in the parent’s old position.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + d.parent.y + "," + d.parent.x + ")"; });

    nodeEnter.append("circle")
        .attr("class", "node-circle")
        .attr("r", thisTree.consts.NODE_RADIUS);

    this.setCirclesColor();

    this.addNameToNode(nodeEnter);

    this.addWeightToNode(nodeEnter);

    this.addScoreToNode(nodeEnter);

    this.updateTextWeights();

    this.updateTextScore();

    this.updateNodeNames();

    node.exit().remove();

    var links = this.tree.links(nodes);

    var link = this.svg.selectAll(".link")
        .data(links);

    // Add entering links in the parent’s old position.
    link.enter().insert("path", ".node")
        .attr("class", "link")
        .attr("d", function (d) {
            var o = { x: d.source.px, y: d.source.py };
            return thisTree.diagonal({ source: o, target: o });
        });

    link.exit().remove();

    // Transition nodes and links to their new positions.
    var t = this.svg.transition()
        .duration(this.consts.DURATION);

    t.selectAll(".link")
        .attr("d", this.diagonal);

    t.selectAll("g.node")
        .attr("transform", function(d) {
            d.px = d.x;
            d.py= d.y;
            return "translate(" + (d.y) + "," + d.x + ")"; });
};