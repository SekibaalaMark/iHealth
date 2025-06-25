import React from 'react'

const SideBarItem = ({Icon, text}) => {
  return (
    <div>
       <div className='flex items-center p-4  mb-2 hover:bg-blue-200 cursor-pointer'>
            <div className='Icon'>
              <Icon/>
      
            </div>
            <p className='font-semibold text-xl ml-3'>{ text }</p>
          </div>
    </div>
  )
}

export default SideBarItem
