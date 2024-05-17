import { useEffect, useState } from "react";

export default function useSmallScreen() {
    const [isSmallScreen, setIsSmallScreen] = useState(window.matchMedia("(max-width: 1200px)").matches);
    useEffect(() => {
        const matchQuery = window.matchMedia("(max-width: 1200px)");
        const handleResize = () => {
            setIsSmallScreen(matchQuery.matches);
        };
        handleResize();
        matchQuery.addEventListener("change", handleResize);
        return () => matchQuery.addEventListener("change", handleResize);
    }, [setIsSmallScreen]);

    return isSmallScreen;
}