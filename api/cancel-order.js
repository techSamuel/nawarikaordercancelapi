// In /api/cancel-order.js
import { createHash } from 'crypto'; // Import the crypto library for hashing
// --- IMPORTANT: Update this with your Firebase Hosting URL ---
const ALLOWED_ORIGINS = [
  'https://nawarika.olalsoft.com', // Your production domain
  'http://127.0.0.1:5500',          // Your local test server
  'https://nawarika.shop',
  'https://duyasticker.nawarika.shop'// Add any other domains
];

export default async function handler(req, res) {
  // --- CORS Configuration ---
  // This tells the browser to allow requests from your Firebase domain.
  const origin = req.headers.origin;
  // --- Updated CORS Configuration ---
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // The browser sends a "preflight" OPTIONS request first to check CORS.
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // --- End CORS Configuration ---

  if (req.method === 'POST') {
    try {
      const orderData = req.body;
      console.log('Received cancellation request for order:', orderData.orderId);

      const PIXEL_ID = process.env.PIXEL_ID;
      const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
      // ... (The rest of your logic is exactly the same)

      // --- Start Building User Data ---

    // Hashing function for PII
    const hash = (value) => {
      return createHash('sha256').update(value.toLowerCase()).digest('hex');
    };
    
    // Prepare name fields
    const nameParts = orderData.name.trim().split(' ');
    const firstName = nameParts.shift() || ''; // Get the first part as first name
    const lastName = nameParts.join(' ') || '';  // Join the rest as last name

    // Build the user_data object
    const userData = {
      client_ip_address: orderData.ipAddress,
      client_user_agent: orderData.userAgent,
      fbp: orderData.fbp,
      fbc: orderData.fbc,
      ph: hash(orderData.phone.replace(/[^0-9]/g, '')), // Clean and hash phone
      fn: hash(firstName), // Hash first name
      ln: hash(lastName), // Hash last name
    };
    
    // --- End Building User Data ---

      const META_API_URL = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events`;
      // ... etc.

      // --- The entire payload and fetch logic from the previous answer goes here ---
      const currentTime = Math.floor(Date.now() / 1000);
      const payload = {
      data: [{
        event_name: 'Purchase',
        event_time: currentTime,
        action_source: 'other',
        user_data: userData, // Use the complete user_data object here
        custom_data: {
          event_status: 'cancelled',
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
      // ... (handle response and errors)

      return res.status(200).json({ message: 'Event sent successfully.' });

    } catch (error) {
      console.error('Error in serverless function:', error);
      return res.status(500).json({ message: 'Failed to send event.', error: error.message });
    }
  }

  // Handle other methods
  res.setHeader('Allow', 'POST');
  return res.status(405).end('Method Not Allowed');
}
