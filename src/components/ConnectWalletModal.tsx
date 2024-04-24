import Image from 'next/image'
import toast from 'react-hot-toast'
import { useWallet, useWalletList } from '@meshsdk/react'
import { FaceFrownIcon } from '@heroicons/react/24/solid'
import Modal from './Modal'

const ConnectWalletModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const installedWallets = useWalletList()
  const { connect, disconnect, connecting, connected, error } = useWallet()

  return (
    <Modal open={isOpen} onClose={() => onClose()}>
      {!installedWallets.length ? (
        <p className='mt-[50%] text-center text-lg'>
          No wallets installed... <FaceFrownIcon className='inline w-8 h-8' />
        </p>
      ) : (
        <div className='max-w-[1024px] mx-auto text-center'>
          <h2 className='text-lg'>Connect Wallet</h2>

          {/* @ts-ignore */}
          {error ? <p className='text-red-400'>{error?.message || error?.toString()}</p> : null}

          {installedWallets.map(({ name, icon }) => (
            <button
              key={name}
              onClick={() => connect(name)}
              disabled={connected || connecting}
              className='w-full max-w-[420px] my-2 mx-auto p-4 flex items-center justify-between rounded-lg bg-zinc-700 bg-opacity-70 hover:bg-zinc-600 hover:bg-opacity-70 disabled:opacity-40'
            >
              <Image src={icon} alt='' width={35} height={35} className='drop-shadow-[0_0_1px_rgba(0,0,0,1)]' priority unoptimized />
              {name.toUpperCase().replace('WALLET', '').trim()}
            </button>
          ))}

          {connected ? (
            <div className='max-w-[calc(420px+0.5rem)] mx-auto'>
              <button
                onClick={() => {
                  disconnect()
                  toast.success('Disconnected')
                }}
                disabled={!connected || connecting}
                className='w-full max-w-[420px] my-2 mx-auto p-4 flex items-center justify-center rounded-lg bg-zinc-700 bg-opacity-70 hover:bg-zinc-600 hover:bg-opacity-70 disabled:opacity-40'
              >
                DISCONNECT
              </button>
            </div>
          ) : null}
        </div>
      )}
    </Modal>
  )
}

export default ConnectWalletModal
