import { createBrowserRouter } from "react-router";
import { UserLayout } from "@/layouts/UserLayout";
import { Home } from "@/pages/user/Home";
import { Movies } from "@/pages/user/Movies";
import { MovieDetails } from "@/pages/user/MovieDetails";
import { Tickets } from "@/pages/user/Tickets";
import { AdminGuard } from "@/routes/AdminGuard";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Dashboard } from "@/pages/admin/Dashboard";
import { ShowDays } from "@/pages/admin/ShowDays";
import { AddMovies } from "@/pages/admin/AddMovies";
import { ListBooking } from "@/pages/admin/ListBooking";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: UserLayout,
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