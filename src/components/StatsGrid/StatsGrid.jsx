import React from 'react'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import useSWR from 'swr'
import { VerusdRpcInterface } from 'verusd-rpc-ts-client'

import { GLOBAL_IADDRESS } from 'constants/contractAddress';

import { ReactComponent as Chevron } from '../../images/icons/chevron-icon.svg'

const CoinGeckoVRSC = 'https://api.coingecko.com/api/v3/coins/verus-coin'
const CoinGeckoETH = 'https://api.coingecko.com/api/v3/coins/ethereum'
const CoinGeckotBTC = 'https://api.coingecko.com/api/v3/coins/tbtc'
const CoinGeckoARRR = 'https://api.coingecko.com/api/v3/coins/pirate-chain'

const urls = [CoinGeckoVRSC, CoinGeckoETH, CoinGeckotBTC, CoinGeckoARRR]

const verusd = new VerusdRpcInterface(GLOBAL_IADDRESS.VRSC, process.env.REACT_APP_VERUS_RPC_URL)

const blockNumber = process.env.REACT_APP_VERUS_END_BLOCK || '0'

const getDetails = (res) => {
  const bestState = res.result.bestcurrencystate
  const currencyNames = res.result.currencynames
  const currencies = bestState.reservecurrencies
  const count = currencies.length
  const { supply } = bestState

  return { bestState, currencyNames, count, supply }
}



const fetchConversion = async () => {
  const res = await verusd.getCurrency('bridge.varrr');
  const vrscbridge = await verusd.getCurrency('bridge.veth')
  const info = await verusd.getInfo()

  const vrscbridgedetails = getDetails(vrscbridge);

  const block = info.result.longestchain

  const bestState = res.result.bestcurrencystate
  const currencyNames = res.result.currencynames
  const currencies = bestState.reservecurrencies
  const count = currencies.length
  const { supply } = bestState
  const blockdiff = blockNumber - block
  const tbtcKey = Object.keys(res?.result?.currencynames).find((key) => currencyNames !== undefined && currencyNames[key] === 'tBTC.vETH')
  const tbtcAmount = currencies.find(c => c.currencyid === tbtcKey).reserves

  let list = currencies.map((token) => ({ name: currencyNames[token.currencyid], amount: token.reserves, tbtcPrice: tbtcAmount / token.reserves }))
  const bridge = { name: 'Bridge.vARRR', amount: supply, tbtcPrice: (tbtcAmount * count) / supply }

  let conversions = [
    { symbol: 'vrsc', price: 0 },
    { symbol: 'eth', price: 0 },
    { symbol: 'tBTC', price: 0 },
    { symbol: 'arrr', price: 0 }
  ]

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
          price:
            conversions.find((c) => c.symbol === 'vrsc')?.price
        }
      case 'Bridge.vETH':
        return {
          ...token,
          price: conversions.find((c) => c.symbol === 'bridge')?.price
        }
      case 'vARRR':
        return {
          ...token,
          price: conversions.find((c) => c.symbol === 'arrr')?.price
        }
      case 'tBTC.vETH':
        return {
          ...token,
          price: conversions.find((c) => c.symbol === 'tbtc')?.price
        }
      // return { ...token, price: vrscPrice }
      default:
        return { ...token }
    }
  })
  return { list, bridge, blockdiff, currencies }
}

