export function Shows({title}){
    let [shows,setShows]=useState([])
    const [hoveredCard, setHoveredCard] = useState(null);
    console.log(shows)
    const apiKey="c0b7f3fa09aca04843f214ed43eb8e45"
    useEffect(()=>{
        axios.get(
             `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`

        ).then((response)=>{
           setShows(response.data.results.slice(0,3))
        })
    },[])
 

    return(
        <>
        <div className="overflow-hidden p-2">
            <h1 className="text-white text-sm mb-3">{title?title:"your shows"}</h1>
            <div className="grid  grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-3 justify-items-start">
                {shows.map((item)=>{
                    return(
                        <CardImage logo={item?.poster_path} title={item?.original_title} 
                        description={item?.overview} rating={item?.vote_average.toFixed(2)} id={item?.id}  hoveredCard={hoveredCard} setHoveredCard={setHoveredCard}/>
                    )
                })}
            </div>
            <div className="flex justify-center p-4 w-full">
                 <Link to={"/movies"} className="bg-[oklch(63.7%_0.237_25.331)]   rounded-xl px-5 py-1 mr-4 text-[11px] text-white cursor-pointer hover:opacity-75 transition-opacity duration-300 capitalize font-semibold"
          > show more</Link>
            </div>
         
        </div>
        </>
    )
}
import axios from "axios"
import { useEffect } from "react"
import { useState } from "react"
import { CardImage } from "./CardImage"
import { Link } from "react-router"