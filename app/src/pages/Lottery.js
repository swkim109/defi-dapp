import React, {Fragment, useContext, useEffect, useState} from "react";
import {DrizzleContext} from "@drizzle/react-plugin";
import {Button, Text, Radio, Box, ToastMessage, Icon} from "rimble-ui"
import {Container, CheckSlider, ButtonGroup, ManageGroup, FormGroup} from "../layouts/LotteryLayout";

import {useTransaction} from "./DrizzleTransaction";
import addContract from "../utils/AddContract";
import constants from "../utils/constants";
import abi from "../utils/contract.abi";
import {formatter} from "../utils/formatter";

import "../css/radio-slider.css"
import { mcdDai32 } from "../images";
import CountUp from "react-countup";
import Modal from "./Modal";

export default () => {
    
    const drizzleContext = useContext(DrizzleContext.Context);
    
    const [accounts, setAccounts] = useState([]);
    
    useEffect(()=>{

        //if (drizzleContext.initialized) {
        if (drizzleContext.initialized && drizzleContext.drizzleState.web3.status === "initialized") {
    
            drizzleContext.drizzle.web3.eth.getAccounts().then(accounts => setAccounts(accounts));
            
            addContract(drizzleContext, "MCD", abi.DAI, constants.DAI_CONTRACT, []);
            addContract(drizzleContext, "CTOKEN", abi.cDAI, constants.cDAI_CONTRACT, []);
            
        }

    },[drizzleContext.initialized]);
    
    
    return (
        <Fragment>
            <MyComponent {...drizzleContext} accounts={accounts} />
        </Fragment>
    )
}

