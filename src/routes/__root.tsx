import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { AuthGate } from "@/components/auth-gate";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "HN-DB — مركز إدارة قواعد البيانات" },
      { name: "description", content: "HN-DB هو الوسيط الآمن لإدارة قواعد البيانات لكل مواقعك." },
      { property: "og:title", content: "HN-DB — مركز إدارة قواعد البيانات" },
      { name: "twitter:title", content: "HN-DB — مركز إدارة قواعد البيانات" },
      { property: "og:description", content: "HN-DB هو الوسيط الآمن لإدارة قواعد البيانات لكل مواقعك." },
      { name: "twitter:description", content: "HN-DB هو الوسيط الآمن لإدارة قواعد البيانات لكل مواقعك." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/92b7553f-b567-40a0-b9a3-202aa9cf77f2/id-preview-c2de7a66--7489cc11-a51c-4761-90b8-70195e1863a8.lovable.app-1780877874516.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/92b7553f-b567-40a0-b9a3-202aa9cf77f2/id-preview-c2de7a66--7489cc11-a51c-4761-90b8-70195e1863a8.lovable.app-1780877874516.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background text-center p-6">
      <div>
        <h1 className="text-6xl font-bold">404</h1>
        <p className="mt-3 text-muted-foreground">الصفحة غير موجودة</p>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
      <div>
        <h1 className="text-xl font-semibold">حدث خطأ</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </div>
  ),
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function Shell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAuth = pathname === "/auth";

  if (isAuth) {
    return (
      <>
        <Outlet />
        <Toaster richColors position="top-center" dir="rtl" />
      </>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <AppSidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        <Outlet />
      </main>
      <Toaster richColors position="top-center" dir="rtl" />
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGate>
          <Shell />
        </AuthGate>
      </AuthProvider>
    </QueryClientProvider>
  );
}
