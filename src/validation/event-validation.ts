import z from "zod";

export const createEventValidation = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  dateTime: z.string().datetime(),
  location: z.string().min(1),
  category: z.enum(["SEMINAR", "WORKSHOP", "CONFERENCE", "MEETUP"]).optional(),
  type: z.enum(["ONLINE", "OFFLINE", "HYBRID"]).optional(),
});

export const updateEventValidation = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  dateTime: z.string().datetime().optional(),
  location: z.string().min(1).optional(),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).optional(),
  category: z.enum(["SEMINAR", "WORKSHOP", "CONFERENCE", "MEETUP"]).optional(),
  type: z.enum(["ONLINE", "OFFLINE", "HYBRID"]).optional(),
});

export const eventQueryValidation = z.object({
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).optional(),
  category: z.enum(["SEMINAR", "WORKSHOP", "CONFERENCE", "MEETUP"]).optional(),
  type: z.enum(["ONLINE", "OFFLINE", "HYBRID"]).optional(),
});
