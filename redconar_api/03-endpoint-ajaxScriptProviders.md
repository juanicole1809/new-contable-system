# Redconar API - Endpoint: ajaxScriptProviders.php

## Overview

This endpoint returns a list of providers/suppliers available in the system. The response is formatted as HTML `<option>` elements, typically used to populate a dropdown/select element in a web form.

## Endpoint Details

| Property | Value |
|----------|-------|
| **URL** | `https://www.redconar.net/ajax/proveedores/ajaxScriptProviders.php` |
| **Method** | `POST` |
| **Content-Type** | `application/x-www-form-urlencoded` |
| **Authentication** | Requires valid `PHPSESSID` cookie |

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `selbId` | number | Yes | Building/consortium ID (seems to filter providers by location) |
| `user` | string | Yes | User email address for authentication context |
| `valuecuit` | number/string | Optional | CUIT filter (0 = show all, other values may filter by CUIT) |

### Known Values

| Parameter | Example | Notes |
|-----------|---------|-------|
| `selbId` | `16528` | Specific building/consortium ID |
| `user` | `admanastopulos@gmail.com` | Must be a valid user email |
| `valuecuit` | `0` | Show all providers (no CUIT filter) |

## Request Example

### cURL

```bash
curl -X POST 'https://www.redconar.net/ajax/proveedores/ajaxScriptProviders.php' \
  -H 'Cookie: PHPSESSID=<YOUR_SESSION_ID>' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'selbId=16528' \
  -d 'user=admanastopulos@gmail.com' \
  -d 'valuecuit=0'
```

### Google Apps Script

```javascript
function getProviders(sessionId, selbId) {
  var url = "https://www.redconar.net/ajax/proveedores/ajaxScriptProviders.php";

  var payload = {
    selbId: selbId,
    user: "admanastopulos@gmail.com",
    valuecuit: 0
  };

  var options = {
    method: "post",
    headers: {
      "Cookie": "PHPSESSID=" + sessionId
    },
    payload: payload
  };

  var response = UrlFetchApp.fetch(url, options);
  return response.getContentText();
}
```

## Response Format

The response is **HTML** containing `<option>` elements, not JSON.

### Response Structure

```html
<option disabled selected value=''>Seleccione un proveedor...</option>
<option value='85574'>    - </option>
<option value='136886'>100000 LAMPARAS SRL - 100000 LAMPARAS SRL</option>
<option value='77792'>ASCENSORES SITVER - A  ASCENSORES SITVER SA |  30-68058450-4 </option>
<option value='248382'>A & C CALDERAS DE JUAN CARLOS BONILLA - A & C CALDERAS DE JUAN CARLOS BONILLA |  20-28098159-2 </option>
<option value='162438'>ABA SERVITANQ SRL - ABA SERVITANQ SRL |  30-65572810-0 </option>
```

### Option Format

```html
<option value='<PROVIDER_ID>'><PROVIDER_NAME> - <LEGAL_NAME> |  <CUIT></option>
```

| Part | Description | Example |
|------|-------------|---------|
| `value` attribute | Internal provider ID | `136886` |
| Text content | Provider display name | `100000 LAMPARAS SRL` |
| Separator | ` | ` with spaces | ` \|  ` |
| CUIT | Provider tax ID | `30-715689770-0` |

### Parsing the Response

```javascript
function parseProviders(htmlResponse) {
  var options = htmlResponse.match(/<option[^>]*>([^<]+)<\/option>/g);
  var providers = [];

  if (!options) return providers;

  for (var i = 1; i < options.length; i++) {  // Skip first (disabled) option
    var option = options[i];
    var valueMatch = option.match(/value='([^']*)'/);
    var textMatch = option.match(/>([^<]+)</);

    if (valueMatch && textMatch) {
      var id = valueMatch[1];
      var text = textMatch[1].trim();

      // Parse the text: "NAME - LEGAL |  CUIT"
      var parts = text.split(' |  ');
      var nameLegal = parts[0] || "";
      var cuit = parts[1] || "--";

      var nameParts = nameLegal.split(' - ');
      var displayName = nameParts[0] || nameLegal;

      providers.push({
        id: id,
        displayName: displayName.trim(),
        legalName: nameParts[1] ? nameParts[1].trim() : displayName.trim(),
        cuit: cuit
      });
    }
  }

  return providers;
}
```

