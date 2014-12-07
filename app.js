
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer();

// socket io
var io = require('socket.io');

// socket io setup
io = io.listen(app);

// configure socket.io
  // recommended production testing
  //io.enable('browser client minification');  // send minified client
  //io.enable('browser client etag');          // apply etag caching logic based on version number
  //io.enable('browser client gzip');          // gzip the file
  
// configure express
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));

  app.use(express.errorHandler());


// remote control the presentation server code
routes.setupRemotePresenter(app, io);

var port = 8080;
app.listen( port, function(){
 console.log("Express server listening on port %d", port );
});
