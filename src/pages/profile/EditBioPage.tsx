import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Box, Input } from "zmp-ui";
import { useEditPageHeader } from "@/hooks/useEditPageHeader";
import { usePrivateUserProfile, useUpdateUserProfile } from "@/hooks/useUserService";
import { useSnackbar } from "zmp-ui";

const EditBioPage: React.FC = () => {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const { data: user } = usePrivateUserProfile();
  const updateProfileMutation = useUpdateUserProfile();

  const [bio, setBio] = useState("");
  const [originalBio, setOriginalBio] = useState("");

  useEffect(() => {
    if (user) {
      setBio(user.bio || "");
      setOriginalBio(user.bio || "");
    }
  }, [user]);

  const hasChanges = bio !== originalBio;

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync({ bio });

      openSnackbar({
        text: "Cập nhật bio thành công!",
        type: "success",
        duration: 3000,
      });

      navigate(-1);
    } catch (error) {
      openSnackbar({
        text: error instanceof Error ? error.message : "Không thể cập nhật bio",
        type: "error",
        duration: 4000,
      });
    }
  };

  useEditPageHeader({
    title: "Sửa Bio",
    hasChanges,
    isSaving: updateProfileMutation.isPending,
    onSave: handleSave,
  });

  return (
    <Page className="bg-gray-50">
      <Box className="bg-white p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <Input.TextArea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Viết vài dòng về bản thân..."
            maxLength={500}
            showCount
            rows={6}
          />
        </div>
      </Box>
    </Page>
  );
};

export default EditBioPage;
