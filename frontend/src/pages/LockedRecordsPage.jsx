import React, { useState, useEffect } from 'react';
import { 
  Lock, Filter, Download, Database, Calendar, 
  Search, ChevronRight, CheckCircle2, User, Clock, X
} from 'lucide-react';
import api from '../api/client';

export default function LockedRecordsPage() {
  const [sourceFilter, setSourceFilter] = useState('All Sources');
  const [scopeFilter, setScopeFilter] = useState('All Scopes');

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCorp, setSelectedCorp] = useState(localStorage.getItem('selectedCorp') || 'Acme Corporation');

  // Listen to global corporation changes
  useEffect(() => {
    const handleCorpChange = () => {
      setSelectedCorp(localStorage.getItem('selectedCorp') || 'Acme Corporation');
    };
    window.addEventListener('corporationChanged', handleCorpChange);
    return () => window.removeEventListener('corporationChanged', handleCorpChange);
  }, []);

  useEffect(() => {
    api.get('/records/')
      .then(res => {
        // Exclusively show LOCKED records
        setRecords(res.data.filter(r => r.review_status === 'LOCKED'));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredRecords = records.filter(rec => {
    if (selectedCorp === 'Global Industries' && rec.source_type !== 'SAP') return false;
    if (selectedCorp === 'Tech Solutions Inc' && rec.source_type === 'SAP') return false;

    const matchesSource = sourceFilter === 'All Sources' || rec.source_type === sourceFilter;
    const matchesScope = scopeFilter === 'All Scopes' || String(rec.scope) === scopeFilter.replace('Scope ', '');
    
    let matchesDate = true;
    if (startDate || endDate) {
      const recordDate = new Date(rec.created_at).getTime();
      if (startDate && recordDate < new Date(startDate).getTime()) matchesDate = false;
      if (endDate && recordDate > new Date(endDate).getTime() + 86400000) matchesDate = false;
    }
    
    return matchesSource && matchesScope && matchesDate;
  });

  const handleExport = () => {
    if (filteredRecords.length === 0) return alert('No records to export');
    const headers = ['Record ID', 'Source', 'Activity', 'Scope', 'Value', 'Unit', 'CO2e (kg)', 'Locked Date'];
    const rows = filteredRecords.map(r => [
      r.id, r.source_type, r.activity_type, r.scope, r.value, r.unit, r.co2e_kg, new Date(r.created_at).toLocaleDateString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "locked_audit_records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSourceBadgeColor = (source) => {
    const s = source?.toUpperCase();
    if (s === 'SAP') return 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100/50';
    if (s === 'UTILITY') return 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/50';
    return 'bg-purple-50 text-purple-700 border-purple-100';
  };

  const getSourceSelectClass = (source) => {
    let base = "px-4 py-2 border text-sm font-semibold rounded-lg outline-none cursor-pointer transition-all shadow-sm ";
    const s = source?.toUpperCase();
    if (source === 'All Sources') return base + "border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100/50";
    if (s === 'SAP') return base + "border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100/50";
    if (s === 'UTILITY') return base + "border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100/50";
    if (s === 'TRAVEL') return base + "border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100/50";
    return base + "border-gray-200 text-gray-700 bg-white";
  };

  const getScopeSelectClass = (scope) => {
    let base = "px-4 py-2 border text-sm font-semibold rounded-lg outline-none cursor-pointer transition-all shadow-sm ";
    if (scope === 'All Scopes') return base + "border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100/50";
    if (scope === 'Scope 1') return base + "border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100/50";
    if (scope === 'Scope 2') return base + "border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100/50";
    if (scope === 'Scope 3') return base + "border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100/50";
    return base + "border-gray-200 text-gray-700 bg-white";
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Unknown Date';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Unknown Date';
    try {
      return d.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          display: none;
          -webkit-appearance: none;
        }
      `}</style>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[32px] font-semibold text-[#0f172a] tracking-tight flex items-center gap-2">
            <Lock className="text-slate-700" size={24} /> Locked Audit Records
          </h1>
          <p className="text-gray-500 text-[15px] mt-2">finalized, read-only carbon accounting records locked for external corporate audits.</p>
        </div>
        <div className="px-3.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm">
          <Lock size={14} /> Immutable Audit Ledger
        </div>
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
            value={scopeFilter}
            onChange={e => setScopeFilter(e.target.value)}
            className={getScopeSelectClass(scopeFilter)}
          >
            <option value="All Scopes" className="text-indigo-700 bg-indigo-50 font-bold" style={{ color: '#4f46e5', backgroundColor: '#e0e7ff' }}>All Scopes</option>
            <option value="Scope 1" className="text-orange-700 bg-orange-50 font-bold" style={{ color: '#ea580c', backgroundColor: '#fff7ed' }}>Scope 1</option>
            <option value="Scope 2" className="text-blue-700 bg-blue-50 font-bold" style={{ color: '#1d4ed8', backgroundColor: '#eff6ff' }}>Scope 2</option>
            <option value="Scope 3" className="text-purple-700 bg-purple-50 font-bold" style={{ color: '#7e22ce', backgroundColor: '#faf5ff' }}>Scope 3</option>
          </select>

          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 shrink-0 whitespace-nowrap">
            <Calendar size={14} className="text-gray-400 shrink-0 cursor-pointer hover:text-blue-500 transition-colors" onClick={() => { const el = document.getElementById('lockedStartDateInput'); if(el && el.showPicker) el.showPicker(); }} />
            <input 
              id="lockedStartDateInput"
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
              onClick={e => e.target.showPicker?.()} 
              className="text-[13px] font-semibold text-gray-700 outline-none bg-transparent cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden w-[90px]" 
            />
            <span className="text-gray-400 text-[11px] font-bold px-0.5">to</span>
            <Calendar size={14} className="text-gray-400 shrink-0 cursor-pointer hover:text-blue-500 transition-colors" onClick={() => { const el = document.getElementById('lockedEndDateInput'); if(el && el.showPicker) el.showPicker(); }} />
            <input 
              id="lockedEndDateInput"
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
              onClick={e => e.target.showPicker?.()} 
              className="text-[13px] font-semibold text-gray-700 outline-none bg-transparent cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden w-[90px]" 
            />
            {(startDate || endDate) && (
              <button onClick={() => { setStartDate(''); setEndDate(''); }} className="ml-1 text-gray-400 hover:text-gray-700 p-0.5 rounded transition-colors" title="Clear Dates">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-3 pr-2">
           <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors shadow-sm bg-white">
             <Download size={16} /> Export Audit Ledger
           </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto text-sm">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Record ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Source Data</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Raw Value</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Calculated CO2e</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Security status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Locked timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading locked records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5 font-bold text-gray-900">
                    #{record.id}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1 border rounded-md text-[10px] font-bold ${getSourceBadgeColor(record.source_type)}`}>
                      {record.source_type}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-semibold text-gray-700">{record.activity_type} (Scope {record.scope})</td>
                  <td className="px-6 py-5 font-bold text-gray-700 text-right">
                    {record.value.toLocaleString()} {record.unit}
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-700 text-right">
                    {record.co2e_kg.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} kg
                  </td>
                  <td className="px-6 py-5 font-semibold text-gray-700 flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-700 border border-slate-200">
                      🔒
                    </div>
                    Locked
                  </td>
                  <td className="px-6 py-5 text-gray-400 font-semibold">{formatDateTime(record.created_at)}</td>
                </tr>
              ))}
              {!loading && filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500 font-medium">No locked records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredRecords.length > 0 && (
          <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between bg-white text-xs">
            <span className="text-gray-500 font-medium">
              Showing 1 to {filteredRecords.length} of {records.length} records
            </span>
            <div className="flex gap-1.5">
              <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">&lt;</button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-blue-200 bg-blue-50 text-blue-700 font-bold transition-colors">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">&gt;</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
