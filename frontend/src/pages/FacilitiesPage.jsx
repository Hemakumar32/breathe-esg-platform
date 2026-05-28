import React, { useState } from 'react';
import { 
  Building2, Search, Plus, Download, MapPin, X, Building
} from 'lucide-react';

export default function FacilitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const [facilities, setFacilities] = useState([
    { id: 1, name: 'Mumbai HQ', type: 'Office', location: 'Mumbai, India', status: 'Active', size: '45,000 sq ft' },
    { id: 2, name: 'Pune Manufacturing Plant', type: 'Factory', location: 'Pune, India', status: 'Active', size: '120,000 sq ft' },
    { id: 3, name: 'Bengaluru R&D Center', type: 'Office', location: 'Bengaluru, India', status: 'Active', size: '25,000 sq ft' },
    { id: 4, name: 'Delhi Distribution Hub', type: 'Warehouse', location: 'New Delhi, India', status: 'Active', size: '85,000 sq ft' },
    { id: 5, name: 'Chennai Office', type: 'Office', location: 'Chennai, India', status: 'Inactive', size: '15,000 sq ft' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newFacility, setNewFacility] = useState({ name: '', type: 'Office', location: '', status: 'Active', size: '' });

  const filteredFacilities = facilities.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    if (filteredFacilities.length === 0) return alert('No facilities to export');
    const headers = ['Name', 'Type', 'Location', 'Status', 'Size'];
    const rows = filteredFacilities.map(f => [
      `"${f.name}"`, f.type, `"${f.location}"`, f.status, `"${f.size}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "facilities.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddFacility = (e) => {
    e.preventDefault();
    setFacilities([...facilities, { ...newFacility, id: facilities.length + 1 }]);
    setShowAddModal(false);
    setNewFacility({ name: '', type: 'Office', location: '', status: 'Active', size: '' });
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="text-indigo-500" size={24} /> Facilities
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage operational sites, offices, and factories tracked for emissions.</p>
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
            Add Facility
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap text-xs">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-900 tracking-wider">Facility Name</th>
                <th className="px-6 py-4 font-bold text-gray-900 tracking-wider">Type</th>
                <th className="px-6 py-4 font-bold text-gray-900 tracking-wider">Location</th>
                <th className="px-6 py-4 font-bold text-gray-900 tracking-wider">Size</th>
                <th className="px-6 py-4 font-bold text-gray-900 tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredFacilities.map(facility => (
                <tr key={facility.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2">
                    <Building size={14} className="text-gray-400" />
                    {facility.name}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-600">{facility.type}</td>
                  <td className="px-6 py-4 font-medium text-gray-500 flex items-center gap-1">
                    <MapPin size={12} className="text-gray-400" /> {facility.location}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600">{facility.size}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                      facility.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {facility.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredFacilities.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">No facilities found.</td>
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
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Plus size={20} className="text-blue-500" /> Add Facility</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:bg-white hover:text-gray-900 p-2 rounded-full transition-colors hover:shadow-sm border border-transparent hover:border-gray-200">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddFacility} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Facility Name</label>
                <input type="text" value={newFacility.name} onChange={e => setNewFacility({...newFacility, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50" required placeholder="e.g. London Office" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Type</label>
                  <select value={newFacility.type} onChange={e => setNewFacility({...newFacility, type: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50" required>
                    <option value="Office">Office</option>
                    <option value="Factory">Factory</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Data Center">Data Center</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                  <select value={newFacility.status} onChange={e => setNewFacility({...newFacility, status: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50" required>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Location</label>
                <input type="text" value={newFacility.location} onChange={e => setNewFacility({...newFacility, location: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50" required placeholder="e.g. London, UK" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Size (sq ft)</label>
                <input type="text" value={newFacility.size} onChange={e => setNewFacility({...newFacility, size: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50" required placeholder="e.g. 50,000 sq ft" />
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-colors">Save Facility</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
