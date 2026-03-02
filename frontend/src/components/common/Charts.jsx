// src/components/common/Charts.jsx

import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

// LineChart Component
export const StockLineChart = ({ 
  data, 
  width = '100%', 
  height = 300, 
  dataKey = 'price', 
  xAxisKey = 'date',
  stroke = '#0d6efd',
  fillOpacity = 0
}) => {
  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis domain={['dataMin', 'dataMax']} />
        <Tooltip formatter={(value) => ['$' + value.toFixed(2), dataKey]} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke={stroke} 
          fill={stroke}
          fillOpacity={fillOpacity}
          activeDot={{ r: 6 }}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// AreaChart Component
export const StockAreaChart = ({ 
  data, 
  width = '100%', 
  height = 300, 
  dataKey = 'price', 
  xAxisKey = 'date',
  stroke = '#0d6efd',
  fill = '#0d6efd',
  fillOpacity = 0.2
}) => {
  return (
    <ResponsiveContainer width={width} height={height}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis domain={['dataMin', 'dataMax']} />
        <Tooltip formatter={(value) => ['$' + value.toFixed(2), dataKey]} />
        <Legend />
        <Area 
          type="monotone" 
          dataKey={dataKey} 
          stroke={stroke} 
          fill={fill}
          fillOpacity={fillOpacity}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// BarChart Component
export const StockBarChart = ({ 
  data, 
  width = '100%', 
  height = 300, 
  dataKey = 'value', 
  xAxisKey = 'name',
  fill = '#0d6efd'
}) => {
  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={dataKey} fill={fill} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// MultiLineChart Component
export const MultiLineChart = ({ 
  data, 
  width = '100%', 
  height = 300, 
  xAxisKey = 'date',
  lines = [
    { dataKey: 'line1', stroke: '#0d6efd', name: 'Line 1' },
    { dataKey: 'line2', stroke: '#198754', name: 'Line 2' }
  ]
}) => {
  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis domain={['dataMin', 'dataMax']} />
        <Tooltip />
        <Legend />
        {lines.map((line, index) => (
          <Line 
            key={index}
            type="monotone" 
            dataKey={line.dataKey} 
            stroke={line.stroke}
            name={line.name || line.dataKey}
            activeDot={{ r: 6 }}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

// PieChart Component
export const StockPieChart = ({ 
  data, 
  width = '100%', 
  height = 300, 
  dataKey = 'value', 
  nameKey = 'name',
  colors = ['#0d6efd', '#198754', '#dc3545', '#ffc107', '#6c757d']
}) => {
  return (
    <ResponsiveContainer width={width} height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={(entry) => entry[nameKey]}
          labelLine
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value}`, dataKey]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// PerformanceChart for comparing stock performance
export const PerformanceChart = ({ 
  data, 
  width = '100%', 
  height = 300, 
  xAxisKey = 'date',
  baseValue = 100, // The starting value to normalize to
  stocks = [
    { dataKey: 'stock1', stroke: '#0d6efd', name: 'Stock 1' },
    { dataKey: 'stock2', stroke: '#198754', name: 'Stock 2' }
  ]
}) => {
  // Normalize the data to show percentage changes
  const normalizedData = data.map(item => {
    const normalized = { [xAxisKey]: item[xAxisKey] };
    
    stocks.forEach(stock => {
      // Find the first non-null value for this stock
      const firstValue = data.find(d => d[stock.dataKey] !== null && d[stock.dataKey] !== undefined)?.[stock.dataKey];
      
      if (firstValue && item[stock.dataKey] !== null && item[stock.dataKey] !== undefined) {
        normalized[stock.dataKey] = (item[stock.dataKey] / firstValue) * baseValue;
      } else {
        normalized[stock.dataKey] = null;
      }
    });
    
    return normalized;
  });

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={normalizedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis domain={['dataMin', 'dataMax']} />
        <Tooltip formatter={(value) => [`${value.toFixed(2)}`, 'Performance']} />
        <Legend />
        <ReferenceLine y={baseValue} stroke="#666" strokeDasharray="3 3" />
        {stocks.map((stock, index) => (
          <Line 
            key={index}
            type="monotone" 
            dataKey={stock.dataKey} 
            stroke={stock.stroke}
            name={stock.name || stock.dataKey}
            activeDot={{ r: 6 }}
            strokeWidth={2}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

// Volume Chart Component
export const VolumeChart = ({ 
  data, 
  width = '100%', 
  height = 200, 
  volumeKey = 'volume', 
  xAxisKey = 'date',
  fill = '#6c757d'
}) => {
  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip 
          formatter={(value) => [value.toLocaleString(), 'Volume']} 
        />
        <Bar dataKey={volumeKey} fill={fill} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default {
  StockLineChart,
  StockAreaChart,
  StockBarChart,
  MultiLineChart,
  StockPieChart,
  PerformanceChart,
  VolumeChart
};