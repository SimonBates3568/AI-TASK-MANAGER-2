import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function classifyPriority(title: string, description: string) {
  const prompt = `Analyze this task and classify priority based on urgency, impact, and intent. Return only one value: LOW, MEDIUM, HIGH, or CRITICAL.\n\nTitle: ${title}\nDescription: ${description}`;

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an assistant that returns only one of: LOW, MEDIUM, HIGH, CRITICAL.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 10,
      temperature: 0,
    });

    const text = completion.choices?.[0]?.message?.content ?? '';
    const match = text.match(/LOW|MEDIUM|HIGH|CRITICAL/i);
    if (match) return match[0].toUpperCase();
    return 'MEDIUM';
  } catch (err) {
    console.error('OpenAI error', err);
    return 'MEDIUM';
  }
}
