import React from "react";
import { Box } from "zmp-ui";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface BannerSliderProps {
  banners?: string[];
}

const BannerSlider: React.FC<BannerSliderProps> = ({ banners }) => {
  const defaultBanners = [
    "https://res.cloudinary.com/prod/image/upload/a_90/me/rotate-food-3.png",
    "https://res.cloudinary.com/prod/image/upload/a_90/me/rotate-food-1.png",
    "https://res.cloudinary.com/prod/image/upload/a_90/me/rotate-food-4.png",
  ];

  const displayBanners = banners || defaultBanners;

  return (
    <Box className="bg-white px-4 pt-4 pb-2">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          bulletActiveClass: "swiper-pagination-bullet-active-custom",
        }}
        loop={true}
        className="rounded-xl overflow-hidden"
        style={{
          paddingBottom: "24px",
        }}
      >
        {displayBanners.map((banner, index) => (
          <SwiperSlide key={index}>
            <img
              src={banner}
              alt={`Banner ${index + 1}`}
              className="w-full h-[140px] object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <style>
        {`
          .swiper-pagination-bullet {
            background: #cbd5e0;
            opacity: 1;
          }
          .swiper-pagination-bullet-active-custom {
            background: #0cb963;
            width: 20px;
            border-radius: 4px;
          }
        `}
      </style>
    </Box>
  );
};

export default BannerSlider;
