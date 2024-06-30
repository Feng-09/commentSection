import { useState, useContext } from "react"
import { UserContext } from "./UserContext"
import axios from 'axios'

export default function Form(props) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [auth, setAuth] = useState('register' || 'login')
    const [userExists, setUserExists] = useState(false)

    const {setUsername:setLoggedInUsername, setId} = useContext(UserContext)
  
    const handleAuth = async (ev) => {
      ev.preventDefault()
      const url = auth === 'register' ? '/register' : '/login'
      try {
        const {data} = await axios.post(url, { username, password })
        props.acceptUser()
        setLoggedInUsername(username)
        setId(data.id)
      } catch (err) {
        setUserExists(true)
      }      
    }
  
    return (
      <>
        <div className="bg-[#f5f6fa] w-screen h-screen flex flex-col items-center justify-center fixed top-0 z-50 nameCont" ref={props.nameCont}>
            <form className="bg-white rounded-lg p-8 w-80 gap-y-8 flex flex-col justify-between mb-4 text-center shadow shadow-slate-700 focus:outline-none userInp" onSubmit={handleAuth}>
                <h1 className="font-rubik text-3xl font-semibold text text-[#324152]">{auth === 'register' ? 'Sign Up' : 'Sign In'}</h1>
                <div>
                  {userExists ? (<p className="text-red-400 font-semibold text-start">{auth === 'register' ? 'Username taken' : 'Incorrect username or password'}</p>) : null}
                  <input className="font-rubik text-[#67727e] border-[#67727e2f] border-2 w-full h-12 rounded-lg bg-white p-2" placeholder="Enter your username" onChange={(e) => {setUsername(e.target.value); setUserExists(false)}} />
                </div>
                <input className="font-rubik text-[#67727e] border-[#67727e2f] border-2 w-full h-12 rounded-lg bg-white p-2" placeholder="Enter your password" type='password' onChange={(e) => {setPassword(e.target.value)}} />
                <button className="h-10 w-full rounded-lg bg-[#5457b6] font-rubik text-xl font-semibold flex items-center justify-center hover:cursor-pointer hover:opacity-50" type='submit'>{auth === 'register' ? 'Register' : 'Login'}</button>
            </form>
            <div>{auth === 'register' ? 'Already have an account? ' : "Don't have an account? "}<span className="text-[#5457b6] font-semibold hover:cursor-pointer" onClick={() => {setAuth(auth === 'register' ? 'login' : 'register'); setUserExists(false)}}>{auth === 'register' ? 'Login' : 'Register'}</span></div>
        </div>
        <div className="bg-[#afb9df] w-screen h-screen fixed top-0 z-40 nameCont"></div>
        <div className="bg-[#7283c9] w-screen h-screen fixed top-0 z-30 nameCont"></div>
      </>
    )
}