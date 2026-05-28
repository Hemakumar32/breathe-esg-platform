import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Plus, FileBarChart, Filter, Search, 
  Calendar, CheckCircle2, Clock, Globe, Shield, TrendingUp, AlertCircle, X
} from 'lucide-react';
import api from '../api/client';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('Templates');
  const [approvedRecords, setApprovedRecords] = useState([]);
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
        const approved = res.data.filter(r => r.review_status === 'APPROVED' || r.review_status === 'LOCKED');
        setApprovedRecords(approved);
      })
      .catch(err => console.error(err));
  }, []);

  const templates = [
    {
      id: 1,
      title: 'BRSR Core',
      description: 'Business Responsibility and Sustainability Report tailored for SEBI mandate in India.',
      tags: ['SEBI', 'India', 'Mandatory'],
      icon: <Globe className="text-blue-500" size={24} />,
      bg: 'bg-blue-50',
      border: 'border-blue-100'
    },
    {
      id: 2,
      title: 'GHG Protocol',
      description: 'Corporate Accounting and Reporting Standard for Scope 1, 2, and 3 emissions.',
      tags: ['Global', 'Emissions', 'Standard'],
      icon: <FileBarChart className="text-emerald-500" size={24} />,
      bg: 'bg-emerald-50',
      border: 'border-emerald-100'
    },
    {
      id: 3,
      title: 'SEC Climate Disclosure',
      description: 'Formatted to meet the US Securities and Exchange Commission requirements.',
      tags: ['SEC', 'US', 'Compliance'],
      icon: <Shield className="text-purple-500" size={24} />,
      bg: 'bg-purple-50',
      border: 'border-purple-100'
    },
    {
      id: 4,
      title: 'Internal CSR Overview',
      description: 'High-level dashboard summary for internal stakeholders and management.',
      tags: ['Internal', 'Summary', 'Custom'],
      icon: <TrendingUp className="text-amber-500" size={24} />,
      bg: 'bg-amber-50',
      border: 'border-amber-100'
    }
  ];

  const [recentReports, setRecentReports] = useState([
    { id: 'REP-1042', name: 'GHG Protocol Q1 2026', type: 'GHG Protocol', generatedBy: 'Aisha Singh', date: 'May 26, 2026', status: 'Completed', size: '2.4 MB' },
    { id: 'REP-1041', name: 'BRSR Annual Draft', type: 'BRSR Core', generatedBy: 'Rohit Kumar', date: 'May 20, 2026', status: 'Completed', size: '5.1 MB' },
    { id: 'REP-1040', name: 'Internal CSR May', type: 'Internal CSR', generatedBy: 'System', date: 'May 15, 2026', status: 'Failed', size: '--' },
    { id: 'REP-1039', name: 'SEC Compliance Check', type: 'SEC Disclosure', generatedBy: 'Priya Mehta', date: 'May 02, 2026', status: 'Completed', size: '3.8 MB' }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [reportName, setReportName] = useState('');

  // Simulate server-side report generation
  useEffect(() => {
    const generatingReport = recentReports.find(r => r.status === 'Generating');
    if (generatingReport) {
      const timer = setTimeout(() => {
        setRecentReports(prev => prev.map(r => {
          if (r.id === generatingReport.id) {
            const sizeInKb = Math.max(1.2, approvedRecords.length * 0.8 + 1.5);
            return {
              ...r,
              status: 'Completed',
              size: `${sizeInKb.toFixed(1)} KB`
            };
          }
          return r;
        }));
      }, 2500); // 2.5s simulation delay
      return () => clearTimeout(timer);
    }
  }, [recentReports, approvedRecords]);

  const openModal = (template) => {
    const tpl = template || templates[0];
    setSelectedTemplateId(tpl.id);
    setReportName(`${tpl.title} - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);
    setShowModal(true);
  };

  const handleGenerateReport = (e) => {
    e.preventDefault();
    const template = templates.find(t => t.id === Number(selectedTemplateId));
    const newReport = {
      id: `REP-${1043 + recentReports.length}`,
      name: reportName,
      type: template.title,
      generatedBy: 'Aisha Singh',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'Generating',
      size: '--'
    };
    setRecentReports([newReport, ...recentReports]);
    setShowModal(false);
    setActiveTab('History');
  };

  const handleDownloadTemplate = (e, template) => {
    e.stopPropagation();
    let rawCsv = '';
    
    if (template.id === 1) { // BRSR
      rawCsv = "BRSR_Section,Parameter,Value,Unit\nPrinciple_6,Energy_Consumption,100,GJ\nPrinciple_6,Water_Consumption,50,KL";
    } else if (template.id === 2) { // GHG Protocol
      rawCsv = "Scope,Category,Activity,Fuel_Type,Quantity,Unit\nScope_1,Stationary_Combustion,Generator,Diesel,1000,Liters\nScope_2,Purchased_Electricity,Grid,Electricity,5000,kWh";
    } else if (template.id === 3) { // SEC
      rawCsv = "Disclosure_Item,Metric,Value,Unit\nGHG_Emissions,Scope_1_Total,1500,MT_CO2e\nGHG_Emissions,Scope_2_Total,3000,MT_CO2e";
    } else { // Internal CSR
      rawCsv = "Department,Initiative,Status,Budget_Spent,Impact\nOperations,LED_Retrofit,In_Progress,50000,10_Percent_Reduction\nLogistics,EV_Fleet,Planning,0,TBD";
    }

    const csvContent = "data:text/csv;charset=utf-8," + rawCsv;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${template.title.replace(/\s+/g, '_')}_Template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadReport = (report) => {
    let rawCsv = '';
    const nameHeader = `Report Name,${report.name}\nReport Type,${report.type}\nGenerated By,${report.generatedBy}\nGeneration Date,${report.date}\nSelected Corporation,${selectedCorp}\n\n`;

    // Filter approved records by corporation
    let records = approvedRecords;
    if (selectedCorp === 'Global Industries') {
      records = approvedRecords.filter(r => r.source_type === 'SAP');
    } else if (selectedCorp === 'Tech Solutions Inc') {
      records = approvedRecords.filter(r => r.source_type === 'UTILITY' || r.source_type === 'TRAVEL');
    }

    if (report.type.includes('BRSR')) {
      rawCsv = nameHeader + "BRSR Section,Parameter,Source Type,Scope,Carbon Emissions (kg CO2e),Activity Value,Unit,Date Normalized\n";
      records.forEach(r => {
        const section = r.scope === 3 ? 'Principle 6 - Leadership Indicator' : 'Principle 6 - Essential Indicator';
        const parameter = `Scope ${r.scope} Emissions (${r.activity_type})`;
        rawCsv += `"${section}","${parameter}",${r.source_type},Scope ${r.scope},${r.co2e_kg},${r.value},${r.unit},${new Date(r.created_at).toLocaleDateString()}\n`;
      });
    } else if (report.type.includes('GHG')) {
      rawCsv = nameHeader + "Scope Class,Source Type,Activity Description,CO2e (kg),Activity Value,Unit,Log Date\n";
      records.forEach(r => {
        rawCsv += `Scope ${r.scope},${r.source_type},"${r.activity_type}",${r.co2e_kg},${r.value},${r.unit},"${new Date(r.created_at).toLocaleString()}"\n`;
      });
    } else if (report.type.includes('SEC')) {
      rawCsv = nameHeader + "SEC Disclosure Regulation,Disclosure Item,Scope,Carbon Emissions (Metric Tons),Reporting Year\n";
      const s1 = records.filter(r => r.scope === 1).reduce((sum, r) => sum + r.co2e_kg, 0) / 1000;
      const s2 = records.filter(r => r.scope === 2).reduce((sum, r) => sum + r.co2e_kg, 0) / 1000;
      const s3 = records.filter(r => r.scope === 3).reduce((sum, r) => sum + r.co2e_kg, 0) / 1000;
      rawCsv += `Regulation S-K Item 1504,Direct Emissions,Scope 1,${s1.toFixed(3)},2026\n`;
      rawCsv += `Regulation S-K Item 1504,Indirect Emissions,Scope 2,${s2.toFixed(3)},2026\n`;
      rawCsv += `Regulation S-K Item 1504,Value Chain Emissions,Scope 3,${s3.toFixed(3)},2026\n`;
    } else { // Internal CSR or general
      rawCsv = nameHeader + "CSR Indicator,Carbon Emissions (kg CO2e),Unit\n";
      const total = records.reduce((sum, r) => sum + r.co2e_kg, 0);
      const s1 = records.filter(r => r.scope === 1).reduce((sum, r) => sum + r.co2e_kg, 0);
      const s2 = records.filter(r => r.scope === 2).reduce((sum, r) => sum + r.co2e_kg, 0);
      const s3 = records.filter(r => r.scope === 3).reduce((sum, r) => sum + r.co2e_kg, 0);
      rawCsv += `Total Corporate Footprint,${total.toFixed(2)},kg CO2e\n`;
      rawCsv += `Direct Operations (Scope 1),${s1.toFixed(2)},kg CO2e\n`;
      rawCsv += `Purchased Energy (Scope 2),${s2.toFixed(2)},kg CO2e\n`;
      rawCsv += `Value Chain & Travel (Scope 3),${s3.toFixed(2)},kg CO2e\n`;
    }

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(rawCsv);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `${report.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIcon = (status) => {
    if (status === 'Completed') return <CheckCircle2 size={14} className="text-emerald-500" />;
    if (status === 'Generating') return <Clock size={14} className="text-amber-500" />;
    return <AlertCircle size={14} className="text-rose-500" />;
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[32px] font-semibold text-[#0f172a] tracking-tight flex items-center gap-2">
            <FileText className="text-indigo-500" size={24} /> Reports
          </h1>
          <p className="text-gray-500 text-[15px] mt-2">Generate standard sustainability reports or build custom exports from validated data.</p>
        </div>
        <button 
          onClick={() => openModal(null)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/10 flex items-center gap-2 transition-all"
        >
          <Plus size={18} strokeWidth={2.5} />
          Generate Report
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button 
            onClick={() => setActiveTab('Templates')}
            className={`px-6 py-4 text-sm font-bold border-b-[3px] transition-colors ${activeTab === 'Templates' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Report Templates
          </button>
          <button 
            onClick={() => setActiveTab('History')}
            className={`px-6 py-4 text-sm font-bold border-b-[3px] transition-colors ${activeTab === 'History' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Generation History
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'Templates' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => (
                <div 
                  key={template.id} 
                  onClick={() => openModal(template)}
                  className="border-2 border-gray-100 rounded-xl p-6 shadow-sm hover:border-blue-400 hover:shadow-xl transition-all duration-300 group cursor-pointer bg-white relative overflow-hidden transform hover:-translate-y-1"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full pointer-events-none"></div>
                  <div className="flex justify-between items-start mb-5 relative z-10">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${template.bg} ${template.border} border`}>
                      {template.icon}
                    </div>
                    <button 
                      onClick={(e) => handleDownloadTemplate(e, template)}
                      className="text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Download Template Format"
                    >
                      <Download size={20} />
                    </button>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{template.title}</h3>
                  <p className="text-sm text-gray-500 mb-5 leading-relaxed">{template.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wide">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto text-sm">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-bold text-gray-900 tracking-wider rounded-tl-lg">Report ID</th>
                    <th className="px-6 py-4 font-bold text-gray-900 tracking-wider">Name</th>
                    <th className="px-6 py-4 font-bold text-gray-900 tracking-wider">Type</th>
                    <th className="px-6 py-4 font-bold text-gray-900 tracking-wider">Generated By</th>
                    <th className="px-6 py-4 font-bold text-gray-900 tracking-wider">Date</th>
                    <th className="px-6 py-4 font-bold text-gray-900 tracking-wider">Status</th>
                    <th className="px-6 py-4 font-bold text-gray-900 tracking-wider text-right rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-600">{report.id}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">{report.name}</td>
                      <td className="px-6 py-4 font-medium text-gray-600">{report.type}</td>
                      <td className="px-6 py-4 font-medium text-gray-600">{report.generatedBy}</td>
                      <td className="px-6 py-4 text-gray-500 font-medium">{report.date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 w-fit ${
                          report.status === 'Completed' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 
                          report.status === 'Generating' ? 'text-amber-700 bg-amber-50 border-amber-100 animate-pulse' :
                          'text-rose-700 bg-rose-50 border-rose-100'
                        }`}>
                          {getStatusIcon(report.status)}
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {report.status === 'Completed' ? (
                          <button 
                            onClick={() => handleDownloadReport(report)}
                            className="p-1.5 border border-gray-200 hover:bg-gray-50 rounded-lg text-gray-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1 shadow-sm font-semibold animate-in fade-in duration-200"
                          >
                            <Download size={14} /> Download
                          </button>
                        ) : report.status === 'Generating' ? (
                          <span className="text-amber-500 font-bold text-xs flex items-center justify-end gap-1.5 select-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                            Generating...
                          </span>
                        ) : (
                          <span className="text-gray-400 font-medium italic select-none">--</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Generate New Report</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleGenerateReport} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Report Template</label>
                <select 
                  value={selectedTemplateId}
                  onChange={(e) => {
                    setSelectedTemplateId(e.target.value);
                    const t = templates.find(tpl => tpl.id === Number(e.target.value));
                    if (t) setReportName(`${t.title} - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm bg-gray-50/50"
                  required
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Report Name</label>
                <input 
                  type="text" 
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm bg-gray-50/50"
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-colors"
                >
                  Generate Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
