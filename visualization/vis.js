var projectName;
var data;
var tree;

// post data to the api backend
function postData(url = '', content = {}) {
  // Default options are marked with *
    return fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.

        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(content), // body data type must match "Content-Type" header
    })
    .then(response => response.json());  // parses JSON response into native JavaScript objects
};

// this function makes an simple api call to send the data to the api
function _data(url, post_data) {
   postData(url, post_data)
  .then(content => data=content) // JSON-string from `response.json()` call
  .catch(error => console.error(error));
  //console.log(data);
};

// This script creates
function generateGraph(connectors) {

    var links = connectors;
    var nodes = {};

    // Compute the distinct nodes from the links.
    links.forEach(function(link) {
      link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
      link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
    });

    var width = 1200,
        height = 1000;

    var force = d3.layout.force()
        .nodes(d3.values(nodes))
        .links(links)
        .size([width, height])
        .linkDistance(120)
        .charge(-300)
        .on("tick", tick)
        .start();

    var svg = d3.select("#graphBox").append("svg")
        .attr("width", width)
        .attr("height", height);

    // Per-type markers, as they don't inherit styles.
    svg.append("defs").selectAll("marker")
        .data(["suit", "licensing", "resolved"])
      .enter().append("marker")
        .attr("id", function(d) { return d; })
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("orient", "auto")
        .attr("color", "#1c7833")
      .append("path")
        .attr("d", "M0,-5L10,0L0,5");

    var path = svg.append("g").selectAll("path")
        .data(force.links())
      .enter().append("path")
        .attr("class", function(d) { return "link " + d.type; })
        .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

    var circle = svg.append("g").selectAll("circle")
        .data(force.nodes())
      .enter().append("circle")
        .attr("r", 12)
        .style("fill", function (d) { return '#bec2bf'; })
        .call(force.drag);

    var text = svg.append("g").selectAll("text")
        .data(force.nodes())
      .enter().append("text")
        .attr("x", 10)
        .attr("y", ".51em")
        .text(function(d) { return d.name; });

    // Use elliptical arc path segments to doubly-encode directionality.
    function tick() {
      path.attr("d", linkArc);
      circle.attr("transform", transform);
      text.attr("transform", transform);
    }

    function linkArc(d) {
      var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx * dx + dy * dy);
      return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
    }

    function transform(d) {
      return "translate(" + d.x + "," + d.y + ")";
    }
};

// create the folder tree based
function buildFolderTree(root, arr) {
  var ul = document.createElement('ul');
  var li;

  root.appendChild(ul); // append the created ul to the root

    for (const [key, value] of Object.entries(arr)) {
        console.log(key);
        if (Array.isArray(key)) {
            buildFolderTree(li, value);
            return;
        }
        li = document.createElement('li'); // create a new list item
        li.appendChild(document.createTextNode(key)); // append the text to the li
        ul.appendChild(li); // append the list item to the ul
    };
  };

var div = document.getElementById('myList');

async function dataCreation() {
   const folderToInspect = document.getElementById("path").value;
   let response = await postData('http://0.0.0.0:80/projectInspection', {'url':folderToInspect});

   data = await response;

   console.log(data);
   console.log(tree)
   generateGraph(data.connections);

   tree_area = document.getElementById("tree");
   buildFolderTree(tree_area, data.tree);
}

  // this script sends the path to the flask backend which will create the graph dependency data
async function getGraphData(method='post') {
   await dataCreation();
   return 0;
}

