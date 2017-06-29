var express = require('express');
var mainController = require('./controllers/mainController');
var functionController = require('./controllers/functionController');
var CronJobs=require('./controllers/cronjobsController');
//var test=require('./controllers/test.js');
var app = express();
var dotenv = require('dotenv');
dotenv.load();

app.set('port', (process.env.PORT || 5000))
app.use(express.static('./public'));
mainController(app);
//test(app);

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost: " + app.get('port'))
})
console.log("hello app");
CronJobs.callReminder();
functionController.setPersistentMenu();
