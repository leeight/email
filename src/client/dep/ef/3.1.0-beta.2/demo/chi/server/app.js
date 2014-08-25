
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 8788);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, '..', '..', '..')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}
app.get(
    '/', 
    function(req, res) {
        res.writeHead(302, { 'Location': '/demo/chi/index.htm' });
        res.end();
    }
);
var member = require('./member');
app.get('/member/list', member.list);
app.post('/member/save', member.save);
app.post('/member/update', member.update);
app.get('/member/find', member.find);
app.post('/member/remove', member.remove);
var affair = require('./affair');
app.get('/affair/list', affair.list);
app.post('/affair/save', affair.save);
app.post('/affair/update', affair.update);
app.get('/affair/find', affair.find);

http.createServer(app).listen(app.get('port'), function (){
    console.log('open http://localhost:' + app.get('port'));
});
