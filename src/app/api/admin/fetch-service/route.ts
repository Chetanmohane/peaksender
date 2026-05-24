import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const providerId = body.providerId;
    const apiKey = body.apiKey;
    const apiUrl = body.apiUrl;
    
    if (!providerId || !apiKey || !apiUrl) {
      return NextResponse.json({ 
        error: "Missing credentials or ID. Please save your API Key in Settings first." 
      }, { status: 400 });
    }

    const fullUrl = apiUrl + "?key=" + apiKey + "&action=services";
    const response = await fetch(fullUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: "Provider returned error: " + response.status }, { status: 500 });
    }

    const services = await response.json();

    if (!Array.isArray(services)) {
      return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
    }

    const targetService = services.find((s) => String(s.service) === String(providerId));

    if (!targetService) {
      return NextResponse.json({ error: "Service ID not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      service: {
        name: targetService.name,
        category: targetService.category,
        rate: targetService.rate,
        type: targetService.type,
        min: targetService.min,
        max: targetService.max,
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
