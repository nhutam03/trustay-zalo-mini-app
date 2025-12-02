import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Box, Icon } from "zmp-ui";
import useSetHeader from "@/hooks/useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";
import BottomNav from "@/components/navigate-bottom";
import { useAuth } from "@/components/providers/auth-provider";
import { useBuildings } from "@/hooks/useBuildingService";
import parse from "html-react-parser";

const BuildingsPage: React.FC = () => {
  const setHeader = useSetHeader();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch buildings của landlord
  const { data: buildings, isLoading } = useBuildings();

  useEffect(() => {
    setHeader({
      title: "Quản lý tòa nhà",
      hasLeftIcon: true,
      type: "primary",
    });
    changeStatusBarColor("primary");
  }, []);

  return (
    <Page className="bg-gray-50 has-bottom-nav">
      <Box className="p-4">
        {/* Header với nút thêm tòa nhà */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            Danh sách tòa nhà ({buildings?.data?.length || 0})
          </h2>
          <button
            onClick={() => navigate("/buildings/create")}
            className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 active:opacity-70 transition-opacity"
          >
            <Icon icon="zi-plus" size={18} />
            <span className="text-sm font-medium">Thêm</span>
          </button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!buildings?.data || buildings.data.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Icon icon="zi-location" size={48} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Chưa có tòa nhà nào
            </h3>
            <p className="text-gray-600 text-center mb-6 px-6">
              Bắt đầu thêm tòa nhà đầu tiên của bạn để quản lý phòng trọ
            </p>
            <button
              onClick={() => navigate("/buildings/create")}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium active:opacity-70 transition-opacity"
            >
              Thêm tòa nhà
            </button>
          </div>
        )}

        {/* Buildings list */}
        {!isLoading && buildings?.data && buildings.data.length > 0 && (
          <div className="space-y-3">
            {buildings.data.map((building) => (
              <div
                key={building.id}
                onClick={() => navigate(`/buildings/${building.id}`)}
                className="bg-white rounded-lg p-4 active:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon icon="zi-location" size={24} className="text-primary" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {building.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {building.addressLine1}, {building.location?.wardName},{building.location?.districtName},{building.location?.provinceName}
                    </p>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {building.description
                        ? parse(building.description)
                        : "Chưa có mô tả"}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Icon icon="zi-home" size={14} />
                        {building.roomCount || 0} phòng
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <Icon icon="zi-chevron-right" size={20} className="text-gray-400 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Box>

      <div className="h-20 bg-transparent" />
      <BottomNav />
    </Page>
  );
};

export default BuildingsPage;
