import { createBrowserRouter } from "react-router";
import Login from "./pages/login";
import SignUp from "./pages/signup";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/signup",
    Component: SignUp,
  },
]);
