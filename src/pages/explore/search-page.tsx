import BottomNav from "@/components/navigate-bottom";
import RoomCard from "@/components/room-card";
import useSetHeader from "@/hooks/useSetHeader";
import { useRoomsList } from "@/hooks/useRoomQuery";
import { changeStatusBarColor } from "@/utils/basic";
import { roomsToRoomCards } from "@/utils/room";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import Box from "zmp-ui/box";
import Page from "zmp-ui/page";
import { Icon } from "zmp-ui";

const SearchPage: React.FC = () => {
  const setHeader = useSetHeader();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get('q') || '';
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>((searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc');
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 20;

  // Fetch search results - memoize params to prevent unnecessary refetches
  const queryParams = useMemo(() => ({
    search: searchQuery,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    sortBy: (sortBy as 'price' | 'area' | 'createdAt'),
    sortOrder: sortOrder,
  }), [searchQuery, currentPage, sortBy, sortOrder]);

  const {
    data: roomsData,
    isLoading,
  } = useRoomsList(queryParams);

  const allRooms = roomsData ? roomsToRoomCards(roomsData) : [];
  const totalPages = roomsData?.meta.totalPages || 1;
  const totalResults = roomsData?.meta.total || 0;

  useEffect(() => {
    setHeader({
      title: "Kết quả tìm kiếm",
      hasLeftIcon: true,
      route: "/explore",
      type: "primary",
    });
    changeStatusBarColor("primary");
  }, [setHeader]);

  // Handle sort change
  const handleSortChange = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
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
      {/* Search Info */}
      <Box className="bg-white px-4 py-3 border-b sticky top-0 z-10">
        <div className="text-sm text-gray-600">
          Tìm kiếm: <span className="font-semibold text-gray-900">"{searchQuery}"</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {totalResults} kết quả
        </div>
      </Box>

      {/* Sorting tabs */}
      <SortingTabs />

      {/* Results */}
      <Box className="p-4">
        {isLoading && allRooms.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Đang tìm kiếm...</p>
          </div>
        ) : allRooms.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              {allRooms.map((room) => (
                <RoomCard key={room.id} {...room} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setCurrentPage(page);
              }}
            />
          </>
        ) : (
          <div className="text-center py-10">
            <div className="text-gray-400 mb-3">
              <Icon icon="zi-search" size={48} />
            </div>
            <p className="text-gray-600 font-medium">Không tìm thấy kết quả</p>
            <p className="text-gray-500 text-sm mt-1">
              Thử tìm kiếm với từ khóa khác
            </p>
          </div>
        )}
        <div className="h-16 bg-white"></div>
      </Box>
      <BottomNav />
    </Page>
  );
};

export default SearchPage;
