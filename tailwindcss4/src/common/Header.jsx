import React from 'react'
import logo from '../images/MukLogo.png';
// import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications';
// import AccountCircleIcon from '@mui/icons-material/AccountCircle';


export default function Header() {
  return (
    <div className="col-span-full rounded-lg shadow-2xl bg-green"> 
      <div className='flex items-center justify-between p-4 bg-blue-600 text-white shadow-2xl'>
        {/*Logo*/}
        <div className='flex items-center bg-blue-600'>
          <img src={logo} className="App-logo rounded-full" alt="logo" width={70} />
          <h2 className='font-bold p-2'>AITS</h2>
        </div>

        {/*Message*/}
        <h1 className='text-lg   md:text-2xl'>ACADEMIC ISSUE TRACKING SYSTEM</h1>


        {/*Icons*/}
         <div>
        {/* <CircleNotificationsIcon className='mx-2 cursor-pointer'/> 
        <AccountCircleIcon className='mx-2 cursor-pointer'/> */}
         </div>
      </div>

    
        
    </div>
  )
}

