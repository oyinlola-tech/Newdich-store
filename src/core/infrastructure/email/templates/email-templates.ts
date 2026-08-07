export interface EmailLayoutOptions {
  title: string;
  preview?: string;
  cta?: { label: string; url: string } | null;
  ctaLabel?: string;
}

const BRAND = '#1f4b99';
const ACCENT = '#d1962f';
const INK = '#12141a';
const MUTED = '#5a6270';
const BG = '#f4f6f9';
const BORDER = '#e2e7f0';
const RADIUS = '14px';

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatNaira(value: number | string): string {
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `₦${num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function layout({ title, cta, ctaLabel }: EmailLayoutOptions, content: string): string {
  const ctaButton =
    cta && cta.url
      ? `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 26px 0 8px;">
        <tr>
          <td align="center">
            <a href="${escapeHtml(cta.url)}" style="
              display: inline-block;
              background: linear-gradient(135deg, ${BRAND}, #2d67d1);
              color: #ffffff;
              text-decoration: none;
              font-family: 'Manrope', Arial, sans-serif;
              font-weight: 700;
              font-size: 15px;
              letter-spacing: 0.3px;
              padding: 13px 34px;
              border-radius: 999px;
              box-shadow: 0 10px 22px rgba(31, 75, 153, 0.28);
            ">${escapeHtml(cta.label ?? ctaLabel ?? 'Take action')}</a>
          </td>
        </tr>
      </table>`
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<title>${escapeHtml(title)}</title>
</head>
<body style="
  margin: 0;
  padding: 0;
  background-color: ${BG};
  background-image: radial-gradient(circle at top left, rgba(31,75,153,0.08), transparent 45%),
                    radial-gradient(circle at 85% 20%, rgba(209,150,47,0.08), transparent 40%);
  font-family: 'Manrope', Arial, Helvetica, sans-serif;
  color: ${INK};
  -webkit-font-smoothing: antialiased;
">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px;" cellpadding="0" cellspacing="0">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 12px 0 20px;">
              <span style="
                font-family: 'Space Grotesk', Arial, sans-serif;
                font-size: 24px;
                font-weight: 700;
                color: ${BRAND};
                letter-spacing: -0.3px;
              ">NEWDICH<span style="color: ${ACCENT};">.</span></span>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="
              background: #ffffff;
              border: 1px solid ${BORDER};
              border-radius: ${RADIUS};
              box-shadow: 0 18px 40px rgba(17, 24, 39, 0.10);
              overflow: hidden;
            ">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="height: 6px; background: linear-gradient(90deg, ${BRAND}, ${ACCENT});"></td>
                </tr>
                <tr>
                  <td style="padding: 34px 36px 28px;">
                    <h1 style="
                      margin: 0 0 6px;
                      font-family: 'Space Grotesk', Arial, sans-serif;
                      font-size: 24px;
                      color: ${INK};
                      letter-spacing: -0.2px;
                    ">${escapeHtml(title)}</h1>
                    <div style="
                      width: 56px;
                      height: 4px;
                      border-radius: 999px;
                      background: ${ACCENT};
                      margin-bottom: 20px;
                    "></div>
                    <div style="font-size: 15px; line-height: 1.7; color: #2a2f3a;">
                      ${content}
                    </div>
                    ${ctaButton}
                    <p style="
                      margin-top: 26px;
                      font-size: 12.5px;
                      color: ${MUTED};
                      line-height: 1.6;
                    ">If the button above does not work, copy and paste this link into your browser:<br>
                    <span style="color: ${BRAND}; word-break: break-all;">${escapeHtml(cta?.url ?? '')}</span></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 24px 16px 8px;">
              <p style="margin: 0 0 6px; font-size: 13px; color: ${MUTED};">
                Newdich Store &middot; Quality products, delivered to you.
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                You received this email because you have an account or placed an order with Newdich Store.
                <br>If this was not you, please ignore this email or contact
                <a href="mailto:support@newdich.com" style="color: ${BRAND}; text-decoration: none;">support@newdich.com</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ============================================================
// Template builders
// ============================================================

export function welcomeEmail(userName: string, storeName = 'Newdich Store'): string {
  const content = `
    <p>Hello ${escapeHtml(userName)},</p>
    <p>Welcome to <strong>${escapeHtml(storeName)}</strong>! We are thrilled to have you on board.</p>
    <p>Your account has been created successfully. You can now explore our catalogue, save items to your wishlist and enjoy a seamless checkout experience.</p>
    <p style="margin-bottom: 4px;">Here is what you can do next:</p>
    <ul style="margin: 10px 0 0; padding-left: 20px; color: #2a2f3a;">
      <li>Complete your profile for faster checkout</li>
      <li>Browse our latest products and offers</li>
      <li>Add your favourite items to your wishlist</li>
    </ul>`;
  return layout({ title: 'Welcome to Newdich Store', cta: { label: 'Start shopping', url: `${storeFrontUrl()}` } }, content);
}

export function otpEmail(userName: string, code: string, minutes: number, purpose: string): string {
  const purposeLabel = purpose === 'login' ? 'sign in' : purpose === 'register' ? 'account verification' : purpose === 'admin_login' ? 'admin sign in' : 'reset your password';
  const content = `
    <p>Hello ${escapeHtml(userName)},</p>
    <p>Use the code below to ${escapeHtml(purposeLabel)}. This code expires in <strong>${minutes} minutes</strong>.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 22px 0;">
      <tr>
        <td align="center" style="
          background: ${BG};
          border: 2px dashed ${ACCENT};
          border-radius: ${RADIUS};
          padding: 18px 12px;
          font-family: 'Space Grotesk', Arial, sans-serif;
          font-size: 34px;
          font-weight: 700;
          letter-spacing: 10px;
          color: ${BRAND};
        ">${escapeHtml(code)}</td>
      </tr>
    </table>
    <p style="font-size: 13.5px; color: ${MUTED};">If you did not request this code, you can safely ignore this email. Someone may have entered your email by mistake.</p>`;
  return layout({ title: 'Your one-time verification code' }, content);
}

export function loginAlertEmail(userName: string, ip: string, userAgent: string, location: string): string {
  const content = `
    <p>Hello ${escapeHtml(userName)},</p>
    <p>We noticed a new sign-in to your <strong>Newdich Store</strong> account.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 16px 0; background: ${BG}; border: 1px solid ${BORDER}; border-radius: 10px;">
      <tr><td style="padding: 12px 16px; font-size: 14px;"><strong>Date:</strong> ${escapeHtml(new Date().toISOString())}</td></tr>
      <tr><td style="padding: 0 16px 12px; font-size: 14px;"><strong>IP address:</strong> ${escapeHtml(ip)}</td></tr>
      <tr><td style="padding: 0 16px 12px; font-size: 14px;"><strong>Device:</strong> ${escapeHtml(userAgent)}</td></tr>
      <tr><td style="padding: 0 16px 12px; font-size: 14px;"><strong>Location:</strong> ${escapeHtml(location)}</td></tr>
    </table>
    <p>If this was you, no action is needed. If you do not recognise this sign-in, please change your password immediately and contact support.</p>`;
  return layout({
    title: 'New sign-in detected on your account',
    cta: { label: 'Review my account', url: `${storeFrontUrl()}/pages/account.html` }
  }, content);
}

export function passwordChangedEmail(userName: string): string {
  const content = `
    <p>Hello ${escapeHtml(userName)},</p>
    <p>Your <strong>Newdich Store</strong> account password was just changed.</p>
    <p style="color: ${MUTED}; font-size: 14px;">If you made this change, you are all set. If you did not, please reset your password immediately and contact our support team.</p>`;
  return layout({ title: 'Your password has been changed', cta: { label: 'Reset password', url: `${storeFrontUrl()}/auths/reset-password.html` } }, content);
}

export function passwordResetEmail(userName: string, resetUrl: string): string {
  const content = `
    <p>Hello ${escapeHtml(userName)},</p>
    <p>We received a request to reset the password for your <strong>Newdich Store</strong> account.</p>
    <p>Click the button below to choose a new password. This link expires in <strong>30 minutes</strong>.</p>`;
  return layout({ title: 'Reset your password', cta: { label: 'Reset password', url: resetUrl } }, content);
}

export function orderConfirmationEmail(input: {
  userName: string;
  orderNumber: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  placedAt: Date;
  shippingAddress?: string;
}): string {
  const itemRows = input.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid ${BORDER}; font-size: 14px; color: #2a2f3a;">${escapeHtml(item.name)} &times; ${item.quantity}</td>
        <td style="padding: 10px 0; border-bottom: 1px solid ${BORDER}; font-size: 14px; text-align: right; color: #2a2f3a;">${formatNaira(item.price * item.quantity)}</td>
      </tr>`
    )
    .join('');

  const discountRow =
    input.discountAmount > 0
      ? `<tr><td style="padding: 8px 0; font-size: 14px; color: ${MUTED};">Discount</td><td style="padding: 8px 0; font-size: 14px; text-align: right; color: #16a34a;">-${formatNaira(input.discountAmount)}</td></tr>`
      : '';

  const content = `
    <p>Hello ${escapeHtml(input.userName)},</p>
    <p>Thank you for your order! Your order <strong>#${escapeHtml(input.orderNumber)}</strong> has been received and is being processed.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 18px 0; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 8px 0; border-bottom: 2px solid ${BRAND}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: ${MUTED};">Item</th>
          <th style="text-align: right; padding: 8px 0; border-bottom: 2px solid ${BRAND}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: ${MUTED};">Total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 4px 0 0; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; font-size: 14px; color: ${MUTED};">Subtotal</td><td style="padding: 6px 0; font-size: 14px; text-align: right; color: #2a2f3a;">${formatNaira(input.subtotal)}</td></tr>
      <tr><td style="padding: 6px 0; font-size: 14px; color: ${MUTED};">Shipping</td><td style="padding: 6px 0; font-size: 14px; text-align: right; color: #2a2f3a;">${formatNaira(input.shippingAmount)}</td></tr>
      <tr><td style="padding: 6px 0; font-size: 14px; color: ${MUTED};">Tax</td><td style="padding: 6px 0; font-size: 14px; text-align: right; color: #2a2f3a;">${formatNaira(input.taxAmount)}</td></tr>
      ${discountRow}
      <tr>
        <td style="padding: 12px 0 0; font-size: 16px; font-weight: 700; color: ${INK}; border-top: 2px solid ${BORDER};">Total</td>
        <td style="padding: 12px 0 0; font-size: 16px; font-weight: 700; color: ${BRAND}; text-align: right; border-top: 2px solid ${BORDER};">${formatNaira(input.total)}</td>
      </tr>
    </table>
    ${input.shippingAddress ? `<p style="margin-top: 16px; font-size: 13.5px; color: ${MUTED};"><strong>Shipping to:</strong> ${escapeHtml(input.shippingAddress)}</p>` : ''}
    <p style="margin-top: 14px; font-size: 13.5px; color: ${MUTED};">Placed on ${escapeHtml(formatDate(input.placedAt))}. You will receive a confirmation once your payment is verified and another once your order ships.</p>`;
  return layout({
    title: 'Order confirmation & receipt',
    cta: { label: 'Track my order', url: `${storeFrontUrl()}/pages/order-confirmation.html?order=${input.orderNumber}` }
  }, content);
}

