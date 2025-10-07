
import { Router } from "express";

export const EMOJIS = ["😀", "🎉", "🚀", "🍕"];

export function getRandomEmoji(rng = Math.random) {
  const index = Math.floor(rng() * EMOJIS.length);
  return EMOJIS[index];
}

export const router = Router();

router.get("/random", (_req, res) => {
  const emoji = getRandomEmoji();
  res.json({ emoji });
});

router.get("/", (_req, res) => {
  res.json(["😀", "😳", "🙄"]);
});

export default router;