'use client';
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981','#8B5CF6', '#F59E0B','#EF4444'];

const RADIAN = Math.PI / 180;

// Label renderer for pie slices
const renderCustomizedLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent, index,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    percent > 0.05 && (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  );
};

export default function DonutChart({ data }) {

  return (
    <div className="bg-[#111111] rounded-2xl p-6 shadow-lg w-[300px] h-[320px] border-1 border-[#222222] m-4">
      <h2 className="text-white text-lg font-semibold mb-4 text-center">Log Level Distribution</h2>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="log_level"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            labelLine={false}
            label={renderCustomizedLabel}
            isAnimationActive={true}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '10px' }}
            itemStyle={{ color: 'white' }}
            formatter={(value, name) => [`${value}`, `${name} Logs`]}
          />
        </PieChart>
      </ResponsiveContainer>

     
    </div>
  );
}
