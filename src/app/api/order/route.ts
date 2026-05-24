import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { serviceId, link, quantity } = body;

  if (!serviceId || !link || !quantity) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // --- LIVE SMM PROVIDER INTEGRATION ---
  // To make this work live, you need to plug in your Provider API details below.
  
  const PROVIDER_API_URL = process.env.SMM_PROVIDER_URL || 'https://theroyalsmm.com/api/v2';
  const PROVIDER_API_KEY = process.env.SMM_PROVIDER_KEY || 'YOUR_API_KEY_HERE';

  try {
    /* 
    // UNCOMMENT THIS BLOCK TO ACTIVATE LIVE DELIVERY
    
    const response = await fetch(\`\${PROVIDER_API_URL}?key=\${PROVIDER_API_KEY}&action=add&service=\${serviceId}&link=\${link}&quantity=\${quantity}\`, {
      method: 'POST'
    });
    const data = await response.json();
    
    if (data.order) {
      return NextResponse.json({ 
        success: true, 
        orderId: data.order, 
        message: 'Order placed live on provider!' 
      });
    }
    */

    // MOCK RESPONSE FOR TESTING
    console.log('API Request would be sent to:', PROVIDER_API_URL, 'with key length:', PROVIDER_API_KEY.length);
    console.log('Payload:', { serviceId, link, quantity });

    return NextResponse.json({ 
      success: true, 
      orderId: 'LIVE-' + Math.floor(Math.random() * 100000),
      message: 'Order received! (Connect API in Admin to deliver live)' 
    });

  } catch (error) {
    console.error('SMM API Error:', error);
    return NextResponse.json({ error: 'Failed to connect to SMM provider' }, { status: 500 });
  }
}
