import React, { useState, useEffect, useContext, createRef, Fragment } from 'react';
import styled from 'styled-components';
import { DrizzleContext } from "@drizzle/react-plugin";
import {Box, Button, Input, ToastMessage} from 'rimble-ui';
import Modal from "./Modal";
import { useTransaction } from "./DrizzleTransaction";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
`

const FormGroup = styled.div`
  display: flex;
  margin: 20px 10px 10px 10px;
  width: 840px;
  justify-content: space-between;
`;



export default () => {

    const drizzleContext = useContext(DrizzleContext.Context);
    return (
        <Fragment>
            <MyComponent {...drizzleContext} />    
        </Fragment>
    )
}


const MyComponent = (props) => {

    const web3 = props.drizzle.web3;
    const contracts = props.drizzle.contracts;

    const [accounts, setAccounts] = useState([]);
    const [val, setVal] = useState(0);
    const [storedData, setStoredData] = useState(null);
    const [pending, setPending] = useState(false);
    const [txHash, setTxHash] = useState(null);
    const [flag, setFlag] = useState({isOpen: false, msg: ''});
    const [dataKey, setDataKey] = useState(0);

    const inputRef = useState(() => createRef())[0];

    const [hash, status, receipt, message ] = useTransaction();

    useEffect(() => {

        if (props.initialized && props.drizzleState.web3.status === "initialized") {
            //console.log(web3.version);
            web3.eth.getAccounts().then(accounts => setAccounts(accounts));
            setDataKey(contracts.SimpleStorage.methods.get.cacheCall());

            const subscription = web3.eth.subscribe('logs', {address: contracts.SimpleStorage.address})
                .on('data', (log) => {
                    const v = parseInt(log.topics[1], 16); // 리턴 값이 16진수
                    console.log(v);
                    setStoredData(v);
                })
                // .on('connected', (subscriptionId) => {
                //     console.log("subscriptionId=" + subscriptionId);
                // })
                .on('error', (error) => {console.log(error)});

            
            // componentWillUnmount
            return () => {
                subscription.unsubscribe((error, success) => {
                    console.log(`Unsubscribe ${success}`);
                });
            }
        }

    }, [props.initialized]);


    useEffect(() => {

        setTxHash(hash);

        if (status === "pending") {
            setPending(true);

        } else if (status === "success") {
            setPending(false);
            console.log(receipt);

        } else if (status === "error" || status === "exception") {
            setPending(false);
            setFlag({isOpen: true, msg: message});
        }

    }, [status]);

    const handleSet = async () => {

        try {

            if (inputRef.current.value === '') {
                setFlag({isOpen: true, msg: "Enter any number greater than 0."});
                return;
            }

            //const tx = await contracts.SimpleStorage.methods.set(val).send({from:accounts[0]});
            contracts.SimpleStorage.methods.set.cacheSend(val, {from: accounts[0]});
            
        } catch (error) {
            console.log(error.message);
            setPending(false);
        }

    }

    const handleChange = (e) => {
        if (e.target.value !== "") {
            setVal(parseInt(e.target.value));
        }
    }

    const handleClose = (e) => {
        e.preventDefault();
        setFlag({isOpen: false, msg: ''});
    }

    const handleGet = async () => {
        console.log(dataKey);
        const { SimpleStorage } = props.drizzleState.contracts;
        if (SimpleStorage.get[dataKey] !== undefined) {
            setStoredData(SimpleStorage.get[dataKey].value);
        }
        //const v = await contracts.SimpleStorage.methods.get().call();
        //setStoredData(v);
    }

    const handleReset = () => {
        setStoredData(null);
        inputRef.current.value = '';
    }

    return (
        <Container>
            <FormGroup>
                <Input type="number" required={true} size={200} onChange={handleChange} min={0} ref={inputRef}/>
                <Button onClick={handleSet}>Set</Button>
                <Button onClick={handleGet} mainColor="DarkCyan">Get</Button>
                <Button onClick={handleReset} mainColor="Orange">Reset</Button>
                <Box pl={2} py={2} width={330} fontWeight={"bold"} fontSize={4}>
                    {storedData}
                </Box>
            </FormGroup>
            {pending?<ToastMessage.Processing my={20} message={txHash} width={600}/>:null}
            <Modal isOpen={flag.isOpen} msg={flag.msg} closeModal={handleClose} />
        </Container>
    )

}
