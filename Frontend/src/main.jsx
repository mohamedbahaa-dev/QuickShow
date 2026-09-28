import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import { router } from "./routes/AppRoutes";
import { ClerkProvider } from '@clerk/react'
import { ShowsProvider } from "./contexts/movies";
import { HoverProvider } from "./contexts/hover";
createRoot(document.getElementById("root")).render(
    <StrictMode>
        <ClerkProvider>
            <ShowsProvider>
               <HoverProvider>
                 <RouterProvider router={router} />
               </HoverProvider>
            </ShowsProvider>
        </ClerkProvider>
    </StrictMode>
);