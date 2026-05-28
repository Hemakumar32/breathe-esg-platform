import React, { useState } from 'react';
import { Database, Plus, RefreshCw, Settings, Search, MoreVertical, Link as LinkIcon, FileUp, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DataSourcesPage() {
  const [sources, setSources] = useState([
    {
      id: 1,
      name: 'SAP ERP - Fuel',
      type: 'ERP System',
      method: 'Manual CSV',
      status: 'Active',
      lastSync: 'May 28, 2026',
      color: 'blue',
      description: 'Fuel & Procurement data from main SAP instance'
    },
    {
      id: 2,
      name: 'Utility Provider API',
      type: 'Utility',
      method: 'Manual CSV',
      status: 'Active',
      lastSync: 'May 28, 2026',
      color: 'emerald',
      description: 'Electricity and water meter readings'
    },
    {
      id: 3,
      name: 'Corporate Travel Portal',
      type: 'Travel',
      method: 'Manual CSV',
      status: 'Active',
      lastSync: 'May 27, 2026',
      color: 'purple',
      description: 'Employee flight and accommodation records'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);

  // Connection settings state
  const [configStatus, setConfigStatus] = useState('Active');
  const [configMethod, setConfigMethod] = useState('Manual CSV');
  const [apiEndpoint, setApiEndpoint] = useState('https://api.sap.acme.com/v1/emissions');
  const [apiKey, setApiKey] = useState('••••••••••••••••••••••••••••••••');
  const [sftpHost, setSftpHost] = useState('sftp.acme.com');
  const [sftpPath, setSftpPath] = useState('/uploads/esg/');

  const filteredSources = sources.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'All' || s.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleConfigureClick = (source) => {
    setSelectedSource(source);
    setConfigStatus(source.status);
    setConfigMethod(source.method);
    if (source.name.includes('API')) {
      setApiEndpoint('https://utility.api.powergrid.in/v2/usage');
    } else if (source.name.includes('Travel')) {
      setSftpHost('sftp.corporate-travel.com');
    }
    setShowConfigureModal(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newSource = {
      id: Date.now(),
      name: formData.get('name') || 'New Integration',
      type: formData.get('type') || 'Custom',
      method: 'Manual CSV',
      status: 'Pending',
      lastSync: 'Never',
      color: 'gray',
      description: formData.get('description') || 'Custom data integration'
    };
    setSources([...sources, newSource]);
    setShowAddModal(false);
  };
  const getColorClasses = (color) => {
    switch(color) {
      case 'blue': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'emerald': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'purple': return 'bg-purple-50 text-purple-700 border-purple-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Sources</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your data integrations, CSV templates, and connection settings.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/10 flex items-center gap-2 transition-all"
        >
          <Plus size={18} strokeWidth={2.5} />
          Add Data Source
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search data sources..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"
            />
          </div>
          <div className="flex gap-3 relative">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="px-4 py-2 border border-gray-200 text-sm font-bold text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
            >
              Filter: {filterType}
            </button>
            {showFilterDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-10 py-1 overflow-hidden">
                {['All', 'ERP System', 'Utility', 'Travel', 'Custom'].map(type => (
                  <button 
                    key={type}
                    onClick={() => { setFilterType(type); setShowFilterDropdown(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filteredSources.map(source => (
            <div key={source.id} className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors group bg-white shadow-sm hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold border uppercase ${getColorClasses(source.color)}`}>
                  {source.type}
                </span>
                <button className="text-gray-400 hover:text-gray-900 transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
              
              <h3 className="text-base font-bold text-gray-900">{source.name}</h3>
              <p className="text-xs text-gray-500 mt-1.5 h-8 line-clamp-2">{source.description}</p>
              
              <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-500" /> Status
                  </span>
                  <span className="font-bold text-gray-900">{source.status}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium flex items-center gap-1.5">
                    <LinkIcon size={14} className="text-gray-400" /> Method
                  </span>
                  <span className="font-bold text-gray-900">{source.method}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium flex items-center gap-1.5">
                    <RefreshCw size={14} className="text-gray-400" /> Last Upload
                  </span>
                  <span className="font-bold text-gray-900">{source.lastSync}</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link 
                  to="/upload" 
                  state={{ sourceType: source.type === 'ERP System' ? 'SAP' : source.type === 'Utility' ? 'UTILITY' : source.type === 'Travel' ? 'TRAVEL' : 'SAP' }}
                  className="flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg transition-colors border border-gray-200"
                >
                  <FileUp size={14} /> Upload Data
                </Link>
                <button 
                  onClick={() => handleConfigureClick(source)}
                  className="flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg transition-colors border border-gray-200"
                >
                  <Settings size={14} /> Configure
                </button>
              </div>
            </div>
          ))}

          {/* Add New Placeholder Card */}
          <div 
            onClick={() => setShowAddModal(true)}
            className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors min-h-[280px]"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-4">
              <Plus size={24} />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Add New Integration</h3>
            <p className="text-xs text-gray-500 mt-1">Connect API or set up a new CSV template mapping</p>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Add Data Source</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 font-bold p-1">
                ✕
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
               <div>
                 <label className="block text-xs font-bold text-gray-700 mb-1">Source Name</label>
                 <input name="name" required type="text" placeholder="e.g. Acme API" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500" />
               </div>
               <div>
                 <label className="block text-xs font-bold text-gray-700 mb-1">Category / Type</label>
                 <select name="type" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500">
                   <option value="ERP System">ERP System</option>
                   <option value="Utility">Utility</option>
                   <option value="Travel">Travel</option>
                   <option value="Custom">Custom</option>
                 </select>
               </div>
               <div>
                 <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                 <textarea name="description" rows="2" placeholder="Brief description of this data..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"></textarea>
               </div>
               <div className="pt-4 flex gap-3">
                 <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors text-sm">Cancel</button>
                 <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-colors text-sm">Save Source</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Configure Modal */}
      {showConfigureModal && selectedSource && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Configure {selectedSource.name}</h2>
              <button onClick={() => setShowConfigureModal(false)} className="text-gray-400 hover:text-gray-600 font-bold p-1">
                ✕
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              setSources(prev => prev.map(s => s.id === selectedSource.id ? { ...s, status: configStatus, method: configMethod } : s));
              setShowConfigureModal(false);
            }} className="p-6 space-y-5">
              <p className="text-xs text-gray-500">Manage connection settings and CSV mappings for <strong className="text-gray-700">{selectedSource.type}</strong> integrations.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Connection Status</label>
                  <select 
                    value={configStatus}
                    onChange={e => setConfigStatus(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sync Method</label>
                  <select 
                    value={configMethod}
                    onChange={e => setConfigMethod(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                  >
                    <option value="Manual CSV">Manual CSV</option>
                    <option value="Automated API Sync">Automated API Sync</option>
                    <option value="SFTP Ingestion">SFTP Ingestion</option>
                  </select>
                </div>
                  
                {configMethod === 'Automated API Sync' && (
                  <div className="space-y-3.5 border-t border-gray-100 pt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">API Endpoint URL</label>
                      <input 
                        type="text" 
                        value={apiEndpoint}
                        onChange={e => setApiEndpoint(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50" 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">API Secret Key</label>
                      <input 
                        type="password" 
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50" 
                        required
                      />
                    </div>
                  </div>
                )}
                {configMethod === 'SFTP Ingestion' && (
                  <div className="space-y-3.5 border-t border-gray-100 pt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">SFTP Host Address</label>
                      <input 
                        type="text" 
                        value={sftpHost}
                        onChange={e => setSftpHost(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50" 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">SFTP Directory Path</label>
                      <input 
                        type="text" 
                        value={sftpPath}
                        onChange={e => setSftpPath(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50" 
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowConfigureModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-colors text-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
