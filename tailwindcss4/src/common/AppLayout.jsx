import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigation } from 'react-router-dom';
import nprogress from "nprogress";
import Header from './Header';
// import SideBar from './SideBar';
// import { useUser } from '../context/UserContext';

// function AppLayout() {
//   const location = useLocation();
  
//   // Access user role from UserContext
//   // const { userRole } = useUser(); // Now using the userRole from context
//   const userRole = null
  
//   // Check if the current path is one of the excluded pages
//   const excludedPaths = ['/', '/login', '/signup'];
//   const shouldShowSidebar = !excludedPaths.includes(location.pathname);

//   return (
//     <div
//       className={`grid ${
//         shouldShowSidebar
//           ? 'grid-cols-[210px_auto] grid-rows-[1fr_auto]'
//           : 'grid-rows-[1fr_auto]'
//       } h-dvh overflow-hidden`}
//     >
//       <Header />
//       {shouldShowSidebar && <SideBar userRole={userRole} />} {/* Pass userRole to SideBar */}
//       <main className={`${shouldShowSidebar ? 'col-start-2' : ''} overflow-y-scroll`}>
//         <Outlet />
//       </main>
//     </div>
//   );
// }


function AppLayout () {
  let location = useLocation();
  const navigation = useNavigation()
  // const ref = useRef<LoadingBarRef>(null)
  
  useEffect(() => {
    nprogress.start();
    nprogress.done();
  }, [location.pathname]);

  useEffect(() => {
    if (navigation.state === "loading" || navigation.state === "submitting") {
      // ref.current?.continuousStart()
      // console.log({complete: false})
      nprogress.start();
    }

    if (navigation.state === "idle") {
      // ref.current?.complete()
      // console.log({complete: true})
      nprogress.done();
    }
  }, [navigation.state])
  // console.log({navigation: navigation.state})

  return <Outlet />
}

export default AppLayout;

