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
const SUCCESS = '#16a34a';
const BG = '#f4f6f9';
const BORDER = '#e2e7f0';
const RADIUS = '14px';

const SVG_NS = 'http://www.w3.org/2000/svg';

interface IconOpts {
  size?: number;
  color?: string;
}

function iconSvg(path: string, { size = 18, color = ACCENT }: IconOpts = {}): string {
  return `<svg xmlns="${SVG_NS}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;display:inline-block;vertical-align:middle;">${path}</svg>`;
}

const ICONS = {
  sparkles: iconSvg('<path d="M12 3l2.4 7.2h7.2l-5.8 4.2 2.2 7.2-5.8-3.6-5.8 3.6 2.2-7.2L4.4 10.2z"></path>'),
  gift: iconSvg('<path d="M12 18v-6v6zm0 0V9m0 9H7.5a4.5 4.5 0 0 1 0-9h.75m4.75 9H9.75a4.5 4.5 0 0 1 0-9h4.5a4.5 4.5 0 0 1 0 9z"></path>'),
  check: iconSvg('<path d="M20 6L9 17l-5-5"></path>', { color: SUCCESS }),
  circleCheck: iconSvg('<path d="M22 11c0-4.97-.97-9.43-2.79-13.22a.72.72 0 0 0-.55-.33 13.5 13.5 0 0 0-3.66 0 .72.72 0 0 0-.55.33C13 3.57 12 8.03 12 13c0 5.03.97 9.43 2.79 13.22a.72.72 0 0 0 .55.33 13.5 13.5 0 0 0 3.66 0 .72.72 0 0 0 .55-.33C21.03 22.43 22 18.03 22 13z"></path><path d="m9 11 3 3 3-3"></path>', { color: SUCCESS }),
  lightbulb: iconSvg('<path d="M12 2a6 6 0 0 1 6 6 6 6 0 0 1-3 5.2V19a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2.8A6 6 0 0 1 6 8a6 6 0 0 1 6-6z"></path><path d="M9.5 15h5"></path>'),
  lock: iconSvg('<path d="M12 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"></path><path d="M9 7V5a3 3 0 0 1 6 0v2"></path><path d="M12 12v5a3 3 0 0 1-6 0V9a3 3 0 0 1 6 0v3z"></path>'),
  shield: iconSvg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>'),
  help: iconSvg('<circle cx="12" cy="12" r="10"></circle><line x1="9.09" y1="9" x2="15.91" y2="15"></line><line x1="15.91" y1="9" x2="9.09" y2="15"></line>'),
  package: iconSvg('<path d="M21 8v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8"></path><path d="M10 12h4v8h-4z"></path><path d="M16 6h-2V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2H8l-2 6h12z"></path>'),
  box: iconSvg('<rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line>'),
  clock: iconSvg('<circle cx="12" cy="12" r="9"></circle><line x1="12" y1="7" x2="12" y2="11"></line><line x1="12" y1="15" x2="12.01" y2="15"></line>'),
  truck: iconSvg('<path d="M22 15a4 4 0 0 1-4 4H5a3 3 0 0 1 0-6h15z"></path><circle cx="8.5" cy="15" r="2"></circle><circle cx="17.5" cy="15" r="2"></path>'),
  mail: iconSvg('<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><path d="M22 6l-10 7L2 6"></path>', { color: BRAND }),
  info: iconSvg('<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>'),
  hourglass: iconSvg('<path d="M5 5h14v2.5a2 2 0 0 0 2 1.72V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8.78a2 2 0 0 0 2-1.72z"></path><line x1="9" y1="9" x2="15" y2="15"></line>'),
  creditCard: iconSvg('<rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line><line x1="6" y1="14" x2="6.01" y2="14"></line><line x1="10" y1="14" x2="10.01" y2="14"></line>'),
  wave: iconSvg('<path d="M12 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z"></path>'),
  fire: iconSvg('<path d="M12 2C7 7 7 13 12 22c5-9 5-15 0-20z"></path>')
};

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
              ">TELENTE<span style="color: ${ACCENT};">.</span></span>
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
                Telente Store &middot; Quality products, delivered to you.
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                You received this email because you have an account or placed an order with Telente Store.
                <br>If this was not you, please ignore this email or contact
                <a href="mailto:support@telente.site" style="color: ${BRAND}; text-decoration: none;">support@telente.site</a>.
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

