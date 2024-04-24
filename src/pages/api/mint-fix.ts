import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { firestore } from '@/utils/firebase'
import sleep from '@/functions/sleep'

export const config = {
  maxDuration: 300,
  api: {
    responseLimit: false,
  },
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req

  try {
    switch (method) {
      case 'GET': {
        const now = new Date().getTime()
        const waitTime = 900000

        const collection = firestore.collection('turtle-syndicate-swaps')
        const { docs } = await collection.get()

        const swaps = docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as (DbPayload & { id: string })[]

        const swapsThatNeedToMint = swaps.filter((doc) => !doc.didMint && doc.didBurn && now - doc.timestamp >= waitTime)
        // const swapsThatNeedToDelete = swaps.filter((doc) => !doc.didMint && !doc.didBurn && now - doc.timestamp >= waitTime)

        if (swapsThatNeedToMint.length) {
          console.warn(`found ${swapsThatNeedToMint.length} swaps that need to mint`)

          for await (const { id } of swapsThatNeedToMint) {
            await axios.post('https://turtle-syndicate-swap.vercel.app/api/mint', { docId: id })
            await sleep(2000)
          }
        }

        // if (swapsThatNeedToDelete.length) {
        // }

        return res.status(204).end()
      }

      default: {
        res.setHeader('Allow', 'GET')
        return res.status(405).end()
      }
    }
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

export default handler
