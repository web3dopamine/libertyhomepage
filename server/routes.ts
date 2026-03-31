import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Liberty Chain data endpoints
  app.get("/api/chain-data", (_req, res) => {
    const data = storage.getChainData();
    res.json(data);
  });

  app.get("/api/metrics", (_req, res) => {
    const metrics = storage.getMetrics();
    res.json(metrics);
  });

  app.get("/api/features", (_req, res) => {
    const features = storage.getFeatures();
    res.json(features);
  });

  // Events CRUD
  app.get("/api/events", (_req, res) => {
    res.json(storage.getEvents());
  });

  app.post("/api/events", (req, res) => {
    const result = insertEventSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }
    const event = storage.createEvent(result.data);
    res.status(201).json(event);
  });

  app.put("/api/events/:id", (req, res) => {
    const { id } = req.params;
    const result = insertEventSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() });
    }
    const updated = storage.updateEvent(id, result.data);
    if (!updated) return res.status(404).json({ error: "Event not found" });
    res.json(updated);
  });

  app.delete("/api/events/:id", (req, res) => {
    const { id } = req.params;
    const deleted = storage.deleteEvent(id);
    if (!deleted) return res.status(404).json({ error: "Event not found" });
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
