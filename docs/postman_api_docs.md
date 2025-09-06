# ChatRace API Documentation - Complete

Source: https://documenter.getpostman.com/view/27874332/2s93zCZg9Q

---

  * Body
  * Headers (7)


  * Body
  * Headers (7)


  * Body
  * Headers (1)


  * Body
  * Headers (7)


  * Body
  * Headers (7)


  * Body
  * Headers (1)


  * Body
  * Headers (1)


  * Body
  * Headers (1)


Public 
Documentation Settings
ENVIRONMENT
No Environment
LAYOUT
Double Column
LANGUAGE
cURL - cURL
Chatrace
[Introduction ](https://documenter.getpostman.com/view/27874332/2s93zCZg9Q#intro)
POST
Get information about Whitelabel
POST
Request OTP to log in with email
POST
Validate OTP received to log in with email
POST
Login with Google
POST
Login with Microsoft
POST
Login with Apple
POST
Login with Facebook
POST
Logout
POST
Get logged user information
POST
Register device for Firebase Cloud Messaging
POST
Get list of conversations (contacts)
POST
Get contact information
POST
Get list of messages from a conversation
POST
Get list of admins
POST
Get list of Inbox teams
POST
Assign a conversation to admin/team
POST
Get list of flows
POST
Get list of Steps from a flow
POST
Send flow to contact
POST
Send step to contact
POST
Get list of products
POST
Send products to contact
POST
Move conversation to bot/human
POST
Unassign a conversation
POST
Archive/unarchive a conversation
POST
Follow/unfollow a conversation
POST
Block/unblock a conversation
POST
Mark a conversation as read/unread
POST
Get list of tags
POST
Remove tag from contact
POST
Get list of drip campaigns
POST
Get list of custom fields
POST
Add new custom field
POST
Set/update a contact custom field
POST
Delete a contact custom field value
POST
Generate response from AI
POST
Add a note to a conversation
POST
Update a note
POST
Delete a note
POST
Delete a contact
POST
Get list of saved replies
POST
Add a saved reply
POST
Update a saved reply
POST
Delete a saved reply
POST
Upload a file
POST
Get list of Messenger Lists
POST
Get list of calendars
POST
Get list of appointments
POST
Cancel an appointment
POST
Delete an appointment
POST
Get list of orders
POST
Get order information
POST
Update order
POST
Get list of Google Business Message locations
# Chatrace
### POSTValidate OTP received to log in with email
{{api_url}}
HEADERS
Content-Type
application/json
User-Agent
mobile-app
Bodyraw 
```
{  
  "op":"login",
  "op1":"email",
  "op2":"validateOTP",
  "rid":"[received_from_resquest_OTP_api]",
  "data":{
    "code":"[OTP]"
  }
}
```

Example Request
Example
View More
curl
```
curl --location -g '{{api_url}}' \
--header 'Content-Type: application/json' \
--header 'User-Agent: mobile-app' \
--data '{  
  "op":"login",
  "op1":"email",
  "op2":"validateOTP",
  "rid":"6ec08e8205fd05970f3923994d4759d2b6ca4d338258b6b5b5dd7a1f7ce86b1f",
  "data":{
    "code":"456788"
  }
}'
```

200 OK
Example Response
  * Body
  * Headers (7)


json
```
{
 "status": "OK",
 "data": {
  "token": "..."
 }
}
```

Date
Mon, 03 Jul 2023 12:06:39 GMT
Server
Apache/2.4.46 (Win64) OpenSSL/1.1.1h PHP/7.4.14
X-Powered-By
PHP/7.4.14
Content-Length
6197
Keep-Alive
timeout=5, max=100
Connection
Keep-Alive
Content-Type
application/json; charset=utf-8
### POSTLogin with Google
{{api_url}}
HEADERS
Content-Type
application/json
User-Agent
mobile-app
X-PLATFORM
ios|android
Bodyraw 
```
{  
  "op":"login",
  "op1":"authentication",
  "op2":"validate",
  "op3":"google",
  "data":{
    "idToken":"...",
    "serverAuthCode":""
  }
}
  
```

Example Request
Example
View More
curl
```
curl --location -g '{{api_url}}' \
--header 'Content-Type: application/json' \
--header 'User-Agent: mobile-app' \
--data '{  
  "op":"login",
  "op1":"authentication",
  "op2":"validate",
  "op3":"google",
  "data":{
    "idToken":"...",
    "serverAuthCode":""
  }
}
  '
```

200 OK
Example Response
  * Body
  * Headers (7)


json
```
{
 "status": "OK",
 "data": {
  "token": "....................."
 }
}
```

Date
Mon, 03 Jul 2023 12:06:39 GMT
Server
Apache/2.4.46 (Win64) OpenSSL/1.1.1h PHP/7.4.14
X-Powered-By
PHP/7.4.14
Content-Length
6197
Keep-Alive
timeout=5, max=100
Connection
Keep-Alive
Content-Type
application/json; charset=utf-8
### POSTLogin with Apple
{{api_url}}
HEADERS
Content-Type
application/json
User-Agent
mobile-app
X-PLATFORM
ios|android
Bodyraw 
```
{  
  "op":"login",
  "op1":"authentication",
  "op2":"validate",
  "op3":"apple",
  "data":{
    "identityToken":"...",
    "authorizationCode":""
  }
}
  
```

Example Request
Example
View More
curl
```
curl --location -g '{{api_url}}' \
--header 'Content-Type: application/json' \
--header 'User-Agent: mobile-app' \
--data '{  
  "op":"login",
  "op1":"authentication",
  "op2":"validate",
  "op3":"apple",
  "data":{
    "identityToken":"...",
    "authorizationCode":""
  }
}
  '
```

200 OK
Example Response
  * Body
  * Headers (7)


json
```
{
 "status": "OK",
 "data": {
  "token": "....................."
 }
}
```

Date
Mon, 03 Jul 2023 12:06:39 GMT
Server
Apache/2.4.46 (Win64) OpenSSL/1.1.1h PHP/7.4.14
X-Powered-By
PHP/7.4.14
Content-Length
6197
Keep-Alive
timeout=5, max=100
Connection
Keep-Alive
Content-Type
application/json; charset=utf-8
### POSTDelete a contact
{{api_url}}
HEADERS
Content-Type
application/json
X-ACCESS-TOKEN
{{token}}
User-Agent
mobile-app
Bodyraw 
```
{
  "account_id": {{account_id}},
  "op":"users",
  "op1":"delete",
  "contact_id":"[contact_id]"
}
```

Example Request
Example
curl
```
curl --location -g '{{api_url}}' \
--header 'Content-Type: application/json' \
--header 'X-ACCESS-TOKEN: {{user_token}}' \
--header 'User-Agent: mobile-app' \
--data '{
  "account_id": {{account_id}},
  "op":"users",
  "op1":"delete",
  "contact_id":"12345"
}
  '
```

200 OK
Example Response
  * Body
  * Headers (1)


json
```
{
 "status": "OK"
}
```

Content-Type
application/json; charset=utf-8
### POSTGet list of orders
{{api_url}}
HEADERS
Content-Type
application/json
X-ACCESS-TOKEN
{{token}}
User-Agent
mobile-app
Bodyraw 
```
{
  "account_id": {{account_id}},
  "op":"ecommerce",
  "op1":"orders",
  "op2":"get"
}
  
```

Example Request
Example
curl
```
curl --location -g '{{api_url}}' \
--header 'Content-Type: application/json' \
--header 'X-ACCESS-TOKEN: {{user_token}}' \
--header 'User-Agent: mobile-app' \
--data '{
  "account_id": {{account_id}},
  "op":"ecommerce",
  "op1":"orders",
  "op2":"get"
}'
```

200 OK
Example Response
  * Body
  * Headers (1)


View More
json
```
{
 "status": "OK",
 "data": [
  {
   "id": "569601",
   "contact_id": "833274349439",
   "name": "Name 1",
   "currency": "USD",
   "total": "1000",
   "subtotal": "1000",
   "shipping_price": "0",
   "rating": "3",
   "status": "4",
   "dt_confirmed": "2024-01-25 19:00:00",
   "t_confirmed": "1706209200"
  }
 ]
}
```

Content-Type
application/json; charset=utf-8
### POSTGet order information
{{api_url}}
HEADERS
Content-Type
application/json
X-ACCESS-TOKEN
{{token}}
User-Agent
mobile-app
Bodyraw 
```
{
  "account_id": {{account_id}},
  "op":"ecommerce",
  "op1":"orders",
  "op2":"get",
  "id": "[order_id]"
}
  
```

Example Request
Example
curl
```
curl --location -g '{{api_url}}' \
--header 'Content-Type: application/json' \
--header 'X-ACCESS-TOKEN: {{user_token}}' \
--header 'User-Agent: mobile-app' \
--data '{
  "account_id": {{account_id}},
  "op":"ecommerce",
  "op1":"orders",
  "op2":"get",
  "id": 1000000
}'
```

200 OK
Example Response
  * Body
  * Headers (1)


View More
json
```
{
 "status": "OK",
 "data": {
  "id": 1000000,
  "contact_id": "238847438434",
  "total": 20000,
  "subtotal": 20000,
  "shipping_price": 0,
  "other_taxes": 0,
  "number_items": 1,
  "rating": 5,
  "status": 4,
  "date_confirmed": "...",
  "date_delivered": "...",
  "products": [
   {
    "id": 4939343,
    "price": 20000,
    "name": "Test Product",
    "short_description": "...",
    "image": "",
    "parent_product": 0,
    "quantity": 1,
    "variant": "",
    "user_note": "...",
    "vendor": "...",
    "addon_of": "..."
   }
  ],
  "contact": {
   "id": 238847438434,
   "name": "Test User",
   "channel": 0
  }
 }
}
```

Content-Type
application/json; charset=utf-8
### POSTUpdate order
{{api_url}}
HEADERS
Content-Type
application/json
X-ACCESS-TOKEN
{{token}}
User-Agent
mobile-app
Bodyraw 
```
{
  "account_id": {{account_id}},
  "op":"ecommerce",
  "op1":"orders",
  "op2":"update",
  "id": "[order_id]",
  "data":{
    "status":"[4|6|7|10|13]"
  }
}
  
```

Example Request
Example
View More
curl
```
curl --location -g '{{api_url}}' \
--header 'Content-Type: application/json' \
--header 'X-ACCESS-TOKEN: {{user_token}}' \
--header 'User-Agent: mobile-app' \
--data '{
  "account_id": {{account_id}},
  "op":"ecommerce",
  "op1":"orders",
  "op2":"update",
  "id": 1000000,
  "data":{
    "status":7
  }
}'
```

200 OK
Example Response
  * Body
  * Headers (1)


json
```
{
 "status": "OK"
}
```

Content-Type
application/json; charset=utf-8
### POSTGet list of Google Business Message locations
{{api_url}}
HEADERS
Content-Type
application/json
X-ACCESS-TOKEN
{{token}}
User-Agent
mobile-app
Bodyraw 
```
{
  "account_id": {{account_id}},
  "op":"googleBM",
  "op1":"location",
  "op2":"get"
}
  
```

Example Request
Example
curl
```
curl --location -g '{{api_url}}' \
--header 'Content-Type: application/json' \
--header 'X-ACCESS-TOKEN: {{token}}' \
--header 'User-Agent: mobile-app' \
--data '{
  "account_id": {{account_id}},
  "op":"googleBM",
  "op1":"location",
  "op2":"get"
}
  '
```

200 OK
Example Response
  * Body
  * Headers (7)


json
```
{
 "status": "OK",
 "data": [
  {
   "id": "brands/7c3dad98-9ec8-470f-844f-----------/locations/90bfe1d1-3933-4ded-b5c8--------------",
   "place_id": "dksdskdsjdjddsjdsdkddsk",
   "name": "Name 1"
  }
 ]
}
```

Date
Mon, 03 Jul 2023 11:48:39 GMT
Server
Apache/2.4.46 (Win64) OpenSSL/1.1.1h PHP/7.4.14
X-Powered-By
PHP/7.4.14
Content-Length
401
Keep-Alive
timeout=5, max=100
Connection
Keep-Alive
Content-Type
application/json; charset=utf-8
