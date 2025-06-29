import "~/styles/globals.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { theme } from "~/styles/theme";
import { Notifications } from "@mantine/notifications";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Create T3 App",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <SessionProvider>
          <MantineProvider theme={theme}>
            <Notifications />
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </MantineProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
