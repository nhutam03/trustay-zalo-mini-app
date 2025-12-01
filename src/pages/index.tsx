import { Box, Button, Icon, Input, Page, Text, useNavigate } from "zmp-ui";
import { MenuItemProps, RoomCardProps } from "@/interfaces/basic";
import { useEffect, useState } from "react";
import BannerSlider from "@/components/banner-slider";
import MenuGrid from "@/components/menu-grid";
import SectionHeader from "@/components/section-header";
import { getFeaturedRoomListings } from "@/services/listing";
import RoomCard from "@/components/room-card";
import BottomNav from "@/components/navigate-bottom";
import useSetHeader from "@/hooks/useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";
import RecentlyViewedRooms from "@/components/recently-viewed-rooms";

function HomePage() {
  const navigate = useNavigate();
  const setHeader = useSetHeader();
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredRooms, setFeaturedRooms] = useState<RoomCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  // Danh sách chức năng menu
  const menuItems: MenuItemProps[] = [
    {
      id: "search-room",
      title: "Tìm Phòng",
      icon: "zi-search",
      route: "/rooms",
    },
    {
      id: "find-roommate",
      title: "Tìm Bạn Ở Ghép",
      icon: "zi-user-circle",
      route: "/roommate",
    },
    {
      id: "post-room",
      title: "Đăng Tin",
      icon: "zi-plus-circle",
      route: "/post-room",
    },
    {
      id: "saved",
      title: "Đã Lưu",
      icon: "zi-heart",
      route: "/saved",
    },
    {
      id: "contracts",
      title: "Hợp Đồng",
      icon: "zi-note",
      route: "/contracts",
    },
    {
      id: "payments",
      title: "Thanh Toán",
      icon: "zi-poll",
      route: "/payments",
    },
    {
      id: "room-issues",
      title: "Sự Cố",
      icon: "zi-warning",
      route: "/room-issues-management",
    },
    {
      id: "profile",
      title: "Cá Nhân",
      icon: "zi-user",
      route: "/profile",
    },
  ];

  useEffect(() => {
    setHeader({
      customTitle: "",
      hasLeftIcon: false,
      type: "primary",
    });
    changeStatusBarColor("primary");

    const loadFeaturedRooms = async () => {
      try {
        setLoading(true);
        const rooms = await getFeaturedRoomListings(4); // Get 4 featured rooms
        const roomCards = rooms.map(room => ({
          id: room.id,
          title: room.name,
          price: parseFloat(room.pricing?.basePriceMonthly || "0"),
          location: `${room.location.wardName}, ${room.location.districtName}, ${room.location.provinceName}`,
          image: room.images?.[0]?.url || "https://via.placeholder.com/300x200",
          verified: room.isVerified,
        }));
        setFeaturedRooms(roomCards);
      } catch (error) {
        console.error("Failed to load featured rooms:", error);
        // Keep empty array on error
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedRooms();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/rooms?search=${encodeURIComponent(searchQuery)}`);
    }
  };
  return (
    <Page className="bg-gray-50">
      {/* <Box className="bg-primary px-2 pb-2">
        <Input.Search
          placeholder="Tìm phòng trọ, khu vực..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
          className="bg-white"
        />
      </Box> */}
      <BannerSlider />
      <MenuGrid items={menuItems} />

      <div className="h-2 bg-gray-100" />

      {/* Recently Viewed Rooms */}
      <RecentlyViewedRooms />

      <div className="h-2 bg-gray-100" />

      <Box className="bg-white pb-4">
        <SectionHeader
          title="PHÒNG TRỌ NỔI BẬT"
          subtitle="Được quan tâm nhiều nhất"
          action={{
            label: "Xem tất cả",
            onClick: () => navigate("/rooms"),
          }}
        />
        <div className="px-4 grid grid-cols-2 gap-3">
          {loading ? (
            // Loading skeleton
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="trustay-card animate-pulse">
                  <div className="bg-gray-200 h-32 w-full" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </>
          ) : featuredRooms.length > 0 ? (
            featuredRooms.map((room) => (
              <RoomCard key={room.id} {...room} />
            ))
          ) : (
            <div className="col-span-2 text-center py-8 text-gray-500">
              Không có phòng trọ nào
            </div>
          )}
        </div>

        <div className="px-4 mt-4">
          <button
            onClick={() => navigate("/explore?tab=rooms")}
            className="w-full py-3 border-2 border-primary text-primary font-medium rounded-lg active:opacity-70"
          >
            Xem thêm phòng trọ
          </button>
        </div>

        <div className="h-2 mb-8 bg-white" />
      </Box>

      <div className="h-4 bg-white" />

      <BottomNav/>
    </Page>
  );
}

export default HomePage;
