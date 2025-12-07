import { Page, Spinner } from "zmp-ui";
import { useCurrentUser } from "@/hooks/useAuthService";
import TenantHomePage from "./tenant-home-page";
import DashboardPage from "./landlord/dashboard-page";

function HomePage() {
  const { data: user, isLoading } = useCurrentUser();

  return (
    <Page className="bg-gray-50">
      {isLoading ? (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50 z-40">
          <div className="animate-bounce">
            <Spinner />
          </div>
          <p className="mt-6 text-gray-600 animate-pulse">Đang tải...</p>
        </div>
      ) : user?.role === 'landlord' ? (
        <DashboardPage />
      ) : (
        <TenantHomePage />
      )}
    </Page>
  );
}

export default HomePage;
