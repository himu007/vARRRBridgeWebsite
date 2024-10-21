import React from 'react'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery';
import useSWR from 'swr'
import { VerusdRpcInterface } from 'verusd-rpc-ts-client'

import { GLOBAL_IADDRESS } from 'constants/contractAddress';

import { ReactComponent as Chevron } from '../../images/icons/chevron-icon.svg'

const CoinGeckoVRSC = 'https://api.coingecko.com/api/v3/coins/verus-coin'

const urls = [CoinGeckoVRSC]

const verusd = new VerusdRpcInterface(GLOBAL_IADDRESS.VRSC, process.env.REACT_APP_VERUS_RPC_URL)

const blockNumber = process.env.REACT_APP_VERUS_END_BLOCK || '0'

let conversions = [
  { symbol: 'vrsc', price: 0 },
  { symbol: 'superVRSC', price: 0 }
]

const fetchConversion = async () => {
  const res = await verusd.getCurrency('supervrsc');
  const supernetpriceinvrsc = await verusd.estimateConversion({ amount: 1, currency: 'supernet', convertto: 'vrsc', via: 'supervrsc' });
  const supervrscpriceinvrsc = await verusd.estimateConversion({ amount: 1, currency: 'supervrsc', convertto: 'vrsc' });
  const vrscindai = await verusd.estimateConversion({ amount: 1, currency: 'vrsc', convertto: 'dai.veth', via: 'bridge.veth' });
  const info = await verusd.getInfo()
  const block = info.result.longestchain

  const bestState = res.result.bestcurrencystate
  const currencyNames = res.result.currencynames
  const currencies = bestState.reservecurrencies

  const { supply } = bestState
  const blockdiff = blockNumber - block
  // const daiKey = Object.keys(res?.result?.currencynames).find((key) => currencyNames !== undefined && currencyNames[key] === 'DAI.vETH')
  // const daiAmount = currencies.find(c => c.currencyid === daiKey).reserves

  let list = currencies.map((token) => ({
    name: currencyNames[token.currencyid],
    amount: token.reserves, daiPrice: currencyNames[token.currencyid] === "VRSC" ? vrscindai.result.estimatedcurrencyout : (supernetpriceinvrsc.result.estimatedcurrencyout * vrscindai.result.estimatedcurrencyout)
  }))
  const superVRSC = { name: 'SuperVRSC', amount: supply, daiPrice: supervrscpriceinvrsc.result.estimatedcurrencyout * vrscindai.result.estimatedcurrencyout }


  try {
    conversions = await Promise.all(
      urls.map(async (url) => fetch(url)
        .then((res) => res.json())
        .then((c) => ({
          symbol: c.symbol,
          price: c.market_data.current_price.usd
        })))
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('%s: fetching prices %s', Date().toString(), error.message)
  }
  list = list.map((token) => {
    switch (token.name) {
      case 'VRSCTEST':
      case 'VRSC':
        return {
          ...token,
          price: conversions.find((c) => c.symbol === 'vrsc')?.price
        }
      case 'SUPERNET':
        return {
          ...token,
          price: vrscindai.result.estimatedcurrencyout * supernetpriceinvrsc.result.estimatedcurrencyout
        }
      // return { ...token, price: vrscPrice }
      default:
        return { ...token }
    }
  })
  return { list, superVRSC, blockdiff, currencies }
}

const StatsGrid = () => {

  const isMobile = useMediaQuery(theme => theme.breakpoints.down('sm'));

  const { data: conversionList } = useSWR("fetchConversion", fetchConversion, {
    refreshInterval: 60_000 // every minute
  })

  if (!conversionList) return null

  return (
    <>
      <Grid container className="blueRowTitle" >
        <Grid item xs={5}><Typography sx={{ fontSize: isMobile ? '10px' : '14px', fontWeight: 'bold' }}>Liquidity pool</Typography></Grid>

        <Grid item xs={2} textAlign="right"><Typography sx={{ fontSize: isMobile ? '10px' : '14px', fontWeight: 'bold' }}>Supply</Typography></Grid>
        <Grid item xs={5} textAlign="right"><Typography sx={{ fontSize: isMobile ? '10px' : '14px', fontWeight: 'bold' }}>Price in DAI</Typography></Grid>

      </Grid>

      <Grid container className='blueRow' mb={5}>
        <Grid item xs={5}><Typography sx={{ fontSize: isMobile ? '10px' : '14px', color: '#3165d4', fontWeight: 'bold' }}>SuperVRSC</Typography></Grid>
        <Grid item xs={2} textAlign="right"><Typography sx={{ fontSize: isMobile ? '10px' : '14px', color: '#3165d4', fontWeight: 'bold' }}> {Intl.NumberFormat('en-US', {
          style: 'decimal',
          maximumFractionDigits: 0
        }).format(conversionList.superVRSC.amount)}</Typography></Grid>
        <Grid item xs={5} textAlign="right"><Typography sx={{ fontSize: isMobile ? '10px' : '14px', color: '#3165d4', fontWeight: 'bold' }}>{Intl.NumberFormat('en-US', {
          style: 'decimal',
          maximumFractionDigits: 3,
          minimumFractionDigits: 3
        }).format(conversionList.superVRSC.daiPrice)}</Typography></Grid>
      </Grid>

      <Grid container className="blueRowTitle" justifyContent="space-between">
        <Grid item xs={3} textAlign="left"><Typography sx={{ fontSize: isMobile ? '10px' : '14px', fontWeight: 'bold' }}>SuperVRSC<br />reserve currencies</Typography></Grid>
        <Grid item xs={2} textAlign="right"><Typography sx={{ fontSize: isMobile ? '10px' : '14px', fontWeight: 'bold' }}>in reserves</Typography></Grid>
        <Grid item xs={2} textAlign="right" sx={{ ml: 1 }}><Typography sx={{ fontSize: isMobile ? '10px' : '14px', fontWeight: 'bold' }}>Price in DAI</Typography></Grid>
        <Grid item xs={2} textAlign="right" ><Typography sx={{ fontSize: isMobile ? '10px' : '14px', fontWeight: 'bold' }}>Compared to<br />CoinGecko</Typography></Grid>
      </Grid>
      {conversionList.list && conversionList.list.map((token) => {
        const dollarPrice = token.daiPrice;
        // eslint-disable-next-line no-nested-ternary
        const rate = dollarPrice < token.price ? 'less' : dollarPrice > token.price ? 'greater' : 'equal'
        const percent = Math.abs(dollarPrice / token.price) - 1

        return (
          <Grid container className="blueRow" key={token.name} justifyContent="space-between">
            <Grid item xs={3}><Typography sx={{ fontSize: isMobile ? '10px' : '14px', color: '#3165d4', fontWeight: 'bold' }}>{token.name}</Typography></Grid>
            <Grid item xs={2} textAlign="right">
              <Typography sx={{ fontSize: isMobile ? '10px' : '14px', color: 'rgba(49, 101, 212, 0.59)', fontWeight: 'bold' }}>
                {Intl.NumberFormat('en-US', {
                  style: 'decimal',
                  maximumFractionDigits: 3,
                  minimumFractionDigits: 3
                }).format(token.amount)}
              </Typography>
            </Grid>
            <Grid item xs={2} textAlign="right" sx={{ ml: 2 }}>
              <Typography sx={{ fontSize: isMobile ? '10px' : '14px', color: '#3165d4', fontWeight: 'bold' }}>
                {Intl.NumberFormat('en-US', {
                  style: 'decimal',
                  maximumFractionDigits: 3,
                  minimumFractionDigits: 2
                }).format(token.daiPrice)}
              </Typography></Grid>
            <Grid item xs={2} textAlign="right" >
              <Typography className={rate} noWrap sx={{ fontSize: isMobile ? '10px' : '14px' }}>
                <Chevron />
                {Intl.NumberFormat('en-US', {
                  style: 'percent',
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2
                }).format(Math.abs(percent))}</Typography></Grid>
          </Grid >
        )
      })}
      <Grid container className='white' mb={2}> </Grid>
      <Grid container className='blueRow' mb={2}>
        <Grid item xs={8}><Typography sx={{ fontSize: isMobile ? '10px' : '14px', color: '#3165d4', fontWeight: 'bold' }}>Total Value of Liquidity</Typography></Grid>

        <Grid item xs={4} textAlign="right"><Typography sx={{ fontSize: isMobile ? '10px' : '14px', color: '#3165d4', fontWeight: 'bold' }}>{Intl.NumberFormat('en-US', {
          style: 'decimal',
          maximumFractionDigits: 3,
          minimumFractionDigits: 3
        }).format(conversionList.superVRSC.daiPrice * conversionList.superVRSC.amount)} DAI</Typography></Grid>

      </Grid>
      <Typography> Note: DAI prices are converted using Bridge.vETH </Typography>
    </>
  )
}

export default StatsGrid
