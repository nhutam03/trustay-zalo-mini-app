import { RoomSeekingCardProps } from "@/interfaces/basic";
import { Box, Icon, useNavigate } from "zmp-ui";

const RoomSeekingCard: React.FC<RoomSeekingCardProps> = ({
  id,
  title,
  budget,
  authorName,
  authorAvatar,
  location,
  moveInDate,
  occupancy,
  preferredRoomType,
  viewCount,
  contactCount,
  amenities,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Save current scroll position before navigating
    sessionStorage.setItem('explore-return-scroll', window.scrollY.toString());
    navigate(`/room-seeking/${id}`, { state: { from: '/explore' } });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getRoomTypeText = (type?: string) => {
    if (!type) return "";
    switch (type) {
      case "boarding_house":
        return "Phòng trọ";
      case "apartment":
        return "Chung cư";
      case "house":
        return "Nhà nguyên căn";
      case "studio":
        return "Studio";
      default:
        return type;
    }
  };

  return (
    <div className="trustay-card overflow-hidden" onClick={handleClick}>
      {/* Header with avatar */}
      <div className="p-3 pb-0 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
          {authorAvatar ? (
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-full h-full object-cover"
            />
          ) : (
            <Icon
              icon="zi-user"
              size={24}
              className="text-gray-400"
            />
          )}
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm text-gray-900">{authorName}</div>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            {viewCount !== undefined && (
              <span className="flex items-center gap-1">
                👁️ {viewCount}
              </span>
            )}
            {contactCount !== undefined && (
              <span className="flex items-center gap-1">
                <Icon icon="zi-chat" size={12} />
                {contactCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <Box className="p-3">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Budget */}
        <div className="flex items-center gap-1 mb-2">
          <Icon icon="zi-poll" size={16} className="text-trustay-green" />
          <span className="text-trustay-green font-bold text-base">
            {formatPrice(budget)} đ/tháng
          </span>
        </div>

        {/* Info grid */}
        <div className="space-y-1.5 text-sm">
          {/* Location */}
          <div className="flex items-start gap-1.5">
            <Icon icon="zi-location" size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-600 line-clamp-1">{location}</span>
          </div>

          {/* Move in date & occupancy */}
          {moveInDate && (
            <div className="flex items-start gap-1.5">
              <Icon icon="zi-calendar" size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600">
                Dọn vào: {formatDate(moveInDate)}
                {occupancy && ` • ${occupancy} người`}
              </span>
            </div>
          )}

          {/* Preferred room type */}
          {preferredRoomType && (
            <div className="flex items-start gap-1.5">
              <Icon icon="zi-home" size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600">
                Loại phòng: {getRoomTypeText(preferredRoomType)}
              </span>
            </div>
          )}

          {/* Amenities */}
          {amenities && amenities.length > 0 && (
            <div className="flex items-start gap-1.5">
              <Icon icon="zi-star" size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600 line-clamp-1">
                {amenities.slice(0, 3).join(', ')}
                {amenities.length > 3 && '...'}
              </span>
            </div>
          )}
        </div>
      </Box>
    </div>
  );
};

export default RoomSeekingCard;

