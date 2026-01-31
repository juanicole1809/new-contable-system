# Redconar API - Authorization (PHPSESSID)

## Overview

Redconar uses PHP session-based authentication. To interact with any protected endpoint, you first need to obtain a valid `PHPSESSID` cookie by logging in.

## Login Endpoint

| Property | Value |
|----------|-------|
| **URL** | `https://www.redconar.net/userValidator.php` |
| **Method** | `POST` |
| **Content-Type** | `application/x-www-form-urlencoded` (default for POST) |

## Request Payload

```javascript
{
  "usuario": "your_email@example.com",
  "contrasena": "your_password",
  "home_": "https://www.redconar.net/login/ingresar.php?"
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `usuario` | string | Email address for the Redconar account |
| `contrasena` | string | Password for the account |
| `home_` | string | Redirect URL after login |

## Important: Follow Redirects

**Set `followRedirects: false`** when making the login request. This allows you to capture the `Set-Cookie` header containing the `PHPSESSID`.

## Response

The response headers will contain:

```
Set-Cookie: PHPSESSID=<session_id>; path=/
```

## Extracting the PHPSESSID

```javascript
var response = UrlFetchApp.fetch(loginUrl, options);
var cookies = response.getHeaders()["Set-Cookie"];

if (cookies) {
  var sessionIdMatch = cookies.match(/PHPSESSID=([^;]+)/);
  if (sessionIdMatch) {
    var sessionId = sessionIdMatch[1];
    // Use this sessionId in subsequent requests
  }
}
```

## Using the PHPSESSID in Subsequent Requests

Once you have the `PHPSESSID`, include it as a cookie header in all API requests:

```javascript
headers: {
  "Cookie": "PHPSESSID=" + sessionId
}
```

## Code Example (Google Apps Script)

```javascript
function loginAndFetchData() {
  var loginUrl = "https://www.redconar.net/userValidator.php";

  var payload = {
    usuario: "your_email@example.com",
    contrasena: "your_password",
    home_: "https://www.redconar.net/login/ingresar.php?"
  };

  var options = {
    method: "post",
    payload: payload,
    followRedirects: false  // Critical: must be false
  };

  var response = UrlFetchApp.fetch(loginUrl, options);
  var cookies = response.getHeaders()["Set-Cookie"];

  if (cookies) {
    var sessionIdMatch = cookies.match(/PHPSESSID=([^;]+)/);
    if (sessionIdMatch) {
      var sessionId = sessionIdMatch[1];
      Logger.log("PHPSESSID: " + sessionId);
      return sessionId;
    }
  }

  Logger.log("No se pudo obtener PHPSESSID.");
  return null;
}
```

## Testing with cURL

```bash
curl -X POST 'https://www.redconar.net/userValidator.php' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'usuario=your_email@example.com' \
  -d 'contrasena=your_password' \
  -d 'home_=https://www.redconar.net/login/ingresar.php?' \
  -i  # Include headers to see Set-Cookie
```

## Notes

- The PHPSESSID has a limited lifetime and will expire after a period of inactivity
- Store credentials securely using `PropertiesService` in production
- The `usuario` and `contrasena` fields use Spanish spelling (not "usuario" and "password")

## To Be Discovered

- [ ] Session expiration time
- [ ] Session refresh mechanism (if any)
- [ ] Any additional authentication methods
