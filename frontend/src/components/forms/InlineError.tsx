import { FunctionComponent, HTMLAttributes } from 'react'

const InlineError: FunctionComponent<HTMLAttributes<HTMLElement>> = ({
  children,
  ...otherProps
}) => {
  return (
    <small {...otherProps} className="flex text-sm text-red-700 my-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        className="fill-current w-5 h-5 mr-1"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      {children}
    </small>
  )
}

export default InlineError
