import appConfig from "../../app-config.json";

export const statusBarColor = {
  primary: appConfig.template.primaryColor || appConfig.app.statusBarColor,
  secondary: "#FFFFFF",
};

export const textStatusBarColor = {
  primary: appConfig.app.textColor,
  secondary: "black",
};