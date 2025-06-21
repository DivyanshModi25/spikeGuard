'use client'
import React, { useEffect, useState } from 'react';
import { Search, Copy, Activity, Key, Plus, Trash2, Eye, BarChart3, Zap, Globe, Shield, LogOutIcon, Book, BookA, BookAIcon, BookImage, BookOpen, House } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';




export default function Dashboard() {
  const router=useRouter()
  const {handleSubmit,register,formState:{errors}}=useForm()
  const [newService, setNewService] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedKey, setCopiedKey] = useState('');
  const [serviceList,setServiceList]=useState([])
  // const [services, setServices] = useState([]);

  // const handleCreateService = () => {
  //   if (!newService.trim()) return;
  //   const newEntry = {
  //     id: Date.now(),
  //     name: newService,
  //     api_key: 'sk-prod-' + Math.random().toString(36).substring(2, 16),
  //     logs: ['Service created'],
  //     status: 'active',
  //     requests: 0,
  //     uptime: '100%',
  //     category: 'Custom'
  //   };
  //   setServices([newEntry, ...services]);
  //   setNewService('');
  // };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(''), 2000);
  };


 
  const filteredServices = Array.isArray(serviceList)
  ? serviceList.filter(service =>
      service.service_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  : [];

  const total_logs = serviceList.reduce((sum, service) => sum + service.total_logs, 0);
  // const total_logs = 0;
  const TotalErrorLogs = serviceList.reduce((sum, service) => sum + service.error_logs, 0);
  // const TotalErrorLogs = 0;


  const handleLogout=async()=>{
    try {
      const res=await fetch('http://localhost/auth/logout',{
        credentials:'include'
      })
      const data=await res.json()
      console.log(res,data);
      
      if(res.ok==true)
      {
         router.push("/login")
      }

    } catch (error) {
      console.log(error);      
    }
  }

  const handleCreateService=async(data)=>{
    try {
      const service_name=data.service_name 
      const res=await fetch('http://localhost/auth/services',{
        method:"POST",
        credentials:'include',
        headers:{
          'content-type':'application/json'
        },
        body:JSON.stringify({
          "service_name":service_name
        })
      })

      const resData=await res.json()
      console.log(res,resData)     
      
      if(res.ok==true)
      {
          setServiceList([...serviceList,{
            service_id:resData.service_id,
            service_name:resData.service_name,
            api_key:resData.api_key,
            flag:true ,
            error_logs:0,
            total_logs:0
          }])
      }     

      
    } catch (error) {
      console.log(error);      
    }
  }

  useEffect(()=>{

    const serviceList=async()=>{
        try {
          const res=await fetch("http://localhost/auth/services",{
            credentials:'include'
          })
          const data=await res.json()
          console.log(data);
          
          if(res.ok==true)
          {
              setServiceList(data)
          }

        } catch (error) {
          console.log(error);
          
        }
    }

    serviceList()

  },[])

  const handleDelete=async(service_id)=>{
      try {
        console.log(service_id);
        const res=await fetch('http://localhost/auth/delete_service',{
          method:'POST',
          headers:{
            'content-type':'application/json'
          },
          credentials:'include',
          body:JSON.stringify({service_id:service_id})
        })
        const data=await res.json()
        console.log(res,data);
        
        if(res.ok==true)
        {
            setServiceList(prev => prev.filter(service => service.service_id !== service_id));
        }
        
      } catch (error) {
        console.log(error);        
      }
  }

  return (
    <div className="min-h-screen bg-[#4e4e4e31] text-white">
      {/* Header */}
      <div className=" bg-[#0f0f0f] fixed w-full z-10">
        <div className="w-full px-10 mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Developer Dashboard</h1>
                <p className="text-sm text-gray-400">Monitor and manage your API services</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-500">{total_logs.toLocaleString()}</div>
                  <div className="text-gray-400">Total Logs</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-500">{TotalErrorLogs}</div>
                  <div className="text-gray-400">Error logs</div>
                </div>
              </div>
            </div>
            <div className='flex gap-5'>
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-500 px-2 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
              >
                <House className="w-4 h-4"/>
                <span className='text-[12px]'>Home</span>
              </button>
              <button
                onClick={() => router.push('/docs')}
                className="flex items-center space-x-2 bg-transparent border-1 border-orange-600 hover:bg-[#e0997713] px-2 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
              >
                <BookOpen className="w-5 h-5 text-orange-600"/>
                <span className='text-[12px] text-white'>Docs</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-2 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
              >
                <LogOutIcon className="w-4 h-4"/>
                <span className='text-[12px]'>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className=" w-full px-6 py-8 pt-35">
        {/* Create Service Section */}
        <div className="bg-[#0e0e0e] border-1 border-[#333333] rounded-2xl p-6 px-8 mb-8 shadow-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Create New Service</h2>
              <p className="text-sm text-gray-400">Generate a service and get its unique API key</p>
            </div>
          </div>
          <form className="flex gap-4" onSubmit={handleSubmit(handleCreateService)}>
            <div className="flex-1 relative" >
              <input
                {...register("service_name")}
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                type="text"
                placeholder="Enter service name..."
                className="w-full px-4 py-3 bg-black/60 border border-[#333333] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-500 transition-all duration-200"
                
              />
              <Zap className="absolute right-3 top-3.5 w-5 h-5 text-gray-500" />
            </div>
            <button
              disabled={!newService.trim()}
              className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-orange-700 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed cursor-pointer px-8 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-orange-500/25"
            >
              Create Service
            </button>
          </form>
        </div>

        {/* Search and Services Header */}
        <div className="flex items-center justify-between mb-6 px-1">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">Your Services</h2>
            <p className="text-gray-400">Manage and monitor all your API services</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              type="text"
              placeholder="Search services..."
              className="pl-10 pr-4 py-2.5 bg-[#333333] border border-[#333333] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-500 w-80"
            />
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 gap-6 overflow-y-auto h-[54.6vh] custom-scrollbar px-2">
          {filteredServices.map((service) => service.flag && (
            <div
              key={service.service_id}
              className="bg-[#111111] h-fit border-1 border-[#222222] rounded-2xl p-10 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-[#4b4a4a]"
            >
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    {/* <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div> */}
                    <div className='flex gap-5'>
                      <h3 className="text-xl font-semibold text-white mb-1">{service.service_name}</h3>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-lg font-medium">
                          "service.category"
                        </span>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-green-400 font-medium">Active</span>
                        </div>
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => router.push(`/dashboard/analytics/${service.service_id}`)}
                        className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-orange-700 hover:to-red-600 px-2 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-orange-500/25 cursor-pointer"
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span className='text-[12px]'>View Analytics</span>
                      </button>
                      <button
                        onClick={() => goToAnalysis(service)}
                        className="flex items-center space-x-2 bg-[#333333] hover:bg-gray-600 px-2 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span className='text-[12px]'>View Logs</span>
                      </button>
                      <button
                        onClick={()=>{handleDelete(service.service_id)}}
                        className="flex items-center space-x-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 px-2 py-2 rounded-xl text-sm font-medium transition-all duration-200 border border-red-600/30 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className='text-[12px]'>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* API Key Section */}
                  <div className="bg-black/30 border border-gray-700 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Key className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">API Key:</span>
                        <code className="text-orange-400 font-mono text-sm bg-orange-500/10 px-2 py-1 rounded">
                          {service.api_key}
                        </code>
                      </div>
                      <button
                        onClick={() => handleCopy(service.api_key)}
                        className="flex items-center space-x-2 text-orange-500 hover:text-orange-400 transition-colors duration-200 group/copy cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {copiedKey === service.api_key ? 'Copied!' : 'Copy'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-1 bg-black/20 rounded-lg border border-gray-700">
                      <div className="text-lg font-bold text-white">{service.total_logs}</div>
                      <div className="text-xs text-gray-400">logs</div>
                    </div>
                    <div className="text-center p-1 bg-black/20 rounded-lg border border-gray-700">
                      <div className="text-lg font-bold text-green-400">"50%"</div>
                      <div className="text-xs text-gray-400">Uptime</div>
                    </div>
                    <div className="text-center p-1 bg-black/20 rounded-lg border border-gray-700">
                      <div className="text-lg font-bold text-blue-400">{service.error_logs}</div>
                      <div className="text-xs text-gray-400">Error Logs</div>
                    </div>
                  </div>
                </div>

                
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-400 mb-2">No services found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first service to get started'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}