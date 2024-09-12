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
import SignUp from './pages/SignUp';
import Pos from "./pages/Pos.tsx";
import Device from "./pages/Device.tsx";
import Deposit from "./pages/monitoring/Deposit.tsx";
import DepositDevices from "./pages/monitoring/DepositDevices.tsx";
import DepositDevice from "./pages/monitoring/DepositDevice.tsx";
import Programs from "./pages/monitoring/Programs.tsx";
import ProgramDevices from "./pages/monitoring/ProgramDevices.tsx";
import ProgramDevice from "./pages/monitoring/ProgramDevice.tsx";


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
      { path: "administration/device", element: <Device />},
      { path: "administration/sub2", element: <Services /> },
      { path: "administration/sub3", element: <Contact /> },
      { path: "administration/sub4", element: <Home /> },
      { path: "administration/sub5", element: <Organization /> },
      { path: "station", element: <Contact /> },
      { path: "Hr", element: <Contact /> },
      { path: "finance", element: <Contact /> },
      { path: "monitoring", element: <About /> },
      { path: "monitoring/deposits", element: <Deposit /> },
      { path: "monitoring/deposits/pos", element: <DepositDevices /> },
      { path: "monitoring/deposits/pos/device", element: <DepositDevice /> },
      { path: "monitoring/programs", element: <Programs /> },
      { path: "monitoring/programs/pos", element: <ProgramDevices /> },
      { path: "monitoring/programs/pos/device", element: <ProgramDevice /> },
      { path: "Loyalty", element: <Contact /> },
      { path: "Equipment", element: <Contact /> },
      { path: "Store", element: <Contact /> },
      { path: "signup", element: <SignUp /> },
      { path: "login", element: <SignUp /> },

    ],
  },
]);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
