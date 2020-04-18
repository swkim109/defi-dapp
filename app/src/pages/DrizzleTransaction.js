import { useState, useEffect, useContext } from 'react';
import {DrizzleContext} from "@drizzle/react-plugin";

const useTransaction = () => {

    const drizzleContext = useContext(DrizzleContext.Context);
    const { drizzle } = drizzleContext;

    const drizzleState = drizzle.store.getState();

    const [hash, setHash] = useState(null);
    const [status, setStatus] = useState(null);
    const [receipt, setReceipt] = useState({});
    const [message, setMessage] = useState('');
    
    useEffect(()=> {
        
        let hash;
        let status;
        let receipt;
        let message;

        if (drizzleState.transactionStack.length > 0) {
            hash = drizzleState.transactionStack.slice(-1)[0];
            const transaction = drizzleState.transactions[hash];

            if (transaction !== undefined) {

                status = transaction.status;
                message = '';

                if (status === "pending") {
                    receipt = {};

                    if (transaction.confirmations.length > 0
                        && transaction.confirmations.slice(-1)[0].status === false) {

                        status = "exception";
                        message = `JSON-RPC Error\r\n${hash}`;
                    }

                } else if (status === "success") {
                    receipt = transaction.receipt;

                } else if (status === "error") {
                    receipt = {};
                    message = transaction.error.message;
                }

                setHash(hash);
                setStatus(status);
                setReceipt(receipt);
                setMessage(message);
            }
        }

    }, [drizzleState]);

    return [ hash, status, receipt, message ];

}

export { useTransaction }
