chatrace.postman_external_collection.json

Swagger UI
swagger
API Docs
 1.1 
[ Base URL: app.aiprlassist.com/api/ ]
Schemes

Authorize
Accounts

GET
/accounts/me

Get business account details.
Parameters
Try it out
No parameters
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "page_id": 0,
  "name": "string",
  "active": true,
  "created": 0,
  "total_users": 0
}
GET
/accounts/admins

Get all admins from a business account.
Parameters
Try it out
No parameters
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
[
  {
    "id": 0,
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "full_name": "string",
    "profile_pic": "string"
  }
]
GET
/accounts/tags

Get all tags from a business account.
Parameters
Try it out
No parameters
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
[
  {
    "id": 0,
    "name": "string"
  }
]
POST
/accounts/tags

Create a new tag
Parameters
Try it out
Name	Description
name *
string
(formData)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "id": 1995
}
GET
/accounts/tags/{tag_id}

Get tag by id
Parameters
Try it out
Name	Description
tag_id *
integer($int64)
(path)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "id": 0,
  "name": "string"
}
DELETE
/accounts/tags/{tag_id}

Delete a tag
Parameters
Try it out
Name	Description
tag_id *
integer($int64)
(path)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "success": true
}
GET
/accounts/tags/name/{tag_name}

Get a tag by name
Parameters
Try it out
Name	Description
tag_name *
string
(path)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "id": 0,
  "name": "string"
}
GET
/accounts/flows

Get all flows from a business account.
Parameters
Try it out
No parameters
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
[
  {
    "id": 0,
    "name": "string"
  }
]
GET
/accounts/custom_fields

Get all custom fields from a business account.
Parameters
Try it out
No parameters
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
[
  {
    "id": 0,
    "name": "string",
    "type": 0,
    "description": "string"
  }
]
POST
/accounts/custom_fields

Create a custom field
Parameters
Try it out
Name	Description
content *
(body)	
Example Value
Model
{
  "name": "lead_score",
  "type": 1
}
Parameter content type

Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "id": 1995,
  "name": "lead_score"
}
GET
/accounts/custom_fields/{custom_field_id}

Get custom field by id
Parameters
Try it out
Name	Description
custom_field_id *
integer($int64)
(path)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "id": 0,
  "name": "string",
  "type": 0,
  "description": "string"
}
GET
/accounts/custom_fields/name/{custom_field_name}

Get custom field by name
Parameters
Try it out
Name	Description
custom_field_name *
string
(path)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "id": 0,
  "name": "string",
  "type": 0,
  "description": "string"
}
GET
/accounts/bot_fields/{bot_field_id}

Get bot field value by id
Parameters
Try it out
Name	Description
bot_field_id *
integer
(path)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "id": 2334,
  "name": "age",
  "type": 1,
  "value": 25
}
POST
/accounts/bot_fields/{bot_field_id}

Set a bot field value
Parameters
Try it out
Name	Description
bot_field_id *
integer
(path)	
value *
string
(formData)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "success": true
}
DELETE
/accounts/bot_fields/{bot_field_id}

Unset the value of a bot field
Parameters
Try it out
Name	Description
bot_field_id *
integer
(path)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "success": true
}
POST
/accounts/template/{template_id}/generateSingleUseLink

Generate single-use template link
Parameters
Try it out
Name	Description
template_id *
integer
(path)	
You can get template ID from the template link
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "link": "https://..."
}
Contacts

GET
/contacts/{contact_id}

Get contact by contact id
Parameters
Try it out
Name	Description
contact_id *
integer
(path)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "id": 0,
  "page_id": 0,
  "first_name": "string",
  "last_name": "string",
  "channel": 0,
  "profile_pic": "string",
  "locale": "string",
  "gender": 0,
  "timezone": 0,
  "last_sent": 0,
  "last_delivered": 0,
  "last_seen": 0,
  "last_interaction": 0,
  "subscribed_date": "string",
  "subscribed": 0,
  "tags": [
    {
      "id": 0,
      "name": "string"
    }
  ],
  "custom_fields": [
    {
      "id": 0,
      "name": "string",
      "type": 0,
      "value": "string"
    }
  ]
}
400	
Invalid username supplied
404	
User not found
GET
/contacts/find_by_custom_field

