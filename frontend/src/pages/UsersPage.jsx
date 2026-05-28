import React, { useState } from 'react';
import { 
  Users, Search, Plus, Download, Mail, X, Shield
} from 'lucide-react';

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const [users, setUsers] = useState([
    { id: 1, name: 'Aisha Singh', email: 'aisha.s@breatheesg.com', role: 'Analyst', lastActive: '2 mins ago', status: 'Active' },
    { id: 2, name: 'Rohit Kumar', email: 'rohit.k@breatheesg.com', role: 'Admin', lastActive: '1 hr ago', status: 'Active' },
    { id: 3, name: 'Priya Mehta', email: 'priya.m@breatheesg.com', role: 'Viewer', lastActive: 'Yesterday', status: 'Active' },
    { id: 4, name: 'Arjun Patel', email: 'arjun.p@breatheesg.com', role: 'Analyst', lastActive: '3 days ago', status: 'Invited' },
  ]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Viewer' });

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    if (filteredUsers.length === 0) return alert('No users to export');
    const headers = ['Name', 'Email', 'Role', 'Status', 'Last Active'];
    const rows = filteredUsers.map(u => [
      `"${u.name}"`, `"${u.email}"`, u.role, u.status, `"${u.lastActive}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "platform_users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInviteUser = (e) => {
    e.preventDefault();
    setUsers([...users, { ...newUser, id: users.length + 1, status: 'Invited', lastActive: 'Never' }]);
    setShowInviteModal(false);
    setNewUser({ name: '', email: '', role: 'Viewer' });
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-indigo-500" size={24} /> Platform Users
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage team members, roles, and access permissions across the workspace.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-white text-gray-700 font-bold text-sm rounded-xl border border-gray-200 shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <Download size={16} /> Export
          </button>
          <button 
            onClick={() => setShowInviteModal(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/10 flex items-center gap-2 transition-all"
          >
            <Plus size={18} strokeWidth={2.5} />
            Invite User
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..."
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
                <th className="px-6 py-4 font-bold text-gray-900 tracking-wider">User</th>
                <th className="px-6 py-4 font-bold text-gray-900 tracking-wider">Role</th>
                <th className="px-6 py-4 font-bold text-gray-900 tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold text-gray-900 tracking-wider">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                        {user.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{user.name}</p>
                        <p className="text-gray-500 flex items-center gap-1 mt-0.5"><Mail size={10} /> {user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 font-semibold text-gray-600">
                      <Shield size={14} className={user.role === 'Admin' ? 'text-rose-500' : 'text-gray-400'} />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      user.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-500">{user.lastActive}</td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500 font-medium">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Plus size={20} className="text-blue-500" /> Invite User</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:bg-white hover:text-gray-900 p-2 rounded-full transition-colors hover:shadow-sm border border-transparent hover:border-gray-200">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleInviteUser} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                <input type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50" required placeholder="e.g. Jane Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                <input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50" required placeholder="jane@breatheesg.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Role</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50/50" required>
                  <option value="Admin">Admin (Full Access)</option>
                  <option value="Analyst">Analyst (Edit & Review)</option>
                  <option value="Viewer">Viewer (Read Only)</option>
                </select>
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setShowInviteModal(false)} className="flex-1 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-colors">Send Invitation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
