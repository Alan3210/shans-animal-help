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
  photos?: string[];
};

export async function sendTelegramReportNotification(report: TelegramReport) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn("Telegram env variables are not set");
    return;
  }

  const adminBaseUrl =
    process.env.ADMIN_BASE_URL || "https://shans-animal-help.vercel.app";

  const reportUrl = `${adminBaseUrl}/admin/reports/${report.id}`;

  const mapUrl =
    report.location_lat && report.location_lng
      ? `https://www.google.com/maps?q=${report.location_lat},${report.location_lng}`
      : null;

  const actionSecret = process.env.TELEGRAM_ACTION_SECRET;
  const encodedSecret = encodeURIComponent(actionSecret || "");

  const inProgressUrl = actionSecret
    ? `${adminBaseUrl}/api/telegram/action?id=${report.id}&action=in_progress&secret=${encodedSecret}`
    : reportUrl;

  const closedUrl = actionSecret
    ? `${adminBaseUrl}/api/telegram/action?id=${report.id}&action=closed&secret=${encodedSecret}`
    : reportUrl;

  const specialistText = report.requires_specialist
    ? "\n\n⚠ Требуется оценка профильным специалистом"
    : "";

  const mapText = mapUrl ? `\nКарта: ${mapUrl}` : "";

  const message = `
🆘 Новая заявка #${report.id.slice(0, 8)}

Приоритет: ${formatPriority(report.priority)}
Тип: ${report.animal_type}
Состояние: ${report.animal_condition}
Место: ${report.location_address}${mapText}
Комментарий: ${report.situation_comment || "—"}

Контакт: ${report.reporter_phone || "—"}${specialistText}
`;

  const inlineKeyboard = [
    [
      {
        text: "Открыть заявку",
        url: reportUrl,
      },
    ],
    ...(mapUrl
      ? [
          [
            {
              text: "📍 Карта",
              url: mapUrl,
            },
          ],
        ]
      : []),
    [
      {
        text: "🟢 Взять в работу",
        url: inProgressUrl,
      },
      {
        text: "✅ Закрыть",
        url: closedUrl,
      },
    ],
  ];

const firstPhoto = report.photos?.[0];

const telegramMethod = firstPhoto ? "sendPhoto" : "sendMessage";

const payload = firstPhoto
  ? {
      chat_id: chatId,
      photo: firstPhoto,
      caption: message,
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      },
    }
  : {
      chat_id: chatId,
      text: message,
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      },
    };

const response = await fetch(
  `https://api.telegram.org/bot${botToken}/${telegramMethod}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }
);

  const result = await response.json();

  console.log("TELEGRAM RESULT:", result);

  if (!result.ok) {
    console.error("TELEGRAM ERROR:", result);
  }
}