export function infoTable(rows: { label: string; value: string; strong?: boolean }[]): string {
  const rowsMarkup = rows
    .map(
      (row) => `<tr><td style="padding: 11px 16px; font-size: 14px; color: ${MUTED};">${escapeHtml(row.label)}</td>
      <td style="padding: 11px 16px; font-size: 14px; text-align: right; font-weight: ${row.strong ? '700' : '500'}; color: ${row.strong ? BRAND : INK};">${row.value}</td></tr>`
    )
    .join('');
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 18px 0; background: ${BG}; border: 1px solid ${BORDER}; border-radius: 10px; border-collapse: separate;">
      ${rowsMarkup}
    </table>`;
}

export function checklist(items: string[]): string {
  const itemsMarkup = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 6px 0; font-size: 14px; color: #2a2f3a;">
          <span style="display: inline-flex; align-items: center; width: 20px; height: 20px; line-height: 20px; text-align: center; border-radius: 50%; background: #e8f3ec; color: #16a34a; font-size: 12px; font-weight: 700; margin-right: 10px; vertical-align: middle;">${ICONS.check}</span>
          ${item}
        </td>
      </tr>`
    )
    .join('');
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 14px 0;">
      ${itemsMarkup}
    </table>`;
}

export function highlightBox(icon: string, text: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 18px 0; background: linear-gradient(135deg, rgba(31,75,153,0.06), rgba(209,150,47,0.08)); border: 1px solid ${BORDER}; border-left: 4px solid ${ACCENT}; border-radius: 10px;">
      <tr>
        <td style="padding: 14px 18px; font-size: 14px; line-height: 1.7; color: #2a2f3a;"><span style="display: inline-flex; align-items: center; margin-right: 10px; vertical-align: middle;">${icon}</span>${text}</td>
      </tr>
    </table>`;
}

export function welcomeEmail(userName: string, storeName = 'Telente Store'): string {
  const content = `
    <p>Hello ${escapeHtml(userName)},</p>
    <p>Welcome to <strong>${escapeHtml(storeName)}</strong>! We are thrilled to have you on board. Your account was created successfully, and you are now part of a community that values quality products and effortless shopping.</p>
    <p style="margin-bottom: 4px;">Here is what you can do right now:</p>
    ${checklist([
      'Complete your profile for a faster, smoother checkout',
      'Browse our latest arrivals and seasonal offers',
      'Save your favourite items to your wishlist',
      'Track every order straight from your account'
    ])}
    ${highlightBox(ICONS.lightbulb, 'Pro tip: keep an eye on your inbox — we share exclusive deals and early access to sales with our members before everyone else.')}
    <p style="font-size: 13.5px; color: ${MUTED};">Need a hand? Our support team is one message away at <a href="mailto:support@telente.site" style="color: ${BRAND};">support@telente.site</a>.</p>`;
  return layout({ title: 'Welcome to Telente Store', cta: { label: 'Start shopping', url: `${storeFrontUrl()}` } }, content);
}

export function otpEmail(userName: string, code: string, minutes: number, purpose: string): string {
  const purposeLabel = purpose === 'login' ? 'sign in' : purpose === 'register' ? 'account verification' : purpose === 'admin_login' ? 'admin sign in' : 'reset your password';
  const content = `
    <p>Hello ${escapeHtml(userName)},</p>
    <p>You are almost there! Use the code below to ${escapeHtml(purposeLabel)}. This code is valid for the next <strong>${minutes} minutes</strong>, so enter it soon.</p>
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
    <p style="font-size: 13.5px; color: ${MUTED};">If you did not request this code, you can safely ignore this email — someone may have entered your email address by mistake. Never share this code with anyone, including people claiming to be from our support team.</p>`;
  return layout({ title: 'Your one-time verification code' }, content);
}

