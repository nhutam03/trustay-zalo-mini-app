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

// Main pages
import HomePage from "@/pages/index";

// Auth pages
import LoginPage from "@/pages/auth/login-page";
import RegisterPage from "@/pages/auth/register-page";
import LinkAccountPage from "@/pages/auth/link-account-page";

// Explore pages
import ExplorePage from "@/pages/explore/explore-page";
import SearchPage from "@/pages/explore/search-page";
import RoomDetailPage from "@/pages/explore/room-detail-page";
import RoomSeekingDetailPage from "@/pages/explore/room-seeking-detail-page";
import RoommateDetailPage from "@/pages/explore/roommate-detail-page";
import SavedRoomsPage from "@/pages/explore/saved-rooms-page";
import TenantPreferencesPage from "@/pages/explore/tenant-preferences-page";
import PostRoomPage from "@/pages/explore/post-page";

// Messaging pages
import MessagesPage from "@/pages/messaging/message-page";
import ConversationPage from "@/pages/messaging/conversation-page";

// Contracts pages
import BookingRequestsPage from "@/pages/contracts/booking-requests-page";
import ContractsPage from "@/pages/contracts/contracts-page";
import ContractDetailPage from "@/pages/contracts/contract-detail-page";
import RentalsPage from "@/pages/contracts/rentals-page";
import RentalDetailPage from "@/pages/contracts/rental-detail-page";

// Payments pages
import PaymentsPage from "@/pages/payments/payments-page";
import PaymentDetailPage from "@/pages/payments/payment-detail-page";
import InvoicesPage from "@/pages/payments/invoices-page";
import InvoiceDetailPage from "@/pages/payments/invoice-detail-page";
import UpdateBillMeterPage from "@/pages/payments/update-bill-meter-page";
import GenerateMonthlyBillsPage from "@/pages/payments/generate-monthly-bills-page";

// Room Issues pages
import RoomIssuesPage from "@/pages/room-issues/room-issues-page";
import RoomIssuesManagementPage from "@/pages/room-issues/room-issues-management-page";
import RoomIssueDetailPage from "@/pages/room-issues/room-issue-detail-page";
import ReportRoomIssuePage from "@/pages/room-issues/report-room-issue-page";

// Landlord pages
import BuildingsPage from "@/pages/landlord/buildings-page";
import BuildingDetailPage from "@/pages/landlord/building-detail-page";
import BuildingFormPage from "@/pages/landlord/building-form-page";
import RoomsPage from "@/pages/landlord/rooms-page";
import RoomDetailManagementPage from "@/pages/landlord/room-detail-management-page";
import RoomFormPage from "@/pages/landlord/room-form-page";
import RoomInstanceDetailPage from "@/pages/landlord/room-instance-detail-page";

// Profile pages
import ProfilePage from "@/pages/profile/profile-page";
import ProfileDetailPage from "@/pages/profile/profile-detail-page";
import NotificationsPage from "@/pages/profile/notifications-page";
import SettingsPage from "@/pages/profile/settings-page";
import EditNamePage from "@/pages/profile/EditNamePage";
import EditBioPage from "@/pages/profile/EditBioPage";
import EditGenderPage from "@/pages/profile/EditGenderPage";
import EditDateOfBirthPage from "@/pages/profile/EditDateOfBirthPage";
import EditBankInfoPage from "@/pages/profile/EditBankInfoPage";

// AI pages
import AIAssistantPage from "@/pages/ai/ai-assistant-page";

