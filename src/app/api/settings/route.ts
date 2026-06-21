import { NextResponse } from 'next/server';
import { getKV, setKV } from '@/lib/db';

export async function GET() {
  try {
    const settingsStr = await getKV('peaksender:settings');
    const defaults = {
      panelName: 'ThePeakSMM',
      currency: 'USD ($)',
      maintenance: false,
      timezone: '(GMT+05:30) Mumbai, Kolkata',
      apiUrl: 'https://theroyalsmm.com/api/v2',
      apiKey: '',
      razorpayKey: '',
      razorpaySecret: '',
      paytmMid: '',
      paytmKey: '',
      phonepeUpiId: '2729mohane2729@fam',
      phonepeMerchantName: 'Chetan Mohane',
      usdToInr: '83',
      minDeposit: '10',
      metaTitle: 'ThePeakSMM | Best SMM Panel',
      metaDesc: 'Boost your social media presence instantly.',
      waNumber: '+91 1234567890',
      supportEmail: 'support@thepeaksmm.shop'
    };

    if (settingsStr) {
      const settings = JSON.parse(settingsStr);
      // Migrate if old default is detected
      if (settings.phonepeUpiId === 'paytm.slay1so@pty') {
        settings.phonepeUpiId = '2729mohane2729@fam';
        settings.phonepeMerchantName = 'Chetan Mohane';
        await setKV('peaksender:settings', JSON.stringify(settings));
      }
      return NextResponse.json(settings);
    }
    
    // Save defaults to DB if not initialized
    await setKV('peaksender:settings', JSON.stringify(defaults));
    return NextResponse.json(defaults);
  } catch (e) {
    console.error('GET settings API error:', e);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const settings = await req.json();
    await setKV('peaksender:settings', JSON.stringify(settings));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('POST settings API error:', e);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
