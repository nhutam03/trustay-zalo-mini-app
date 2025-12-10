import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Box, Icon, Tabs } from "zmp-ui";
import useSetHeader from "@/hooks/useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";
import { useMyRoomSeekingPosts } from "@/hooks/useRoomSeekingPostsService";
import { useMyRoommateSeekingPosts, useDeleteRoommateSeekingPost, useUpdateRoommateSeekingPostStatus } from "@/hooks/useRoommateSeekingPostsService";
import { useDeleteRoomSeekingPost, useUpdateRoomSeekingPostStatus } from "@/hooks/useRoomSeekingPostsService";
import { formatCurrency } from "@/utils/format";
import { toast } from "react-hot-toast";

const TenantPostsManagementPage: React.FC = () => {
  const setHeader = useSetHeader();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("room-seeking");

  // Fetch room seeking posts
  const { data: roomSeekingData, isLoading: isLoadingRoomSeeking, refetch: refetchRoomSeeking } = useMyRoomSeekingPosts();
  const deleteRoomSeekingMutation = useDeleteRoomSeekingPost();
  const updateRoomSeekingStatusMutation = useUpdateRoomSeekingPostStatus();

  // Fetch roommate seeking posts
  const { data: roommateSeekingData, isLoading: isLoadingRoommateSeeking, refetch: refetchRoommateSeeking } = useMyRoommateSeekingPosts();
  const deleteRoommateMutation = useDeleteRoommateSeekingPost();
  const updateRoommateStatusMutation = useUpdateRoommateSeekingPostStatus();

  useEffect(() => {
    setHeader({
      title: "Quản lý bài đăng",
      hasLeftIcon: true,
      type: "primary",
    });
    changeStatusBarColor("primary");
  }, []);

  const handleDeleteRoomSeeking = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài đăng này?")) {
      try {
        await deleteRoomSeekingMutation.mutateAsync(id);
        toast.success("Xóa bài đăng thành công");
        refetchRoomSeeking();
      } catch (error) {
        toast.error("Không thể xóa bài đăng");
      }
    }
  };

  const handleDeleteRoommate = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài đăng này?")) {
      try {
        await deleteRoommateMutation.mutateAsync(id);
        toast.success("Xóa bài đăng thành công");
        refetchRoommateSeeking();
      } catch (error) {
        toast.error("Không thể xóa bài đăng");
      }
    }
  };

  const handleUpdateRoomSeekingStatus = async (id: string, status: 'active' | 'paused' | 'closed' | 'expired') => {
    try {
      await updateRoomSeekingStatusMutation.mutateAsync({ id, status });
      toast.success("Cập nhật trạng thái thành công");
      refetchRoomSeeking();
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const handleUpdateRoommateStatus = async (id: string, status: 'active' | 'paused' | 'closed' | 'expired') => {
    try {
      await updateRoommateStatusMutation.mutateAsync({ id, status });
      toast.success("Cập nhật trạng thái thành công");
      refetchRoommateSeeking();
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Đang hoạt động", color: "bg-green-100 text-green-700" },
      paused: { label: "Đã tạm dừng", color: "bg-yellow-100 text-yellow-700" },
      closed: { label: "Đã đóng", color: "bg-gray-100 text-gray-700" },
      expired: { label: "Hết hạn", color: "bg-red-100 text-red-700" },
    };
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const renderRoomSeekingPosts = () => {
    if (isLoadingRoomSeeking) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    const posts = roomSeekingData?.data || [];

    if (posts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <Icon icon="zi-home" size={64} className="text-gray-300 mb-4" />
          <p className="text-gray-500 text-center mb-4">Bạn chưa có bài đăng tìm chỗ thuê nào</p>
          <button
            onClick={() => navigate("/tenant-post")}
            className="px-4 py-2 bg-primary text-white rounded-lg active:opacity-70"
          >
            Tạo bài đăng mới
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-3 p-4">
        {posts.map((post) => (
          <Box key={post.id} className="bg-white p-4 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 flex-1 mr-2">{post.title}</h3>
              {getStatusBadge(post.status)}
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.description}</p>
            
            <div className="space-y-1 mb-3">
              <div className="flex items-center text-sm text-gray-600">
                <Icon icon="zi-location" size={16} className="mr-1" />
                <span>{post.preferredWard?.name}, {post.preferredDistrict?.name}, {post.preferredProvince?.name}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Icon icon="zi-poll" size={16} className="mr-1" />
                <span>{formatCurrency(post.minBudget || 0)} - {formatCurrency(post.maxBudget || 0)}/tháng</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Icon icon="zi-user" size={16} className="mr-1" />
                <span>{post.occupancy} người</span>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => navigate(`/room-seeking/${post.id}`)}
                className="flex-1 py-2 text-sm text-primary border border-primary rounded active:opacity-70"
              >
                Xem
              </button>
              <button
                onClick={() => navigate(`/edit-room-seeking/${post.id}`)}
                className="flex-1 py-2 text-sm text-blue-600 border border-blue-600 rounded active:opacity-70"
              >
                Sửa
              </button>
              {post.status === 'active' ? (
                <button
                  onClick={() => handleUpdateRoomSeekingStatus(post.id, 'paused')}
                  className="flex-1 py-2 text-sm text-yellow-600 border border-yellow-600 rounded active:opacity-70"
                >
                  Tạm dừng
                </button>
              ) : post.status === 'paused' ? (
                <button
                  onClick={() => handleUpdateRoomSeekingStatus(post.id, 'active')}
                  className="flex-1 py-2 text-sm text-green-600 border border-green-600 rounded active:opacity-70"
                >
                  Kích hoạt
                </button>
              ) : null}
              <button
                onClick={() => handleDeleteRoomSeeking(post.id)}
                className="flex-1 py-2 text-sm text-red-600 border border-red-600 rounded active:opacity-70"
              >
                Xóa
              </button>
            </div>
          </Box>
        ))}
      </div>
    );
  };

  const renderRoommateSeekingPosts = () => {
    if (isLoadingRoommateSeeking) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    const posts = roommateSeekingData?.data || [];

    if (posts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <Icon icon="zi-user-circle" size={64} className="text-gray-300 mb-4" />
          <p className="text-gray-500 text-center mb-4">Bạn chưa có bài đăng tìm bạn cùng phòng nào</p>
          <button
            onClick={() => navigate("/tenant-post")}
            className="px-4 py-2 bg-primary text-white rounded-lg active:opacity-70"
          >
            Tạo bài đăng mới
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-3 p-4">
        {posts.map((post) => (
          <Box key={post.id} className="bg-white p-4 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 flex-1 mr-2">{post.title}</h3>
              {getStatusBadge(post.status)}
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.description}</p>
            
            <div className="space-y-1 mb-3">
              <div className="flex items-center text-sm text-gray-600">
                <Icon icon="zi-location" size={16} className="mr-1" />
                <span>{post.externalWard?.name}, {post.externalDistrict?.name}, {post.externalProvince?.name}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Icon icon="zi-poll" size={16} className="mr-1" />
                <span>{formatCurrency(post.monthlyRent || 0)}/tháng</span>
              </div>
              {post.maxOccupancy && (
                <div className="flex items-center text-sm text-gray-600">
                  <Icon icon="zi-user" size={16} className="mr-1" />
                  <span>Cần {post.maxOccupancy} người</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => navigate(`/roommate-seeking/${post.id}`)}
                className="flex-1 py-2 text-sm text-primary border border-primary rounded active:opacity-70"
              >
                Xem
              </button>
              <button
                onClick={() => navigate(`/edit-roommate-seeking/${post.id}`)}
                className="flex-1 py-2 text-sm text-blue-600 border border-blue-600 rounded active:opacity-70"
              >
                Sửa
              </button>
              {post.status === 'active' ? (
                <button
                  onClick={() => handleUpdateRoommateStatus(post.id, 'paused')}
                  className="flex-1 py-2 text-sm text-yellow-600 border border-yellow-600 rounded active:opacity-70"
                >
                  Tạm dừng
                </button>
              ) : post.status === 'paused' ? (
                <button
                  onClick={() => handleUpdateRoommateStatus(post.id, 'active')}
                  className="flex-1 py-2 text-sm text-green-600 border border-green-600 rounded active:opacity-70"
                >
                  Kích hoạt
                </button>
              ) : null}
              <button
                onClick={() => handleDeleteRoommate(post.id)}
                className="flex-1 py-2 text-sm text-red-600 border border-red-600 rounded active:opacity-70"
              >
                Xóa
              </button>
            </div>
          </Box>
        ))}
      </div>
    );
  };

  return (
    <Page className="bg-gray-50">
      <Tabs
        id="tenant-posts-tabs"
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as string)}
        className="sticky top-0 z-10 bg-white"
      >
        <Tabs.Tab key="room-seeking" label="Tìm chỗ thuê">
          {renderRoomSeekingPosts()}
        </Tabs.Tab>
        <Tabs.Tab key="roommate-seeking" label="Tìm bạn cùng phòng">
          {renderRoommateSeekingPosts()}
        </Tabs.Tab>
      </Tabs>
    </Page>
  );
};

export default TenantPostsManagementPage;
