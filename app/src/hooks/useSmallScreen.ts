import { useEffect, useState } from "react";

export default function useSmallScreen(width: number = 1200, height: number = 1e9) {
    const query = `(max-width: ${width}px) and (max-height: ${height}px)`;
    const [isSmallScreen, setIsSmallScreen] = useState(window.matchMedia(query).matches);
    useEffect(() => {
        const matchQuery = window.matchMedia(query);
        const handleResize = () => {
            setIsSmallScreen(matchQuery.matches);
        };
        handleResize();
        matchQuery.addEventListener("change", handleResize);
        return () => matchQuery.addEventListener("change", handleResize);
    }, [setIsSmallScreen]);

    return isSmallScreen;
}
