import React from "react";
import {mount, redirect, route} from "navi";
import Home from "./pages/Home";
import SimpleStorage from "./pages/SimpleStorage";
import Lottery from "./pages/Lottery";

export default mount({

    '/': route({
        title: "Home",
        view: <Home/>,
    }),

    '/simple' : route({
        title: "SimpleStorage",
        view: <SimpleStorage />
    }),
    
    '/lottery' : route({
        title: "Lottery",
        view: <Lottery/>
    }),

});
