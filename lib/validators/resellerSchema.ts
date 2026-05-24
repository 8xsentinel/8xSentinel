import { z } from 'zod';

export const resellerSchema = z.object({
  store_name: z.string().min(3, { message: 'Store name must be at least 3 characters' }),
  tagline: z.string().max(80, { message: 'Tagline must be less than 80 characters' }).optional().or(z.literal('')),
  bio: z.string().min(20, { message: 'Bio must be at least 20 characters describing your services' }),
  telegram_username: z.string().min(3, { message: 'Valid Telegram username required' }),
  whatsapp_number: z.string().optional().or(z.literal('')),
  instagram_username: z.string().optional().or(z.literal('')),
  youtube_channel: z.string().optional().or(z.literal('')),
  years_active: z.coerce.number().min(0, { message: 'Years active must be 0 or more' }),
  specializes_in: z.array(z.string()).min(1, { message: 'Select at least one specialty' }),
  price_range: z.string().optional().or(z.literal(''))
});

export type ResellerApplication = z.infer<typeof resellerSchema>;