Find contacts by custom field value. It will return maximum 100 contacts. The results are sorted by the last custom field value update for a contact.
Parameters
Try it out
Name	Description
field_id *
string
(query)	
Custom field ID. Use ‘phone’ or ‘email’ as custom field id if you want to find the contact by phone or email

value *
string
(query)	
Responses
Response content type

Code	Description
200	
Example Value
Model
{
  "data": [
    {
      "id": 0,
      "page_id": 0,
      "first_name": "string",
      "last_name": "string",
      "channel": 0,
      "profile_pic": "string",
      "locale": "string",
      "gender": 0,
      "timezone": 0,
      "last_sent": 0,
      "last_delivered": 0,
      "last_seen": 0,
      "last_interaction": 0,
      "subscribed_date": "string",
      "subscribed": 0,
      "tags": [
        {
          "id": 0,
          "name": "string"
        }
      ],
      "custom_fields": [
        {
          "id": 0,
          "name": "string",
          "type": 0,
          "value": "string"
        }
      ]
    }
  ]
}
400	
Invalid parameters
GET
/contacts/{contact_id}/tags

Get all tags added to this contact
Parameters
Try it out
Name	Description
contact_id *
integer
(path)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
[
  {
    "id": 0,
    "name": "string"
  }
]
POST
/contacts/{contact_id}/tags/{tag_id}

Add a tag to the contact
Parameters
Try it out
Name	Description
contact_id *
integer
(path)	
tag_id *
integer
(path)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "success": true
}
DELETE
/contacts/{contact_id}/tags/{tag_id}

remove a tag from the contact
Parameters
Try it out
Name	Description
contact_id *
integer
(path)	
tag_id *
integer
(path)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "success": true
}
POST
/contacts

Creates a new contact.
Parameters
Try it out
Name	Description
content *
(body)	
Example Value
Model
{
  "phone": "+1234567890",
  "email": "test@test.com",
  "first_name": "John",
  "last_name": "Smith",
  "gender": "male",
  "actions": [
    {
      "action": "add_tag",
      "tag_name": "YOU_TAG_NAME"
    },
    {
      "action": "set_field_value",
      "field_name": "YOU_CUSTOM_FIELD_NAME",
      "value": "ANY_VALUE"
    },
    {
      "action": "send_flow",
      "flow_id": 11111
    }
  ]
}
Parameter content type

Responses
Response content type

Code	Description
default	
successful operation
GET
/contacts/{contact_id}/custom_fields

Get all custom fields from a contact
Parameters
Try it out
Name	Description
contact_id *
integer
(path)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
[
  {
    "id": 0,
    "name": "string",
    "type": 0,
    "value": "string"
  }
]
GET
/contacts/{contact_id}/custom_fields/{custom_field_id}

Get custom field value by id
Parameters
Try it out
Name	Description
contact_id *
integer
(path)	
custom_field_id *
integer
(path)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "id": 2334,
  "name": "age",
  "type": 1,
  "value": 25
}
POST
/contacts/{contact_id}/custom_fields/{custom_field_id}

Set a contact custom field
Parameters
Try it out
Name	Description
contact_id *
integer
(path)	
custom_field_id *
string
(path)	
value *
string
(formData)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "success": true
}
DELETE
/contacts/{contact_id}/custom_fields/{custom_field_id}

remove a custom field from the contact
Parameters
Try it out
Name	Description
contact_id *
integer
(path)	
custom_field_id *
integer
(path)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "success": true
}
POST
/contacts/{contact_id}/send/{flow_id}

Send a flow to contact
Parameters
Try it out
Name	Description
contact_id *
integer
(path)	
flow_id *
integer
(path)	
Responses
Response content type

Code	Description
default	
successful operation
POST
/contacts/{contact_id}/send/text

Send text message to the contact
Parameters
Try it out
Name	Description
contact_id *
integer
(path)	
content *
(body)	
Example Value
Model
{
  "text": "This is a text message",
  "channel": "messenger"
}
Parameter content type

Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "success": true
}
POST
/contacts/{contact_id}/send/file

