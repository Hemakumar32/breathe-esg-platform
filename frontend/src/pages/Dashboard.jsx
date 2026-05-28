import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { 
  Database, Clock, AlertCircle, Lock, 
  TrendingUp, BarChart3, ShieldCheck, ChevronRight, Activity, ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, issues: 0, approved: 0 });
  const [recentRuns, setRecentRuns] = useState([]);
  const [scopeData, setScopeData] = useState({ scope1: 0, scope2: 0, scope3: 0, total: 0 });
  const [topSources, setTopSources] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [trendFilter, setTrendFilter] = useState(6);
  const [selectedCorp, setSelectedCorp] = useState(localStorage.getItem('selectedCorp') || 'Acme Corporation');

  // Listen to global corporation changes
  useEffect(() => {
    const handleCorpChange = () => {
      setSelectedCorp(localStorage.getItem('selectedCorp') || 'Acme Corporation');
    };
    window.addEventListener('corporationChanged', handleCorpChange);
    return () => window.removeEventListener('corporationChanged', handleCorpChange);
  }, []);

  // Load records from backend
  useEffect(() => {
    api.get('/records/')
      .then(res => {
        setAllRecords(res.data);
      })
      .catch(err => console.log("Using mockup stats fallback", err));
  }, []);

  // Recalculate statistics when records or corporation changes
  useEffect(() => {
    if (!allRecords || allRecords.length === 0) return;

    let data = allRecords;
    if (selectedCorp === 'Global Industries') {
      data = allRecords.filter(r => r.source_type === 'SAP');
    } else if (selectedCorp === 'Tech Solutions Inc') {
      data = allRecords.filter(r => r.source_type === 'UTILITY' || r.source_type === 'TRAVEL');
    }

    setStats({
      total: data.length,
      pending: data.filter(r => r.review_status === 'PENDING').length,
      issues: data.filter(r => r.issues && r.issues.length > 0).length,
      approved: data.filter(r => r.review_status === 'APPROVED' || r.review_status === 'LOCKED').length,
    });

    // Group by file_name and source_type for runs
    const runsMap = new Map();
    let s1 = 0, s2 = 0, s3 = 0;
    const sourcesMap = new Map();

    data.forEach(r => {
      const key = `${r.source_type || 'Unknown'}-${r.file_name || 'Unknown'}`;
      if (!runsMap.has(key)) {
        let parsedDate = null;
        let dateStr = 'Unknown Date';
        if (r.created_at) {
          const d = new Date(r.created_at);
          if (!isNaN(d.getTime())) {
            parsedDate = d;
            try {
              dateStr = d.toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              });
            } catch (e) {
              dateStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
            }
          }
        }
        if (!parsedDate) {
          parsedDate = new Date(0);
        }
        runsMap.set(key, {
          id: `#${r.id}`,
          type: r.source_type || 'Unknown',
          file: r.file_name || 'Unknown File',
          date: dateStr,
          status: r.issues && r.issues.length > 0 ? 'Completed with Issues' : 'Completed',
          color: r.issues && r.issues.length > 0 ? 'text-amber-700 bg-amber-50 border-amber-100' : 'text-emerald-700 bg-emerald-50 border-emerald-100',
          created_at: parsedDate.getTime()
        });
      }

      if (r.scope === 1) s1 += r.co2e_kg;
      if (r.scope === 2) s2 += r.co2e_kg;
      if (r.scope === 3) s3 += r.co2e_kg;
      
      const sourceName = r.activity_type || r.source_type;
      sourcesMap.set(sourceName, (sourcesMap.get(sourceName) || 0) + r.co2e_kg);
    });
    
    const totalCo2 = s1 + s2 + s3;
    setScopeData({
      scope1: totalCo2 ? Math.round((s1 / totalCo2) * 100) : 0,
      scope2: totalCo2 ? Math.round((s2 / totalCo2) * 100) : 0,
      scope3: totalCo2 ? Math.round((s3 / totalCo2) * 100) : 0,
      total: Math.round(totalCo2)
    });
    
    const sortedSources = Array.from(sourcesMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, val]) => ({ name, value: Math.round(val) }));
    setTopSources(sortedSources);

    setRecentRuns(Array.from(runsMap.values()).sort((a, b) => b.created_at - a.created_at).slice(0, 5));
  }, [allRecords, selectedCorp]);

  const activeMonths = React.useMemo(() => {
    const n = trendFilter;
    const result = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short' });
      result.push({ key, label, value: 0 });
    }
    
    allRecords.forEach(r => {
      const d = new Date(r.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const match = result.find(m => m.key === key);
      if (match) match.value += r.co2e_kg;
    });
    return result;
  }, [allRecords, trendFilter]);

  const maxVal = Math.max(...activeMonths.map(m => m.value), 100);
  const chartMax = maxVal * 1.2; // 20% padding

  const getY = (val) => 170 - (val / chartMax) * 150;
  const getX = (index) => activeMonths.length === 1 ? 300 : 50 + (index / (activeMonths.length - 1)) * 500;

  const linePath = activeMonths.map((m, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)},${getY(m.value)}`).join(' ');
  const areaPath = `${linePath} L ${activeMonths.length > 0 ? getX(activeMonths.length - 1) : 550},170 L 50,170 Z`;

  const formatYLabel = (val) => {
    if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
    return Math.round(val).toString();
  };

  const StatCard = ({ title, value, subtext, icon, iconBg, iconColor, linkTo, linkState }) => (
    <Link to={linkTo} state={linkState} className="block">
      <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex justify-between items-start hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 h-full">
        <div className="space-y-4">
          <p className="text-[13px] font-bold text-gray-500 tracking-wide uppercase">{title}</p>
          <div>
             <p className="text-3xl font-bold text-gray-900 tracking-tight">{value.toLocaleString()}</p>
             <p className="text-xs text-gray-400 mt-1.5 font-medium">{subtext}</p>
          </div>
        </div>
        <div className={`p-3 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
      </div>
    </Link>
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Welcome Message */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[32px] font-semibold text-[#0f172a] tracking-tight">Dashboard</h1>
          <p className="text-gray-500 text-[15px] mt-2">Monitor reporting progress, approval status, and recent data ingestion activity in one place.</p>
        </div>
        <div className="text-xs font-semibold text-gray-400 bg-white border border-gray-100 px-4 py-2.5 rounded-xl shadow-sm">
          Last updated: Just now
        </div>
      </div>

      {/* Stats cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Total Records" value={stats.total} subtext="Across all sources"
          icon={<Database size={20} strokeWidth={2.5} />} iconBg="bg-blue-50" iconColor="text-blue-500" linkTo="/review"
          linkState={{ statusFilter: 'All Statuses', issueFilter: 'All' }}
        />
        <StatCard 
          title="Pending Review" value={stats.pending} subtext={`${stats.total ? Math.round((stats.pending/stats.total)*100) : 0}% of total`}
          icon={<Clock size={20} strokeWidth={2.5} />} iconBg="bg-amber-50" iconColor="text-amber-500" linkTo="/review"
          linkState={{ statusFilter: 'PENDING', issueFilter: 'All' }}
        />
        <StatCard 
          title="Issues Detected" value={stats.issues} subtext={`${stats.total ? Math.round((stats.issues/stats.total)*100) : 0}% of total`}
          icon={<AlertCircle size={20} strokeWidth={2.5} />} iconBg="bg-rose-50" iconColor="text-rose-500" linkTo="/review"
          linkState={{ statusFilter: 'All Statuses', issueFilter: 'Has Issues' }}
        />
        <StatCard 
          title="Approved (Locked)" value={stats.approved} subtext={`${stats.total ? Math.round((stats.approved/stats.total)*100) : 0}% of total`}
          icon={<Lock size={20} strokeWidth={2.5} />} iconBg="bg-indigo-50" iconColor="text-indigo-500" linkTo="/review"
          linkState={{ statusFilter: 'LOCKED', issueFilter: 'All' }}
        />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Trends (t CO₂e/mth)</h3>
              <p className="text-xs text-gray-400 mt-0.5">Carbon emissions history</p>
            </div>
            <select 
              value={trendFilter} 
              onChange={e => setTrendFilter(Number(e.target.value))}
              className="px-3 py-1.5 border border-gray-200 text-xs font-bold text-gray-600 rounded-lg bg-white outline-none cursor-pointer hover:bg-gray-50"
            >
              <option value={3}>Last 3 Months</option>
              <option value={6}>Last 6 Months</option>
              <option value={12}>Last 12 Months</option>
            </select>
          </div>
          
          {/* Custom SVG Line Chart */}
          <div className="w-full h-64 relative pt-4">
            <svg viewBox="0 0 600 220" className="w-full h-full">
              {/* Grids */}
              <line x1="50" y1="20" x2="550" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="50" y1="70" x2="550" y2="70" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="50" y1="120" x2="550" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="50" y1="170" x2="550" y2="170" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              
              {/* Grid Y Labels */}
              <text x="40" y="24" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="end">{formatYLabel(chartMax)}</text>
              <text x="40" y="74" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="end">{formatYLabel(chartMax * 0.66)}</text>
              <text x="40" y="124" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="end">{formatYLabel(chartMax * 0.33)}</text>
              <text x="40" y="174" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="end">0</text>

              {/* Area Gradient Fill */}
              <defs>
                <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area Plot */}
              {activeMonths.length > 0 && (
                <>
                  <path d={areaPath} fill="url(#chartAreaGrad)" />
                  <path 
                    d={linePath} 
                    fill="none" 
                    stroke="#3b82f6" 
                    strokeWidth="3.5" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Interactive Dots */}
                  {activeMonths.map((m, i) => (
                    <circle key={i} cx={getX(i)} cy={getY(m.value)} r={i === activeMonths.length - 1 ? 6 : 5} fill={i === activeMonths.length - 1 ? "#3b82f6" : "#ffffff"} stroke={i === activeMonths.length - 1 ? "#ffffff" : "#3b82f6"} strokeWidth={i === activeMonths.length - 1 ? 2 : 2.5} />
                  ))}

                  {/* Tooltip line & marker for active month */}
                  <line x1={getX(activeMonths.length - 1)} y1="20" x2={getX(activeMonths.length - 1)} y2="170" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />

                  {/* X Axis Labels */}
                  {activeMonths.map((m, i) => (
                    <text key={i} x={getX(i)} y="195" fill={i === activeMonths.length - 1 ? "#3b82f6" : "#64748b"} fontSize={i === activeMonths.length - 1 ? "11" : "10"} fontWeight="bold" textAnchor="middle">{m.label}</text>
                  ))}
                </>
              )}
            </svg>
            
            {/* Custom Tooltip */}
            {activeMonths.length > 0 && (
              <div 
                className="absolute top-4 bg-gray-900 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold shadow-md pointer-events-none transform -translate-x-1/2"
                style={{ left: `${(getX(activeMonths.length - 1) / 600) * 100}%` }}
              >
                <p className="text-gray-400">{activeMonths[activeMonths.length - 1].label} Total</p>
                <p className="text-blue-400 text-xs mt-0.5">{Math.round(activeMonths[activeMonths.length - 1].value).toLocaleString()} kg CO₂e</p>
              </div>
            )}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">By Scope</h3>
            <p className="text-xs text-gray-400 mt-0.5">Emissions split percentage</p>
          </div>

          <div className="flex flex-col items-center py-4">
            {/* Custom SVG Donut Chart */}
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
                {/* Scope 1 */}
                <circle cx="80" cy="80" r="60" fill="transparent" stroke="#f97316" strokeWidth="18" strokeDasharray={`${(scopeData.scope1 / 100) * 377} 377`} strokeDashoffset="0" />
                {/* Scope 2 */}
                <circle cx="80" cy="80" r="60" fill="transparent" stroke="#3b82f6" strokeWidth="18" strokeDasharray={`${(scopeData.scope2 / 100) * 377} 377`} strokeDashoffset={-((scopeData.scope1 / 100) * 377)} />
                {/* Scope 3 */}
                <circle cx="80" cy="80" r="60" fill="transparent" stroke="#a855f7" strokeWidth="18" strokeDasharray={`${(scopeData.scope3 / 100) * 377} 377`} strokeDashoffset={-((scopeData.scope1 + scopeData.scope2) / 100) * 377} />
              </svg>
              {/* Centered Total */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{scopeData.total.toLocaleString()}</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Total kg CO₂e</span>
              </div>
            </div>
          </div>
 
          {/* Legends */}
          <div className="space-y-2 border-t border-gray-50 pt-4">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#f97316] rounded-full"></span>
                <span className="text-gray-500 font-semibold">Scope 1 (Direct)</span>
              </div>
              <span className="font-bold text-gray-900">{scopeData.scope1}%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#3b82f6] rounded-full"></span>
                <span className="text-gray-500 font-semibold">Scope 2 (Indirect)</span>
              </div>
              <span className="font-bold text-gray-900">{scopeData.scope2}%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#a855f7] rounded-full"></span>
                <span className="text-gray-500 font-semibold">Scope 3 (Supply Chain)</span>
              </div>
              <span className="font-bold text-gray-900">{scopeData.scope3}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Sources */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Top Sources by CO₂e</h3>
            <p className="text-xs text-gray-400 mt-0.5">Highest emitting fuel & resource types</p>
          </div>
          
          <div className="space-y-5">
            {topSources.length > 0 ? topSources.map((source, idx) => {
               const maxVal = topSources[0].value;
               const percent = Math.max(5, Math.round((source.value / maxVal) * 100));
               const colors = ["bg-blue-500", "bg-emerald-500", "bg-purple-500"];
               return (
                 <div key={idx} className="space-y-2">
                   <div className="flex justify-between text-xs font-semibold">
                     <span className="text-gray-700">{source.name}</span>
                     <span className="text-gray-900 font-bold">{source.value.toLocaleString()} kg</span>
                   </div>
                   <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                     <div className={`h-full ${colors[idx % colors.length]} rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
                   </div>
                 </div>
               );
            }) : (
               <div className="text-xs text-gray-400">No data available</div>
            )}
          </div>
        </div>

        {/* Recent Ingestion Runs */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Recent Ingestion Runs</h3>
              <p className="text-xs text-gray-400 mt-0.5">Logs of files parsed and normalized</p>
            </div>
            <Link to="/runs" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
              View all runs <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto text-[15px]">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Record ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Data Source</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted By</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentRuns.map(run => (
                  <tr key={run.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 text-xs font-bold text-gray-900">{run.id}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        run.type === 'SAP' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        run.type === 'UTILITY' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        'bg-purple-50 text-purple-700 border-purple-100'
                      }`}>
                        {run.type}
                      </span>
                    </td>
                    <td className="py-4 text-xs font-semibold text-gray-600 truncate max-w-[150px]" title={run.file}>
                      {run.file}
                    </td>
                    <td className="py-4 text-xs text-gray-500 font-medium">{run.date}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${run.color}`}>
                        {run.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
