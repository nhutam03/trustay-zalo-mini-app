import { createElement, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useSetHeader from "./useSetHeader";
import { changeStatusBarColor } from "@/utils/basic";

interface UseEditPageHeaderProps {
  title: string;
  hasChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
}

export const useEditPageHeader = ({
  title,
  hasChanges,
  isSaving,
  onSave,
}: UseEditPageHeaderProps) => {
  const setHeader = useSetHeader();
  const navigate = useNavigate();

  useEffect(() => {
    setHeader({
      title,
      hasLeftIcon: true,
      type: "primary",
      customBackIcon: () => navigate(-1),
      rightIcon: createElement(
        "button",
        {
          onClick: onSave,
          disabled: !hasChanges || isSaving,
          className: `${
            hasChanges && !isSaving
              ? "text-white"
              : "text-white opacity-30"
          } font-medium`,
        },
        isSaving ? "Đang lưu..." : "Lưu"
      ),
    });
    changeStatusBarColor("primary");
  }, [hasChanges, isSaving, title, onSave]);
};
