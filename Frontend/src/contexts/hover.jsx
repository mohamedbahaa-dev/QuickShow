import { createContext,useState } from "react";
export const hover=  createContext()
export function HoverProvider({ children }) {
const [hoveredCard, setHoveredCard] = useState(null);

    return (
        <hover.Provider value={{ hoveredCard, setHoveredCard }}>
            {children}
        </hover.Provider>
    );
}