const MyComponent = ({drizzle, drizzleState, initialized, accounts}) => {
    
    const [keyDrawId, setKeyDrawId] = useState(0);
    const [keyBalanceOfDraw, setKeyBalanceOfDraw] = useState(0);
    const [keyTotal, setKeyTotal] = useState(0);
    const [keyBalance, setKeyBalance] = useState(0);
    const [key, setKey] = useState(0); // test
    
    const [approve, setApprove] = useState(false);
    const [daiAllowance, setDaiAllowance] = useState(0);
    const [openDrawId, setOpenDrawId] = useState(0);
    const [ticket, setTicket] = useState(1);
    const [stake, setStake] = useState(0);
    const [total, setTotal] = useState(0);
    const [balance, setBalance] = useState(0);
    const [cToken, setCToken] = useState(0);
    const [accrued, setAccrued] = useState(0);
    const [gross, setGross] = useState(0);
    const [flag, setFlag] = useState({isOpen: false, msg: ''});
    
    const [pending, setPending] = useState(false);
    const [txHash, setTxHash] = useState(null);
    const [hash, status ] = useTransaction();
    
    const daiContract = drizzle.contracts['MCD'];
    const cdaiContract = drizzle.contracts['CTOKEN'];
    const basePool = drizzle.contracts['BasePool'];
    
    
    const getAllowance = async () => {
        return await daiContract.methods.allowance(accounts[0], basePool.address).call();
    }
    
    const getCTokenBalance = async () => {
        return await cdaiContract.methods.balanceOf(basePool.address).call();
    }
    
    const getExchangeRate = async () => {
        return await cdaiContract.methods.exchangeRateCurrent().call();
    }
    
    const getOpenDrawId = async () => {
        return await basePool.methods.currentOpenDrawId().call();
    }
    
    const handleEvents = (result) => {
        
        if (result.event === "Deposited" || result.event === "Withdrawn") {
            getAllowance().then((val) => {
                setDaiAllowance(drizzle.web3.utils.fromWei(val.toString(), "ether"));
            });
            
        } else if (result.event === "Opened") {
            getOpenDrawId().then(val => setOpenDrawId(val));
            
        } else if (result.event === "Rewarded") {
            console.log(result.returnValues);
        }
    }
    
    useEffect(() => {
    
        let subscription;
        
        if (accounts.length > 0) {
    
            getAllowance().then((allowance) => {
                if (allowance.toString() !== "0") {
                    setApprove(true);
                    setDaiAllowance(drizzle.web3.utils.fromWei(allowance.toString(), "ether"));
                }
            });
            
            
            setKeyDrawId(basePool.methods.currentOpenDrawId.cacheCall());
            setKeyBalanceOfDraw(basePool.methods.getBalanceOfDrawTree.cacheCall(accounts[0]));
            setKeyTotal(basePool.methods.accountedBalance.cacheCall());
            setKeyBalance(basePool.methods.balanceOf.cacheCall(accounts[0]));
    
            const eventSig = drizzle.web3.utils.sha3("Approval(address,address,uint256)");
            const owner = drizzle.web3.eth.abi.encodeParameter("address", accounts[0]);
            //const spender = drizzle.web3.eth.abi.encodeParameter("address", basePool.address);
            const topics = [eventSig, owner, null];
            
            subscription = drizzle.web3.eth.subscribe('logs', {address: daiContract.address, topics})
                .on('data', (log) => {
                    const result = drizzle.web3.eth.abi.decodeLog([{type: 'uint256', name: 'value'}], log.data);
                    //console.log(result.value);
                    if (result.value.toString() === "0") {
                        setApprove(false);
                    } else {
                        setApprove(true);
                    }
                    setDaiAllowance(drizzle.web3.utils.fromWei(result.value.toString(), "ether"));
                })
                .on('error', (error) => {console.log(error)});
    
            basePool.events.allEvents((err, result) => {
                handleEvents(result);
            });
            /*
            basePool.events.Deposited((err, result) => {
               handleEvent(result);
            });
    
            basePool.events.Withdrawn((err, result) => {
                handleEvent(result);
            });
    
            basePool.events.Opened((err, result) => {
                handleEvent(result);
            });
    
            basePool.events.Rewarded((err, result) => {
                handleEvent(result);
            });
            */
    
        }
    
        return () => {
            console.log(subscription);
            if (subscription !== undefined) {
                subscription.unsubscribe((error, success) => {
                    console.log(`Unsubscribe ${success}`);
                });
            }
        }

    }, [accounts]);
    
    useEffect(() => {
        
        if (drizzleState !== null) {
            
            const { BasePool } = drizzleState.contracts;
            
            if (BasePool !== undefined) {
                if (BasePool.currentOpenDrawId[keyDrawId] !== undefined) {
                    setOpenDrawId(BasePool.currentOpenDrawId[keyDrawId].value);
                }
    
                if (BasePool.getBalanceOfDrawTree[keyBalanceOfDraw] !== undefined) {
                    setStake(drizzle.web3.utils.fromWei(BasePool.getBalanceOfDrawTree[keyBalanceOfDraw].value.toString(), "ether"));
                }
    
                if (BasePool.accountedBalance[keyTotal] !== undefined) {
                    
                    const total = drizzle.web3.utils.fromWei(BasePool.accountedBalance[keyTotal].value.toString(), "ether");
                    setTotal(total);
                    
                    if (accrued > 0) {
                        //console.log(accrued - total);
                        setGross(accrued - total);
                    }
                }
    
                if (BasePool.balanceOf[keyBalance] !== undefined) {
                    setBalance(drizzle.web3.utils.fromWei(BasePool.balanceOf[keyBalance].value.toString(), "ether"));
                }
            }
    
            if (cdaiContract !== undefined) {
                
                const BN = drizzle.web3.utils.BN;
                
                getCTokenBalance().then((b) => {
                    setCToken(b/1e8);
        
                    getExchangeRate().then(r => {
                        return r;
                    }).then(r => {
                        const cToken = new BN(b.toString());
                        const exchangeRate = new BN(r.toString());
                        const u = new BN(1e18.toString());
                        //console.log(cToken, exchangeRate, u);
                        //console.log(drizzle.web3.utils.fromWei(cToken.mul(exchangeRate).div(u).toString(), "ether"));
                        setAccrued(drizzle.web3.utils.fromWei(cToken.mul(exchangeRate).div(u).toString(), "ether"));
                    });
                });
            }
        }
    }, [drizzleState, keyDrawId, keyBalanceOfDraw, keyTotal]);
    
    
    useEffect(() => {
        
        setTxHash(hash);
        
        if (status === "pending") {
            setPending(true);
            
        } else if (status === "success") {
            setPending(false);
            
        } else if (status === "error" || status === "exception") {
            setPending(false);
            //setFlag({isOpen: true, msg: message});
        }
        
    }, [status]);
    
    const handleDaiEnable = async (e) => {
        const val = e.target.checked;
    
        let balance = await daiContract.methods.balanceOf(accounts[0]).call();
        
        if (!val) {
            balance = 0;
        }
        await daiContract.methods.approve.cacheSend(basePool.address, balance, {from: accounts[0]});
    }
    
    const handleBuyTicket = async () => {
        
        if (ticket > 0 && daiAllowance > 0 && openDrawId > 0) {
            const val = drizzle.web3.utils.toWei(ticket.toString(), "ether");
            await basePool.methods.buyTicket.cacheSend(val, {from: accounts[0]});
        }
    }
    
    const handleWithdraw = async () => {
        if (ticket > 0 && stake > 0) {
            const val = drizzle.web3.utils.toWei(ticket.toString(), "ether");
            console.log(`Withdrawal from the draw ${val.toString()}`);
            await basePool.methods.withdrawDepositFromDraw.cacheSend(val, {from: accounts[0]});
        }
    }
    
    const handleWithdrawBalance = async () => {
    
        const BN = drizzle.web3.utils.BN;
        const b = drizzle.web3.utils.toWei(balance.toString(), "ether");
        const s = drizzle.web3.utils.toWei(stake.toString(), "ether");
        
        const val = new BN(b).sub(new BN(s));
        if (val.gt(new BN(0))) {
            console.log(`Withdrawal from the contract ${val.toString()}`);
            await basePool.methods.withdrawDeposit.cacheSend(val.toString(), {from: accounts[0]});
        }
    }
    
    const handleChange = (e) => {
        setTicket(e.target.value);
    }
    
    const handleOpenDraw = async () => {
        const secretHash = constants.SECRET_HASH;
        await basePool.methods.openDraw.cacheSend(secretHash, {from: accounts[0]});
    }
    
    const handleReward = async () => {
       await basePool.methods.reward.cacheSend(constants.SECRET, constants.SALT, {from: accounts[0]});
    }
    
    const handleWinner = async () => {
        const drawId = openDrawId - 1;
        if (drawId > 0) {
            const result = await basePool.methods.getDraw(drawId).call();
            console.log(result.winner);
            if (result.winner !== constants.ZERO_ADDRESS) {
                setFlag({isOpen: true, msg: `Winner is ${result.winner}, ${drizzle.web3.utils.fromWei(result.netWinnings.toString(), 'ether')} DAI`});
            } else {
                setFlag({isOpen: true, msg: `No winner`});
            }
            
        }
    }
    
    const handleClose = (e) => {
        e.preventDefault();
        setFlag({isOpen: false, msg: ''});
    }
    
    const checkDraw = async () => {
        const result = await basePool.methods.getTotalOfDrawTree(1).call();
        console.log(result);
    }
    
    return (
        <Container>
            <FormGroup>
                <CheckSlider>
                    {mcdDai32}
                    <Text.span fontWeight={"bold"} fontSize={4}>
                        DAI {approve?'Enabled':'Disabled'}
                    </Text.span>
                    <label className="switch">
                        <input type="checkbox" onChange={handleDaiEnable} checked={approve?'checked':''}/>
                        <span className="slider round"/>
                    </label>
                    <Text.span fontWeight={"bold"} fontSize={4} >
                        {`${formatter(daiAllowance, {precision: 6})}`} DAI
                    </Text.span>
                </CheckSlider>
                <Box bg="green" color="white" fontSize={2} fontWeight={"bold"} p={10} mb={20}>
                    You have {stake} tickets
                </Box>
                <Box bg="grey" fontSize={2} fontWeight={"bold"} p={10} mb={20}>
                    Your balance {`${formatter(balance, {precision: 6})}`} DAI
                </Box>
                <ButtonGroup>
                    <Text.span fontWeight={"bold"} fontSize={4} >
                        Tickets
                        <Text fontSize={2}>(1 ticket = 1 dai)</Text>
                    </Text.span>
                    <div>
                        <Radio name={"ticket"} defaultChecked label="1 ticket(1 dai)" my={2} onChange={handleChange} value={1}/>
                        <Radio name={"ticket"}  label="3 tickets(3 dai)" my={2} onChange={handleChange} value={3} />
                        <Radio name={"ticket"}  label="5 tickets(5 dai)" my={2} onChange={handleChange} value={5} />
                        <Radio name={"ticket"}  label="10 tickets(10 dai)" my={2} onChange={handleChange} value={10} />
                        <Radio name={"ticket"}  label="20 tickets(20 dai)" my={2} onChange={handleChange} value={20} />
                        <Radio name={"ticket"}  label="50 tickets(50 dai)" my={2} onChange={handleChange} value={50} />
                    </div>
                    <div style={{display: "flex"}}>
                        <Button onClick={handleBuyTicket} mr={2}>Buy tickets</Button>
                        <Button onClick={handleWithdraw} mainColor={"danger"} mr={2}>Withdraw tickets</Button>
                        <Button onClick={handleWithdrawBalance} mainColor={"success"}>Withdraw balance</Button>
                    </div>
                </ButtonGroup>
                <div style={{display: "flex"}}>
                    <Icon name={"Mood"}/>
                    <Text fontSize={3}>Prize(estimate): </Text><Text fontWeight={"bold"} fontSize={3}> {`${formatter(gross)}`} DAI</Text>
                </div>
                <ButtonGroup>
                    <Button onClick={handleWinner}>Past Winner</Button>
                </ButtonGroup>
            </FormGroup>
            <ManageGroup>
                <div style={{display: "flex"}}>
                    <Text fontSize={3}>Draw ID: </Text><Text fontWeight={"bold"} fontSize={3} color={"red"}>{openDrawId>0?openDrawId:'Not available'}</Text>
                </div>
                <div style={{display: "flex"}}>
                    <Text fontSize={3}>BasePool: </Text><Text fontWeight={"bold"} fontSize={3}>{`${formatter(total, {precision: 6})}`} DAI</Text>
                </div>
                <div style={{display: "flex"}}>
                    <Text fontSize={3}>Compound: </Text><Text fontWeight={"bold"} fontSize={3}>{`${formatter(cToken, {precision: 6})}`} cDAI</Text>
                </div>
                <div style={{display: "flex"}}>
                    <Text fontSize={3}>Prize(estimate): </Text><Text fontWeight={"bold"} fontSize={3}> <CountUp start={0} end={gross} decimals={8} preserveValue={true} /> DAI</Text>
                    
                </div>
                <div style={{display: "flex"}}>
                    <Button mainColor="Orange" onClick={handleOpenDraw} disabled={openDrawId>0?'disabled':null} mr={2}>Open draw</Button>
                    <Button mainColor="Orange" onClick={handleReward}>Reward</Button>
                </div>
                <div style={{display: "flex", marginTop: "10px"}}>
                    <Button mainColor="Black" onClick={checkDraw}>Test</Button>
                </div>
            </ManageGroup>
            {pending?<ToastMessage.Processing my={20} message={txHash} width={400}/>:null}
            <Modal isOpen={flag.isOpen} msg={flag.msg} closeModal={handleClose} title={"Winner"}/>
        </Container>
       
    )
}
