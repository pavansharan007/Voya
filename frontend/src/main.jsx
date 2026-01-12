import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { UserProvider } from './contexts/userContext.jsx'
import SocketProvider from './contexts/SocketContext.jsx'
import {RouterProvider,createBrowserRouter} from "react-router-dom"
import SignUp from './components/SignUp.jsx'
import SignIn from './components/SignIn.jsx'
import Home from './pages/Home.jsx'
import History from './pages/History.jsx'
import LiveTrack from './pages/LiveTrack.jsx'
import Account from './pages/Account.jsx'
import VoyageLog from './pages/History.jsx'

const router = createBrowserRouter([
  {
    path:'/create',
    element:<SignUp />
  },
  {
    path:'/signin',
    element:<SignIn />
  },
  {
    path:'/',
    element:<App />,
    children:[
      {
        path:'/signup',
        element:<SignUp />
      },
      {
        path:'/login',
        element:<SignIn />
      },
      {
        index:true,
        element:<Home />
      },
      {
        path:'/History',
        element:<VoyageLog />
      },
      {
        path:'/Live',
        element:<LiveTrack />
      },
      {
        path:'/Account',
        element:<Account />
      }
    ]
  }
])
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <SocketProvider>
        <RouterProvider router={router}/>
      </SocketProvider>
      
    </UserProvider>
  </StrictMode>,
)
