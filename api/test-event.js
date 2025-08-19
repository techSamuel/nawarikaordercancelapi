// In /api/test-event.js

// This function handles requests to /api/test-event
export default async function handler(req, res) {
  try {
    // Get your secrets from Vercel Environment Variables
    const PIXEL_ID = process.env.PIXEL_ID;
    const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
    const META_API_URL = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events`;

    console.log('Sending a hardcoded test event to Meta...');

    const currentTime = Math.floor(Date.now() / 1000);

    // Prepare a simple, hardcoded payload for the Meta Conversions API
    const payload = {
      data: [{
        event_name: 'TestEvent', // Standard event for testing
        event_time: currentTime,
        action_source: 'other',
        // user_data can be minimal for a simple server-to-server test
        user_data: {
            "em": ["7b17fb0bd173f625b58636fb796407c22b3d16fc78302d79f0fd30c2fc2fc068"],
        },
        custom_data: {
          test_message: 'This is a direct test from my Vercel server.',
        },
      }],
      // Your specific test code provided in the Meta Events Manager
      test_event_code: 'TEST98647',
    };

    // Send the event to Meta's server
    const response = await fetch(`${META_API_URL}?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const responseBody = await response.json();
    if (!response.ok) {
      throw new Error(`Meta API Error: ${JSON.stringify(responseBody)}`);
    }

    console.log('Test event sent successfully:', responseBody);
    // Send a success response back to the browser
    res.status(200).json({ 
        message: 'Test event sent successfully!',
        meta_response: responseBody 
    });

  } catch (error) {
    console.error('Error in test-event function:', error);
    // Send an error response back to the browser
    res.status(500).json({ 
        message: 'Failed to send test event.', 
        error: error.message 
    });
  }
}
