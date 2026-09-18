/* Developed by RUDRA via NEKLLM */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";
import SettingsProvider from "@/components/providers/SettingsProvider";
import connectDB from "@/lib/mongodb";
import Settings from "@/models/Settings";
import { auth } from "@/auth";
import { headers } from "next/headers";
import ClientLayout from "./ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SaveMAX",
  description: "Advanced Property Management System",
};

// Routes that should NOT use the tenant dashboard shell (landing, auth & superadmin pages)
const NON_DASHBOARD_ROUTES = ["/login", "/register", "/setup", "/property", "/unit", "/superadmin", "/create-organization"];

function isDashboardRoute(pathname: string): boolean {
  if (pathname === "/") return false;
  return !NON_DASHBOARD_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  let initialSettings = null;
  try {
    await connectDB();
    const settingsDoc = await Settings.findOne().lean();
    if (settingsDoc) {
      initialSettings = JSON.parse(JSON.stringify(settingsDoc));
    }
  } catch (error) {
    console.error("Failed to fetch initial settings in layout", error);
  }

  // Detect current path to decide whether to wrap with dashboard shell
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || headersList.get("x-invoke-path") || "/";
  const showDashboardShell = isDashboardRoute(pathname);

  const user = session?.user
    ? { name: session.user.name, email: session.user.email }
    : undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProviderWrapper session={session}>
          <SettingsProvider initialSettings={initialSettings}>
            {showDashboardShell ? (
              <ClientLayout user={user}>{children}</ClientLayout>
            ) : (
              children
            )}
          </SettingsProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
