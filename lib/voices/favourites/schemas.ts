import { z } from "zod";

/**
 * Runtime validation for every /api/favourites/* backend response. Nothing
 * from the backend is trusted unparsed — see
 * lib/voices/membership/schemas.ts for the same policy on the membership
 * subsystem.
 *
 * The embedded show on a favourite row is deliberately NOT re-validated
 * field-by-field here — it's kept as an untyped record and normalized
 * through lib/voices/normalizers.ts#normalizeShow, exactly like every
 * other show the frontend fetches (see lib/voices/api.ts). Duplicating
 * VoicesShowRaw as a second zod schema would only give the two a chance to
 * drift.
 */

export const favouriteListSchema = z.object({
  id: z.string(),
  name: z.string(),
  isDefault: z.boolean(),
  showCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type FavouriteListApi = z.infer<typeof favouriteListSchema>;

export const listsResponseSchema = z.object({
  lists: z.array(favouriteListSchema),
});

export const listResponseSchema = z.object({
  list: favouriteListSchema,
});

export const favouriteStatusSchema = z.object({
  saved: z.literal(true),
  listIds: z.array(z.string()),
});

export const statusResponseSchema = z.object({
  // Keyed by showId; a show absent from the map is simply unsaved — see
  // routes/favourites.js's GET /status handler.
  statuses: z.record(z.string(), favouriteStatusSchema),
});
export type FavouriteStatusMap = z.infer<typeof statusResponseSchema>["statuses"];

export const saveResponseSchema = z.object({
  showId: z.string(),
  listIds: z.array(z.string()),
});

export const favouriteRowSchema = z.object({
  showId: z.string(),
  show: z.record(z.string(), z.unknown()).nullable(),
  listIds: z.array(z.string()),
  createdAt: z.string(),
});

export const favouritesResponseSchema = z.object({
  favourites: z.array(favouriteRowSchema),
  nextCursor: z.string().nullable(),
});

export const messageResponseSchema = z.object({ message: z.string() });
