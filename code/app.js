var express = require('express');
var exphbs  = require('express3-handlebars');
var routes = require('./routes');
var less = require('less-middleware');
var http = require('http');
var path = require('path');
var fs = require('fs');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(less({
    src: __dirname + "/public/stylesheets/less",
    dest: __dirname + "/public/stylesheets",
    prefix: "/stylesheets",
    compress: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);

app.get('/progressViewer', function(req, res) {
    fs.readFile('./data/projects.json', function read(err, data) {
        if (err) {throw err;}
        res.json(JSON.parse(data));
    });
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
