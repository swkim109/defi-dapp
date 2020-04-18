# ganache-cli

$NETWORK_ID = "5777"
$GAS_LIMIT = "0x98764C" # ‭9991756

$INFURA_KEY = ""

$MAIN = "https://mainnet.infura.io/v3/$INFURA_KEY"
$KOVAN = "https://kovan.infura.io/v3/$INFURA_KEY"
$RINKEBY = "https://rinkeby.infura.io/v3/$INFURA_KEY"

$ACCOUNT_1 = "0xAFc4F9F3bA806dd2F8e47A524fFDa2418bBFc08a" #Roy
$ACCOUNT_2 = "0x6B0086d92d9B78C09D54e6E9F07611f740D70369" #Kate


ganache-cli -d --gasLimit $GAS_LIMIT --networkId $NETWORK_ID --fork $RINKEBY --unlock $ACCOUNT_1 --unlock $ACCOUNT_2
#ganache-cli -d --networkId $NETWORK_ID --gasLimit $GAS_LIMIT
