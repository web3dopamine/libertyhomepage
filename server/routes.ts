import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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

  const httpServer = createServer(app);

  return httpServer;
}
