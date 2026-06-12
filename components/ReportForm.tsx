"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";



export default function ReportForm() {
  const router = useRouter();

  const [locationLat, setLocationLat] = useState<number | null>(null);
const [locationLng, setLocationLng] = useState<number | null>(null);
const [locationStatus, setLocationStatus] = useState("");
  const [animalType, setAnimalType] = useState("");
  const [animalCondition, setAnimalCondition] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [situationComment, setSituationComment] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [photo, setPhoto] = useState<File | null>(null);
const [photoPreview, setPhotoPreview] = useState("");

function handleGetLocation() {
  setLocationStatus("");

  if (!navigator.geolocation) {
    setLocationStatus("Ваш браузер не поддерживает геолокацию.");
    return;
  }

  setLocationStatus("Определяем местоположение...");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setLocationLat(position.coords.latitude);
      setLocationLng(position.coords.longitude);
      setLocationStatus("Местоположение определено.");
    },
    () => {
      setLocationStatus("Не удалось определить местоположение. Введите адрес вручную.");
    }
  );
}



  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!photo || !animalType || !animalCondition || !locationAddress || !consentGiven) {
      setErrorMessage("Пожалуйста, заполните обязательные поля.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();

if (photo) {
  formData.append("photo", photo);
  if (locationLat !== null) {
  formData.append("location_lat", String(locationLat));
}

if (locationLng !== null) {
  formData.append("location_lng", String(locationLng));
}
}

formData.append("animal_type", animalType);
formData.append("animal_condition", animalCondition);
formData.append("location_address", locationAddress);
formData.append("situation_comment", situationComment);
formData.append("reporter_contact", reporterContact);
formData.append("consent_given", String(consentGiven));

const response = await fetch("/api/reports", {
  method: "POST",
  body: formData,
});

    const result = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setErrorMessage(result.error || "Не удалось отправить заявку.");
      return;
    }

    router.push(`/success?id=${result.report_id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      <div>
        <label className="mb-2 block font-medium">Фото животного *</label>
<input
  type="file"
  accept="image/*"
  onChange={(event) => {
    const file = event.target.files?.[0];

    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  }}
  className="w-full rounded-2xl border border-zinc-300 p-3"
/>

{photoPreview && (
  <img
    src={photoPreview}
    alt="Превью фото"
    className="mt-3 max-h-64 w-full rounded-2xl object-cover"
  />
)}
        <p className="mt-2 text-xs text-zinc-500">
          Загрузка фото будет подключена следующим шагом.
        </p>
      </div>

      <div>
        <label className="mb-2 block font-medium">Тип животного *</label>
        <select
          value={animalType}
          onChange={(event) => setAnimalType(event.target.value)}
          className="w-full rounded-2xl border border-zinc-300 p-3"
        >
          <option value="">Выберите тип</option>
          <option>Собака</option>
          <option>Кошка</option>
          <option>Щенок</option>
          <option>Котёнок</option>
          <option>Птица</option>
          <option>Дельфин</option>
          <option>Дикое животное</option>
          <option>Другое</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block font-medium">Состояние животного *</label>
        <select
          value={animalCondition}
          onChange={(event) => setAnimalCondition(event.target.value)}
          className="w-full rounded-2xl border border-zinc-300 p-3"
        >
          <option value="">Выберите состояние</option>
          <option>Травма</option>
          <option>Истощение</option>
          <option>Мазут / грязь / нефтепродукты</option>
          <option>Не встаёт</option>
          <option>Потеряшка с ошейником</option>
          <option>Агрессия</option>
          <option>Просто бездомное животное</option>
          <option>Другое</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block font-medium">Адрес или ориентир *</label>
        <button
  type="button"
  onClick={handleGetLocation}
  className="mb-3 w-full rounded-2xl border border-emerald-700 px-4 py-3 font-semibold text-emerald-800"
>
  📍 Определить моё местоположение
</button>

{locationStatus && (
  <p className="mb-3 text-sm text-zinc-600">{locationStatus}</p>
)}

{locationLat && locationLng && (
  <p className="mb-3 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800">
    Координаты сохранены: {locationLat.toFixed(5)}, {locationLng.toFixed(5)}
  </p>
)}
        <input
          type="text"
          value={locationAddress}
          onChange={(event) => setLocationAddress(event.target.value)}
          placeholder="Например: Туапсе, у остановки..."
          className="w-full rounded-2xl border border-zinc-300 p-3"
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">Комментарий</label>
        <textarea
          value={situationComment}
          onChange={(event) => setSituationComment(event.target.value)}
          placeholder="Коротко опишите, что произошло..."
          className="min-h-28 w-full rounded-2xl border border-zinc-300 p-3"
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">Контакт для связи</label>
        <input
          type="text"
          value={reporterContact}
          onChange={(event) => setReporterContact(event.target.value)}
          placeholder="Телефон или Telegram"
          className="w-full rounded-2xl border border-zinc-300 p-3"
        />
      </div>

      <label className="flex gap-3 text-sm">
        <input
          type="checkbox"
          checked={consentGiven}
          onChange={(event) => setConsentGiven(event.target.checked)}
          className="mt-1"
        />
        <span>
          Я согласен(на) на обработку отправленных данных для передачи заявки
          волонтёрам.
        </span>
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-emerald-700 px-5 py-4 text-lg font-semibold text-white disabled:bg-zinc-400"
      >
        {isSubmitting ? "Отправляем..." : "Отправить заявку"}
      </button>
    </form>
  );
}