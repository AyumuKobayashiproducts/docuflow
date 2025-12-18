import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getPreferredLocale } from "@/lib/serverLocale";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const metadataEn: Metadata = {
  metadataBase: new URL("https://docuflow-azure.vercel.app"),
  title: "DocuFlow | AI Document Workspace",
  description:
    "DocuFlow helps you turn PDFs and Word files into searchable knowledge with AI summaries, tags, and full-text search.",
  keywords: [
    "document management",
    "AI summary",
    "PDF",
    "Word",
    "tags",
    "full-text search",
  ],
  authors: [{ name: "DocuFlow" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml", sizes: "512x512" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DocuFlow",
  },
  openGraph: {
    title: "DocuFlow | AI Document Workspace",
    description:
      "Turn PDFs and Word files into searchable knowledge with AI summaries, tags, and full-text search.",
    type: "website",
    siteName: "DocuFlow",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "DocuFlow - AI-Powered Document Workspace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DocuFlow | AI Document Workspace",
    description: "AI summaries for PDFs/Word, tags, and full-text search.",
    images: ["/og-image.svg"],
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getPreferredLocale();
  if (locale === "ja") {
    return {
      ...metadataEn,
      title: "DocuFlow | AI 要約ドキュメントワークスペース",
      description:
        "DocuFlow は、AI 要約で、PDF や Word 資料を一瞬で整理するドキュメントワークスペースです。GPT-4を活用した自動要約、タグ付け、全文検索で効率的なドキュメント管理を実現します。",
      keywords: ["ドキュメント管理", "AI要約", "PDF", "Word", "タグ付け", "全文検索"],
      openGraph: {
        ...metadataEn.openGraph,
        title: "DocuFlow | AI 要約ドキュメントワークスペース",
        description:
          "AI 要約で、PDF / Word 資料を一瞬で整理。GPT-4を活用したスマートなドキュメント管理。",
      },
      twitter: {
        ...metadataEn.twitter,
        title: "DocuFlow | AI 要約ドキュメントワークスペース",
        description: "AI 要約で、PDF / Word 資料を一瞬で整理",
      },
    };
  }
  return metadataEn;
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getPreferredLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-200`}
      >
        {children}
      </body>
    </html>
  );
}
