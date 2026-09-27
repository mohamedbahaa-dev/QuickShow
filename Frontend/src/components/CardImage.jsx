import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Star } from "lucide-react"
import { Link } from "react-router"

export function CardImage({ logo, title, description,rating ,id,hoveredCard,setHoveredCard}) {
  return (
    <Card  onMouseEnter={() => setHoveredCard(id)}
  onMouseLeave={() => setHoveredCard(null)}
  className={`
    relative w-[250px] m-auto max-w-sm
    bg-gray-800 rounded-2xl border-0 gap-2 py-0
    transition-all duration-300
    hover:-translate-y-2 hover:scale-105
    ${
      hoveredCard !== null && hoveredCard !== id
        ? "opacity-40"
        : "opacity-100"
    }
  `}>
   <div
  className="relative w-full h-[250px] rounded-t-2xl bg-cover bg-no-repeat"
  style={{
    backgroundImage: `url(https://image.tmdb.org/t/p/w500${logo})`,
  }}
>
  <Badge
    variant="secondary"
    className="absolute top-2 right-2 z-10 bg-white"
  >
    Featured
  </Badge>
</div>
      <CardHeader className="px-3 py-0 gap-0.5">
        <CardTitle className="text-white text-sm">{title}</CardTitle>
        <CardDescription className="text-gray-500 text-xs line-clamp-1">
          {description}
        </CardDescription>
      </CardHeader>

      <CardFooter className="bg-gray-800 px-3 pb-3 pt-1 flex justify-between">
        <Button className="w-fit cursor-pointer bg-[oklch(63.7%_0.237_25.331)] rounded-xl px-5 py-1.5 text-[11px] text-white hover:opacity-75 transition-opacity duration-300 capitalize font-semibold">
          <Link to={`/movies/${id}`}>buy tickets</Link>
        </Button>
        <div className="flex items-center gap-2">
           <span><Star className="text-red-500  fill-red-500 w-[20px]" /></span>
           <p className="text-gray-500 text-[10px]">{rating}</p>
          </div>
       
      </CardFooter>
    </Card>
  )
}