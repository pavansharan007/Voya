import React,{useState,useEffect,createContext, useContext, Children} from "react";
import axios from "axios";
import { set } from "react-hook-form";

export const UserContext = createContext()

const UserProvider = ({children}) => {
  const[loggedIn,setLoggedIn] = useState()
  const [hasBike,setHasBike] = useState()
  const [user,setUser] = useState(null)
  const [isOnline,setIsOnline] = useState(false)
  const [loading, setLoading] = useState(true);
  const [isBikeOnRide,setisbikeonride]=useState(false)
  useEffect(() => {
    setLoading(true)
    const init = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_DEPLOY}/user/getcurrentuser`,{
          withCredentials:true
        })

        setLoggedIn(res.data.flag)
        setHasBike(res.data.hasBike)
        setUser(res.data.user)
        setIsOnline(res.data.user.isOnline)

        setisbikeonride(res.data.user.isBikeOnRide)
      } catch (error) {
        setLoggedIn(false)
        setHasBike(false)
        setIsOnline(false)

        setisbikeonride(false)
      }finally{
        setLoading(false)
      }
    }
    init()

  } ,[])

  const refreshAuth = async() => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_DEPLOY}/user/getcurrentuser`,{
          withCredentials:true
        })
        
        console.log(res.data)
        setLoggedIn(res.data.flag)
        setHasBike(res.data.hasBike)
        setUser(res.data.user)

        setIsOnline(res.data.user.isOnline)
        setisbikeonride(res.data.user.isBikeOnRide)
    } catch (error) {
      setLoggedIn(false)
        setHasBike(false)
        setIsOnline(false)

    }finally {
      setLoading(false)
    }
  }
  console.log(loggedIn)
  console.log(hasBike)
  return(
    <UserContext.Provider value={{loggedIn,hasBike ,refreshAuth,user ,isOnline , loading, isBikeOnRide}}>
      {children}
    </UserContext.Provider>
  )
}

export  {UserProvider}