export function loginAlertEmail(userName: string, ip: string, userAgent: string, location: string): string {
  const content = `
    <p>Hello ${escapeHtml(userName)},</p>
    <p>We noticed a new sign-in to your <strong>Telente Store</strong> account. Here are the details:</p>
    ${infoTable([
      { label: 'Date & time', value: escapeHtml(new Date().toLocaleString('en-NG')) },
      { label: 'IP address', value: escapeHtml(ip) },
      { label: 'Device', value: escapeHtml(userAgent) },
      { label: 'Location', value: escapeHtml(location) }
    ])}
    <p>If this was you, no action is needed. If you do not recognise this sign-in, please act fast:</p>
    ${checklist([
      'Change your password immediately',
      'Log out of all devices from your account settings',
      'Contact our support team right away'
    ])}`;
  return layout({
    title: 'New sign-in detected on your account',
    cta: { label: 'Review my account', url: `${storeFrontUrl()}/pages/account.html` }
  }, content);
}

export function passwordChangedEmail(userName: string): string {
  const content = `
    <p>Hello ${escapeHtml(userName)},</p>
    <p>Your <strong>Telente Store</strong> account password was just changed.</p>
    <p style="color: ${MUTED}; font-size: 14px;">If you made this change, you are all set — nothing else is needed. If you did <strong>not</strong> make this change, please reset your password immediately using the button below and contact our support team, as your account security may be at risk.</p>
    ${highlightBox(ICONS.lock, 'A simple rule of thumb: use a unique password for every website, and never reuse your email password.')}`;
  return layout({ title: 'Your password has been changed', cta: { label: 'Reset password', url: `${storeFrontUrl()}/auths/reset-password.html` } }, content);
}

