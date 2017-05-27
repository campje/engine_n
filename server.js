var express = require('express');
var app = express();
var http = require('http').Server(app);
var fs = require('fs');

app.get('/ressources/:filename', function (req, res) {
    res.sendFile(__dirname + "/ressources/" + req.params.filename);
});
app.get('/examples/:filename', function (req, res) {
    res.sendFile(__dirname + "/examples/" + req.params.filename);
});
app.get('/client/:filename', function (req, res) {
    res.sendFile(__dirname + "/client/" + req.params.filename);
});

http.listen('8000', function () {
    console.log('Server on 8000...');
})