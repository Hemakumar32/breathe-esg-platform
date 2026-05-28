import React, { useState, useEffect } from 'react';
import { 
  Activity, Filter, Download, Database, Clock, 
  CheckCircle2, AlertTriangle, XCircle, Search, Calendar, ChevronRight, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function IngestionRunsPage() {
  const [sourceFilter, setSourceFilter] = useState('All Sources');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [dateFilter, setDateFilter] = useState('');
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/records/')
      .then(res => {
        const data = res.data;
        if (data && data.length > 0) {
          const runsMap = new Map();
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
                source: r.source_type || 'Unknown',
                file: r.file_name || 'Unknown File',
                user: 'Aisha Singh',
                date: dateStr,
                status: r.issues && r.issues.length > 0 ? 'Completed with Issues' : 'Completed',
                rows: 0,
                color: r.issues && r.issues.length > 0 ? 'text-amber-700 bg-amber-50 border-amber-100' : 'text-emerald-700 bg-emerald-50 border-emerald-100',
                created_at: parsedDate
              });
            }
            runsMap.get(key).rows += 1;
          });
          setRuns(Array.from(runsMap.values()).sort((a, b) => b.created_at.getTime() - a.created_at.getTime()));
        }
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  const filteredRuns = runs.filter(run => {
    const matchesSource = sourceFilter === 'All Sources' || 
                          run.source === sourceFilter || 
                          (run.source && run.source.toUpperCase() === sourceFilter.toUpperCase());
    const matchesStatus = statusFilter === 'All Statuses' || run.status === statusFilter;
    let matchesDate = true;
    if (dateFilter) {
      if (run.created_at && !isNaN(run.created_at.getTime())) {
        try {
          const tzOffset = run.created_at.getTimezoneOffset() || 0;
          const localDate = new Date(run.created_at.getTime() - (tzOffset * 60000)).toISOString().split('T')[0];
          matchesDate = localDate === dateFilter;
        } catch (e) {
          matchesDate = false;
        }
      } else {
        matchesDate = false;
      }
    }
    return matchesSource && matchesStatus && matchesDate;
  });

  const getStatusIcon = (status) => {
    if (status === 'Completed') return <CheckCircle2 size={14} className="text-emerald-500" />;
    if (status === 'Completed with Issues') return <AlertTriangle size={14} className="text-amber-500" />;
    return <XCircle size={14} className="text-rose-500" />;
  };

  const getSourceColor = (source) => {
    const s = source?.toUpperCase();
    if (s === 'SAP') return 'bg-blue-50 text-blue-700 border-blue-100';
    if (s === 'UTILITY') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    return 'bg-purple-50 text-purple-700 border-purple-100';
  };

  const getSourceSelectClass = (source) => {
    let base = "px-4 py-2 border text-sm font-semibold rounded-lg outline-none cursor-pointer transition-all shadow-sm ";
    if (source === 'All Sources') return base + "border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100/50";
    if (source === 'SAP') return base + "border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100/50";
    if (source === 'UTILITY') return base + "border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100/50";
    if (source === 'TRAVEL') return base + "border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100/50";
    return base + "border-gray-200 text-gray-700 bg-white";
  };

  const getStatusSelectClass = (status) => {
    let base = "px-4 py-2 border text-sm font-semibold rounded-lg outline-none cursor-pointer transition-all shadow-sm ";
    if (status === 'All Statuses') return base + "border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100/50";
    if (status === 'Completed') return base + "border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100/50";
    if (status === 'Completed with Issues') return base + "border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100/50";
    if (status === 'Failed') return base + "border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100/50";
    return base + "border-gray-200 text-gray-700 bg-white";
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          display: none;
          -webkit-appearance: none;
        }
      `}</style>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ingestion Runs</h1>
        <p className="text-gray-500 text-sm mt-1">History of all data ingestion activities and execution runs.</p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center bg-white p-3 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 gap-3">
        <div className="flex flex-wrap gap-3">
          <select 
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className={getSourceSelectClass(sourceFilter)}
          >
            <option value="All Sources" className="text-indigo-700 bg-indigo-50 font-bold" style={{ color: '#4f46e5', backgroundColor: '#e0e7ff' }}>All Sources</option>
            <option value="SAP" className="text-blue-700 bg-blue-50 font-bold" style={{ color: '#1d4ed8', backgroundColor: '#eff6ff' }}>SAP</option>
            <option value="UTILITY" className="text-emerald-700 bg-emerald-50 font-bold" style={{ color: '#047857', backgroundColor: '#ecfdf5' }}>Utility</option>
            <option value="TRAVEL" className="text-purple-700 bg-purple-50 font-bold" style={{ color: '#7e22ce', backgroundColor: '#faf5ff' }}>Travel</option>
          </select>
          
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className={getStatusSelectClass(statusFilter)}
          >
            <option value="All Statuses" className="text-indigo-700 bg-indigo-50 font-bold" style={{ color: '#4f46e5', backgroundColor: '#e0e7ff' }}>All Statuses</option>
            <option value="Completed" className="text-emerald-700 bg-emerald-50 font-bold" style={{ color: '#047857', backgroundColor: '#ecfdf5' }}>Completed</option>
            <option value="Completed with Issues" className="text-amber-700 bg-amber-50 font-bold" style={{ color: '#b45309', backgroundColor: '#fef3c7' }}>Completed with Issues</option>
            <option value="Failed" className="text-rose-700 bg-rose-50 font-bold" style={{ color: '#be123c', backgroundColor: '#fff1f2' }}>Failed</option>
          </select>

          <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 hover:bg-gray-50 transition-colors shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
            <Calendar size={14} className="text-gray-400 mr-2 cursor-pointer hover:text-blue-500 transition-colors" onClick={() => { const el = document.getElementById('runStartDateInput'); if(el && el.showPicker) el.showPicker(); }} />
            <input 
              id="runStartDateInput"
              type="date" 
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              onClick={(e) => { if (e.target.showPicker) e.target.showPicker(); }}
              className="py-2 text-sm font-semibold text-gray-700 outline-none bg-transparent cursor-pointer min-w-[120px] [&::-webkit-calendar-picker-indicator]:hidden" 
            />
            {dateFilter && (
               <button onClick={() => setDateFilter('')} className="ml-2 text-gray-400 hover:text-gray-700 p-0.5 rounded transition-colors" title="Clear Date">
                  <XCircle size={14} />
               </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap text-xs">
            <thead className="bg-white border-b border-gray-100">
              <tr>
                <th className="px-6 py-5 font-bold text-gray-900 tracking-wider">Run ID</th>
                <th className="px-6 py-5 font-bold text-gray-900 tracking-wider">Source</th>
                <th className="px-6 py-5 font-bold text-gray-900 tracking-wider">File Name</th>
                <th className="px-6 py-5 font-bold text-gray-900 tracking-wider">Uploaded By</th>
                <th className="px-6 py-5 font-bold text-gray-900 tracking-wider">Uploaded At</th>
                <th className="px-6 py-5 font-bold text-gray-900 tracking-wider">Status</th>
                <th className="px-6 py-5 font-bold text-gray-900 tracking-wider">Rows</th>
                <th className="px-6 py-5 font-bold text-gray-900 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading ingestion runs...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRuns.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500 font-medium">No runs found for selected filters.</td>
                </tr>
              ) : (
                filteredRuns.map((run, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5 font-bold text-gray-900">{run.id}</td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 border rounded-md text-[10px] font-bold ${getSourceColor(run.source)}`}>
                        {run.source}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-semibold text-gray-800">{run.file}</td>
                    <td className="px-6 py-5 font-medium text-gray-600">{run.user}</td>
                    <td className="px-6 py-5 text-gray-500 font-medium">{run.date}</td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 w-fit ${run.color}`}>
                        {getStatusIcon(run.status)}
                        {run.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-bold text-gray-700">{run.rows}</td>
                    <td className="px-6 py-5 text-right">
                      <Link to="/review" className="p-1.5 border border-gray-200 hover:bg-gray-50 rounded-lg text-gray-500 hover:text-gray-900 transition-colors inline-flex items-center gap-1 shadow-sm">
                        <Eye size={14} /> Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredRuns.length > 0 && (
          <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between bg-white text-xs">
            <span className="text-gray-500 font-medium">
              Showing 1 to {filteredRuns.length} of {runs.length === filteredRuns.length ? '58' : filteredRuns.length} runs
            </span>
            <div className="flex gap-1.5">
              <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">&lt;</button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-blue-200 bg-blue-50 text-blue-700 font-bold transition-colors">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-transparent text-gray-600 font-bold hover:bg-gray-50 transition-colors">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-transparent text-gray-600 font-bold hover:bg-gray-50 transition-colors">3</button>
              <span className="flex items-end pb-2 px-1 text-gray-400">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-transparent text-gray-600 font-bold hover:bg-gray-50 transition-colors">12</button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">&gt;</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
