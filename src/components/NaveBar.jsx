export function NaveBar(){
    const items=[
        {id:1,name:"dashboard",url:"/admin",icon:<LayoutDashboard size={15} color="gray"/>},
        {id:2,name:"add shows",url:"/admin/addshows",icon:<CirclePlus size={15} />},
        {id:3,name:"list shows",url:"/admin/listshows",icon:<List size={15} />},
        {id:4,name:"list booking",url:"/admin/listbooking",icon:<ListChecks size={15} />}
    ]
    const [clicked,setClick]=useState(1)
  return(
    <nav className="shadow-lg shadow-blue-600/50 w-[150px] min-h-screen">
        <div className="m-auto text-center">
            <img src="/public/profile.png" className="rounded-full w-[50px] m-auto"/>
            <h3 className="text-white text-sm capitalize">admin user</h3>
        </div>
        <ul className="m-auto p-2">
            {items.map((item)=>(
                <li key={item.id} onClick={()=>setClick(item.id)} className={`text-gray-500   flex justify-center m-3  border-red-500/30 ${clicked==item.id?"bg-[#1d0b10] border-solid border-r-2  border-red":""}  w-full rounded-md  p-1`}>
                    <Link to={item.url} className="flex items-center capitalize gap-1 font-bold text-xs hover:opacity-75 duration-300 transition:opacity">{item.icon}{item.name}</Link>
                </li>
            ))}
        </ul>
    </nav>
  )

}
import { Link } from "react-router"
import { LayoutDashboard,CirclePlus, List ,ListChecks} from "lucide-react"
import { useState } from "react"
