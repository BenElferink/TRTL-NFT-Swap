const fromChain = (amount: number | string, decimals: number): number => {
  return Number(amount || 0) / Number(`1${new Array(decimals).fill(0).join('')}`)
}

const toChain = (amount: number | string, decimals: number): number => {
  return Number(amount || 0) * Number(`1${new Array(decimals).fill(0).join('')}`)
}

const formatTokenAmount = {
  fromChain,
  toChain,
}

export default formatTokenAmount
