import { z } from 'zod';
const schema=z.object({
 DATABASE_URL:z.string().min(1), DISCORD_TOKEN:z.string().min(1),
 DISCORD_CLIENT_ID:z.string().regex(/^\d{17,20}$/), DISCORD_CLIENT_SECRET:z.string().min(1),
 PUBLIC_URL:z.url().transform(value=>new URL(value).origin).refine(value=>value.startsWith('https://')||/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(value)),
 PORT:z.coerce.number().int().positive().default(3000),
 MESSAGE_CONTENT:z.string().optional().transform(value=>value==='true'),
});
export const env=schema.parse(process.env);
