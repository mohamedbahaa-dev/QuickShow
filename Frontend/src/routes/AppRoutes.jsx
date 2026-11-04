import { createBrowserRouter } from "react-router";
import { Layout } from "@/components/Layout";
import { Home } from "@/components/Home";
import { Movies } from "@/components/Movies";
import { MovieDetails } from "@/components/MovieDetails";
import { Tickets } from "@/components/Tickets";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminLayout } from "@/components/pages/AdminPages/AdminLayout";
import { Dashboard } from "@/components/pages/AdminPages/Dashboard";
import { ShowDays } from "@/components/pages/AdminPages/ShowDays";
import { AddMovies } from "@/components/pages/AdminPages/AddMovies";
import { ListBooking } from "@/components/pages/AdminPages/ListBooking";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "home", Component: Home },
      { path: "movies", Component: Movies },
      { path: "movies/:id", Component: MovieDetails },
      { path: "movies/:id/:dateId", Component: Tickets },
    ],
  },
  {
    // الحارس: أي حد مش أدمن يتحوّل للرئيسية
    path: "/admin",
    Component: AdminGuard,
    children: [
      {
        Component: AdminLayout,
        children: [
          { index: true, Component: Dashboard },
          { path: "addmovies", Component: AddMovies },
          { path: "showdays/:id", Component: ShowDays },
          { path: "listbooking", Component: ListBooking },
        ],
      },
    ],
  },
]);