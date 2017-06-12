module.exports=function(){




  function quickReply(recipient) {
    var messageData = {
      recipient: {
        id: recipient
      },
      message: {
        "text": "Pick a color:",
        "quick_replies": [{
            "content_type": "text",
            "title": "Red",
            "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED"
          },
          {
            "content_type": "text",
            "title": "Green",
            "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_GREEN"
          }
        ]
      }
    };
    callSendAPI(messageData);
  }

  //reply with attachments
  function replyWithAttachments(recipient, image_url, title, payload, button_title) {
    var messageData = {
      recipient: {
        id: recipient
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [{
              title: title,
              image_url: image_url,
              buttons: [{
                type: "postback",
                title: "Call Postback",
                payload: payload,
              }],
            }, {
              title: title,
              image_url: image_url,
              buttons: [{
                type: "postback",
                title: "Call Postback",
                payload: payload + "1",
              }]
            }]
          }
        }

      }

    };
    callSendAPI(messageData);
  }

  function receivedMessage(event, textMsg) {
    // Putting a stub for now, we'll expand it in the following steps
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
              "title": "Got it",
              "payload": "USER_DEFINED_PAYLOAD"
            }]
          }
        }
      }
    };
    callSendAPI(messageData);
    //console.log("Message data: ", event.message);
  }

  function callSendAPI(messageData) {
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
}