export function passwordResetEmail(userName: string, resetUrl: string): string {
  const content = `
    <p>Hello ${escapeHtml(userName)},</p>
    <p>We received a request to reset the password for your <strong>Telente Store</strong> account. No worries — it happens to the best of us!</p>
    <p>Click the button below to choose a new password. For your security, this link expires in <strong>30 minutes</strong> and can only be used once.</p>
    ${highlightBox(ICONS.shield, 'Did not request this? You can safely ignore this email — your password will stay exactly as it is.')}`;
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
    <p>Thank you for your order. Your order <strong>#${escapeHtml(input.orderNumber)}</strong> has been received and our team is already preparing your items.</p>
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
    <p style="margin-top: 14px; font-size: 13.5px; color: ${MUTED};">Placed on ${escapeHtml(formatDate(input.placedAt))}.</p>
    <p style="margin-bottom: 4px;"><strong>What happens next?</strong></p>
    ${checklist([
      'We verify your payment (usually within minutes)',
      'Your items are carefully packed and handed to our logistics partner',
      'You will receive a shipping email with a tracking number',
      'Your order arrives at your doorstep — enjoy!'
    ])}`;
  return layout({
    title: 'Order confirmation & receipt',
    cta: { label: 'Track my order', url: `${storeFrontUrl()}/pages/order-confirmation.html?order=${input.orderNumber}` }
  }, content);
}

export function paymentReceiptEmail(input: { userName: string; orderNumber: string; amount: number; method: string; reference: string; paidAt: Date }): string {
  const content = `
    <p>Hello ${escapeHtml(input.userName)},</p>
    <p>We have received your payment of <strong style="color: ${BRAND}; font-size: 17px;">${formatNaira(input.amount)}</strong> for order <strong>#${escapeHtml(input.orderNumber)}</strong>. Thank you.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 18px 0; background: ${BG}; border: 1px solid ${BORDER}; border-radius: 10px;">
      <tr><td style="padding: 12px 16px; font-size: 14px;"><strong>Order:</strong> #${escapeHtml(input.orderNumber)}</td></tr>
      <tr><td style="padding: 0 16px 12px; font-size: 14px;"><strong>Amount paid:</strong> ${formatNaira(input.amount)}</td></tr>
      <tr><td style="padding: 0 16px 12px; font-size: 14px;"><strong>Method:</strong> ${escapeHtml(input.method)}</td></tr>
      <tr><td style="padding: 0 16px 12px; font-size: 14px;"><strong>Reference:</strong> ${escapeHtml(input.reference)}</td></tr>
      <tr><td style="padding: 0 16px 12px; font-size: 14px;"><strong>Date:</strong> ${escapeHtml(formatDate(input.paidAt))}</td></tr>
    </table>
    <p style="font-size: 13.5px; color: ${MUTED};">Keep this receipt for your records. Your order is now being prepared, and we will notify you the moment it ships.</p>
    ${highlightBox(ICONS.help, 'Questions about your order? Reply to this email or reach us at support@telente.site — we respond within one business day.')}`;
  return layout({ title: 'Payment received — thank you!' }, content);
}

export function paymentFailedEmail(input: { userName: string; orderNumber: string; amount: number; reference: string }): string {
  const content = `
    <p>Hello ${escapeHtml(input.userName)},</p>
    <p>Unfortunately, the payment of <strong>${formatNaira(input.amount)}</strong> for order <strong>#${escapeHtml(input.orderNumber)}</strong> (reference: ${escapeHtml(input.reference)}) could not be completed.</p>
    <p>Good news: your items are still reserved for you. To complete your purchase, simply:</p>
    ${checklist([
      'Click the button below to return to checkout',
      'Confirm your payment details (or try another payment method)',
      'Submit — and you are done!'
    ])}
    ${highlightBox(ICONS.clock, 'Your items stay reserved for a limited time, so we recommend retrying soon.')}`;
  return layout({
    title: 'Payment failed — action required',
    cta: { label: 'Retry payment', url: `${storeFrontUrl()}/pages/checkout.html` }
  }, content);
}

export function orderStatusEmail(input: { userName: string; orderNumber: string; status: string }): string {
  const content = `
    <p>Hello ${escapeHtml(input.userName)},</p>
    <p>Quick update! Your order <strong>#${escapeHtml(input.orderNumber)}</strong> has moved to: <strong style="color: ${BRAND}; text-transform: uppercase;">${escapeHtml(input.status.replace(/_/g, ' '))}</strong>.</p>
    <p>We will keep you posted on every change along the way. You can always check the live status of your order from your account.</p>
    ${highlightBox(ICONS.truck, 'Once your order ships, you will receive a separate email with your tracking number.')}`;
  return layout({ title: `Order update: ${escapeHtml(input.status)}`, cta: { label: 'View order', url: `${storeFrontUrl()}/pages/order-confirmation.html?order=${input.orderNumber}` } }, content);
}

export function shippingUpdateEmail(input: { userName: string; orderNumber: string; status: string; carrier: string; trackingNumber: string }): string {
  const statusLabels: Record<string, string> = {
    PROCESSING: 'is being carefully packed and prepared for shipment',
    IN_TRANSIT: 'is on its way to you',
    DELIVERED: 'has been delivered',
    RETURNED: 'was returned to the sender'
  };
  const content = `
    <p>Hello ${escapeHtml(input.userName)},</p>
    <p>Great news! Your order <strong>#${escapeHtml(input.orderNumber)}</strong> ${escapeHtml(statusLabels[input.status] ?? 'has a shipping update')}.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 18px 0; background: ${BG}; border: 1px solid ${BORDER}; border-radius: 10px;">
      <tr><td style="padding: 12px 16px; font-size: 14px;"><strong>Carrier:</strong> ${escapeHtml(input.carrier || 'Telente Logistics')}</td></tr>
      <tr><td style="padding: 0 16px 12px; font-size: 14px;"><strong>Tracking number:</strong> ${escapeHtml(input.trackingNumber) || '—'}</td></tr>
      <tr><td style="padding: 0 16px 12px; font-size: 14px;"><strong>Status:</strong> <span style="text-transform: uppercase; color: ${BRAND};">${escapeHtml(input.status.replace(/_/g, ' '))}</span></td></tr>
    </table>
    <p style="font-size: 13.5px; color: ${MUTED};">Use your tracking number on the carrier's website to follow your package in real time. Keep an eye on your delivery address — some carriers require a signature.</p>`;
  return layout({ title: 'Your order is on the move', cta: { label: 'Track package', url: `${storeFrontUrl()}/pages/order-confirmation.html?order=${input.orderNumber}` } }, content);
}

