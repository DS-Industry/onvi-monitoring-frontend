import React from "react";
import "./App.css"
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Organization from "./pages/Organization";
import Contact from "./pages/Contact";
import Root from "./Root";
import ErrorPage from "./pages/Error";
import Pos from "./pages/Pos.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      { path: "", element: <Home /> },
      {
        path: "administration",
        element: <About />,
      },
      { path: "administration/sub1", element: <Pos /> },
      { path: "administration/sub2", element: <Services /> },
      { path: "administration/sub3", element: <Contact /> },
      { path: "administration/sub4", element: <Home /> },
      { path: "administration/sub5", element: <Organization /> },
      { path: "station", element: <Services /> },
      { path: "Hr", element: <Contact /> },
      { path: "finance", element: <Home /> },
      { path: "analysis", element: <About /> },
      { path: "Loyalty", element: <Services /> },
      { path: "Equipment", element: <Contact /> },
      { path: "Store", element: <Contact /> },
    ],
  },
]);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
