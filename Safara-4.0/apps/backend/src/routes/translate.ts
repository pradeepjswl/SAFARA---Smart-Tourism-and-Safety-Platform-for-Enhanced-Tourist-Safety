import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/", async (req, res) => {
  const { text, targetLang } = req.body;

  // 🔒 Validation
  if (!text) {
    return res.json({ translated: "" });
  }

  try {
    // =========================
    // 🔹 STEP 1: TRY BHASHINI
    // =========================
    try {
      const bhashiniRes = await fetch(
        "https://dhruva-api.bhashini.gov.in/services/inference/pipeline",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.BHASHINI_API_KEY}`,
          },
          body: JSON.stringify({
            pipelineTasks: [
              {
                taskType: "translation",
                config: {
                  language: {
                    sourceLanguage: "en",
                    targetLanguage: targetLang,
                  },
                  serviceId: "ai4bharat/indictrans-v2-all-gpu--t4",
                },
              },
            ],
            inputData: {
              input: [{ source: text }],
            },
          }),
        }
      );

      const raw = await bhashiniRes.text();

      let data: any;

      try {
        data = JSON.parse(raw);
      } catch {
        console.log("⚠️ Bhashini returned non-JSON");
      }

      const bhashiniTranslation =
        data?.pipelineResponse?.[0]?.output?.[0]?.target;

      if (bhashiniTranslation) {
        return res.json({ translated: bhashiniTranslation });
      }
    } catch (err) {
      console.log("⚠️ Bhashini failed:", err);
    }

    // =========================
    // 🔹 STEP 2: GOOGLE FALLBACK (WORKING)
    // =========================
    try {
      const googleRes = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(
          text
        )}`
      );

      const googleData: any = await googleRes.json();

      const translated =
        googleData?.[0]?.map((item: any) => item[0]).join("") || text;

      return res.json({ translated });
    } catch (err) {
      console.log("⚠️ Google fallback failed:", err);
    }

    // =========================
    // 🔹 STEP 3: FINAL FALLBACK
    // =========================
    return res.json({
      translated: `[${targetLang.toUpperCase()}] ${text}`,
    });

  } catch (error) {
    console.error("❌ Translation error:", error);

    return res.json({
      translated: `[${targetLang.toUpperCase()}] ${text}`,
    });
  }
});

export default router;