// Other pages
import HelpCenterPage from "@/pages/others/help-center-page";
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
                    path="/invoices/:id/update-meter"
                    element={
                      <ProtectedRoute>
                        <UpdateBillMeterPage />
                      </ProtectedRoute>
                    }
                  ></Route>
                  <Route
                    path="/generate-monthly-bills"
                    element={
                      <ProtectedRoute>
                        <GenerateMonthlyBillsPage />
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
                  {/* Room Issues - Protected routes */}
                  <Route
                    path="/room-issues"
                    element={
                      <ProtectedRoute>
                        <RoomIssuesPage />
                      </ProtectedRoute>
                    }
                  ></Route>
                  <Route
                    path="/room-issues-management"
                    element={
                      <ProtectedRoute>
                        <RoomIssuesManagementPage />
                      </ProtectedRoute>
                    }
                  ></Route>
                  <Route
                    path="/room-issues/:id"
                    element={
                      <ProtectedRoute>
                        <RoomIssueDetailPage />
                      </ProtectedRoute>
                    }
                  ></Route>
                  <Route
                    path="/report-room-issue/:rentalId"
                    element={
                      <ProtectedRoute>
                        <ReportRoomIssuePage />
                      </ProtectedRoute>
                    }
                  ></Route>
                  {/* Payment Routes - Protected */}
                  <Route
                    path="/payments"
                    element={
                      <ProtectedRoute>
                        <PaymentsPage />
                      </ProtectedRoute>
                    }
                  ></Route>
                  <Route
                    path="/payment-detail/:id"
                    element={
                      <ProtectedRoute>
                        <PaymentDetailPage />
                      </ProtectedRoute>
                    }
                  ></Route>
                  {/* Tenant Preferences - Protected */}
                  <Route
                    path="/tenant-preferences"
                    element={
                      <ProtectedRoute>
                        <TenantPreferencesPage />
                      </ProtectedRoute>
                    }
                  ></Route>
                  {/* Profile - Cho phép truy cập mà không cần đăng nhập */}
                  <Route path="/profile" element={<ProfilePage />}></Route>
                  <Route path="/profile-detail" element={<ProfileDetailPage />}></Route>
                  <Route path="/settings" element={<SettingsPage />}></Route>
                  <Route path="/saved-rooms" element={<SavedRoomsPage />}></Route>
                  <Route path="/help" element={<HelpCenterPage />}></Route>
                  <Route
                    path="/link-account"
                    element={
                      <ProtectedRoute>
                        <LinkAccountPage />
                      </ProtectedRoute>
                    }
                  ></Route>

                  {/* Landlord Management Routes - Protected */}
                  <Route
                    path="/buildings"
                    element={
                      <ProtectedRoute>
                        <BuildingsPage />
                      </ProtectedRoute>
                    }
                  ></Route>
                  <Route
                    path="/buildings/create"
                    element={
                      <ProtectedRoute>
                        <BuildingFormPage />
                      </ProtectedRoute>
                    }
                  ></Route>
                  <Route
                    path="/buildings/:id"
                    element={
                      <ProtectedRoute>
                        <BuildingDetailPage />
                      </ProtectedRoute>
                    }
                  ></Route>
                  <Route
                    path="/buildings/:id/edit"
                    element={
                      <ProtectedRoute>
                        <BuildingFormPage />
                      </ProtectedRoute>
                    }
                  ></Route>
                  <Route
                    path="/buildings/:id/rooms/create"
                    element={
                      <ProtectedRoute>
                        <RoomFormPage />
                      </ProtectedRoute>
                    }
                  ></Route>
                  <Route
                    path="/rooms"
                    element={
                      <ProtectedRoute>
                        <RoomsPage />
                      </ProtectedRoute>
                    }
                  ></Route>
                  <Route
                    path="/rooms/create"
                    element={
                      <ProtectedRoute>
                        <RoomFormPage />
                      </ProtectedRoute>
                    }
                  ></Route>
                  <Route
                    path="/rooms/:id/manage"
                    element={
                      <ProtectedRoute>
                        <RoomDetailManagementPage />
                      </ProtectedRoute>
                    }
                  ></Route>
                  <Route
                    path="/rooms/:id/edit"
                    element={
                      <ProtectedRoute>
                        <RoomFormPage />
                      </ProtectedRoute>
                    }
                  ></Route>
                  <Route
                    path="/room-instances/:id"
                    element={
                      <ProtectedRoute>
                        <RoomInstanceDetailPage />
                      </ProtectedRoute>
                    }
                  ></Route>

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
