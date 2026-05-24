import { ScammerEntity } from '../../types';

function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  // Strip non-digits, keep last 10 digits to normalize country codes (like +91)
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

function normalizeTelegram(username: string | null | undefined): string | null {
  if (!username) return null;
  // Lowercase and strip leading '@'
  return username.trim().toLowerCase().replace(/^@/, '');
}

function normalizeUpi(upi: string | null | undefined): string | null {
  if (!upi) return null;
  return upi.trim().toLowerCase();
}

function normalizeInstagram(username: string | null | undefined): string | null {
  if (!username) return null;
  return username.trim().toLowerCase().replace(/^@/, '');
}

function normalizeBgmiUid(uid: string | null | undefined): string | null {
  if (!uid) return null;
  return uid.trim().replace(/\D/g, ''); // BGMI UIDs are digits only
}

export interface MatchingIdentifiers {
  telegram_username?: string | null;
  whatsapp_number?: string | null;
  upi_id?: string | null;
  instagram_username?: string | null;
  bgmi_uid?: string | null;
}

/**
 * Finds if there's any match between a new report's identifiers and an existing entity
 * Returns a score between 0 and 1. If score >= 0.8, it's considered a match.
 */
export function findMatchingEntity(
  newIdentifiers: MatchingIdentifiers,
  entities: ScammerEntity[]
): { entity: ScammerEntity; score: number } | null {
  const normTg = normalizeTelegram(newIdentifiers.telegram_username);
  const normPhone = normalizePhone(newIdentifiers.whatsapp_number);
  const normUpi = normalizeUpi(newIdentifiers.upi_id);
  const normInsta = normalizeInstagram(newIdentifiers.instagram_username);
  const normUid = normalizeBgmiUid(newIdentifiers.bgmi_uid);

  let bestMatch: ScammerEntity | null = null;
  let highestScore = 0;

  for (const entity of entities) {
    let matchCount = 0;
    let totalChecked = 0;

    const knownIds = entity.known_identifiers || {};

    // 1. Telegram Match
    if (normTg && knownIds.telegram) {
      totalChecked++;
      const matches = knownIds.telegram.some(tg => normalizeTelegram(tg) === normTg);
      if (matches) matchCount++;
    }

    // 2. WhatsApp Phone Match
    if (normPhone && knownIds.whatsapp) {
      totalChecked++;
      const matches = knownIds.whatsapp.some(ph => normalizePhone(ph) === normPhone);
      if (matches) matchCount++;
    }

    // 3. UPI ID Match
    if (normUpi && knownIds.upi) {
      totalChecked++;
      const matches = knownIds.upi.some(upi => normalizeUpi(upi) === normUpi);
      if (matches) matchCount++;
    }

    // 4. Instagram Match
    if (normInsta && knownIds.instagram) {
      totalChecked++;
      const matches = knownIds.instagram.some(inst => normalizeInstagram(inst) === normInsta);
      if (matches) matchCount++;
    }

    // 5. BGMI UID Match
    if (normUid && knownIds.bgmi_uid) {
      totalChecked++;
      const matches = knownIds.bgmi_uid.some(uid => normalizeBgmiUid(uid) === normUid);
      if (matches) matchCount++;
    }

    if (totalChecked > 0) {
      const score = matchCount / totalChecked;
      
      // If there is any exact identifier overlap, we can boost/return exact match
      // For instance, matching UPI or UID or WhatsApp is a high confidence match.
      const hasExactCriticalMatch = 
        (normUpi && knownIds.upi && knownIds.upi.some(upi => normalizeUpi(upi) === normUpi)) ||
        (normPhone && knownIds.whatsapp && knownIds.whatsapp.some(ph => normalizePhone(ph) === normPhone)) ||
        (normUid && knownIds.bgmi_uid && knownIds.bgmi_uid.some(uid => normalizeBgmiUid(uid) === normUid));

      const finalScore = hasExactCriticalMatch ? 1.0 : score;

      if (finalScore > highestScore) {
        highestScore = finalScore;
        bestMatch = entity;
      }
    }
  }

  if (highestScore >= 0.8 && bestMatch) {
    return { entity: bestMatch, score: highestScore };
  }

  return null;
}
