import React from "react";
import "./App.css"
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Root from "./Root";
import ErrorPage from "./pages/Error";
import SignUp from './pages/SignUp';
import LogIn from './pages/LogIn'

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
      { path: "Администрирование/sub1", element: <Home /> },
      { path: "Администрирование/sub2", element: <Services /> },
      { path: "Администрирование/sub3", element: <Contact /> },
      { path: "Администрирование/sub4", element: <Home /> },
      { path: "Администрирование/sub5", element: <Services /> },
      { path: "station", element: <Services /> },
      { path: "Hr", element: <Contact /> },
      { path: "finance", element: <Home /> },
      { path: "analysis", element: <About /> },
      { path: "Loyalty", element: <Services /> },
      { path: "Equipment", element: <Contact /> },
      { path: "Store", element: <Contact /> },
      { path: "signup", element: <SignUp /> },
      { path: "login", element: <LogIn /> },

    ],
  },
]);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
