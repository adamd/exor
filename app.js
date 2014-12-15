var Path = require('path');
var Hapi = require('hapi');

// List of presidents
var presidents = ['clinton', 'bush', 'obama'];

var serverOptions = {
    views: {
        engines: {
            html: require('handlebars')
        },
        path: Path.join(__dirname, 'templates')
    }
};
var server = new Hapi.Server(80, serverOptions);

// Home page
server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply.view('index');
    }
});
// Images, CSS and other assets
server.route({
    method: "GET",
    path: "/assets/{path*}",
    handler: {
        directory: {
            path: "./assets",
            listing: false,
            index: false
        }
    }
});

server.route({
    method: 'GET',
    path: '/search/{q}',
    handler: function (request, reply) {

      // Determine query
      var search = "*";
      search = encodeURIComponent(request.params.q);
console.log(search);

      var results = {};
      var db = require('orchestrate')(process.env.OIOKEY_EXOR);

      for (var i=0; i<presidents.length; i++) {
        var pname = presidents[i];
        var psearch = search + " AND president:" + pname;
  
        // Call OiO
        db.newSearchBuilder()
        .collection('exors_fulltext')
        .limit("0")
        .query(psearch)
        .then(function (result) {
          results = save_result(results, result);
          if (presidents.length == Object.keys(results).length) {
            reply(results);
          }
        })
        .fail(function (err) {
          console.log('Oh sad, an error');
        });
      }
    }
});
// Load executive order details for one president
server.route({
    method: 'GET',
    path: '/details/{p}/{q}/{pg?}',
    handler: function (request, reply) {
      // Settings
      var rpp = 10; // Results per page

      // Determine page
      var pg = parseInt(request.params.pg) ? encodeURIComponent(request.params.pg) : 1;
      var offset = rpp * (pg - 1);

      // Determine query
      search = encodeURIComponent(request.params.q);

      // Determine president
      var prez = request.params.p;

      if (prez == "clinton" || prez == "bush" || prez == "obama") {
        console.log("Details for " + request.params.p + " on search term:" + request.params.q);
        search = search + " AND president:" + prez;

        // Call OiO
        var db = require('orchestrate')(process.env.OIOKEY_EXOR);
        var sb = db.newSearchBuilder()
        .collection('exors_fulltext')
        .limit(rpp);
        if (offset > 0) {
          sb.offset(offset);
        }
        sb.query(search)
        .then(function (result) {
          var orders = filter_details(result.body); 
          var pgs = Math.ceil(result.body.total_count / rpp);
          var results = {"pg": pg, "pgs": pgs, "results": orders};
          reply(results);
        })
        .fail(function(err) {
          console.log('Oh sad, an error on details');
        }); 
      }
      else {
        reply("{'error': 'President not supported'}");
      }

    }
});

function filter_details(rjson) {
  orders = [];
  for (var i=0; i<rjson.results.length; i++) {
    var eo = rjson.results[i].value;
    delete eo.text;
    delete eo.id;
    delete eo.president;
    orders[orders.length] = eo;
  }
  return orders;
}
function save_result(robj, rjson) {
  for (var i=0; i<presidents.length; i++) {
    var pname = presidents[i];
    if (rjson.req.path.indexOf("president%3A" + pname) > -1) { // Check for "president%3A" + pname
      robj[pname] = rjson.body.total_count;
      return robj;
    }
  }
}


server.start(function () {
    console.log('Server running at:', server.info.uri);
});
