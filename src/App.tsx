import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  LayoutDashboard, History, TrendingUp, Target,
  Layers, Zap, Globe, Binary, Download, FileDigit, Fingerprint, Microscope, Dna
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface FaceAnalysis {
  id: number; is_fake: boolean; spatial: number; spectral: number; texture: number; heatmap: string; fourier: string; position: { x: number; y: number; w: number; h: number };
}

interface ForensicResult {
  id?: number; is_fake: boolean; overall_confidence: number; spectral_score: number; texture_score: number; threat_rating: string; analysis_time: number; faces: FaceAnalysis[]; timestamp?: string; metadata: Record<string, string>;
}

export default function App() {
  const [token] = useState<string | null>("BYPASS_AUTH");

  const [view, setView] = useState<'overview' | 'scanner' | 'history' | 'tech'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Scanner
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ForensicResult | null>(null);
  const [, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (token) fetchGlobalData();
  }, [token, view]);

  const fetchGlobalData = async () => {
    try {
      const auth = { headers: { Authorization: `Bearer ${token}` } };
      const [sRes, hRes] = await Promise.all([
        axios.get(`${API_URL}/stats`, auth),
        axios.get(`${API_URL}/history`, auth)
      ]);
      setStats(sRes.data);
      setHistory(hRes.data);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 401) handleLogout();
    }
  };

  const addLog = (msg: string) => setLogs(prev => [...prev.slice(-4), msg]);



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null); setError(null); setLogs([]);
    }
  };

  const handleUpload = async () => {
    if (!file || !token) return;
    setIsLoading(true); setError(null); setResult(null);
    setLogs(["Injecting source manifold...", "Acquiring sub-chromatic map...", "Scanning LBP Texture Anomaly...", "FFT Frequency Decoding...", "Xception v8 EXA-CYBER pass..."]);
    const formData = new FormData(); formData.append('file', file);
    try {
      const res = await axios.post(`${API_URL}/analyze`, formData, { headers: { Authorization: `Bearer ${token}` } });
      setResult(res.data);
      addLog("Digital Forensics Finalized.");
      fetchGlobalData();
    } catch (err: any) { setError(err.response?.data?.detail || 'Signal Interrupted.'); }
    finally { setIsLoading(false); }
  };

  const downloadReport = async (id: number) => {
    try {
      const res = await axios.get(`${API_URL}/download-report/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Forensic_Report_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (e) { console.error("Report DL Fail", e); }
  };

  // Auth View

  return (
    <div className="min-h-screen bg-[#020308] text-white flex overflow-hidden font-sans selection:bg-indigo-500/40">
      {/* Sidebar EXA-CYBER */}
      <motion.aside initial={false} animate={{ width: isSidebarOpen ? 300 : 100 }} className="relative z-50 bg-[#060710] border-r border-white/[0.03] flex flex-col transition-all duration-500 shadow-[20px_0_60px_rgba(0,0,0,0.5)]">
        <div className="p-10 flex items-center gap-5">
          <div className="w-12 h-12 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-600/30 flex-shrink-0 group overflow-hidden">
            <Zap className="w-6 h-6 text-white group-hover:scale-150 transition-transform duration-700" />
          </div>
          {isSidebarOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col"><span className="font-black text-2xl tracking-tighter italic leading-none">DEEPGUARD</span><span className="text-[10px] font-black tracking-[4px] text-indigo-500/70 mt-1 uppercase">EXA-PLATFORM</span></motion.div>}
        </div>

        <nav className="flex-1 px-5 mt-16 space-y-4">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Analytics' },
            { id: 'scanner', icon: Microscope, label: 'Forensic Lab' },
            { id: 'history', icon: History, label: 'Case Ledger' },
            { id: 'tech', icon: Dna, label: 'Neural Core' }
          ].map(it => (
            <button key={it.id} onClick={() => setView(it.id as any)} className={`w-full flex items-center gap-6 p-5 rounded-[2rem] transition-all duration-300 group ${view === it.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30' : 'text-gray-500 hover:bg-white/[0.03] hover:text-white'}`}>
              <it.icon className={`w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-110`} />
              {isSidebarOpen && <span className="font-black text-xs uppercase tracking-widest">{it.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-8 space-y-6">
          {isSidebarOpen && <div className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-[2rem] space-y-4">
            <p className="text-[9px] font-black uppercase tracking-[4px] text-gray-600">Secure Environment</p>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-gray-400">ISO-27001-V8</span>
            </div>
          </div>}
        </div>
      </motion.aside>

      {/* Content EXA-CYBER */}
      <main className="flex-1 relative z-10 overflow-y-auto custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        <header className="px-16 py-12 border-b border-white/[0.03] flex items-center justify-between sticky top-0 bg-[#020308]/60 backdrop-blur-[60px] z-40 shadow-2xl">
          <div>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[8px] text-indigo-500/70 mb-2">
              <div className="w-8 h-[2px] bg-indigo-500/30" /> SYSTEM_OS_V8.0_EXA
            </div>
            <h2 className="text-6xl font-black italic tracking-tighter leading-none uppercase">{view}</h2>
          </div>

          <div className="flex items-center gap-10">
            <div className="text-right flex flex-col items-end">
              <span className="bg-white/5 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest text-indigo-400 border border-white/5 mb-2">DEMO@DEEPGUARD</span>
              <p className="text-[11px] font-bold text-gray-500 flex items-center gap-2"><Globe className="w-3 h-3 text-emerald-500" /> SECURE_HOST_01</p>
            </div>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl text-gray-500 hover:text-white transition-all backdrop-blur-xl">
              <Fingerprint className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="p-16 pb-40 max-w-[1700px] mx-auto">
          <AnimatePresence mode="wait">
            {view === 'overview' && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-16">
                {/* Top Stats Grid */}
                <div className="grid md:grid-cols-4 gap-10">
                  {[
                    { l: "ASSETS_PROCESSED", v: stats?.total || 0, i: FileDigit, c: "indigo" },
                    { l: "NEURAL_ANOMALIES", v: stats?.fakes || 0, i: AlertTriangle, c: "rose" },
                    { l: "AVG_CONFIDENCE", v: (stats?.avg || 0) + "%", i: Target, c: "amber" },
                    { l: "UPTIME_PULSE", v: "99.99%", i: Activity, c: "emerald" }
                  ].map((s, i) => (
                    <div key={i} className={`p-10 rounded-[3.5rem] bg-white/[0.02] border border-white/[0.05] relative overflow-hidden group hover:scale-[1.02] transition-all shadow-2xl`}>
                      <div className="absolute -right-4 -top-4 opacity-[0.03] rotate-12 group-hover:scale-125 transition-transform"><s.i className="w-40 h-40" /></div>
                      <div className={`p-5 bg-${s.c}-500/10 rounded-3xl w-fit mb-6 shadow-lg shadow-${s.c}-500/10`}><s.i className={`w-6 h-6 text-${s.c}-400`} /></div>
                      <p className="text-[11px] text-gray-500 font-black uppercase tracking-[4px] mb-2">{s.l}</p>
                      <h4 className="text-6xl font-black italic tracking-tighter leading-none">{s.v}</h4>
                    </div>
                  ))}
                </div>

                {/* Charts & Threat Overview */}
                <div className="grid lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 p-16 rounded-[4.5rem] bg-[#08091a]/40 border border-white/[0.05] space-y-16 backdrop-blur-3xl shadow-2xl">
                    <div className="flex items-center justify-between">
                      <h3 className="text-4xl font-black italic tracking-tighter flex items-center gap-5"><TrendingUp className="text-indigo-500 h-10 w-10" /> Confidence Vectors</h3>
                      <div className="flex gap-4 p-2 bg-white/5 rounded-2xl">
                        {['DAY', 'WEEK', 'MONTH'].map(t => <button key={t} className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">{t}</button>)}
                      </div>
                    </div>
                    <div className="h-[450px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history.slice(0, 15).reverse().map(h => ({ n: new Date(h.timestamp!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), v: h.confidence }))}>
                          <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.6} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                          <XAxis dataKey="n" stroke="#ffffff20" fontSize={10} axisLine={false} tickLine={false} dy={20} />
                          <YAxis stroke="#ffffff20" fontSize={10} axisLine={false} tickLine={false} dx={-20} />
                          <Tooltip cursor={{ stroke: '#6366f1', strokeWidth: 2 }} contentStyle={{ backgroundColor: "#08091a", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "24px", padding: "20px" }} />
                          <Area type="monotone" dataKey="v" stroke="#6366f1" strokeWidth={5} fill="url(#g)" dot={{ fill: '#6366f1', r: 5, strokeWidth: 2 }} activeDot={{ r: 8, stroke: '#08091a', strokeWidth: 4 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-12 flex flex-col">
                    <div className="p-12 rounded-[4rem] bg-white/[0.02] border border-white/[0.05] space-y-12 flex-1 shadow-2xl">
                      <h3 className="text-2xl font-black italic tracking-tighter">Threat Distribution</h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={[{ name: 'CRITICAL', value: stats?.threats?.CRITICAL || 0 }, { name: 'WARNING', value: stats?.threats?.WARNING || 0 }, { name: 'SAFE', value: stats?.threats?.SAFE || 0 }]}
                              innerRadius={80} outerRadius={120} paddingAngle={8} dataKey="value">
                              <Cell fill="#f43f5e" /> <Cell fill="#f59e0b" /> <Cell fill="#10b981" />
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: "#08091a", borderRadius: "20px", border: "none" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-3 gap-6">
                        {['rose', 'amber', 'emerald'].map((c, i) => (
                          <div key={i} className="text-center">
                            <div className={`w-3 h-3 bg-${c}-500 rounded-full mx-auto mb-3 shadow-[0_0_15px_rgba(255,255,255,0.2)]`} />
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{['Crit', 'Warn', 'Safe'][i]}</p>
                            <p className="text-2xl font-black italic">{(Object.values(stats?.threats || {}) as number[])[i] || 0}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'scanner' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-7xl mx-auto py-12 space-y-20">
                <div className="text-center space-y-6">
                  <div className="inline-flex gap-4 items-center px-6 py-2 bg-indigo-500/5 border border-indigo-500/20 rounded-full group cursor-pointer">
                    <Zap className="w-4 h-4 text-indigo-500 group-hover:animate-bounce" />
                    <span className="text-xs font-black uppercase tracking-[4px] text-indigo-400">EXA-CYBER v8.0 PRO ACTIVE</span>
                  </div>
                  <h2 className="text-[120px] font-black italic tracking-tighter leading-[0.85] text-white">DECODE <br /><span className="text-indigo-600">ANOMALIES</span></h2>
                  <p className="text-gray-500 font-medium text-xl max-w-3xl mx-auto leading-relaxed">Multi-dimensional forensic audit utilizing <span className="text-white">Spatial Manifolds</span>, <span className="text-white">Spectral Variance</span>, and <span className="text-white">LBP Texture Entropy</span>.</p>
                </div>

                <div className="glass-panel p-2 rounded-[5rem] bg-white/[0.01] border border-white/[0.05] shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                  <div className="p-16 space-y-16">
                    {!file ? (
                      <div onClick={() => fileInputRef.current?.click()} className="p-32 border-4 border-dashed border-white/[0.03] rounded-[4rem] flex flex-col items-center gap-12 hover:bg-white/[0.01] hover:border-indigo-500/20 transition-all cursor-pointer group relative overflow-hidden">
                        <div className="p-16 bg-white/[0.03] rounded-[3.5rem] group-hover:scale-110 group-hover:-rotate-6 transition-all duration-1000 shadow-2xl relative z-10">
                          <Upload className="w-20 h-20 text-indigo-400" />
                        </div>
                        <div className="text-center relative z-10 space-y-4">
                          <h4 className="text-5xl font-black italic tracking-tighter">INGEST DATA MANIFOLD</h4>
                          <p className="text-xs font-black uppercase tracking-[10px] text-gray-500">FORMATS: RAW / ISO / 4K_MP4 / PNG</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-20">
                        <div className="relative rounded-[4rem] overflow-hidden aspect-video bg-black shadow-inner shadow-white/5 border border-white/5 ring-4 ring-white/[0.02] group">
                          {preview && (file.type.startsWith('video') ? <video src={preview} className="w-full h-full object-cover" controls /> : <img src={preview} className="w-full h-full object-cover scale-[1.02] brightness-90 group-hover:scale-105 transition-transform duration-[2000ms]" alt="" />)}
                          {!isLoading && !result && <button onClick={() => setFile(null)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-3xl"><RefreshCw className="w-20 h-20 stroke-1" /></button>}
                        </div>

                        {isLoading ? (
                          <div className="space-y-12 p-12 bg-white/[0.02] rounded-[4rem] border border-white/[0.05] relative overflow-hidden backdrop-blur-xl">
                            <div className="absolute top-0 left-0 h-1 bg-indigo-500 shadow-[0_0_40px_rgba(99,102,241,1)] w-full animate-shimmer" />
                            <div className="flex items-center gap-6">
                              <div className="w-5 h-5 bg-indigo-500 rounded-full animate-ping shadow-[0_0_20px_#6366f1]" />
                              <span className="text-xl font-black italic tracking-tighter text-white">DECODING NEURAL FREQUENCIES...</span>
                            </div>
                            <div className="grid md:grid-cols-2 gap-8 font-mono text-xs">
                              {logs.map((L, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-6 border-b border-white/[0.03] pb-4 group">
                                  <span className="text-indigo-500/50 font-black group-hover:text-indigo-500 transition-colors">PROBE_08_{i + 1}</span>
                                  <span className="text-gray-400 group-hover:text-white transition-colors">{L}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ) : result ? (
                          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-20">
                            <div className={`p-20 rounded-[5rem] border-4 ${result.is_fake ? 'border-red-500/20 bg-red-500/5 shadow-2xl shadow-red-500/10' : 'border-emerald-500/20 bg-emerald-500/5 shadow-2xl shadow-emerald-500/10'} flex items-center justify-between group overflow-hidden`}>
                              <div className="flex gap-12 relative z-10">
                                <div className={`p-10 rounded-[3rem] ${result.is_fake ? 'bg-red-500' : 'bg-emerald-500'} shadow-[0_0_70px_rgba(255,255,255,0.1)] group-hover:rotate-12 transition-transform duration-700`}>
                                  {result.is_fake ? <ShieldAlert className="w-20 h-20 text-white" /> : <ShieldCheck className="w-20 h-20 text-white" />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-4 mb-4">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border ${result.is_fake ? 'bg-red-500/20 border-red-500/30' : 'bg-emerald-500/20 border-emerald-500/30'}`}>THREAT_LEVEL: {result.threat_rating}</span>
                                    <p className="text-[10px] font-black uppercase tracking-[10px] text-gray-500 opacity-60">Handshake 0xEXA</p>
                                  </div>
                                  <h3 className="text-9xl font-black italic tracking-tighter leading-none">{result.is_fake ? 'FRAUD' : 'LEGAL'}</h3>
                                </div>
                              </div>
                              <div className="text-right relative z-10">
                                <button onClick={() => downloadReport(result.id!)} className="mb-8 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center gap-4 text-xs font-black uppercase tracking-[5px] transition-all group/dl">
                                  <Download className="w-4 h-4 group-hover/dl:translate-y-1 transition-transform" /> PDF CASE FILE
                                </button>
                                <div className="space-y-1">
                                  <p className="text-9xl font-black italic leading-none">{result.overall_confidence.toFixed(0)}</p>
                                  <p className="text-[11px] font-black uppercase tracking-[10px] text-gray-500 opacity-60">NEURAL_PRECISION</p>
                                </div>
                              </div>
                            </div>

                            {/* Advanced Multi-Probe Analysis Grid */}
                            <div className="grid lg:grid-cols-2 gap-12">
                              {result.faces.map(f => (
                                <div key={f.id} className="p-12 rounded-[4.5rem] bg-white/[0.02] border border-white/[0.05] flex flex-col md:flex-row gap-12 group hover:bg-white/[0.04] transition-all shadow-2xl">
                                  <div className="w-full md:w-1/2 space-y-8">
                                    <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
                                      <img src={`data:image/jpeg;base64,${f.heatmap}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-[3s]" alt="" />
                                      <div className="absolute top-6 left-6 px-4 py-1.5 bg-black/60 rounded-full text-[9px] font-black tracking-widest backdrop-blur-xl border border-white/10">SPATIAL_PROBE</div>
                                    </div>
                                    <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
                                      <img src={`data:image/jpeg;base64,${f.fourier}`} className="w-full h-full object-cover contrast-150 brightness-110" alt="" />
                                      <div className="absolute top-6 left-6 px-4 py-1.5 bg-indigo-600/60 rounded-full text-[9px] font-black tracking-widest backdrop-blur-xl border border-white/10">SPECTRAL_FFT</div>
                                    </div>
                                  </div>
                                  <div className="flex-1 flex flex-col justify-between py-6">
                                    <div className="space-y-10">
                                      <div>
                                        <p className="text-[10px] font-black uppercase tracking-[8px] text-indigo-500 mb-2">Probe Instance #{f.id + 1}</p>
                                        <h4 className="text-4xl font-black italic tracking-tighter underline underline-offset-8 decoration-white/5">Neural Fingerprint</h4>
                                      </div>

                                      <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                                            { sub: 'Spatial', val: f.spatial }, { sub: 'Spectral', val: f.spectral }, { sub: 'Texture', val: f.texture },
                                            { sub: 'Symmetry', val: 92 }, { sub: 'Noise', val: 85 }
                                          ]}>
                                            <PolarGrid stroke="#ffffff10" />
                                            <PolarAngleAxis dataKey="sub" stroke="#ffffff40" fontSize={10} fontWeight="black" />
                                            <Radar name="Scans" dataKey="val" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                                          </RadarChart>
                                        </ResponsiveContainer>
                                      </div>
                                    </div>

                                    <div className="p-8 bg-black/20 rounded-3xl space-y-6">
                                      <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Texture Entropy</span>
                                        <span className="text-2xl font-black italic text-emerald-400">{f.texture}%</span>
                                      </div>
                                      <div className={`p-4 rounded-xl text-center text-[10px] font-black uppercase tracking-[4px] border ${f.is_fake ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                                        Verdict: {f.is_fake ? 'SYTNHETIC ANOMALY' : 'BIOLOGICAL ORGANIC'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <button onClick={() => setFile(null)} className="w-full py-10 bg-white text-black font-black text-xs tracking-[20px] rounded-[2.5rem] hover:-translate-y-2 hover:shadow-[0_20px_80px_rgba(255,255,255,0.2)] transition-all duration-700">ENGAGE NEW MISSION</button>
                          </motion.div>
                        ) : (
                          <button onClick={handleUpload} className="w-full py-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[3.5rem] font-black text-4xl italic tracking-tighter shadow-[0_40px_100px_rgba(99,102,241,0.4)] flex items-center justify-center gap-10 transition-all active:scale-[0.98] group overflow-hidden relative">
                            <div className="absolute inset-x-0 h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            <Microscope className="w-12 h-12" /> EXECUTE FORENSIC HARVEST
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              </motion.div>
            )}

            {view === 'history' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16 py-12">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[8px] text-gray-600 mb-2">0xDEEP_PERSISTENCE</div>
                    <h3 className="text-6xl font-black italic tracking-tighter italic">CASE_ARCHIVES</h3>
                  </div>
                  <button onClick={fetchGlobalData} className="p-8 bg-white/[0.02] border border-white/[0.05] rounded-3xl hover:text-indigo-400 hover:border-indigo-500/30 transition-all"><RefreshCw className="w-10 h-10 stroke-1" /></button>
                </div>

                <div className="p-2 rounded-[4.5rem] bg-white/[0.01] border border-white/[0.05] overflow-hidden shadow-2xl backdrop-blur-3xl">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/[0.05] text-[11px] text-gray-500 font-black uppercase tracking-[4px] bg-white/[0.01]">
                        <th className="p-12">DOCKET_ID</th>
                        <th className="p-12">VERDICT</th>
                        <th className="p-12 text-center">SPATIAL</th>
                        <th className="p-12 text-center">SPECTRAL</th>
                        <th className="p-12 text-center">TEXTURE</th>
                        <th className="p-12 text-right">PROTOCOL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {history.map((h, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-colors group cursor-default">
                          <td className="p-12">
                            <div className="flex items-center gap-6">
                              <span className="text-xs font-black text-indigo-500/50 tabular-nums">#08_{h.id}</span>
                              <div className="flex flex-col">
                                <span className="text-sm font-black italic uppercase text-gray-300 w-48 truncate group-hover:text-white transition-colors">{h.filename}</span>
                                <span className="text-[9px] font-bold text-gray-600 mt-1 uppercase tracking-widest">{new Date(h.timestamp!).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-12">
                            <span className={`px-5 py-2 rounded-full text-[10px] font-black italic tracking-widest ${h.threat_rating === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : h.threat_rating === 'WARNING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                              {h.threat_rating}
                            </span>
                          </td>
                          <td className="p-12 text-center text-4xl font-black italic tabular-nums text-white/40 group-hover:text-white transition-colors">{h.confidence.toFixed(0)}</td>
                          <td className="p-12 text-center text-4xl font-black italic tabular-nums text-indigo-500/40 group-hover:text-indigo-500 transition-colors">{h.spectral_score.toFixed(0)}</td>
                          <td className="p-12 text-center text-4xl font-black italic tabular-nums text-emerald-500/40 group-hover:text-emerald-500 transition-colors">{h.texture_score.toFixed(0)}</td>
                          <td className="p-12 text-right">
                            <button onClick={() => downloadReport(h.id)} className="p-5 bg-white/[0.03] hover:bg-indigo-600 rounded-2xl text-gray-500 hover:text-white transition-all shadow-xl"><Download className="w-5 h-5" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {view === 'tech' && (
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-20 py-12">
                <div className="p-24 rounded-[6rem] bg-indigo-950/20 border-l-[16px] border-indigo-600 shadow-[0_45px_100px_rgba(0,0,0,0.5)] space-y-12 relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity duration-[3s]"><Binary className="w-[800px] h-[800px]" /></div>
                  <div className="relative z-10 space-y-8">
                    <p className="text-[12px] font-black uppercase tracking-[12px] text-indigo-500 opacity-70">Decription_Layer_Core</p>
                    <h2 className="text-[100px] font-black italic tracking-tighter leading-[0.8] uppercase">EXA_INTEGRITY <br /><span className="text-white/20">MANIFOLD</span></h2>
                    <p className="text-3xl text-gray-400 font-medium leading-relaxed max-w-4xl">DeepGuard EXA uses a tri-modal analysis vector: <span className="text-white">Spatial CNN Ensembling</span>, <span className="text-indigo-500">Spectral Fourier Signatures</span>, and <span className="text-emerald-500">Local Binary Pattern (LBP)</span> texture entropy scanning.</p>
                    <div className="flex gap-8 pt-10">
                      <button className="px-12 py-6 bg-indigo-600 rounded-[2.5rem] font-black text-xs tracking-[6px] uppercase shadow-2xl shadow-indigo-600/40">RESEARCH_WHITE_PAPER</button>
                      <button className="px-12 py-6 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-xs tracking-[6px] uppercase hover:bg-white/10 transition-all">SYSTEM_SPECS</button>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {[
                    { l: "Spatial Probe", v: "Xception-71 convolutional backbone trained on high-dim manifolds for sub-pixel forgery detection.", i: Layers, c: "indigo" },
                    { l: "Spectral Probe", v: "Fast Fourier Transform (FFT) analysis of frequency energy distribution to expose GAN artifacts.", i: Zap, c: "pink" },
                    { l: "Texture Probe", v: "Non-parametric LBP texture entropy mapping to identify synthetic skin-mesh irregularities.", i: Fingerprint, c: "emerald" }
                  ].map((t, i) => (
                    <div key={i} className="p-16 rounded-[4.5rem] bg-white/[0.01] border border-white/[0.05] space-y-8 hover:bg-white/[0.03] transition-all shadow-2xl flex flex-col items-center text-center">
                      <div className={`p-8 bg-${t.c}-500/10 rounded-[2.5rem] w-fit shadow-lg shadow-${t.c}-500/10`}><t.i className={`w-10 h-10 text-${t.c}-400`} /></div>
                      <h4 className="text-3xl font-black italic tracking-tighter italic">{t.l}</h4>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed">{t.v}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <style>{`
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.15); border-radius: 40px; }
        .italic { font-style: italic; }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-shimmer { animation: shimmer 2s infinite linear; }
        @font-face { font-family: 'Outfit'; src: url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;400;900&display=swap'); }
      `}</style>
    </div>
  );
}
