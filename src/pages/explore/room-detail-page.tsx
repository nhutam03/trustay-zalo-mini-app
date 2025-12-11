import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Page, Box, Button, Icon, Spinner } from "zmp-ui";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import parse from "html-react-parser";
import BottomNav from "@/components/navigate-bottom";
import useSetHeader from "@/hooks/useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";
import { useRoomDetail, useTrackRoomView } from "@/hooks/useRoomQuery";
import { getImageProps, processImageUrl } from "@/utils/image-proxy";
import { ROOM_TYPE_LABELS } from "@/interfaces/basic";
import { useCurrentUser } from "@/hooks/useAuthService";
import { useMyBookingRequests, useCreateBookingRequest } from "@/hooks/useBookingRequestService";
import { postAIChat } from "@/services/ai-service";

const RoomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const setHeader = useSetHeader();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [validImages, setValidImages] = useState<any[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [moveInDate, setMoveInDate] = useState("");
  const [message, setMessage] = useState("");
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Use TanStack Query
  const { data: room, isLoading: loading, error } = useRoomDetail(id);
  const trackRoomView = useTrackRoomView();
  
  // Auth and booking request
  const { data: currentUser } = useCurrentUser();
  const { data: myBookingRequests, refetch: refetchBookingRequests } = useMyBookingRequests({ status: 'pending' });
  const createBookingRequest = useCreateBookingRequest();

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


  // Pre-validate images before rendering
  useEffect(() => {
    if (!room?.images) return;

    const validateImages = async () => {
      const imagePromises = room.images.map((image) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ ...image, valid: true });
          img.onerror = () => resolve({ ...image, valid: false });
          img.src = processImageUrl(image.url);
        });
      });

      const results = await Promise.all(imagePromises);
      const valid = results.filter((img: any) => img.valid);
      setValidImages(valid);
    };

    validateImages();
  }, [room]);

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("vi-VN").format(parseInt(price));
  };

  // Handle touch events for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!validImages || validImages.length <= 1) return;

    const minSwipeDistance = 50;
    const distance = touchStart - touchEnd;

    if (Math.abs(distance) < minSwipeDistance) return;

    if (distance > 0) {
      // Swipe left - next image
      setCurrentImageIndex((prev) =>
        prev === validImages.length - 1 ? 0 : prev + 1
      );
    } else {
      // Swipe right - previous image
      setCurrentImageIndex((prev) =>
        prev === 0 ? validImages.length - 1 : prev - 1
      );
    }
  };

  // Check if user is tenant
  const isTenant = currentUser?.role === 'tenant';
  
  // Check if tenant has already sent booking request for this room
  const hasExistingRequest = myBookingRequests?.data?.some(
    (request) => request.roomId === id && request.status === 'pending'
  );
  
  // Check if tenant can send booking request
  const canSendBookingRequest = isTenant && !hasExistingRequest;

  // Handle booking request submission
  const handleSendBookingRequest = async () => {
    if (!id || !moveInDate) {
      return;
    }

    try {
      await createBookingRequest.mutateAsync({
        roomInstanceId: id,
        moveInDate,
        messageToOwner: message || undefined,
      });
      
      // Refetch booking requests to update UI
      await refetchBookingRequests();
      
      setShowBookingModal(false);
      setMoveInDate("");
      setMessage("");
      
      // Show success message
      alert("Gửi yêu cầu thuê thành công!");
    } catch (error) {
      console.error('Error sending booking request:', error);
      alert(error instanceof Error ? error.message : "Không thể gửi yêu cầu thuê");
    }
  };

  const handleBookingButtonClick = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (!isTenant) {
      alert("Chỉ người thuê mới có thể gửi yêu cầu thuê phòng");
      return;
    }
    
    if (hasExistingRequest) {
      alert("Bạn đã gửi yêu cầu thuê phòng này rồi");
      return;
    }
    
    setShowBookingModal(true);
  };

  // Handle AI room analysis
  const handleAIAnalysis = async () => {
    if (isAnalyzing) return;
    
    // Open modal immediately
    setShowAIModal(true);
    setIsAnalyzing(true);
    setAiAnalysisResult("");
    
    try {
      // Gọi API trực tiếp và lấy response
      const currentPage = `/rooms/${id}`;
      const response = await postAIChat("phân tích phòng trọ hiện tại", currentPage);
      
      // Hiển thị kết quả ngay
      console.log('[Room Detail] AI Response:', response);
      setAiAnalysisResult(response.message);
      setIsAnalyzing(false);
    } catch (error) {
      console.error('Error sending AI analysis:', error);
      setIsAnalyzing(false);
      setAiAnalysisResult("Không thể phân tích phòng. Vui lòng thử lại!");
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
    <Page className="bg-gray-50 page-with-bottom-nav">
      {/* Image Gallery */}
      {validImages.length > 0 ? (
        <div className="relative">
          <PhotoProvider>
            <div
              ref={imageContainerRef}
              className="w-full h-64 overflow-hidden relative"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <PhotoView key={validImages[currentImageIndex]?.id} src={processImageUrl(validImages[currentImageIndex]?.url)}>
                <img
                  {...getImageProps(
                    processImageUrl(validImages[currentImageIndex]?.url),
                    validImages[currentImageIndex]?.alt || room.name,
                    { width: 800, height: 400, quality: 80 }
                  )}
                  className="w-full h-full object-cover cursor-pointer"
                />
              </PhotoView>
            </div>
          </PhotoProvider>

          {/* Verified Badge */}
          {room.isVerified && (
            <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Icon icon="zi-check-circle-solid" size={14} />
              ĐÃ XÁC MINH
            </div>
          )}

          {/* Image Counter */}
          {validImages.length > 1 && (
            <div className="absolute top-3 left-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-semibold">
              {currentImageIndex + 1} / {validImages.length}
            </div>
          )}

          {/* Image Navigation Dots */}
          {validImages.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
              {validImages.map((_, index) => (
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
      ) : (
        <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Icon icon="zi-photo" size={48} className="mb-2" />
            <p className="text-sm">Không có hình ảnh</p>
          </div>
        </div>
      )}

      <Box className="p-4 space-y-4">
        {/* Header Section */}
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              {ROOM_TYPE_LABELS[room.roomType] || room.roomType}
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
            className={`text-sm text-gray-700 prose prose-sm max-w-none ${
              !isDescriptionExpanded ? "line-clamp-3" : ""
            }`}
          >
            {room.description ? parse(room.description) : room.name}
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
                  src={processImageUrl(room.owner.avatarUrl)}
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
                  onClick={() => navigate(`/rooms/${similarRoom.id}`)}
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
      </Box>

      {/* Fixed Bottom Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-40">
        <div className="flex gap-2">
          {/* AI Analysis Button */}
          <Button
            variant="secondary"
            className="flex-shrink-0"
            onClick={handleAIAnalysis}
            disabled={isAnalyzing}
          >
            <Icon icon="zi-star" size={18} className="mr-1" />
            Phân tích
          </Button>
          
          {/* Booking Request Button */}
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleBookingButtonClick}
            disabled={!canSendBookingRequest && currentUser !== undefined}
          >
            <Icon icon="zi-calendar" size={18} className="mr-2" />
            {!currentUser 
              ? "Đăng nhập để gửi yêu cầu thuê"
              : !isTenant
              ? "Chỉ người thuê mới có thể gửi yêu cầu"
              : hasExistingRequest
              ? "Đã gửi yêu cầu thuê"
              : "Gửi yêu cầu thuê"}
          </Button>
        </div>
      </div>

      {/* AI Analysis Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Icon icon="zi-star" size={20} className="text-blue-600" />
                <h3 className="text-lg font-bold">Phân tích phòng bằng AI</h3>
              </div>
              <button
                onClick={() => setShowAIModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Icon icon="zi-close" size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">AI đang phân tích phòng trọ...</p>
                  <p className="text-sm text-gray-500 mt-2">Vui lòng đợi trong giây lát</p>
                </div>
              ) : aiAnalysisResult ? (
                <div className="text-sm text-gray-800 leading-relaxed space-y-3">
                  {aiAnalysisResult.split('\n').map((line, index) => {
                    // Handle bold text **text**
                    const boldRegex = /\*\*(.+?)\*\*/g;
                    const processedLine = line.replace(boldRegex, '<strong>$1</strong>');
                    
                    if (line.trim() === '') {
                      return <div key={index} className="h-2"></div>;
                    } else if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <h4 key={index} className="font-bold text-base mt-4 mb-2 text-gray-900">
                          {line.replace(/\*\*/g, '')}
                        </h4>
                      );
                    } else if (line.startsWith('## ')) {
                      return (
                        <h3 key={index} className="font-bold text-lg mt-4 mb-2 text-gray-900">
                          {line.replace('## ', '')}
                        </h3>
                      );
                    } else if (line.startsWith('### ')) {
                      return (
                        <h4 key={index} className="font-semibold text-base mt-3 mb-1 text-gray-900">
                          {line.replace('### ', '')}
                        </h4>
                      );
                    } else if (line.startsWith('- ')) {
                      return (
                        <div key={index} className="flex gap-2 ml-2">
                          <span className="text-gray-500">•</span>
                          <span dangerouslySetInnerHTML={{ __html: processedLine.replace('- ', '') }} />
                        </div>
                      );
                    } else {
                      return (
                        <p key={index} dangerouslySetInnerHTML={{ __html: processedLine }} />
                      );
                    }
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Đang tải kết quả phân tích...
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowAIModal(false)}
              >
                Đóng
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  setShowAIModal(false);
                  navigate('/ai-assistant');
                }}
              >
                <Icon icon="zi-chat" size={18} className="mr-2" />
                Xem chi tiết
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Request Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-2xl w-full p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Gửi yêu cầu thuê phòng</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-1"
              >
                <Icon icon="zi-close" size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày dự định chuyển vào *
                </label>
                <input
                  type="date"
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lời nhắn cho chủ trọ (không bắt buộc)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Ví dụ: Tôi muốn thuê phòng dài hạn..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">
                  <Icon icon="zi-info-circle" size={16} className="inline mr-1" />
                  Chủ trọ sẽ xem xét yêu cầu của bạn và phản hồi sớm nhất.
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowBookingModal(false)}
                >
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleSendBookingRequest}
                  disabled={!moveInDate || createBookingRequest.isPending}
                >
                  {createBookingRequest.isPending ? "Đang gửi..." : "Gửi yêu cầu"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
};

export default RoomDetailPage;
