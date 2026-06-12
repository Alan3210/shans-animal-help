export function formatStatus(status: string) {
  const statuses: Record<string, string> = {
    new: "Новая",
    in_progress: "В работе",
    duplicate: "Дубль",
    closed: "Закрыта",
  };

  return statuses[status] || status;
}

export function formatPriority(priority: string) {
  const priorities: Record<string, string> = {
    red: "Срочно",
    yellow: "Проверить",
    green: "Наблюдение",
  };

  return priorities[priority] || priority;
}