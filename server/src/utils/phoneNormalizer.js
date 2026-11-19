/**
 * Standardizes phone numbers to E.164 format for WhatsApp and CRM deduplication
 * Supports India (+91) as default if country code is omitted
 */
function normalizePhoneNumber(rawPhone, defaultCountryCode = '+91') {
  if (!rawPhone) return '';

  // Remove all non-numeric characters except leading plus
  let cleaned = rawPhone.toString().trim().replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // Handle leading zeros e.g. 09876543210
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // If starts with 91 and has 12 digits (India)
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return '+' + cleaned;
  }

  // If 10 digits, prepend default country code
  if (cleaned.length === 10) {
    const code = defaultCountryCode.startsWith('+') ? defaultCountryCode : '+' + defaultCountryCode;
    return code + cleaned;
  }

  return '+' + cleaned;
}

module.exports = { normalizePhoneNumber };
