// In /api/cancel-order.js

// --- IMPORTANT: Update this with your Firebase Hosting URL ---
const ALLOWED_ORIGIN = 'https://nawarika.olalsoft.com';

export default async function handler(req, res) {
  // --- CORS Configuration ---
  // This tells the browser to allow requests from your Firebase domain.
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
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

      const META_API_URL = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events`;
      // ... etc.

      // --- The entire payload and fetch logic from the previous answer goes here ---
      const currentTime = Math.floor(Date.now() / 1000);
      const payload = {
        data: [{
          event_name: 'Purchase',
          event_time: currentTime,
          action_source: 'other',
          user_data: { /* ... user data ... */ },
          custom_data: { event_status: 'cancelled', /* ... custom data ... */ },
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
