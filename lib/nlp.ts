import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type ParsedTask = {
  title: string;
  description: string;
  priority: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL';
  dueDate?: string | null; // ISO string or null
  tags?: string[];
  raw?: string;
};

export async function parseNaturalLanguageTask(text: string): Promise<ParsedTask> {
  const system = `You are an assistant that converts a user's natural language task into a strict JSON object and nothing else. The JSON object must have these fields:
  - title: a short title (string)
  - description: a slightly longer description (string)
  - priority: one of LOW, MEDIUM, HIGH, CRITICAL
  - dueDate: an ISO-8601 date-time string if a due date/time was specified, otherwise null
  - tags: an array of short tag strings (may be empty)

Respond with a single JSON object and no additional commentary.`;

  const user = `Parse this text into the JSON schema exactly: ${text}`;

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.1,
      max_tokens: 300,
    });

    const textResp = completion.choices?.[0]?.message?.content ?? '';

    try {
      const obj = JSON.parse(textResp.trim());
      const priority = (obj.priority || 'MEDIUM').toString().toUpperCase();
      const parsed: ParsedTask = {
        title: obj.title || '',
        description: obj.description || '',
        priority: (['LOW','MEDIUM','HIGH','CRITICAL'].includes(priority) ? priority : 'MEDIUM') as ParsedTask['priority'],
        dueDate: obj.dueDate ?? null,
        tags: Array.isArray(obj.tags) ? obj.tags.map(String) : [],
        raw: textResp,
      };
      return parsed;
    } catch (err) {
      // fallback: minimal parse
      const title = text.split(/[\.\n]/)[0].slice(0, 120);
      return { title, description: text, priority: 'MEDIUM', dueDate: null, tags: [], raw: textResp };
    }
  } catch (err) {
    console.error('parseNaturalLanguageTask error', err);
    return { title: text.slice(0, 80), description: text, priority: 'MEDIUM', dueDate: null, tags: [], raw: '' };
  }
}
