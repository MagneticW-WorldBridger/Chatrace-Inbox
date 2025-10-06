# 📊 RESPUESTAS SOBRE LA DATABASE

## ✅ TABLA YA EXISTE EN PRODUCCIÓN

```sql
Table: google_oauth_tokens
Owner: neondb_owner
Status: ✅ EXISTS
```

## 📋 DATOS GUARDADOS:

```
user_email: jlasse@aiprlassist.com
business_id: 1145545
expires_at: 2025-10-03 11:55:31 (EXPIRADO - se auto-renueva)
scope: gmail.compose, gmail.send, userinfo.profile, openid, userinfo.email
```

## 🔧 PARÁMETROS QUE SE GUARDAN:

### Columnas en la tabla:
1. **id** - Auto-increment primary key
2. **business_id** - ID del negocio (ej: "1145545" para tu cuenta)
3. **user_email** - Email del usuario que autorizó (ej: "penny@pennymustard.com")
4. **access_token** - Token para hacer requests a Gmail API
5. **refresh_token** - Token para renovar el access_token
6. **token_type** - Siempre "Bearer"
7. **expires_at** - Cuándo expira el access_token
8. **scope** - Permisos autorizados (gmail.send, gmail.compose, etc.)
9. **created_at** - Cuándo se creó
10. **updated_at** - Última actualización

## 🎯 CÓMO SE USAN:

### Cuando Penny autoriza:
```javascript
business_id = "1145545" (tu cuenta)
user_email = "penny@pennymustard.com" (su Gmail)
access_token = "ya29.a0AQQ..." (token de Google)
refresh_token = "1//0fEoXwy..." (para renovar)
expires_at = NOW() + 1 hora
scope = "gmail.send gmail.compose..."
```

### Cuando envías email:
```javascript
// Backend busca en DB:
SELECT * FROM google_oauth_tokens 
WHERE business_id = '1145545' 
AND user_email = 'penny@pennymustard.com'

// Usa el access_token para enviar
// Si está expirado, usa refresh_token para renovar
```

## 🔑 UNIQUE KEY:

La combinación `(business_id, user_email)` es única.

**Esto significa:**
- Cada negocio puede tener múltiples usuarios
- Cada usuario puede estar en múltiples negocios
- Un usuario = un set de tokens por negocio

## 📧 URL DIRECTO AL GOOGLE LOGIN:

```
https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=openid%20email%20profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.send%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.compose&prompt=consent&response_type=code&client_id=426960401142-a7rkln8fl3342kn99hl11vh65drp2fci.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Ffrontend-production-43b8.up.railway.app%2Foauth2callback
```

**Copia y pega esa URL en tu navegador para probar el flow de producción.**

## ✅ ESTADO:

- Table: ✅ Exists in production
- Data: ✅ 1 token saved (expired but will auto-refresh)
- Backend: ⏳ Deploying fix (gmail-service.js moved to backend/)
- Frontend: ✅ Ready
- Google Console: ✅ Redirect URIs added
- Railway Env Vars: ✅ All set

**DESPUÉS DEL DEPLOY:** Todo listo para producción.
EOF
cat RESPUESTAS_DB.md