export function returnRequestedEmail(input: { userName: string; orderNumber: string; reason: string }): string {
  const content = `
    <p>Hello ${escapeHtml(input.userName)},</p>
    <p>We have received your return request for order <strong>#${escapeHtml(input.orderNumber)}</strong>.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 18px 0; background: ${BG}; border: 1px solid ${BORDER}; border-radius: 10px;">
      <tr><td style="padding: 12px 16px; font-size: 14px;"><strong>Reason:</strong> ${escapeHtml(input.reason.replace(/_/g, ' ').toLowerCase())}</td></tr>
    </table>
    <p style="margin-bottom: 4px;"><strong>What happens next?</strong></p>
    ${checklist([
      'Our team reviews your request (1–2 business days)',
      'We email you the outcome and, if approved, pickup details',
      'Your refund is issued once the item is received back'
    ])}
    <p style="font-size: 13.5px; color: ${MUTED};">Tip: keep the item in its original packaging to speed up your refund.</p>`;
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
  const extras: Record<string, string> = {
    APPROVED: 'Our logistics partner will reach out to arrange pickup of the item. Have the item ready in its original packaging.',
    REJECTED: 'We have sent the details to your email. If you believe this is a mistake, reply to this email and we will take another look.',
    PICKED_UP: 'Please have the item packed and ready — the pickup team will collect it at your convenience.',
    REFUNDED: 'Depending on your bank, the money may take 3–7 business days to appear in your account.',
    CLOSED: 'Thank you for shopping with Telente Store. We hope to see you again soon!'
  };
  const content = `
    <p>Hello ${escapeHtml(input.userName)},</p>
    <p>Your return request for order <strong>#${escapeHtml(input.orderNumber)}</strong> ${escapeHtml(statusText[input.status] ?? 'has been updated')}.</p>
    ${extras[input.status] ? highlightBox(ICONS.info, extras[input.status]) : ''}
    <p style="font-size: 13.5px; color: ${MUTED};">Questions? Reply to this email or contact our support team — we are happy to help.</p>`;
  return layout({ title: 'Return request update' }, content);
}

export function refundIssuedEmail(input: { userName: string; orderNumber: string; amount: number; method: string }): string {
  const content = `
    <p>Hello ${escapeHtml(input.userName)},</p>
    <p>Great news! Your refund of <strong style="color: ${BRAND}; font-size: 17px;">${formatNaira(input.amount)}</strong> for order <strong>#${escapeHtml(input.orderNumber)}</strong> has been issued${input.method ? ` via <strong>${escapeHtml(input.method)}</strong>` : ''}.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 18px 0; background: ${BG}; border: 1px solid ${BORDER}; border-radius: 10px;">
      <tr><td style="padding: 12px 16px; font-size: 14px;"><strong>Refund amount:</strong> ${formatNaira(input.amount)}</td></tr>
      <tr><td style="padding: 0 16px 12px; font-size: 14px;"><strong>Method:</strong> ${escapeHtml(input.method || 'Original payment method')}</td></tr>
      <tr><td style="padding: 0 16px 12px; font-size: 14px;"><strong>Estimated arrival:</strong> 3–7 business days</td></tr>
    </table>
    ${highlightBox(ICONS.hourglass, 'Processing times vary by bank and card issuer. If the money has not arrived after 7 business days, reach out and we will investigate for you.')}
    <p>Thank you for your patience, and we hope to serve you again soon!</p>`;
  return layout({ title: 'Refund issued', cta: { label: 'View order', url: `${storeFrontUrl()}/pages/account.html` } }, content);
}

export function accountSuspendedEmail(userName: string, reason: string): string {
  const content = `
    <p>Hello ${escapeHtml(userName)},</p>
    <p>Your <strong>Telente Store</strong> account has been temporarily suspended${reason ? ` for the following reason: <em>"${escapeHtml(reason)}"</em>` : '.'}</p>
    <p>While your account is suspended you will not be able to place orders or sign in. If you believe this is a mistake, here is what you can do:</p>
    ${checklist([
      'Reply to this email with any details you think are relevant',
      'Contact our support team at support@telente.site',
      'Include your account email so we can locate your record quickly'
    ])}
    <p>We review every appeal carefully and will get back to you within 1–2 business days.</p>`;
  return layout({ title: 'Account suspended' }, content);
}

