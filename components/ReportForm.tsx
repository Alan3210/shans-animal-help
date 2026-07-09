"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Функция клиентского сжатия картинок перед отправкой
function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    // Если это не изображение, пропускаем сжатие и возвращаем оригинальный файл
    if (!file.type.startsWith("image/")) {
      console.log(`[Сжатие] Файл ${file.name} не является изображением, отправляем оригинал.`);
      return resolve(file);
    }

    console.log(`[Сжатие] Начало обработки: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} МБ)`);

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      // Освобождаем память после загрузки изображения
      URL.revokeObjectURL(objectUrl);

      const MAX_WIDTH = 1600;
      const MAX_HEIGHT = 1600;
      let width = img.width;
      let height = img.height;

      console.log(`[Сжатие] Исходное разрешение: ${width}x${height}px`);

      // Проверяем, нужно ли масштабировать
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        if (width > height) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        } else {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }
        console.log(`[Сжатие] Новое разрешение после уменьшения: ${width}x${height}px`);
      } else {
        console.log(`[Сжатие] Разрешение в пределах нормы, пропускаем ресайз.`);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.warn("[Сжатие] Не удалось получить 2D контекст канваса, отправляем оригинал.");
        return resolve(file);
      }

      // Рисуем уменьшенное изображение на канвасе
      ctx.drawImage(img, 0, 0, width, height);

      // Конвертируем в JPEG с качеством 80% (0.8)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.warn("[Сжатие] Сбой при создании blob, отправляем оригинал.");
            return resolve(file);
          }

          // Генерируем новое имя файла с расширением .jpg
          const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
          const compressedFile = new File([blob], `${baseName}.jpg`, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          const percentReduction = (((file.size - compressedFile.size) / file.size) * 100).toFixed(1);
          console.log(
            `[Сжатие] Успешно завершено для: ${compressedFile.name}. ` +
            `Новый размер: ${(compressedFile.size / 1024).toFixed(1)} КБ (уменьшено на ${percentReduction}%)`
          );

          resolve(compressedFile);
        },
        "image/jpeg",
        0.8
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      console.error("[Сжатие] Сбой при загрузке изображения в Image, отправляем оригинал:", err);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

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

    console.log("START SUBMIT");
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

    try {
      setIsSubmitting(true);

      // Шаг 1. Клиентское сжатие картинок
      console.log("Запуск процесса клиентского сжатия фотографий...");
      const compressedPhotos = await Promise.all(
        photos.map((photo) => compressImage(photo))
      );
      console.log("Все фотографии обработаны.");

      // Шаг 2. Создание FormData для отправки на сервер
      console.log("Создание FormData...");
      const formData = new FormData();

      compressedPhotos.forEach((photo, index) => {
        console.log(
          `Добавление в FormData: Photo ${index + 1}: ${photo.name} (${(
            photo.size / 1024
          ).toFixed(1)} КБ)`
        );
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

      console.log("Отправка запроса на сервер...");
      const response = await fetch("/api/reports", {
        method: "POST",
        body: formData,
      });

      console.log("Ответ сервера получен. Статус:", response.status);

      const result = await response.json();
      console.log("Результат:", result);

      if (!response.ok) {
        setErrorMessage(result.error || "Не удалось отправить заявку.");
        return;
      }

      console.log("Заявка успешно создана!");
      router.push(`/success?id=${result.report_id}`);
    } catch (error) {
      console.error("Ошибка в процессе отправки формы:", error);

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Не удалось соединиться с сервером.");
      }
    } finally {
      setIsSubmitting(false);
    }
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
              Координаты сохранены: {locationLat.toFixed(5)}, {locationLng.toFixed(5)}
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