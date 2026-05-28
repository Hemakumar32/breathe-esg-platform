import React, { useState } from 'react';
import { 
  Settings, Search, Plus, Filter, Download, Database, Leaf, Info, X
} from 'lucide-react';

export default function EmissionFactorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const [factors, setFactors] = useState([
    { id: 1, name: 'Electricity - Grid Average (India)', category: 'Purchased Electricity', scope: 'Scope 2', value: 0.82, unit: 'kgCO2e/kWh', source: 'CEA', year: 2023 },
    { id: 2, name: 'Diesel (Stationary Combustion)', category: 'Stationary Combustion', scope: 'Scope 1', value: 2.68, unit: 'kgCO2e/liter', source: 'DEFRA', year: 2024 },
    { id: 3, name: 'Petrol (Mobile Combustion)', category: 'Mobile Combustion', scope: 'Scope 1', value: 2.31, unit: 'kgCO2e/liter', source: 'EPA', year: 2024 },
    { id: 4, name: 'Natural Gas', category: 'Stationary Combustion', scope: 'Scope 1', value: 2.02, unit: 'kgCO2e/m3', source: 'DEFRA', year: 2024 },
    { id: 5, name: 'Air Travel - Short Haul', category: 'Business Travel', scope: 'Scope 3', value: 0.15, unit: 'kgCO2e/pkm', source: 'DEFRA', year: 2023 },
    { id: 6, name: 'Hotel Stay (India)', category: 'Business Travel', scope: 'Scope 3', value: 72.4, unit: 'kgCO2e/night', source: 'DEFRA', year: 2023 },
    { id: 7, name: 'Waste to Landfill', category: 'Waste', scope: 'Scope 3', value: 0.44, unit: 'kgCO2e/kg', source: 'EPA', year: 2024 },
  ]);

  const [scopeFilter, setScopeFilter] = useState('All Scopes');
  const [sourceFilter, setSourceFilter] = useState('All Sources');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFactor, setNewFactor] = useState({ name: '', category: '', scope: 'Scope 1', value: '', unit: '', source: 'Custom', year: new Date().getFullYear() });

  const filteredFactors = factors.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          f.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesScope = scopeFilter === 'All Scopes' || f.scope === scopeFilter;
    const matchesSource = sourceFilter === 'All Sources' || f.source === sourceFilter;
    return matchesSearch && matchesScope && matchesSource;
  });

  const handleExport = () => {
    if (filteredFactors.length === 0) return alert('No factors to export');
    const headers = ['Factor Name', 'Category', 'Scope', 'Value', 'Unit', 'Source', 'Year'];
    const rows = filteredFactors.map(f => [
      `"${f.name}"`, `"${f.category}"`, f.scope, f.value, f.unit, f.source, f.year
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "emission_factors.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddCustomFactor = (e) => {
    e.preventDefault();
    setFactors([...factors, { ...newFactor, id: factors.length + 1, value: parseFloat(newFactor.value) }]);
    setShowAddModal(false);
    setNewFactor({ name: '', category: '', scope: 'Scope 1', value: '', unit: '', source: 'Custom', year: new Date().getFullYear() });
  };

  const getScopeSelectClass = (scope) => {
    let base = "px-3 py-2 border text-sm font-bold rounded-lg outline-none cursor-pointer transition-all shadow-sm ";
    if (scope === 'All Scopes') return base + "border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100/50";
    if (scope === 'Scope 1') return base + "border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100/50";
    if (scope === 'Scope 2') return base + "border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100/50";
    if (scope === 'Scope 3') return base + "border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100/50";
    return base + "border-gray-200 text-gray-600 bg-white";
  };

  const getSourceSelectClass = (source) => {
    let base = "px-3 py-2 border text-sm font-bold rounded-lg outline-none cursor-pointer transition-all shadow-sm ";
    if (source === 'All Sources') return base + "border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100/50";
    if (source === 'DEFRA') return base + "border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100/50";
    if (source === 'EPA') return base + "border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100/50";
    if (source === 'CEA') return base + "border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100/50";
    if (source === 'Custom') return base + "border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100/50";
    return base + "border-gray-200 text-gray-600 bg-white";
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[32px] font-semibold text-[#0f172a] tracking-tight flex items-center gap-2">
            <Settings className="text-gray-500" size={24} /> Emission Factors
          </h1>
          <p className="text-gray-500 text-[15px] mt-2">Manage standard emission factors used for CO₂e calculations across all scopes.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-white text-gray-700 font-bold text-sm rounded-xl border border-gray-200 shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <Download size={16} /> Export
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/10 flex items-center gap-2 transition-all"
          >
            <Plus size={18} strokeWidth={2.5} />
            Add Custom Factor
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3 shadow-sm">
        <Info className="text-emerald-600 shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="text-sm font-bold text-emerald-800">Database Automatically Updated</h3>
          <p className="text-xs text-emerald-600 mt-1 leading-relaxed">
            Your workspace is currently synced with the latest DEFRA 2024 and EPA 2024 emission factor databases. All calculations use the most up-to-date regional standards. Custom factors will override defaults if applied.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        {/* Controls */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, category, or source..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50/50"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={scopeFilter}
              onChange={e => setScopeFilter(e.target.value)}
              className={getScopeSelectClass(scopeFilter)}
            >
              <option value="All Scopes" className="text-indigo-700 bg-indigo-50 font-bold" style={{ color: '#4f46e5', backgroundColor: '#e0e7ff' }}>All Scopes</option>
              <option value="Scope 1" className="text-blue-700 bg-blue-50 font-bold" style={{ color: '#1d4ed8', backgroundColor: '#eff6ff' }}>Scope 1</option>
              <option value="Scope 2" className="text-emerald-700 bg-emerald-50 font-bold" style={{ color: '#047857', backgroundColor: '#ecfdf5' }}>Scope 2</option>
              <option value="Scope 3" className="text-purple-700 bg-purple-50 font-bold" style={{ color: '#7e22ce', backgroundColor: '#faf5ff' }}>Scope 3</option>
            </select>
            <select 
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              className={getSourceSelectClass(sourceFilter)}
            >
              <option value="All Sources" className="text-indigo-700 bg-indigo-50 font-bold" style={{ color: '#4f46e5', backgroundColor: '#e0e7ff' }}>All Sources</option>
              <option value="DEFRA" className="text-blue-700 bg-blue-50 font-bold" style={{ color: '#1d4ed8', backgroundColor: '#eff6ff' }}>DEFRA</option>
              <option value="EPA" className="text-purple-700 bg-purple-50 font-bold" style={{ color: '#7e22ce', backgroundColor: '#faf5ff' }}>EPA</option>
              <option value="CEA" className="text-orange-700 bg-orange-50 font-bold" style={{ color: '#ea580c', backgroundColor: '#fff7ed' }}>CEA</option>
              <option value="Custom" className="text-emerald-700 bg-emerald-50 font-bold" style={{ color: '#047857', backgroundColor: '#ecfdf5' }}>Custom</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto text-sm">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Factor Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Scope</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Value</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Source & Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredFactors.map(factor => (
                <tr key={factor.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2">
                    <Leaf size={14} className="text-gray-400" />
                    {factor.name}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-600">{factor.category}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                      factor.scope === 'Scope 1' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      factor.scope === 'Scope 2' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      'bg-purple-50 text-purple-700 border-purple-100'
                    }`}>
                      {factor.scope}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 text-right">{factor.value.toFixed(2)}</td>
                  <td className="px-6 py-4 font-medium text-gray-500">{factor.unit}</td>
                  <td className="px-6 py-4 font-semibold text-gray-600">
                    {factor.source} <span className="text-gray-400 font-medium">({factor.year})</span>
                  </td>
                </tr>
              ))}
              {filteredFactors.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">No emission factors found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Plus size={20} className="text-blue-600" /> Add Custom Factor</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:bg-white hover:text-gray-900 p-2 rounded-full transition-colors hover:shadow-sm border border-transparent hover:border-gray-200">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCustomFactor} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Factor Name</label>
                  <input type="text" value={newFactor.name} onChange={e => setNewFactor({...newFactor, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50" required placeholder="e.g. Employee Commuting - Train" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                  <input type="text" value={newFactor.category} onChange={e => setNewFactor({...newFactor, category: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50" required placeholder="e.g. Employee Commute" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Scope</label>
                  <select value={newFactor.scope} onChange={e => setNewFactor({...newFactor, scope: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50" required>
                    <option value="Scope 1">Scope 1</option>
                    <option value="Scope 2">Scope 2</option>
                    <option value="Scope 3">Scope 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Value (kgCO₂e)</label>
                  <input type="number" step="0.000001" value={newFactor.value} onChange={e => setNewFactor({...newFactor, value: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50" required placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Unit</label>
                  <input type="text" value={newFactor.unit} onChange={e => setNewFactor({...newFactor, unit: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50" required placeholder="e.g. kgCO2e/pkm" />
                </div>
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-colors">Save Custom Factor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