export function paymentReceiptEmail(input: { userName: string; orderNumber: string; amount: number; method: string; reference: string; paidAt: Date }): string {
  const content = `
    <p>Hello ${escapeHtml(input.userName)},</p>
    <p>We have received your payment of <strong style="color: ${BRAND}; font-size: 17px;">${formatNaira(input.amount)}</strong> for order <strong>#${escapeHtml(input.orderNumber)}</strong>.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 18px 0; background: ${BG}; border: 1px solid ${BORDER}; border-radius: 10px;">
      <tr><td style="padding: 12px 16px; font-size: 14px;"><strong>Order:</strong> #${escapeHtml(input.orderNumber)}</td></tr>
      <tr><td style="padding: 0 16px 12px; font-size: 14px;"><strong>Amount paid:</strong> ${formatNaira(input.amount)}</td></tr>
      <tr><td style="padding: 0 16px 12px; font-size: 14px;"><strong>Method:</strong> ${escapeHtml(input.method)}</td></tr>
      <tr><td style="padding: 0 16px 12px; font-size: 14px;"><strong>Reference:</strong> ${escapeHtml(input.reference)}</td></tr>
      <tr><td style="padding: 0 16px 12px; font-size: 14px;"><strong>Date:</strong> ${escapeHtml(formatDate(input.paidAt))}</td></tr>
    </table>
    <p style="font-size: 13.5px; color: ${MUTED};">Keep this receipt for your records. We will notify you when your order ships.</p>`;
  return layout({ title: 'Payment received — thank you!' }, content);
}

