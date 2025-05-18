import React from 'react';
import { Route, Routes } from "react-router-dom";
import SignIn from './Pages/SignIn';
import MainPage from './Pages/MainPage';

const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<SignIn />} />
        <Route path="/matbook" element={<MainPage />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
