import type { NextApiRequest, NextApiResponse } from 'next'
import { AppWallet, BlockfrostProvider, ForgeScript, Mint, Transaction } from '@meshsdk/core'
import { firestore } from '@/utils/firebase'
import badLabsApi from '@/utils/badLabsApi'
import formatHex from '@/functions/formatHex'
import { BLOCKFROST_API_KEY, MINT_WALLET_MNEMONIC, NEW_POLICY_ID } from '@/constants'

export const config = {
  maxDuration: 300,
  api: {
    responseLimit: false,
  },
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, body } = req

  try {
    switch (method) {
      case 'POST': {
        const { docId } = body

        const assetCollection = firestore.collection('turtle-syndicate-assets')
        const assetDocs = await assetCollection.get()
        const swapCollection = firestore.collection('turtle-syndicate-swaps')
        const swapDoc = await swapCollection.doc(docId).get()

        if (!swapDoc.exists) throw new Error('Doc ID is invalid')

        const { address, amount, didBurn, didMint } = swapDoc.data() as DbPayload

        if (!amount) throw new Error('User does not have mint amount')
        if (!didBurn) throw new Error('User did not complete burn TX')
        if (didMint) throw new Error('Already completed mint for this record')

        const _provider = new BlockfrostProvider(BLOCKFROST_API_KEY)
        const _wallet = new AppWallet({
          networkId: 1,
          fetcher: _provider,
          submitter: _provider,
          key: {
            type: 'mnemonic',
            words: MINT_WALLET_MNEMONIC,
          },
        })

        const _address = _wallet.getPaymentAddress()
        const _script = ForgeScript.withOneSignature(_address)
        const _tx = new Transaction({ initiator: _wallet })

        const docsToDelete: string[] = []

        const getRandomDoc = (): Mint => {
          const idx = Math.floor(Math.random() * (assetDocs.docs.length + 1))
          const doc = assetDocs.docs[idx]
          const docData = doc?.data() as Mint | undefined

          if (!docData) return getRandomDoc()

          docsToDelete.push(doc.id)

          return docData
        }

        const getNonMintedDoc = async (): Promise<Mint> => {
          const doc = getRandomDoc()

          try {
            const tokenId = `${NEW_POLICY_ID}${formatHex.toHex(doc.assetName)}`
            const foundToken = await badLabsApi.token.getData(tokenId)

            if (!!foundToken) {
              console.error(`Already minted this token: ${tokenId}`)

              return await getNonMintedDoc()
            }
          } catch (error) {
            // Token not found: THIS IS OK!
          }

          return doc
        }

        for (let i = 0; i < amount; i++) {
          const mintThis = await getNonMintedDoc()

          const mintPayload: Mint = {
            ...mintThis,
            recipient: address,
          }

          _tx.mintAsset(_script, mintPayload)
        }

        console.log(`minting: ${amount}`)

        const _unsigTx = await _tx.build()
        const _sigTx = await _wallet.signTx(_unsigTx)
        const _txHash = await _wallet.submitTx(_sigTx)

        console.log(`minted: ${_txHash}`)
        console.log(`updating doc in DB: ${swapDoc.id}`)

        await swapCollection.doc(swapDoc.id).update({
          didMint: true,
        })

        console.log(`updated doc in DB: ${swapDoc.id}`)
        console.log(`deleting batch (${docsToDelete.length}) from DB`)

        const batch = firestore.batch()
        docsToDelete.forEach((id) => batch.delete(assetCollection.doc(id)))
        await batch.commit()

        console.log(`deleted batch (${docsToDelete.length}) from DB`)

        return res.status(200).json({
          txHash: _txHash,
        })
      }

      default: {
        res.setHeader('Allow', 'POST')
        return res.status(405).end()
      }
    }
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

export default handler
