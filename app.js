var express=require('express');
var toDoController=require('./controllers/todocontroller');
var app=express();

app.set('view engine','ejs');

app.use(express.static('./public'));
toDoController(app);

app.listen(3000);
console.log("hello app");