import demoCache from "@/data/demo-cache.json";
import { DEMO_STOP_MESSAGE } from "@/utils/demo";
import type { NextApiRequest, NextApiResponse } from "next";

type CachedAnswer = {
  answer: string;
  sourceLinks: string[];
};

type Data = CachedAnswer | { error: string };

const cache: Record<string, CachedAnswer> = demoCache;

// Serves the pre-cached answers for the homepage headlines. Never calls OpenAI or scrapes sources.
const demoHandler = (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const { query } = (req.body ?? {}) as { query?: unknown };
  const key = typeof query === "string" ? query.trim() : "";

  if (!Object.prototype.hasOwnProperty.call(cache, key)) {
    return res.status(404).json({ error: DEMO_STOP_MESSAGE });
  }

  res.status(200).json(cache[key]);
};

export default demoHandler;
