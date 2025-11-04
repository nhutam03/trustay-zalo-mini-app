import React, { useEffect } from "react";
import { Page, Box } from "zmp-ui";
import BottomNav from "../components/navigate-bottom";
import useSetHeader from "@/hooks/useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";

const MessagesPage: React.FC = () => {
  const setHeader = useSetHeader();

  useEffect(() => {
    setHeader({
      title: "Tin nhắn",
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
            Tin nhắn
          </h2>
          <p className="text-gray-600">
            Tính năng chat đang được phát triển...
          </p>
        </div>
      </Box>
      <BottomNav />
    </Page>
  );
};

export default MessagesPage;
