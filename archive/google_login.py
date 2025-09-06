import sys
import traceback
import json
import urllib.parse
            # Debug: show OAuth configuration
            try:
                with open('client_secret.json', 'r') as f:
                    client_json = json.load(f)
                    client_id_in_file = client_json.get('web', {}).get('client_id')
            except Exception:
                client_id_in_file = 'UNKNOWN'

            redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
            parsed = urllib.parse.urlparse(redirect_uri or '')
            port = parsed.port or (3000 if parsed.scheme == 'http' else 443)

            print(f"OAuth Debug -> Client ID (file): {client_id_in_file}")
            print(f"OAuth Debug -> Client ID (env):  {os.getenv('GOOGLE_CLIENT_ID')}")
            print(f"OAuth Debug -> Redirect URI:     {redirect_uri}")
            print(f"OAuth Debug -> Port:             {port}")
            print(f"OAuth Debug -> Scopes:           ['openid','userinfo.email','userinfo.profile']")

                scopes=[
                    'openid',
                    'https://www.googleapis.com/auth/userinfo.email',
                    'https://www.googleapis.com/auth/userinfo.profile'
                ],
                redirect_uri=redirect_uri
            # Lock to the exact port from redirect URI to avoid mismatch
            creds = flow.run_local_server(port=port)
        traceback.print_exc(file=sys.stdout)