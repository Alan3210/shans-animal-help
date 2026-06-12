import { formatPriority } from "@/lib/formatters";

type TelegramReport = {
  id: string;
  animal_type: string;
  animal_condition: string;
  priority: string;
  requires_specialist: boolean;
  location_address: string;
  location_lat?: number | null;
  location_lng?: number | null;
  situation_comment?: string | null;
  reporter_phone?: string | null;
};

export async function sendTelegramReportNotification(report: TelegramReport) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn("Telegram env variables are not set");
    return;
  }

  const adminUrl = process.env.ADMIN_BASE_URL || "http://localhost:3000/admin";

  const specialistText = report.requires_specialist
    ? "\n\n⚠ Требуется оценка профильным специалистом"
    : "";

  const mapLink =
    report.location_lat && report.location_lng
      ? `\nКарта: https://www.google.com/maps?q=${report.location_lat},${report.location_lng}`
      : "";

  const message = `
🆘 Новая заявка #${report.id.slice(0, 8)}

Приоритет: ${formatPriority(report.priority)}
Тип: ${report.animal_type}
Состояние: ${report.animal_condition}
Место: ${report.location_address}${mapLink}
Комментарий: ${report.situation_comment || "—"}

Контакт: ${report.reporter_phone || "—"}${specialistText}

Открыть админку: ${adminUrl}
`;

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Открыть админку",
                url: "https://google.com",
              },
            ],
          ],
        },
      }),
    }
  );

  const result = await response.json();
  console.log("TELEGRAM RESULT:", result);
}