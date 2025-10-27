// In /api/send-email.js
import { createTransport } from 'nodemailer';

// --- IMPORTANT: Add all your allowed domains here ---
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
      const data = req.body;
      
      const transporter = createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT == 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // --- START: New Styled HTML Email Template ---
      const emailHtml = `
        <html lang="bn">
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, 'Hind Siliguri', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              width: 90%;
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border: 1px solid #ddd;
              border-radius: 8px;
              overflow: hidden;
            }
            .header {
              background-color: #16a34a; /* Green */
              color: #ffffff;
              padding: 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .content {
              padding: 30px;
              line-height: 1.6;
              color: #333;
            }
            .content p {
              margin-bottom: 20px;
            }
            .order-id {
              display: inline-block;
              font-size: 18px;
              font-weight: bold;
              color: #d9534f;
              background-color: #f9f9f9;
              padding: 10px 15px;
              border-radius: 5px;
              border: 1px dashed #ddd;
              margin-bottom: 25px;
            }
            .details-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .details-table th, .details-table td {
              padding: 12px;
              border: 1px solid #eee;
              text-align: left;
            }
            .details-table th {
              background-color: #f9f9f9;
              font-weight: 600;
              width: 30%;
            }
            .footer {
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #777;
              background-color: #f9f9f9;
              border-top: 1px solid #eee;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 নতুন অর্ডার পাওয়া গেছে!</h1>
            </div>
            <div class="content">
              <p>আসসালামু আলাইকুম, আপনি একটি নতুন অর্ডার পেয়েছেন:</p>
              
              <div style="text-align: center;">
                <span class="order-id">অর্ডার আইডি: ${data.order_id || 'N/A'}</span>
              </div>
              
              <table class="details-table">
                <tr>
                  <th>ক্রেতার নাম</th>
                  <td>${data.customer_name || 'N/A'}</td>
                </tr>
                <tr>
                  <th>ফোন নাম্বার</th>
                  <td>${data.phone || 'N/A'}</td>
                </tr>
                <tr>
                  <th>ঠিকানা</th>
                  <td>${data.address || 'N/A'}</td>
                </tr>
                <tr>
                  <th>পণ্য</th>
                  <td>${data.product || 'N/A'}</td>
                </tr>
                <tr>
                  <th>সর্বমোট মূল্য</th>
                  <td><strong>${data.total_price || 0} টাকা</strong></td>
                </tr>
                <tr>
                  <th>বিশেষ দ্রষ্টব্য</th>
                  <td>${data.note || 'N/A'}</td>
                </tr>
              </table>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Nawarika. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      // --- END: New Styled HTML Email Template ---

      const mailOptions = {
        from: `"Nawarika Orders" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `🎉 New Order Received - ${data.order_id}`,
        text: `New Order: ${data.order_id}, Customer: ${data.customer_name}, Phone: ${data.phone}, Total: ${data.total_price}`, // Fallback text
        html: emailHtml, // Use the new HTML template
      };

      await transporter.sendMail(mailOptions);
      
      return res.status(200).json({ message: 'Email sent successfully.' });

    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'Failed to send email.', error: error.message });
    }
  }

  res.setHeader('Allow', 'POST');
  return res.status(405).end('Method Not Allowed');
}
