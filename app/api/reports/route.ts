import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { calculatePriority, requiresSpecialist } from "@/lib/priority";
import { sendTelegramReportNotification } from "@/lib/telegram";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const photos = formData.getAll("photos") as File[];

    const animal_type = String(formData.get("animal_type") || "");
    const animal_condition = String(formData.get("animal_condition") || "");
    const location_address = String(formData.get("location_address") || "");

    const location_lat_raw = formData.get("location_lat");
    const location_lng_raw = formData.get("location_lng");

    const location_lat = location_lat_raw ? Number(location_lat_raw) : null;
    const location_lng = location_lng_raw ? Number(location_lng_raw) : null;

    const situation_comment = String(formData.get("situation_comment") || "");
    const reporter_contact = String(formData.get("reporter_contact") || "");
    const consent_given = formData.get("consent_given") === "true";

    if (
      photos.length === 0 ||
      !animal_type ||
      !animal_condition ||
      !location_address ||
      !consent_given
    ) {
      return NextResponse.json(
        { error: "Заполнены не все обязательные поля" },
        { status: 400 }
      );
    }

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

    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}