import React from 'react'

import SelectControlField from 'components/SelectControlField'


const DestinationField = ({ control }) => {

  const TokenOptions = [{ label: "vARRR", value: "vARRR" }, { label: "mARRR", value: "mARRR" }]
  const validate = (destination) => {
    if (!destination) return "Destination is required"
    return true;
  }

  return (
    <SelectControlField
      name="Swap to"
      id="destination"
      label="Swap to"
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
