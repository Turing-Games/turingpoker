import React, { useEffect, useState } from "react";

export default function Collapse({ collapsed, children }: {
    children: React.ReactNode;
    collapsed: boolean;
}) {
    return (
        <div className="transition duration-200 ease-out relative z-[2] h-full" style={{
            maxWidth: collapsed ? "0" : "100%",
            zIndex: 100
        }}>
            <div className="overflow-hidden h-full">
                {children}
            </div>
        </div>
    );
}

export function CollapseToggle({ collapsed, setCollapsed, content, style }: {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    content: string;
    style: React.CSSProperties;
}) {
    return (
        <button style={style} className="absolute z-[10]" onClick={() => setCollapsed(!collapsed)}>
            {content}
        </button>
    );
}
