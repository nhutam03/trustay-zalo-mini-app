import { atom, selector } from "recoil";
import { HeaderType } from "@/interfaces/basic";


export const headerState = atom<HeaderType>({
  key: "header",
  default: {},
});
