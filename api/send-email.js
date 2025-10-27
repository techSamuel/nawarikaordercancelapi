// In /api/send-email.js
import { createTransport } from 'nodemailer';

// --- IMPORTANT: Update this with your Firebase Hosting URL ---
// (Copied from your cancel-order.js)
const ALLOWED_ORIGIN = '*';

export default async function handler(req, res) {
  // --- CORS Configuration ---
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // --- End CORS Configuration ---

  if (req.method === 'POST') {
    try {
      // 1. Get the order data from the request
      const data = req.body;
      
      // 2. Set up the Nodemailer transporter using Environment Variables
      // These credentials are secure and not visible to the public
      const transporter = createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // 3. Define the email options
      const mailOptions = {
        from: `"Nawarika Orders" <${process.env.SMTP_USER}>`, // Sender address
        to: process.env.ADMIN_EMAIL, // Admin's email from env vars
        subject: `🎉 New Order Received - ${data.order_id}`, // Subject line
        // Plain text body
        text: `
          New Order Received:
          Order ID: ${data.order_id}
          Customer: ${data.customer_name}
          Phone: ${data.phone}
          Address: ${data.address}
          Product: ${data.product}
          Total: ${data.total_price} BDT
          Note: ${data.note}
        `,
        // HTML body for a nicer look in email clients
        html: `
          <h2 style="color: #16a34a;">🎉 New Order Received!</h2>
          <p><strong>Order ID:</strong> ${data.order_id}</p>
          <hr>
          <h3>Customer Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${data.customer_name}</li>
            <li><strong>Phone:</strong> ${data.phone}</li>
            <li><strong>Address:</strong> ${data.address}</li>
          </ul>
          <h3>Order Details:</h3>
          <ul>
            <li><strong>Product:</strong> ${data.product}</li>
            <li><strong>Total Price:</strong> ${data.total_price} BDT</li>
            <li><strong>Note:</strong> ${data.note || 'N/A'}</li>
          </ul>
        `,
      };

      // 4. Send the email
      await transporter.sendMail(mailOptions);
      
      // 5. Send a success response back to the browser
      return res.status(200).json({ message: 'Email sent successfully.' });

    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'Failed to send email.', error: error.message });
    }
  }

  // Handle other methods
  res.setHeader('Allow', 'POST');
  return res.status(405).end('Method Not Allowed');
}
