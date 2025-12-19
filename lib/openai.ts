import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function classifyPriority(title: string, description: string): Promise<{ priority: string; confidence: number; raw?: string }> {
  // Ask the model to return a compact JSON object with priority and confidence (0-1).
  const system = 'You are an assistant that classifies task priority. You must respond with a single valid JSON object and no extra text. The object should have two fields: "priority" (one of: LOW, MEDIUM, HIGH, CRITICAL) and "confidence" (a number between 0 and 1). Example: {"priority":"HIGH","confidence":0.87}';
  const user = `Analyze this task and classify priority based on urgency, impact, and intent. Return a JSON object exactly as specified.\n\nTitle: ${title}\nDescription: ${description}`;

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: 60,
      temperature: 0,
    });

  const text = completion.choices?.[0]?.message?.content ?? '';

    // Try parsing JSON first; fall back to regex extraction.
    try {
      const obj = JSON.parse(text.trim());
      const priority = (obj.priority || 'MEDIUM').toString().toUpperCase();
      const conf = typeof obj.confidence === 'number' ? Math.max(0, Math.min(1, obj.confidence)) : 0.0;
      return { priority, confidence: conf, raw: text };
    } catch (jsonErr) {
      const match = text.match(/LOW|MEDIUM|HIGH|CRITICAL/i);
      const priority = match ? match[0].toUpperCase() : 'MEDIUM';
      // try to extract a number as confidence
      const numMatch = text.match(/0?\.\d+|1(?:\.0+)?|\d+\.?\d*/);
      const confidence = numMatch ? Math.max(0, Math.min(1, parseFloat(numMatch[0]))) : 0;
      return { priority, confidence, raw: text };
    }
  } catch (err) {
    console.error('OpenAI error', err);
    return { priority: 'MEDIUM', confidence: 0 };
  }
}