Send file
Parameters
Try it out
Name	Description
contact_id *
integer
(path)	
content *
(body)	
Example Value
Model
{
  "url": "https://...",
  "type": "image",
  "channel": "messenger"
}
Parameter content type

Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "success": true
}
POST
/contacts/{contact_id}/send_content

Allows to run multiple actions and send multiple messages. Works for all channels.
Parameters
Try it out
Name	Description
contact_id *
integer
(path)	
content *
(body)	
Example Value
Model
{
  "messages": [
    {
      "message": {
        "text": "Hello world"
      }
    }
  ],
  "actions": [],
  "channel": "messenger"
}
Parameter content type

Responses
Response content type

Code	Description
default	
successful operation
Pipelines

GET
/pipelines/

Get list of pipelines
Parameters
Try it out
Name	Description
offset
integer
(query)	
Specifies the starting position of the first record to return in a paginated response.
Default value : 0

limit
integer
(query)	
Sets the maximum number of records to return per request.
Default value : 100

Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "data": [
    {
      "id": 0,
      "name": "string"
    }
  ]
}
GET
/pipelines/{pipeline_id}

Get list of pipelines
Parameters
Try it out
Name	Description
pipeline_id *
number
(path)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "id": 0,
  "name": "string"
}
GET
/pipelines/{pipeline_id}/stages

Get list of pipeline stages
Parameters
Try it out
Name	Description
pipeline_id *
number
(path)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "data": [
    {
      "id": 0,
      "name": "string"
    }
  ]
}
GET
/pipelines/{pipeline_id}/custom_fields

Get all custom fields from a pipeline.
Parameters
Try it out
No parameters
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
[
  {
    "id": 0,
    "name": "string",
    "type": "string",
    "description": "string"
  }
]
GET
/pipelines/{pipeline_id}/opportunities

Get list of opportunities / tickets
Parameters
Try it out
Name	Description
pipeline_id *
number
(path)	
contact_id
number
(query)	
The ID of the contact to filter the opportunities.
offset
integer
(query)	
Specifies the starting position of the first record to return in a paginated response.
Default value : 0

limit
integer
(query)	
Sets the maximum number of records to return per request.
Default value : 100

Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "data": [
    {
      "id": 0,
      "contact_id": 0,
      "title": "string",
      "description": "string",
      "value": 0,
      "status": "string",
      "priority": "string",
      "stage": {
        "id": 0,
        "name": "string"
      },
      "assigned_admins": [
        0
      ],
      "created_at": "2028-02-08 12:34:56",
      "created_by": 0,
      "updated_at": "2028-02-08 12:34:56",
      "updated_by": 0
    }
  ]
}
POST
/pipelines/{pipeline_id}/opportunities

Creates an opportunity / ticket.
Parameters
Try it out
Name	Description
pipeline_id *
number
(path)	
content *
(body)	
Creates an opportunity / ticket

Example Value
Model
{
  "contact_id": "12345678",
  "title": "This is a test opportunity",
  "description": "...",
  "stage_id": 12334,
  "value": 300,
  "status": "open",
  "priority": "low",
  "assigned_admins": [
    55446563
  ],
  "custom_fields": [
    {
      "id": 1234,
      "value": "Any data"
    }
  ]
}
Parameter content type

Responses
Response content type

Code	Description
default	
successful operation
Example Value
Model
{
  "data": [
    {
      "id": 0,
      "contact_id": 0,
      "title": "string",
      "description": "string",
      "value": 0,
      "status": "string",
      "priority": "string",
      "stage": {
        "id": 0,
        "name": "string"
      },
      "assigned_admins": [
        0
      ],
      "created_at": "2028-02-08 12:34:56",
      "created_by": 0,
      "updated_at": "2028-02-08 12:34:56",
      "updated_by": 0
    }
  ]
}
GET
/pipelines/{pipeline_id}/opportunities/{opportunity_id}

