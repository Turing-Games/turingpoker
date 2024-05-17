import React, { useEffect, useState } from "react";
import "@static/styles/collapse.css";

export default function Collapse({collapsed, children}: {
    children: React.ReactNode;
    collapsed: boolean;
}) {
    return (
        <div className="tg-collapse" style={{
            maxWidth: collapsed ? "0" : "100%",
        }}>
            <div className="tg-poker__collapse__content">
                {children}
            </div>
        </div>
    );
}

export function CollapseToggle({collapsed, setCollapsed, content, style}: {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    content: string;
    style: React.CSSProperties;
}) {
    return (
        <button style={style} className="tg-collapse__toggle" onClick={() => setCollapsed(!collapsed)}>
            {content}
        </button>
    );
}