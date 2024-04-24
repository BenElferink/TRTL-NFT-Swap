interface DbPayload {
  timestamp: number
  address: string
  amount: number
  amountMinted?: number
  didBurn: boolean
  didMint: boolean
}
