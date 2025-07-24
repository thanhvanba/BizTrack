import React from "react";
import logo from "../../public/logo-biztrack.svg";

export default function LoadingLogo({ size = 48 }) {
    return (

        <div className="absolute inset-0 flex items-center justify-center min-h-[180px] bg-white bg-opacity-60 z-10">
            <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                {/* Logo ở giữa */}
                <img
                    src={logo}
                    alt="Loading..."
                    style={{
                        width: size * 0.5,
                        height: size * 0.5,
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 2,
                    }}
                />
                {/* Vòng tròn loading */}
                <svg
                    className="animate-spin absolute z-[1]"
                    style={{ width: size, height: size }}
                    viewBox="0 0 50 50"
                >
                    <circle
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="5"
                        strokeDasharray="90"
                        strokeDashoffset="30"
                        strokeLinecap="round"
                        opacity="0.7"
                    />
                </svg>
            </div>
        </div>
    );
} 