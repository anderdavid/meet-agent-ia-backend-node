import { z } from 'zod';

export const meetSchema = z.object({
 nameMeeting: z.string().min(2, 'Field nameMeting is mandatory'),
 description: z.string().min(2, ',Field description is mandatory'),
 userId: z.string().min(2, 'Field userId is mandatory'),
});
