"use client";

import "@/css/font-vn.css";
import "@/css/style.css";
import "@ant-design/v5-patch-for-react-19";
import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";
import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import type { PropsWithChildren } from "react";
import { Providers } from "./providers";
import { usePathname } from "next/navigation";

// export const metadata: Metadata = {
//   title: {
//     template: "%s | NextAdmin - Next.js Dashboard Kit",
//     default: "NextAdmin - Next.js Dashboard Kit",
//   },
//   description:
//     "Next.js admin dashboard toolkit with 200+ templates, UI components, and integrations for fast dashboard development.",
// };

export default function RootLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <NextTopLoader color="#5750F1" showSpinner={false} />

          {/* Nếu là trang auth -> bỏ sidebar + header */}
          {isAuthPage ? (
            <main className="isolate mx-auto w-full overflow-hidden p-4 md:p-6 2xl:p-10">
              {children}
            </main>
          ) : (
            <div className="flex min-h-screen">
              <Sidebar />
              <div className="w-full bg-gray-2 dark:bg-[#020d1a]">
                <Header />
                <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
                  {children}
                </main>
              </div>
            </div>
          )}
        </Providers>
      </body>
    </html>
  );
}
