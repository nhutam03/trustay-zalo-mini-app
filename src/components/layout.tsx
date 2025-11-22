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
import SearchPage from "@/pages/search-page";
import MessagesPage from "@/pages/message-page";
import ConversationPage from "@/pages/conversation-page";
import PostRoomPage from "@/pages/post-page";
import ProfilePage from "@/pages/profile-page";
import ProfileDetailPage from "@/pages/profile-detail-page";
import RoomDetailPage from "@/pages/room-detail-page";
import RoomSeekingDetailPage from "@/pages/room-seeking-detail-page";
import RoommateDetailPage from "@/pages/roommate-detail-page";
import LoginPage from "@/pages/login-page";
import RegisterPage from "@/pages/register-page";
import BookingRequestsPage from "@/pages/booking-requests-page";
import ContractsPage from "@/pages/contracts-page";
import ContractDetailPage from "@/pages/contract-detail-page";
import NotificationsPage from "@/pages/notifications-page";
import RentalsPage from "@/pages/rentals-page";
import RentalDetailPage from "@/pages/rental-detail-page";
import InvoicesPage from "@/pages/invoices-page";
import InvoiceDetailPage from "@/pages/invoice-detail-page";
import EditNamePage from "@/pages/profile/EditNamePage";
import EditBioPage from "@/pages/profile/EditBioPage";
import EditGenderPage from "@/pages/profile/EditGenderPage";
import EditDateOfBirthPage from "@/pages/profile/EditDateOfBirthPage";
import EditBankInfoPage from "@/pages/profile/EditBankInfoPage";
import AIAssistantPage from "@/pages/ai-assistant-page";
import SettingsPage from "@/pages/settings-page";
import SavedRoomsPage from "@/pages/saved-rooms-page";
import HelpCenterPage from "@/pages/help-center-page";
import ProtectedRoute from "./ProtectedRoute";
import Header from "./header";
import AIFloatingButton from "./ai-floating-button";
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
                <div className="fixed inset-0 flex items-center justify-center bg-white">
                  <Spinner />
                </div>
              }
            >
            {/* <SnackbarProvider> */}
              <ZMPRouter>
                <Header />
                <AIFloatingButton />
                <div style={{ paddingTop: 'calc(50px + env(safe-area-inset-top) + 1rem)'}}>
                  <AnimationRoutes>
                  {/* Public routes */}
                  <Route path="/login" element={<LoginPage />}></Route>
                  <Route path="/register" element={<RegisterPage />}></Route>
                  <Route path="/" element={<HomePage />}></Route>
                  <Route path="/explore" element={<ExplorePage />}></Route>
                  <Route path="/search" element={<SearchPage />}></Route>
                  <Route path="/room/:id" element={<RoomDetailPage />}></Route>
                  <Route path="/room-seeking/:id" element={<RoomSeekingDetailPage />}></Route>
                  <Route path="/roommate/:id" element={<RoommateDetailPage />}></Route>

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
                    path="/conversation/:id"
                    element={
                      <ProtectedRoute>
                        <ConversationPage />
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
                  <Route
                    path="/booking-requests"
                    element={
                      <ProtectedRoute>
                        <BookingRequestsPage />
                      </ProtectedRoute>
                    }
                  ></Route>
                  <Route
                    path="/contracts"
                    element={
                      <ProtectedRoute>
                        <ContractsPage />
                      </ProtectedRoute>
                    }
                  ></Route>
                  <Route
                    path="/contracts/:id"
                    element={
                      <ProtectedRoute>
                        <ContractDetailPage />
                      </ProtectedRoute>
                    }
                  ></Route>
                  <Route
                    path="/invoices"
                    element={
                      <ProtectedRoute>
                        <InvoicesPage />
                      </ProtectedRoute>
                    }
                  ></Route>
                  <Route
                    path="/invoices/:id"
                    element={
                      <ProtectedRoute>
                        <InvoiceDetailPage />
                      </ProtectedRoute>
                    }
                  ></Route>
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <NotificationsPage />
                      </ProtectedRoute>
                    }
                  ></Route>
                  <Route
                    path="/rentals"
                    element={
                      <ProtectedRoute>
                        <RentalsPage />
                      </ProtectedRoute>
                    }
                  ></Route>
                  <Route
                    path="/rentals/:id"
                    element={
                      <ProtectedRoute>
                        <RentalDetailPage />
                      </ProtectedRoute>
                    }
                  ></Route>
                  {/* Profile - Cho phép truy cập mà không cần đăng nhập */}
                  <Route path="/profile" element={<ProfilePage />}></Route>
                  <Route path="/profile-detail" element={<ProfileDetailPage />}></Route>
                  <Route path="/settings" element={<SettingsPage />}></Route>
                  <Route path="/saved-rooms" element={<SavedRoomsPage />}></Route>
                  <Route path="/help" element={<HelpCenterPage />}></Route>

                  {/* Profile Edit Routes */}
                  <Route path="/profile/edit-name" element={<EditNamePage />}></Route>
                  <Route path="/profile/edit-bio" element={<EditBioPage />}></Route>
                  <Route path="/profile/edit-gender" element={<EditGenderPage />}></Route>
                  <Route path="/profile/edit-dateofbirth" element={<EditDateOfBirthPage />}></Route>
                  <Route path="/profile/edit-bankinfo" element={<EditBankInfoPage />}></Route>

                  {/* AI Assistant - Protected route */}
                  <Route
                    path="/ai-assistant"
                    element={
                      <ProtectedRoute>
                        <AIAssistantPage />
                      </ProtectedRoute>
                    }
                  ></Route>
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
