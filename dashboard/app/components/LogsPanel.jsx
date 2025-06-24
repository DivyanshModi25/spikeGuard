import React, { useState } from 'react'

export default function LogsPanel() {

    const [currentTab,setCurrentTab]=useState(0)

  return (
    <div className="bg-[#111111] w-[60vw] h-[46vh] rounded-xl border-1 border-[#222222] flex mt-3 overflow-hidden">
        <div className="left w-[170px] h-[100%] bg-[#000000]  flex flex-col justify-between items-center">
            <div className="w-[100%]">
                <button className={` w-[100%] p-5 ${currentTab==0?"bg-orange-600":"bg-[#000000]"} cursor-pointer hover:opacity-50`} onClick={()=>{setCurrentTab(0)}}>Info Logs</button>
                <button className={` w-[100%] p-5 ${currentTab==1?"bg-orange-600":"bg-[#000000]"} cursor-pointer hover:opacity-50`} onClick={()=>{setCurrentTab(1)}}>Error Logs</button>
                <button className={` w-[100%] p-5 ${currentTab==2?"bg-orange-600":"bg-[#000000]"} cursor-pointer hover:opacity-50`} onClick={()=>{setCurrentTab(2)}}>Critical Logs</button>
                <button className={` w-[100%] p-5 ${currentTab==3?"bg-orange-600":"bg-[#000000]"} cursor-pointer hover:opacity-50`} onClick={()=>{setCurrentTab(3)}}>Warning Logs</button>
                <button className={` w-[100%] p-5 ${currentTab==4?"bg-orange-600":"bg-[#000000]"} cursor-pointer hover:opacity-50`} onClick={()=>{setCurrentTab(4)}}>Download Log</button>
            </div>
        </div>
        <div className="right p-5">
            hello
        </div>
    </div>
  )
}