### Parsed Output Example

```javascript
[
  {
    "id": "85574",
    "displayName": "    - ",
    "legalName": "    - ",
    "cuit": "--"
  },
  {
    "id": "136886",
    "displayName": "100000 LAMPARAS SRL",
    "legalName": "100000 LAMPARAS SRL",
    "cuit": "--"
  },
  {
    "id": "77792",
    "displayName": "ASCENSORES SITVER",
    "legalName": "A  ASCENSORES SITVER SA",
    "cuit": "30-68058450-4"
  }
]
```

## Testing Results

### Test Parameters

| selbId | user | valuecuit | Result |
|--------|------|-----------|--------|
| `16528` | admanastopulos@gmail.com | `0` | ✅ Full list of providers |
| `16528` | admanastopulos@gmail.com | (omitted) | ✅ Full list of providers |
| `1` | admanastopulos@gmail.com | `1` | ❌ Empty response |

### Observations

- `selbId` must be a valid building ID in the system
- `valuecuit=0` returns all providers (no CUIT filter)
- Invalid parameter combinations may return empty results

## Use Cases

1. **Populate dropdown** - Get list of available suppliers for a given building
2. **Search provider** - Look up provider ID by name
3. **Get CUIT** - Retrieve CUIT for a specific provider
4. **Validate provider** - Check if a provider exists in the system

## Notes

- Response can be large (100KB+) with many providers
- First option is always a disabled placeholder: "Seleccione un proveedor..."
- Some providers may not have a CUIT (shows `--`)
- Display name and legal name may differ (e.g., "ASCENSORES SITVER" vs "A ASCENSORES SITVER SA")

## JSON Parser

A parser function is available in `parse-providers.js` that converts the HTML response to structured JSON:

```javascript
// Parse the HTML response
const providers = parseProvidersHtmlToJson(htmlResponse);

// Result format:
[
  {
    "id": "85574",
    "displayName": "    - ",
    "legalName": "    - ",
    "cuit": "--"
  },
  {
    "id": "136886",
    "displayName": "100000 LAMPARAS SRL",
    "legalName": "100000 LAMPARAS SRL",
    "cuit": "--"
  },
  {
    "id": "77792",
    "displayName": "ASCENSORES SITVER",
    "legalName": "A  ASCENSORES SITVER SA",
    "cuit": "30-68058450-4"
  }
]
```

### Helper Functions

```javascript
// Filter by CUIT
const matching = filterProvidersByCuit(providers, "30-68058450-4");

// Find by name (fuzzy search)
const provider = findProviderByName(providers, "ASCENSORES");

// Get all unique CUITs
const allCuits = getUniqueCuits(providers);
```

## Usage Example: Compare with Your Database

```javascript
// Get providers from Redconar
const htmlResponse = getProviders(sessionId, 16528);
const redconarProviders = parseProvidersHtmlToJson(htmlResponse);

// Get providers from your database
const myProviders = getProvidersFromMyDatabase();

// Compare and find new/missing providers
const redconarCuits = new Set(redconarProviders.map(p => p.cuit).filter(c => cuit !== '--'));
const myCuits = new Set(myProviders.map(p => p.cuit));

const newInRedconar = [...redconarCuits].filter(c => !myCuits.has(c));
const missingInRedconar = [...myCuits].filter(c => !redconarCuits.has(c));

console.log("New providers in Redconar:", newInRedconar);
console.log("Missing in Redconar:", missingInRedconar);
```

## Related Endpoints

- `01-authorization-phpsessid.md` - Getting the session ID
- `02-endpoint-formsAssistance.md` - OCR for extracting provider from invoice
- `parse-providers.js` - HTML to JSON parser
