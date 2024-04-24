export const ADA_SYMBOL = '₳'
export const ONE_MILLION = 1000000
export const DECIMALS = {
  ADA: 6,
}

export const OLD_POLICY_ID = '263eb3e3c980c15305f393dc7a2f6289ba12732b6636efe46d6e2c16'
export const NEW_POLICY_ID = '4c1e0a4bcdd31f9e0dcdb62c8e7ce2dc69265078f41663ed8ab66816'

export const TEAM_WALLET_ADDRESS = 'addr1qx77evuery6s5taffnmg72caf0srne8p4lwemv7c45wag39xtcpgwp9h4hnhe4u8rd673uet6qdjvzynpaq8x99nerdqr2sajs'
export const DEV_WALLET_ADDRESS = 'addr1q9knw3lmvlpsvemjpgmkqkwtkzv8wueggf9aavvzyt2akpw7nsavexls6g59x007aucn2etqp2q4rd0929z2ukcn78fslm56p9'
export const MINT_WALLET_ADDRESS = 'addr1v9ttkfs54sscs5fl4amhpsxu3dk852654hfskg4qjsu5mgcxu36dr'
export const MINT_WALLET_MNEMONIC = Array.isArray(process.env.MINT_WALLET_MNEMONIC)
  ? process.env.MINT_WALLET_MNEMONIC
  : process.env.MINT_WALLET_MNEMONIC?.split(',') || []

export const BLOCKFROST_API_KEY = process.env.BLOCKFROST_API_KEY || ''

export const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ''
export const FIREBASE_APP_ID = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
export const FIREBASE_AUTH_DOMAIN = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || ''
export const FIREBASE_MESSAGING_SENDER_ID = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || ''
export const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ''
export const FIREBASE_STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || ''
