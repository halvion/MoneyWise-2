import { MAX_DATE_RANGE_DAYS } from "@/lib/constants";
import { differenceInDays } from "date-fns";
import { z } from "zod";
import { UpdateUserModeSchema } from "@/schema/userSettings"; // Adjust the import path as needed

export const OverviewQuerySchema = z
  .object({
    from: z.coerce.date(),
    to: z.coerce.date(),
    mode: UpdateUserModeSchema.shape.mode, // Reuse the mode schema
  })
  .refine((args) => {
    const { from, to } = args;
    const days = differenceInDays(to, from);

    const isValidRange = days >= 0 && days <= MAX_DATE_RANGE_DAYS;
    return isValidRange;
  }, {
    message: `The selected date range is too long. Please select a range of ${MAX_DATE_RANGE_DAYS} days or less.`,
  });