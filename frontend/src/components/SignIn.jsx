import React, { useState,useContext } from 'react';
import { useForm } from "react-hook-form";
import axios from "axios"
import { UserContext } from '../contexts/userContext';
import { Link,useNavigate } from 'react-router-dom';

function SignIn() {
  const navigate = useNavigate()
  const {refreshAuth} = useContext(UserContext)
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [errorflag,seterrorFlag] = useState()
  const[message,setmessage]= useState("")
  const[errormessage,seterrormessage]=useState("")
  const onSubmit = async (data) => {
  setIsLoading(true);
  setmessage("");     // Clear previous messages
  seterrormessage(""); // Clear previous errors

  try {
    const response = await axios.post(`${import.meta.env.VITE_DEPLOY}/user/login`, data,{withCredentials:true});
    
    // If successful (Status 200)
    if (response.data.flag) {
      refreshAuth();
      setmessage(response.data.message);
      setIsLoading(false)
      navigate('/')
      
    } else {
      seterrormessage(response.data.message);
      setIsLoading(false)
    }
  } catch (error) {
    // If server returns 400, 404, 500, etc.
    console.error("SignIn error:", error);
    
    // Extract message from server response if available, otherwise use default
    const serverMessage = error.response?.data?.message || "Something went wrong. Please try again.";
    seterrormessage(serverMessage);
  } finally {
    // This runs regardless of success or failure
    setIsLoading(false);
  }
};

  return ( 
    <div className="min-h-screen rounded-3xl border   bg-[#f8fafc] flex items-center justify-center  relative overflow-hidden">
      {/* Background Decorative Blurs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse delay-700"></div>

      <div className="w-full max-w-xs sm:max-w-md z-10">
        <div className="bg-white/80 backdrop-blur-xl flex flex-col rounded-3xl shadow-2xl border border-white p-10">
          
          {/* Header - Left Aligned */}
          <div className="text-left mb-8 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sign In</h1>
            <p className="text-gray-500 mt-2">Login to access your account</p>
            {errormessage && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 animate-shake">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <p className="text-red-600 text-xs font-semibold uppercase tracking-wider">{errormessage}</p>
              </div>
            )}
            {message && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-emerald-600 text-xs font-semibold uppercase tracking-wider">{message}</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Email - Strictly Left Aligned */}
            <div className="flex flex-col items-start">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                Email Address
              </label>
              <input
                {...register("email", { 
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+$/i, message: "Enter a valid email" }
                })}
                className={`w-full px-5 py-4 bg-white border ${errors.email ? 'border-red-400' : 'border-gray-100'} rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm`}
                placeholder="name@company.com"
              />
              {errors.email && <span className="text-red-500 text-xs mt-1.5 ml-1 font-medium">{errors.email.message}</span>}
            </div>
            
            {/* Password - Strictly Left Aligned */}
            <div className="flex flex-col items-start">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                Password
              </label>
              <input
                type="password"
                {...register("password", { 
                  required: "Password is required",
                  minLength: { value: 8, message: "Must be at least 8 characters" }
                })}
                className={`w-full px-5 py-4 bg-white border ${errors.password ? 'border-red-400' : 'border-gray-100'} rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm`}
                placeholder="••••••••"
              />
              {errors.password && <span className="text-red-500 text-xs mt-1.5 ml-1 font-medium">{errors.password.message}</span>}
            </div>

            {/* Submit Button */}
            <button
              disabled={isLoading}
              type="submit"
              className="w-full mt-4 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all transform active:scale-[0.97] disabled:opacity-70 flex items-center justify-center min-h-[60px]"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="tracking-wide">Login...</span>
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-8 font-medium">
            Don't have an account? <Link to='/create' className="text-blue-600 font-bold hover:text-blue-700 underline-offset-4 hover:underline transition-all">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;