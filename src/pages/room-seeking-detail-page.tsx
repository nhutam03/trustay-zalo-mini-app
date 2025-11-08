import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page, Box, Button, Icon, Spinner } from "zmp-ui";
import BottomNav from "@/components/navigate-bottom";
import useSetHeader from "@/hooks/useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";
import { useRoomSeekingDetail, useTrackRoomSeekingView } from "@/hooks/useRoomSeekingQuery";
import { ROOM_TYPE_LABELS } from "@/interfaces/basic";

const RoomSeekingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const setHeader = useSetHeader();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Use TanStack Query
  const { data: post, isLoading: loading, error } = useRoomSeekingDetail(id);
  const trackPostView = useTrackRoomSeekingView();

  useEffect(() => {
    setHeader({
      title: "Chi tiết bài tìm phòng",
      hasLeftIcon: true,
      type: "primary",
      route: "/explore",
    });
    changeStatusBarColor("primary");
  }, [id]);

  // Track post view when data is loaded
  useEffect(() => {
    if (post) {
      trackPostView.mutate(post);
    }
  }, [post]);

  const formatPrice = (price: number | any | undefined) => {
    if (!price) return "0";
    // Handle Prisma Decimal format {s, e, d}
    if (typeof price === 'object' && price.d && Array.isArray(price.d)) {
      const value = price.d[0];
      return new Intl.NumberFormat("vi-VN").format(value);
    }
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Chưa xác định";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatAddress = () => {
    if (!post) return "";
    const parts: string[] = [];
    if (post.preferredWard?.name) parts.push(post.preferredWard.name);
    if (post.preferredDistrict?.name) parts.push(post.preferredDistrict.name);
    if (post.preferredProvince?.name) parts.push(post.preferredProvince.name);
    return parts.join(", ");
  };

  const getRoomTypeLabel = (type: string | undefined) => {
    if (!type) return "Chưa xác định";
    return ROOM_TYPE_LABELS[type as keyof typeof ROOM_TYPE_LABELS] || type;
  };

  if (loading) {
    return (
      <Page className="bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <Spinner />
        </div>
      </Page>
    );
  }

  if (error || (!loading && !post)) {
    return (
      <Page className="bg-gray-50">
        <Box className="p-4 text-center">
          <p className="text-red-500 mb-4">
            {error instanceof Error ? error.message : "Không tìm thấy bài đăng"}
          </p>
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
        </Box>
      </Page>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <Page className="bg-gray-50 has-bottom-nav">
      <Box className="p-4 space-y-4">
        {/* Header Section */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              {getRoomTypeLabel(post.preferredRoomType)}
            </span>
            {post.occupancy && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                {post.occupancy} người
              </span>
            )}
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded flex items-center gap-1">
              <Icon icon="zi-check-circle-solid" size={12} />
              {post.status === "active" ? "Đang tìm" : "Đã ngừng"}
            </span>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {post.title}
          </h1>

          <div className="flex items-start gap-1 text-sm text-gray-600 mb-3">
            <Icon icon="zi-location" size={16} className="flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{formatAddress()}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Icon icon="zi-star" size={14} />
              <span>{post.viewCount || 0} lượt xem</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Icon icon="zi-calendar" size={14} />
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Budget Section */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
          <p className="text-xs text-red-600 font-medium mb-1">Ngân sách</p>
          <div className="text-xl font-bold text-red-600">
            {post.minBudget && post.maxBudget
              ? `${formatPrice(post.minBudget)} - ${formatPrice(post.maxBudget)} /tháng`
              : `${formatPrice(post.maxBudget)} /tháng`}
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
            <Icon icon="zi-info-circle" size={18} />
            Thông tin chi tiết
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon icon="zi-home" size={18} className="text-blue-600" />
                <span className="text-sm text-gray-700">Loại phòng</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {getRoomTypeLabel(post.preferredRoomType)}
              </span>
            </div>

            {post.occupancy && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon icon="zi-user" size={18} className="text-green-600" />
                  <span className="text-sm text-gray-700">Số người ở</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {post.occupancy} người
                </span>
              </div>
            )}

            {post.moveInDate && (
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon icon="zi-calendar" size={18} className="text-purple-600" />
                  <span className="text-sm text-gray-700">Ngày dự kiến vào ở</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatDate(post.moveInDate)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon icon="zi-chat" size={18} className="text-orange-600" />
                <span className="text-sm text-gray-700">Lượt liên hệ</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {post.contactCount || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
            <Icon icon="zi-note" size={18} />
            Mô tả chi tiết
          </h3>
          <div
            className={`text-sm text-gray-700 whitespace-pre-line ${
              !isDescriptionExpanded ? "line-clamp-3" : ""
            }`}
          >
            {post.description || "Không có mô tả"}
          </div>
          {post.description && post.description.length > 150 && (
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="mt-2 text-primary text-sm font-medium flex items-center gap-1"
            >
              {isDescriptionExpanded ? (
                <>
                  Thu gọn <Icon icon="zi-chevron-up" size={14} />
                </>
              ) : (
                <>
                  Xem thêm <Icon icon="zi-chevron-down" size={14} />
                </>
              )}
            </button>
          )}
        </div>

        {/* Amenities */}
        {post.amenities && post.amenities.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
              <Icon icon="zi-star" size={18} />
              Tiện nghi mong muốn
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {post.amenities.map((amenity) => (
                <div
                  key={amenity.id}
                  className="flex items-center gap-2 text-sm text-gray-700 p-2 bg-gray-50 rounded"
                >
                  <Icon icon="zi-check-circle" size={16} className="text-green-500" />
                  <span>{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
            <Icon icon="zi-location" size={18} />
            Vị trí mong muốn
          </h3>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Icon icon="zi-location" size={18} className="text-gray-500" />
            <span className="text-sm text-gray-700">{formatAddress()}</span>
          </div>
        </div>

        {/* Requester Info */}
        {post.requester && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
              <Icon icon="zi-user" size={18} />
              Người đăng tin
            </h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  {post.requester.avatarUrl ? (
                    <img
                      src={post.requester.avatarUrl}
                      alt={post.requester.name || "User"}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Icon icon="zi-user" size={24} className="text-blue-600" />
                  )}
                </div>
                {post.requester.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">
                    {post.requester.name ||
                     (post.requester.firstName && post.requester.lastName
                       ? `${post.requester.firstName} ${post.requester.lastName}`
                       : "Người dùng")}
                  </p>
                  {post.requester.isVerifiedIdentity && (
                    <Icon icon="zi-check-circle-solid" size={16} className="text-blue-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {post.requester.isVerifiedEmail && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <Icon icon="zi-check-circle" size={12} />
                      Email
                    </span>
                  )}
                  {post.requester.isVerifiedPhone && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <Icon icon="zi-check-circle" size={12} />
                      SĐT
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Spacer for bottom action buttons + bottom nav */}
        <div className="h-24"></div>
      </Box>

      {/* Fixed Bottom Action Buttons */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-3 z-40">
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              // TODO: Implement favorite/save functionality
              console.log("Save post");
            }}
          >
            <Icon icon="zi-heart" size={18} />
          </Button>
          <Button
            variant="primary"
            className="flex-[3]"
            onClick={() => {
              // TODO: Implement contact functionality
              console.log("Contact requester");
            }}
          >
            <Icon icon="zi-chat" size={18} className="mr-2" />
            Liên hệ người dùng
          </Button>
        </div>
      </div>

      <BottomNav />
    </Page>
  );
};

export default RoomSeekingDetailPage;
