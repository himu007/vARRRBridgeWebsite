import React, { useState } from 'react'

import { AppBar, Toolbar, Typography } from '@mui/material'
import { useWeb3React } from '@web3-react/core';

import { TESTNET } from "constants/contractAddress";

import ConnectButton from './ConnectButton'
import WalletConnectDialog from './WalletConnectDialog';
import { injectedConnector } from '../connectors/injectedConnector';
import Swap from '../images/logos/swappirate.png'

const Header = () => {
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const { account, activate, deactivate } = useWeb3React();

  const handleClickConnect = () => {
    if (account) {
      deactivate();
    } else {
      setWalletDialogOpen(true)
    }
  }

  const handleConfirm = async () => {
    await activate(injectedConnector);
    setWalletDialogOpen(false);
  }

  return (
    <AppBar
      position="absolute"
      color="default"
      elevation={0}
      sx={{
        position: 'relative',
        borderBottom: (t) => `1px solid ${t.palette.divider}`
      }}
    >
      <Toolbar>
        <img width="80px" alt="logo" style={{ cursor: "pointer" }} src={Swap} />


      </Toolbar>
    </AppBar>
  )
}

export default Header
