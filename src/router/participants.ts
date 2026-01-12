import { Hono } from "hono";
import { prisma } from "../utils/prisma.js";
import { zValidator } from "@hono/zod-validator";
import { createParticipantValidation } from "../validation/participant-validation.js";

export const participantsRoute = new Hono()
  .get("/", async (c) => {
    const participants = await prisma.participant.findMany({
      include: {
        event: true,
      },
    });
    return c.json({ participants });
  })
  .get("/event/:eventId", async (c) => {
    const eventId = c.req.param("eventId");

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return c.json({ message: "Event not found" }, 404);
    }

    const participants = await prisma.participant.findMany({
      where: { eventId },
    });

    return c.json({ participants });
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    const participant = await prisma.participant.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!participant) {
      return c.json({ message: "Participant not found" }, 404);
    }

    return c.json({ participant });
  })
  .post("/", zValidator("json", createParticipantValidation), async (c) => {
    const body = c.req.valid("json");

    const event = await prisma.event.findUnique({
      where: { id: body.eventId },
    });

    if (!event) {
      return c.json({ message: "Event not found" }, 404);
    }

    const newParticipant = await prisma.participant.create({
      data: {
        name: body.name,
        email: body.email,
        eventId: body.eventId,
      },
    });

    return c.json({ participant: newParticipant }, 201);
  })
  .patch("/:id", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();

    const participant = await prisma.participant.findUnique({
      where: { id },
    });

    if (!participant) {
      return c.json({ message: "Participant not found" }, 404);
    }

    const updatedParticipant = await prisma.participant.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        eventId: body.eventId,
      },
    });

    return c.json({ participant: updatedParticipant });
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    const participant = await prisma.participant.findUnique({
      where: { id },
    });

    if (!participant) {
      return c.json({ message: "Participant not found" }, 404);
    }

    await prisma.participant.delete({
      where: { id },
    });

    return c.json({ message: "Participant deleted successfully" });
  });
