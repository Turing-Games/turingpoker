import React from 'react';

export default function Select({
  options = [],
  selected = '',
  onChange = (param) => false,
  placeholder = 'Select an option',
}: {
  options: { label: string, value: string }[],
  selected: string,
  onChange: (param: string) => void,
  placeholder: string
}) {

  const [option, setOption] = React.useState(options.find(o => o.value === selected)?.value || options[0].value)
  const [isOpen, setIsOpen] = React.useState(false)

  const selectedOption = options.find(o => o.value === option)

  return (
    <div>
      <div
        className="p-[8px] cursor-pointer border rounded-lg w-full h-[40px]"
        onClick={() => setIsOpen(!isOpen)}
      >{selectedOption?.label || placeholder}
      </div>
      {isOpen &&
        <div className="bg-white border absolute top-[45px] left-0 shadow-md rounded-lg w-full">
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