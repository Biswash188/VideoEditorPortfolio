import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root.js";
import { Home } from "./components/Home.js";
import { Portfolio } from "./components/Portfolio.js";
import { About } from "./components/About.js";
import { Contact } from "./components/Contact.js";
import { NotFound } from "./components/NotFound.js";
import { AdminLogin } from "./components/AdminLogin.js";
import { AdminDashboard } from "./components/AdminDashboard.js";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "portfolio", Component: Portfolio },
      { path: "about", Component: About },
      { path: "contact", Component: Contact },
      { path: "*", Component: NotFound },
    ],
  },
  { path: "/admin/login", Component: AdminLogin },
  { path: "/admin", Component: AdminDashboard },
]);
