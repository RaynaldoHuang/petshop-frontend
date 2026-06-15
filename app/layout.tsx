import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import NonNegativeNumberInputs from "@/components/NonNegativeNumberInputs";

export const metadata: Metadata = {
  metadataBase: new URL("https://luckypetmarket.com/"),
  title: {
    default: "Lucky Pet Market | Jual Makanan Kucing, Anjing & Kebutuhan Pet Terlengkap",
    template: "%s | Lucky Pet Market",
  },
  description:
    "Lucky Pet Market menyediakan makanan kucing, makanan anjing, pasir kucing, vitamin, aksesoris, kandang, dan kebutuhan hewan peliharaan lainnya dengan harga terbaik dan pengiriman cepat.",
  keywords: [
    "pet market indonesia",
    "pet market",
    "luckypetmarket",
    "lucky pet market",
    "petshop",
    "pet shop online",
    "makanan kucing",
    "makanan anjing",
    "royal canin",
    "whiskas",
    "pasir kucing",
    "vitamin hewan",
    "aksesoris hewan",
    "pet supplies indonesia",
  ],
  verification: {
    google: "AXKD6n5RxzSIlj37n3rClk-1KlK5qy7uAAzxVjSrxLs",
  },
  authors: [{ name: "Lucky Pet Market" }],
  creator: "Lucky Pet Market",
  publisher: "Lucky Pet Market",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Lucky Pet Market",
    description:
      "Lucky Pet Market menyediakan makanan kucing, makanan anjing, pasir kucing, vitamin, aksesoris, kandang, dan kebutuhan hewan peliharaan lainnya dengan harga terbaik dan pengiriman cepat.",
    url: "https://luckypetmarket.com/",
    siteName: "Lucky Pet Market",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/image/img5.webp",
        width: 1200,
        height: 630,
        alt: "Lucky Pet Market",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lucky Pet Market",
    description:
      "Lucky Pet Market menyediakan makanan kucing, makanan anjing, pasir kucing, vitamin, aksesoris, kandang, dan kebutuhan hewan peliharaan lainnya dengan harga terbaik dan pengiriman cepat.",
    images: ["/image/img5.webp"],
  },
  alternates: {
    canonical: "https://luckypetmarket.com/",
  },
  category: "Pet Shop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body>
        <NonNegativeNumberInputs />
        <AuthProvider>
          {children}

          <Toaster
            position="top-center"
            richColors
            closeButton
          />
        </AuthProvider>
      </body>
    </html>
  );
}