export function paymentFailedEmail(input: { userName: string; orderNumber: string; amount: number; reference: string }): string {
  const content = `
    <p>Hello ${escapeHtml(input.userName)},</p>
    <p>Unfortunately, the payment of <strong>${formatNaira(input.amount)}</strong> for order <strong>#${escapeHtml(input.orderNumber)}</strong> (reference: ${escapeHtml(input.reference)}) could not be completed.</p>
    <p>Your order is still reserved. Please retry payment using the button below to complete your purchase.</p>`;
  return layout({
    title: 'Payment failed — action required',
    cta: { label: 'Retry payment', url: `${storeFrontUrl()}/pages/checkout.html` }
  }, content);
}

export function orderStatusEmail(input: { userName: string; orderNumber: string; status: string }): string {
  const content = `
    <p>Hello ${escapeHtml(input.userName)},</p>
    <p>Your order <strong>#${escapeHtml(input.orderNumber)}</strong> has been updated to: <strong style="color: ${BRAND}; text-transform: uppercase;">${escapeHtml(input.status)}</strong>.</p>
    <p>We will keep you posted on every change. Thank you for shopping with Newdich Store!</p>`;
  return layout({ title: `Order update: ${escapeHtml(input.status)}`, cta: { label: 'View order', url: `${storeFrontUrl()}/pages/order-confirmation.html?order=${input.orderNumber}` } }, content);
}

