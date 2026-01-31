/**
 * Parse Redconar Providers HTML Response to JSON
 *
 * This function parses the HTML <option> response from ajaxScriptProviders.php
 * into a structured JSON array of provider objects.
 *
 * @param {string} htmlResponse - The raw HTML response from the endpoint
 * @returns {Array<Object>} Array of provider objects with id, displayName, legalName, cuit
 */

function parseProvidersHtmlToJson(htmlResponse) {
  const providers = [];

  // Extract all <option> tags using regex
  const optionRegex = /<option[^>]*value=['"]([^'"]*)['"][^>]*>([^<]*)<\/option>/g;
  let match;

  while ((match = optionRegex.exec(htmlResponse)) !== null) {
    const id = match[1];
    const text = match[2].trim();

    // Skip the disabled placeholder option
    if (!id || text === 'Seleccione un proveedor...') {
      continue;
    }

    // Parse the text format: "DISPLAY NAME - LEGAL NAME |  CUIT" or "NAME |  CUIT"
    let displayName = text;
    let legalName = text;
    let cuit = '--';

    // Check if CUIT separator exists
    if (text.includes(' |  ')) {
      const parts = text.split(' |  ');
      const namePart = parts[0] || '';
      cuit = parts[1] || '--';

      // Further split by " - " to separate display name from legal name
      if (namePart.includes(' - ')) {
        const nameParts = namePart.split(' - ');
        displayName = nameParts[0].trim();
        legalName = nameParts.slice(1).join(' - ').trim();
      } else {
        displayName = namePart.trim();
        legalName = namePart.trim();
      }
    }

    providers.push({
      id: id,
      displayName: displayName,
      legalName: legalName,
      cuit: cuit
    });
  }

  return providers;
}

/**
 * Filter providers by CUIT
 * @param {Array<Object>} providers - Array of provider objects
 * @param {string} cuit - CUIT to filter by (can include dashes or not)
 * @returns {Array<Object>} Filtered providers
 */
function filterProvidersByCuit(providers, cuit) {
  const normalizedCuit = cuit.replace(/-/g, '');
  return providers.filter(p => p.cuit.replace(/-/g, '') === normalizedCuit);
}

/**
 * Find provider by name (fuzzy search)
 * @param {Array<Object>} providers - Array of provider objects
 * @param {string} name - Name to search for
 * @returns {Object|null} Matching provider or null
 */
function findProviderByName(providers, name) {
  const normalizedName = name.toLowerCase().trim();
  return providers.find(p =>
    p.displayName.toLowerCase().includes(normalizedName) ||
    p.legalName.toLowerCase().includes(normalizedName)
  ) || null;
}

/**
 * Get all unique CUITs from providers list
 * @param {Array<Object>} providers - Array of provider objects
 * @returns {Array<string>} Array of unique CUITs
 */
function getUniqueCuits(providers) {
  const cuits = new Set();
  providers.forEach(p => {
    if (p.cuit && p.cuit !== '--') {
      cuits.add(p.cuit);
    }
  });
  return Array.from(cuits).sort();
}

// Export for Node.js (if using modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseProvidersHtmlToJson,
    filterProvidersByCuit,
    findProviderByName,
    getUniqueCuits
  };
}
