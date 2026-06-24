/**
 * HubSpot Integration Mock Utility
 * In a production environment, this would call the HubSpot API through a secure Next.js API Route
 * using the HubSpot Company API: GET https://api.hubapi.com/companies/v2/companies/{companyId}
 */

export interface HubSpotCompanyData {
  nombreComercial: string;
  razonSocial?: string;
  pais: string;
  ciudadEstado: string;
  contactoNombre?: string;
  contactoPuesto?: string;
  contactoEmail?: string;
  contactoTelefono?: string;
  hubspotId: string;
}

// Extract company ID from a HubSpot URL or return the ID directly.
// Example: https://app.hubspot.com/contacts/1234567/company/987654321
// Example 2: https://app.hubspot.com/contacts/1234567/record/0-2/987654321
export function parseHubSpotCompanyId(input: string): string {
  const trimmed = input.trim();
  
  // 1. Match modern record format (/record/0-2/123456)
  const recordRegex = /\/record\/0-2\/(\d+)/i;
  const recordMatch = trimmed.match(recordRegex);
  if (recordMatch && recordMatch[1]) {
    return recordMatch[1];
  }
  
  // 2. Match older format (/company/123456)
  const companyRegex = /\/company\/(\d+)/i;
  const companyMatch = trimmed.match(companyRegex);
  if (companyMatch && companyMatch[1]) {
    return companyMatch[1];
  }

  // 3. Generic record pattern /record/[X-Y]/ID
  const genericRecordRegex = /\/record\/[a-z0-9_-]+\/(\d+)/i;
  const genericMatch = trimmed.match(genericRecordRegex);
  if (genericMatch && genericMatch[1]) {
    return genericMatch[1];
  }

  // 4. Extract last numeric segment if it's a URL
  if (trimmed.includes("http://") || trimmed.includes("https://") || trimmed.includes("app.hubspot.com")) {
    const cleanUrl = trimmed.split(/[?#]/)[0];
    const segments = cleanUrl.split("/");
    for (let i = segments.length - 1; i >= 0; i--) {
      if (/^\d+$/.test(segments[i])) {
        return segments[i];
      }
    }
  }
  
  // Return input directly if it looks like a clean ID
  return trimmed;
}

const MOCK_HUBSPOT_DB: Record<string, Omit<HubSpotCompanyData, 'hubspotId'>> = {
  "987654321": {
    nombreComercial: "Apex Extrusions North America",
    razonSocial: "Apex Extrusion Systems LLC",
    pais: "Estados Unidos",
    ciudadEstado: "Chicago, Illinois",
    contactoNombre: "Sarah Connor",
    contactoPuesto: "Procurement Manager",
    contactoEmail: "sconnor@apexextrusion.com",
    contactoTelefono: "+1 312 555 0199"
  },
  "938202": {
    nombreComercial: "AluTech Alemania GmbH",
    razonSocial: "AluTech Deutschland GmbH",
    pais: "Alemania",
    ciudadEstado: "Stuttgart, Baden-Württemberg",
    contactoNombre: "Hans Müller",
    contactoPuesto: "Technical Director",
    contactoEmail: "h.mueller@alutech.de",
    contactoTelefono: "+49 711 123456"
  },
  "555444": {
    nombreComercial: "Sistemas de Extrusión del Bajío",
    razonSocial: "Sistemas de Extrusión del Bajío SA de CV",
    pais: "México",
    ciudadEstado: "Querétaro, Qro.",
    contactoNombre: "Ing. Roberto Garza",
    contactoPuesto: "Gerente de Mantenimiento",
    contactoEmail: "rgarza@extrusionesbajio.mx",
    contactoTelefono: "+52 442 890 1234"
  }
};

export async function fetchHubSpotCompany(idOrUrl: string): Promise<HubSpotCompanyData | null> {
  const companyId = parseHubSpotCompanyId(idOrUrl);
  if (!companyId) return null;

  // 1. Try to fetch from real API proxy first
  try {
    const res = await fetch(`/api/hubspot/company?id=${companyId}`);
    if (res.ok) {
      const result = await res.json();
      if (result && !result.isMock && result.data) {
        return result.data;
      }
    }
  } catch (e) {
    console.warn("HubSpot API proxy not reachable or failed, falling back to mock data.", e);
  }

  // 2. Simulate network delay for mock
  await new Promise(resolve => setTimeout(resolve, 800));

  // Check if we have this specific mock ID
  const cleanId = companyId.replace(/[^0-9]/g, ""); // extract digits
  
  if (MOCK_HUBSPOT_DB[cleanId]) {
    return {
      ...MOCK_HUBSPOT_DB[cleanId],
      hubspotId: companyId
    };
  }

  // Generate a realistic random company for demo purposes if ID doesn't exist in our hardcoded DB
  const randomSuffix = cleanId || Math.floor(Math.random() * 1000000).toString();
  const countries = ["México", "Estados Unidos", "España", "India", "Alemania", "Australia"];
  const selectedCountry = countries[Math.floor(Math.random() * countries.length)];
  
  let city = "Monterrey, NL";
  if (selectedCountry === "Estados Unidos") city = "Houston, Texas";
  if (selectedCountry === "España") city = "Barcelona, Cataluña";
  if (selectedCountry === "India") city = "Mumbai, Maharashtra";
  if (selectedCountry === "Alemania") city = "Munich, Bavaria";
  if (selectedCountry === "Australia") city = "Sydney, NSW";

  return {
    nombreComercial: `Extrusiones Globales #${randomSuffix}`,
    razonSocial: selectedCountry === "México" ? `Extrusiones Globales SA de CV` : undefined,
    pais: selectedCountry,
    ciudadEstado: city,
    contactoNombre: "Contacto HubSpot Demo",
    contactoPuesto: "Gerente General",
    contactoEmail: `contacto@globalextrusion${randomSuffix}.com`,
    contactoTelefono: "+52 81 1234 5678",
    hubspotId: companyId
  };
}
