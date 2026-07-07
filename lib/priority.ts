export function calculatePriority(animalType: string, animalCondition: string) {
  const redConditions = [
    "Травма",
    "Не встаёт",
    "Мазут / грязь / нефтепродукты",
    "ДТП",
  ];

  const redAnimalTypes = ["Щенок", "Котёнок", "Дельфин"];

  const yellowConditions = [
    "Истощение",
    "Потеряшка с ошейником",
    "Агрессия",
    "Работает отлов",
  ];

  if (redConditions.includes(animalCondition)) return "red";
  if (redAnimalTypes.includes(animalType)) return "red";
  if (yellowConditions.includes(animalCondition)) return "yellow";

  return "green";
}

export function requiresSpecialist(animalType: string) {
  return ["Птица", "Дельфин", "Дикое животное"].includes(animalType);
}