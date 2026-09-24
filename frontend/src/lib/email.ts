async function sendViaResend(to: string, subject: string, html: string, text: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY не настроен");

  const from = process.env.RESEND_FROM?.trim() || "Женская консультация <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html, text }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message ?? `Resend error: ${response.status}`);
  }
}

export async function sendVerificationEmail(to: string, code: string): Promise<void> {
  const subject = "Код подтверждения — Женская консультация";
  const text = [
    "Здравствуйте!",
    "",
    `Ваш код для подтверждения email: ${code}`,
    "",
    "Код действует 10 минут.",
    "Если вы не регистрировались на сайте, просто проигнорируйте это письмо.",
    "",
    "С заботой,",
    "Женская консультация",
  ].join("\n");

  const html = `
    <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color: #2c2420;">
      <p>Здравствуйте!</p>
      <p>Ваш код для подтверждения email:</p>
      <p style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #8b4a5c;">${code}</p>
      <p style="color: #6b5f58; font-size: 14px;">Код действует 10 минут.</p>
      <p style="color: #6b5f58; font-size: 14px;">Если вы не регистрировались на сайте, просто проигнорируйте это письмо.</p>
      <p style="margin-top: 24px; color: #6b5f58; font-size: 14px;">С заботой,<br>Женская консультация</p>
    </div>
  `;

  if (process.env.RESEND_API_KEY) {
    await sendViaResend(to, subject, html, text);
    return;
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`[email:dev] Код для ${to}: ${code}`);
    return;
  }

  throw new Error(
    "Почта не настроена. Добавьте RESEND_API_KEY в переменные окружения на сервере."
  );
}

export async function sendPasswordResetEmail(to: string, code: string): Promise<void> {
  const subject = "Сброс пароля — Женская консультация";
  const text = [
    "Здравствуйте!",
    "",
    `Ваш код для сброса пароля: ${code}`,
    "",
    "Код действует 10 минут.",
    "Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.",
    "",
    "С заботой,",
    "Женская консультация",
  ].join("\n");

  const html = `
    <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color: #2c2420;">
      <p>Здравствуйте!</p>
      <p>Ваш код для сброса пароля:</p>
      <p style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #8b4a5c;">${code}</p>
      <p style="color: #6b5f58; font-size: 14px;">Код действует 10 минут.</p>
      <p style="color: #6b5f58; font-size: 14px;">Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
      <p style="margin-top: 24px; color: #6b5f58; font-size: 14px;">С заботой,<br>Женская консультация</p>
    </div>
  `;

  if (process.env.RESEND_API_KEY) {
    await sendViaResend(to, subject, html, text);
    return;
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`[email:dev] Код сброса для ${to}: ${code}`);
    return;
  }

  throw new Error(
    "Почта не настроена. Добавьте RESEND_API_KEY в переменные окружения на сервере."
  );
}
