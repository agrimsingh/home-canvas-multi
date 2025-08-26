import { Metadata } from "next";

export const baseMetadata: Metadata = {
  title: "Home Canvas - AI-Powered Product Visualization",
  description:
    "Drag, drop, and visualize any product in your personal space using AI. Create photorealistic composites with Gemini AI.",
  keywords: [
    "product visualization",
    "AI",
    "home design",
    "interior design",
    "Gemini AI",
    "photorealistic",
  ],
  authors: [{ name: "Home Canvas Team" }],
  creator: "Home Canvas",
  publisher: "Home Canvas",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Home Canvas - AI-Powered Product Visualization",
    description:
      "Drag, drop, and visualize any product in your personal space using AI",
    url: "https://homecanvas.app",
    siteName: "Home Canvas",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Home Canvas Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Home Canvas - AI-Powered Product Visualization",
    description:
      "Drag, drop, and visualize any product in your personal space using AI",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};
