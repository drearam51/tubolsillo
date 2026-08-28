export default function manifest() {
  return {
    name: "Tubolsillo 9.75",
    short_name: "Tubolsillo",
    description: "Tu billetera digital de la Feria 115 años del Banco Caja Social",
    start_url: "/",
    display: "standalone",
    background_color: "#0A1B2E",
    theme_color: "#0A1B2E",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
