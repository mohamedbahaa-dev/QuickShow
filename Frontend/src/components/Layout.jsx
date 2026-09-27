import { Outlet } from "react-router";
import { Home } from "./Home";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Toaster } from "react-hot-toast";
export function Layout(){
    return(
        <div>
            <Toaster
  toastOptions={{
    style: {
      fontSize: "12px",
      padding: "10px",
      minWidth: "auto",
    },
    duration:1000,
  }}
/>
        <Header/>
        <Outlet/>
        <Footer/>
        </div>
     

        
    )
}