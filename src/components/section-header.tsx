import React from "react";
import { Box } from "zmp-ui";
import { SectionHeaderProps } from "@/interfaces/basic";


const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
}) => {
  return (
    <Box className="px-4 py-3 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm text-primary font-medium active:opacity-70"
        >
          {action.label}
        </button>
      )}
    </Box>
  );
};

export default SectionHeader;
