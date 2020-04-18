import {useEffect, useContext} from 'react';
import { useNavigation } from 'react-navi';
import {DrizzleContext} from '@drizzle/react-plugin';

const Web3ProviderEvent = (props) => {

    const drizzleContext = useContext(DrizzleContext.Context);
    const { drizzle, drizzleState, initialized } = drizzleContext;
    const navigation = useNavigation();

    useEffect(() => {

        if (initialized && drizzleState.web3.status === "initialized") {
            
            console.log(`Users connect dapp ${drizzleState.web3.status}`);
            
            drizzle.web3.currentProvider.on("accountsChanged", (accounts) => {
                console.log(accounts);
                drizzle.store.dispatch({type: 'ACCOUNTS_FETCHING', web3: drizzle.web3});
                navigation.navigate('/').then(r => console.log(r));
            });
        }

    }, [initialized]);

    return props.children;
}

export default Web3ProviderEvent;
