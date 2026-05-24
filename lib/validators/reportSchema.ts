import { z } from 'zod';

export const evidenceLinkSchema = z.object({
  type: z.enum(['telegram', 'youtube', 'drive', 'image', 'other']),
  url: z.string().url({ message: 'Must be a valid URL (e.g. https://...)' }),
  label: z.string().min(2, { message: 'Label must be at least 2 characters' })
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
  incident_date: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Must be a valid date' }),
  scam_type: z.enum([
    'fake_account_sale', 
    'payment_fraud', 
    'fake_buyer', 
    'impersonation', 
    'item_scam', 
    'advance_payment', 
    'other'
  ]),
  evidence_links: z.array(evidenceLinkSchema).max(10, { message: 'Maximum of 10 evidence links allowed' })
}).refine(data => {
  // Ensure at least one identifier is provided
  return !!(
    data.telegram_username ||
    data.whatsapp_number ||
    data.upi_id ||
    data.instagram_username ||
    data.bgmi_uid
  );
}, {
  message: 'You must provide at least one identifier (Telegram, WhatsApp, UPI, Instagram, or BGMI UID) to help flag this scammer.',
  path: ['telegram_username'] // associate with the first identifier field
});

export type ReportSubmission = z.infer<typeof reportSchema>;
