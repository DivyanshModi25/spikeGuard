import React, { useEffect, useState } from 'react'

export default function LogsDisplayPanel({data}) {

  const [currentTab,setCurrentTab]=useState(0)

  const tabMapping={
     0:"INFO",
     1:"ERROR",
     2:"CRITICAL",
     3:"WARNING",
     4:"DEBUG",
     5:"DownloadLog"
  }


  const displayLogData = () => {
    const logLevel = tabMapping[currentTab];
    const logs = data?.[logLevel];

    if (!logs || logs.length === 0) {
      return <div className="text-gray-400">No logs available for {logLevel}</div>;
    }

    return (
      <div className="overflow-y-auto max-h-[40vh] pr-4 space-y-2">
        {logs.map((log, index) => (
          <div key={index} className="bg-[#1c1c1c] p-3 rounded-lg shadow-md flex items-center justify-between">
            <div className="">{log.log_id}</div>
            <p className="text-sm text-gray-400">{log.timestamp}</p>
            <p className="text-md text-white font-semibold">{log.message}</p>
            <p className="text-xs text-gray-500">{log.user_ip}</p>
          </div>
        ))}
      </div>
    ); 
  };


  return (
    <div className="bg-[#111111] w-[60vw] h-[46vh] rounded-xl border-1 border-[#222222] flex mt-3 overflow-hidden">
        <div className="left w-[170px] h-[100%] bg-[#000000]  flex flex-col justify-between items-center">
            <div className="w-[100%]">
                <button className={` w-[100%] p-5 ${currentTab==0?"bg-orange-600":"bg-[#000000]"} cursor-pointer`} onClick={()=>{setCurrentTab(0)}}>Info Logs</button>
                <button className={` w-[100%] p-5 ${currentTab==1?"bg-orange-600":"bg-[#000000]"} cursor-pointer`} onClick={()=>{setCurrentTab(1)}}>Error Logs</button>
                <button className={` w-[100%] p-5 ${currentTab==2?"bg-orange-600":"bg-[#000000]"} cursor-pointer`} onClick={()=>{setCurrentTab(2)}}>Critical Logs</button>
                <button className={` w-[100%] p-5 ${currentTab==3?"bg-orange-600":"bg-[#000000]"} cursor-pointer`} onClick={()=>{setCurrentTab(3)}}>Warning Logs</button>
                <button className={` w-[100%] p-5 ${currentTab==4?"bg-orange-600":"bg-[#000000]"} cursor-pointer`} onClick={()=>{setCurrentTab(4)}}>Debug Logs</button>
                <button className={` w-[100%] p-5 ${currentTab==5?"bg-orange-600":"bg-[#000000]"} cursor-pointer`} onClick={()=>{setCurrentTab(5)}}>Download Log</button>
            </div>
        </div>
        <div className="right p-5 w-[100%] custom-scrollbar">
            {currentTab!=5 && displayLogData()}
            {currentTab==5 && (
                <div>
                    <form>
                        {/* <div className="bg-gray-900 p-4 rounded-xl shadow-lg w-full max-w-sm text-white space-y-4">
                            <div>
                              <label className="text-sm text-gray-400">From</label>
                              <Calendar selected={fromDate} onSelect={setFromDate} mode="single" className="bg-gray-800" />
                            </div>
                            <div>
                              <label className="text-sm text-gray-400">To</label>
                              <Calendar selected={toDate} onSelect={setToDate} mode="single" className="bg-gray-800" />
                            </div>
                            <div>
                              <label className="text-sm text-gray-400">Log Types</label>
                              <MultiSelect
                                options={logOptions}
                                selected={logTypes}
                                onChange={setLogTypes}
                                className="bg-gray-800"
                              />
                            </div>
                            <div>
                              {!fileUrl ? (
                                <Button className="bg-orange-600 hover:bg-orange-700 w-full" onClick={handleGenerate} disabled={isGenerating}>
                                  {isGenerating ? "Generating..." : "Generate"}
                                </Button>
                              ) : (
                                <a href={fileUrl} download>
                                  <Button className="bg-green-600 hover:bg-green-700 w-full">
                                    Download
                                  </Button>
                                </a>
                              )}
                            </div>
                          </div> */}
                    </form>
                </div>
            )}
        </div>
    </div>
  )
}
