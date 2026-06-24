import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'HubSpot Company ID is required' }, { status: 400 });
  }

  const token = process.env.HUBSPOT_ACCESS_TOKEN;

  if (!token) {
    // Return indicating we are in mock mode since no API token is configured
    return NextResponse.json({ isMock: true });
  }

  try {
    // Fetch from HubSpot CRM API v3 (Companies object)
    // We request standard properties like name, country, city, state, domain, phone, etc.
    const response = await fetch(
      `https://api.hubapi.com/crm/v3/objects/companies/${id}?properties=name,name_commercial,razon_social,country,city,state,domain,phone`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.message || `HubSpot API returned status ${response.status}` },
        { status: response.status }
      );
    }

    const hubspotData = await response.json();
    const props = hubspotData.properties || {};

    // Map HubSpot CRM properties to our local Empresa schema
    return NextResponse.json({
      isMock: false,
      data: {
        nombreComercial: props.name_commercial || props.name || `Empresa HubSpot #${id}`,
        razonSocial: props.razon_social || undefined,
        pais: props.country || 'México',
        ciudadEstado: props.state ? `${props.city || ''}, ${props.state}`.trim() : (props.city || ''),
        contactoNombre: 'Contacto HubSpot',
        contactoPuesto: 'Importado de HubSpot',
        contactoEmail: props.domain ? `info@${props.domain}` : undefined,
        contactoTelefono: props.phone || undefined,
        hubspotId: id,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error while connecting to HubSpot API' },
      { status: 500 }
    );
  }
}
