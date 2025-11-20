import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Box, DatePicker } from "zmp-ui";
import { useEditPageHeader } from "@/hooks/useEditPageHeader";
import { usePrivateUserProfile, useUpdateUserProfile } from "@/hooks/useUserService";
import { useSnackbar } from "zmp-ui";

const EditDateOfBirthPage: React.FC = () => {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const { data: user } = usePrivateUserProfile();
  const updateProfileMutation = useUpdateUserProfile();

  const [dateOfBirth, setDateOfBirth] = useState("");
  const [originalDateOfBirth, setOriginalDateOfBirth] = useState("");

  useEffect(() => {
    if (user) {
      // Normalize date format to YYYY-MM-DD
      const normalizedDate = user.dateOfBirth
        ? user.dateOfBirth.split("T")[0]
        : "";
      setDateOfBirth(normalizedDate);
      setOriginalDateOfBirth(normalizedDate);
    }
  }, [user]);

  const hasChanges = dateOfBirth !== originalDateOfBirth;

  const handleSave = useCallback(async () => {
    if (!hasChanges) return;

    try {
      console.log("Saving dateOfBirth:", dateOfBirth);
      await updateProfileMutation.mutateAsync({ dateOfBirth });

      openSnackbar({
        text: "Cập nhật ngày sinh thành công!",
        type: "success",
        duration: 3000,
      });

      navigate(-1);
    } catch (error) {
      console.error("Error saving dateOfBirth:", error);
      openSnackbar({
        text: error instanceof Error ? error.message : "Không thể cập nhật ngày sinh",
        type: "error",
        duration: 4000,
      });
    }
  }, [dateOfBirth, hasChanges, updateProfileMutation, openSnackbar, navigate]);

  useEditPageHeader({
    title: "Sửa Ngày sinh",
    hasChanges,
    isSaving: updateProfileMutation.isPending,
    onSave: handleSave,
  });

  return (
    <Page className="bg-gray-50">
      <Box className="bg-white p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngày sinh
          </label>
          <DatePicker
            mask={true}
            maskClosable={true}
            dateFormat="dd/mm/yyyy"
            value={dateOfBirth ? new Date(dateOfBirth) : undefined}
            onChange={(date) =>
              setDateOfBirth(date ? date.toISOString().split("T")[0] : "")
            }
          />
        </div>
      </Box>
    </Page>
  );
};

export default EditDateOfBirthPage;
