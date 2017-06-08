var bodyParser=require('body-parser');
var mongoose=require('mongoose');
var request=require('request');
var dotenv = require('dotenv');
var api = require('./api.js');
dotenv.load();
var db=process.env.DB_URL;
mongoose.connect(db);
module.exports=function(app) {
	app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())
  //api calls
	app.get('/user',api.post);
	app.get('/webhook', function(req, res) {
	  if (req.query['hub.mode'] === 'subscribe' &&
	      req.query['hub.verify_token'] ===process.env.HUB_VERIFY) {
	    console.log("Validating webhook");
	    res.status(200).send(req.query['hub.challenge']);
	  } else {
	    console.error("Failed validation. Make sure the validation tokens match.");
	    res.sendStatus(403);
	  }
	});
	app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
					let text=event.message.text
          receivedMessage(event,text)
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

function receivedMessage(event,text) {
  // Putting a stub for now, we'll expand it in the following steps
	var messageData = {
	 recipient: {
		 id: event.sender.id
	 },
	 message: {
		 text: text
	 }
 };
	request({
		url:"https://graph.facebook.com/v2.6/me/messages",
		qs: {access_token:process.env.FACEBOOK_TOKEN},
		method: "POST",
		json: messageData
	},function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
    //  console.error(response);
    //  console.error(error);
    }
		console.log("hello");


});
	console.log("Message data: ", event.message);
}
}
