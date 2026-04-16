export const translateText = async (text: string, targetLang: string) => {
  if (!text) return "";
  if (targetLang === "en") return text;

  try {
    const res = await fetch("http://localhost:5000/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, targetLang }),
    });

    if (!res.ok) return text;

    const data = await res.json();

    return data?.translated || text;
  } catch (err) {
    console.error("Frontend error:", err);
    return text;
  }
};