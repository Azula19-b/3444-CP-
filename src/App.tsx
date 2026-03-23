import Login from "./app/pages/login";
import Signup from "./app/pages/signup";
import HomePage from "./pages/HomePage";

import Survey1 from "./pages/survey/Survey1";
import Survey2 from "./pages/survey/Survey2";
import Survey3 from "./pages/survey/Survey3";
import Survey4 from "./pages/survey/Survey4";
import Survey5 from "./pages/survey/Survey5";

import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/survey1" element={<Survey1 />} />
        <Route path="/survey2" element={<Survey2 />} />
        <Route path="/survey3" element={<Survey3 />} />
        <Route path="/survey4" element={<Survey4 />} />
        <Route path="/survey5" element={<Survey5 />} />

        <Route path="/home" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}
