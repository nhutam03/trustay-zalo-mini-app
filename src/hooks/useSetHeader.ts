import { useSetRecoilState } from "recoil";
import { HeaderType } from "@/interfaces/basic";
import appConfig from "../../app-config.json";
import { headerState } from "@/utils/state";
import { useCallback } from "react";

const useSetHeader = () => {
  const setHeader = useSetRecoilState(headerState);
  return useCallback(
    ({
      route = "",
      hasLeftIcon = true,
      rightIcon = null,
      title = appConfig.app.title,
      customTitle = null,
      type = "primary",
      customBackIcon,
    }: HeaderType) =>
      setHeader({
        route,
        hasLeftIcon,
        rightIcon,
        title,
        customTitle,
        type,
        customBackIcon,
      }),
    [setHeader]
  );
};

export default useSetHeader;
