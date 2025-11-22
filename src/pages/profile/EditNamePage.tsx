import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Box, Input } from "zmp-ui";
import { useEditPageHeader } from "@/hooks/useEditPageHeader";
import { usePrivateUserProfile, useUpdateUserProfile } from "@/hooks/useUserService";
import { useSnackbar } from "zmp-ui";

const EditNamePage: React.FC = () => {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const { data: user, refetch } = usePrivateUserProfile();
  const updateProfileMutation = useUpdateUserProfile();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });

  const [originalData, setOriginalData] = useState({
    firstName: "",
    lastName: "",
  });

  useEffect(() => {
    refetch();
    if (user) {
      const data = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      };
      setFormData(data);
      setOriginalData(data);
    }
  }, [user]);

  // Check if data has changed
  const hasChanges =
    formData.firstName !== originalData.firstName ||
    formData.lastName !== originalData.lastName;

  const handleSave = async () => {
    try {
      const changedFields: Record<string, any> = {};

      if (formData.firstName !== originalData.firstName) {
        changedFields.firstName = formData.firstName;
      }
      if (formData.lastName !== originalData.lastName) {
        changedFields.lastName = formData.lastName;
      }

      await updateProfileMutation.mutateAsync(changedFields);

      openSnackbar({
        text: "Cập nhật tên thành công!",
        type: "success",
        duration: 3000,
      });

      navigate(-1);
    } catch (error) {
      openSnackbar({
        text: error instanceof Error ? error.message : "Không thể cập nhật tên",
        type: "error",
        duration: 4000,
      });
    }
  };

  useEditPageHeader({
    title: "Sửa Tên",
    hasChanges,
    isSaving: updateProfileMutation.isPending,
    onSave: handleSave,
  });

  return (
    <Page className="bg-gray-50">
      <Box className="bg-white p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Họ <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            placeholder="Nhập họ"
            maxLength={50}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            placeholder="Nhập tên"
            maxLength={50}
          />
        </div>
      </Box>
    </Page>
  );
};

export default EditNamePage;
