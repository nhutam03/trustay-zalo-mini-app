import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page, Box, Button, Icon, Spinner } from "zmp-ui";
import parse from "html-react-parser";
import BottomNav from "@/components/navigate-bottom";
import useSetHeader from "@/hooks/useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";
import { useRoommateDetail, useTrackRoommateView } from "@/hooks/useRoommateQuery";

const RoommateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const setHeader = useSetHeader();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Use TanStack Query
  const { data: post, isLoading: loading, error } = useRoommateDetail(id);
  const trackPostView = useTrackRoommateView();

  useEffect(() => {
    setHeader({
      title: "Chi tiết bài đăng",
      hasLeftIcon: true,
      type: "primary",
      route: "/explore?tab=seeking-roommates",
    });
    changeStatusBarColor("primary");
  }, [id]);

  // Track post view when data is loaded
  useEffect(() => {
    if (post) {
      trackPostView.mutate(post);
    }
  }, [post]);

  const formatPrice = (price: number | undefined) => {
    if (!price) return "0";
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

  const getGenderText = (gender: string | undefined) => {
    switch (gender) {
      case "male": return "Nam";
      case "female": return "Nữ";
      case "mixed":
      case "other": return "Nam/Nữ";
      default: return "Không yêu cầu";
    }
  };

  const getStatusText = (status: string | undefined) => {
    switch (status) {
      case "active": return "Đang hoạt động";
      case "inactive": return "Không hoạt động";
      case "expired": return "Hết hạn";
      case "found": return "Đã tìm được";
      case "closed": return "Đã đóng";
      default: return "Không xác định";
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "expired": return "bg-red-100 text-red-800";
      case "found": return "bg-blue-100 text-blue-800";
      case "closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Page className="bg-gray-50">
        <div className="flex items-center justify-center h-screen">
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
    <Page className="bg-gray-50">
      <Box className="p-4 space-y-4">
        {/* Header Section */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(post.status)}`}>
              {getStatusText(post.status)}
            </span>
            {post.preferredGender && (
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                {getGenderText(post.preferredGender)}
              </span>
            )}
            {post.minimumStayMonths && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {post.minimumStayMonths}{post.maximumStayMonths ? `-${post.maximumStayMonths}` : '+'} tháng
              </span>
            )}
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2 break-words">
            {post.title}
          </h1>

          {(post.externalAddress || post.roomInstance?.room?.building?.address) && (
            <div className="flex items-start gap-1 text-sm text-gray-600 mb-3">
              <Icon icon="zi-location" size={16} className="flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">
                {post.externalAddress || post.roomInstance?.room?.building?.address}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500">
            {post.viewCount !== undefined && (
              <>
                <div className="flex items-center gap-1">
                  <Icon icon="zi-star" size={14} />
                  <span>{post.viewCount || 0} lượt xem</span>
                </div>
                <span>"</span>
              </>
            )}
            <div className="flex items-center gap-1">
              <Icon icon="zi-calendar" size={14} />
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Room Info Section - if it's a platform room */}
        {post.roomInstance?.room && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
              <Icon icon="zi-home" size={18} />
              Thông tin phòng
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tòa nhà</span>
                <span className="text-sm font-medium text-gray-900">
                  {post.roomInstance.room.building?.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Phòng</span>
                <button
                  onClick={() => navigate(`/rooms/${post.roomInstance?.room?.id}`)}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {post.roomInstance.room.name} - {post.roomInstance.roomNumber}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Budget Section */}
        {post.monthlyRent && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <p className="text-xs text-green-600 font-medium mb-1">Tiền thuê hàng tháng</p>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(post.monthlyRent)} {post.currency || 'VND'}/tháng
            </div>
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
            <Icon icon="zi-info-circle" size={18} />
            Thông tin chi tiết
          </h3>
          <div className="space-y-3">
            {post.preferredGender && (
              <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon icon="zi-user" size={18} className="text-pink-600" />
                  <span className="text-sm text-gray-700">Giới tính ưu tiên</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {getGenderText(post.preferredGender)}
                </span>
              </div>
            )}

            {post.availableFromDate && (
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon icon="zi-calendar" size={18} className="text-orange-600" />
                  <span className="text-sm text-gray-700">Ngày có thể chuyển vào</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatDate(post.availableFromDate)}
                </span>
              </div>
            )}

            {post.minimumStayMonths && (
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon icon="zi-calendar" size={18} className="text-indigo-600" />
                  <span className="text-sm text-gray-700">Thời gian ở tối thiểu</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {post.minimumStayMonths} tháng
                </span>
              </div>
            )}

            {post.maximumStayMonths && (
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon icon="zi-calendar" size={18} className="text-indigo-600" />
                  <span className="text-sm text-gray-700">Thời gian ở tối đa</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {post.maximumStayMonths} tháng
                </span>
              </div>
            )}

            {post.depositAmount !== undefined && post.depositAmount > 0 && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon icon="zi-star" size={18} className="text-yellow-600" />
                  <span className="text-sm text-gray-700">Tiền đặt cọc</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatPrice(post.depositAmount)} {post.currency || 'VND'}
                </span>
              </div>
            )}

            {post.maxOccupancy && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon icon="zi-user" size={18} className="text-blue-600" />
                  <span className="text-sm text-gray-700">Số người ở tối đa</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {post.maxOccupancy} người
                </span>
              </div>
            )}

            {post.currentOccupancy !== undefined && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon icon="zi-user" size={18} className="text-green-600" />
                  <span className="text-sm text-gray-700">Số người hiện tại</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {post.currentOccupancy} người
                </span>
              </div>
            )}

            {post.seekingCount !== undefined && (
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon icon="zi-user" size={18} className="text-purple-600" />
                  <span className="text-sm text-gray-700">Số người đang tìm</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {post.seekingCount} người
                </span>
              </div>
            )}

            {post.remainingSlots !== undefined && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon icon="zi-user" size={18} className="text-red-600" />
                  <span className="text-sm text-gray-700">Số chỗ còn lại</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {post.remainingSlots} chỗ
                </span>
              </div>
            )}

            {post.contactCount !== undefined && (
              <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon icon="zi-chat" size={18} className="text-teal-600" />
                  <span className="text-sm text-gray-700">Lượt liên hệ</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {post.contactCount || 0}
                </span>
              </div>
            )}

            {post.expiresAt && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icon icon="zi-calendar" size={18} className="text-gray-600" />
                  <span className="text-sm text-gray-700">Ngày hết hạn</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatDate(post.expiresAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
            <Icon icon="zi-note" size={18} />
            Mô tả chi tiết
          </h3>
          <div
            className={`text-sm text-gray-700 prose prose-sm max-w-none ${
              !isDescriptionExpanded ? "line-clamp-3" : ""
            }`}
          >
            {post.description ? parse(post.description) : "Không có mô tả chi tiết."}
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

        {/* Additional Requirements */}
        {post.additionalRequirements && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
              <Icon icon="zi-check-circle" size={18} />
              Yêu cầu bổ sung
            </h3>
            <div className="text-sm text-gray-700 prose prose-sm max-w-none">
              {parse(post.additionalRequirements)}
            </div>
          </div>
        )}

        {/* Landlord Notes */}
        {post.landlordNotes && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
              <Icon icon="zi-star" size={18} />
              Ghi chú từ chủ nhà
            </h3>
            <div className="text-sm text-gray-700">
              {post.landlordNotes}
            </div>
          </div>
        )}

        {/* Author Info */}
        {post.tenant && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
              <Icon icon="zi-user" size={18} />
              Người đăng tin
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon icon="zi-user" size={24} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {post.tenant.lastName} {post.tenant.firstName}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Spacer for bottom nav */}
        <div className="h-4"></div>
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
            disabled={post.status !== "active"}
            onClick={() => {
              // TODO: Implement contact functionality
              console.log("Contact author");
            }}
          >
            <Icon icon="zi-chat" size={18} className="mr-2" />
            {post.status === "active" ? "Gửi yêu cầu ở ghép" : "Không thể gửi yêu cầu"}
          </Button>
        </div>
      </div>

    </Page>
  );
};

export default RoommateDetailPage;
