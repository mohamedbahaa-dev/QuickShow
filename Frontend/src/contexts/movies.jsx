import { createContext, useState } from "react";

export const shows = createContext();

export function ShowsProvider({ children }) {

    const [movies, setMovies] = useState([]);

    return (
        <shows.Provider value={{ movies, setMovies }}>
            {children}
        </shows.Provider>
    );
}