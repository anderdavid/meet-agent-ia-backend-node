import { z } from 'zod';

export const meetSchema = z.object({
 nameMeeting: z.string().min(6, 'Field nameMeting is mandatory'),
 description: z.string().min(10, ',Field description is mandatory'),
 userId: z.string().min(10, 'Field userId is mandatory'),
});
