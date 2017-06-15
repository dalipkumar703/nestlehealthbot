var request = require('request');
var _ = require('underscore');
exports.replyWithTwoPayload=function(event, title, payload, textMsg)
{
  var messageData = {
    recipient: {
      id: event.sender.id
    },
    message: {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": textMsg,
          "buttons": [{
            "type": "postback",
            "title": title[0],
            "payload": payload[0]
          },
        {
          "type": "postback",
          "title": title[1],
          "payload": payload[1]
        }
      ]
        }
      }
    }
  };
  this.callSendAPI(messageData);
}

exports.quickReply = function(recipient, title, payload, text) {
  var messageData = {
    recipient: {
      id: recipient
    },
    message: {
      "text": text,
      "quick_replies": [{
          "content_type": "text",
          "title": title[0],
          "payload": payload[0]
        },
        {
          "content_type": "text",
          "title": title[1],
          "payload": payload[1]
        },
        {
          "content_type": "text",
          "title": title[2],
          "payload": payload[2]
        },
        {
          "content_type": "text",
          "title": title[3],
          "payload": payload[3]
        }
      ]
    }
  };
  this.callSendAPI(messageData);
}

//reply with attachments
exports.replyWithAttachments = function(recipient, image_url, title, payload, button_title) {
/*  var element=[{
    title: title[0],
    image_url: image_url[0],
    buttons: [{
      type: "postback",
      title: button_title[0],
      payload: payload[0],
    }],
  }, {
    title: title[1],
    image_url: image_url[1],
    buttons: [{
      type: "postback",
      title: button_title[1],
      payload: payload[1],
    }]
  }];
  */
  var element=[];
  for(var i=0;i<payload.length;i++)
  {
    var object ={
      title:title[i],
      image_url:image_url[i],
      buttons:[
        {
          type:"postback",
          title:button_title[i],
          payload:payload[i]
        }
      ]
    };
    element.push(object);
  }
  var messageData = {
    recipient: {
      id: recipient
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: element
        }
      }

    }

  };
  this.callSendAPI(messageData);
}

exports.receivedMessage = function(event, title, payload, textMsg) {
  // Putting a stub for now, we'll expand it in the following steps
  console.log("payload", payload[0]);
  var messageData = {
    recipient: {
      id: event.sender.id
    },
    message: {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": textMsg,
          "buttons": [{
            "type": "postback",
            "title": title[0],
            "payload": payload[0]
          }]
        }
      }
    }
  };
  this.callSendAPI(messageData);
  //console.log("Message data: ", event.message);
}
exports.replyWithPlainText = function(event, textMsg) {
  var messageData = {
    "recipient": {
      "id": event.sender.id
    },
    "message": {
      "text": textMsg
    }

  };
  this.callSendAPI(messageData);
}

exports.callSendAPI = function(messageData) {
  request({
    url: "https://graph.facebook.com/v2.6/me/messages",
    qs: {
      access_token: process.env.FACEBOOK_TOKEN
    },
    method: "POST",
    json: messageData
  }, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      //console.error(response);
      //console.error(error);
    }
    console.log("hello");


  });

}
exports.callReplyWithAttachments=function(result,err,event){
  if(!err)
  {
    console.log("length of payload:",_.size(result));
    console.log("length of payload 1:",result[1]);
    var image_url=[];
    var title=[];
    var payload=[];
    var button_title=[];
    for(var i=0;i<_.size(result);i++)
    {

        image_url[i]=result[i].image_url;
        title[i]=result[i].title;
        payload[i]=result[i].b_t_p_payload;
        button_title[i]=result[i].b_t_p_title;

    }

 this.replyWithAttachments(event.sender.id, image_url, title, payload, button_title);
  }
  else
  {
    console.log("error in reply with attachemnts");
  }

}