Get an opportunity / ticket
Parameters
Try it out
Name	Description
pipeline_id *
number
(path)	
opportunity_id *
number
(path)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "id": 0,
  "contact_id": 0,
  "title": "string",
  "description": "string",
  "value": 0,
  "status": "string",
  "priority": "string",
  "stage": {
    "id": 0,
    "name": "string"
  },
  "assigned_admins": [
    0
  ],
  "created_at": "2028-02-08 12:34:56",
  "created_by": 0,
  "updated_at": "2028-02-08 12:34:56",
  "updated_by": 0
}
POST
/pipelines/{pipeline_id}/opportunities/{opportunity_id}

Updates an opportunity / ticket.
Parameters
Try it out
Name	Description
pipeline_id *
number
(path)	
opportunity_id *
number
(path)	
content *
(body)	
Example Value
Model
{
  "title": "This is a test opportunity",
  "description": "...",
  "stage_id": 12334,
  "value": 300,
  "status": "open",
  "priority": "low",
  "assigned_admins": [
    55446563
  ],
  "custom_fields": [
    {
      "id": 1234,
      "value": "Any data"
    },
    {
      "name": "Age",
      "value": 30
    }
  ]
}
Parameter content type

Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "success": true
}
DELETE
/pipelines/{pipeline_id}/opportunities/{opportunity_id}

Delete an opportunity / ticket
Parameters
Try it out
Name	Description
pipeline_id *
number
(path)	
opportunity_id *
number
(path)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "success": true
}
GET
/pipelines/{pipeline_id}/opportunities/{opportunity_id}/comments

Get list of comments of an opportunity / ticket
Parameters
Try it out
Name	Description
pipeline_id *
number
(path)	
opportunity_id *
number
(path)	
offset
integer
(query)	
Specifies the starting position of the first record to return in a paginated response.
Default value : 0

limit
integer
(query)	
Sets the maximum number of records to return per request.
Default value : 100

Responses
Response content type

Code	Description
default	
successful operation
Example Value
Model
{
  "data": [
    {
      "id": 0,
      "data": "string",
      "created_at": "2028-02-08 12:34:56",
      "created_by": 0
    }
  ]
}
POST
/pipelines/{pipeline_id}/opportunities/{opportunity_id}/comments

Creates a new comment on an opportunity / ticket.
Parameters
Try it out
Name	Description
pipeline_id *
number
(path)	
opportunity_id *
number
(path)	
content *
(body)	
Example Value
Model
{
  "content": "This is a comment"
}
Parameter content type

Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "id": 0,
  "data": "string",
  "created_at": "2028-02-08 12:34:56",
  "created_by": 0
}
DELETE
/pipelines/{pipeline_id}/opportunities/{opportunity_id}/comments/{comment_id}

Delete a comment of an opportunity / ticket
Parameters
Try it out
Name	Description
pipeline_id *
number
(path)	
opportunity_id *
number
(path)	
comment_id *
number
(path)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "success": true
}
Ecommerce

POST
/contacts/{contact_id}/send/products

Send a product message to the contact
Parameters
Try it out
Name	Description
contact_id *
integer
(path)	
data *
(body)	
Example Value
Model
{
  "product_id": [
    1111,
    222,
    3333
  ]
}
Parameter content type

Responses
Response content type

Code	Description
default	
successful operation
GET
/contacts/{contact_id}/cart

Get the contact cart ready for checkout
Parameters
Try it out
Name	Description
contact_id *
integer
(path)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "order_id": "string",
  "page_id": 0,
  "user_id": 0,
  "currency": "string",
  "total": 0,
  "subtotal": 0,
  "total_items": 0,
  "coupon_discount": 0,
  "coupon": "string",
  "line_items": [
    {
      "id": 0,
      "name": "string",
      "img": "string",
      "price": 0,
      "amount": 0,
      "descr_min": "string",
      "manufacturer": 0,
      "variant": "string",
      "user_msg": "string"
    }
  ],
  "contact": {
    "id": 0,
    "page_id": 0,
    "first_name": "string",
    "last_name": "string",
    "channel": 0,
    "profile_pic": "string",
    "locale": "string",
    "gender": 0,
    "timezone": 0,
    "last_sent": 0,
    "last_delivered": 0,
    "last_seen": 0,
    "last_interaction": 0,
    "subscribed_date": "string",
    "subscribed": 0,
    "tags": [
      {
        "id": 0,
        "name": "string"
      }
    ],
    "custom_fields": [
      {
        "id": 0,
        "name": "string",
        "type": 0,
        "value": "string"
      }
    ]
  }
}
DELETE
/contacts/{contact_id}/cart

