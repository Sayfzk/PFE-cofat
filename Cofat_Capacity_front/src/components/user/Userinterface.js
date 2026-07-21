import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from './pages/Sidebar';  // Bonne casse
import Footer from "./pages/Footer";


export default function Userinterface(){
    return(
        <div>
            <Sidebar/>
            
            <Outlet/>
            <Footer/>

        
        </div>
    )
}