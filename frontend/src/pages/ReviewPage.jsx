import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/client';
import { 
  AlertCircle, ChevronRight, ChevronLeft, Lock, 
  Database, Clock, Filter, Download, X, Edit, Check, AlertTriangle, Calendar, Search
} from 'lucide-react';

export default function ReviewPage() {
  const location = useLocation();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, issues: 0, approved: 0 });
  
  // Filtering & Selection state
  const [sourceFilter, setSourceFilter] = useState('All Sources');
  const [statusFilter, setStatusFilter] = useState(location.state?.statusFilter || 'All Statuses');
  const [scopeFilter, setScopeFilter] = useState('All Scopes');
  const [issueFilter, setIssueFilter] = useState(location.state?.issueFilter || 'All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  
  // Side panel state
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeTab, setActiveTab] = useState('Details');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const [selectedCorp, setSelectedCorp] = useState(localStorage.getItem('selectedCorp') || 'Acme Corporation');
  const [actionLoading, setActionLoading] = useState(null); // 'approving', 'rejecting', 'saving'

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

  // Listen to global corporation changes
  useEffect(() => {
    const handleCorpChange = () => {
      setSelectedCorp(localStorage.getItem('selectedCorp') || 'Acme Corporation');
    };
    window.addEventListener('corporationChanged', handleCorpChange);
    return () => window.removeEventListener('corporationChanged', handleCorpChange);
  }, []);

  const fetchRecords = () => {
    setLoading(true);
    api.get('/records/')
      .then(res => {
        setRecords(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    let data = records;
    if (selectedCorp === 'Global Industries') {
      data = records.filter(r => r.source_type === 'SAP');
    } else if (selectedCorp === 'Tech Solutions Inc') {
      data = records.filter(r => r.source_type === 'UTILITY' || r.source_type === 'TRAVEL');
    }
    setStats({
      total: data.length,
      pending: data.filter(r => r.review_status === 'PENDING').length,
      issues: data.filter(r => r.issues && r.issues.length > 0).length,
      approved: data.filter(r => r.review_status === 'APPROVED' || r.review_status === 'LOCKED').length,
    });
  }, [records, selectedCorp]);

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    if (location.state) {
      if (location.state.statusFilter) setStatusFilter(location.state.statusFilter);
      if (location.state.issueFilter) setIssueFilter(location.state.issueFilter);
    }
  }, [location.state]);

  const handleAction = async (id, action) => {
    setActionLoading(action === 'approve' ? 'approving' : 'rejecting');
    try {
      await api.post(`/records/${id}/${action}/`);
      fetchRecords();
      if (selectedRecord && selectedRecord.id === id) {
         setSelectedRecord({...selectedRecord, review_status: action === 'approve' ? 'LOCKED' : 'REJECTED'});
      }
    } catch (err) {
      alert(err.response?.data?.error || `Failed to ${action} record`);
    } finally {
      setActionLoading(null);
    }
  };

  const fetchRecordDetails = async (id) => {
    try {
      const res = await api.get(`/records/${id}/`);
      setSelectedRecord(res.data);
    } catch (err) {
      console.error("Failed to fetch details");
    }
  };

  const handleRowClick = (record) => {
    setSelectedRecord(record);
    setIsEditing(false);
    fetchRecordDetails(record.id);
  };

  const handleBatchAction = async (action) => {
    try {
      await Promise.all(selectedRowIds.map(id => api.post(`/records/${id}/${action}/`)));
      setSelectedRowIds([]);
      fetchRecords();
      if (selectedRecord && selectedRowIds.includes(selectedRecord.id)) {
        setSelectedRecord(prev => prev ? { ...prev, review_status: action === 'approve' ? 'LOCKED' : 'REJECTED' } : null);
      }
    } catch (err) {
      alert(`Failed to perform batch ${action} action`);
    }
  };

  const handleEditToggle = () => {
    if (!isEditing && selectedRecord) {
      setEditForm(selectedRecord.raw_data || {});
    }
    setIsEditing(!isEditing);
  };

  const handleSaveEdit = async () => {
    setActionLoading('saving');
    try {
      const res = await api.put(`/records/${selectedRecord.id}/update/`, { raw_record: editForm });
      setSelectedRecord(res.data);
      setIsEditing(false);
      fetchRecords(); // Refresh the list to update badges
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save record");
    } finally {
      setActionLoading(null);
    }
  };

  const getSourceBadgeColor = (source) => {
    if (source === 'SAP') return 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100/50';
    if (source === 'UTILITY') return 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/50';
    if (source === 'TRAVEL') return 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100/50';
    return 'bg-gray-50 text-gray-700 border-gray-100';
  };

  const getStatusBadgeColor = (status) => {
    if (status === 'APPROVED') return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    if (status === 'LOCKED') return 'bg-slate-800 text-slate-100 border border-slate-700';
    if (status === 'REJECTED') return 'bg-rose-50 text-rose-700 border border-rose-100';
    return 'bg-amber-50 text-amber-700 border border-amber-100';
  };

  const getStatusSelectClass = (status) => {
    let base = "px-3 py-1.5 border text-[13px] font-bold rounded-lg outline-none cursor-pointer transition-all shadow-sm ";
    if (status === 'All Statuses') return base + "border-gray-200 text-gray-700 bg-white hover:bg-gray-50";
    if (status === 'PENDING') return base + "border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100/50";
    if (status === 'LOCKED' || status === 'APPROVED') return base + "border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100/50";
    if (status === 'REJECTED') return base + "border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100/50";
    return base + "border-gray-200 text-gray-700 bg-white";
  };

  const getSourceSelectClass = (source) => {
    let base = "px-3 py-1.5 border text-[13px] font-bold rounded-lg outline-none cursor-pointer transition-all shadow-sm ";
    if (source === 'All Sources') return base + "border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100/50";
    if (source === 'SAP') return base + "border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100/50";
    if (source === 'UTILITY') return base + "border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100/50";
    if (source === 'TRAVEL') return base + "border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100/50";
    return base + "border-gray-200 text-gray-700 bg-white";
  };

  const getScopeSelectClass = (scope) => {
    let base = "px-3 py-1.5 border text-[13px] font-bold rounded-lg outline-none cursor-pointer transition-all shadow-sm ";
    if (scope === 'All Scopes') return base + "border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100/50";
    if (scope === 'Scope 1') return base + "border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100/50";
    if (scope === 'Scope 2') return base + "border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100/50";
    if (scope === 'Scope 3') return base + "border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100/50";
    return base + "border-gray-200 text-gray-700 bg-white";
  };

  const getScopeBadgeColor = (scope) => {
    if (scope === 1) return 'bg-orange-50 text-orange-700 border-orange-100';
    if (scope === 2) return 'bg-blue-50 text-blue-700 border-blue-100';
    if (scope === 3) return 'bg-purple-50 text-purple-700 border-purple-100';
    return 'bg-gray-50 text-gray-700 border-gray-100';
  };

  // Filter logic
  const filteredRecords = records.filter(record => {
    if (selectedCorp === 'Global Industries' && record.source_type !== 'SAP') return false;
    if (selectedCorp === 'Tech Solutions Inc' && record.source_type === 'SAP') return false;

    const matchesSource = sourceFilter === 'All Sources' || record.source_type === sourceFilter;
    const matchesStatus = statusFilter === 'All Statuses' || 
      (statusFilter === 'LOCKED' ? (record.review_status === 'APPROVED' || record.review_status === 'LOCKED') : record.review_status === statusFilter);
    const matchesScope = scopeFilter === 'All Scopes' || String(record.scope) === scopeFilter.replace('Scope ', '');
    const matchesIssues = issueFilter === 'All' || (issueFilter === 'Has Issues' && record.issues && record.issues.length > 0);
    
    let matchesDate = true;
    if (startDate || endDate) {
      const recordDate = new Date(record.created_at).getTime();
      if (startDate && recordDate < new Date(startDate).getTime()) matchesDate = false;
      if (endDate && recordDate > new Date(endDate).getTime() + 86400000) matchesDate = false; // Add 1 day to inclusive end date
    }
    
    return matchesSource && matchesStatus && matchesScope && matchesIssues && matchesDate;
  });

  const handleExport = () => {
    if (filteredRecords.length === 0) return alert('No records to export');
    const headers = ['ID', 'Source', 'Activity', 'Scope', 'Value', 'Unit', 'CO2e', 'Status', 'Date'];
    const rows = filteredRecords.map(r => [
      r.id, r.source_type, r.activity_type, r.scope, r.value, r.unit, r.co2e_kg, r.review_status, new Date(r.created_at).toLocaleDateString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "breathe_esg_records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRowIds(filteredRecords.filter(r => r.review_status === 'PENDING').map(r => r.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleSelectRow = (e, id) => {
    e.stopPropagation();
    if (e.target.checked) {
      setSelectedRowIds(prev => [...prev, id]);
    } else {
      setSelectedRowIds(prev => prev.filter(rowId => rowId !== id));
    }
  };

  // Stats Card Component
  const StatCard = ({ title, value, subtext, icon, iconBg, iconColor, onClick, isActive }) => (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border flex justify-between items-start hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer ${isActive ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-100'}`}
    >
      <div className="space-y-4">
        <p className="text-[13px] font-bold text-gray-500 tracking-wide uppercase">{title}</p>
        <div>
           <p className="text-3xl font-bold text-gray-900 tracking-tight">{value.toLocaleString()}</p>
           <p className="text-xs text-gray-400 mt-1.5 font-medium flex items-center gap-1">{subtext}</p>
        </div>
      </div>
      <div className={`p-3 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
    </div>
  );

  return (
    <div className="relative">
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          display: none;
          -webkit-appearance: none;
        }
      `}</style>
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard 
            title="Total Records" value={stats.total} subtext="Across all sources"
            icon={<Database size={20} strokeWidth={2.5} />} iconBg="bg-blue-50" iconColor="text-blue-500"
            isActive={statusFilter === 'All Statuses' && issueFilter === 'All'}
            onClick={() => { setStatusFilter('All Statuses'); setIssueFilter('All'); }}
          />
          <StatCard 
            title="Pending Review" value={stats.pending} subtext={`${stats.total ? Math.round((stats.pending/stats.total)*100) : 0}% of total`}
            icon={<Clock size={20} strokeWidth={2.5} />} iconBg="bg-amber-50" iconColor="text-amber-500"
            isActive={statusFilter === 'PENDING'}
            onClick={() => { setStatusFilter('PENDING'); setIssueFilter('All'); }}
          />
          <StatCard 
            title="Issues Detected" value={stats.issues} subtext={`${stats.total ? Math.round((stats.issues/stats.total)*100) : 0}% of total`}
            icon={<AlertCircle size={20} strokeWidth={2.5} />} iconBg="bg-rose-50" iconColor="text-rose-500"
            isActive={issueFilter === 'Has Issues'}
            onClick={() => { setStatusFilter('All Statuses'); setIssueFilter('Has Issues'); }}
          />
          <StatCard 
            title="Approved (Locked)" value={stats.approved} subtext={`${stats.total ? Math.round((stats.approved/stats.total)*100) : 0}% of total`}
            icon={<Lock size={20} strokeWidth={2.5} />} iconBg="bg-indigo-50" iconColor="text-indigo-500"
            isActive={statusFilter === 'LOCKED'}
            onClick={() => { setStatusFilter('LOCKED'); setIssueFilter('All'); }}
          />
        </div>

        {/* Filters Bar */}
        <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 gap-4 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-3 shrink-0">
            <select 
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              className={getSourceSelectClass(sourceFilter)}
            >
              <option value="All Sources" className="text-indigo-700 bg-indigo-50 font-bold" style={{ color: '#4f46e5', backgroundColor: '#e0e7ff' }}>All Sources</option>
              <option value="SAP" className="text-blue-700 bg-blue-50 font-bold" style={{ color: '#1d4ed8', backgroundColor: '#eff6ff' }}>SAP Fuel/Procurement</option>
              <option value="UTILITY" className="text-emerald-700 bg-emerald-50 font-bold" style={{ color: '#047857', backgroundColor: '#ecfdf5' }}>Utility Electricity</option>
              <option value="TRAVEL" className="text-purple-700 bg-purple-50 font-bold" style={{ color: '#7e22ce', backgroundColor: '#faf5ff' }}>Corporate Travel</option>
            </select>
            
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 shrink-0">
              {[
                { value: 'All Statuses', label: 'All' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'REJECTED', label: 'Rejected' },
                { value: 'LOCKED', label: 'Locked' },
              ].map(tab => {
                const isActive = statusFilter === tab.value;
                const activeClasses = tab.value === 'PENDING' ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/10' :
                                      tab.value === 'REJECTED' ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/10' :
                                      tab.value === 'LOCKED' ? 'bg-slate-800 text-white shadow-sm shadow-slate-800/10' :
                                      'bg-white text-slate-800 shadow-sm shadow-slate-200/50';
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => {
                      setStatusFilter(tab.value);
                      if (tab.value === 'LOCKED') setIssueFilter('All');
                    }}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                      isActive 
                        ? activeClasses 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

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

            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 shrink-0 whitespace-nowrap">
              <Calendar size={14} className="text-gray-400 shrink-0 cursor-pointer hover:text-blue-500 transition-colors" onClick={() => { const el = document.getElementById('reviewStartDateInput'); if(el && el.showPicker) el.showPicker(); }} />
              <input 
                id="reviewStartDateInput"
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                onClick={e => e.target.showPicker?.()} 
                className="text-[13px] font-semibold text-gray-700 outline-none bg-transparent cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden w-[90px]" 
              />
              <span className="text-gray-400 text-[11px] font-bold px-0.5">to</span>
              <Calendar size={14} className="text-gray-400 shrink-0 cursor-pointer hover:text-blue-500 transition-colors" onClick={() => { const el = document.getElementById('reviewEndDateInput'); if(el && el.showPicker) el.showPicker(); }} />
              <input 
                id="reviewEndDateInput"
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
          <div className="flex shrink-0">
             <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-bold text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors shadow-sm">
               <Download size={14} /> Export
             </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          {loading ? (
             <div className="p-12 text-center text-gray-500 font-medium">Loading records...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-white border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-5 w-10">
                      {filteredRecords.filter(r => r.review_status === 'PENDING').length > 0 && (
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                          checked={selectedRowIds.length === filteredRecords.filter(r => r.review_status === 'PENDING').length}
                          onChange={handleSelectAll}
                        />
                      )}
                    </th>
                    <th className="px-6 py-5 font-bold text-[13px] text-gray-900 tracking-wider">Source</th>
                    <th className="px-6 py-5 font-bold text-[13px] text-gray-900 tracking-wider">Activity</th>
                    <th className="px-6 py-5 font-bold text-[13px] text-gray-900 tracking-wider">Scope</th>
                    <th className="px-6 py-5 font-bold text-[13px] text-gray-900 tracking-wider">Date</th>
                    <th className="px-6 py-5 font-bold text-[13px] text-gray-900 tracking-wider">Value (Unit)</th>
                    <th className="px-6 py-5 font-bold text-[13px] text-gray-900 tracking-wider">CO₂e (kg)</th>
                    <th className="px-6 py-5 font-bold text-[13px] text-gray-900 tracking-wider">Status</th>
                    <th className="px-6 py-5 font-bold text-[13px] text-gray-900 tracking-wider">Issues</th>
                    <th className="px-4 py-5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredRecords.map(record => {
                    const isSelected = selectedRecord?.id === record.id;
                    const isChecked = selectedRowIds.includes(record.id);
                    return (
                      <tr 
                        key={record.id} 
                        onClick={() => handleRowClick(record)}
                        className={`hover:bg-gray-50/80 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/30' : isChecked ? 'bg-gray-50/50' : ''}`}
                      >
                        <td className="px-6 py-5" onClick={e => e.stopPropagation()}>
                          {record.review_status === 'PENDING' && (
                            <input 
                              type="checkbox" 
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                              checked={isChecked}
                              onChange={e => handleSelectRow(e, record.id)}
                            />
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${getSourceBadgeColor(record.source_type)}`}>
                            {record.source_type}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-[13px] font-semibold text-gray-700">{record.activity_type}</td>
                        <td className="px-6 py-5">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase ${getScopeBadgeColor(record.scope)}`}>
                            Scope {record.scope}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-[13px] font-medium text-gray-600">
                           {new Date(record.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-5 text-[13px] font-medium text-gray-600">{record.value} {record.unit}</td>
                        <td className="px-6 py-5 text-[13px] font-semibold text-gray-700">
                          {record.co2e_kg.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${getStatusBadgeColor(record.review_status)}`}>
                            {record.review_status === 'PENDING' ? 'Pending' : record.review_status === 'APPROVED' ? 'Approved' : record.review_status === 'LOCKED' ? 'Locked' : 'Rejected'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-[13px] font-bold">
                          {record.issues?.length > 0 ? (
                            <div className="flex flex-col gap-1.5">
                              {record.issues.map((issue, idx) => (
                                <span key={idx} className="flex items-center gap-1 text-[11px] px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded">
                                  <AlertTriangle size={12} /> {issue.issue}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="px-4 py-5 text-gray-400">
                          <ChevronRight size={18} />
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRecords.length === 0 && (
                     <tr><td colSpan="10" className="px-6 py-16 text-center text-gray-500 font-medium">No records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {!loading && filteredRecords.length > 0 && (
             <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between bg-white">
                <span className="text-[13px] text-gray-500 font-medium">
                  Showing 1 to {Math.min(8, filteredRecords.length)} of {filteredRecords.length === records.length ? '1,248' : filteredRecords.length} records
                </span>
                <div className="flex gap-1.5">
                   <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">&lt;</button>
                   <button className="w-8 h-8 flex items-center justify-center rounded border border-blue-200 bg-blue-50 text-blue-700 font-bold text-sm transition-colors">1</button>
                   <button className="w-8 h-8 flex items-center justify-center rounded border border-transparent text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">2</button>
                   <button className="w-8 h-8 flex items-center justify-center rounded border border-transparent text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">3</button>
                   <span className="flex items-end pb-2 px-1 text-gray-400">...</span>
                   <button className="w-8 h-8 flex items-center justify-center rounded border border-transparent text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">156</button>
                   <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">&gt;</button>
                </div>
             </div>
          )}
        </div>
      </div>

      {/* Slide-over Detail Panel */}
      <div 
        className={`fixed top-20 right-0 h-[calc(100vh-80px)] w-[600px] bg-white border-l border-gray-200 shadow-2xl transform transition-transform duration-300 ease-in-out z-30 flex flex-col ${selectedRecord ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {selectedRecord && (
          <>
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-white shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mt-1">{selectedRecord.activity_type}</h2>
                <p className="text-xs text-gray-500 mt-1">Record ID: #{selectedRecord.id}</p>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                 <X size={20} />
              </button>
            </div>
            
            <div className="px-8 flex gap-8 border-b border-gray-100 text-[13px] font-bold text-gray-500 bg-white shrink-0">
              <button 
                onClick={() => setActiveTab('Details')}
                className={`py-4 border-b-[3px] transition-colors ${activeTab === 'Details' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-gray-700'}`}
              >
                Details
              </button>
              <button 
                onClick={() => setActiveTab('Issues')}
                className={`py-4 border-b-[3px] transition-colors ${activeTab === 'Issues' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-gray-700'}`}
              >
                Issues ({selectedRecord.issues?.length || 0})
              </button>
              <button 
                onClick={() => setActiveTab('History')}
                className={`py-4 border-b-[3px] transition-colors ${activeTab === 'History' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-gray-700'}`}
              >
                History
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 bg-white">
              {activeTab === 'Details' && (
                <>
                  {/* Source Information */}
                  <div className="space-y-4">
                    <h3 className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Source Information</h3>
                    <div className="grid grid-cols-[1.2fr_2fr] gap-y-3.5 text-[13px] border-b border-gray-100 pb-5">
                      <div className="text-gray-500 font-medium">Source Type</div>
                      <div>
                        <span className={`px-2.5 py-1 border rounded-md text-[11px] font-bold ${getSourceBadgeColor(selectedRecord.source_type)}`}>
                          {selectedRecord.source_type}
                        </span>
                      </div>
                      <div className="text-gray-500 font-medium">File</div>
                      <div className="font-semibold text-gray-900 break-all">
                        {selectedRecord.source_type === 'SAP' ? 'SAP_Fuel_May2026.csv' : 
                         selectedRecord.source_type === 'UTILITY' ? 'Utility_Electricity_May2026.csv' : 'Corporate_Travel_May2026.csv'}
                      </div>
                      <div className="text-gray-500 font-medium">Ingestion Run</div>
                      <div className="font-semibold text-gray-900">Run #1024</div>
                      <div className="text-gray-500 font-medium">Uploaded At</div>
                      <div className="font-semibold text-gray-900">
                        {formatDateTime(selectedRecord.created_at)}
                      </div>
                      <div className="text-gray-500 font-medium">Uploaded By</div>
                      <div className="font-semibold text-gray-900">Aisha Singh</div>
                    </div>
                  </div>

                  {/* Split View */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Raw Data Box */}
                    <div className="space-y-3">
                      <h3 className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Raw Uploaded Row</h3>
                      {isEditing ? (
                         <div className="bg-[#0B132B] p-4 rounded-xl border border-gray-800 shadow-inner space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                           {Object.keys(editForm).map(key => (
                             <div key={key} className="space-y-1">
                               <label className="text-[10px] text-gray-400 font-bold uppercase">{key}</label>
                               <input 
                                 type="text" 
                                 value={editForm[key]} 
                                 onChange={e => setEditForm({...editForm, [key]: e.target.value})}
                                 className="w-full bg-[#151f38] text-gray-200 border border-gray-700 rounded p-1.5 text-xs font-mono focus:border-blue-500 focus:outline-none"
                               />
                             </div>
                           ))}
                         </div>
                      ) : (
                        <pre className="bg-[#0B132B] text-gray-300 text-[11px] font-mono leading-relaxed p-4 rounded-xl overflow-x-auto whitespace-pre-wrap max-h-[300px] border border-gray-800 shadow-inner">
                          <code>{JSON.stringify(selectedRecord.raw_data, null, 2)}</code>
                        </pre>
                      )}
                    </div>

                    {/* Normalized Data Box */}
                    <div className="space-y-3">
                      <h3 className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Normalized Data</h3>
                      <pre className="bg-white text-gray-800 text-[11px] font-mono leading-relaxed p-4 rounded-xl overflow-x-auto whitespace-pre-wrap max-h-[300px] border border-blue-200 bg-blue-50/20 shadow-inner">
                        <code>{JSON.stringify({
                          scope: selectedRecord.scope,
                          activity_type: selectedRecord.activity_type,
                          value: selectedRecord.value,
                          unit: selectedRecord.unit,
                          co2e_kg: selectedRecord.co2e_kg
                        }, null, 2)}</code>
                      </pre>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'Issues' && (
                 <div className="space-y-4">
                   {selectedRecord.issues?.length > 0 ? (
                      selectedRecord.issues.map(issue => (
                        <div key={issue.id} className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-start gap-3 shadow-sm">
                           <AlertTriangle size={18} className="text-rose-500 mt-0.5 shrink-0" />
                           <div>
                             <p className="text-[13px] font-bold text-rose-800 uppercase tracking-wide">{issue.severity}</p>
                             <p className="text-[13px] font-medium text-rose-600 mt-1">{issue.issue}</p>
                           </div>
                        </div>
                      ))
                   ) : (
                     <div className="text-center p-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-[13px] font-medium">
                       No issues detected for this record.
                     </div>
                   )}
                 </div>
              )}

              {activeTab === 'History' && (
                <div className="space-y-6">
                  <div className="relative border-l-2 border-gray-100 ml-3 pl-6 space-y-6">
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0 bg-emerald-500 rounded-full w-4 h-4 border-4 border-white"></div>
                      <p className="text-xs text-gray-400 font-medium">
                        {formatDateTime(selectedRecord.created_at)}
                      </p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">Ingested via API</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Source file processed: {selectedRecord.source_type === 'SAP' ? 'SAP_Fuel_May2026.csv' : 
                         selectedRecord.source_type === 'UTILITY' ? 'Utility_Electricity_May2026.csv' : 'Corporate_Travel_May2026.csv'}
                      </p>
                    </div>
                    
                    <div className="relative">
                      <div className={`absolute -left-[31px] top-0 rounded-full w-4 h-4 border-4 border-white ${selectedRecord.issues?.length > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                      <p className="text-xs text-gray-400 font-medium">
                        {formatDateTime(selectedRecord.created_at)}
                      </p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">Automated Validation Check</p>
                      {selectedRecord.issues?.length > 0 ? (
                        <p className="text-xs text-rose-500 mt-0.5 font-medium">{selectedRecord.issues.length} validation issues detected</p>
                      ) : (
                        <p className="text-xs text-emerald-600 mt-0.5 font-medium">All validation checks passed successfully</p>
                      )}
                    </div>

                    {selectedRecord.review_status !== 'PENDING' && (
                      <div className="relative">
                        <div className={`absolute -left-[31px] top-0 rounded-full w-4 h-4 border-4 border-white ${selectedRecord.review_status === 'APPROVED' ? 'bg-emerald-600' : selectedRecord.review_status === 'LOCKED' ? 'bg-slate-800' : 'bg-rose-600'}`}></div>
                        <p className="text-xs text-gray-400 font-medium">Just now</p>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">
                          {selectedRecord.review_status === 'APPROVED' ? 'Approved by Analyst' : selectedRecord.review_status === 'LOCKED' ? 'Locked for Audit' : 'Rejected by Analyst'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">Aisha Singh (Analyst)</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center gap-3 shrink-0">
              {selectedRecord.review_status === 'LOCKED' ? (
                <div className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-500 font-bold text-[13px] rounded-lg border border-slate-200">
                  <Lock size={16} /> Record Locked for Audit
                </div>
              ) : isEditing ? (
                <>
                  <button 
                    disabled={actionLoading === 'saving'}
                    onClick={handleEditToggle} 
                    className="flex-1 flex items-center justify-center py-2.5 border border-gray-200 text-gray-700 font-bold text-[13px] rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                  >
                     Cancel
                  </button>
                  <button 
                    disabled={actionLoading === 'saving'}
                    onClick={handleSaveEdit} 
                    className="flex-1 flex items-center justify-center py-2.5 bg-blue-600 text-white font-bold text-[13px] rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                  >
                     {actionLoading === 'saving' ? (
                       <>
                         <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                         <span>Saving...</span>
                       </>
                     ) : (
                       'Save Changes'
                     )}
                  </button>
                </>
              ) : selectedRecord.review_status === 'REJECTED' ? (
                <>
                  <div className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-rose-50 text-rose-600 font-bold text-[13px] rounded-lg border border-rose-100">
                    <AlertTriangle size={16} /> Rejected
                  </div>
                  <button 
                    disabled={actionLoading}
                    onClick={handleEditToggle} 
                    className="flex-1 flex items-center justify-center py-2.5 border border-gray-200 text-gray-700 font-bold text-[13px] rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                  >
                     Edit to Correct
                  </button>
                </>
              ) : (
                <>
                  <button 
                    disabled={actionLoading}
                    onClick={handleEditToggle} 
                    className="flex-1 flex items-center justify-center py-2.5 border border-gray-200 text-gray-700 font-bold text-[13px] rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                  >
                     Edit
                  </button>
                  <button 
                    disabled={actionLoading}
                    onClick={() => handleAction(selectedRecord.id, 'reject')}
                    className="flex-1 py-2.5 border border-rose-200 text-rose-600 font-bold text-[13px] rounded-lg hover:bg-rose-50 transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                     {actionLoading === 'rejecting' ? (
                       <>
                         <div className="w-3.5 h-3.5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                         <span>Rejecting...</span>
                       </>
                     ) : (
                       'Reject'
                     )}
                  </button>
                  <button 
                    disabled={actionLoading}
                    onClick={() => handleAction(selectedRecord.id, 'approve')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white font-bold text-[13px] rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/10 disabled:opacity-50"
                  >
                     {actionLoading === 'approving' ? (
                       <>
                         <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                         <span>Approving...</span>
                       </>
                     ) : (
                       <>
                         <Check size={16} strokeWidth={3} /> Approve
                       </>
                     )}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Batch Actions Floating Bar */}
      {selectedRowIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-6 z-50 border border-gray-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="text-xs font-semibold text-gray-300 tracking-wider">
            {selectedRowIds.length} record{selectedRowIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="h-4 w-px bg-gray-700"></div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleBatchAction('approve')}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-md shadow-blue-500/10"
            >
              Approve Selected
            </button>
            <button 
              onClick={() => handleBatchAction('reject')}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold transition-all shadow-md"
            >
              Reject Selected
            </button>
            <button 
              onClick={() => setSelectedRowIds([])}
              className="px-3 py-1.5 hover:bg-white/10 text-gray-300 rounded-full text-xs font-bold transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}

