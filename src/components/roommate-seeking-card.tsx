import { RoommateCardProps } from "@/interfaces/basic";
import { Box, Icon, useNavigate } from "zmp-ui";

const RoommateCard: React.FC<RoommateCardProps> = ({
  id,
  title,
  budget,
  authorName,
  authorAvatar,
  authorGender,
  authorAge,
  preferredGender,
  location,
  moveInDate,
  duration,
  image,
  description,
  viewCount,
  contactCount,
  status,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/roommate/${id}`, { state: { fromTab: "seeking-roommates" } });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getGenderText = (gender: string) => {
    switch (gender) {
      case "male":
        return "Nam";
      case "female":
        return "Nữ";
      case "mixed":
        return "Nam/Nữ";
      default:
        return "Không xác định";
    }
  };

  const getStatusBadge = (statusValue?: string) => {
    if (statusValue === "closed") {
      return (
        <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
          Đã đóng
        </span>
      );
    }
    return null;
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <div className="trustay-card overflow-hidden" onClick={handleClick}>
      {/* Header - Compact version */}
      <div className="p-3 pb-0 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
          {authorAvatar ? (
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-full h-full object-cover"
            />
          ) : (
            <Icon
              icon="zi-user"
              size={18}
              className="text-gray-400"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-xs text-gray-900 truncate">{authorName || 'Người dùng'}</div>
        </div>
        {status === "closed" && (
          <span className="inline-block px-1.5 py-0.5 text-[10px] rounded-full bg-gray-100 text-gray-600 flex-shrink-0">
            Đóng
          </span>
        )}
      </div>
      {/* Content - Compact */}
      <Box>
        <div className="px-2">
          {/* Title - 2 lines with ellipsis */}
        <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-1 truncate leading-tight">
          {title}
        </h3>

        {/* Description preview - 1 line with ellipsis */}
        {description && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2 truncate">
            {stripHtml(description)}
          </p>
        )}

        {/* Budget - Prominent */}
        <div className="flex items-center gap-1 mb-2">
          <span className="text-trustay-green font-bold text-sm">
            {formatPrice(budget)} đ
          </span>
        </div>

        {/* Info grid - Compact */}
        <div className="space-y-1.5 text-xs">
          {/* Location - 1 line with ellipsis */}
          <div className="flex items-start gap-1">
            <Icon icon="zi-location" size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-600 line-clamp-1 leading-tight">{location}</span>
          </div>

          {/* Move in date - Compact */}
          <div className="flex items-start gap-1">
            <Icon icon="zi-calendar" size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-600 truncate">
              {formatDate(moveInDate)}
            </span>
          </div>
        </div>

        {/* Stats footer - More compact */}
        {(viewCount !== undefined || contactCount !== undefined) && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-500">
            {viewCount !== undefined && (
              <div className="flex items-center gap-0.5">
                <Icon icon="zi-clock-1" size={12} />
                <span>{viewCount}</span>
              </div>
            )}
            {contactCount !== undefined && (
              <div className="flex items-center gap-0.5">
                <Icon icon="zi-call" size={12} />
                <span>{contactCount}</span>
              </div>
            )}
          </div>
        )}
        </div>
        
      </Box>
    </div>
  );
};

export default RoommateCard;
