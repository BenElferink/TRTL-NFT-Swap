import type { NextApiRequest, NextApiResponse } from 'next'
import { Mint } from '@meshsdk/core'
import { firestore } from '@/utils/firebase'
import badLabsApi from '@/utils/badLabsApi'
import formatHex from '@/functions/formatHex'
import { NEW_POLICY_ID } from '@/constants'
import file from './raw-metadata.json'

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
        const collectionName = 'turtle-syndicate-assets'
        const collection = firestore.collection(collectionName)

        const { docs } = await collection.get()

        if (docs.length) return res.status(400).end(`Please delete ${collectionName} from DB 1st`)

        const allMintItems: Mint[] = []
        const newMintItems: Mint[] = []

        for (let i = 0; i < (file as any[]).length; i++) {
          Object.entries((file as any[])[i]['721']['<policy_id>']).forEach(([k, v]: [string, any]) => {
            if (k !== 'version') {
              const assetName = k

              const ipfsRef = (Array.isArray(v['image']) ? v['image'].join('') : v['image']).replace('<', '').replace('>', '')
              let ipfsRefSplit: string[] = []

              if (ipfsRef.length > 64) {
                for (let i = 0; true; i += 64) {
                  const s = ipfsRef.substring(i, i + 64)

                  if (!s.length) break

                  ipfsRefSplit.push(s)
                }
              }

              const storyStr = Array.isArray(v['story']) ? v['story'].join('') : v['story']
              let storySplit: string[] = []

              if (storyStr.length > 64) {
                for (let i = 0; true; i += 64) {
                  const s = storyStr.substring(i, i + 64)

                  if (!s.length) break

                  storySplit.push(s)
                }
              }

              const mintPayload: Mint = {
                label: '721',
                assetQuantity: '1',
                recipient: '',
                assetName,
                metadata: {
                  project: 'Turtle Syndicate',
                  collection: 'Turtles',
                  name: v['name'],

                  image: ipfsRefSplit.length ? ipfsRefSplit : ipfsRef,
                  mediaType: 'image/png',
                  files: [
                    {
                      mediaType: 'image/png',
                      name: v['name'],
                      src: ipfsRefSplit.length ? ipfsRefSplit : ipfsRef,
                    },
                  ],

                  website: 'https://theturtlesyndicate.online/',
                  Story: storySplit,
                  Background: v['Background'],
                  Body: v['Body'],
                  Shell: v['Shell'],
                  Clothes: v['Clothes'],
                  Hand: v['Hand'],
                  Head: v['Head'],
                  'Eyes and Mouth': v['Eyes and Mouth'],
                  'Special Ability': v['Special Ability'],
                  'Villains Killed': v['Villains Killed'],
                  Attack: v['Attack'],
                  Defense: v['Defense'],
                  Speed: v['Speed'],
                  Potential: v['Potential'],
                  Luck: v['Luck'],
                },
              }

              allMintItems.push(mintPayload)
            }
          })
        }

        for await (const item of allMintItems) {
          let isExist = false

          try {
            const tokenId = `${NEW_POLICY_ID}${formatHex.toHex(item.assetName)}`
            const foundToken = await badLabsApi.token.getData(tokenId)

            isExist = !!foundToken
          } catch (error) {
            // Token not found: THIS IS OK!
          }

          if (!isExist) newMintItems.push(item)
        }

        for await (const item of newMintItems) await collection.add(item)

        return res.status(201).json({
          count: newMintItems.length,
          items: newMintItems,
        })
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
