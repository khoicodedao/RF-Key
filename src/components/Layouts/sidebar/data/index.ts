import { url } from "inspector";
import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Trang chủ",
        icon: Icons.HomeIcon,
        items: [],
        url: "/",
      },
      {
        title: "Đơn vị",
        url: "/units",
        icon: Icons.FourCircle,
        items: [],
      },
      {
        title: "Định danh",
        url: "/ident",
        icon: Icons.Alphabet,
        items: [],
      },
      {
        title: "Licenses",
        url: "/licenses",
        icon: Icons.Table,
        items: [],
      },
      {
        title: "Người dùng",
        url: "/users",
        icon: Icons.User,
        items: [],
      },

      // {
      //   title: "Forms",
      //   icon: Icons.Alphabet,
      //   items: [
      //     {
      //       title: "Form Elements",
      //       url: "/forms/form-elements",
      //     },
      //     {
      //       title: "Form Layout",
      //       url: "/forms/form-layout",
      //     },
      //   ],
      // },
      // {
      //   title: "Tables",
      //   url: "/tables",
      //   icon: Icons.Table,
      //   items: [
      //     {
      //       title: "Tables",
      //       url: "/tables",
      //     },
      //   ],
      // },
      // {
      //   title: "Pages",
      //   icon: Icons.Alphabet,
      //   items: [
      //     {
      //       title: "Settings",
      //       url: "/pages/settings",
      //     },
      //   ],
      // },
    ],
  },
];
