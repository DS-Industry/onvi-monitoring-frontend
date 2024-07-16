import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Root from "./Root";
import ErrorPage from "./pages/Error";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      { path: "", element: <Home /> },
      {
        path: "Администрирование",
        element: <About />,
      },
      { path: "Администрирование/sub1", element: <Home /> },
      { path: "Администрирование/sub2", element: <Services /> },
      { path: "Администрирование/sub3", element: <Contact /> },
      { path: "Администрирование/sub4", element: <Home /> },
      { path: "Администрирование/sub5", element: <Services /> },
      { path: "Станция", element: <Services /> },
      { path: "Hr", element: <Contact /> },
      { path: "Финансы", element: <Home /> },
      { path: "Анализ", element: <About /> },
      { path: "Лояльность", element: <Services /> },
      { path: "Оборудование", element: <Contact /> },
      { path: "Склад", element: <Contact /> },
    ],
  },
]);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
