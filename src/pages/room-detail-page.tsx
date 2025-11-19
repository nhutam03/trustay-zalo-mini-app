import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page, Box, Button, Icon, Spinner } from "zmp-ui";
import BottomNav from "@/components/navigate-bottom";
import useSetHeader from "@/hooks/useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";
import { useRoomDetail, useTrackRoomView } from "@/hooks/useRoomQuery";
import { getImageProps } from "@/utils/image-proxy";

const RoomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const setHeader = useSetHeader();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Use TanStack Query
  const { data: room, isLoading: loading, error } = useRoomDetail(id);
  const trackRoomView = useTrackRoomView();

  useEffect(() => {
    setHeader({
      title: "Chi tiết phòng",
      hasLeftIcon: true,
      type: "primary",
      route: "/explore",
    });
    changeStatusBarColor("primary");
  }, [id]);

  // Track room view when room data is loaded
  useEffect(() => {
    if (room) {
      trackRoomView.mutate(room);
    }
  }, [room]);

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("vi-VN").format(parseInt(price));
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

  if (error || (!loading && !room)) {
    return (
      <Page className="bg-gray-50">
        <Box className="p-4 text-center">
          <p className="text-red-500 mb-4">
            {error instanceof Error ? error.message : "Không tìm thấy phòng"}
          </p>
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
        </Box>
      </Page>
    );
  }

  if (!room) {
    return null;
  }

  return (
    <Page className="bg-gray-50 has-bottom-nav">
      {/* Image Gallery */}
      <div className="relative">
        <div className="w-full h-64 overflow-hidden">
          <img
            {...getImageProps(
              room.images[currentImageIndex]?.url,
              room.images[currentImageIndex]?.alt || room.name,
              { width: 800, height: 400, quality: 80 }
            )}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Verified Badge */}
        {room.isVerified && (
          <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Icon icon="zi-check-circle-solid" size={14} />
            ĐÃ XÁC MINH
          </div>
        )}

        {/* Image Navigation */}
        {room.images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
            {room.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex
                    ? "bg-white w-4"
                    : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <Box className="p-4 space-y-4">
        {/* Header Section */}
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              {room.roomType}
            </span>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
              {room.maxOccupancy} người
            </span>
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
              {room.areaSqm}m²
            </span>
            {room.floorNumber && (
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                Tầng {room.floorNumber}
              </span>
            )}
            {room.availableRooms > 0 && (
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded">
                {room.availableRooms} phòng trống
              </span>
            )}
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {room.name}
          </h1>

          <div className="flex items-start gap-1 text-sm text-gray-600 mb-3">
            <Icon icon="zi-location" size={16} className="flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">
              {room.address}, {room.location.wardName}, {room.location.districtName}, {room.location.provinceName}
            </span>
          </div>

          {/* View Count */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Icon icon="zi-more-grid" size={14} />
            <span>{room.viewCount} lượt xem</span>
          </div>
        </div>

        {/* Price Section */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-600 font-medium mb-1">Giá thuê</p>
              <div className="text-2xl font-bold text-red-600">
                {formatPrice(room.pricing.basePriceMonthly)} đ/tháng
              </div>
              {room.pricing.utilityIncluded && (
                <span className="inline-block mt-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  Bao gồm tiện ích
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Building Info */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
            <Icon icon="zi-home" size={18} />
            Thông tin dãy trọ
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Tòa nhà:</span>
              <span className="text-sm font-medium">{room.buildingName}</span>
              {room.buildingVerified && (
                <Icon icon="zi-check-circle-solid" size={14} className="text-green-500" />
              )}
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
            <Icon icon="zi-star" size={18} />
            Tiện nghi
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {room.amenities.map((amenity) => (
              <div
                key={amenity.id}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <Icon icon="zi-check-circle" size={16} className="text-green-500" />
                <span>{amenity.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing & Costs */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
            <Icon icon="zi-poll" size={18} />
            Chi phí phát sinh
          </h3>
          {room.costs && room.costs.length > 0 ? (
            <div className="space-y-2">
              {room.costs.map((cost) => (
                <div key={cost.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">{cost.name}</span>
                  <span className="text-sm font-semibold text-green-600">
                    {formatPrice(cost.value)}đ
                  </span>
                </div>
              ))}
              {room.pricing.depositAmount && (
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded border-t border-blue-200 mt-2">
                  <span className="text-sm font-medium text-gray-900">Tiền cọc</span>
                  <span className="text-sm font-bold text-blue-600">
                    {formatPrice(room.pricing.depositAmount)}đ
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Không có chi phí phát sinh</p>
          )}
        </div>

        {/* Rules */}
        {room.rules && room.rules.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
              <Icon icon="zi-info-circle" size={18} />
              Quy định
            </h3>
            <div className="space-y-2">
              {room.rules.map((rule) => {
                const getRuleStyle = (type: string) => {
                  switch (type) {
                    case "required":
                      return "bg-green-100 text-green-800";
                    case "forbidden":
                      return "bg-red-100 text-red-800";
                    case "allowed":
                      return "bg-blue-100 text-blue-800";
                    default:
                      return "bg-yellow-100 text-yellow-800";
                  }
                };

                const getRuleIcon = (type: string) => {
                  switch (type) {
                    case "required":
                      return "zi-check-circle";
                    case "forbidden":
                      return "zi-close-circle";
                    default:
                      return "zi-info-circle";
                  }
                };

                return (
                  <div
                    key={rule.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${getRuleStyle(
                      rule.type
                    )}`}
                  >
                    <Icon icon={getRuleIcon(rule.type) as any} size={14} />
                    <span>{rule.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
            {room.description || room.name}
          </div>
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
        </div>

        {/* Owner Info */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
            <Icon icon="zi-user" size={18} />
            Thông tin chủ trọ
          </h3>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              {room.owner.avatarUrl ? (
                <img
                  src={room.owner.avatarUrl}
                  alt={room.owner.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <Icon icon="zi-user" size={24} className="text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{room.owner.name}</p>
              <div className="flex items-center gap-2 mt-1">
                {room.owner.verifiedPhone && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <Icon icon="zi-check-circle-solid" size={12} />
                    SĐT
                  </span>
                )}
                {room.owner.verifiedEmail && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <Icon icon="zi-check-circle-solid" size={12} />
                    Email
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Rooms */}
        {room.similarRooms && room.similarRooms.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
              <Icon icon="zi-home" size={18} />
              Phòng tương tự
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {room.similarRooms.map((similarRoom) => (
                <div
                  key={similarRoom.id}
                  onClick={() => navigate(`/room/${similarRoom.id}`)}
                  className="flex-shrink-0 w-64 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md cursor-pointer transition-all"
                >
                  <div className="w-full h-40 overflow-hidden">
                    <img
                      {...getImageProps(
                        similarRoom.images[0]?.url,
                        similarRoom.name,
                        { width: 400, height: 300, quality: 75 }
                      )}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 h-10">
                      {similarRoom.name}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <Icon icon="zi-location" size={12} />
                      <span className="line-clamp-1">
                        {similarRoom.location.districtName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-red-600">
                        {formatPrice(similarRoom.pricing.basePriceMonthly)}đ
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{similarRoom.areaSqm}m²</span>
                      <span>•</span>
                      <span>{similarRoom.maxOccupancy} người</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spacer for bottom nav */}
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
              console.log("Save room");
            }}
          >
            <Icon icon="zi-heart" size={18} />
          </Button>
          <Button
            variant="primary"
            className="flex-[3]"
            onClick={() => {
              // TODO: Implement contact/booking functionality
              console.log("Contact owner");
            }}
          >
            <Icon icon="zi-chat" size={18} className="mr-2" />
            Liên hệ chủ trọ
          </Button>
        </div>
      </div>

      <BottomNav />
    </Page>
  );
};

export default RoomDetailPage;
