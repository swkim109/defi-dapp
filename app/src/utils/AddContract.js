export default (drizzleContext, contractName, abi, contractAddress, events) => {
    
    if (drizzleContext.initialized && drizzleContext.drizzleState.web3.status === "initialized") {
        const web3 = drizzleContext.drizzle.web3;
        
        if (contractName !== null && !drizzleContext.drizzle.contracts[contractName]) {
            console.log(`Add contract ${contractName}`);
            
            drizzleContext.drizzle.addContract({
                contractName: contractName,
                web3Contract: new web3.eth.Contract(
                    abi,
                    contractAddress
                )
            }, events);
        }
    }
   
}
