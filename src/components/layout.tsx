import { getSystemInfo } from "zmp-sdk";
import {
  AnimationRoutes,
  App,
  Route,
  Spinner,
  ZMPRouter,
} from "zmp-ui";
import SnackbarProvider from "zmp-ui/snackbar-provider";
import { AppProps } from "zmp-ui/app";

import HomePage from "@/pages/index";
import ExplorePage from "@/pages/explore-page";
import MessagesPage from "@/pages/message-page";
import PostRoomPage from "@/pages/post-page";
import ProfilePage from "@/pages/profile-page";
import Header from "./header";
import { RecoilRoot } from "recoil";
import React, { Suspense } from "react";
import { ConfigProvider, getConfig } from "./providers/config-provider";
import { hexToRgb } from "@/utils/basic";

const Layout = () => {
  return (
    <RecoilRoot>
      <ConfigProvider
        cssVariables={{
          "--zmp-primary-color": getConfig((c) => c.template.primaryColor),
          "--zmp-primary-color-rgb": hexToRgb(
            getConfig((c) => c.template.primaryColor)
          ),
        }}
      >
        <App>
          <Suspense
              fallback={
                <div className=" w-screen h-screen flex justify-center items-center">
                  <Spinner />
                </div>
              }
            >
            {/* <SnackbarProvider> */}
              <ZMPRouter>
                {/* <Header /> */}
                <AnimationRoutes>
                  <Route path="/" element={<HomePage />}></Route>
                  <Route path="/explore" element={<ExplorePage />}></Route>
                  <Route path="/messages" element={<MessagesPage />}></Route>
                  <Route path="/post-room" element={<PostRoomPage />}></Route>
                  <Route path="/profile" element={<ProfilePage />}></Route>
                </AnimationRoutes>
              </ZMPRouter>
            {/* </SnackbarProvider> */}
          </Suspense>
        </App> 
      </ConfigProvider>
    </RecoilRoot>
  );
}
export default Layout;
