import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Box, Select } from "zmp-ui";
import { useEditPageHeader } from "@/hooks/useEditPageHeader";
import { usePrivateUserProfile, useUpdateUserProfile } from "@/hooks/useUserService";
import { useSnackbar } from "zmp-ui";

const { Option } = Select;

const EditGenderPage: React.FC = () => {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const { data: user } = usePrivateUserProfile();
  const updateProfileMutation = useUpdateUserProfile();

  const [gender, setGender] = useState<"male" | "female" | "other">("other");
  const [originalGender, setOriginalGender] = useState<"male" | "female" | "other">("other");

  useEffect(() => {
    if (user) {
      setGender(user.gender || "other");
      setOriginalGender(user.gender || "other");
    }
  }, [user]);

  const hasChanges = gender !== originalGender;

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync({ gender });

      openSnackbar({
        text: "Cập nhật giới tính thành công!",
        type: "success",
        duration: 3000,
      });

      navigate(-1);
    } catch (error) {
      openSnackbar({
        text: error instanceof Error ? error.message : "Không thể cập nhật giới tính",
        type: "error",
        duration: 4000,
      });
    }
  };

  useEditPageHeader({
    title: "Sửa Giới tính",
    hasChanges,
    isSaving: updateProfileMutation.isPending,
    onSave: handleSave,
  });

  return (
    <Page className="bg-gray-50">
      <Box className="bg-white p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Giới tính
          </label>
          <Select
            value={gender}
            onChange={(value) => setGender(value as "male" | "female" | "other")}
          >
            <Option value="male" title="Nam" />
            <Option value="female" title="Nữ" />
            <Option value="other" title="Khác" />
          </Select>
        </div>
      </Box>
    </Page>
  );
};

export default EditGenderPage;
