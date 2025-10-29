// In /api/send-purchase-event.js
import { createHash } from 'crypto';

// --- IMPORTANT: Use the same list as your other API files ---
const ALLOWED_ORIGINS = [
  'https://nawarika.olalsoft.com', // Your production domain
  'http://127.0.0.1:5500',          // Your local test server
  'https://nawarika.shop',
  'https://duyasticker.nawarika.shop'// Add any other domains
];

export default async function handler(req, res) {
  const origin = req.headers.origin;

  // --- Updated CORS Configuration ---
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // --- End CORS Configuration ---

  if (req.method === 'POST') {
    try {
      const orderData = req.body;
      console.log('Received NEW purchase event for order:', orderData.orderId);

      // Make sure PIXEL_ID and ACCESS_TOKEN are set in Vercel
      const PIXEL_ID = process.env.PIXEL_ID;
      const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

      // --- Start Building User Data (Copied from your cancel-order.js) ---
      const hash = (value) => {
        if (!value) return undefined;
        return createHash('sha256').update(value.toLowerCase()).digest('hex');
      };
      
      const nameParts = orderData.name.trim().split(' ');
      const firstName = nameParts.shift() || '';
      const lastName = nameParts.join(' ') || '';

      const userData = {
        client_ip_address: orderData.ipAddress,
        client_user_agent: orderData.userAgent,
        fbp: orderData.fbp || undefined,
        fbc: orderData.fbc || undefined,
        ph: hash(orderData.phone.replace(/[^0-9]/g, '')),
        fn: hash(firstName),
        ln: hash(lastName),
      };
      // --- End Building User Data ---

      const META_API_URL = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events`;
      
      const currentTime = Math.floor(Date.now() / 1000);
      const payload = {
        data: [{
          event_name: 'Purchase',
          event_time: currentTime,
          event_id: orderData.orderId,
          action_source: 'website', // Changed from 'other' to 'website'
          user_data: userData,
          custom_data: {
            // --- THIS IS THE KEY CHANGE ---
            // 'event_status' is removed, as this is a new purchase
            order_id: orderData.orderId,
            value: orderData.totalPrice,
            currency: 'BDT',
          },
        }],
      };
      
      const response = await fetch(`${META_API_URL}?access_token=${ACCESS_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Meta API Error:', errorData);
        throw new Error(`Failed to send event to Meta: ${errorData.error.message}`);
      }
      
      const responseData = await response.json();
      console.log('Meta API Success (New Purchase):', responseData);
      
      return res.status(200).json({ message: 'CAPI Purchase event sent successfully.' });

    } catch (error) {
      console.error('Error in send-purchase-event function:', error);
      return res.status(500).json({ message: 'Failed to send event.', error: error.message });
    }
  }

  // Handle other methods
  res.setHeader('Allow', 'POST');
  return res.status(405).end('Method Not Allowed');
}
