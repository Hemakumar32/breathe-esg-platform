import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  UploadCloud, CheckCircle2, AlertCircle, FileText, 
  ArrowLeft, ArrowRight, Database, Calendar, Clock, Info
} from 'lucide-react';
import api from '../api/client';

export default function UploadPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  
  // Step state: 1 = Ingestion setup, 2 = Upload Preview
  const [step, setStep] = useState(1);
  const [sourceType, setSourceType] = useState(location.state?.sourceType || 'SAP');

  useEffect(() => {
    if (location.state?.sourceType) {
      setSourceType(location.state.sourceType);
    }
  }, [location.state?.sourceType]);
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState([]);
  const [fileHeaders, setFileHeaders] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);
  const [summary, setSummary] = useState(null);

  const [recentUploads, setRecentUploads] = useState([]);

  React.useEffect(() => {
    api.get('/records/')
      .then(res => {
        const data = res.data;
        if (data && data.length > 0) {
          const runsMap = new Map();
          data.forEach(r => {
            const key = `${r.source_type || 'Unknown'}-${r.file_name || 'Unknown'}`;
            if (!runsMap.has(key)) {
              let parsedDate = null;
              let dateStr = 'Unknown Date';
              if (r.created_at) {
                const d = new Date(r.created_at);
                if (!isNaN(d.getTime())) {
                  parsedDate = d;
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
              if (!parsedDate) {
                parsedDate = new Date(0);
              }
              runsMap.set(key, {
                name: r.file_name || 'Unknown File',
                date: dateStr,
                size: 'Unknown',
                status: r.issues && r.issues.length > 0 ? 'Completed with Issues' : 'Completed',
                color: r.issues && r.issues.length > 0 ? 'text-amber-700 bg-amber-50 border-amber-100' : 'text-emerald-700 bg-emerald-50 border-emerald-100',
                created_at: parsedDate.getTime()
              });
            }
          });
          setRecentUploads(Array.from(runsMap.values()).sort((a, b) => b.created_at - a.created_at).slice(0, 5));
        }
      })
      .catch(err => console.log(err));
  }, []);

  const handleSourceTypeSelect = (type) => {
    setSourceType(type);
  };

  const handleFileRead = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      if (lines.length > 0) {
        // Parse CSV headers and rows
        const headers = lines[0].split(',').map(h => h.replace(/['"]+/g, '').trim());
        const parsedRows = lines.slice(1, 11).map(line => line.split(',').map(cell => cell.replace(/['"]+/g, '').trim()));
        
        setFileHeaders(headers);
        setFileContent(parsedRows);
        setRowCount(lines.length - 1);
      } else {
        // Fallback mockup rows if file is empty
        setFileHeaders(['Plant', 'Material', 'Description', 'Quantity', 'Unit', 'Posting Date', 'Vendor']);
        setFileContent([
          ['PL01', '100222', 'Diesel', '500', 'L', '2026-05-01', '100072'],
          ['PL01', '100000', 'Diesel', '350', 'L', '2026-05-02', '100072'],
          ['PL02', '100500', 'Retail', '150', 'L', '2026-05-03', '100045'],
          ['PL01', '100222', 'Diesel', '250', 'L', '2026-05-03', '100072'],
          ['PL03', '100006', 'LPG', '40', 'KG', '2026-05-04', '100078']
        ]);
        setRowCount(5);
      }
      setStep(2);
    };
    reader.readAsText(selectedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFileRead(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const selectedFile = e.dataTransfer.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      handleFileRead(selectedFile);
    } else {
      alert("Please upload a valid CSV file.");
    }
  };

  const handleIngest = async () => {
    if (!file) return;
    setUploading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('source_type', sourceType);
    formData.append('file', file);

    try {
      const res = await api.post('/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploading(false);
      setSummary(res.data.summary);
      setStep(3); // Navigate to summary screen
    } catch (err) {
      setUploading(false);
      setStatus({ type: 'error', message: err.response?.data?.error || 'Ingestion failed' });
      setStep(1); // Go back on failure
    }
  };

  const resetState = () => {
    setFile(null);
    setFileContent([]);
    setFileHeaders([]);
    setRowCount(0);
    setStep(1);
    setStatus(null);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      
      {status && (
        <div className={`p-4 rounded-xl flex items-center gap-3 shadow-sm ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
          {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-semibold">{status.message}</span>
        </div>
      )}

      {step === 1 ? (
        // STEP 1 - SETUP AND DROPZONE
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Upload Data</h1>
            <p className="text-gray-500 text-sm mt-1">Upload raw CSV exports from your systems. We'll parse, validate, and normalize the data.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left/Middle Columns: Upload Configuration */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Select Source Type */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
                <h3 className="text-sm font-bold text-gray-900">Select Source Type</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* SAP Card */}
                  <div 
                    onClick={() => handleSourceTypeSelect('SAP')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between h-32 ${
                      sourceType === 'SAP' ? 'border-blue-500 bg-blue-50/20' : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase">SAP</span>
                      <p className="text-sm font-bold text-gray-800 mt-3">SAP Fuel</p>
                    </div>
                    <p className="text-[10px] text-gray-400 font-semibold">Fuel & Procurement data</p>
                  </div>

                  {/* Utility Card */}
                  <div 
                    onClick={() => handleSourceTypeSelect('UTILITY')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between h-32 ${
                      sourceType === 'UTILITY' ? 'border-blue-500 bg-blue-50/20' : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase">Utility</span>
                      <p className="text-sm font-bold text-gray-800 mt-3">Electricity</p>
                    </div>
                    <p className="text-[10px] text-gray-400 font-semibold">Utility meter readings</p>
                  </div>

                  {/* Travel Card */}
                  <div 
                    onClick={() => handleSourceTypeSelect('TRAVEL')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between h-32 ${
                      sourceType === 'TRAVEL' ? 'border-blue-500 bg-blue-50/20' : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100 uppercase">Travel</span>
                      <p className="text-sm font-bold text-gray-800 mt-3">Corporate Travel</p>
                    </div>
                    <p className="text-[10px] text-gray-400 font-semibold">Travel expenses & flights</p>
                  </div>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl p-12 text-center bg-gray-50/30 cursor-pointer transition-colors group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept=".csv" 
                    className="hidden" 
                    onChange={handleFileChange} 
                  />
                  <div className="p-4 bg-white rounded-full shadow-sm w-16 h-16 flex items-center justify-center mx-auto text-gray-400 group-hover:text-blue-500 transition-colors">
                    <UploadCloud size={32} />
                  </div>
                  <h4 className="text-sm font-bold text-gray-800 mt-6">Drag and drop your CSV file here</h4>
                  <p className="text-xs text-gray-400 font-semibold mt-1">or click to browse your local files</p>
                  <button className="mt-6 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors">
                    Choose File
                  </button>
                  <p className="text-[10px] text-gray-400 font-semibold mt-4">Max file size: 10MB • Only CSV files are supported</p>
                </div>
              </div>
            </div>

            {/* Right Column: Guidelines */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-6 self-start">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Upload Guidelines</h3>
                <p className="text-xs text-gray-400 mt-0.5">Please match templates to prevent issues</p>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                <div className="flex gap-3 items-start border-l-2 border-blue-500 pl-3">
                  <div>
                    <p className="text-gray-800">SAP Ingestions</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Export CSV using UTF-8 encoding. Fields must include material, quantity, and facility plant code.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start border-l-2 border-emerald-500 pl-3">
                  <div>
                    <p className="text-gray-800">Utility Ingestions</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Electricity files must map usage values to kilowatt hours (kWh) or BTU. Validate meter numbers.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start border-l-2 border-purple-500 pl-3">
                  <div>
                    <p className="text-gray-800">Travel Ingestions</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Ensure distance fields are in kilometers (km) or miles (mi). Match airline carrier codes.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom row: Recent Uploads */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Recent Uploads</h3>
                <p className="text-xs text-gray-400 mt-0.5">Historical records of recent file ingestion attempts</p>
              </div>
              <Link to="/runs" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                View all uploads
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap text-xs">
                <thead className="bg-white border-b border-gray-100">
                  <tr>
                    <th className="pb-3 font-bold text-gray-400 uppercase tracking-wider">File Name</th>
                    <th className="pb-3 font-bold text-gray-400 uppercase tracking-wider">Uploaded At</th>
                    <th className="pb-3 font-bold text-gray-400 uppercase tracking-wider">Size</th>
                    <th className="pb-3 font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentUploads.map((upload, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 font-bold text-gray-800 flex items-center gap-2">
                        <FileText size={16} className="text-gray-400" /> {upload.name}
                      </td>
                      <td className="py-3 text-gray-500 font-semibold">{upload.date}</td>
                      <td className="py-3 text-gray-400 font-semibold">{upload.size}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${upload.color}`}>
                          {upload.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : step === 2 ? (
        // STEP 2 - UPLOAD PREVIEW
        <div className="space-y-6 relative">
          {uploading && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full text-center space-y-4 border border-gray-100">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Ingesting ESG Data...</h3>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    We are parsing your upload file, conducting GHG Protocol compliance validation checks, and running footprint calculations.
                  </p>
                </div>
                <div className="pt-2">
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-md animate-pulse">
                    Processing Ingestion...
                  </span>
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button 
              onClick={resetState}
              className="p-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-lg text-gray-500 hover:text-gray-700 shadow-sm transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Upload Preview</h1>
              <p className="text-gray-500 text-sm mt-1">Please review the parsed rows before finalizing the data ingestion.</p>
            </div>
          </div>

          {/* File Metadata Overview */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">File Name</span>
              <p className="text-sm font-bold text-gray-900 truncate" title={file?.name}>{file?.name}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Source Type</span>
              <div>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase ${
                  sourceType === 'SAP' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                  sourceType === 'UTILITY' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  'bg-purple-50 text-purple-700 border-purple-100'
                }`}>
                  {sourceType} - {sourceType === 'SAP' ? 'Fuel/Procurement' : sourceType === 'UTILITY' ? 'Electricity' : 'Corporate Travel'}
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Rows Detected</span>
              <p className="text-sm font-bold text-gray-900">{rowCount.toLocaleString()} records</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Detected At</span>
              <p className="text-sm font-bold text-gray-900">{new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>
          </div>

          {/* Data Table Preview */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Preview (First 10 rows)</h3>
              <span className="text-xs text-gray-400 font-bold flex items-center gap-1.5">
                <Info size={14} /> Showing snippet of the loaded file
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap text-xs">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-bold text-gray-500 w-16">Row #</th>
                    {fileHeaders.map((header, idx) => (
                      <th key={idx} className="px-6 py-4 font-bold text-gray-900 tracking-wider">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {fileContent.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-400 font-bold">{rowIdx + 1}</td>
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="px-6 py-4 text-gray-700 font-semibold">{cell || '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action buttons footer */}
          <div className="flex justify-between items-center pt-2">
            <button 
              onClick={resetState}
              className="px-6 py-2.5 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <div className="flex gap-3">
              <button 
                onClick={() => setStep(1)}
                className="px-6 py-2.5 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              >
                Back
              </button>
              <button 
                onClick={handleIngest}
                disabled={uploading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 flex items-center gap-2 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  'Confirm & Ingest'
                )}
              </button>
            </div>
          </div>
        </div>
      ) : step === 3 ? (
        // STEP 3 - INGESTION SUMMARY
        <div className="space-y-6 max-w-3xl mx-auto mt-12 animate-in fade-in zoom-in duration-300">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Upload Successful</h1>
            <p className="text-gray-500 mt-3 text-[15px]">Your file has been processed, validated, and normalized into standard emission records.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 text-left">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Rows</p>
                <p className="text-2xl font-bold text-gray-900">{summary?.total_rows || 0}</p>
              </div>
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Processed</p>
                <p className="text-2xl font-bold text-emerald-700">{summary?.processed || 0}</p>
              </div>
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Warnings</p>
                <p className="text-2xl font-bold text-amber-700">{summary?.warnings || 0}</p>
              </div>
              <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">Errors</p>
                <p className="text-2xl font-bold text-rose-700">{summary?.errors || 0}</p>
              </div>
            </div>

            <div className="mt-10 flex gap-4 justify-center">
              <button 
                onClick={resetState}
                className="px-8 py-3 border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition-colors"
              >
                Upload Another File
              </button>
              <button 
                onClick={() => navigate('/review')}
                className="px-8 py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-sm rounded-xl shadow-md transition-colors"
              >
                Go to Review Dashboard
              </button>
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}
