import { useEffect, createContext, useState } from "react";
import { useDispatch } from "react-redux";
import { Skeleton } from "@/components/uii/skeleton";
import { getAuth, getConfig } from "./lib/allauth";
import { setActiveRole } from "@/redux/features/auth/authSlice";
import { authInfo } from "./hooks";
import { Headset } from 'lucide-react'

export const AuthContext = createContext(null);

function Loading() {
  // export function SkeletonDemo() {
  return (
    <div className="flex flex-col gap-y-8 h-screen w-full items-center justify-center">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
      <div className="flex items-center justify-center">
        <p className="text-gray-400 text-2xl">Loading...</p>
      </div>
    </div>
  );
  // }

  // return <div>Starting...</div>;
}

function LoadingError() {
  return (
    <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8 rounded-lg">
      <div className="flex flex-col space-y-6 text-center">
        <p className="text-8xl font-extrabold text-indigo-600">{":-("}</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl">
          Oops! Something went Wrong!
        </h1>
        <p className="text-lg font-medium text-pretty text-gray-500 sm:text-xl/8 pt-4">
          {"We're trying our best to fix this as soon as possible."}
        </p>
        <div className="flex items-center justify-center gap-x-8 mt-8">
        <button className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            <span aria-hidden="true"><Headset className="inline mr-2"/></span>Contact Support
          </button>
        </div>
      </div>
    </main>
  );
}

export function AuthContextProvider(props) {
  const [auth, setAuth] = useState(undefined);
  const [config, setConfig] = useState(undefined);
  const dispatch = useDispatch();

  useEffect(() => {
    function onAuthChanged(e) {
      setAuth((auth) => {
        if (typeof auth === "undefined") {
          console.log("Authentication status loaded");
        } else {
          console.log("Authentication status updated");
        }

        return e.detail;
      });
      const user = authInfo(e.detail)?.user;
      dispatch(setActiveRole(user?.roles[0]));
    }

    document.addEventListener("allauth.auth.change", onAuthChanged);
    getAuth()
      .then((data) => setAuth(data))
      .catch((e) => {
        console.error("getAuth", e);
        setAuth(false);
      });
    getConfig()
      .then((data) => setConfig(data))
      .catch((e) => {
        console.error("getConfig", e);
      });
    return () => {
      document.removeEventListener("allauth.auth.change", onAuthChanged);
    };
  }, []);
  const loading =
    typeof auth === "undefined" || !!(config && config?.status !== 200);

  return (
    <AuthContext.Provider value={{ auth, config }}>
      {loading ? (
        <Loading />
      ) : auth === false ? (
        <LoadingError />
      ) : (
        props.children
      )}
    </AuthContext.Provider>
  );
}
