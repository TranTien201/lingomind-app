import { Router } from "express";
import { AiService } from "../ai/AiService";

export function createAiRoutes() {
  const router = Router();
  const aiService = new AiService();

  router.post("/lookupWord", async (req, res) => {
    try {
      const { word, provider, model, apiUrl, apiKey } = req.body;
      if (!word) {
        return res.status(400).json({ error: "Word is required" });
      }

      const result = await aiService.lookupWord({ word, provider, model, apiUrl, apiKey });
      return res.json(result);
    } catch (error: any) {
      console.error("AI lookupWord error:", error);
      return res.status(500).json({ error: error?.message || "Failed to fetch word details" });
    }
  });

  router.post("/analyzeSentence", async (req, res) => {
    try {
      const { english, vietnamese, provider, model, apiUrl, apiKey } = req.body;
      if (!english || !vietnamese) {
        return res.status(400).json({ error: "English and Vietnamese sentencess are required" });
      }

      const result = await aiService.analyzeSentence({ english, vietnamese, provider, model, apiUrl, apiKey });
      return res.json(result);
    } catch (error: any) {
      console.error("AI analyzeSentence error:", error);
      return res.status(500).json({ error: error?.message || "Failed to analyze sentence" });
    }
  });

  return router;
}
