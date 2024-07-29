import Toggle from 'react-toggle'
import "react-toggle/style.css"

export default function Toggle({
  defaultChecked = false,
  checked,
  label = '',
  value = '',
  onChange,
  direction = 'column'
}: {
  defaultChecked?: boolean,
  checked?: boolean,
  label?: string,
  value?: string,
  onChange?: (e: any) => void,
  direction?: 'column' | 'row'
}) {
  return (
    <div
      className="flex"
      style={{
        flexDirection: direction
      }}
    >
      <label htmlFor={value}>{label}</label>
      <Toggle
        id={value}
        defaultChecked={defaultChecked}
        checked={checked}
      />
    </div>
  )
}