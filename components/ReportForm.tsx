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
  const consentGiven = true;

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

    const hasCoordinates = locationLat !== null && locationLng !== null;

    if (
      photos.length === 0 ||
      !animalType ||
      !animalCondition ||
      (!locationAddress && !hasCoordinates) ||
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {errorMessage && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      <div>
                <div>
  <label
    htmlFor="report-photos"
    className="block w-full cursor-pointer rounded-2xl border border-emerald-700 bg-white px-3 py-4 text-center text-sm font-semibold whitespace-nowrap text-emerald-800 sm:text-base"
  >
    Добавьте фото (одно или несколько)
  </label>

  <input
    id="report-photos"
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
    className="sr-only"
  />

  {photos.length > 0 && (
    <p className="mt-2 text-sm text-emerald-700">
      Добавлено фото: {photos.length}
    </p>
  )}
</div>



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
               <select
          value={animalType}
          onChange={(event) => setAnimalType(event.target.value)}
          className="w-full rounded-2xl border border-zinc-300 p-3"
        >
          <option value="">Выберите тип животного</option>
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
   
        <select
            value={animalCondition}
            onChange={(event) => setAnimalCondition(event.target.value)}
            className="w-full rounded-2xl border border-zinc-300 p-3"
          >
            <option value="">Выберите состояние животного</option>
            <option>Травма</option>
            <option>ДТП</option>
            <option>Истощение</option>
            <option>Мазут / грязь / нефтепродукты</option>
            <option>Не встаёт</option>
            <option>Работает отлов</option>
            <option>Потеряшка с ошейником</option>
            <option>Агрессия</option>
            <option>Просто бездомное животное</option>
            <option>Другое</option>
          </select>
      </div>

      <div>
  
    <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={handleGetLocation}
          className="w-full rounded-2xl border border-emerald-700 px-3 py-4 text-sm font-semibold whitespace-nowrap text-emerald-800 sm:text-base"
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
          placeholder="Тут можно вписать адрес"
          className="w-full rounded-2xl border border-zinc-300 p-3"
        />
        </div>
      </div>

      <div>
        
        <textarea
          value={situationComment}
          onChange={(event) => setSituationComment(event.target.value)}
          placeholder="А тут - короткий комментарий"
          className="block min-h-28 w-full resize-none rounded-2xl border border-zinc-300 p-3"
        />
      </div>

      <div>
  
        <input
          type="text"
          value={reporterContact}
          onChange={(event) => setReporterContact(event.target.value)}
          placeholder="Контакт для связи (телефон или TG)"
          className="w-full rounded-2xl border border-zinc-300 p-3"
        />
      </div>



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