import { z } from 'zod';

export const evidenceLinkSchema = z.object({
  type: z.string(),
  url: z.string().url({ message: 'Must be a valid URL (e.g. https://...)' }),
  label: z.string().min(1, { message: 'Evidence label is required' })
});

export const reportSchema = z.object({
  scammer_name: z.string().min(2, { message: 'Scammer name must be at least 2 characters' }),
  telegram_username: z.string().optional().or(z.literal('')),
  whatsapp_number: z.string().optional().or(z.literal('')),
  upi_id: z.string().optional().or(z.literal('')),
  instagram_username: z.string().optional().or(z.literal('')),
  bgmi_uid: z.string().optional().or(z.literal('')),
  
  description: z.string().min(100, { message: 'Description must be at least 100 characters detailing the incident' }),
  amount_lost: z.coerce.number().min(0, { message: 'Amount lost must be 0 or more' }),
  victim_phone_number: z.string().optional().or(z.literal('')),
  incident_date: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Must be a valid date' }),
  scam_type: z.enum([
    'bank_account_freeze',
    'account_pullback',
    'fake_account_sale', 
    'payment_fraud', 
    'fake_buyer', 
    'impersonation', 
    'item_scam', 
    'advance_payment', 
    'qr_phishing',
    'other'
  ]),
  evidence_links: z.array(evidenceLinkSchema).max(10, { message: 'Maximum of 10 evidence links allowed' })
}).passthrough().refine(data => {
  // Ensure at least one identifier is provided
  return !!(
    data.telegram_username ||
    data.whatsapp_number ||
    data.upi_id ||
    data.instagram_username ||
    data.bgmi_uid
  );
}, {
  message: 'You must provide at least one identifier (WhatsApp Number, Telegram, UPI ID, or Instagram) to file this scam report.',
  path: ['whatsapp_number']
});

export type ReportSubmission = z.infer<typeof reportSchema>;
