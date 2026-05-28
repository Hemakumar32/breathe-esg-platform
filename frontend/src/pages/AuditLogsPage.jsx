import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Download, ShieldAlert, CheckCircle2, XCircle
} from 'lucide-react';
import api from '../api/client';

export default function AuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/audit-logs/')
      .then(res => {
        const data = res.data.map(l => {
          let dateStr = 'Unknown Date';
          if (l.created_at) {
            const d = new Date(l.created_at);
            if (!isNaN(d.getTime())) {
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
          return {
            id: `AL-100${l.id}`,
            action: l.action,
            user: l.user,
            timestamp: dateStr,
            details: l.details,
            ip: l.ip_address,
            status: l.status
          };
        });
        setLogs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    if (filteredLogs.length === 0) return alert('No logs to export');
    const headers = ['Log ID', 'Action', 'User', 'Timestamp', 'Details', 'IP Address', 'Status'];
    const rows = filteredLogs.map(l => [
      l.id, `"${l.action}"`, `"${l.user}"`, `"${l.timestamp}"`, `"${l.details}"`, l.ip, l.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "audit_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIcon = (status) => {
    if (status === 'Success') return <CheckCircle2 size={14} className="text-emerald-500" />;
    if (status === 'Warning') return <ShieldAlert size={14} className="text-amber-500" />;
    return <XCircle size={14} className="text-rose-500" />;
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-indigo-500" size={24} /> Audit Logs
          </h1>
          <p className="text-gray-500 text-sm mt-1">Immutable record of all system events, data mutations, and access attempts.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-white text-gray-700 font-bold text-sm rounded-xl border border-gray-200 shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <Download size={16} /> Export Logs
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by action, user, or details..."
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
                <th className="px-6 py-4 font-bold text-gray-900 tracking-wider">Log ID</th>
                <th className="px-6 py-4 font-bold text-gray-900 tracking-wider">Action</th>
                <th className="px-6 py-4 font-bold text-gray-900 tracking-wider">User</th>
                <th className="px-6 py-4 font-bold text-gray-900 tracking-wider">Details</th>
                <th className="px-6 py-4 font-bold text-gray-900 tracking-wider">Timestamp</th>
                <th className="px-6 py-4 font-bold text-gray-900 tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-500">{log.id}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{log.action}</td>
                  <td className="px-6 py-4 font-semibold text-gray-600">{log.user}</td>
                  <td className="px-6 py-4 font-medium text-gray-500 whitespace-normal min-w-[250px]">{log.details}</td>
                  <td className="px-6 py-4 text-gray-400 font-semibold">{log.timestamp}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded flex items-center gap-1.5 w-fit font-bold border ${
                      log.status === 'Success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      log.status === 'Warning' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {getStatusIcon(log.status)}
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">Loading audit logs...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">No audit logs found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
