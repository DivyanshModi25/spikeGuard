"use client"
import React from 'react';
import { useForm } from 'react-hook-form';  

export default function RegistrationPage() {

  const {register,handleSubmit} = useForm(); 
  const registerSubmit=async(data)=>{
      try {
        console.log(data);
        const res=await fetch("http://localhost/auth/register",{
          method:"POST",
          headers: {
            "Content-Type": "application/json"
          },
          body:JSON.stringify(data)
        })

        const resdata=await res.json()
        console.log(res);
        console.log(resdata);
        
        
        
      } catch (error) {
        console.log(error);
      }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#111111] rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-semibold text-white text-center mb-6">
          Create Account
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit(registerSubmit)}>
          {/* Full Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
            <input
              {...register("name")}
              type="text"
              placeholder="John Doe"
              className="w-full px-4 py-2 bg-[#2c2c2c] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2 bg-[#2c2c2c] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-[#2c2c2c] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

         
          {/* Submit */}
          <div>
            <button
              type="submit"
              className="w-full py-2 cursor-pointer bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-md transition duration-300"
            >
              Register
            </button>
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-400 mt-4">
            Already have an account?{' '}
            <a href="/login" className="text-orange-500 hover:underline cursor-pointer">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
