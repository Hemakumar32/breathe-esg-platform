import React, { useState } from 'react';
import { 
  Ruler, Search, Plus, Download, Filter, X
} from 'lucide-react';

export default function UnitsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  
  const [units, setUnits] = useState([
    { id: 1, name: 'Kilogram', symbol: 'kg', category: 'Mass', isBase: true, conversion: '1', system: 'Metric' },
    { id: 2, name: 'Tonne', symbol: 't', category: 'Mass', isBase: false, conversion: '1000 kg', system: 'Metric' },
    { id: 3, name: 'Pound', symbol: 'lb', category: 'Mass', isBase: false, conversion: '0.453592 kg', system: 'Imperial' },
    { id: 4, name: 'Liter', symbol: 'L', category: 'Volume', isBase: true, conversion: '1', system: 'Metric' },
    { id: 5, name: 'Gallon (US)', symbol: 'gal', category: 'Volume', isBase: false, conversion: '3.78541 L', system: 'Imperial' },
    { id: 6, name: 'Kilowatt Hour', symbol: 'kWh', category: 'Energy', isBase: true, conversion: '1', system: 'Metric' },
    { id: 7, name: 'Megawatt Hour', symbol: 'MWh', category: 'Energy', isBase: false, conversion: '1000 kWh', system: 'Metric' },
    { id: 8, name: 'Kilometer', symbol: 'km', category: 'Distance', isBase: true, conversion: '1', system: 'Metric' },
    { id: 9, name: 'Mile', symbol: 'mi', category: 'Distance', isBase: false, conversion: '1.60934 km', system: 'Imperial' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newUnit, setNewUnit] = useState({ name: '', symbol: '', category: 'Mass', isBase: false, conversion: '', system: 'Custom' });

  const filteredUnits = units.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || u.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleExport = () => {
    if (filteredUnits.length === 0) return alert('No units to export');
    const headers = ['Name', 'Symbol', 'Category', 'System', 'Base Unit', 'Conversion Rate'];
    const rows = filteredUnits.map(u => [
      `"${u.name}"`, `"${u.symbol}"`, u.category, u.system, u.isBase ? 'Yes' : 'No', `"${u.conversion}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "measurement_units.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddCustomUnit = (e) => {
    e.preventDefault();
    setUnits([...units, { ...newUnit, id: units.length + 1 }]);
    setShowAddModal(false);
    setNewUnit({ name: '', symbol: '', category: 'Mass', isBase: false, conversion: '', system: 'Custom' });
  };

  const getCategorySelectClass = (category) => {
    let base = "px-3 py-2 border text-sm font-bold rounded-lg outline-none cursor-pointer transition-all shadow-sm ";
    if (category === 'All Categories') return base + "border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100/50";
    if (category === 'Mass') return base + "border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100/50";
    if (category === 'Volume') return base + "border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100/50";
    if (category === 'Energy') return base + "border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100/50";
    if (category === 'Distance') return base + "border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100/50";
    return base + "border-gray-200 text-gray-600 bg-white";
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Ruler className="text-gray-500" size={24} /> Measurement Units
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage physical units and their automatic conversion rates for calculations.</p>
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
            Add Custom Unit
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by unit name or symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50/50"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className={getCategorySelectClass(categoryFilter)}
            >
              <option value="All Categories" className="text-indigo-700 bg-indigo-50 font-bold" style={{ color: '#4f46e5', backgroundColor: '#e0e7ff' }}>All Categories</option>
              <option value="Mass" className="text-blue-700 bg-blue-50 font-bold" style={{ color: '#1d4ed8', backgroundColor: '#eff6ff' }}>Mass</option>
              <option value="Volume" className="text-emerald-700 bg-emerald-50 font-bold" style={{ color: '#047857', backgroundColor: '#ecfdf5' }}>Volume</option>
              <option value="Energy" className="text-orange-700 bg-orange-50 font-bold" style={{ color: '#ea580c', backgroundColor: '#fff7ed' }}>Energy</option>
              <option value="Distance" className="text-purple-700 bg-purple-50 font-bold" style={{ color: '#7e22ce', backgroundColor: '#faf5ff' }}>Distance</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap text-xs">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-900 tracking-wider">Unit Name</th>
                <th className="px-6 py-4 font-bold text-gray-900 tracking-wider">Symbol</th>
                <th className="px-6 py-4 font-bold text-gray-900 tracking-wider">Category</th>
                <th className="px-6 py-4 font-bold text-gray-900 tracking-wider">System</th>
                <th className="px-6 py-4 font-bold text-gray-900 tracking-wider">Conversion to Base</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUnits.map(unit => (
                <tr key={unit.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2">
                    {unit.name}
                    {unit.isBase && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase">Base Unit</span>}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-500 bg-gray-50/50">
                    <span className="px-2 py-1 rounded bg-white border border-gray-200">{unit.symbol}</span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-600">{unit.category}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                      unit.system === 'Metric' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      unit.system === 'Imperial' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-purple-50 text-purple-700 border-purple-100'
                    }`}>
                      {unit.system}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600">
                    {unit.isBase ? <span className="text-gray-400 italic">--</span> : unit.conversion}
                  </td>
                </tr>
              ))}
              {filteredUnits.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">No units found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Plus size={20} className="text-blue-500" /> Add Custom Unit</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:bg-white hover:text-gray-900 p-2 rounded-full transition-colors hover:shadow-sm border border-transparent hover:border-gray-200">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCustomUnit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Unit Name</label>
                  <input type="text" value={newUnit.name} onChange={e => setNewUnit({...newUnit, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50" required placeholder="e.g. Gigajoule" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Symbol</label>
                  <input type="text" value={newUnit.symbol} onChange={e => setNewUnit({...newUnit, symbol: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50" required placeholder="e.g. GJ" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                  <select value={newUnit.category} onChange={e => setNewUnit({...newUnit, category: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50" required>
                    <option value="Mass">Mass</option>
                    <option value="Volume">Volume</option>
                    <option value="Energy">Energy</option>
                    <option value="Distance">Distance</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Conversion to Base Unit</label>
                  <input type="text" value={newUnit.conversion} onChange={e => setNewUnit({...newUnit, conversion: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50" required placeholder="e.g. 277.778 kWh" />
                </div>
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-colors">Save Unit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
