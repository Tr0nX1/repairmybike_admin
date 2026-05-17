'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Download, Calendar, Filter, TrendingUp, Users, Package, Banknote } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

// Sample data - In a real app, this would come from API hooks
const revenueData = [
  { date: '2026-05-10', cash: 4500, online: 1200 },
  { date: '2026-05-11', cash: 3200, online: 2100 },
  { date: '2026-05-12', cash: 5100, online: 1500 },
  { date: '2026-05-13', cash: 4800, online: 2400 },
  { date: '2026-05-14', cash: 6200, online: 3100 },
  { date: '2026-05-15', cash: 3900, online: 1800 },
  { date: '2026-05-16', cash: 5500, online: 2200 },
];

const bookingStatusData = [
  { name: 'Completed', value: 45, color: '#10B981' },
  { name: 'Cancelled', value: 5, color: '#EF4444' },
  { name: 'In Progress', value: 12, color: '#3B82F6' },
  { name: 'Pending', value: 8, color: '#F59E0B' },
];

const topPartsData = [
  { name: 'Brake Pads', usage: 124, revenue: 15400 },
  { name: 'Engine Oil', usage: 98, revenue: 44100 },
  { name: 'Chain Lube', usage: 86, revenue: 12900 },
  { name: 'Spark Plug', usage: 72, revenue: 10800 },
  { name: 'Air Filter', usage: 64, revenue: 19200 },
];

const mechanicPerformance = [
  { name: 'Rahul S.', jobs: 42, rating: 4.8, revenue: 24500 },
  { name: 'Amit K.', jobs: 38, rating: 4.6, revenue: 21200 },
  { name: 'Vikram P.', jobs: 35, rating: 4.9, revenue: 19800 },
  { name: 'Suresh M.', jobs: 28, rating: 4.5, revenue: 15600 },
];

export default function ReportsPage() {
  const [dateRange, setFilters] = useState('week');

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Business Reports" 
        subtitle="Analyze revenue, booking trends and operational performance"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 bg-white">
              <Calendar className="h-3.5 w-3.5" />
              {dateRange === 'week' ? 'Last 7 Days' : 'Last 30 Days'}
            </Button>
            <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 bg-white">
              <Download className="h-3.5 w-3.5" />
              Export PDF
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="bg-slate-100/50 p-1 border h-11 w-full justify-start gap-1">
          <TabsTrigger value="revenue" className="text-xs font-bold uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
            <Banknote className="h-3.5 w-3.5 mr-2" /> Revenue
          </TabsTrigger>
          <TabsTrigger value="bookings" className="text-xs font-bold uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
            <TrendingUp className="h-3.5 w-3.5 mr-2" /> Bookings
          </TabsTrigger>
          <TabsTrigger value="parts" className="text-xs font-bold uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
            <Package className="h-3.5 w-3.5 mr-2" /> Parts Usage
          </TabsTrigger>
          <TabsTrigger value="mechanics" className="text-xs font-bold uppercase data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
            <Users className="h-3.5 w-3.5 mr-2" /> Mechanics
          </TabsTrigger>
        </TabsList>

        {/* REVENUE TAB */}
        <TabsContent value="revenue" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Total Revenue</CardDescription>
                <CardTitle className="text-3xl font-black text-[#378ADD]">₹48,500</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-[10px] font-bold text-green-600 uppercase">
                  <TrendingUp className="h-3 w-3 mr-1" /> +12.5% from last period
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Cash Collected</CardDescription>
                <CardTitle className="text-3xl font-black text-slate-800">₹32,200</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">66% of total revenue</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Online Payments</CardDescription>
                <CardTitle className="text-3xl font-black text-slate-800">₹16,300</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">34% of total revenue</div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Revenue Trend</CardTitle>
              <CardDescription className="text-xs">Daily breakdown of cash vs online payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 'bold' }} 
                      dy={10}
                      tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 'bold' }} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 'bold' }} />
                    <Bar dataKey="cash" name="Cash" fill="#378ADD" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="online" name="Online" fill="#93C5FD" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BOOKINGS TAB */}
        <TabsContent value="bookings" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider">Booking Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={bookingStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {bookingStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider">Daily Bookings Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 'bold' }}
                        tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="cash" stroke="#378ADD" strokeWidth={3} dot={{ r: 4, fill: '#378ADD', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* PARTS USAGE TAB */}
        <TabsContent value="parts" className="mt-6">
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Most Used Spare Parts</CardTitle>
              <CardDescription className="text-xs">Top 10 parts by consumption volume</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Part Name</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Qty Used</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {topPartsData.map((part, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-slate-700">{part.name}</td>
                      <td className="px-6 py-4 text-xs font-black text-center">{part.usage}</td>
                      <td className="px-6 py-4 text-xs font-black text-right text-[#378ADD]">₹{part.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MECHANICS PERFORMANCE TAB */}
        <TabsContent value="mechanics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mechanicPerformance.map((mech, i) => (
              <Card key={i} className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs uppercase">
                      {mech.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <Badge className="bg-green-50 text-green-700 border-green-100 text-[10px] font-black">★ {mech.rating}</Badge>
                  </div>
                  <CardTitle className="text-sm font-bold mt-3">{mech.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium uppercase text-[10px] tracking-tight">Jobs Done</span>
                    <span className="font-black">{mech.jobs}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium uppercase text-[10px] tracking-tight">Revenue</span>
                    <span className="font-black text-[#378ADD]">₹{mech.revenue.toLocaleString()}</span>
                  </div>
                  <Button variant="outline" className="w-full h-8 text-[10px] font-bold uppercase tracking-wider" size="sm">View History</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
