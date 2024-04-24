import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useWallet } from '@meshsdk/react'
import api, { BadLabsApiBaseToken, BadLabsApiPopulatedToken, BadLabsApiWallet } from '@/utils/badLabsApi'
import eachLimit from '@/functions/eachLimit'
import chunk from '@/functions/chunk'
import { OLD_POLICY_ID } from '@/constants'

interface User extends BadLabsApiWallet {
  lovelaces?: number
  tokens?: BadLabsApiPopulatedToken[]
}

interface AuthContext {
  user: User | null
  getAndSetUser: (forceStakeKey?: string) => Promise<void>
}

const initContext: AuthContext = {
  user: null,
  getAndSetUser: async () => {},
}

const AuthContext = createContext(initContext)

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = (props: PropsWithChildren) => {
  const { children } = props
  const { connecting, connected, name, wallet, disconnect } = useWallet()

  const [user, setUser] = useState<AuthContext['user']>(null)

  const getAndSetUser = useCallback(
    async (forceStakeKey?: string): Promise<void> => {
      try {
        let sKey = ''
        let lovelaces = 0

        if (forceStakeKey) {
          sKey = forceStakeKey
        } else {
          const stakeKeys = await wallet.getRewardAddresses()
          sKey = stakeKeys[0]
          lovelaces = Number(await wallet.getLovelace())
        }

        const { addresses, tokens } = await api.wallet.getData(sKey, {
          withTokens: true,
        })

        const populatedTokens: BadLabsApiPopulatedToken[] = []

        await eachLimit<BadLabsApiBaseToken[]>(chunk<BadLabsApiBaseToken>(tokens || [], 10), 10, async (items) => {
          for await (const { tokenId, tokenAmount } of items) {
            if (tokenId.indexOf(OLD_POLICY_ID) === 0) {
              try {
                const fetchedToken = await api.token.getData(tokenId)

                populatedTokens.push({
                  ...fetchedToken,
                  tokenAmount,
                })
              } catch (error: any) {
                if (error.code === 'ECONNRESET') {
                  console.error('Connection reset error.')
                } else {
                  console.error(error.message)
                }
              }
            }
          }
        })

        setUser({
          stakeKey: sKey,
          addresses,
          lovelaces,
          tokens: populatedTokens.filter((x) => !!x),
        })
      } catch (error: any) {
        setUser(null)
        disconnect()

        toast.dismiss()
        toast.error(error.message || error.toString())
      }
    },
    [name, wallet, user, disconnect]
  )

  useEffect(() => {
    if (connected && !user) {
      toast.success(`Connected ${name}`)
      toast.loading('Loading Wallet')

      getAndSetUser().then(() => {
        toast.dismiss()
        toast.success('Wallet Loaded')
      })
    } else if (!connected) {
      setUser(null)
    }
  }, [connecting, connected, user, getAndSetUser])

  return (
    <AuthContext.Provider
      value={{
        user,
        getAndSetUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