const StatsGrid = () => {

  const { data: conversionList } = useSWR("fetchConversion", fetchConversion, {
    refreshInterval: 60_000 // every minute
  })

  if (!conversionList) return null

  return (
    <>
      <Grid container className="blueRowTitle" >
        <Grid item xs={4}><Typography sx={{ fontSize: '12px', fontWeight: 'bold' }}>Liquidity pool</Typography></Grid>

        <Grid item xs={4} textAlign="right"><Typography sx={{ fontSize: '12px', fontWeight: 'bold' }}>Supply</Typography></Grid>
        <Grid item xs={4} textAlign="right"><Typography sx={{ fontSize: '12px', fontWeight: 'bold' }}>Price in tBTC</Typography></Grid>
      </Grid>

      <Grid container className='blueRow' mb={5}>
        <Grid item xs={4}><Typography sx={{ color: '#3165d4', fontWeight: 'bold' }}>{conversionList.bridge.name}</Typography></Grid>
        <Grid item xs={4} textAlign="right"><Typography sx={{ color: '#3165d4', fontWeight: 'bold' }}> {Intl.NumberFormat('en-US', {
          style: 'decimal',
          maximumFractionDigits: 0
        }).format(conversionList.bridge.amount)}</Typography></Grid>
        <Grid item xs={4} textAlign="right"><Typography sx={{ color: '#3165d4', fontWeight: 'bold' }}>{Intl.NumberFormat('en-US', {
          style: 'decimal',
          maximumFractionDigits: 8,
          minimumFractionDigits: 3
        }).format(conversionList.bridge.tbtcPrice)}</Typography></Grid>
      </Grid>

      <Grid container className="blueRowTitle" >
        <Grid item xs={3}><Typography sx={{ fontSize: '12px', fontWeight: 'bold' }}>Bridge.vETH<br />reserve currencies</Typography></Grid>
        <Grid item xs={3} textAlign="right"><Typography sx={{ fontSize: '12px', fontWeight: 'bold' }}>in reserves</Typography></Grid>
        <Grid item xs={3} textAlign="right"><Typography sx={{ fontSize: '12px', fontWeight: 'bold' }}>Price in tBTC</Typography></Grid>
        <Grid item xs={3} textAlign="right"><Typography sx={{ fontSize: '12px', fontWeight: 'bold' }}>Compared to<br />CoinGecko</Typography></Grid>
      </Grid>
      {conversionList.list && conversionList.list.map((token) => {
        // eslint-disable-next-line no-nested-ternary
        const rate = token.tbtcPrice < token.price ? 'less' : token.tbtcPrice > token.price ? 'greater' : 'equal'
        const percent = Math.abs((token.tbtcPrice * conversionList.list[3].price) / token.price) - 1

        return (
          <Grid container className="blueRow" key={token.name}>
            <Grid item xs={3}><Typography sx={{ color: '#3165d4', fontWeight: 'bold' }}>{token.name}</Typography></Grid>
            <Grid item xs={3} textAlign="right">
              <Typography sx={{ color: 'rgba(49, 101, 212, 0.59)', fontWeight: 'bold' }}>
                {Intl.NumberFormat('en-US', {
                  style: 'decimal',
                  maximumFractionDigits: 3,
                  minimumFractionDigits: 3
                }).format(token.amount)}
              </Typography>
            </Grid>
            <Grid item xs={3} textAlign="right">
              <Typography sx={{ color: '#3165d4', fontWeight: 'bold' }}>
                {Intl.NumberFormat('en-US', {
                  style: 'decimal',
                  maximumFractionDigits: 8,
                  minimumFractionDigits: 2
                }).format(token.tbtcPrice)}
              </Typography></Grid>
            <Grid item xs={3} textAlign="right">
              <Typography className={rate} noWrap>
                <Chevron />
                {Intl.NumberFormat('en-US', {
                  style: 'percent',
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2
                }).format(Math.abs(percent))}</Typography></Grid>
          </Grid >
        )
      })}
      <Grid container className='white' mb={5}> </Grid>
      <Grid container className='blueRow' mb={5}>
        <Grid item xs={6}><Typography sx={{ color: '#3165d4', fontWeight: 'bold' }}>Total Value of Liquidity</Typography></Grid>

        <Grid item xs={6} textAlign="right"><Typography sx={{ color: '#3165d4', fontWeight: 'bold' }}>{Intl.NumberFormat('en-US', {
          style: 'decimal',
          maximumFractionDigits: 3,
          minimumFractionDigits: 3
        }).format(conversionList.bridge.tbtcPrice * conversionList.bridge.amount)} tBTC</Typography></Grid>
      </Grid>
    </>
  )
}

export default StatsGrid
