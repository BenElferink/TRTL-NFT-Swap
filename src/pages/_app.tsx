import Head from 'next/head'
import { AppProps } from 'next/app'
import { Fragment } from 'react'
import { Toaster } from 'react-hot-toast'
import { MeshProvider } from '@meshsdk/react'
import { AuthProvider } from '@/contexts/AuthContext'
import '@/styles/globals.css'

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <Fragment>
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <meta name='author' content='Ben Elferink' />

        <meta name='description' content='' />

        <link rel='icon' type='image/x-icon' href='/favicon.ico' />
        <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
        <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
        <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
        <link rel='manifest' href='/manifest.json' />

        <title>TRTL | NFT Swap</title>
      </Head>

      <Toaster />

      <main className='w-screen min-h-screen bg-black/30'>
        <MeshProvider>
          <AuthProvider>
            <Component {...pageProps} />
          </AuthProvider>
        </MeshProvider>
      </main>
    </Fragment>
  )
}

export default App
