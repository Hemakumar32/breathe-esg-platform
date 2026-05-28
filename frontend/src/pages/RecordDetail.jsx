import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { ArrowLeft, Check, X, AlertTriangle } from 'lucide-react';

export default function RecordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/records/${id}/`)
      .then(res => {
        setRecord(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleAction = async (action) => {
    try {
      await api.post(`/records/${id}/${action}/`);
      navigate('/review');
    } catch (err) {
      alert(err.response?.data?.error || `Failed to ${action} record`);
    }
  };

  if (loading) return <div>Loading record details...</div>;
  if (!record) return <div>Record not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link to="/review" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft size={16} /> Back to Review
      </Link>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Record #{record.id}</h1>
          <div className="flex items-center gap-3 mt-3">
             <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                record.review_status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                record.review_status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {record.review_status}
              </span>
              <span className="text-sm text-gray-500">Created: {new Date(record.created_at).toLocaleString()}</span>
          </div>
        </div>
        
        {record.review_status === 'PENDING' && (
          <div className="flex gap-3">
            <button 
              onClick={() => handleAction('reject')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              <X size={18} /> Reject
            </button>
            <button 
              onClick={() => handleAction('approve')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Check size={18} /> Approve
            </button>
          </div>
        )}
      </div>

      {record.issues?.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-5">
          <h3 className="text-red-800 font-semibold flex items-center gap-2 mb-3">
            <AlertTriangle size={20} /> Validation Issues Found
          </h3>
          <ul className="space-y-2">
            {record.issues.map(issue => (
              <li key={issue.id} className="text-red-600 text-sm flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>[{issue.severity}] {issue.issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">Raw Data</h2>
          <div className="space-y-3">
             {Object.entries(record.raw_data || {}).map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{k}</p>
                  <p className="text-sm font-medium text-gray-900 break-all">{String(v)}</p>
                </div>
             ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">Normalized Emission</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Source Type</p>
                <p className="text-sm font-medium text-gray-900">{record.source_type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Activity Type</p>
                <p className="text-sm font-medium text-gray-900">{record.activity_type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Scope</p>
                <p className="text-sm font-medium text-gray-900">Scope {record.scope}</p>
              </div>
              <div>
                 <p className="text-xs text-gray-500 uppercase tracking-wider">Value</p>
                 <p className="text-sm font-medium text-gray-900">{record.value} {record.unit}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mt-4 border border-gray-100">
               <p className="text-sm text-gray-500 font-medium">Calculated Emissions</p>
               <p className="text-3xl font-bold text-gray-900 mt-1">
                 {record.co2e_kg.toFixed(2)} <span className="text-lg text-gray-500 font-normal">kg CO2e</span>
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
