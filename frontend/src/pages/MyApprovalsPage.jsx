import React, { useState, useEffect } from 'react';
import { 
  Check, X, Database, Clock, Filter, AlertTriangle, 
  Search, Calendar, ChevronRight, AlertCircle, Info, Lock
} from 'lucide-react';
import api from '../api/client';

export default function MyApprovalsPage() {
  const [activeTab, setActiveTab] = useState('Pending');
  const [sourceFilter, setSourceFilter] = useState('All Sources');
  const [scopeFilter, setScopeFilter] = useState('All Scopes');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  
  // Selection
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  
  // Details slide-over
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [panelTab, setPanelTab] = useState('Details');

  const [records, setRecords] = useState([]);
  const [selectedCorp, setSelectedCorp] = useState(localStorage.getItem('selectedCorp') || 'Acme Corporation');
  const [actionLoading, setActionLoading] = useState(null); // 'approving', 'rejecting'

  // Listen to global corporation changes
  useEffect(() => {
    const handleCorpChange = () => {
      setSelectedCorp(localStorage.getItem('selectedCorp') || 'Acme Corporation');
    };
    window.addEventListener('corporationChanged', handleCorpChange);
    return () => window.removeEventListener('corporationChanged', handleCorpChange);
  }, []);

  const fetchRecords = () => {
    api.get('/records/')
      .then(res => {
        const data = res.data.map(r => ({
          ...r,
          priority: 'Medium',
          issues: r.issues || []
        }));
        setRecords(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Handle approvals
  const handleAction = async (id, action) => {
    setActionLoading(action === 'approve' ? 'approving' : 'rejecting');
    try {
      await api.post(`/records/${id}/${action}/`);
      fetchRecords();
      if (selectedRecord && selectedRecord.id === id) {
        setSelectedRecord(prev => ({ ...prev, review_status: action === 'approve' ? 'LOCKED' : 'REJECTED' }));
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || `Failed to ${action} record`);
    } finally {
      setActionLoading(null);
    }
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
      console.error(err);
      alert(err.response?.data?.error || "Failed to perform batch action");
    }
  };

  // Filter logic
  const filteredRecords = records.filter(rec => {
    if (selectedCorp === 'Global Industries' && rec.source_type !== 'SAP') return false;
    if (selectedCorp === 'Tech Solutions Inc' && rec.source_type === 'SAP') return false;

    // Tab filter
    const matchesTab = 
      (activeTab === 'Pending' && rec.review_status === 'PENDING') ||
      (activeTab === 'Approved' && (rec.review_status === 'APPROVED' || rec.review_status === 'LOCKED')) ||
      (activeTab === 'Rejected' && rec.review_status === 'REJECTED');
      
    const matchesSource = sourceFilter === 'All Sources' || rec.source_type === sourceFilter;
    const matchesScope = scopeFilter === 'All Scopes' || `Scope ${rec.scope}` === scopeFilter;
    const matchesPriority = priorityFilter === 'All Priorities' || rec.priority === priorityFilter;
    
    return matchesTab && matchesSource && matchesScope && matchesPriority;
  });

  const getSourceBadgeColor = (source) => {
    if (source === 'SAP') return 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100/50';
    if (source === 'UTILITY') return 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/50';
    if (source === 'TRAVEL') return 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100/50';
    return 'bg-gray-50 text-gray-700 border-gray-100';
  };

  const getPriorityBadgeColor = (prio) => {
    if (prio === 'High') return 'text-rose-700 bg-rose-50 border-rose-100';
    if (prio === 'Medium') return 'text-amber-700 bg-amber-50 border-amber-100';
    return 'text-blue-700 bg-blue-50 border-blue-100';
  };

  const getPrioritySelectClass = (prio) => {
    let base = "px-4 py-2 border text-sm font-semibold rounded-lg outline-none cursor-pointer transition-colors shadow-sm ";
    if (prio === 'All Priorities') return base + "border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100/50";
    if (prio === 'High') return base + "border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100/50";
    if (prio === 'Medium') return base + "border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100/50";
    if (prio === 'Low') return base + "border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100/50";
    return base + "border-gray-200 text-gray-700 bg-white";
  };

  const getSourceSelectClass = (source) => {
    let base = "px-4 py-2 border text-sm font-semibold rounded-lg outline-none cursor-pointer transition-colors shadow-sm ";
    if (source === 'All Sources') return base + "border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100/50";
    if (source === 'SAP') return base + "border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100/50";
    if (source === 'UTILITY') return base + "border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100/50";
    if (source === 'TRAVEL') return base + "border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100/50";
    return base + "border-gray-200 text-gray-700 bg-white";
  };

  const getScopeSelectClass = (scope) => {
    let base = "px-4 py-2 border text-sm font-semibold rounded-lg outline-none cursor-pointer transition-colors shadow-sm ";
    if (scope === 'All Scopes') return base + "border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100/50";
    if (scope === 'Scope 1') return base + "border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100/50";
    if (scope === 'Scope 2') return base + "border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100/50";
    if (scope === 'Scope 3') return base + "border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100/50";
    return base + "border-gray-200 text-gray-700 bg-white";
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRowIds(filteredRecords.map(r => r.id));
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

  return (
    <div className="relative">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Approvals</h1>
          <p className="text-gray-500 text-sm mt-1">Review and approve carbon emission records assigned to you.</p>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-gray-200 text-xs font-bold text-gray-400 gap-6 select-none">
          {['Pending', 'Approved', 'Rejected'].map(tab => {
            const count = records.filter(r => {
              if (selectedCorp === 'Global Industries' && r.source_type !== 'SAP') return false;
              if (selectedCorp === 'Tech Solutions Inc' && r.source_type === 'SAP') return false;
              return (tab === 'Pending' && r.review_status === 'PENDING') ||
                     (tab === 'Approved' && (r.review_status === 'APPROVED' || r.review_status === 'LOCKED')) ||
                     (tab === 'Rejected' && r.review_status === 'REJECTED');
            }).length;
            return (
              <button 
                key={tab}
                onClick={() => { setActiveTab(tab); setSelectedRowIds([]); }}
                className={`py-3.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === tab ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-gray-700'
                }`}
              >
                <span>{tab}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${activeTab === tab ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filters Panel */}
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

            <select 
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className={getPrioritySelectClass(priorityFilter)}
            >
              <option value="All Priorities" className="text-indigo-700 bg-indigo-50 font-bold" style={{ color: '#4f46e5', backgroundColor: '#e0e7ff' }}>All Priorities</option>
              <option value="High" className="text-rose-700 bg-rose-50 font-bold" style={{ color: '#be123c', backgroundColor: '#fff1f2' }}>High</option>
              <option value="Medium" className="text-amber-700 bg-amber-50 font-bold" style={{ color: '#b45309', backgroundColor: '#fef3c7' }}>Medium</option>
              <option value="Low" className="text-blue-700 bg-blue-50 font-bold" style={{ color: '#1d4ed8', backgroundColor: '#eff6ff' }}>Low</option>
            </select>
          </div>
        </div>

        {/* Table List */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap text-xs">
              <thead className="bg-white border-b border-gray-100">
                <tr>
                  <th className="px-6 py-5 w-10">
                    {activeTab === 'Pending' && (
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        checked={filteredRecords.length > 0 && selectedRowIds.length === filteredRecords.length}
                        onChange={handleSelectAll}
                      />
                    )}
                  </th>
                  <th className="px-6 py-5 font-bold text-gray-900 tracking-wider">Source</th>
                  <th className="px-6 py-5 font-bold text-gray-900 tracking-wider">Activity</th>
                  <th className="px-6 py-5 font-bold text-gray-900 tracking-wider">Date</th>
                  <th className="px-6 py-5 font-bold text-gray-900 tracking-wider">CO₂e (kg)</th>
                  <th className="px-6 py-5 font-bold text-gray-900 tracking-wider">Priority</th>
                  <th className="px-6 py-5 font-bold text-gray-900 tracking-wider">Issues</th>
                  <th className="px-4 py-5 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredRecords.map((record) => {
                  const isSelected = selectedRecord?.id === record.id;
                  const isChecked = selectedRowIds.includes(record.id);
                  return (
                    <tr 
                      key={record.id} 
                      onClick={() => setSelectedRecord(record)}
                      className={`hover:bg-gray-50/80 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/30' : isChecked ? 'bg-gray-50/50' : ''}`}
                    >
                      <td className="px-6 py-5" onClick={e => e.stopPropagation()}>
                        {activeTab === 'Pending' && (
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            checked={isChecked}
                            onChange={e => handleSelectRow(e, record.id)}
                          />
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2.5 py-1 border rounded-md text-[10px] font-bold ${getSourceBadgeColor(record.source_type)}`}>
                          {record.source_type}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-semibold text-gray-700">{record.activity_type}</td>
                      <td className="px-6 py-5 text-gray-500 font-medium">
                        {new Date(record.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-5 font-semibold text-gray-700">
                        {record.co2e_kg.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityBadgeColor(record.priority)}`}>
                          {record.priority}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {record.issues.length > 0 ? (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded text-[10px] font-bold">{record.issues.length}</span>
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
                  <tr>
                    <td colSpan="8" className="px-6 py-16 text-center text-gray-500 font-medium">No records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredRecords.length > 0 && (
            <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between bg-white text-xs">
              <span className="text-gray-500 font-medium">
                Showing 1 to {filteredRecords.length} of {filteredRecords.length} records
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

      {/* Details Sliding Side Panel */}
      <div 
        className={`fixed top-20 right-0 h-[calc(100vh-80px)] w-[420px] bg-white border-l border-gray-200 shadow-2xl transform transition-transform duration-300 ease-in-out z-30 flex flex-col ${selectedRecord ? 'translate-x-0' : 'translate-x-full'}`}
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
                onClick={() => setPanelTab('Details')}
                className={`py-4 border-b-[3px] transition-colors ${panelTab === 'Details' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-gray-700'}`}
              >
                Details
              </button>
              <button 
                onClick={() => setPanelTab('Issues')}
                className={`py-4 border-b-[3px] transition-colors ${panelTab === 'Issues' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:text-gray-700'}`}
              >
                Issues ({selectedRecord.issues.length})
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 bg-white text-xs">
              {panelTab === 'Details' && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Source Information</h3>
                    <div className="grid grid-cols-[1.2fr_2fr] gap-y-3.5 border-b border-gray-100 pb-5">
                      <div className="text-gray-500 font-medium">Source Type</div>
                      <div>
                        <span className={`px-2.5 py-1 border rounded-md text-[10px] font-bold ${getSourceBadgeColor(selectedRecord.source_type)}`}>
                          {selectedRecord.source_type}
                        </span>
                      </div>
                      <div className="text-gray-500 font-medium">File</div>
                      <div className="font-semibold text-gray-900 break-all">
                        {selectedRecord.source_type === 'SAP' ? 'SAP_Fuel_May2026.csv' : 'Utility_Electricity_May2026.csv'}
                      </div>
                      <div className="text-gray-500 font-medium">Uploaded At</div>
                      <div className="font-semibold text-gray-900">
                        {new Date(selectedRecord.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Raw Data</h3>
                    <pre className="bg-[#0B132B] text-gray-300 text-[10px] font-mono leading-relaxed p-4 rounded-xl overflow-x-auto whitespace-pre-wrap max-h-40 border border-gray-800 shadow-inner">
                      <code>{JSON.stringify(selectedRecord.raw_data, null, 2)}</code>
                    </pre>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Normalized Data</h3>
                    <div className="grid grid-cols-[1.2fr_1.8fr] gap-y-3.5">
                      <div className="text-gray-500 font-medium">Activity Type</div>
                      <div className="font-semibold text-gray-900">{selectedRecord.activity_type}</div>
                      
                      <div className="text-gray-500 font-medium">Scope</div>
                      <div>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase ${
                          selectedRecord.scope === 1 ? 'bg-orange-50 text-orange-700 border-orange-100' :
                          selectedRecord.scope === 2 ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          'bg-purple-50 text-purple-700 border-purple-100'
                        }`}>
                          Scope {selectedRecord.scope}
                        </span>
                      </div>
                      
                      <div className="text-gray-500 font-medium">Value</div>
                      <div className="font-semibold text-gray-900">{selectedRecord.value} {selectedRecord.unit}</div>
                      
                      <div className="text-gray-500 font-medium">CO₂e (kg)</div>
                      <div className="font-bold text-base text-emerald-600">
                        {selectedRecord.co2e_kg.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {panelTab === 'Issues' && (
                 <div className="space-y-4">
                   {selectedRecord.issues.length > 0 ? (
                      selectedRecord.issues.map(issue => (
                        <div key={issue.id} className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-start gap-3 shadow-sm text-xs">
                           <AlertTriangle size={18} className="text-rose-500 mt-0.5 shrink-0" />
                           <div>
                             <p className="font-bold text-rose-800 uppercase tracking-wide">{issue.severity}</p>
                             <p className="font-medium text-rose-600 mt-1">{issue.issue}</p>
                           </div>
                        </div>
                      ))
                   ) : (
                     <div className="text-center p-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200 font-medium">
                       No issues detected.
                     </div>
                   )}
                 </div>
              )}
            </div>

            {/* Bottom Actions */}
            {selectedRecord.review_status === 'PENDING' && (
              <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center gap-3 shrink-0">
              <button 
                disabled={actionLoading}
                onClick={() => handleAction(selectedRecord.id, 'reject')}
                className="flex-1 py-2.5 border border-rose-200 text-rose-600 font-bold rounded-lg hover:bg-rose-50 transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
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
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/10 disabled:opacity-50"
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
            </div>
            )}
          </>
        )}
      </div>

      {/* Batch Actions Floating Bar */}
      {selectedRowIds.length > 0 && activeTab === 'Pending' && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-6 z-50 border border-gray-800 animate-in fade-in slide-in-from-bottom-4 duration-300 text-xs">
          <span className="font-semibold text-gray-300 tracking-wider">
            {selectedRowIds.length} approval{selectedRowIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="h-4 w-px bg-gray-700"></div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleBatchAction('approve')}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-all shadow-md shadow-blue-500/10"
            >
              Approve Selected
            </button>
            <button 
              onClick={() => handleBatchAction('reject')}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold transition-all shadow-md"
            >
              Reject Selected
            </button>
            <button 
              onClick={() => setSelectedRowIds([])}
              className="px-3 py-1.5 hover:bg-white/10 text-gray-300 rounded-full font-bold transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
