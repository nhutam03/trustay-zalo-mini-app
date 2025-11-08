import BottomNav from "@/components/navigate-bottom";
import RoomCard from "@/components/room-card";
import RoomSeekingCard from "@/components/room-seeking-card";
import RoommateCard from "@/components/roommate-seeking-card";
import useSetHeader from "@/hooks/useSetHeader";
import { RoomCardProps, RoommateCardProps, RoomSeekingCardProps } from "@/interfaces/basic";
import { useRoommatePostsList } from "@/hooks/useRoommateQuery";
import { listPublicRoomSeekingPosts, searchRoomListings } from "@/services/listing";
import { getFeaturedRooms } from "@/services/room";
import { changeStatusBarColor } from "@/utils/basic";
import { roomsToRoomCards } from "@/utils/room";
import { roomSeekingPostsToCards } from "@/utils/room-seeking";
import { roommatePostsToCards } from "@/utils/roommate-seeking";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import Box from "zmp-ui/box";
import Page from "zmp-ui/page";
import Tabs from "zmp-ui/tabs";

const ExplorePage: React.FC = () => {
  const setHeader = useSetHeader();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"all-rooms" | "seeking-rooms" | "seeking-roommates">(
    (location.state as any)?.activeTab || "all-rooms"
  );

  // State for all rooms
  const [allRooms, setAllRooms] = useState<RoomCardProps[]>([]);
  const [loadingAllRooms, setLoadingAllRooms] = useState(true);
  const [currentPageAllRooms, setCurrentPageAllRooms] = useState(1);
  const [totalPagesAllRooms, setTotalPagesAllRooms] = useState(1);
  const [totalAllRooms, setTotalAllRooms] = useState(0);

  // State for seeking rooms (people looking for rooms)
  const [seekingRooms, setSeekingRooms] = useState<RoomSeekingCardProps[]>([]);
  const [loadingSeekingRooms, setLoadingSeekingRooms] = useState(false);
  const [currentPageSeekingRooms, setCurrentPageSeekingRooms] = useState(1);
  const [totalPagesSeekingRooms, setTotalPagesSeekingRooms] = useState(1);
  const [totalSeekingRooms, setTotalSeekingRooms] = useState(0);

  // State for roommate posts
  const [currentPageRoommates, setCurrentPageRoommates] = useState(1);

  // Use TanStack Query for roommate posts
  const {
    data: roommateData,
    isLoading: loadingRoommates,
    isFetching: isFetchingRoommates
  } = useRoommatePostsList(currentPageRoommates, 20);

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    setHeader({
      title: "Khám phá",
      hasLeftIcon: false,
      type: "primary",
    });
    changeStatusBarColor("primary");

    // Load initial data based on active tab
    if (activeTab === "all-rooms") {
      loadAllRooms();
    } else if (activeTab === "seeking-rooms") {
      loadSeekingRooms();
    }
    // roommate posts are loaded automatically by TanStack Query

    // Restore scroll position when coming back to this page
    const savedScrollPosition = sessionStorage.getItem(`explore-scroll-${activeTab}`);
    if (savedScrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition, 10));
        sessionStorage.removeItem(`explore-scroll-${activeTab}`);
      }, 100);
    }
  }, [activeTab]);

  // Save scroll position before navigating away
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem(`explore-scroll-${activeTab}`, window.scrollY.toString());
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  // Load all rooms (general listing)
  const loadAllRooms = async (page: number = 1) => {
    try {
      setLoadingAllRooms(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const response = await searchRoomListings({ search: '.', page, limit: ITEMS_PER_PAGE });
      const roomCards = roomsToRoomCards(response);
      setAllRooms(roomCards);
      setCurrentPageAllRooms(response.meta.page);
      setTotalPagesAllRooms(response.meta.totalPages);
      setTotalAllRooms(response.meta.total);
    } catch (error) {
      console.error("Failed to load all rooms:", error);
    } finally {
      setLoadingAllRooms(false);
    }
  };

  // Load seeking rooms (people looking for rooms)
  const loadSeekingRooms = async (page: number = 1) => {
    try {
      setLoadingSeekingRooms(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const response = await listPublicRoomSeekingPosts({ page, limit: ITEMS_PER_PAGE });
      const cards = roomSeekingPostsToCards(response);
      setSeekingRooms(cards);
      setCurrentPageSeekingRooms(response.meta.page);
      setTotalPagesSeekingRooms(response.meta.totalPages);
      setTotalSeekingRooms(response.meta.total);
    } catch (error) {
      console.error("Failed to load room seeking posts:", error);
    } finally {
      setLoadingSeekingRooms(false);
    }
  };

  // Derived data for roommate posts
  const roommatePosts = roommateData?.data ? roommatePostsToCards(roommateData.data) : [];
  const totalPagesRoommates = roommateData?.meta.totalPages || 1;

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as typeof activeTab);

    // Load data for the selected tab if not loaded yet
    if (tabId === "seeking-rooms" && seekingRooms.length === 0) {
      loadSeekingRooms();
    }
    // roommate posts are loaded automatically by TanStack Query when needed
  };

  // Pagination component
  const Pagination = ({
    currentPage,
    totalPages,
    onPageChange
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      const maxVisible = 5;

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          pages.push(currentPage - 1);
          pages.push(currentPage);
          pages.push(currentPage + 1);
          pages.push('...');
          pages.push(totalPages);
        }
      }

      return pages;
    };

    return (
      <div className="flex justify-center items-center gap-2 mt-6 mb-4">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-md bg-white border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          ←
        </button>

        {getPageNumbers().map((page, index) => (
          typeof page === 'number' ? (
            <button
              key={index}
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 rounded-md ${
                currentPage === page
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ) : (
            <span key={index} className="px-2">
              {page}
            </span>
          )
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-md bg-white border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          →
        </button>
      </div>
    );
  };

  return (
    <Page className="bg-gray-50 has-bottom-nav">
      {/* Tabs Header */}
      <Box className="bg-white sticky top-0 z-10 shadow-sm">
        <Tabs
          id="explore-tabs"
          activeKey={activeTab}
          onChange={handleTabChange}
        >
          <Tabs.Tab key="all-rooms" label="Phòng">
            {/* Content will be rendered below */}
          </Tabs.Tab>
          <Tabs.Tab key="seeking-rooms" label="Tìm phòng">
            {/* Content will be rendered below */}
          </Tabs.Tab>
          <Tabs.Tab key="seeking-roommates" label="Tìm bạn">
            {/* Content will be rendered below */}
          </Tabs.Tab>
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box className="p-4">
        {/* All Rooms Tab */}
        {activeTab === "all-rooms" && (
          <div>
            {loadingAllRooms ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Đang tải...</p>
              </div>
            ) : allRooms.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {allRooms.map((room) => (
                    <RoomCard key={room.id} {...room} />
                  ))}
                </div>
                <Pagination
                  currentPage={currentPageAllRooms}
                  totalPages={totalPagesAllRooms}
                  onPageChange={(page) => loadAllRooms(page)}
                />
              </>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">Không có phòng nào</p>
              </div>
            )}
          </div>
        )}

        {/* Seeking Rooms Tab */}
        {activeTab === "seeking-rooms" && (
          <div>
            {loadingSeekingRooms ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Đang tải...</p>
              </div>
            ) : seekingRooms.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-3">
                  {seekingRooms.map((post) => (
                    <RoomSeekingCard key={post.id} {...post} />
                  ))}
                </div>
                <Pagination
                  currentPage={currentPageSeekingRooms}
                  totalPages={totalPagesSeekingRooms}
                  onPageChange={(page) => loadSeekingRooms(page)}
                />
              </>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">Không có bài đăng tìm phòng nào</p>
              </div>
            )}
          </div>
        )}

        {/* Seeking Roommates Tab */}
        {activeTab === "seeking-roommates" && (
          <div>
            {loadingRoommates ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Đang tải...</p>
              </div>
            ) : roommatePosts.length > 0 ? (
              <>
                <div className="grid grid-cols-2">
                  {roommatePosts.map((post) => (
                    <RoommateCard key={post.id} {...post} />
                  ))}
                </div>
                <Pagination
                  currentPage={currentPageRoommates}
                  totalPages={totalPagesRoommates}
                  onPageChange={(page) => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setCurrentPageRoommates(page);
                  }}
                />
              </>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">Không có bài đăng tìm bạn ở ghép nào</p>
              </div>
            )}
          </div>
        )}
      </Box>

      <div className="h-4 mb-8 bg-white" />
      <BottomNav />
    </Page>
  );
};

export default ExplorePage;
