import React, { useEffect } from "react";
import { Page, Box } from "zmp-ui";
import BottomNav from "../components/navigate-bottom";
import useSetHeader from "@/hooks/useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";

const PostRoomPage: React.FC = () => {
  const setHeader = useSetHeader();

  useEffect(() => {
    setHeader({
      title: "Đăng tin",
      hasLeftIcon: false,
      type: "primary",
    });
    changeStatusBarColor("primary");
  }, []);

  return (
    <Page className="bg-gray-50 has-bottom-nav">
      <Box className="p-4">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Đăng tin cho thuê
          </h2>
          <p className="text-gray-600">
            Tính năng đăng tin đang được phát triển...
          </p>
        </div>
      </Box>
      <BottomNav />
    </Page>
  );
};

export default PostRoomPage;
