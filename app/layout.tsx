import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { StytchProvider } from "@stytch/nextjs";
import { createStytchUIClient } from "@stytch/nextjs/ui";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
import "./globals.css";

const stytch = createStytchUIClient(process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN || "");

export const metadata: Metadata = {
  title: "Omar Clinic Pro - نظام إدارة العيادة الطبية",
  description: "نظام إدارة عيادة طبية متكامل وحديث",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const content = (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body suppressHydrationWarning>
        <StytchProvider stytch={stytch}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </StytchProvider>
      </body>
    </html>
  );

  if (!publishableKey) {
    return content;
  }

  return (
    <ClerkProvider 
      publishableKey={publishableKey}
      localization={{
        signIn: {
          start: {
            title: "تسجيل الدخول",
            subtitle: "للوصول إلى لوحة تحكم عيادتك"
          }
        }
      }}
    >
      {content}
    </ClerkProvider>
  );
}
