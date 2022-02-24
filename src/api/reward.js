import App from '../App';
import { getNFTContractInstance,   getTokenContractInstance,   getWeb3 } from './index'

// async function getTotalReward(myweb3) {
//   try {
//     const contractInstance = getContractInstance(myweb3)
//     console.log('contract instance', contractInstance);

//     // let decimals = await contractInstance.methods.decimals().call();
//     // let res = await contractInstance.methods.totalDistributed().call();
//     let res = await contractInstance.methods.balanceOf().call();
    
//     // res = res / Math.pow(10, decimals);
//     return Promise.resolve(res);
//   } catch (error) {
//     return Promise.reject(error);
//   }
// }

// async function getUserReward(myweb3, account) {
//   try {
//     const contractInstance = getContractInstance(myweb3);
//     let res = await contractInstance.methods.getUnpaidEarnings(account).call();

//     return Promise.resolve(res);
//   } catch (error) {
//     return Promise.reject(error);
//   }
// }

async function getTotalBalance(myweb3, account) {
  try {
    console.log('account balance')
    const contractInstance = getTokenContractInstance(myweb3);
    // let res = await contractInstance.methods.totalSupply(account).call();
    let res = await contractInstance.methods.balanceOf(account).call();

    return Promise.resolve(res);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function getTotalBalanceNFT(myweb3, account) {
  try {
    console.log('account balance')
    const contractInstance = getNFTContractInstance(myweb3);
    // let res = await contractInstance.methods.totalSupply(account).call();
    let res = await contractInstance.methods.balanceOf(account).call();

    return Promise.resolve(res);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function getCurrentTokenSupply(myweb3, account) {
  try {
    console.log('total supply')
    const contractInstance = getTokenContractInstance(myweb3);
    // let res = await contractInstance.methods.totalSupply(account).call();
    let res = await contractInstance.methods.totalSupply().call();

    return Promise.resolve(res);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function getTotalValueLocked(myweb3, account) {
  try {
    console.log('total value locked')
    const contractInstance = getNFTContractInstance(myweb3);
    // let res = await contractInstance.methods.totalSupply(account).call();
    let res = await contractInstance.methods.totalValueLocked().call();

    return Promise.resolve(res);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function getTotalPlanets(myweb3, account) {
  try {
    console.log('total planets')
    const contractInstance = getNFTContractInstance(myweb3);
    // let res = await contractInstance.methods.totalSupply(account).call();
    let res = await contractInstance.methods.totalSupply().call();

    return Promise.resolve(res);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function getTotalEmissionPerDay(myweb3, account) {
  try {
    console.log('total emission per day')
    const contractInstance = getNFTContractInstance(myweb3);
    // let res = await contractInstance.methods.totalSupply(account).call();
    let res = await contractInstance.methods.calculateTotalDailyEmission().call();

    return Promise.resolve(res);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function getRewardPerDay(myweb3, account) {
  try {
    console.log('rewardPerDay')
    const contractInstance = getNFTContractInstance(myweb3);
    // let res = await contractInstance.methods.totalSupply(account).call();
    let res = await contractInstance.methods.rewardPerDay().call();

    return Promise.resolve(res);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function getCreationMinPrice(myweb3, account) {
  try {
    console.log('creationMinPrice')
    const contractInstance = getNFTContractInstance(myweb3);
    // let res = await contractInstance.methods.totalSupply(account).call();
    let res = await contractInstance.methods.creationMinPrice().call();

    return Promise.resolve(res);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function getPlanetsIdsOf(myweb3, account) {
  try {
    console.log('getPlanetsByIds')
    const contractInstance = getNFTContractInstance(myweb3);
    // let res = await contractInstance.methods.totalSupply(account).call();
    let res = await contractInstance.methods.getPlanetIdsOf(account).call();

    return Promise.resolve(res);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function getPlanetsInfos(myweb3, account, ids) {
  try {
    console.log('getPlanetsInfos')
    const contractInstance = getNFTContractInstance(myweb3);
    // let res = await contractInstance.methods.totalSupply(account).call();
    let res = await contractInstance.methods.getPlanetsByIds(ids).call();

    return Promise.resolve(res);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function createPlanet(myweb3, account, name, value) {
  try {
    const contractInstance = getNFTContractInstance(myweb3);
    // let res = await contractInstance.methods.totalSupply(account).call();
    let res = await contractInstance.methods.createPlanetWithTokens(name, value).send({from: account});

    return Promise.resolve(res);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function compoundAll(myweb3, account) {
  try {
    const contractInstance = getNFTContractInstance(myweb3);
    // let res = await contractInstance.methods.totalSupply(account).call();
    let res = await contractInstance.methods.compoundAll().send({from: account});

    return Promise.resolve(res);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function compoundOne(myweb3, account, id) {
  try {
    const contractInstance = getNFTContractInstance(myweb3);
    // let res = await contractInstance.methods.totalSupply(account).call();
    let res = await contractInstance.methods.compoundReward(id).send({from: account});
    return Promise.resolve(res);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function cashoutAll(myweb3, account) {
  try {
    const contractInstance = getNFTContractInstance(myweb3);
    // let res = await contractInstance.methods.totalSupply(account).call();
    let res = await contractInstance.methods.cashoutAll().send({from: account});
    return Promise.resolve(res);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function cashoutReward(myweb3, account, id) {
  try {
    const contractInstance = getNFTContractInstance(myweb3);
    // let res = await contractInstance.methods.totalSupply(account).call();
    let res = await contractInstance.methods.cashoutReward(id).send({from: account});
    return Promise.resolve(res);
  } catch (error) {
    return Promise.reject(error);
  }
}

// async function getPendingReward(myweb3, account) {
//   try {
//     const contractInstance = getContractInstance(myweb3);
//     // let res = await contractInstance.methods.shares(account).call();

//     // return Promise.resolve(res);
//   } catch (error) {
//     // return Promise.reject(error);
//   }
// }

// async function claim(myweb3, address) {
//   try {
//     console.log('claim', address);
//     let from = address;
//     let gasPrice = await myweb3.eth.getGasPrice();

//     const contractInstance = getContractInstance(myweb3);
//     // let param = {
//     //   from: from,
//     //   to: '0x12896bf73bc456aabcad48d0c5662199def840f8',
//     //   gasPrice: gasPrice,
//     //   gas: '9000000'
//     //   // value: 10000000000000
//     // }
//     let res = await contractInstance.methods.claimDividend().send({from:address});
//     console.log(res);
//     return Promise.resolve(res);
//   } catch (error) {
//     return Promise.reject(error);
//   }
// }


export {
  //getTotalReward,
  //getUserReward,
  //getPendingReward,
  //claim,
  getTotalBalance,
  getTotalBalanceNFT,
  getCurrentTokenSupply,
  getTotalValueLocked,
  getTotalPlanets,
  getTotalEmissionPerDay,
  getRewardPerDay,
  getCreationMinPrice,
  getPlanetsIdsOf,
  getPlanetsInfos,
  createPlanet,
  compoundAll,
  compoundOne,
  cashoutAll,
  cashoutReward
};
