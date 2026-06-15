import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Шанс. Помощь животным",
    short_name: "Шанс",
    description: "Сервис заявок для штаба помощи животным",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f5f4",
    theme_color: "#047857",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}