import { z } from "zod";
import { router, protectedProcedure } from "../trpc"
import { supabaseAdmin } from "../supabase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export const chatRouter = router({
    history: protectedProcedure
        .input(z.object({ limit: z.number().default(100) }))
        .query(async ({ ctx, input }) => {
            const { data } = await supabaseAdmin
                .from("messages")
                .select("*")
                .eq("user_id", ctx.user.id)
                .order("created_at", { ascending: true })
                .limit(input.limit);
            return data || [];
        }),

    send: protectedProcedure
        .input(
            z.object({
                modelTag: z.string(),
                prompt: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            try {
                const userId = ctx.user.id;

                console.log("✅ send mutation started", { userId, model: input.modelTag });

                const userInsert = await supabaseAdmin.from("messages").insert({
                    user_id: userId,
                    role: "user",
                    model_tag: input.modelTag,
                    content: input.prompt,
                });
                console.log("📝 Insert user message:", userInsert.error);

                const model = genAI.getGenerativeModel({ model: input.modelTag });

                const { data: historyData, error: historyErr } = await supabaseAdmin
                    .from("messages")
                    .select("role, content")
                    .eq("user_id", userId)
                    .order("created_at", { ascending: true })
                    .limit(20);

                console.log("📚 History:", historyErr);

                const formattedHistory = historyData?.map((msg) => ({
                    role: msg.role === "assistant" ? "model" : "user",
                    parts: [{ text: msg.content }],
                })) ?? [];


                const result = await model.generateContent({
                    contents: [
                        ...formattedHistory,
                        {
                            role: "user",
                            parts: [{ text: input.prompt }],
                        },
                    ],
                });


                console.log("🤖 AI stream started");

                const fullText = result.response.text();

                console.log("✅ AI Response:", fullText);

                const { error: assistantErr } = await supabaseAdmin
                    .from("messages")
                    .insert({
                        user_id: userId,
                        role: "assistant",
                        model_tag: input.modelTag,
                        content: fullText,
                    });

                console.log("🤖 Insert assistant:", assistantErr);

                if (assistantErr) throw assistantErr;

                return { success: true, content: fullText };
            } catch (err: any) {
                console.error("🔥 ERROR in chat.send:", {
                    message: err?.message,
                    cause: err?.cause,
                    status: err?.status,
                    raw: err
                });
                throw new Error(err?.message || "Unknown server error");
            }
        }),


    delete: protectedProcedure
        .input(z.object({ messageId: z.string() }))
        .mutation(async ({ input }) => {
            await supabaseAdmin.from("messages").delete().eq("id", input.messageId);
            return { success: true };
        }),
});
