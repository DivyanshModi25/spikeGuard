import React, { useEffect, useState } from 'react'
import { TextField, MenuItem, Checkbox, ListItemText, Select, InputLabel, FormControl } from '@mui/material';
import { useForm ,Controller} from 'react-hook-form';

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const pad = (n) => String(n).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
         `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};



export default function LogsDisplayPanel({data,service_id}) {

  const now = new Date();
  const toDateTimeLocal = (date) =>
    new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

   const {handleSubmit ,control} = useForm({
    defaultValues: {
      startDate: toDateTimeLocal(now),
      endDate: toDateTimeLocal(now),
      log_levels: [],
    }
  });


  const [currentTab,setCurrentTab]=useState(0)

  const tabMapping={
     0:"INFO",
     1:"ERROR",
     2:"CRITICAL",
     3:"WARNING",
     4:"DEBUG",
     5:"DownloadLog"
  }

  const options = ['INFO', 'ERROR', 'WARNING', 'CRITICAL', 'DEBUG'];


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



  const generateCSV=async(data)=>{
      try {
        console.log(data);
        
        const payload = {
          service_id: service_id,
          start_time: formatDateTime(data.startDate),
          end_time: formatDateTime(data.endDate),
          log_level: data.log_levels
        };

        const res=await fetch('http://localhost/analyze/download_logs',{
            method:"POST",
            headers:{
              "content-type":"application/json",
              'Accept': 'text/csv'
            },
            credentials:"include",
            body:JSON.stringify(payload)
        })

        console.log(payload);
        
        

        const blob = await res.blob();

        if(res.ok==true)
        {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `filtered_logs_${service_id}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
        }

        
        
      } catch (error) {
        console.log(error);
        
      }
      
  }


  return (
    <div className="bg-[#111111] w-[60vw] h-[46vh] rounded-xl border-1 border-[#222222] flex mt-3 overflow-hidden flex">
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
            {currentTab!=5 && displayLogData(generateCSV)}
            {currentTab==5 && (
                <div className='w-[60%] mx-auto mt-10'>
                    <form onSubmit={handleSubmit(generateCSV)}>
                          <div className="flex gap-9">
                            <div className="flex flex-col w-[100%]">
                              <label className="text-[#666666] text-sm mb-2">Start Time</label>
                              <Controller
                                name="startDate"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    type="datetime-local"
                                    {...field}
                                    style={{
                                      backgroundColor: '#222222',
                                      color: 'gray',
                                      padding: '10px',
                                      borderRadius: '8px',
                                      fontSize: '16px',
                                    }}
                                  />
                                )}
                              />
                            </div>
                            
                            <div className="flex flex-col w-[100%]">
                              <label className="text-[#666666] text-sm mb-2">End Time</label>
                              <Controller
                                name="endDate"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    type="datetime-local"
                                    {...field}
                                    style={{
                                      backgroundColor: '#222222',
                                      color: 'gray',
                                      padding: '10px',
                                      borderRadius: '8px',
                                      fontSize: '16px',
                                    }}
                                  />
                                )}
                              />
                            </div>
                          </div>

                          <FormControl fullWidth sx={{ backgroundColor: '#222222', borderRadius: 2, mt: 5 }}>
                            <InputLabel sx={{ color: '#ffffff' }}>Log Levels</InputLabel>
                            <Controller
                              name="log_levels"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  multiple
                                  {...field}
                                  renderValue={(selected) => selected.join(', ')}
                                  sx={{
                                    minWidth: 250,
                                    backgroundColor: '#222222',
                                    color: 'white',
                                    borderRadius: 2,
                                    '& .MuiSelect-icon': { color: '#ffffff' },
                                  }}
                                  MenuProps={{
                                    PaperProps: {
                                      sx: {
                                        bgcolor: '#1e1e1e',
                                        color: 'white',
                                        '& .MuiMenuItem-root': {
                                          '&:hover': {
                                            bgcolor: '#333333',
                                          },
                                          '&.Mui-selected': {
                                            bgcolor: '#f54a00',
                                            color: '#000000',
                                            '&:hover': {
                                              bgcolor: '#f54a00',
                                            },
                                          },
                                        },
                                      },
                                    },
                                  }}
                                >
                                  {options.map((name) => (
                                    <MenuItem key={name} value={name}>
                                      <Checkbox
                                        checked={field.value.includes(name)}
                                        sx={{
                                          color: '#f54a00',
                                          '&.Mui-checked': { color: '#f54a00' },
                                        }}
                                      />
                                      <ListItemText primary={name} />
                                    </MenuItem>
                                  ))}
                                </Select>
                              )}
                            />
                          </FormControl>
                          <button className='p-5 bg-orange-600 hover:bg-orange-700 rounded-xl w-[100%] mt-7 cursor-pointer'>GENERATE AND DOWNLOAD</button>
                    </form>
                </div>
            )}
        </div>
    </div>
  )
}
