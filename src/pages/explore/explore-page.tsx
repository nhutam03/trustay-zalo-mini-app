import BottomNav from "@/components/navigate-bottom";
import RoomCard from "@/components/room-card";
import RoomSeekingCard from "@/components/room-seeking-card";
import RoommateCard from "@/components/roommate-seeking-card";
import useSetHeader from "@/hooks/useSetHeader";
import { RoomCardProps, RoommateCardProps, RoomSeekingCardProps } from "@/interfaces/basic";
import { useRoommatePostsList } from "@/hooks/useRoommateQuery";
import { useRoomsList } from "@/hooks/useRoomQuery";
import { useRoomSeekingPostsList } from "@/hooks/useRoomSeekingQuery";
import { changeStatusBarColor } from "@/utils/basic";
import { roomsToRoomCards } from "@/utils/room";
import { roomSeekingPostsToCards } from "@/utils/room-seeking";
import { roommatePostsToCards } from "@/utils/roommate-seeking";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useLayoutEffect } from "react";

import Box from "zmp-ui/box";
import Page from "zmp-ui/page";
import Tabs from "zmp-ui/tabs";

const ExplorePage: React.FC = () => {
  const setHeader = useSetHeader();
  const location = useLocation();
  
  // Persist state using sessionStorage to survive component unmount/remount
  const [activeTab, setActiveTab] = useState<"all-rooms" | "seeking-rooms" | "seeking-roommates">(() => {
    const saved = sessionStorage.getItem('explore-active-tab');
    return (location.state as any)?.activeTab || saved || "all-rooms";
  });

  // Pagination states - persist across navigation
  const [currentPageAllRooms, setCurrentPageAllRooms] = useState(() => {
    const saved = sessionStorage.getItem('explore-page-all-rooms');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [currentPageSeekingRooms, setCurrentPageSeekingRooms] = useState(() => {
    const saved = sessionStorage.getItem('explore-page-seeking-rooms');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [currentPageRoommates, setCurrentPageRoommates] = useState(() => {
    const saved = sessionStorage.getItem('explore-page-roommates');
    return saved ? parseInt(saved, 10) : 1;
  });

  const ITEMS_PER_PAGE = 20;

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('explore-active-tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    sessionStorage.setItem('explore-page-all-rooms', currentPageAllRooms.toString());
  }, [currentPageAllRooms]);

  useEffect(() => {
    sessionStorage.setItem('explore-page-seeking-rooms', currentPageSeekingRooms.toString());
  }, [currentPageSeekingRooms]);

  useEffect(() => {
    sessionStorage.setItem('explore-page-roommates', currentPageRoommates.toString());
  }, [currentPageRoommates]);

  // Use TanStack Query hooks for all tabs
  const {
    data: roomsData,
    isLoading: loadingAllRooms,
    isFetching: fetchingAllRooms,
    isSuccess: successAllRooms,
  } = useRoomsList({
    search: '.',
    page: currentPageAllRooms,
    limit: ITEMS_PER_PAGE,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const {
    data: roomSeekingData,
    isLoading: loadingSeekingRooms,
    isFetching: fetchingSeekingRooms,
  } = useRoomSeekingPostsList({
    page: currentPageSeekingRooms,
    limit: ITEMS_PER_PAGE,
  });

  const {
    data: roommateData,
    isLoading: loadingRoommates,
    isFetching: fetchingRoommates,
  } = useRoommatePostsList(currentPageRoommates, ITEMS_PER_PAGE);

  // Debug: Log to verify TanStack Query is using cache
  useEffect(() => {
    if (activeTab === 'all-rooms') {
      console.log('🔍 All Rooms - Loading:', loadingAllRooms, 'Fetching:', fetchingAllRooms, 'Success:', successAllRooms, 'Has Data:', !!roomsData);
      if (roomsData && !fetchingAllRooms) {
        console.log('✅ Using cached data for page', currentPageAllRooms);
      }
    }
  }, [activeTab, loadingAllRooms, fetchingAllRooms, roomsData, currentPageAllRooms, successAllRooms]);

  // Derived data
  const allRooms = roomsData ? roomsToRoomCards(roomsData) : [];
  const totalPagesAllRooms = roomsData?.meta.totalPages || 1;

  const seekingRooms = roomSeekingData ? roomSeekingPostsToCards(roomSeekingData) : [];
  const totalPagesSeekingRooms = roomSeekingData?.meta.totalPages || 1;
  const totalSeekingRooms = roomSeekingData?.meta.total || 0;

  const roommatePosts = roommateData?.data ? roommatePostsToCards(roommateData.data) : [];
  const totalPagesRoommates = roommateData?.meta.totalPages || 1;

  useEffect(() => {
    setHeader({
      title: "Khám phá",
      hasLeftIcon: false,
      type: "primary",
    });
    changeStatusBarColor("primary");

    // Disable browser's automatic scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

  // Restore scroll position when returning from room detail
  // Use useLayoutEffect to restore BEFORE browser paints
  useLayoutEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('explore-return-scroll');
    
    if (savedScrollPosition) {
      const scrollPosition = parseInt(savedScrollPosition, 10);
      console.log('🔄 [LayoutEffect] Attempting to restore scroll to:', scrollPosition);
      
      // Prevent any automatic scroll to top
      const preventScroll = (e: Event) => {
        if (window.scrollY === 0 && scrollPosition > 0) {
          e.preventDefault();
          window.scrollTo(0, scrollPosition);
        }
      };
      
      window.addEventListener('scroll', preventScroll, { passive: false });
      
      // Restore immediately in layoutEffect (before paint)
      window.scrollTo(0, scrollPosition);
      
      // Try multiple times to ensure it sticks
      const timeouts: NodeJS.Timeout[] = [];
      [0, 10, 50, 100, 200].forEach(delay => {
        const timeoutId = setTimeout(() => {
          if (window.scrollY !== scrollPosition) {
            window.scrollTo(0, scrollPosition);
            console.log(`🔄 Retry scroll restore at ${delay}ms:`, scrollPosition);
          }
        }, delay);
        timeouts.push(timeoutId);
      });
      
      // Clean up after final attempt
      const finalTimeout = setTimeout(() => {
        window.removeEventListener('scroll', preventScroll);
        console.log('✅ [LayoutEffect] Final scroll position:', window.scrollY);
        sessionStorage.removeItem('explore-return-scroll');
      }, 300);
      timeouts.push(finalTimeout);
      
      return () => {
        window.removeEventListener('scroll', preventScroll);
        timeouts.forEach(t => clearTimeout(t));
      };
    }
  }, []);

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as typeof activeTab);
    // All data is loaded automatically by TanStack Query hooks
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
      {/* Tabs Header - sticky at top */}
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
                  onPageChange={(page) => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setCurrentPageAllRooms(page);
                  }}
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
                  onPageChange={(page) => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setCurrentPageSeekingRooms(page);
                  }}
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
        <div className="h-16 bg-white"> </div>
      </Box>
      <BottomNav />
    </Page>
  );
};

export default ExplorePage;
