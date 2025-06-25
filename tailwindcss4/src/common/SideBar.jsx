import React from 'react';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import HelpIcon from '@mui/icons-material/Help';
import SideBarItem from './SideBarItem';

const SideBar = ({ userRole }) => {
  const renderItems = () => {
    console.log("User Role in Sidebar:", userRole);
    switch (userRole) {
      case 'Student':
        return (
          <>
            <Link to="/"><SideBarItem Icon={HomeIcon} text={'Home'} /></Link>
            <Link to="/student-reports"><SideBarItem Icon={AssignmentIcon} text={'Reports'} /></Link>
            <Link to="/notifications"><SideBarItem Icon={NotificationsIcon} text={'Notifications'} /></Link>
            <Link to="/settings"><SideBarItem Icon={SettingsIcon} text={'Settings'} /></Link>
            <Link to="/help"><SideBarItem Icon={HelpIcon} text={'Help & Support'} /></Link>
            <SideBarItem Icon={LogoutIcon} text={'Logout'} />
          </>
        );
      case 'Lecturer':
        return (
          <>
            <Link to="/"><SideBarItem Icon={HomeIcon} text={'Home'} /></Link>
            <Link to="/lecturer-reports"><SideBarItem Icon={AssignmentIcon} text={'Reports'} /></Link>
            <Link to="/notifications"><SideBarItem Icon={NotificationsIcon} text={'Notifications'} /></Link>
            <Link to="/settings"><SideBarItem Icon={SettingsIcon} text={'Settings'} /></Link>
            <Link to="/help"><SideBarItem Icon={HelpIcon} text={'Help & Support'} /></Link>
            <SideBarItem Icon={LogoutIcon} text={'Logout'} />
          </>
        );
      case 'Registrar':
        return (
          <>
            <Link to="/"><SideBarItem Icon={HomeIcon} text={'Home'} /></Link>
            <Link to="/registrar-reports"><SideBarItem Icon={AssignmentIcon} text={'Reports'} /></Link>
            <Link to="/notifications"><SideBarItem Icon={NotificationsIcon} text={'Notifications'} /></Link>
            <Link to="/settings"><SideBarItem Icon={SettingsIcon} text={'Settings'} /></Link>
            <Link to="/help"><SideBarItem Icon={HelpIcon} text={'Help & Support'} /></Link>
            <SideBarItem Icon={LogoutIcon} text={'Logout'} />
          </>
        );
      default:
        return (
          <>
            <Link to="/"><SideBarItem Icon={HomeIcon} text={'Home'} /></Link>
            <Link to="/reports"><SideBarItem Icon={AssignmentIcon} text={'Reports'} /></Link>
            <Link to="/notifications"><SideBarItem Icon={NotificationsIcon} text={'Notifications'} /></Link>
            <Link to="/settings"><SideBarItem Icon={SettingsIcon} text={'Settings'} /></Link>
            <Link to="/help"><SideBarItem Icon={HelpIcon} text={'Help & Support'} /></Link>
            <SideBarItem Icon={LogoutIcon} text={'Logout'} />
          </>
        );
    }
  };

  return (
    <div className='bg-green-100 border-r-2 border-b-2 rounded border-blue-600 overflow-y-auto row-start-2'>
      {renderItems()}
    </div>
  );
};

export default SideBar
