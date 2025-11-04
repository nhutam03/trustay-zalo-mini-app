import BottomNav from "@/components/navigate-bottom";
import RoomCard from "@/components/room-card";
import RoomSeekingCard from "@/components/room-seeking-card";
import RoommateCard from "@/components/roommate-seeking-card";
import useSetHeader from "@/hooks/useSetHeader";
import { RoomCardProps, RoommateCardProps, RoomSeekingCardProps } from "@/interfaces/basic";
import { getFeaturedRoommatePosts, getFeaturedRoomSeekingPosts } from "@/services/listing";
import { getFeaturedRooms } from "@/services/room";
import { changeStatusBarColor } from "@/utils/basic";
import { roomsToRoomCards } from "@/utils/room";
import { roomSeekingPostsToCards } from "@/utils/room-seeking";
import { roommatePostsToCards } from "@/utils/roommate-seeking";
import { useEffect, useState } from "react";

import Box from "zmp-ui/box";
import Page from "zmp-ui/page";
import Tabs from "zmp-ui/tabs";

const ExplorePage: React.FC = () => {
  const setHeader = useSetHeader();
  const [activeTab, setActiveTab] = useState<"all-rooms" | "seeking-rooms" | "seeking-roommates">("all-rooms");
  
  // State for all rooms
  const [allRooms, setAllRooms] = useState<RoomCardProps[]>([]);
  const [loadingAllRooms, setLoadingAllRooms] = useState(true);
  
  // State for seeking rooms (people looking for rooms)
  const [seekingRooms, setSeekingRooms] = useState<RoomSeekingCardProps[]>([]);
  const [loadingSeekingRooms, setLoadingSeekingRooms] = useState(false);
  
  // State for roommate posts
  const [roommatePosts, setRoommatePosts] = useState<RoommateCardProps[]>([]);
  const [loadingRoommates, setLoadingRoommates] = useState(false);

  useEffect(() => {
    setHeader({
      title: "Khám phá",
      hasLeftIcon: false,
      type: "primary",
    });
    changeStatusBarColor("primary");

    // Load initial data for all rooms
    loadAllRooms();
  }, []);

  // Load all rooms (general listing)
  const loadAllRooms = async () => {
    try {
      setLoadingAllRooms(true);
      const rooms = await getFeaturedRooms(20);
      const roomCards = roomsToRoomCards(rooms);
      setAllRooms(roomCards);
    } catch (error) {
      console.error("Failed to load all rooms:", error);
    } finally {
      setLoadingAllRooms(false);
    }
  };

  // Load seeking rooms (people looking for rooms)
  const loadSeekingRooms = async () => {
    try {
      setLoadingSeekingRooms(true);
      const posts = await getFeaturedRoomSeekingPosts(20);
      const cards = roomSeekingPostsToCards(posts);
      setSeekingRooms(cards);
    } catch (error) {
      console.error("Failed to load room seeking posts:", error);
    } finally {
      setLoadingSeekingRooms(false);
    }
  };

  // Load roommate posts
  const loadRoommatePosts = async () => {
    try {
      setLoadingRoommates(true);
      const posts = await getFeaturedRoommatePosts(20);
      const cards = roommatePostsToCards(posts);
      setRoommatePosts(cards);
    } catch (error) {
      console.error("Failed to load roommate posts:", error);
    } finally {
      setLoadingRoommates(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as typeof activeTab);
    
    // Load data for the selected tab if not loaded yet
    if (tabId === "seeking-rooms" && seekingRooms.length === 0) {
      loadSeekingRooms();
    } else if (tabId === "seeking-roommates" && roommatePosts.length === 0) {
      loadRoommatePosts();
    }
  };

  return (
    <Page className="bg-gray-50 has-bottom-nav">
      {/* Tabs Header */}
      <Box className="bg-white sticky top-0 z-10 shadow-sm">
        <Tabs
          id="explore-tabs"
          activeKey={activeTab}
          onChange={handleTabChange}
        >
          <Tabs.Tab key="all-rooms" label="Phòng">
            {/* Content will be rendered below */}
          </Tabs.Tab>
          <Tabs.Tab key="seeking-rooms" label="Tìm phòng">
            {/* Content will be rendered below */}
          </Tabs.Tab>
          <Tabs.Tab key="seeking-roommates" label="Tìm bạn">
            {/* Content will be rendered below */}
          </Tabs.Tab>
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box className="p-4">
        {/* All Rooms Tab */}
        {activeTab === "all-rooms" && (
          <div>
            {loadingAllRooms ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Đang tải...</p>
              </div>
            ) : allRooms.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {allRooms.map((room) => (
                  <RoomCard key={room.id} {...room} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">Không có phòng nào</p>
              </div>
            )}
          </div>
        )}

        {/* Seeking Rooms Tab */}
        {activeTab === "seeking-rooms" && (
          <div>
            {loadingSeekingRooms ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Đang tải...</p>
              </div>
            ) : seekingRooms.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {seekingRooms.map((post) => (
                  <RoomSeekingCard key={post.id} {...post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">Không có bài đăng tìm phòng nào</p>
              </div>
            )}
          </div>
        )}

        {/* Seeking Roommates Tab */}
        {activeTab === "seeking-roommates" && (
          <div>
            {loadingRoommates ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Đang tải...</p>
              </div>
            ) : roommatePosts.length > 0 ? (
              <div className="grid grid-cols-2">
                {roommatePosts.map((post) => (
                  <RoommateCard key={post.id} {...post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">Không có bài đăng tìm bạn ở ghép nào</p>
              </div>
            )}
          </div>
        )}
      </Box>

      <BottomNav />
    </Page>
  );
};

export default ExplorePage;
