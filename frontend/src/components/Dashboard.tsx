import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Droplets, 
  Leaf,
  Activity,
  BarChart3
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
// Language context available for future translations

// Mock data for charts
const yieldTrendData = [
  { month: 'Jan', corn: 65, wheat: 140, soybeans: 200 },
  { month: 'Feb', corn: 75, wheat: 155, soybeans: 220 },
  { month: 'Mar', corn: 85, wheat: 165, soybeans: 235 },
  { month: 'Apr', corn: 90, wheat: 175, soybeans: 250 },
  { month: 'May', corn: 95, wheat: 180, soybeans: 265 },
  { month: 'Jun', corn: 100, wheat: 185, soybeans: 280 },
];

const soilHealthData = [
  { name: 'pH Level', current: 6.5, optimal: 7 },
  { name: 'Nitrogen', current: 85, optimal: 90 },
  { name: 'Phosphorus', current: 72, optimal: 80 },
  { name: 'Potassium', current: 90, optimal: 85 },
  { name: 'Organic Matter', current: 68, optimal: 75 },
];

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  subtitle: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, subtitle, icon }) => {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 font-medium">{title}</h3>
        <div className="p-2 bg-gray-50 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-3">
        <span className="text-4xl font-bold text-gray-900">{value}</span>
        <span className={`flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full ${
          isPositive 
            ? 'text-green-700 bg-green-100' 
            : 'text-red-700 bg-red-100'
        }`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isPositive ? '+' : ''}{change}%
        </span>
      </div>
      <p className="text-gray-500 text-sm mt-2">{subtitle}</p>
    </div>
  );
};

const Dashboard: React.FC = () => {

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Field Analytics</h1>
            <p className="text-gray-500 mt-1">Data-driven insights for precision agriculture</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
            <span className="text-amber-600 text-xs font-medium">📊 Demo Data</span>
            <span className="text-amber-500 text-xs">Connect sensors for live data</span>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Average Yield Index"
            value="91.2"
            change={5.3}
            subtitle="Compared to last month"
            icon={<Activity className="w-5 h-5 text-primary-600" />}
          />
          <StatCard
            title="Water Efficiency"
            value="87%"
            change={2.1}
            subtitle="Irrigation optimization"
            icon={<Droplets className="w-5 h-5 text-blue-600" />}
          />
          <StatCard
            title="Soil Health Score"
            value="78.8"
            change={-1.2}
            subtitle="Needs attention"
            icon={<Leaf className="w-5 h-5 text-green-600" />}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Yield Performance Trends */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Yield Performance Trends</h3>
            </div>
            <p className="text-gray-500 text-sm mb-6">Monthly yield index across all fields</p>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={yieldTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="soybeans" 
                    stackId="1"
                    stroke="#f59e0b" 
                    fill="#fef3c7" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="wheat" 
                    stackId="1"
                    stroke="#3b82f6" 
                    fill="#dbeafe" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="corn" 
                    stackId="1"
                    stroke="#22c55e" 
                    fill="#dcfce7" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Soil Health Parameters */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Soil Health Parameters</h3>
            </div>
            <p className="text-gray-500 text-sm mb-6">Current vs. optimal levels</p>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={soilHealthData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={11} width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="current" fill="#3b82f6" name="Current" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="optimal" fill="#22c55e" name="Optimal" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-gray-500 text-sm">Active Fields</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-gray-500 text-sm">Total Acreage</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">847</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-gray-500 text-sm">Active Alerts</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">3</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-gray-500 text-sm">Tasks Due</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">7</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