export function shippingUpdateEmail(input: { userName: string; orderNumber: string; status: string; carrier: string; trackingNumber: string }): string {
  const statusLabels: Record<string, string> = {
    PROCESSING: 'is being prepared for shipment',
    IN_TRANSIT: 'is on its way to you',
    DELIVERED: 'has been delivered',
    RETURNED: 'was returned to the sender'
  };
  const content = `
    <p>Hello ${escapeHtml(input.userName)},</p>
    <p>Great news! Your order <strong>#${escapeHtml(input.orderNumber)}</strong> ${escapeHtml(statusLabels[input.status] ?? 'has a shipping update')}.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 18px 0; background: ${BG}; border: 1px solid ${BORDER}; border-radius: 10px;">
      <tr><td style="padding: 12px 16px; font-size: 14px;"><strong>Carrier:</strong> ${escapeHtml(input.carrier || 'Newdich Logistics')}</td></tr>
      <tr><td style="padding: 0 16px 12px; font-size: 14px;"><strong>Tracking number:</strong> ${escapeHtml(input.trackingNumber) || '—'}</td></tr>
      <tr><td style="padding: 0 16px 12px; font-size: 14px;"><strong>Status:</strong> <span style="text-transform: uppercase; color: ${BRAND};">${escapeHtml(input.status)}</span></td></tr>
    </table>
    <p style="font-size: 13.5px; color: ${MUTED};">Use your tracking number on the carrier's website to follow your package in real time.</p>`;
  return layout({ title: 'Your order is on the move', cta: { label: 'Track package', url: `${storeFrontUrl()}/pages/order-confirmation.html?order=${input.orderNumber}` } }, content);
}

