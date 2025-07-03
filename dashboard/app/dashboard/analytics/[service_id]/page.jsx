"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ComposedChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,Pie,PieChart,Cell } from 'recharts';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import DonutChart from '@/app/components/DonutChart';


import dynamic from 'next/dynamic';
import LogsDisplayPanel from '@/app/components/LogsDisplayPanel';
import Heatmap from '@/app/components/Heatmap';

const LogMap = dynamic(() => import('@/app/components/LogMap'), {
  ssr: false, // Disable Server Side Rendering for Leaflet
});
const TrafficMeter = dynamic(() => import('@/app/components/TrafficMeter'), {
  ssr: false,
});

export default function ServiceAnalytics() {
  const { service_id } = useParams();
  const searchParams = useSearchParams();
  const service_name = searchParams.get('service_name');

  const [filter, setFilter] = useState("month"); // "month" or "hour"
  const [chartData, setChartData] = useState([]);
  const [logLevelCount,setLogLevelCount]=useState([])
  const [currentTrafficData,setCurrentTrafficData]=useState({})
  const [LogLocationSummary,setLogLocationSummary]=useState({
  log_summary: []
})
const [totalLogs,setTotalLogs]=useState(0)
const [errorLogs,setErrorLogs]=useState(0)
const [errorRate,setErrorRate]=useState(0)
const [allLogs,setAllLogs]=useState({})
const [heatmapData, setHeatmapData] = useState([]);


  const fetchData = async () => {
    const endpoint =
      filter === "month"
        ? "/nginx/analyze/metrics/monthly_trafic"
        : "/nginx/analyze/metrics/hourly_trafic";

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ service_id }),
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok==true) {
        setChartData(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]); // Re-fetch on filter change

  useEffect(()=>{
    const fetch_log_level_count=async()=>{
      try {

        const res=await fetch('/nginx/analyze/level_count',{
          method:"POST",
          headers:{
            "content-type":"application/json"
          },
          credentials:'include',
          body:JSON.stringify({service_id:service_id})
        })

        const data = await res.json()
        
        setLogLevelCount(data)
        
      } catch (error) {
        console.log(error);    
      }
    }

    const fetch_current_traffic=async()=>{
      try {
        const res=await fetch('/nginx/analyze/traffic-meter',{
          method:"POST",
          credentials:'include',
          headers:{
            'content-type':'application/json'
          },
          body:JSON.stringify({service_id:service_id})
        })

        const data=await res.json()
        console.log(data);
        if(res.ok==true)
          {
            setCurrentTrafficData(data)
          }
        
      } catch (error) {
        console.log(error);        
      }
    }

    const fetch_users_location_data=async()=>{
      try {

        const res=await fetch('/nginx/analyze/metrics/log_locations',{
          method:"POST",
          headers:{
            "content-type":"application/json"
          },
          credentials:"include",
          body:JSON.stringify({service_id:service_id})
        })

        const data=await res.json()
        console.log(data);
        

        if(res.ok==true)
        {
           setLogLocationSummary(data)
        }

       
        
      } catch (error) {
        console.log(error);        
      }
    }

    const fetch_total_counts=async()=>{
      try {

        const res=await fetch('/nginx/analyze/metrics/total_service_logs',{
          method:"POST",
          credentials:"include",
          headers:{
            "content-type":"application/json"
          },
          body:JSON.stringify({service_id:service_id})
        })

        const data=await res.json()

        if(res.ok==true)
        {
          setTotalLogs(data.total_logs)
          setErrorLogs(data.error_logs)
          setErrorRate(data.error_rate)
        }
        
      } catch (error) {
        console.log(error);        
      }
    }

    const fetch_all_logs=async()=>{
      try {

        const res=await fetch('/nginx/analyze/display_top_logs',{
          method:"POST",
          headers:{
            "content-type":"application/json"
          },
          credentials:"include",
          body:JSON.stringify({service_id:service_id})
        })

        const data=await res.json()

        if(res.ok==true)
        {
            setAllLogs(data)
        }
        
      } catch (error) {
          console.log(error);          
      }
    }

    const fetchDailyData=async()=>{
      try {
        const res=await fetch("/nginx/analyze/metrics/daily_traffic",{
          method:"POST",
          headers:{
            "content-type":"application/json"
          },
          credentials:"include",
          body:JSON.stringify({service_id:service_id})
        })

        const data=await res.json();
        if(res.ok==true)
        {
          console.log(data);
          
           setHeatmapData(
  data.map(entry => ({
    date: entry.day,
    count: Number(entry.total_logs)
  }))
);
        }
        
      } catch (error) {
        console.log(error);
        
      }
    }

    
    fetchDailyData()
    fetch_total_counts()
    fetch_all_logs()
    fetch_users_location_data()
    fetch_log_level_count()
    fetch_current_traffic()

  },[])

  return (
    <div className='bg-[#4e4e4e31] w-[100vw] h-[100vh] absolute p-5'>
      <div className="flex items-center justify-between">
        {/* Breadcrumb */}
        <div className="breadcrum p-3">
          <Breadcrumbs aria-label="breadcrumb" separator="›" color="gray">
            <Link underline="hover" href="/" color='gray' className='text-white'>Home</Link>
            <Link underline="hover" href="/dashboard" color='gray'>Dashboard</Link>
            <Typography sx={{ color: 'white' }}>{service_name}</Typography>
          </Breadcrumbs>
        </div>
        <div className="-translate-x-10">
          {/* <p className='text-xl font-semibold'>{service_name}</p> */}
        </div>
        <div className=""></div>
      </div>

      
      <div className="flex mt-3">
          <div className="left panel">

            <div className="flex justify-between ml-3 mb-3">
                  <div className="bg-[#111111] border-1 border-[#222222] w-[220px] p-10 flex flex-col gap-5 items-center rounded-xl">
                    <p className='text-xl font-semibold'>Total Logs</p>
                    <p className='text-blue-500'>{totalLogs}</p>
                  </div>

                  <div className="bg-[#111111] border-1 border-[#222222] w-[220px] p-10 flex flex-col gap-5 items-center rounded-xl">
                      <p className='text-xl font-semibold'>Error Logs</p>
                      <p className='text-orange-500'>{errorLogs}</p>
                  </div>

                  <div className="bg-[#111111] border-1 border-[#222222] w-[220px] p-10 flex flex-col gap-5 items-center rounded-xl">
                      <p className='text-xl font-semibold'>Error Rate</p>
                      <p className="text-red-600">
                        {totalLogs > 0 ? `${((errorLogs / totalLogs) * 100).toFixed(2)}%` : '0.00%'}
                      </p>
                  </div>
            </div>

            {/* time series chart */}
            <div className="">
              <div className="w-[700px] h-[350px] bg-[#111111] border-1 border-[#222222] rounded-xl p-5 mt-4 ml-3.5">
                
                <div className="flex items-center">
                    {/* Filter */}
                    <div className="flex gap-2 p-3 -translate-x-4 -translate-y-5">
                      <button
                        onClick={() => setFilter("month")}
                        className={`px-2 py-1 rounded-lg cursor-pointer ${filter === "month" ? "bg-orange-600 text-white" : "bg-gray-700 text-gray-300"}`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => setFilter("hour")}
                        className={`px-2 py-1 rounded-lg cursor-pointer ${filter === "hour" ? "bg-orange-600 text-white" : "bg-gray-700 text-gray-300"}`}
                      >
                        Hourly
                      </button>
                    </div>
                    <div className="text-center translate-x-14">
                      <h2 className="text-white text-xl font-semibold mb-2">{filter.charAt(0).toUpperCase() + filter.slice(1)}ly Log Overview</h2>
                      <p className="text-gray-400 text-md mb-4">Total logs vs error logs for each {filter}</p>
                    </div>
                </div>
                
                
                <div className="w-full h-[70%]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="pinkGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EC4899" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#EC4899" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>

                      <XAxis 
                        dataKey={filter === "month" ? "month" : "hour"} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                        label={{ value: filter === "month" ? "Month" : "Hour", position: "insideBottom", offset: -5, fill: '#9CA3AF' }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                        label={{ value: 'Log Count', angle: -90, position: 'insideLeft', fill: '#9CA3AF', offset: 10 }}
                      />

                      <Area 
                        dataKey="total_logs" 
                        stroke="#6366F1" 
                        strokeWidth={2} 
                        fill="url(#blueGradient)" 
                      />
                      <Area 
                        dataKey="total_error_logs" 
                        stroke="#EC4899" 
                        strokeWidth={2} 
                        fill="url(#pinkGradient)" 
                      />

                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                        labelStyle={{ color: '#9CA3AF' }}
                        formatter={(value, name, props) => {
                        const { payload } = props;
                        const totalLogs = payload.total_logs || 0;
                        const errorLogs = payload.total_error_logs || 0;

                        if (name === 'total_logs') {
                          return [value, 'Total Logs'];
                        } else if (name === 'total_error_logs') {
                          const errorRate = totalLogs > 0 ? ((errorLogs / totalLogs) * 100).toFixed(2) : '0.00';
                          return [
                            `${value} (${errorRate}%)`,
                            'Error Logs',
                          ];
                        }
                        return [value, name];
                      }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* donut and meter chart */}
            <div className="flex items-center">
              {/* donut chart */}
              <div className="">
                  <DonutChart data={logLevelCount}/>
              </div>

              {/* traffic meter */}
              <div className="flex flex-col justify-center items-center bg-[#111111] w-[380px] h-[320px] rounded-xl border-1 border-[#222222]">
                <h1 className='text-xl font-semibold text-white'>Traffic Rate</h1>
                <p className='text-[#999999]'>(last 5 minutes)</p>
                <TrafficMeter current_traffic_data={currentTrafficData}/>
                {typeof currentTrafficData.percentage === 'number' && typeof currentTrafficData.count === 'number' && (
                  <div className="-translate-y-5 text-center">
                    <p>{currentTrafficData.percentage}%</p>
                    <p>{currentTrafficData.count} logs</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        
          <div className="right panel p-4 pt-0 flex flex-col">
              <div className="flex">
                <div className="bg-[#111111] border-1 border-[#222222] w-[300px] h-[400px] p-4 mr-3 rounded-xl flex flex-col items-center justify-center">
                  <p className='text-xl font-semibold'>Daily Logs count</p>
                  <Heatmap heatmapData={heatmapData}/>
                </div>
                <div className="bg-[#111111] border-1 border-[#222222] w-[840px] h-[400px] flex justify-between rounded-xl p-6 ">
                    <div className="flex flex-col">
                        <p className='text-xl font-semibold mb-5 text-center'>Users Locations and Log count</p>
                        <div className="w-[790px] h-[100%] rounded-xl overflow-hidden">
                            <LogMap data={LogLocationSummary.log_summary}/>
                            
                        </div>
                    </div>       
                </div>
                {/* <div className="bg-[#111111] w-[100%] h-[400px] rounded-xl border-1 border-[#222222] ml-3 overflow-y-scroll custom-scrollbar">
                    <p className='text-center p-4 translate-y-2'>Country based activity</p>
                    {[...LogLocationSummary.log_summary]  // spread to avoid mutating original
                      .sort((a, b) => b.count - a.count)   // descending sort
                      .map((location, i) => (
                        <div key={i} className='bg-[#222222] flex justify-between p-4 m-3 mx-5 rounded-xl'>
                          <p>{location.country}</p>
                          <p>{location.count} logs</p>
                        </div>
                    ))}
                </div> */}
                
              </div>
              <LogsDisplayPanel data={allLogs} service_id={service_id}/>
          </div>
      </div>
    </div>
  );
}
