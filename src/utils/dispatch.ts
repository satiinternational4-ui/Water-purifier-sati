import { OrderFormData, RepairFormData, CartItem } from '../types';

/**
 * Format Indian / Nepalese currency in standard style
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Convert Google Drive share link to direct embed image URL
 */
export function convertDriveLinkToImageUrl(url: string): string {
  if (!url) return '';
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  return url;
}

/**
 * Generate formatted text message for an order
 */
export function buildOrderTextMessage(
  order: OrderFormData,
  items: CartItem[],
  total: number,
  shopName: string = 'Sati International'
): string {
  const dateStr = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  let message = `🛒 *NEW ORDER - ${shopName.toUpperCase()}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📅 *Date:* ${dateStr}\n`;
  message += `👤 *Customer Name:* ${order.customerName.trim()}\n`;
  message += `📞 *Phone Number:* ${order.phone.trim()}\n`;
  if (order.altPhone && order.altPhone.trim()) {
    message += `📱 *Alt. Phone:* ${order.altPhone.trim()}\n`;
  }
  message += `📍 *Service Area:* ${order.area} (Doorstep Service)\n`;
  message += `🏠 *Full Delivery Address:* ${order.address.trim()}\n`;
  if (order.landmark && order.landmark.trim()) {
    message += `🏛️ *Landmark:* ${order.landmark.trim()}\n`;
  }
  message += `💳 *Payment Preference:* ${order.paymentPreference}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📦 *ORDERED PRODUCTS & SPARE PARTS:*\n`;

  items.forEach((item, index) => {
    message += `${index + 1}. *${item.product.name}*\n`;
    message += `   • Qty: ${item.quantity} × ${formatCurrency(item.product.price)} = ${formatCurrency(
      item.product.price * item.quantity
    )}\n`;
    if (item.product.specs.model) {
      message += `   • Model: ${item.product.specs.model}\n`;
    }
    if (item.product.image) {
      message += `   • 🖼️ Photo: ${item.product.image}\n`;
    }
  });

  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *TOTAL ESTIMATED AMOUNT:* ${formatCurrency(total)}\n`;
  if (order.notes && order.notes.trim()) {
    message += `📝 *Customer Note:* ${order.notes.trim()}\n`;
  }
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `⚡ *Service Request:* Please confirm order dispatch & arrival time.\n`;
  message += `_Sent via Sati International Online Portal_`;

  return message;
}

/**
 * Resolves the phone number for WhatsApp deep-linking.
 * - Strips any non-digit characters.
 * - Filters out any stale demo placeholder number (such as 9801234567 or 919801234567).
 * - Handles country code mapping:
 *   The shop is in the Birganj / Raxaul border region (Nepal / India).
 *   The provided number is 9804235755 with country code +997.
 *   In global ITU standards and in WhatsApp's registration database:
 *   - Nepal's country code is +977 (Birganj Ncell/Telecom is +977 9804235755).
 *   - +997 does not exist as an ITU country code, which causes WhatsApp to reject it with
 *     "Phone number isn't on WhatsApp".
 *   - Mapping 99798... to 97798... ensures WhatsApp opens the actual chat immediately!
 *   - We also support the literal raw digits (9979804235755) as an alternative.
 */
export function resolveWhatsAppNumber(phone: string, useRawDigits: boolean = false): string {
  let digits = (phone || '').replace(/\D/g, '');

  // Strip stale demo placeholder
  if (!digits || digits.includes('98012') || digits === '919801234567') {
    digits = '9979804235755';
  }

  if (useRawDigits) {
    return digits;
  }

  // Automatic conversion for WhatsApp connectivity:
  // 997 followed by Nepal mobile 9804235755 -> map 997 to 977
  if (digits.startsWith('99798')) {
    return '977' + digits.slice(3);
  }
  if (digits === '9804235755') {
    return '9779804235755';
  }

  return digits;
}

/**
 * Generate 1-Click WhatsApp URL for an order
 */
export function generateWhatsAppOrderUrl(
  order: OrderFormData,
  items: CartItem[],
  total: number,
  shopWhatsapp: string,
  useRawDigits: boolean = false
): string {
  const text = buildOrderTextMessage(order, items, total);
  const cleanPhone = resolveWhatsAppNumber(shopWhatsapp, useRawDigits);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate 1-Click SMS URL for an order
 */
export function generateSmsOrderUrl(
  order: OrderFormData,
  items: CartItem[],
  total: number,
  smsPhone: string = '9304643614'
): string {
  const text = buildOrderTextMessage(order, items, total);
  const cleanPhone = smsPhone.replace(/\D/g, '') || '9304643614';
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const separator = isIOS ? '&' : '?';
  return `sms:${cleanPhone}${separator}body=${encodeURIComponent(text)}`;
}

/**
 * Generate 1-Click Gmail composer link and mailto URL for an order
 */
export function generateGmailOrderLinks(
  order: OrderFormData,
  items: CartItem[],
  total: number,
  shopEmail: string
): { webUrl: string; mailtoUrl: string; subject: string; body: string } {
  const subject = `New Order: ${order.customerName} - ${order.area} [${formatCurrency(total)}]`;
  const body = buildOrderTextMessage(order, items, total);

  // Direct Gmail web composer URL (opens Gmail tab immediately on desktop/mobile browsers)
  const webUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    shopEmail
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Universal mailto URL (opens Gmail App directly on mobile phones / tablets)
  const mailtoUrl = `mailto:${encodeURIComponent(shopEmail)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  return { webUrl, mailtoUrl, subject, body };
}

/**
 * Generate formatted text message for a repair request
 */
export function buildRepairTextMessage(
  repair: RepairFormData,
  shopName: string = 'Sati International'
): string {
  const dateStr = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  let message = `🔧 *WATER PURIFIER REPAIR REQUEST - ${shopName.toUpperCase()}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📅 *Date:* ${dateStr}\n`;
  message += `👤 *Customer Name:* ${repair.customerName.trim()}\n`;
  message += `📞 *Contact Phone:* ${repair.phone.trim()}\n`;
  message += `📍 *Service Area:* ${repair.area} (Express Doorstep)\n`;
  message += `🏠 *Service Address:* ${repair.address.trim()}\n`;
  message += `🚨 *Urgency Level:* ${repair.urgency}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `⚙️ *PURIFIER ISSUE DETAILS:*\n`;
  message += `🏷️ *Machine Brand/Model:* ${repair.purifierBrand.trim() || 'Not Specified / Assembled RO'}\n`;
  message += `⚠️ *Issue Category:* ${repair.issueType}\n`;
  message += `📋 *Problem Description:*\n"${repair.problemDetails.trim()}"\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  if (repair.photoFileName) {
    message += `📁 *Purifier Photo Selected:* ${repair.photoFileName}\n`;
  }
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `⚡ *Action Required:* Please assign technician for doorstep repair.\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📸 *NOTE:* Please send the photos of your purifier in this WhatsApp chat.\n`;
  message += `_Sent via Sati International Repair Portal_`;

  return message;
}

/**
 * Generate 1-Click WhatsApp URL for a repair request
 */
export function generateWhatsAppRepairUrl(
  repair: RepairFormData,
  shopWhatsapp: string,
  useRawDigits: boolean = false
): string {
  const text = buildRepairTextMessage(repair);
  const cleanPhone = resolveWhatsAppNumber(shopWhatsapp, useRawDigits);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate 1-Click SMS URL for a repair request
 */
export function generateSmsRepairUrl(
  repair: RepairFormData,
  smsPhone: string = '9304643614'
): string {
  const text = buildRepairTextMessage(repair);
  const cleanPhone = smsPhone.replace(/\D/g, '') || '9304643614';
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const separator = isIOS ? '&' : '?';
  return `sms:${cleanPhone}${separator}body=${encodeURIComponent(text)}`;
}

/**
 * Generate 1-Click Gmail composer link and mailto URL for a repair request
 */
export function generateGmailRepairLinks(
  repair: RepairFormData,
  shopEmail: string
): { webUrl: string; mailtoUrl: string; subject: string; body: string } {
  const subject = `Repair Request: ${repair.customerName} - ${repair.issueType} (${repair.area})`;
  const body = buildRepairTextMessage(repair);

  const webUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    shopEmail
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const mailtoUrl = `mailto:${encodeURIComponent(shopEmail)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  return { webUrl, mailtoUrl, subject, body };
}

/**
 * Copy text to clipboard safely
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers / iframe restrictions
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}
