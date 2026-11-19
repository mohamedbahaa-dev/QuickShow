export function NaveBar(){
    const items=[
        {id:1,name:"dashboard",url:"/admin",icon:<LayoutDashboard size={15}/>},
        {id:2,name:"add shows",url:"/admin/addmovies",icon:<CirclePlus size={15} />},
        {id:4,name:"list booking",url:"/admin/listbooking",icon:<ListChecks size={15} />}
    ]
    const location=useLocation()
    console.log(location)
  return(
    <nav className="shadow-sm shadow-gray-600  w-[150px] min-h-screen max-sm:w-[50px]  ">
        <div className=" text-center  flex flex-col items-center">
            <img src="/profile.png" className="rounded-full w-[50px] mt-3 max-md:w-[30px] "/>
            <h3 className="text-white text-sm capitalize max-sm:text-[10px]  ">admin user</h3>
        </div>
        <ul className=" pr-3 pl-0  flex flex-col items-start">
            {items.map((item)=>(
                <li key={item.id}  className={` m-3  border-red-500/30 ${location.pathname==item.url?" text-[#922B3E] bg-[#1d0b10] border-solid border-r-2  border-red":"text-gray-500 "} w-full rounded-md p-2`}>
                    <Link to={item.url} className="flex items-center capitalize gap-1 font-bold text-xs hover:opacity-75 duration-300 transition:opacity">{item.icon}
                    <p className="max-sm:hidden">{item.name}</p></Link>
                </li>
            ))}
        </ul>
    </nav>
  )

}
import { Link,useLocation } from "react-router"
import { LayoutDashboard,CirclePlus, List ,ListChecks} from "lucide-react"