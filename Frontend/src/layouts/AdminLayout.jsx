export function AdminLayout(){
    return(
        <div className="bg-black min-h-screen ">
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
    {/*header*/}
    <div className="flex gap-2">
    <NaveBar/>
    <Outlet/>
    </div>
   </div>
    )
    

}
import { Outlet } from "react-router";
import { NaveBar } from "@/components/admin/NaveBar";
import { Toaster } from "react-hot-toast";
