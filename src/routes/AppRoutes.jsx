import { createBrowserRouter } from "react-router";
import axios from "axios";
import { Layout } from "@/components/Layout";
import { Home } from "@/components/Home";
import { Movies } from "@/components/Movies";
import { MovieDetails } from "@/components/MovieDetails";
import { Tickets } from "@/components/Tickets";
const apiKey = "c0b7f3fa09aca04843f214ed43eb8e45";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "home", Component: Home },
      {
        path: "movies",
        Component: Movies,
        loader: async ({ request }) => {
          const url = new URL(request.url);
          const search = url.searchParams.get("search");

          const apiUrl = search
            ? `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(search)}`
            : `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`;

          const response = await axios.get(apiUrl);
          return response.data.results;
        },
      },
      {
        path: "movies/:id",
        Component: MovieDetails,
        loader: async ({ params }) => {
          const { data } = await axios.get(
            `https://api.themoviedb.org/3/movie/${params.id}?api_key=${apiKey}&append_to_response=credits,videos`
          );
          return data;
        },
      },
      {
        path:"movies/:id/:info",
        Component:Tickets
      }
    ],
  },
]);