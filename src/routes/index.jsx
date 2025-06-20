// src/routes/MainRouter.js
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import LoginPage from '../components/login';
import RegisterPage from '../components/register';
import { privateRoutes } from './routeConfig';

const MainRouter = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<MainLayout />}>
        {privateRoutes.map(({ path, element }, index) => (
          <Route key={index} path={path} element={element} />
        ))}
      </Route>
    </Routes>
  </Router>
);

export default MainRouter;
