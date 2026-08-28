import "./globals.css";

export const metadata = {
  title: "Tubolsillo 9.75 — Feria 115 años",
  description: "Tu billetera digital de la Feria 115 años del Banco Caja Social",
  manifest: "/manifest.webmanifest",
};

export const viewport = {
  themeColor: "#0A1B2E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
