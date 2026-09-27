export function AdminLayout(){
    return(
        <div className="bg-black min-h-screen ">
            <header><li>jfhfh</li></header>
    {/*header*/}
    <div className="flex gap-2">
    <NaveBar/>
    <Outlet/>
    </div>
   </div>
    )
    

}
import { Outlet } from "react-router";
import { NaveBar } from "@/components/NaveBar";