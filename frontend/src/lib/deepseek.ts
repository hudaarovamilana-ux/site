import {
  ASK_SYSTEM_PROMPT,
  HEALTH_ASSESSMENT_SYSTEM_PROMPT,
  TRUST_CHAT_SYSTEM_PROMPT,
} from "@/lib/ai-prompts";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DeepSeekResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
}

export async function askDeepSeek(
  messages: ChatMessage[],
  options?: { model?: string; maxTokens?: number; temperature?: number }
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY не настроен на сервере");
  }

  const model = options?.model ?? process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      temperature: options?.temperature ?? 0.6,
      max_tokens: options?.maxTokens ?? 1200,
    }),
  });

  const data = (await response.json()) as DeepSeekResponse;

  if (!response.ok) {
    throw new Error(data.error?.message ?? `DeepSeek API error: ${response.status}`);
  }

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Пустой ответ от DeepSeek");
  }

  return content;
}

export async function generateHealthAssessment(profileSummary: string): Promise<string> {
  return askDeepSeek(
    [
      { role: "system", content: HEALTH_ASSESSMENT_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Проанализируй профиль и дай персональную оценку здоровья с рекомендациями:\n\n${profileSummary}`,
      },
    ],
    { maxTokens: 1500 }
  );
}

export async function generateAskAnswer(question: string): Promise<string> {
  return askDeepSeek(
    [
      { role: "system", content: ASK_SYSTEM_PROMPT },
      { role: "user", content: question },
    ],
    { maxTokens: 900 }
  );
}

export async function generateTrustReply(
  message: string,
  history: { role: "user" | "assistant"; text: string }[]
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: TRUST_CHAT_SYSTEM_PROMPT },
    ...history.slice(-6).map((m) => ({
      role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
      content: m.text,
    })),
    { role: "user", content: message },
  ];

  return askDeepSeek(messages, { maxTokens: 500, temperature: 0.7 });
}
