import React from 'react'

import { useWeb3React } from '@web3-react/core';

import ERC20_ABI from 'abis/ERC20Abi.json';
import InputControlField from 'components/InputControlField'
import { GLOBAL_ADDRESS } from 'constants/contractAddress';
import { getMaxAmount, getContract } from 'utils/contract';

const AmountField = ({ control, destination }) => {

  const { account, library } = useWeb3React();

  const validate = async (amount) => {

    if (amount <= 0) {
      return 'Amount is not valid.'
    }
    let ERC20ADDRESS;

    if (destination !== "mARRR") {
      ERC20ADDRESS = GLOBAL_ADDRESS.MARRR
    } else {
      ERC20ADDRESS = GLOBAL_ADDRESS.VARRR
    }
    const tokenInstContract = getContract(ERC20ADDRESS, ERC20_ABI, library, account)
    const maxAmount = await getMaxAmount(tokenInstContract, account);
    if (maxAmount < amount) {
      return `Amount is not available in your wallet. ${maxAmount} ${destination === "mARRR" ? "vARRR" : "mARRR"}`
    }

    return true;
  }
  return (
    <InputControlField
      name="amount"
      label="Amount"
      fullWidth
      variant="standard"
      control={control}
      type="tel"
      defaultValue="0"
      min={0}
      rules={{
        required: 'Amount is required',
        validate
      }}
    />
  )
}

export default AmountField
