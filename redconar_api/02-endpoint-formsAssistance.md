# Redconar API - Endpoint: formsAssistance.php

## Overview

This endpoint performs OCR (Optical Character Recognition) on receipt/voucher images (PDF, JPG, JPEG) and extracts structured data such as supplier name, invoice number, CUITs, and amounts.

## Endpoint Details

| Property | Value |
|----------|-------|
| **URL** | `https://www.redconar.net/ajax/egresos/recognizingOutflows/formsAssistance.php` |
| **Method** | `POST` |
| **Content-Type** | `multipart/form-data` |
| **Authentication** | Requires valid `PHPSESSID` cookie |

## Request Format

### Headers

```javascript
headers: {
  "Cookie": "PHPSESSID=" + sessionId
}
```

### Body (multipart/form-data)

| Field | Type | Description |
|-------|------|-------------|
| `file_img` | File | The image/PDF file to process |

### Supported File Types

- PDF (`.pdf`)
- JPEG (`.jpg`, `.jpeg`)

## Request Example (Google Apps Script)

```javascript
function uploadFileForOCR(file, sessionId) {
  var uploadUrl = "https://www.redconar.net/ajax/egresos/recognizingOutflows/formsAssistance.php";
  var fileName = file.getName();
  var fileBlob = file.getBlob();

  // Multipart boundary
  var boundary = "----WebKitFormBoundaryHy16NXxd5RQKWJJc";

  // Build multipart payload
  var payloadParts = [
    "--" + boundary + "\r\n" +
    "Content-Disposition: form-data; name=\"file_img\"; filename=\"" + fileName + "\"\r\n" +
    "Content-Type: " + fileBlob.getContentType() + "\r\n\r\n",
    fileBlob.getBytes(),
    "\r\n--" + boundary + "--\r\n"
  ];

  var payload = Utilities.newBlob(payloadParts[0]).getBytes()
    .concat(payloadParts[1])
    .concat(Utilities.newBlob(payloadParts[2]).getBytes());

  var options = {
    method: "post",
    contentType: "multipart/form-data; boundary=" + boundary,
    headers: {
      "Cookie": "PHPSESSID=" + sessionId
    },
    payload: payload
  };

  var response = UrlFetchApp.fetch(uploadUrl, options);
  return response.getContentText();
}
```

## Response Format

### Success Response

The API returns a nested array structure:

```json
[
  "0",
  {
    "cuit_emisor": "30-715689770-0",
    "cuit_destinatario": "30-718413377-7",
    "descripcion": "131-mortimer,107- guante mapa,279- rejilla migitorio",
    "fecha": "08-07-2025",
    "monto_total": 306820.92,
    "numero": "00003-00002916",
    "proveedor": "GS CLEANING SRL",
    "tipo": "factura",
    "nombreConsorcio": "",
    "direccionConsorcio": " "
  }
]
```

### Error Response

When OCR fails or cannot process the file:

```json
[
  "1",
  "Error message describing the issue"
]
```

### Response Structure

| Index | Type | Description |
|-------|------|-------------|
| `[0]` | string | Status code: `"0"` = success, `"1"` = error |
| `[1]` | object/string | On success: object with extracted data; On error: error message |

## Extracted Data Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `proveedor` | string | Supplier name (preferred field) | `"GS CLEANING SRL"` |
| `numero` | string | Invoice number (full format, includes point of sale) | `"00003-00002916"` |
| `cuit_emisor` | string | Sender's CUIT (tax ID) | `"30-715689770-0"` |
| `cuit_destinatario` | string | Recipient's CUIT | `"30-718413377-7"` |
| `fecha` | string | Invoice date (DD-MM-YYYY) | `"08-07-2025"` |
| `monto_total` | number | Total amount | `306820.92` |
| `tipo` | string | Document type | `"factura"` |
| `descripcion` | string | Line item descriptions | `"131-mortimer,107- guante mapa..."` |
| `nombreConsorcio` | string | Consorcium name (if applicable) | `""` |
| `direccionConsorcio` | string | Consorcium address (if applicable) | `" "` |

### Legacy Fields (May Not Be Present)

- `nombre_proveedor` - Old field name for supplier (use `proveedor` instead)
- `punto_de_venta` - Point of sale (now included in `numero`)

## Parsing the Response

```javascript
function parseOCRResponse(responseText) {
  var parsedData = JSON.parse(responseText);

  // Check for error response
  if (Array.isArray(parsedData) && parsedData.length > 1) {
    if (parsedData[0] !== "0") {
      throw new Error("API Error: " + parsedData[1]);
    }
    parsedData = parsedData[1]; // Extract the actual data
  }

  // Extract fields with fallbacks
  var result = {
    proveedor: parsedData.proveedor || parsedData.nombre_proveedor || "S-P",
    numero: parsedData.numero || "S-F",
    cuitEmisor: parsedData.cuit_emisor || "N-A",
    cuitDestinatario: parsedData.cuit_destinatario || "N-A",
    fecha: parsedData.fecha || null,
    montoTotal: parsedData.monto_total || null,
    tipo: parsedData.tipo || null
  };

  return result;
}
```

## Testing with cURL

```bash
# First, obtain PHPSESSID (see 01-authorization-phpsessid.md)
# Then:

curl -X POST 'https://www.redconar.net/ajax/egresos/recognizingOutflows/formsAssistance.php' \
  -H 'Cookie: PHPSESSID=YOUR_SESSION_ID_HERE' \
  -F 'file_img=@/path/to/your/file.pdf'
```

## Error Handling

| Error Code | Description | Recommended Action |
|------------|-------------|-------------------|
| `1` | Generic error | Check error message in `[1]` |
| JSON parse error | Invalid response format | Log raw response for debugging |
| Missing fields | OCR couldn't extract data | Mark file as "S-P" (sin proveedor) or "S-F" (sin factura) |

## Usage Notes

- The `numero` field includes the point of sale prefix (e.g., `"00003-00002916"`)
- The `proveedor` field may contain punctuation that should be removed for file naming
- Empty or null fields should be handled with fallback values
- Response format changed over time - check for both `proveedor` and legacy `nombre_proveedor`

## Related Files

- `renombrar-comprobantes/procesar_comprobantes_IA.js` - Production implementation
- `renombrar-comprobantes/funciones_varias.js` - Single file test function
