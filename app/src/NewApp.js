import React from 'react';
import { Link } from 'react-navi';
import BaseLayout from './layouts/BaseLayout';
import HeaderLayout from './layouts/HeaderLayout';
import MenuLayout from "./layouts/MenuLayout";
import Main from './Main';
import { DrizzleContext } from "@drizzle/react-plugin";
import { Drizzle, generateStore } from "@drizzle/store";
import options from "./drizzleOptions";
import EthAccount from "./pages/EthAccount";

import EventNotifier from "./pages/EventNotifier";

const store = {
    drizzleOptions: options,
    appMiddlewares: [EventNotifier]
}
//const drizzle = new Drizzle(options);
const drizzleStore = generateStore(store);
const drizzle = new Drizzle(options, drizzleStore);


const App = () => {

    return (
        <DrizzleContext.Provider drizzle={drizzle}>
            <BaseLayout>
                <HeaderLayout height={"60px"}>
                    <MenuLayout>
                        <div>
                            <Link href="/">
                                [Home]
                            </Link>
                            {' '}
                        </div>
                        <EthAccount/>
                    </MenuLayout>
                </HeaderLayout>
                <Main/>
            </BaseLayout>
        </DrizzleContext.Provider>

    )
}

export default App;
