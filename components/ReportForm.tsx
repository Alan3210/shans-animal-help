"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReportForm() {
  const router = useRouter();

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const [animalType, setAnimalType] = useState("");
  const [animalCondition, setAnimalCondition] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [situationComment, setSituationComment] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);

  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [locationStatus, setLocationStatus] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
        setLocationStatus(
          "Не удалось определить местоположение. Введите адрес вручную."
        );
      }
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (
      photos.length === 0 ||
      !animalType ||
      !animalCondition ||
      !locationAddress ||
      !consentGiven
    ) {
      setErrorMessage("Пожалуйста, заполните обязательные поля.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();

    photos.forEach((photo) => {
      formData.append("photos", photo);
    });

    formData.append("animal_type", animalType);
    formData.append("animal_condition", animalCondition);
    formData.append("location_address", locationAddress);
    formData.append("situation_comment", situationComment);
    formData.append("reporter_contact", reporterContact);
    formData.append("consent_given", String(consentGiven));

    if (locationLat !== null) {
      formData.append("location_lat", String(locationLat));
    }

    if (locationLng !== null) {
      formData.append("location_lng", String(locationLng));
    }

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
          multiple
          onChange={(event) => {
  const selectedFiles = Array.from(event.target.files || []);

  if (selectedFiles.length > 5) {
    setErrorMessage("Можно загрузить не больше 5 фото.");
    event.target.value = "";
    return;
  }

  const tooLargeFile = selectedFiles.find(
    (file) => file.size > 10 * 1024 * 1024
  );

  if (tooLargeFile) {
    setErrorMessage("Каждое фото должно быть не больше 10 МБ.");
    event.target.value = "";
    return;
  }

  setErrorMessage("");
  setPhotos(selectedFiles);
  setPhotoPreviews(
    selectedFiles.map((file) => URL.createObjectURL(file))
  );
}}
          className="w-full rounded-2xl border border-zinc-300 p-3"
        />

        <p className="mt-2 text-xs text-zinc-500">
          Можно выбрать одно или несколько фото.
        </p>

        {photoPreviews.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {photoPreviews.map((preview, index) => (
              <img
                key={preview}
                src={preview}
                alt={`Превью фото ${index + 1}`}
                className="h-32 w-full rounded-2xl object-cover"
              />
            ))}
          </div>
        )}
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
            Координаты сохранены: {locationLat.toFixed(5)},{" "}
            {locationLng.toFixed(5)}
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