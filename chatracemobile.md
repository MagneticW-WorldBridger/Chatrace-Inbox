ChatRace Mobile App
We already have a web version of our Inbox, and we highly recommend to the code related to the inbox web. A lot of JavaScript code can be reused if you are using React native.

It is required to check the code of chatarea.php to know how to render messages on the screen.

It is required to check the code on inbox.js to know how the WebSocket works when there is a new message.


Google Drive (code): https://drive.google.com/drive/folders/13hJtyux2iGW47ltp4KAFwCYJYb9WD1VS?usp=sharing 

You will need to check our render messages 

API URL: {{subdomain}}/php/user

API documentation: https://documenter.getpostman.com/view/27874332/2s93zCZg9Q 

Important notes: 
page_id = account_id (Business account ID)
ms_id = contact_id (User that sends a message to the bot)
fb_id = admin_id (Team member or an admin of a business account)

A business account can have multiple contacts and team members. A team member can manage multiple business accounts.


Websockt
The WebSocket  URL can be found on the Whitelabel information. The API to get the Whitelabel information is https://documenter.getpostman.com/view/27874332/2s93zCZg9Q#6ba7310f-ae23-49a3-9738-32f83c1e3211 




After you connect to the WebSocket, you need to immediately authenticate.
{
  "action": "authenticate",
  "data":{
 "platform":"web|ios|android",
    "account_id": {{account_id}},
    "user_id": {{logged_user_id}},
    "token":"{{logged_user_token}}"
  }						
}

















Send a text message using WebSocket (send JSON object as a string)
{
  "action": 0,
  "data":{
    "platform":"web|ios|android",
    “dir”:0,
    "account_id": {{account_id}},
    "contact_id": {{contact_id}},
    "user_id": {{logged_user_id}},
    "token":"{{logged_user_token}}",
    "fromInbox":true,
    "channel": {{channel_ID}},
    "from": {{logged_user_id}},
    "hash": {{contact_hash}},
    "timestamp":"{{unix_timestamp_milliseconds}}",
    "message":[
      {
        "type": "text", 
        "text": "Your Message",
        "dir": 0,
        "channel": {{channel_ID}},
        "from": {{logged_user_id}},
        "replyingTo": null | “message_id"
      }
    ]
  }						
}

Send a image, audio, video,voice, and file message using WebSocket
{
  "action": 0,
  "data":{
    "platform":"web|ios|android",
    “dir”:0,
    "account_id": {{account_id}},
    "contact_id": {{contact_id}},
    "user_id": {{logged_user_id}},
    "token":"{{logged_user_token}}",
    "fromInbox":true,
    "channel": {{channel_ID}},
    "from": {{logged_user_id}},
    "hash": {{contact_hash}},
    "timestamp":"{{unix_timestamp_milliseconds}}",
    "message":[
      {
        "type":"file",
        "dir": 0,
        "channel": {{channel_ID}},
        "from": {{logged_user_id}},
        "replyingTo": null | “message_id",
        "attachment":{
          "type": "image|video|audio|file|voice",
          "payload":{
            "url":"{{uploaded_file_url}}"
          }
        },
        "file":{
          "url": "{{uploaded_file_url}}",
          "file_name":"{{file_name}}",
          "length":{{file_length}},
          "type":image|video|audio|file|voice"
        }
      }
    ]
  }						
}



Push notifications
Setup push notifications on IOS
https://medium.com/@ashoniaa/react-native-expo-push-notifications-with-fcm-a-step-by-step-guide-fa5cfc0372fd 

Notifications

{
    "type": "message",
    "account_id": “...”,
    "contact_id": “...”,
    "wt": “...”,
    "subtype": "text",
    "text": "..."
}



