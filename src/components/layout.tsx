import { getSystemInfo } from "zmp-sdk";
import {
  AnimationRoutes,
  App,
  Route,
  Spinner,
  ZMPRouter,
} from "zmp-ui";
import SnackbarProvider from "zmp-ui/snackbar-provider";
import { AppProps } from "zmp-ui/app";

import HomePage from "@/pages/index";
import ExplorePage from "@/pages/explore-page";
import MessagesPage from "@/pages/message-page";
import PostRoomPage from "@/pages/post-page";
import ProfilePage from "@/pages/profile-page";
import RoomDetailPage from "@/pages/room-detail-page";
import LoginPage from "@/pages/login-page";
import RegisterPage from "@/pages/register-page";
import ProtectedRoute from "./protected-route";
import Header from "./header";
import { RecoilRoot } from "recoil";
import React, { Suspense } from "react";
import { ConfigProvider, getConfig } from "./providers/config-provider";
import { AuthProvider } from "./providers/auth-provider";
import { hexToRgb } from "@/utils/basic";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const Layout = () => {
  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          cssVariables={{
            "--zmp-primary-color": getConfig((c) => c.template.primaryColor),
            "--zmp-primary-color-rgb": hexToRgb(
              getConfig((c) => c.template.primaryColor)
            ),
          }}
        >
          <AuthProvider>
            <App>
          <Suspense
              fallback={
                <div className=" w-screen h-screen flex justify-center items-center">
                  <Spinner />
                </div>
              }
            >
            {/* <SnackbarProvider> */}
              <ZMPRouter>
                <Header />
                <div className="pt-header">
                  <AnimationRoutes>
                  {/* Public routes */}
                  <Route path="/login" element={<LoginPage />}></Route>
                  <Route path="/register" element={<RegisterPage />}></Route>
                  <Route path="/" element={<HomePage />}></Route>
                  <Route path="/explore" element={<ExplorePage />}></Route>
                  <Route path="/room/:id" element={<RoomDetailPage />}></Route>

                  {/* Protected routes - Require authentication */}
                  <Route
                    path="/messages"
                    element={
                      <ProtectedRoute>
                        <MessagesPage />
                      </ProtectedRoute>
                    }
                  ></Route>
                  <Route
                    path="/post-room"
                    element={
                      <ProtectedRoute>
                        <PostRoomPage />
                      </ProtectedRoute>
                    }
                  ></Route>
                  {/* Profile - Cho phép truy cập mà không cần đăng nhập */}
                  <Route path="/profile" element={<ProfilePage />}></Route>
                  </AnimationRoutes>
                </div>
              </ZMPRouter>
            {/* </SnackbarProvider> */}
          </Suspense>
        </App>
        </AuthProvider>
      </ConfigProvider>
      </QueryClientProvider>
    </RecoilRoot>
  );
}
export default Layout;
