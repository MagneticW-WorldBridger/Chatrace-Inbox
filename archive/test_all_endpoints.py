#!/usr/bin/env python3

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

def test_all_endpoints():
    """Test all 62 endpoints from postman_api_docs.md"""
    
    # API Configuration
    api_url = os.getenv("API_URL", "https://app.aiprlassist.com/php/user")
    user_token = os.getenv("USER_TOKEN")
    business_id = os.getenv("BUSINESS_ID")
    user_id = os.getenv("USER_ID")
    
    # Headers
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'mobile-app',
        'X-ACCESS-TOKEN': user_token
    }
    
    print("🧪 Testing ALL 62 endpoints from postman_api_docs.md")
    print(f"URL: {api_url}")
    print(f"Business ID: {business_id}")
    print(f"User ID: {user_id}")
    print("=" * 80)
    
    # All endpoints from postman_api_docs.md
    endpoints = [
        # Public endpoints (no auth required)
        {
            "name": "Get Whitelabel Info",
            "payload": {"op": "wt", "op1": "get"},
            "auth_required": False
        },
        {
            "name": "Request OTP",
            "payload": {
                "op": "login", "op1": "email", "op2": "requestOTP",
                "data": {"email": "development@driveretailtraffic.com"}
            },
            "auth_required": False
        },
        {
            "name": "Validate OTP",
            "payload": {
                "op": "login", "op1": "email", "op2": "validateOTP",
                "rid": "test_rid", "data": {"code": "123456"}
            },
            "auth_required": False
        },
        {
            "name": "Login with Google",
            "payload": {
                "op": "login", "op1": "authentication", "op2": "validate", "op3": "google",
                "data": {"idToken": "test_token", "serverAuthCode": ""}
            },
            "auth_required": False
        },
        {
            "name": "Login with Apple",
            "payload": {
                "op": "login", "op1": "authentication", "op2": "validate", "op3": "apple",
                "data": {"identityToken": "test_token", "authorizationCode": ""}
            },
            "auth_required": False
        },
        {
            "name": "Login with Facebook",
            "payload": {
                "op": "login", "op1": "authentication", "op2": "validate", "op3": "facebook",
                "data": {"accessToken": "test_token"}
            },
            "auth_required": False
        },
        {
            "name": "Logout",
            "payload": {"op": "logout"},
            "auth_required": True
        },
        
        # User endpoints (auth required)
        {
            "name": "Get User Info",
            "payload": {
                "account_id": business_id, "op": "users", "op1": "get", "user_id": user_id
            },
            "auth_required": True
        },
        {
            "name": "Get Conversations",
            "payload": {
                "account_id": business_id, "op": "conversations", "op1": "get"
            },
            "auth_required": True
        },
        {
            "name": "Get Contact Info",
            "payload": {
                "account_id": business_id, "op": "contacts", "op1": "get", "contact_id": "test_contact"
            },
            "auth_required": True
        },
        {
            "name": "Get Messages",
            "payload": {
                "account_id": business_id, "op": "messages", "op1": "get", "contact_id": "test_contact"
            },
            "auth_required": True
        },
        {
            "name": "Get Admins",
            "payload": {
                "account_id": business_id, "op": "admins", "op1": "get"
            },
            "auth_required": True
        },
        {
            "name": "Get Inbox Teams",
            "payload": {
                "account_id": business_id, "op": "teams", "op1": "get"
            },
            "auth_required": True
        },
        {
            "name": "Assign Conversation",
            "payload": {
                "account_id": business_id, "op": "conversations", "op1": "assign",
                "contact_id": "test_contact", "admin_id": user_id
            },
            "auth_required": True
        },
        {
            "name": "Get Flows",
            "payload": {
                "account_id": business_id, "op": "flows", "op1": "get"
            },
            "auth_required": True
        },
        {
            "name": "Get Flow Steps",
            "payload": {
                "account_id": business_id, "op": "flows", "op1": "steps", "op2": "get", "flow_id": "test_flow"
            },
            "auth_required": True
        },
        {
            "name": "Send Flow",
            "payload": {
                "account_id": business_id, "op": "flows", "op1": "send",
                "contact_id": "test_contact", "flow_id": "test_flow"
            },
            "auth_required": True
        },
        {
            "name": "Send Step",
            "payload": {
                "account_id": business_id, "op": "flows", "op1": "step", "op2": "send",
                "contact_id": "test_contact", "step_id": "test_step"
            },
            "auth_required": True
        },
        {
            "name": "Get Products",
            "payload": {
                "account_id": business_id, "op": "products", "op1": "get"
            },
            "auth_required": True
        },
        {
            "name": "Send Products",
            "payload": {
                "account_id": business_id, "op": "products", "op1": "send",
                "contact_id": "test_contact", "product_ids": ["test_product"]
            },
            "auth_required": True
        },
        {
            "name": "Move to Bot",
            "payload": {
                "account_id": business_id, "op": "conversations", "op1": "bot",
                "contact_id": "test_contact", "bot": True
            },
            "auth_required": True
        },
        {
            "name": "Unassign Conversation",
            "payload": {
                "account_id": business_id, "op": "conversations", "op1": "unassign",
                "contact_id": "test_contact"
            },
            "auth_required": True
        },
        {
            "name": "Archive Conversation",
            "payload": {
                "account_id": business_id, "op": "conversations", "op1": "archive",
                "contact_id": "test_contact", "archive": True
            },
            "auth_required": True
        },
        {
            "name": "Follow Conversation",
            "payload": {
                "account_id": business_id, "op": "conversations", "op1": "follow",
                "contact_id": "test_contact", "follow": True
            },
            "auth_required": True
        },
        {
            "name": "Block Conversation",
            "payload": {
                "account_id": business_id, "op": "conversations", "op1": "block",
                "contact_id": "test_contact", "block": True
            },
            "auth_required": True
        },
        {
            "name": "Mark as Read",
            "payload": {
                "account_id": business_id, "op": "conversations", "op1": "read",
                "contact_id": "test_contact", "read": True
            },
            "auth_required": True
        },
        {
            "name": "Get Tags",
            "payload": {
                "account_id": business_id, "op": "tags", "op1": "get"
            },
            "auth_required": True
        },
        {
            "name": "Remove Tag",
            "payload": {
                "account_id": business_id, "op": "tags", "op1": "remove",
                "contact_id": "test_contact", "tag_id": "test_tag"
            },
            "auth_required": True
        },
        {
            "name": "Get Drip Campaigns",
            "payload": {
                "account_id": business_id, "op": "campaigns", "op1": "get"
            },
            "auth_required": True
        },
        {
            "name": "Get Custom Fields",
            "payload": {
                "account_id": business_id, "op": "fields", "op1": "get"
            },
            "auth_required": True
        },
        {
            "name": "Add Custom Field",
            "payload": {
                "account_id": business_id, "op": "fields", "op1": "add",
                "data": {"name": "test_field", "type": "text"}
            },
            "auth_required": True
        },
        {
            "name": "Set Custom Field",
            "payload": {
                "account_id": business_id, "op": "fields", "op1": "set",
                "contact_id": "test_contact", "field_id": "test_field", "value": "test_value"
            },
            "auth_required": True
        },
        {
            "name": "Delete Custom Field",
            "payload": {
                "account_id": business_id, "op": "fields", "op1": "delete",
                "contact_id": "test_contact", "field_id": "test_field"
            },
            "auth_required": True
        },
        {
            "name": "Generate AI Response",
            "payload": {
                "account_id": business_id, "op": "ai", "op1": "generate",
                "contact_id": "test_contact", "message": "test message"
            },
            "auth_required": True
        },
        {
            "name": "Add Note",
            "payload": {
                "account_id": business_id, "op": "notes", "op1": "add",
                "contact_id": "test_contact", "note": "test note"
            },
            "auth_required": True
        },
        {
            "name": "Update Note",
            "payload": {
                "account_id": business_id, "op": "notes", "op1": "update",
                "note_id": "test_note", "note": "updated note"
            },
            "auth_required": True
        },
        {
            "name": "Delete Note",
            "payload": {
                "account_id": business_id, "op": "notes", "op1": "delete",
                "note_id": "test_note"
            },
            "auth_required": True
        },
        {
            "name": "Delete Contact",
            "payload": {
                "account_id": business_id, "op": "users", "op1": "delete",
                "contact_id": "test_contact"
            },
            "auth_required": True
        },
        {
            "name": "Get Saved Replies",
            "payload": {
                "account_id": business_id, "op": "replies", "op1": "get"
            },
            "auth_required": True
        },
        {
            "name": "Add Saved Reply",
            "payload": {
                "account_id": business_id, "op": "replies", "op1": "add",
                "data": {"name": "test_reply", "content": "test content"}
            },
            "auth_required": True
        },
        {
            "name": "Update Saved Reply",
            "payload": {
                "account_id": business_id, "op": "replies", "op1": "update",
                "reply_id": "test_reply", "data": {"name": "updated_reply", "content": "updated content"}
            },
            "auth_required": True
        },
        {
            "name": "Delete Saved Reply",
            "payload": {
                "account_id": business_id, "op": "replies", "op1": "delete",
                "reply_id": "test_reply"
            },
            "auth_required": True
        },
        {
            "name": "Upload File",
            "payload": {
                "account_id": business_id, "op": "files", "op1": "upload",
                "contact_id": "test_contact", "file": "test_file"
            },
            "auth_required": True
        },
        {
            "name": "Get Messenger Lists",
            "payload": {
                "account_id": business_id, "op": "messenger", "op1": "lists", "op2": "get"
            },
            "auth_required": True
        },
        {
            "name": "Get Calendars",
            "payload": {
                "account_id": business_id, "op": "calendars", "op1": "get"
            },
            "auth_required": True
        },
        {
            "name": "Get Appointments",
            "payload": {
                "account_id": business_id, "op": "appointments", "op1": "get"
            },
            "auth_required": True
        },
        {
            "name": "Cancel Appointment",
            "payload": {
                "account_id": business_id, "op": "appointments", "op1": "cancel",
                "appointment_id": "test_appointment"
            },
            "auth_required": True
        },
        {
            "name": "Delete Appointment",
            "payload": {
                "account_id": business_id, "op": "appointments", "op1": "delete",
                "appointment_id": "test_appointment"
            },
            "auth_required": True
        },
        {
            "name": "Get Orders",
            "payload": {
                "account_id": business_id, "op": "ecommerce", "op1": "orders", "op2": "get"
            },
            "auth_required": True
        },
        {
            "name": "Get Order Info",
            "payload": {
                "account_id": business_id, "op": "ecommerce", "op1": "orders", "op2": "get",
                "id": "test_order"
            },
            "auth_required": True
        },
        {
            "name": "Update Order",
            "payload": {
                "account_id": business_id, "op": "ecommerce", "op1": "orders", "op2": "update",
                "id": "test_order", "data": {"status": "4"}
            },
            "auth_required": True
        },
        {
            "name": "Get Google Business Locations",
            "payload": {
                "account_id": business_id, "op": "googleBM", "op1": "location", "op2": "get"
            },
            "auth_required": True
        },
        {
            "name": "Register FCM Device",
            "payload": {
                "account_id": business_id, "op": "fcm", "op1": "register",
                "device_token": "test_device_token"
            },
            "auth_required": True
        }
    ]
    
    working_endpoints = []
    failed_endpoints = []
    auth_errors = []
    other_errors = []
    
    for i, endpoint in enumerate(endpoints, 1):
        print(f"\n[{i:2d}/62] Testing: {endpoint['name']}")
        
        # Use headers with or without auth based on endpoint
        test_headers = headers if endpoint['auth_required'] else {
            'Content-Type': 'application/json',
            'User-Agent': 'mobile-app'
        }
        
        try:
            response = requests.post(api_url, headers=test_headers, json=endpoint['payload'])
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if data.get("status") == "OK":
                        print(f"✅ SUCCESS: {endpoint['name']}")
                        working_endpoints.append(endpoint['name'])
                    else:
                        error_code = data.get("code", "Unknown")
                        print(f"❌ API ERROR (Code {error_code}): {endpoint['name']}")
                        if error_code == 1:
                            auth_errors.append(endpoint['name'])
                        else:
                            other_errors.append(endpoint['name'])
                except json.JSONDecodeError:
                    if response.text.strip() == "null":
                        print(f"⚠️ NULL RESPONSE: {endpoint['name']}")
                        other_errors.append(endpoint['name'])
                    else:
                        print(f"✅ SUCCESS (Non-JSON): {endpoint['name']}")
                        working_endpoints.append(endpoint['name'])
            else:
                print(f"❌ HTTP {response.status_code}: {endpoint['name']}")
                other_errors.append(endpoint['name'])
                
        except Exception as e:
            print(f"❌ EXCEPTION: {endpoint['name']} - {str(e)}")
            other_errors.append(endpoint['name'])
    
    # Final Summary
    print("\n" + "=" * 80)
    print("📊 FINAL RESULTS - ALL 62 ENDPOINTS")
    print("=" * 80)
    print(f"✅ Working: {len(working_endpoints)}")
    print(f"❌ Auth Errors (Code 1): {len(auth_errors)}")
    print(f"❌ Other Errors: {len(other_errors)}")
    print(f"📈 Success Rate: {(len(working_endpoints)/62)*100:.1f}%")
    
    if working_endpoints:
        print(f"\n✅ WORKING ENDPOINTS ({len(working_endpoints)}):")
        for endpoint in working_endpoints:
            print(f"   - {endpoint}")
    
    if auth_errors:
        print(f"\n❌ AUTH ERRORS ({len(auth_errors)}):")
        for endpoint in auth_errors:
            print(f"   - {endpoint}")
    
    if other_errors:
        print(f"\n❌ OTHER ERRORS ({len(other_errors)}):")
        for endpoint in other_errors:
            print(f"   - {endpoint}")

if __name__ == "__main__":
    test_all_endpoints() 