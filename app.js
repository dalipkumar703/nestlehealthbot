var express=require('express');
var mainController=require('./controllers/mainController');
var app=express();
var dotenv = require('dotenv');
dotenv.load();


app.use(express.static('./public'));
mainController(app);

app.listen(process.env.HOST);
console.log("hello app");
