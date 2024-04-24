import { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react'

const Button: (props: {
  label?: string
  icon?: ForwardRefExoticComponent<
    Omit<SVGProps<SVGSVGElement>, 'ref'> & {
      title?: string | undefined
      titleId?: string | undefined
    } & RefAttributes<SVGSVGElement>
  >
  onClick?: () => void
  disabled?: boolean
}) => JSX.Element = (props) => {
  const { label = 'Click', icon: Icon, onClick, disabled } = props

  return (
    <button
      type='button'
      disabled={disabled}
      onClick={() => !!onClick && onClick()}
      className='button w-40 h-16 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed select-none transition-all duration-150 bg-blue-500 rounded-full border-[1px] border-blue-400 active:border-b-[0px] [box-shadow:0_10px_0_0_#1b6ff8,0_15px_0_0_#1b70f841] active:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841] active:translate-y-2'
    >
      {Icon ? <Icon className='w-8 h-8 mr-2' /> : null}
      <span className='h-full flex flex-col items-center justify-center text-white text-lg font-bold'>{label}</span>
    </button>
  )
}

export default Button
