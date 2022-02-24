import React, { useEffect, useState } from "react";
import "./App.scss";
import Web3 from "web3";
import { getTotalBalance, getTotalBalanceNFT, getCurrentTokenSupply, getTotalValueLocked, getTotalPlanets, getTotalEmissionPerDay, getRewardPerDay, getCreationMinPrice, getPlanetsIdsOf, getPlanetsInfos, createPlanet, compoundAll, compoundOne, cashoutAll, cashoutReward } from "./api/reward";
// import { getTotalReward, getUserReward, getPendingReward, claim, getTotalBalance, getTotalBalanceNFT  } from "./api/reward";
// import { connectToWallet, offWeb3Modal } from "./api";
import { chainHex, chainId } from "./config/site.config";
import { offWeb3Modal, web3_modal } from "./api";
import { getNFTContractInstance, getTokenContractInstance, getWeb3 } from './api/index';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import PlanetImg from './assets/images/planet.webp';

const detectEthereumNetwork = (callback) => {
  window.ethereum.request({ method: 'eth_chainId' }).then(async (cId) => {
    if (parseInt(cId) != chainId) { // bsc testnet
      window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainHex }], // chainId must be in hexadecimal numbers
      }).then(() => {
        return callback();
      })
    } else {
      return callback();
    }
  });
}

function NewPlanetBtn(props) {
  return <button className="btn btn-planet btn-primary" onClick={() => props.onClick()}>
    + New Planet
  </button>
}

