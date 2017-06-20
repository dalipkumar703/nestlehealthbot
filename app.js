var express = require('express');
var mainController = require('./controllers/mainController');
//var test=require('./controllers/test.js');
var app = express();
var dotenv = require('dotenv');
dotenv.load();


app.use(express.static('./public'));
mainController(app);
//test(app);

app.listen(process.env.HOST||5000);
console.log("hello app");
