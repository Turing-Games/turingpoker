import { ChevronDownIcon } from '@radix-ui/themes';
import React from 'react';

export default function Select({
  options = [],
  selected = '',
  onChange = (param) => false,
  placeholder = 'Select an option',
  width = 200
}: {
  options: { label: string, value: string }[],
  selected: string,
  onChange: (param: string) => void,
  placeholder: string
  width?: number | string
}) {

  const [option, setOption] = React.useState(options.find(o => o.value === selected)?.value || options[0].value)
  const [isOpen, setIsOpen] = React.useState(false)

  const selectedOption = options.find(o => o.value === option)

  return (
    <div className="relative">
      <div
        className="flex items-center gap-[6px] justify-between bg-white p-[8px] cursor-pointer border rounded-lg w-full h-[40px]"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: width
        }}
      >
        {selectedOption?.label || placeholder}
        <ChevronDownIcon />
      </div>
      {isOpen &&
        <div
          className="bg-white border absolute top-[45px] left-0 shadow-md rounded-lg w-full z-10"
          style={{
            width: width
          }}
        >
          {options.map(option => (
            <div
              key={option.value}
              className="w-full p-[8px] hover:bg-gray-100 cursor-pointer w-full"
              onClick={() => {
                setOption(option.value)
                if (onChange) {
                  onChange(option.value)
                }
                setIsOpen(false)
              }}
            >{option.label}</div>
          ))}
        </div>
      }
    </div>
  )
}