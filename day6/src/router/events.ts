import { Hono } from "hono";
import { prisma } from "../utils/prisma.js";
import { zValidator } from "@hono/zod-validator";
import {
  createEventValidation,
  updateEventValidation,
  eventQueryValidation,
} from "../validation/event-validation.js";
import { calculateEventStatus } from "../utils/event-status.js";

export const eventsRoute = new Hono()
  .get("/", zValidator("query", eventQueryValidation), async (c) => {
    const query = c.req.valid("query");

    const where: any = {};
    if (query.category) where.category = query.category;
    if (query.type) where.type = query.type;

    const events = await prisma.event.findMany({
      where,
      include: {
        participants: true,
      },
    });

    let result = events.map((event) => ({
      ...event,
      status: calculateEventStatus(event.dateTime, event.endDateTime),
    }));

    if (query.status) {
      result = result.filter((event) => event.status === query.status);
    }
    return c.json({ events: result });
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    const event = await prisma.event.findFirst({
      where: {
        id: id,
      },
      include: {
        participants: true,
      },
    });

    if (!event) {
      return c.json({ message: "Event not found" }, 404);
    }

    return c.json({
      event: {
        ...event,
        status: calculateEventStatus(event.dateTime, event.endDateTime),
      },
    });
  })
  .post("/", zValidator("json", createEventValidation), async (c) => {
    const body = c.req.valid("json");

    const start = new Date(body.dateTime);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

    const newEvent = await prisma.event.create({
      data: {
        name: body.name,
        description: body.description,
        dateTime: body.dateTime,
        endDateTime: end.toISOString(),
        location: body.location,
        category: body.category || "SEMINAR",
        type: body.type || "OFFLINE",
      },
    });

    return c.json({ event: newEvent }, 201);
  })
  .patch("/:id", zValidator("json", updateEventValidation), async (c) => {
    const id = c.req.param("id");
    const body = c.req.valid("json");

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return c.json({ message: "Event not found" }, 404);
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description && { description: body.description }),
        ...(body.dateTime && { dateTime: body.dateTime }),
        ...(body.location && { location: body.location }),
        ...(body.category && { category: body.category }),
        ...(body.type && { type: body.type }),
      },
    });

    return c.json({ event: updatedEvent });
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return c.json({ message: "Event not found" }, 404);
    }

    await prisma.event.delete({
      where: {
        id: id,
      },
    });

    return c.json({ message: "Event deleted successfully" });
  });
