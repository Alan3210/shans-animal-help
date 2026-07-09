import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { calculatePriority, requiresSpecialist } from "@/lib/priority";
import { sendTelegramReportNotification } from "@/lib/telegram";

async function getAddressFromCoordinates(
  lat: number | null,
  lng: number | null
) {
  if (lat === null || lng === null) return "";

  try {
    console.log("Reverse geocoding started...");

    const response = await fetch(
      `https://geocode.maps.co/reverse?lat=${lat}&lon=${lng}`,
      {
        headers: {
          "User-Agent": "shans-animal-help/1.0",
        },
      }
    );

    if (!response.ok) {
      console.log("Reverse geocoding failed:", response.status);
      return "";
    }

    const data = await response.json();
    const address = data.address || {};

    const road = address.road || address.pedestrian || address.footway || "";
    const houseNumber = address.house_number || "";

    const settlement =
      address.village ||
      address.town ||
      address.city ||
      address.hamlet ||
      address.suburb ||
      "";

    const district =
      address.county || address.municipality || address.district || "";

    const parts = [
      road && houseNumber ? `${road}, ${houseNumber}` : road,
      settlement,
      district,
    ].filter(Boolean);

    const result = parts.join(", ") || data.display_name || "";

    console.log("Reverse geocoding completed:", result);

    return result;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return "";
  }
}

export async function POST(request: Request) {
  const startedAt = Date.now();

  try {
    console.log("==========================================");
    console.log("NEW REPORT");
    console.log("Started:", new Date().toISOString());

    const formData = await request.formData();

    console.log(
      "FormData received in",
      Date.now() - startedAt,
      "ms"
    );

    const photos = formData.getAll("photos") as File[];

    const animal_type = String(formData.get("animal_type") || "");
    const animal_condition = String(formData.get("animal_condition") || "");

    const manual_location_address = String(
      formData.get("location_address") || ""
    ).trim();

    const location_lat_raw = formData.get("location_lat");
    const location_lng_raw = formData.get("location_lng");

    const location_lat = location_lat_raw ? Number(location_lat_raw) : null;
    const location_lng = location_lng_raw ? Number(location_lng_raw) : null;

    const situation_comment = String(formData.get("situation_comment") || "");
    const reporter_contact = String(formData.get("reporter_contact") || "");
    const consent_given = formData.get("consent_given") === "true";

    const hasCoordinates = location_lat !== null && location_lng !== null;

    console.log("Photos:", photos.length);

    photos.forEach((photo, index) => {
      console.log(
        `Photo ${index + 1}: ${photo.name} (${(
          photo.size /
          1024 /
          1024
        ).toFixed(2)} MB)`
      );
    });

    console.log("Animal:", animal_type);
    console.log("Condition:", animal_condition);
    console.log("Coordinates:", location_lat, location_lng);

    if (
      photos.length === 0 ||
      !animal_type ||
      !animal_condition ||
      (!manual_location_address && !hasCoordinates) ||
      !consent_given
    ) {
      console.log("Validation failed");

      return NextResponse.json(
        { error: "Заполнены не все обязательные поля" },
        { status: 400 }
      );
    }

    console.log("Resolving address...");

    const detectedAddress =
      manual_location_address ||
      (await getAddressFromCoordinates(location_lat, location_lng));

    const location_address =
      detectedAddress || "Адрес не определён, есть координаты";

    console.log("Resolved address:", location_address);

    const uploadedPhotoUrls: string[] = [];

    console.log("Starting photo upload...");

    for (const photo of photos) {
      console.log(
        `Uploading ${photo.name} (${(
          photo.size /
          1024 /
          1024
        ).toFixed(2)} MB)`
      );

      const fileExtension = photo.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("report-photos")
        .upload(fileName, photo, {
          contentType: photo.type,
        });

      if (uploadError) {
        console.error("Upload failed:", uploadError);

        return NextResponse.json(
          {
            error: `Ошибка загрузки фото: ${uploadError.message}`,
          },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from("report-photos")
        .getPublicUrl(fileName);

      uploadedPhotoUrls.push(publicUrlData.publicUrl);

      console.log(
        `Uploaded ${uploadedPhotoUrls.length}/${photos.length}`
      );
    }

    console.log(
      "All photos uploaded in",
      Date.now() - startedAt,
      "ms"
    );

    const priority = calculatePriority(animal_type, animal_condition);
    const specialist = requiresSpecialist(animal_type);

    console.log("Saving report into database...");

    const { data, error } = await supabaseAdmin
      .from("animal_reports")
      .insert({
        photos: uploadedPhotoUrls,
        animal_type,
        animal_condition,
        location_address,
        location_lat,
        location_lng,
        situation_comment,
        reporter_phone: reporter_contact,
        consent_given,
        priority,
        requires_specialist: specialist,
        status: "new",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Database error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log(
      "Database saved in",
      Date.now() - startedAt,
      "ms"
    );

    console.log("Sending Telegram notification...");

    await sendTelegramReportNotification({
      id: data.id,
      animal_type,
      animal_condition,
      priority,
      requires_specialist: specialist,
      location_address,
      location_lat,
      location_lng,
      situation_comment,
      reporter_phone: reporter_contact,
      photos: uploadedPhotoUrls,
    });

    console.log(
      "Telegram sent in",
      Date.now() - startedAt,
      "ms"
    );

    console.log(
      "TOTAL TIME:",
      Date.now() - startedAt,
      "ms"
    );

    console.log("REPORT COMPLETED");
    console.log("==========================================");

    return NextResponse.json({
      success: true,
      report_id: data.id,
    });
  } catch (error) {
    console.error("==========================================");
    console.error("REPORT ERROR");
    console.error(error);

    if (error instanceof Error) {
      console.error(error.stack);
    }

    console.error(
      "Elapsed:",
      Date.now() - startedAt,
      "ms"
    );

    console.error("==========================================");

    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}