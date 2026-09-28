export function Dashboard(){
    const{movies,setMovies}=useContext(shows)
     
    const cards=[
        {id:1,name:"total bookings" ,value:0,icon:<ChartNoAxesCombined color="white" />},
        {id:2,name:"total revenue" ,value:0,icon:<DollarSign color="white" />},
        {id:3,name:"active shows" ,value:movies.length,icon:<Play color="white" />},
        {id:4,name:"total users" ,value:0,icon:<Users color="white" />},
        
    ]
    useEffect(()=>{
         async function getMovies() {
        const response = await axios.get("http://localhost:5000/api/movies");

        const data = response.data;

        setMovies(data);
    }

    getMovies();
    },[])
    
 
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
            <div className="mt-2">
                <h2 className="text-white capitalize">now shows</h2>
                {movies.length===0?(
                    <div className="flex  items-center flex-col">
                    <FaceSlightlyFrowning className="text-gray-400 w-[250px] h-[250px] max-sm:w-20 max-sm:h-20" />
                    <h2 className="text-gray-500 capitalize font-bold">nothing to show</h2>
                    </div>
                    
                ):
                (
              
                <div className="flex mt-3">
                              {movies?.map((movie)=>(
                                <CardImage key={movie.id} logo={movie.posterUrl} title={movie.title} description={movie.description} rating={movie.rating} id={movie.id} role={"admin"}/>
                              ))
                
                              }
                               
                              </div> 
             
                

                )}
            </div>

          
        </div>
        
    )
    
}
import { DollarSign,Play,Users,ChartNoAxesCombined ,FaceSlightlyFrowning} from "lucide-react"
import axios from "axios";
import { useEffect, useState } from "react";
import { shows } from "@/contexts/movies";
import { useContext } from "react";
import { CardImage } from "@/components/CardImage";