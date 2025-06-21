"use client"
import { ArrowLeft } from 'lucide-react';
import { useParams,useSearchParams,useRouter} from 'next/navigation'
import React from 'react'
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

export default function serviceAnalytics() {
  const params=useParams()
  const { service_id } = useParams();
  const searchParams = useSearchParams();
  const router=useRouter();

  const service_name = searchParams.get('service_name');
  return (
    <div className='bg-[#4e4e4e31] w-[100vw] h-[100vh] absolute'>
        {/* <div className="flex items-center px-5">
          <div className="p-2 ml-3 mr-5 cursor-pointer bg-gradient-to-l from-orange-500 to-red-500 rounded-full w-fit" onClick={()=>{router.push('/dashboard')}}>
            <ArrowLeft/>
          </div>
          <p className='text-2xl font-bold text-white p-5'>{service_name}</p>
        </div> */}
        <div className="breadcrum p-3 ">
          <Breadcrumbs aria-label="breadcrumb" separator="›" color="gray">
              <Link underline="hover"  href="/" color='gray' className='text-white'>
                Home
              </Link>
              <Link
                underline="hover"
                href="/dashboard"
                color='gray'
              >
                Dashboard
              </Link>
              <Typography sx={{ color: 'white' }}>{service_name}</Typography>
        </Breadcrumbs>
        </div>
        <div className="flex gap-2 p-3">
          <div className="w-[200px] h-[100px] bg-[#111111] rounded-2xl p-5 flex flex-col items-center gap-2 border-1 border-[#222222]">
            <p className='text-xl text-white font-semibold '>Total Logs</p>
            <p className='text-sm  text-white'>500</p>
          </div>
          <div className="w-[200px] h-[100px] bg-[#111111] rounded-2xl p-5 flex flex-col items-center gap-2 border-1 border-[#222222]">
              <p className='text-xl text-white font-semibold '>Error Logs</p>
              <p className='text-sm  text-red-600'>20</p>
          </div>
          <div className="w-[200px] h-[100px] bg-[#111111] rounded-2xl p-5 flex flex-col items-center gap-2 border-1 border-[#222222]">
              <p className='text-xl text-white font-semibold '>Uptime</p>
              <p className='text-sm  text-white'>20%</p>
          </div>
        </div>
    </div>
  )
}