export function returnRequestedEmail(input: { userName: string; orderNumber: string; reason: string }): string {
  const content = `
    <p>Hello ${escapeHtml(input.userName)},</p>
    <p>We have received your return request for order <strong>#${escapeHtml(input.orderNumber)}</strong>.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 18px 0; background: ${BG}; border: 1px solid ${BORDER}; border-radius: 10px;">
      <tr><td style="padding: 12px 16px; font-size: 14px;"><strong>Reason:</strong> ${escapeHtml(input.reason.replace(/_/g, ' ').toLowerCase())}</td></tr>
    </table>
    <p>Our team will review your request and get back to you within 1–2 business days.</p>`;
  return layout({ title: 'Return request received' }, content);
}

export function returnStatusEmail(input: { userName: string; orderNumber: string; status: string }): string {
  const statusText: Record<string, string> = {
    APPROVED: 'has been <strong style="color: #16a34a;">approved</strong>',
    REJECTED: 'has been <strong style="color: #b91c1c;">rejected</strong>',
    PICKED_UP: 'is scheduled for pickup',
    REFUNDED: 'has been processed and your refund is on the way',
    CLOSED: 'has been closed'
  };
  const content = `
    <p>Hello ${escapeHtml(input.userName)},</p>
    <p>Your return request for order <strong>#${escapeHtml(input.orderNumber)}</strong> ${escapeHtml(statusText[input.status] ?? 'has been updated')}.</p>
    <p>If you have any questions, reply to this email or contact our support team.</p>`;
  return layout({ title: 'Return request update' }, content);
}

export function refundIssuedEmail(input: { userName: string; orderNumber: string; amount: number; method: string }): string {
  const content = `
    <p>Hello ${escapeHtml(input.userName)},</p>
    <p>Your refund of <strong style="color: ${BRAND}; font-size: 17px;">${formatNaira(input.amount)}</strong> for order <strong>#${escapeHtml(input.orderNumber)}</strong> has been issued${input.method ? ` via ${escapeHtml(input.method)}` : ''}.</p>
    <p>Depending on your bank, the money may take <strong>3–7 business days</strong> to appear in your account.</p>`;
  return layout({ title: 'Refund issued', cta: { label: 'View order', url: `${storeFrontUrl()}/pages/account.html` } }, content);
}

export function accountSuspendedEmail(userName: string, reason: string): string {
  const content = `
    <p>Hello ${escapeHtml(userName)},</p>
    <p>Your <strong>Newdich Store</strong> account has been suspended${reason ? ` for the following reason: <em>"${escapeHtml(reason)}"</em>` : '.'}</p>
    <p>If you believe this is a mistake, please contact our support team and we will be happy to help.</p>`;
  return layout({ title: 'Account suspended' }, content);
}

export function promotionalEmail(userName: string, title: string, body: string, ctaUrl?: string, ctaLabel?: string): string {
  const content = `
    <p>Hello ${escapeHtml(userName)},</p>
    <p style="font-size: 16px; color: ${INK};">${body}</p>`;
  return layout({
    title,
    cta: ctaUrl ? { label: ctaLabel ?? 'Shop now', url: ctaUrl } : null
  }, content);
}

export function adminAlertEmail(title: string, body: string, ctaUrl?: string, ctaLabel?: string): string {
  const content = `
    <p style="color: ${INK};">${body}</p>`;
  return layout({
    title,
    cta: ctaUrl ? { label: ctaLabel ?? 'Open dashboard', url: ctaUrl } : null
  }, content);
}

export function contactReplyEmail(userName: string, subject: string, reply: string): string {
  const content = `
    <p>Hello ${escapeHtml(userName)},</p>
    <p>Thank you for contacting <strong>Newdich Store</strong>. Here is our response to your message <em>"${escapeHtml(subject)}"</em>:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 16px 0; background: ${BG}; border: 1px solid ${BORDER}; border-radius: 10px; padding: 16px;">
      <tr><td style="padding: 16px; font-size: 14.5px; line-height: 1.7; color: #2a2f3a;">${escapeHtml(reply)}</td></tr>
    </table>
    <p>If you have any further questions, feel free to reach out anytime.</p>`;
  return layout({ title: `Re: ${escapeHtml(subject)}` }, content);
}

function storeFrontUrl(): string {
  return 'http://localhost:3000';
}
