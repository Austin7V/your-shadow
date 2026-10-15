import { z } from "zod";

import {
  confirmMealRequestSchema,
  type ConfirmMealRequest,
  type ConfirmMealResponse,
} from "./meal-confirmation.contract";

export const listMealsQuerySchema = z.strictObject({
  date: z.iso.date(),
});

export type ListMealsQuery = z.infer<typeof listMealsQuerySchema>;

export type MealEntryResponse = ConfirmMealRequest &
  ConfirmMealResponse & {
    updatedAt: string;
  };

export type ListMealsResponse = {
  localDate: string;
  meals: MealEntryResponse[];
};

// Editing submits the complete reviewed meal, so the server can validate it
// before replacing the encrypted content.
export const updateMealRequestSchema = confirmMealRequestSchema;

export type UpdateMealRequest = z.infer<typeof updateMealRequestSchema>;
