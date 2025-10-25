import { router, publicProcedure } from "../trpc";

export const modelsRouter = router({
  getAvailable: publicProcedure.query(() => {
    return [
      {
        id: "g25p",
        tag: "gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
        description: "Cutting-edge reasoning & long context",
        created_at: new Date().toISOString(),
      },
      {
        id: "g25f",
        tag: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        description: "Best price-to-performance",
        created_at: new Date().toISOString(),
      },
      {
        id: "g25fl",
        tag: "gemini-2.5-flash-lite",
        name: "Gemini 2.5 Flash Lite",
        description: "Ultra fast and low-cost",
        created_at: new Date().toISOString(),
      },
      {
        id: "g20f",
        tag: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        description: "2nd gen, 1M token context window",
        created_at: new Date().toISOString(),
      },
      {
        id: "g20fl",
        tag: "gemini-2.0-flash-lite",
        name: "Gemini 2.0 Flash Lite",
        description: "2nd gen small + powerful",
        created_at: new Date().toISOString(),
      },
    ];
  }),
});
