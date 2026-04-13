exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { to, name } = body;
  if (!to || !name) {
    return { statusCode: 400, body: 'Missing to or name' };
  }

  const firstName = name.split(' ')[0];

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#111;">
      <div style="background:#4f46e5;padding:28px 32px;border-radius:10px 10px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">VerifiMe</h1>
      </div>
      <div style="background:#f9f8ff;padding:32px;border-radius:0 0 10px 10px;border:1px solid #e0e0f7;">
        <p style="font-size:16px;margin-top:0;">Hi ${firstName},</p>
        <p>Thanks for sending the details through. We're setting up your client management portal and need you to step through the process below so we can connect you.</p>
        <p>To onboard, please follow the steps below and have one of the following required documents handy:</p>
        <ol style="padding-left:20px;">
          <li style="margin-bottom:6px;">Front and back of a current Australian driver's licence (or foreign equivalent)</li>
          <li>Passport</li>
        </ol>
        <hr style="border:none;border-top:1px solid #e0e0f7;margin:24px 0;" />
        <p><strong>Step 1 — Access the portal</strong></p>
        <p style="margin-top:-8px;">
          <a href="https://id.verifime.com" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">VerifiMe Client Portal →</a>
        </p>
        <ul style="padding-left:20px;margin-top:12px;">
          <li>Enter your <strong>work email address</strong> (not personal email).</li>
          <li>Open the email from VerifiMe and click the <strong>"Verify Email"</strong> button.</li>
        </ul>
        <p><strong>Step 2 — Provide identity credentials</strong></p>
        <ul style="padding-left:20px;margin-top:-8px;">
          <li>Enter your name, date of birth, and address.</li>
          <li>Upload one identity document (e.g., driver's licence or passport).</li>
          <li>Complete a face check to confirm your identity.</li>
        </ul>
        <p><strong>Step 3 — Share your verification status &amp; secure your account</strong></p>
        <ul style="padding-left:20px;margin-top:-8px;">
          <li>Submit and share your verification status transacting as an individual.</li>
          <li>Then, as you will be the admin: secure your VerifiMe ID account by adding an <strong>authenticator or passkey</strong>. You must do this final step to allow us to connect you to the management portal.</li>
        </ul>
        <hr style="border:none;border-top:1px solid #e0e0f7;margin:24px 0;" />
        <p style="color:#6b7280;font-size:14px;">This process typically takes about 5 minutes to complete. Let us know if you have any questions.</p>
        <p style="margin-bottom:0;">Cheers,<br/><strong>The VerifiMe Team</strong></p>
      </div>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'VerifiMe <onboarding@resend.dev>',
        to: [to],
        subject: 'Complete your VerifiMe onboarding',
        html
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Resend error');

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
