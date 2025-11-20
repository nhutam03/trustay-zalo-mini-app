import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Box, Input } from "zmp-ui";
import { useEditPageHeader } from "@/hooks/useEditPageHeader";
import { usePrivateUserProfile, useUpdateUserProfile } from "@/hooks/useUserService";
import { useSnackbar } from "zmp-ui";

const EditBankInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const { data: user } = usePrivateUserProfile();
  const updateProfileMutation = useUpdateUserProfile();

  const [formData, setFormData] = useState({
    idCardNumber: "",
    bankAccount: "",
    bankName: "",
  });

  const [originalData, setOriginalData] = useState({
    idCardNumber: "",
    bankAccount: "",
    bankName: "",
  });

  useEffect(() => {
    if (user) {
      const data = {
        idCardNumber: user.idCardNumber || "",
        bankAccount: user.bankAccount || "",
        bankName: user.bankName || "",
      };
      setFormData(data);
      setOriginalData(data);
    }
  }, [user]);

  const hasChanges =
    formData.idCardNumber !== originalData.idCardNumber ||
    formData.bankAccount !== originalData.bankAccount ||
    formData.bankName !== originalData.bankName;

  const handleSave = async () => {
    try {
      const changedFields: Record<string, any> = {};

      if (formData.idCardNumber !== originalData.idCardNumber) {
        changedFields.idCardNumber = formData.idCardNumber;
      }
      if (formData.bankAccount !== originalData.bankAccount) {
        changedFields.bankAccount = formData.bankAccount;
      }
      if (formData.bankName !== originalData.bankName) {
        changedFields.bankName = formData.bankName;
      }

      await updateProfileMutation.mutateAsync(changedFields);

      openSnackbar({
        text: "Cập nhật thông tin ngân hàng thành công!",
        type: "success",
        duration: 3000,
      });

      navigate(-1);
    } catch (error) {
      openSnackbar({
        text: error instanceof Error ? error.message : "Không thể cập nhật thông tin",
        type: "error",
        duration: 4000,
      });
    }
  };

  useEditPageHeader({
    title: "Thông tin cá nhân",
    hasChanges,
    isSaving: updateProfileMutation.isPending,
    onSave: handleSave,
  });

  return (
    <Page className="bg-gray-50">
      <Box className="bg-white p-4 mb-2">
        <h3 className="font-bold text-base mb-4 text-gray-900">Thông tin cá nhân</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số CMND/CCCD
          </label>
          <Input
            type="text"
            value={formData.idCardNumber}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, idCardNumber: e.target.value }))
            }
            placeholder="Nhập số CMND/CCCD"
            maxLength={12}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số tài khoản ngân hàng
          </label>
          <Input
            type="text"
            value={formData.bankAccount}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, bankAccount: e.target.value }))
            }
            placeholder="Nhập số tài khoản"
            maxLength={20}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên ngân hàng
          </label>
          <Input
            type="text"
            value={formData.bankName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, bankName: e.target.value }))
            }
            placeholder="VD: Vietcombank, Techcombank..."
            maxLength={50}
          />
        </div>
      </Box>
    </Page>
  );
};

export default EditBankInfoPage;
