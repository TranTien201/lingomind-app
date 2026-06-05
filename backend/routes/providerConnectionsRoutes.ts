import { Router } from "express";
import { readProviderConnections, writeProviderConnections } from "../storage/providerConnectionStore";
import { discoverModels } from "../services/modelDiscoveryService";

export function createProviderConnectionsRoutes() {
  const router = Router();

  router.get("/provider-connections", async (_req, res) => {
    try {
      const state = await readProviderConnections();
      return res.json(state);
    } catch (error: any) {
      console.error("Load provider connections error:", error);
      return res.status(500).json({ error: error?.message || "Failed to load provider connections" });
    }
  });

  router.put("/provider-connections", async (req, res) => {
    try {
      const { activeConnectionId, connections } = req.body || {};
      if (!Array.isArray(connections)) {
        return res.status(400).json({ error: "connections must be an array" });
      }

      const state = await writeProviderConnections({ activeConnectionId, connections });
      return res.json(state);
    } catch (error: any) {
      console.error("Save provider connections error:", error);
      return res.status(500).json({ error: error?.message || "Failed to save provider connections" });
    }
  });

  router.post("/provider-connections/discover-models", async (req, res) => {
    try {
      const { provider, apiUrl, apiKey } = req.body || {};
      if (!provider) {
        return res.status(400).json({ error: "provider is required" });
      }

      const result = await discoverModels({ provider, apiUrl, apiKey });
      return res.json(result);
    } catch (error: any) {
      console.error("Discover models error:", error);
      return res.status(500).json({ error: error?.message || "Failed to discover models" });
    }
  });

  return router;
}