Clear the contact cart
Parameters
Try it out
Name	Description
contact_id *
integer
(path)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "success": true
}
POST
/contacts/{contact_id}/pay/{order_id}

Mark an order as Paid.
Parameters
Try it out
Name	Description
contact_id *
integer
(path)	
order_id *
string
(path)	
amount_received *
integer
(formData)	
Total value the contact paid in cents.
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "success": true
}
400	
The amount received is less than the total value of the order.
402	
The contact received a message on Messenger why the checkout failed.
404	
The order ID doesn’t existe
GET
/contacts/{contact_id}/order/{order_id}

Get order information
Parameters
Try it out
Name	Description
contact_id *
integer
(path)	
order_id *
string
(path)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "order_id": "string",
  "page_id": 0,
  "user_id": 0,
  "currency": "string",
  "total": 0,
  "subtotal": 0,
  "total_items": 0,
  "coupon_discount": 0,
  "coupon": "string",
  "line_items": [
    {
      "id": 0,
      "name": "string",
      "img": "string",
      "price": 0,
      "amount": 0,
      "descr_min": "string",
      "manufacturer": 0,
      "variant": "string",
      "user_msg": "string"
    }
  ],
  "contact": {
    "id": 0,
    "page_id": 0,
    "first_name": "string",
    "last_name": "string",
    "channel": 0,
    "profile_pic": "string",
    "locale": "string",
    "gender": 0,
    "timezone": 0,
    "last_sent": 0,
    "last_delivered": 0,
    "last_seen": 0,
    "last_interaction": 0,
    "subscribed_date": "string",
    "subscribed": 0,
    "tags": [
      {
        "id": 0,
        "name": "string"
      }
    ],
    "custom_fields": [
      {
        "id": 0,
        "name": "string",
        "type": 0,
        "value": "string"
      }
    ]
  }
}
POST
/contacts/{contact_id}/order/{order_id}

Change order status.
Parameters
Try it out
Name	Description
contact_id *
integer
(path)	
order_id *
string
(path)	
content *
(body)	
Example Value
Model
{
  "status": 7
}
Parameter content type

Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "success": true
}
400	
Order status must be 6, 7, 10, or 13
402	
The order status is the same as the previous status
404	
The order ID doesn’t existe
POST
/contacts/{contact_id}/cart/{product_id}

Add a product to contact cart
Parameters
Try it out
Name	Description
contact_id *
integer
(path)	
product_id *
integer
(path)	
quantity *
integer
(formData)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "success": true
}
DELETE
/contacts/{contact_id}/cart/{product_id}

remove a product from contact cart
Parameters
Try it out
Name	Description
contact_id *
integer
(path)	
product_id *
integer
(path)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "success": true
}
GET
/products/{product_id}

Get product by id
Parameters
Try it out
Name	Description
product_id *
integer($int64)
(path)	
Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "id": 0,
  "name": "string",
  "price": 0,
  "sale_price": 0,
  "category_id": 0,
  "category_name": "string",
  "stock": 0,
  "short_description": "string",
  "image": "string",
  "created_at": "string"
}
POST
/products/{product_id}

Update product.
Parameters
Try it out
Name	Description
product_id *
number
(path)	
content *
(body)	
Example Value
Model
{
  "active": false,
  "stock": 500,
  "price": 40
}
Parameter content type

Responses
Response content type

Code	Description
200	
successful operation
Example Value
Model
{
  "success": true,
  "updated": true
}
Models
Cart
Order
ProductCart
Custom_field
Admin
Tag
Pipeline
PipelineStage
OpportunityComment
Opportunity
Product
Contact
Account