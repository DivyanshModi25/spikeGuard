"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ComposedChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

export default function ServiceAnalytics() {
  const { service_id } = useParams();
  const searchParams = useSearchParams();
  const service_name = searchParams.get('service_name');

  const [filter, setFilter] = useState("month"); // "month" or "hour"
  const [chartData, setChartData] = useState([]);

  const fetchData = async () => {
    const endpoint =
      filter === "month"
        ? "http://localhost/analyze/metrics/monthly_trafic"
        : "http://localhost/analyze/metrics/hourly_trafic";

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ service_id }),
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok) {
        setChartData(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]); // Re-fetch on filter change

  return (
    <div className='bg-[#4e4e4e31] w-[100vw] h-[100vh] absolute p-5'>
      {/* Breadcrumb */}
      <div className="breadcrum p-3">
        <Breadcrumbs aria-label="breadcrumb" separator="›" color="gray">
          <Link underline="hover" href="/" color='gray' className='text-white'>Home</Link>
          <Link underline="hover" href="/dashboard" color='gray'>Dashboard</Link>
          <Typography sx={{ color: 'white' }}>{service_name}</Typography>
        </Breadcrumbs>
      </div>

      

      {/* Chart */}
      <div className="">
        <div className="w-[800px] h-[450px] bg-[#111111] rounded-xl p-6 mt-4 ml-3.5">
          {/* Filter */}
          <div className="flex items-center justify-evenly">
            <div className="flex gap-2 -translate-x-10 -translate-y-5">
            <button
              onClick={() => setFilter("month")}
              className={`px-4 py-2  rounded-lg cursor-pointer ${filter === "month" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setFilter("hour")}
              className={`px-4 py-2  rounded-lg cursor-pointer ${filter === "hour" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"}`}
            >
              Hourly
            </button>
          </div>
          <div className="-translate-x-5 text-center">
            <h2 className="text-white text-xl font-semibold mb-2">{filter.charAt(0).toUpperCase() + filter.slice(1)}ly Log Overview</h2>
            <p className="text-gray-400 text-md mb-4">Total logs vs error logs for each {filter}</p>
          </div>
          <div className=""></div>
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
                  formatter={(value, name) => {
                    const label = name === 'total_error_logs' ? 'Error Logs' : 'Total Logs';
                    return [value, label];
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
