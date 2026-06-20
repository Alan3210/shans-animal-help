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
    const response = await fetch(
      `https://geocode.maps.co/reverse?lat=${lat}&lon=${lng}`,
      {
        headers: {
          "User-Agent": "shans-animal-help/1.0",
        },
      }
    );

    if (!response.ok) return "";

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

    return parts.join(", ") || data.display_name || "";
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return "";
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

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

    if (
      photos.length === 0 ||
      !animal_type ||
      !animal_condition ||
      (!manual_location_address && !hasCoordinates) ||
      !consent_given
    ) {
      return NextResponse.json(
        { error: "Заполнены не все обязательные поля" },
        { status: 400 }
      );
    }

    const detectedAddress =
      manual_location_address ||
      (await getAddressFromCoordinates(location_lat, location_lng));

    const location_address =
      detectedAddress || "Адрес не определён, есть координаты";

    const uploadedPhotoUrls: string[] = [];

    for (const photo of photos) {
      const fileExtension = photo.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("report-photos")
        .upload(fileName, photo, {
          contentType: photo.type,
        });

      if (uploadError) {
        return NextResponse.json(
          { error: `Ошибка загрузки фото: ${uploadError.message}` },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from("report-photos")
        .getPublicUrl(fileName);

      uploadedPhotoUrls.push(publicUrlData.publicUrl);
    }

    const priority = calculatePriority(animal_type, animal_condition);
    const specialist = requiresSpecialist(animal_type);

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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

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
    });

    return NextResponse.json({
      success: true,
      report_id: data.id,
    });
  } catch (error) {
    console.error("Create report error:", error);

    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}