export function promotionalEmail(userName: string, title: string, body: string, ctaUrl?: string, ctaLabel?: string): string {
  const content = `
    <p>Hello ${escapeHtml(userName)},</p>
    <p style="font-size: 16px; color: ${INK};">${body}</p>
    ${highlightBox(ICONS.fire, 'This offer is for a limited time only — while stocks last. Do not miss out!')}
    <p>Prefer fewer emails? You can manage your preferences anytime. We always keep our promises — quality products and fair prices, every time.</p>`;
  return layout({
    title,
    cta: ctaUrl ? { label: ctaLabel ?? 'Shop now', url: ctaUrl } : null
  }, content);
}

export function adminAlertEmail(title: string, body: string, ctaUrl?: string, ctaLabel?: string): string {
  const content = `
    <p style="color: ${INK};">${body}</p>
    <p style="font-size: 13.5px; color: ${MUTED};">This is an automated notification from your Telente Store dashboard. No action is needed unless the details above require it.</p>`;
  return layout({
    title,
    cta: ctaUrl ? { label: ctaLabel ?? 'Open dashboard', url: ctaUrl } : null
  }, content);
}

export function contactReplyEmail(userName: string, subject: string, reply: string): string {
  const content = `
    <p>Hello ${escapeHtml(userName)},</p>
    <p>Thank you for contacting <strong>Telente Store</strong>! Our team has responded to your message <em>"${escapeHtml(subject)}"</em>:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 16px 0; background: ${BG}; border: 1px solid ${BORDER}; border-radius: 10px; padding: 16px;">
      <tr><td style="padding: 16px; font-size: 14.5px; line-height: 1.7; color: #2a2f3a;">${escapeHtml(reply)}</td></tr>
    </table>
    <p>If you have any further questions, simply reply to this email — no need to start a new conversation. We usually respond within one business day.</p>`;
  return layout({ title: `Re: ${escapeHtml(subject)}` }, content);
}

export function newsletterWelcomeEmail(userName: string, storeName = 'Telente Store'): string {
  const content = `
    <p>Hello ${escapeHtml(userName)},</p>
    <p>Thank you for subscribing to <strong>${escapeHtml(storeName)}</strong>. You are officially part of our inner circle, and we are so glad to have you.</p>
    <p style="margin-bottom: 4px;">Here is what lands in your inbox:</p>
    ${checklist([
      'Exclusive deals and early access to sales — before everyone else',
      'New arrivals and seasonal highlights, handpicked for you',
      'Style inspiration, gift guides and helpful shopping tips',
      'Occasional members-only surprises'
    ])}
    ${highlightBox(ICONS.mail, 'We send only the good stuff — no spam, ever. And if you ever change your mind, one click on the unsubscribe link removes you instantly.')}
    <p>While you wait for the next email, why not see what is new in store?</p>`;
  return layout({
    title: `Welcome to the ${escapeHtml(storeName)} circle`,
    cta: { label: 'Start shopping', url: `${storeFrontUrl()}/products` }
  }, content);
}

export function newsletterUnsubscribeEmail(userName: string, storeName = 'Telente Store'): string {
  const content = `
    <p>Hello ${escapeHtml(userName)},</p>
    <p>You have been <strong>unsubscribed</strong> from the <strong>${escapeHtml(storeName)}</strong> newsletter. We are sorry to see you go, and we completely understand.</p>
    <p>You will no longer receive marketing emails from us — this takes effect immediately.</p>
    ${highlightBox(ICONS.wave, 'Changed your mind? You are always welcome back. Simply re-subscribe from any page on our site and we will pick up right where we left off.')}
    <p>Thank you for being part of our community, and we hope you continue to enjoy shopping with us.</p>`;
  return layout({
    title: 'You have been unsubscribed',
    cta: { label: 'Resubscribe', url: `${storeFrontUrl()}/` }
  }, content);
}

function storeFrontUrl(): string {
  return process.env.STORE_URL || 'https://telente-store.com';
}
