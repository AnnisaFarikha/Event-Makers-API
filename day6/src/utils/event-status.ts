import { EventStatus } from "../generated/prisma/client.js";

export function calculateEventStatus(
  startDateTime: string,
  endDateTime?: string | null
): EventStatus {
  const start = new Date(startDateTime);
  const now = new Date();

  if (!endDateTime) {
    return now < start ? EventStatus.UPCOMING : EventStatus.COMPLETED;
  }

  const end = new Date(endDateTime);

  if (now < start) return EventStatus.UPCOMING;
  if (now >= start && now <= end) return EventStatus.ONGOING;
  return EventStatus.COMPLETED;
}
