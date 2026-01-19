// src/routes/MainRouter.js
import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import LoginPage from "../components/login";
import RegisterPage from "../components/register";
import { privateRoutes, homeRoute, privatePwaRoutes } from "./routeConfig";
import PrivateRoute from "./PrivateRoute";
import LandingPage from "../pages/landing-page";
import { useResponsive } from "../hooks/useResponsive";
import PwaLayout from "../layout/PwaLayout";

// const MainRouter = () => (
//   <Router>
//     <Routes>
//       <Route path="/landing" element={<LandingPage />} />
//       <Route path="/login" element={<LoginPage />} />
//       <Route path="/register" element={<RegisterPage />} />
//       <Route path="/" element={homeRoute.element} />
//       {/* Bọc MainLayout và các privateRoutes bằng PrivateRoute */}
//       <Route element={<PrivateRoute />}>
//         <Route path="/" element={<MainLayout />}>
//           {privateRoutes.map(({ path, element }, index) => (
//             <Route key={index} path={path} element={element} />
//           ))}
//         </Route>
//       </Route>
//     </Routes>
//   </Router>
// );

export default function MainRouter() {
  const { isPwa } = useResponsive();

  return (
    <Router>
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={homeRoute.element} />

        {isPwa && (
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<PwaLayout />}>
              {privatePwaRoutes.map(({ path, element }, index) => (
                <Route key={index} path={path} element={element} />
              ))}
            </Route>
          </Route>
        )}

        {/* Web routes (giữ nguyên cấu trúc cũ) */}
        {!isPwa && (
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<MainLayout />}>
              {privateRoutes.map(({ path, element }, index) => (
                <Route key={index} path={path} element={element} />
              ))}
            </Route>
          </Route>
        )}
      </Routes>
    </Router>
  );
}
