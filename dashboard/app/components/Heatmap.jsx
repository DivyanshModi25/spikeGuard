import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';


export default function Heatmap({ heatmapData }) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 32);

  // Generate all dates in range
  const generateDateRange = (start, end) => {
    const date = new Date(start);
    const dates = [];
    while (date <= end) {
      dates.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return dates;
  };

  const fullDateRange = generateDateRange(startDate, endDate);
  const heatmapDataMap = Object.fromEntries(
    heatmapData.map(item => [new Date(item.date).toDateString(), item])
  );

  const mergedData = fullDateRange.map(date => {
    const key = date.toDateString();
    return heatmapDataMap[key] || { date: date.toISOString(), count: 0 };
  });

  return (
    <div className=''>
        <div style={{ width: 'fit-content', minWidth: '200px' }}>
            <CalendarHeatmap
            startDate={startDate}
            endDate={endDate}
            values={mergedData}
            gutterSize={1}
            classForValue={(value) => {
                if (!value || !value.count) return 'color-empty';
                if (value.count < 500) return 'color-scale-1';
                if (value.count < 1000) return 'color-scale-2';
                if (value.count < 1500) return 'color-scale-3';
                return 'color-scale-4';
            }}
            titleForValue={(value) =>
                value?.date
                ? `${new Date(value.date).toLocaleDateString()} - ${value.count} logs`
                : 'No data'
            }
            transformDayElement={(el, val, idx) =>
                React.cloneElement(el, {
                style: {
                    ...el.props.style,
                    rx: 1,
                    ry: 1,
                    width: 8,
                    height: 8,
                },
                })
            }
            />
        </div>
    </div>
  );
}
