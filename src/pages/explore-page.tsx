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
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";

import Box from "zmp-ui/box";
import Page from "zmp-ui/page";
import Tabs from "zmp-ui/tabs";
import { Icon, Input } from "zmp-ui";

const ExplorePage: React.FC = () => {
  const setHeader = useSetHeader();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"all-rooms" | "seeking-rooms" | "seeking-roommates">(
    (location.state as any)?.activeTab || "all-rooms"
  );

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>((searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc');

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
    // Get search query from URL
    const urlSearchQuery = searchParams.get('search');

    // Update header with custom search bar if there's a search query
    if (urlSearchQuery && activeTab === "all-rooms") {
      setHeader({
        customTitle: (
          <div className="flex-1 flex items-center gap-2 pr-4">
            <Input.Search
              placeholder="Tìm phòng trọ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSearch={handleSearch}
              className="flex-1"
              style={{
                backgroundColor: 'white',
                borderRadius: '8px'
              }}
            />
          </div>
        ),
        hasLeftIcon: true,
        route: "/explore",
        type: "primary",
      });
    } else {
      setHeader({
        title: "Khám phá",
        hasLeftIcon: false,
        type: "primary",
      });
    }
    changeStatusBarColor("primary");

    // Get sort parameters from URL
    const urlSortBy = searchParams.get('sortBy');
    const urlSortOrder = searchParams.get('sortOrder');

    // Load initial data based on active tab
    if (activeTab === "all-rooms") {
      loadAllRooms(1, urlSearchQuery || undefined, urlSortBy || undefined, urlSortOrder || undefined);
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
  }, [activeTab, searchParams]);

  // Save scroll position before navigating away
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem(`explore-scroll-${activeTab}`, window.scrollY.toString());
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  // Update URL params
  const updateSearchParams = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    updateSearchParams({ search: query, page: '1' });
  };

  // Handle sort change
  const handleSortChange = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    updateSearchParams({ sortBy: newSortBy, sortOrder: newSortOrder, page: '1' });
  };

  // Load all rooms (general listing)
  const loadAllRooms = async (page: number = 1, searchQuery?: string, sortByParam?: string, sortOrderParam?: string) => {
    try {
      setLoadingAllRooms(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const response = await searchRoomListings({
        search: searchQuery || '.',
        page,
        limit: ITEMS_PER_PAGE,
        sortBy: (sortByParam as 'price' | 'area' | 'createdAt') || 'createdAt',
        sortOrder: (sortOrderParam as 'asc' | 'desc') || 'desc',
      });
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

  // Sorting tabs component
  const SortingTabs = () => {
    const isActive = (sortByValue: string, sortOrderValue?: string) => {
      if (sortOrderValue) {
        return sortBy === sortByValue && sortOrder === sortOrderValue;
      }
      return sortBy === sortByValue;
    };

    return (
      <div className="bg-white border-b sticky z-[9] shadow-sm mb-3">
        <div className="flex items-center overflow-x-auto scrollbar-hide">
          {/* Mới nhất */}
          <button
            onClick={() => handleSortChange('createdAt', 'desc')}
            className={`flex-shrink-0 h-10 px-4 border-b-2 transition-colors text-sm ${
              isActive('createdAt', 'desc')
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-gray-600'
            }`}
          >
            <div className="flex items-center gap-1">
              <Icon icon="zi-calendar" size={16} />
              Mới nhất
            </div>
          </button>

          {/* Phổ biến */}
          <button
            onClick={() => handleSortChange('createdAt', 'asc')}
            className={`flex-shrink-0 h-10 px-4 border-b-2 transition-colors text-sm ${
              isActive('createdAt', 'asc')
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-gray-600'
            }`}
          >
            <div className="flex items-center gap-1">
              <Icon icon="zi-star" size={16} />
              Phổ biến
            </div>
          </button>

          {/* Giá */}
          <button
            onClick={() => {
              if (isActive('price')) {
                const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                handleSortChange('price', newOrder);
              } else {
                handleSortChange('price', 'asc');
              }
            }}
            className={`flex-shrink-0 h-10 px-4 border-b-2 transition-colors text-sm ${
              isActive('price')
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-gray-600'
            }`}
          >
            <div className="flex items-center gap-1">
              Giá
              <span className={`transition-transform inline-block ${
                  isActive('price', 'desc') ? 'rotate-180' : ''
                }`}>
                ↕
              </span>
            </div>
          </button>

          {/* Diện tích */}
          <button
            onClick={() => {
              if (isActive('area')) {
                const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                handleSortChange('area', newOrder);
              } else {
                handleSortChange('area', 'desc');
              }
            }}
            className={`flex-shrink-0 h-10 px-4 border-b-2 transition-colors text-sm ${
              isActive('area')
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-gray-600'
            }`}
          >
            <div className="flex items-center gap-1">
              Diện tích
              <span className={`transition-transform inline-block ${
                  isActive('area', 'desc') ? 'rotate-180' : ''
                }`}>
                ↕
              </span>
            </div>
          </button>
        </div>
      </div>
    );
  };

  return (
    <Page className="bg-gray-50 has-bottom-nav">
      {/* Tabs Header - sticky at top */}
      <Box className="bg-white sticky z-10 shadow-sm">
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

      {/* Search result count - only show if there's a search query */}
      {searchQuery && activeTab === "all-rooms" && (
        <Box className="bg-white px-4 py-2 border-b">
          <div className="text-xs text-gray-500">
            Tìm thấy <span className="font-semibold text-gray-700">{totalAllRooms}</span> kết quả cho "{searchQuery}"
          </div>
        </Box>
      )}

      {/* Sorting tabs - only for all-rooms tab */}
      {activeTab === "all-rooms" && <SortingTabs />}

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
                  onPageChange={(page) => loadAllRooms(
                    page,
                    searchParams.get('search') || undefined,
                    searchParams.get('sortBy') || undefined,
                    searchParams.get('sortOrder') || undefined
                  )}
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
