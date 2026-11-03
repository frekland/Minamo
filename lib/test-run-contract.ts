import {z} from 'zod';
export const testRunDescriptor=z.object({version:z.literal(1),runId:z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,119}$/),scenario:z.string().min(1).max(12000),fictionalFrom:z.string().max(100).optional(),fictionalTo:z.string().max(100).optional(),stopInstruction:z.string().max(2000),evidence:z.enum(['readback','browser','deep'])}).strict();
export type TestRunDescriptor=z.infer<typeof testRunDescriptor>;
export const fictionalEventSchema=z.object({date:z.string().min(1).max(100),description:z.string().max(1000).optional()}).strict();
