import React from 'react'
import Home from '../pages/home'
import LoginPage from '../components/login'
import RegisterPage from '../components/register'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const MainRouter = () => {
    return (
        <div>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Routes>
            </Router>
        </div>
    )
}

export default MainRouter
