import { z } from "zod";

// Example job schema
export const exampleJobSchema = z.object({
  id: z.string(),
  data: z.record(z.unknown()),
});

export type ExampleJobPayload = z.infer<typeof exampleJobSchema>;

// Example job processor
export async function processExampleJob(payload: ExampleJobPayload) {
  console.log("Processing example job:", payload.id);
  // Job logic here
  return { success: true };
}
