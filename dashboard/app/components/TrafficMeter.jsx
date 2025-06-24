// components/TrafficMeter.jsx
'use client'

import { useEffect, useState } from 'react'
import Stack from '@mui/material/Stack'
import { Gauge } from '@mui/x-charts/Gauge'

const TrafficMeter = ({ current_traffic_data }) => {
  const [percentage, setPercentage] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (typeof current_traffic_data?.percentage === 'number') {
      setPercentage(current_traffic_data.percentage)
    }
    if (typeof current_traffic_data?.count === 'number') {
      setCount(current_traffic_data.count)
    }
  }, [current_traffic_data])

  const arcColor = percentage < 50 ? 'red' : 'green'

  return (
    <div className="">
      
      <Stack direction="row" spacing={3}>
        <Gauge
          width={300}
          height={200}
          value={percentage}
          startAngle={-90}
          endAngle={90}
          valueMax={100}
          valueMin={0}
          text={``}
          color='white'
          sx={{
            '& .MuiGauge-valueArc': {
              fill: arcColor,
            },
            '& .MuiGauge-referenceArc': {
              fill: '#555',
            },
             '& text': {
              fill: 'white',
              fontSize: '1.2rem',
              fontWeight: 600,
              whiteSpace: 'pre-line',
              textAnchor: 'middle',
            },
          }}
        />
      </Stack>
    </div>
  )
}

export default TrafficMeter
