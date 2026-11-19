import { Outlet } from "react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
export function UserLayout(){
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