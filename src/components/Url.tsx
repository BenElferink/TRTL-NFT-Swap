import Link from 'next/link'

const Url = ({ src, label }: { src: string; label: string }) => {
  return (
    <Link href={src} target='_blank' rel='noopener noreferrer' className='text-blue-400 inline-block cursor-pointer hover:scale-110 duration-300'>
      {label}
    </Link>
  )
}

export default Url
