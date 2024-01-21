import React from 'react'

import SelectControlField from 'components/SelectControlField'
import { getDestinationOptions } from 'utils/options'

const DestinationField = ({ control, poolAvailable, address, selectedToken }) => {

  const { value, name } = selectedToken || {};
  const TokenOptions = [{ label: "vARRR", value: "vARRR" }, { label: "mARRR", value: "mARRR" }]
  const validate = (destination) => {
    if (!destination) return "Destination is required"
    return true;
  }

  return (
    <SelectControlField
      name="destination"
      id="destination"
      label="Destination"
      fullWidth
      defaultValue=""
      variant="standard"
      control={control}
      options={TokenOptions}
      rules={{
        required: 'Destination is required',
        validate

      }}
    />
  )
}
export default DestinationField
