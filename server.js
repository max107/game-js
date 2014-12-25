var express = require('express');
var app = express();
var fs = require("fs");

app.get('/', function(req, res) {
    fs.readFile(__dirname + '/index.html', 'utf8', function(err, text) {
        res.send(text);
    });
});

// app.get('/', function(req, res) {
//     res.send('Hello World!');
// });

app.use('/assets', express.static(__dirname + '/assets'));
app.use('/static', express.static(__dirname + '/static'));
app.use('/js', express.static(__dirname + '/js'));

var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});