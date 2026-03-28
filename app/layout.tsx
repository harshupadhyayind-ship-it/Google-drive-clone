import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "VegaDrive — Your Files. Anywhere.",
    template: "%s | VegaDrive",
  },
  description:
    "VegaDrive is a free cloud storage platform. Upload, organise, and share your files securely from any device.",
  keywords: [
    "cloud storage",
    "file sharing",
    "online drive",
    "secure storage",
    "VegaDrive",
  ],
  authors: [{ name: "VegaDrive" }],
  creator: "VegaDrive",

  openGraph: {
    type: "website",
    siteName: "VegaDrive",
    title: "VegaDrive — Your Files. Anywhere.",
    description:
      "Free cloud storage. Upload, organise, and share your files securely from any device.",
    url: BASE_URL,
    images: [{ url: "/icon.svg", width: 32, height: 32, alt: "VegaDrive" }],
  },

  twitter: {
    card: "summary",
    title: "VegaDrive — Your Files. Anywhere.",
    description: "Free cloud storage. Upload, organise, and share files from any device.",
    images: ["/icon.svg"],
  },

  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${jakartaSans.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Blocking script: apply saved theme BEFORE first paint — zero white flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('vegadrive-theme');if(t==='light'){document.documentElement.classList.add('light');document.documentElement.classList.remove('dark');}else{document.documentElement.classList.add('dark');}}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
