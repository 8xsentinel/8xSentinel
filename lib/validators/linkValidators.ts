/**
 * Link and Identifier Validation Utilities for 8xSentinel Reseller Onboarding
 */

export interface LinkValidationResult {
  isValid: boolean;
  type: 'whatsapp_group' | 'whatsapp_channel' | 'telegram_channel' | 'telegram_invite' | 'invalid' | 'empty';
  label: string;
  message: string;
  normalizedUrl: string;
  rawInput: string;
}

/**
 * Validates and normalizes WhatsApp Group Invite or Channel Link
 */
export function validateWhatsAppLink(input: string): LinkValidationResult {
  const raw = (input || '').trim();
  if (!raw) {
    return {
      isValid: false,
      type: 'empty',
      label: 'Required',
      message: 'WhatsApp group or channel invite link is required',
      normalizedUrl: '',
      rawInput: raw,
    };
  }

  let url = raw;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const path = parsed.pathname;

    // 1. WhatsApp Group Invite: chat.whatsapp.com/CODE
    if (host === 'chat.whatsapp.com') {
      const code = path.replace(/^\//, '').trim();
      if (code.length >= 15 && /^[A-Za-z0-9_-]+$/.test(code)) {
        return {
          isValid: true,
          type: 'whatsapp_group',
          label: 'Group Invite Verified',
          message: 'Valid WhatsApp Community / Group Invite link',
          normalizedUrl: `https://chat.whatsapp.com/${code}`,
          rawInput: raw,
        };
      } else if (code.length > 0) {
        return {
          isValid: true,
          type: 'whatsapp_group',
          label: 'Group Link Format',
          message: 'Valid WhatsApp Group link pattern',
          normalizedUrl: url,
          rawInput: raw,
        };
      }
    }

    // 2. WhatsApp Official Channel: whatsapp.com/channel/CODE
    if (host === 'whatsapp.com') {
      if (path.startsWith('/channel/')) {
        const channelId = path.replace('/channel/', '').trim();
        if (channelId.length >= 8) {
          return {
            isValid: true,
            type: 'whatsapp_channel',
            label: 'Channel Verified',
            message: 'Valid WhatsApp Official Channel URL',
            normalizedUrl: `https://whatsapp.com/channel/${channelId}`,
            rawInput: raw,
          };
        }
      }
    }

    // 3. wa.me shortlink variant
    if (host === 'wa.me' && path.startsWith('/channel/')) {
      const channelId = path.replace('/channel/', '').trim();
      if (channelId.length >= 8) {
        return {
          isValid: true,
          type: 'whatsapp_channel',
          label: 'Channel Verified',
          message: 'Valid WhatsApp Channel URL (wa.me)',
          normalizedUrl: `https://whatsapp.com/channel/${channelId}`,
          rawInput: raw,
        };
      }
    }

    return {
      isValid: false,
      type: 'invalid',
      label: 'Invalid Format',
      message: 'Must start with https://chat.whatsapp.com/... or https://whatsapp.com/channel/...',
      normalizedUrl: url,
      rawInput: raw,
    };
  } catch {
    return {
      isValid: false,
      type: 'invalid',
      label: 'Invalid URL',
      message: 'Please enter a valid URL',
      normalizedUrl: '',
      rawInput: raw,
    };
  }
}

/**
 * Validates and normalizes Telegram Channel / Group Link
 */
export function validateTelegramLink(input: string): LinkValidationResult {
  const raw = (input || '').trim();
  if (!raw) {
    return {
      isValid: false,
      type: 'empty',
      label: 'Required',
      message: 'Telegram store channel or group link is required',
      normalizedUrl: '',
      rawInput: raw,
    };
  }

  let url = raw;
  // Handle @handle pasted as link
  if (url.startsWith('@')) {
    const handle = url.substring(1).trim();
    if (/^[a-zA-Z0-9_]{4,32}$/.test(handle)) {
      return {
        isValid: true,
        type: 'telegram_channel',
        label: 'Public Channel (@' + handle + ')',
        message: 'Auto-resolved Telegram public channel link',
        normalizedUrl: `https://t.me/${handle}`,
        rawInput: raw,
      };
    }
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const path = parsed.pathname;

    if (host === 't.me' || host === 'telegram.me') {
      const cleanPath = path.replace(/^\//, '').trim();

      // Private Join Link: https://t.me/+CODE
      if (cleanPath.startsWith('+') || cleanPath.startsWith('joinchat/')) {
        return {
          isValid: true,
          type: 'telegram_invite',
          label: 'Private Invite Link',
          message: 'Valid Telegram private invite join link',
          normalizedUrl: url,
          rawInput: raw,
        };
      }

      // Public Channel / Group username: https://t.me/mychannel
      if (/^[a-zA-Z0-9_]{4,32}$/.test(cleanPath)) {
        return {
          isValid: true,
          type: 'telegram_channel',
          label: 'Public Channel (@' + cleanPath + ')',
          message: 'Valid Telegram public channel / group link',
          normalizedUrl: `https://t.me/${cleanPath}`,
          rawInput: raw,
        };
      }

      if (cleanPath.length >= 3) {
        return {
          isValid: true,
          type: 'telegram_channel',
          label: 'Telegram Link Format',
          message: 'Valid Telegram link pattern',
          normalizedUrl: url,
          rawInput: raw,
        };
      }
    }

    return {
      isValid: false,
      type: 'invalid',
      label: 'Invalid Format',
      message: 'Must start with https://t.me/... or @channel_handle',
      normalizedUrl: url,
      rawInput: raw,
    };
  } catch {
    return {
      isValid: false,
      type: 'invalid',
      label: 'Invalid URL',
      message: 'Please enter a valid URL',
      normalizedUrl: '',
      rawInput: raw,
    };
  }
}

/**
 * Validates Phone Number
 */
export function validatePhoneNumber(phone: string, countryCode: string = '+91'): { isValid: boolean; message: string; cleanDigits: string } {
  const clean = (phone || '').replace(/[^0-9]/g, '');
  if (!clean) {
    return { isValid: false, message: 'Phone number is required', cleanDigits: '' };
  }

  if (countryCode === '+91') {
    if (clean.length === 10) {
      return { isValid: true, message: 'Valid 10-digit Indian Mobile Number', cleanDigits: clean };
    }
    return { isValid: false, message: 'Indian phone numbers must be exactly 10 digits', cleanDigits: clean };
  }

  if (clean.length >= 7 && clean.length <= 15) {
    return { isValid: true, message: 'Valid International Phone Format', cleanDigits: clean };
  }

  return { isValid: false, message: 'Phone number must be between 7-15 digits', cleanDigits: clean };
}

/**
 * Ensures any external URL has a valid https:// scheme so it doesn't resolve relatively in Next.js
 */
export function normalizeExternalUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('@')) {
    return `https://t.me/${trimmed.substring(1)}`;
  }
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`;
  }
  return trimmed;
}
