"use client"
import { useRouter } from 'next/navigation';
import React from 'react';
import { useForm } from 'react-hook-form';

export default function LoginPage() {
  const router=useRouter()
  
  const {register,handleSubmit,formState:{errors}} = useForm(); 
  
  const loginSubmit=async(data)=>{
      try {
        console.log(data);
        const res=await fetch("http://3.110.195.210/auth/login",{
          method:"POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: 'include',
          body:JSON.stringify(data)
        })

        const resdata=await res.json()
        console.log(res);
        console.log(resdata);
        
        if(res.ok==true)
        {
          router.push("/dashboard")
        }
        
        
      } catch (error) {
        console.log(error);
      }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#111111] rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-semibold text-white text-center mb-6">
          Login
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit(loginSubmit)}>
          
          {/* Email */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              {...register("dev_email",{
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Enter a valid email"
                }
              })}
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2 bg-[#2c2c2c] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            {errors.email && <p className="text-red-500 text-center text-sm mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              {...register("password",{
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              })}
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-[#2c2c2c] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.password && <p className="text-red-500 text-center text-sm mt-1">{errors.password.message}</p>}
          </div>

         

          {/* Submit */}
          <div>
            <button
              type="submit"
              className="w-full py-2 cursor-pointer bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-md transition duration-300"
            >
              Login
            </button>
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-400 mt-4">
            Dont have an account?{' '}
            <a href="/register" className="text-orange-500 hover:underline cursor-pointer">
              Create new account
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
