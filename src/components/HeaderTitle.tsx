import React from 'react'

const HeaderTitle = ({title}:any) => {
  return (
    <div className='bg-[#F3F4F6] w-full py-3 px-4 text-lg font-bold text-primaryDark select-none'>
    {title}
    </div>
  )
}

export default HeaderTitle