function App() {
  const [myWeb3, setMyWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [total, setTotal] = useState(0);
  const [userReward, setUserReward] = useState(0);
  // const [pendingReward, setPendingReward] = useState(0);
  const [balanceOf, setTotalBalance] = useState(0);
  const [balanceOfNFT, setTotalBalanceNFT] = useState(0);
  const [currentTokenSupply, setCurrentTokenSupply] = useState(0);
  const [totalValueLocked, setTotalValueLocked] = useState(0);
  const [totalPlanets, setTotalPlanets] = useState(0);
  const [totalEmissionPerDay, setTotalEmissionPerDay] = useState(0);
  const [rewardPerDay, setRewardPerDay] = useState(0);
  const [creationMinPrice, setCreationMinPrice] = useState(0);
  const [planetsIdsOf, setPlanetsIdsOf] = useState(0);
  const [planetsInfos, setPlanetsInfos] = useState([]);
  const [totalPendingRewards, setTotalPendingRewards] = useState(0);
  const [totalPlanetsValue, setTotalPlanetsValue] = useState(0);
  const [showNewPlanetModal, setShowNewPlanetModal] = useState(false);

  // new planet form info
  const [newPlanet, setNewPlanet] = useState({ name: '', amount: 0, error: '' });
  const [delayTimes, setDelayTimes] = useState({});
  const [allCompoundLeftTime, setAllCompoundLeftTime] = useState(0);

  const handleNewPlanetChange = (ev) => {
    let name = ev.target.name;
    let value = ev.target.value;
    setNewPlanet({ ...newPlanet, [name]: value });
  }

  const connect = async () => {
    if (account !== '') {
      setAccount('');
      setMyWeb3(null);
      web3_modal.clearCachedProvider();
      setTimeout(() => {
        window.location.reload();
      }, 1);
    }
    else {
      detectEthereumNetwork(async () => {
        const provider = await web3_modal.connect();

        if (!provider.on) {
          return;
        }

        provider.on('accountsChanged', async () => setTimeout(() => window.location.reload(), 1));

        provider.on('chainChanged', async (cid) => {
          if (parseInt(cid) !== chainId) {
            await web3_modal.off();
            return null;
          }
        })


        await web3_modal.toggleModal();
        // provider.
        // regular web3 provider methods
        const web3 = new Web3(provider);
        if (web3) {
          setMyWeb3(web3);
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);
        }
      });
    }
  }

  const disconnect = async () => {
    offWeb3Modal();
  }

  const onNewNftBtn = () => {
    if (account == '') {
      window.alert('Please connect to wallet first.');
      return;
    }
    setShowNewPlanetModal(true);
  }

  const hideNewPlanetModal = () => {
    setShowNewPlanetModal(false);
  }

  const onMint = async () => {
    if (newPlanet.name.length < 4 || newPlanet.name.length > 32) {
      let _error = "Name is not valid";
      setNewPlanet({ ...newPlanet, error: _error });
      return;
    }
    if (newPlanet.amount < 42000) {
      let _error = "Insufficient amount of UNIV";
      setNewPlanet({ ...newPlanet, error: _error });
      return;
    }
    let weiValue = myWeb3.utils.toWei(`${newPlanet.amount}`);
    let res = await createPlanet(myWeb3, account, newPlanet.name, weiValue);
    console.log(res);
    await updatePlanetInfos();
  }

  const compoundAllHandler = async () => {
    let res = await compoundAll(myWeb3, account);
    console.log(res);
    await updatePlanetInfos();
  }

  const handleCompoundOne = async (id) => {
    let res = await compoundOne(myWeb3, account, id);
    console.log(res);
    await updatePlanetInfos();
  }

  const handleClaimAll = async () => {
    if(window.confirm("Claiming rewards for all planets will reset the tiers for all of them, are you sure to continue?")){
      let res = await cashoutAll(myWeb3, account);
      console.log(res);
      await updatePlanetInfos();
    }
  }

  const handleClaimOne = async (id) => {
    if(window.confirm("Claiming rewards for this planet will reset its tier, are you sure to continue?")){
      let res = await cashoutReward(myWeb3, account, id);
      console.log(res);
      await updatePlanetInfos();
    }
  }

  const updatePlanetInfos = async () => {
    const _planetsIdsOf = await getPlanetsIdsOf(myWeb3, account)
    console.log('planetsIdsOf =====', _planetsIdsOf);
    setPlanetsIdsOf(_planetsIdsOf)
    // -------------- //
    const _planetsInfos = await getPlanetsInfos(myWeb3, account, _planetsIdsOf)
    console.log('planets infos', _planetsInfos);
    setPlanetsInfos(_planetsInfos);
    updateTotalPendingReward(_planetsInfos);
    updateTotalPlanetsValue(_planetsInfos);
    calcCompoundTime(_planetsInfos);
  }

  const updateTotalPendingReward = (_planets)=>{
      let total = 0;
      for(let i = 0; i<_planets.length; i++){
        total += Math.floor(_planets[i].pendingRewards);
      }
      setTotalPendingRewards(total);
  }

  const updateTotalPlanetsValue = (_planets)=>{
    let total = 0;
    for(let i = 0; i<_planets.length; i++){
      total += Math.floor(_planets[i].planet.planetValue);
    }
    setTotalPlanetsValue(total);
  }
  
  const calcCompoundTimeInterval = async () => {
    await updatePlanetInfos();
  }

  const calcCompoundTime = (_planetsInfos) => {
    let _allCompoundLeftTime = _planetsInfos.length > 0 ? _planetsInfos[0].planet.lastProcessingTimestamp * 1000 + _planetsInfos[0].compoundDelay * 1000 - (new Date().getTime()) : 0;
    let _delayTimes = delayTimes;
    for (let i = 0; i < _planetsInfos.length; i++) {
      let nftCard = _planetsInfos[i];
      let creationTime = nftCard.planet.lastProcessingTimestamp;
      let lastTime = creationTime * 1000 + nftCard.compoundDelay * 1000;
      let leftTime = lastTime - (new Date().getTime());
      console.log('calcCompoundTime', nftCard.id, lastTime, leftTime, nftCard.planet.lastProcessingTimestamp)
      if (_allCompoundLeftTime > leftTime) {
        _allCompoundLeftTime = leftTime;
      }
      _delayTimes = { ..._delayTimes, [nftCard.id]: leftTime };
    }
    setDelayTimes(_delayTimes);
    setAllCompoundLeftTime(_allCompoundLeftTime);
  }

  const makeHHMMSS = (seconds) => {
    let hours = Math.floor(seconds / 3600);
    let mins = Math.floor((seconds % 3600) / 60);
    let sec = (seconds % 3600) % 60;
    hours = "0" + hours;
    if (mins < 10) {
      mins = "0" + mins;
    }
    if (sec < 10) {
      sec = "0" + sec;
    }
    return `${hours}:${mins}:${sec}`;
  }

  const makeTimeLabel = (leftTime, id) => {
    console.log(leftTime, id);
    let delayTimeLabel = "COMPOUND";
    if (id == "all") {
      delayTimeLabel = "";
    }
    if (leftTime > 0) {
      let seconds = Math.floor(leftTime / 1000);
      delayTimeLabel = makeHHMMSS(seconds);
      if (id == "all") {
        delayTimeLabel = `( ${delayTimeLabel} )`;
      }
    }
    return delayTimeLabel;
  }

  useEffect(() => {
    (async () => {
      if (myWeb3) {
        const _balanceof = await getTotalBalance(myWeb3, account)
        console.log('total balance', _balanceof);
        setTotalBalance(_balanceof)
        // -------------- //
        const _balanceofNFT = await getTotalBalanceNFT(myWeb3, account)
        console.log('total balance', _balanceofNFT);
        setTotalBalanceNFT(_balanceofNFT)
        // -------------- //
        const _currentTokenSupply = await getCurrentTokenSupply(myWeb3, account)
        console.log('token supply', _currentTokenSupply);
        setCurrentTokenSupply(_currentTokenSupply)
        // -------------- //
        const _totalValueLocked = await getTotalValueLocked(myWeb3, account)
        console.log('total value locked', _totalValueLocked);
        setTotalValueLocked(_totalValueLocked)
        // -------------- //
        const _totalPlanets = await getTotalPlanets(myWeb3, account)
        console.log('total value locked', _totalPlanets);
        setTotalPlanets(_totalPlanets)
        // -------------- //
        const _totalEmissionPerDay = await getTotalEmissionPerDay(myWeb3, account)
        console.log('total value locked', _totalEmissionPerDay);
        setTotalEmissionPerDay(_totalEmissionPerDay)
        // -------------- //
        const _rewardPerDay = await getRewardPerDay(myWeb3, account)
        console.log('reward per day', _rewardPerDay);
        setRewardPerDay(_rewardPerDay)
        // -------------- //
        const _creationMinPrice = await getCreationMinPrice(myWeb3, account)
        console.log('creation min price', _creationMinPrice);
        setCreationMinPrice(_creationMinPrice)
        // -------------- //

        await updatePlanetInfos();
        // -------------- //
        setInterval(() => {
          calcCompoundTimeInterval();
        }, 30000);
        // -------------- //
      }
    })()
  }, [account, myWeb3])
  return (
    <div className="main">
      <button className="my-btn connect-btn" onClick={() => connect()}>
        <div className="connect-btn-text">
          {account === '' ? 'Connect Wallet' : account}
        </div>
      </button>
      <div className="header"></div>
      <div className="header">UNIV Dashboard on Avalanche</div>
      <div className="header-sub">Claim your dividends from UNIV's interactive dashboard</div>
      <br></br>
      <div className="row board">
        <div className="col-lg-4 col-sm-12">
          <div className="item">
            <div className="item-body">
              <div className="item-name">{eval(parseInt(currentTokenSupply) / 1e18).toFixed(0)} UNIV</div>
              <div className="item-value"> Current Total Supply</div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-sm-12">
          <div className="item">
            {/* <div className="item-header">Your Total $MIM Rewards</div> */}
            <div className="item-body">
              <div className="item-name">{(balanceOfNFT)}</div>
              <div className="item-value"> My Planets</div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-sm-12">
          <div className="item">
            {/* <div className="item-header">Your $MIMap Balance</div> */}
            <div className="item-body">
              <div className="item-name">{eval(parseInt(balanceOf) / 1e18).toFixed(0)}</div>
              <div className="item-value">My UNIV Balance</div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-sm-12">
          <div className="item">
            <div className="item-body">
              <div className="item-name">{eval(parseInt(totalValueLocked) / 1e18).toFixed(0)} UNIV</div>
              <div className="item-value"> Total Value Locked</div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-sm-12">
          <div className="item">
            {/* <div className="item-header">Your Total $MIM Rewards</div> */}
            <div className="item-body">
              <div className="item-name">{(totalPlanets)}</div>
              <div className="item-value"> Total Planets</div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-sm-12">
          <div className="item">
            {/* <div className="item-header">Your $MIMap Balance</div> */}
            <div className="item-body">
              <div className="item-name">{eval(parseInt(totalEmissionPerDay) / 1e18).toFixed(0)} UNIV</div>
              <div className="item-value">Total Emission Per Day</div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-sm-12">
          <div className="item">
            <div className="item-body">
              <div className="item-name">{(Math.floor(totalPendingRewards) / Math.pow(10, 18)).toFixed(4)} UNIV</div>
              <div className="item-value"> Total Pending Rewards</div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-sm-12">
          <div className="item">
            {/* <div className="item-header">Your Total $MIM Rewards</div> */}
            <div className="item-body">
              {/* <div className="item-name">{ (balanceOfNFT)*(parseInt(creationMinPrice)/1e18)*(rewardPerDay) }</div> */}
              <div className="item-name">{eval((balanceOfNFT) * (parseInt(creationMinPrice) / 1e18) * (4 / 100)).toFixed(0)}</div>
              <div className="item-value"> Estimated Per Day</div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-sm-12">
          <div className="item">
            {/* <div className="item-header">Your $MIMap Balance</div> */}
            <div className="item-body">
              <div className="item-name">{(Math.floor(totalPlanetsValue) / Math.pow(10, 18)).toFixed(4)} UNIV</div>
              <div className="item-value">Planets Value</div>
              <div></div>
            </div>
          </div>
        </div>
        <div className="col-lg-12 col-sm-12">
          <div className="item">
            <div className="item-header">Pending $UNIV Rewards</div>
            <div className="item-body">
              <div className="item-name">{(0)}</div>
              {/* <div className="item-value">$ { eval(parseInt(pendingReward)/1e18).toFixed(3) }</div> */}
              <div className="d-flex justify-content-center">
                {/* <button className="my-btn-claim" onClick={() => claim(myWeb3, account)}>Claim Now</button> */}
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="row">
        {
          planetsInfos.length == 0 ? <div className="col-lg-12 col-sm-12"><NewPlanetBtn onClick={() => onNewNftBtn()}></NewPlanetBtn></div>
            :
            <>
              <div className="col-lg-12 col-sm-12">
                <button className="btn btn-secondary me-2" onClick={() => compoundAllHandler()} disabled={allCompoundLeftTime > 0}>Compond All {makeTimeLabel(allCompoundLeftTime, 'all')}</button>
                <button className="btn btn-secondary me-2" onClick={() => handleClaimAll()} disabled={allCompoundLeftTime > 0}>Claim Reward for All {makeTimeLabel(allCompoundLeftTime, 'all')}</button>
                <NewPlanetBtn onClick={() => onNewNftBtn()}></NewPlanetBtn>
              </div>
              {
                planetsInfos.map((nftCard, key) =>
                  <div className="col-lg-4 col-sm-12" key={key}>
                    <div className={`nft-card ${Math.floor(nftCard.planet.rewardMult)>100000?'compound':''}`}>
                      <div className="row mb-2">
                        <div className="col-4">
                          <img src={PlanetImg} className="planet" />
                        </div>
                        <div className="col-8">
                          <h4 className="mb-2">TIER {(Math.floor(nftCard.planet.rewardMult) - 100000)/1000}</h4>
                          <label>{nftCard.planet.name}</label>
                          <h3>MERCURY </h3> #{nftCard.id}
                        </div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-12">
                          <strong>LOCKED AMOUNT</strong>
                          <p>{Math.floor(nftCard.planet.planetValue) / Math.pow(10, 18)} UNIV</p>
                        </div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-12">
                          <strong>PENDING REWARDS</strong>
                          <p>{Math.floor(nftCard.pendingRewards) / Math.pow(10, 18)} UNIV</p>
                        </div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-12">
                          <strong>DAILY REWARDS</strong>
                          <p>{Math.floor(nftCard.rewardPerDay) / Math.pow(10, 18)} UNIV</p>
                        </div>
                      </div>
                      <div className="row mb-2">
                        {
                          delayTimes[nftCard.id] > 0 ? <div className="col-12">
                            <button className="btn btn-secondary form-control" disabled={delayTimes[nftCard.id] > 0} onClick={() => handleCompoundOne(nftCard.id)}>
                              {makeTimeLabel(delayTimes[nftCard.id], nftCard.id)}
                            </button>
                          </div> :
                            <>
                              <div className="col-6">
                                <button className="btn btn-secondary form-control" onClick={() => handleCompoundOne(nftCard.id)}>
                                  {makeTimeLabel(delayTimes[nftCard.id], nftCard.id)}
                                </button>
                              </div>
                              <div className="col-6">
                                <button className="btn btn-primary form-control" onClick={() => handleClaimOne(nftCard.id)}>
                                  CLAIM REWARDS
                                </button>
                              </div>
                            </>
                        }

                      </div>
                    </div>
                  </div>
                )
              }
            </>
        }
      </div>
      <Modal show={showNewPlanetModal} onHide={hideNewPlanetModal}>
        <Modal.Header closeButton>
          <Modal.Title>New Planet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            {
              newPlanet.error && <div className="alert alert-danger mb-2">
                {newPlanet.error}
              </div>
            }
          </div>
          <div className="form-group mb-2">
            <label>Name</label>
            <input name="name" value={newPlanet.name ?? ''} onChange={handleNewPlanetChange} className="form-control" />
            <small>Your name should be between 4 and 32 characters.</small>
          </div>
          <div className="form-group">
            <label>UNIV Amount</label>
            <input name="amount" value={newPlanet.amount ?? ''} onChange={handleNewPlanetChange} className="form-control" type="number" />
            <small>To generate perpetual yield, this amount will be permanently locked in the NFT. You can try with a small amount if you like.</small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={hideNewPlanetModal}>
            Close
          </Button>
          <Button variant="primary" onClick={() => onMint()}>
            Mint
          </Button>
        </Modal.Footer>
      </Modal>
    </div>

  );
}

export default App;


