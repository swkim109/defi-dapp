import React, {Suspense} from "react";

import {Router, View, NotFoundBoundary} from "react-navi";
import routes from "./routes";
import LoadingLayout from "./layouts/LoadingLayout";
import ErrorBoundary from "./pages/ErrorBoundary";
import Web3ProviderEvent from "./utils/Web3ProviderEvent"

const Main = () => {

    return (

        <Suspense fallback={<LoadingLayout type={"Grid"}/>}>
            <Router routes={routes}>
                <ErrorBoundary>
                    <NotFoundBoundary render={renderNotFound}>
                        <Web3ProviderEvent>
                            <View/>
                        </Web3ProviderEvent>
                    </NotFoundBoundary>
                </ErrorBoundary>
            </Router>
        </Suspense>

    );
}

export default Main;

function renderNotFound() {
    return (
        <div>
            <h1>404 - Not Found</h1>
        </div>
    )
}
