import React, {Fragment, useContext, useEffect, useState} from 'react';
import styled from 'styled-components';
import { Eth } from '@rimble/icons';
import {DrizzleContext} from "@drizzle/react-plugin";

const AccountDiv = styled.div`
   display: flex;
   justify-content: space-between;
   line-height: 33px;
   width: 520px;
`;

const EthAccount = () => {

    const drizzleContext = useContext(DrizzleContext.Context);
    const { drizzle, drizzleState, initialized } = drizzleContext;

    const [account, setAccount] = useState(null);

    useEffect(() => {

        const web3 = drizzle.web3;

        if (drizzleState && web3 !== undefined) {
            web3.eth.getAccounts((e,r) => setAccount(r[0])).then();
            
        } else {
            setAccount(null);
        }

    }, [drizzleState]);

    return (
        <Fragment>
            {
                account
                    ? <AccountDiv>
                        <Eth size="32px" color="orange"/>{account}
                      </AccountDiv>
                    : "No Account Connected to Dapp"
            }
        </Fragment>
    )
}


export default EthAccount;
