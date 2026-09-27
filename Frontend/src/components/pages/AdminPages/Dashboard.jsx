export function Dashboard(){
    const cards=[
        {id:1,name:"total bookings" ,value:0,icon:<ChartNoAxesCombined color="white" />},
        {id:2,name:"total revenue" ,value:0,icon:<DollarSign color="white" />},
        {id:3,name:"active shows" ,value:0,icon:<Play color="white" />},
        {id:4,name:"total users" ,value:0,icon:<Users color="white" />},
        
    ]
    return(
        <div className="w-full">
            <h2 className="text-white capitalize font-bold m-4 text-lg">admin <span className="text-[#922B3E] underline">dashboard</span></h2>
            <div className="flex justify-between flex-wrap gap-2 w-full max-xs:flex-col max-md:items-center">
                 {
            cards.map((card)=>(
                <div className=" border border-red-500/30 bg-[#1d0b10] p-4 w-[calc(50%-4px)] flex  justify-between items-center max-sm:w-full  ">
                    <div className="text-white text-md ">
                        <p>{card.name}</p>
                        <p className="font-bold">{card.value}</p>
                        </div>
                        {card.icon}


                    </div>
            ))
           }
            </div>
          
        </div>
        
    )
    
}
import { DollarSign,Play,Users,ChartNoAxesCombined } from "lucide-react"