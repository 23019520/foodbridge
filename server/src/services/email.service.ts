import { Resend } from 'resend';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const resend = new Resend(env.RESEND_API_KEY);
const FROM = env.RESEND_FROM_EMAIL;

/**
 * Central email service. All transactional emails go through here.
 * If sending fails we log the error but never crash the app —
 * a failed email should never break an order confirmation.
 */

const send = async (to: string, subject: string, html: string): Promise<void> => {
  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) throw new Error(error.message);
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    logger.error(`Failed to send email to ${to}:`, err);
    // Don't rethrow — email failure is non-fatal
  }
};

// ─── Templates ────────────────────────────────────────────────────────────────

const baseTemplate = (content: string) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>FoodBridge</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:Inter,system-ui,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 16px;">
      <tr><td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e5e5;">
          <tr>
            <td style="background:#1A6B3C;padding:24px 32px;">
              <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">🌿 FoodBridge</p>
              <p style="margin:4px 0 0;font-size:13px;color:#9FE1CB;">Connecting local food producers with consumers</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 24px;border-top:1px solid #f0f0f0;">
              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                FoodBridge · Connecting local communities · South Africa
              </p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>
`;

const btn = (href: string, text: string) =>
  `<a href="${href}" style="display:inline-block;background:#1A6B3C;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin-top:8px;">${text}</a>`;

// ─── Email senders ────────────────────────────────────────────────────────────

export const sendWelcomeEmail = async (to: string, name: string, role: string) => {
  const isProducer = role === 'producer';
  await send(
    to,
    `Welcome to FoodBridge, ${name}!`,
    baseTemplate(`
      <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">Welcome, ${name}! 👋</h2>
      <p style="margin:0 0 16px;color:#6b7280;line-height:1.6;">
        ${isProducer
          ? "You're now set up as a seller on FoodBridge. Add your first listing and start reaching customers in your community."
          : "You can now browse local food producers and place orders directly from your community."
        }
      </p>
      ${btn(
        isProducer
          ? `${env.CLIENT_URL}/dashboard/producer`
          : `${env.CLIENT_URL}`,
        isProducer ? 'Go to your dashboard' : 'Browse listings'
      )}
    `)
  );
};

export const sendPasswordResetEmail = async (to: string, name: string, resetUrl: string) => {
  await send(
    to,
    'Reset your FoodBridge password',
    baseTemplate(`
      <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">Reset your password</h2>
      <p style="margin:0 0 16px;color:#6b7280;line-height:1.6;">
        Hi ${name}, we received a request to reset your password. Click the button below to choose a new one.
        This link expires in 24 hours.
      </p>
      ${btn(resetUrl, 'Reset my password')}
      <p style="margin:20px 0 0;font-size:13px;color:#9ca3af;">
        If you didn't request this, you can safely ignore this email.
      </p>
    `)
  );
};

export const sendOrderConfirmationToConsumer = async (
  to: string,
  consumerName: string,
  producerName: string,
  reference: string,
  items: Array<{ title: string; quantity: number; price: number }>,
  totalAmount: number,
  deliveryType: string
) => {
  const itemRows = items.map(
    (i) => `
    <tr>
      <td style="padding:8px 0;color:#374151;font-size:14px;border-bottom:1px solid #f3f4f6;">${i.title}</td>
      <td style="padding:8px 0;color:#6b7280;font-size:14px;text-align:center;border-bottom:1px solid #f3f4f6;">×${i.quantity}</td>
      <td style="padding:8px 0;color:#374151;font-size:14px;text-align:right;border-bottom:1px solid #f3f4f6;">R ${(i.price * i.quantity).toFixed(2)}</td>
    </tr>`
  ).join('');

  await send(
    to,
    `Order confirmed — ${reference}`,
    baseTemplate(`
      <h2 style="margin:0 0 4px;font-size:22px;color:#111827;">Your order is placed!</h2>
      <p style="margin:0 0 20px;color:#6b7280;">Hi ${consumerName}, your order has been sent to <strong>${producerName}</strong>.</p>

      <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:20px;">
        <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;">Order reference</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#111827;font-family:monospace;">${reference}</p>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
        <tr>
          <th style="text-align:left;font-size:12px;color:#9ca3af;font-weight:600;padding-bottom:8px;">Item</th>
          <th style="text-align:center;font-size:12px;color:#9ca3af;font-weight:600;padding-bottom:8px;">Qty</th>
          <th style="text-align:right;font-size:12px;color:#9ca3af;font-weight:600;padding-bottom:8px;">Price</th>
        </tr>
        ${itemRows}
        <tr>
          <td colspan="2" style="padding:12px 0 0;font-weight:700;color:#111827;">Total</td>
          <td style="padding:12px 0 0;font-weight:700;color:#111827;text-align:right;">R ${totalAmount.toFixed(2)}</td>
        </tr>
      </table>

      <p style="margin:0 0 20px;font-size:14px;color:#6b7280;">
        ${deliveryType === 'delivery' ? '🚚 Delivery' : '🏪 Collection'} · The seller will contact you to confirm.
      </p>

      ${btn(`${env.CLIENT_URL}/dashboard/consumer`, 'View my orders')}
    `)
  );
};

export const sendNewOrderNotificationToProducer = async (
  to: string,
  producerName: string,
  consumerName: string,
  reference: string,
  items: Array<{ title: string; quantity: number; price: number }>,
  totalAmount: number,
  contactNumber: string,
  deliveryType: string,
  deliveryAddress?: string
) => {
  const itemRows = items.map(
    (i) => `<li style="margin-bottom:4px;color:#374151;font-size:14px;">${i.title} ×${i.quantity} — R ${(i.price * i.quantity).toFixed(2)}</li>`
  ).join('');

  await send(
    to,
    `New order received — ${reference}`,
    baseTemplate(`
      <h2 style="margin:0 0 4px;font-size:22px;color:#111827;">You have a new order! 🎉</h2>
      <p style="margin:0 0 20px;color:#6b7280;">Hi ${producerName}, <strong>${consumerName}</strong> has placed an order.</p>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:20px;">
        <p style="margin:0 0 4px;font-size:12px;color:#16a34a;text-transform:uppercase;letter-spacing:0.05em;">Reference</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#111827;font-family:monospace;">${reference}</p>
      </div>

      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#374151;">Items ordered:</p>
      <ul style="margin:0 0 16px;padding-left:20px;">${itemRows}</ul>
      <p style="margin:0 0 4px;font-size:14px;color:#374151;"><strong>Total:</strong> R ${totalAmount.toFixed(2)}</p>
      <p style="margin:0 0 4px;font-size:14px;color:#374151;"><strong>Fulfilment:</strong> ${deliveryType === 'delivery' ? `Delivery to ${deliveryAddress ?? '—'}` : 'Collection'}</p>
      <p style="margin:0 0 20px;font-size:14px;color:#374151;"><strong>Customer contact:</strong> ${contactNumber}</p>

      ${btn(`${env.CLIENT_URL}/dashboard/producer`, 'Manage this order')}
    `)
  );
};

export const sendOrderStatusUpdateToConsumer = async (
  to: string,
  consumerName: string,
  producerName: string,
  reference: string,
  newStatus: string
) => {
  const statusMessages: Record<string, { emoji: string; headline: string; body: string }> = {
    confirmed: {
      emoji: '✅',
      headline: 'Your order has been confirmed',
      body: `${producerName} has accepted your order and is preparing it.`,
    },
    ready: {
      emoji: '📦',
      headline: 'Your order is ready!',
      body: `Your order from ${producerName} is ready for collection or dispatch.`,
    },
    completed: {
      emoji: '🎉',
      headline: 'Order completed',
      body: `Your order from ${producerName} has been marked as completed. Enjoy your food!`,
    },
    cancelled: {
      emoji: '❌',
      headline: 'Order cancelled',
      body: `Unfortunately your order from ${producerName} has been cancelled. Please contact the seller for more information.`,
    },
  };

  const msg = statusMessages[newStatus];
  if (!msg) return;

  await send(
    to,
    `${msg.emoji} Order ${reference} — ${msg.headline}`,
    baseTemplate(`
      <h2 style="margin:0 0 8px;font-size:22px;color:#111827;">${msg.emoji} ${msg.headline}</h2>
      <p style="margin:0 0 8px;color:#6b7280;">Hi ${consumerName},</p>
      <p style="margin:0 0 20px;color:#374151;line-height:1.6;">${msg.body}</p>
      <p style="margin:0 0 20px;font-size:14px;color:#9ca3af;font-family:monospace;">Ref: ${reference}</p>
      ${btn(`${env.CLIENT_URL}/dashboard/consumer`, 'View my orders')}
    `)
  );
};