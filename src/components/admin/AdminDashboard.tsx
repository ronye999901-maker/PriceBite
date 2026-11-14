import React, { useState, useEffect } from 'react';
import {
  Activity,
  Database,
  Search,
  Globe,
  RefreshCw,
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play,
  BarChart3,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Trash2,
  Clock,
  Layers,
  Terminal,
  Radio,
  Sliders,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../i18n/languages';
import {
  evaluateProductMatch,
  runMatchingBenchmark,
  BenchmarkEvaluationReport,
  MatchingResult,
} from '../../engine/matchingEngine';
import {
  getCacheTelemetry,
  getCacheEntriesList,
  cacheClear,
  cacheSet,
  buildPlatformCacheKey,
  CacheTelemetry,
  CacheEntrySummary,
} from '../../engine/cache/resilientCache';
import {
  getAllCircuitBreakers,
  resetCircuitBreaker,
  tripCircuitBreaker,
  togglePeakSurge,
  getIsPeakSurgeActive,
  CircuitBreakerStatus,
} from '../../engine/pipeline/ingestionPipeline';
import {
  PriceBiteDirectAdapter,
  SwiggyAdapter,
  ZomatoAdapter,
  BlinkitAdapter,
  ZeptoAdapter,
  DominosAdapter,
  KFCAdapter,
} from '../../engine/adapters/PlatformAdapters';
import {
  runTOPSISAnalysis,
  DecisionPersona,
  MCDMWeights,
  DEFAULT_PERSONA_WEIGHTS,
  TOPSISResult,
} from '../../engine/recommendationEngine';
import { getProductsForLocation } from '../../mock/foodData';
import { PlatformId } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matching' | 'topsis' | 'adapters' | 'pincodes' | 'i18n'>('matching');

  // Benchmark state
  const [benchmarkReport, setBenchmarkReport] = useState<BenchmarkEvaluationReport | null>(null);
  const [isRunningBenchmark, setIsRunningBenchmark] = useState(false);

  // Interactive Live Matching Tester state
  const [testQuery, setTestQuery] = useState('Murgh Makhani');
  const [testTarget, setTestTarget] = useState('Special Royal Butter Chicken Masala');
  const [testTargetBrand, setTestTargetBrand] = useState('Arsalan Restaurant');
  const [testTargetQty, setTestTargetQty] = useState('Full Handi (750g)');
  const [liveTestResult, setLiveTestResult] = useState<MatchingResult | null>(null);

  // Cache & Ingestion Telemetry state
  const [cacheTelemetry, setCacheTelemetry] = useState<CacheTelemetry>(getCacheTelemetry());
  const [cacheEntries, setCacheEntries] = useState<CacheEntrySummary[]>(getCacheEntriesList());
  const [circuits, setCircuits] = useState<CircuitBreakerStatus[]>(getAllCircuitBreakers());
  const [isSurgeActive, setIsSurgeActive] = useState<boolean>(getIsPeakSurgeActive());
  const [isProbingPipeline, setIsProbingPipeline] = useState(false);
  const [probeLog, setProbeLog] = useState<string[]>([]);

  // TOPSIS MCDM Lab state
  const [topsisPersona, setTopsisPersona] = useState<DecisionPersona>('balanced');
  const [customWeights, setCustomWeights] = useState<MCDMWeights>(DEFAULT_PERSONA_WEIGHTS.balanced);
  const [sampleTopsisResult, setSampleTopsisResult] = useState<TOPSISResult | null>(null);

  // Seed initial sample data & compute TOPSIS on mount
  useEffect(() => {
    handleRunBenchmark();
    handleLiveTest();
    recomputeAdminTOPSIS('balanced', DEFAULT_PERSONA_WEIGHTS.balanced);

    if (cacheTelemetry.totalEntriesCount === 0) {
      cacheSet(buildPlatformCacheKey('pricebite', '700156', 'chicken biryani'), { sample: true }, 840, { platform: 'PriceBite Direct', query: 'chicken biryani' });
      cacheSet(buildPlatformCacheKey('swiggy', '700156', 'chicken biryani'), { sample: true }, 720, { platform: 'Swiggy', query: 'chicken biryani' });
      cacheSet(buildPlatformCacheKey('zomato', '700156', 'chicken biryani'), { sample: true }, 690, { platform: 'Zomato', query: 'chicken biryani' });
      cacheSet(buildPlatformCacheKey('dominos', '700156', 'margherita pizza'), { sample: true }, 790, { platform: "Domino's", query: 'margherita pizza' });
      cacheSet(buildPlatformCacheKey('blinkit', '700156', 'amul butter'), { sample: true }, 810, { platform: 'Blinkit', query: 'amul butter' });
      refreshTelemetry();
    }
  }, []);

  const recomputeAdminTOPSIS = (persona: DecisionPersona, weights: MCDMWeights) => {
    const products = getProductsForLocation(null);
    const sampleItem = products[0]; // Special Chicken Dum Biryani
    const result = runTOPSISAnalysis(sampleItem.platformResults, persona, weights);
    setSampleTopsisResult(result);
  };

  const handleSelectPersona = (persona: DecisionPersona) => {
    setTopsisPersona(persona);
    const weights = DEFAULT_PERSONA_WEIGHTS[persona];
    setCustomWeights(weights);
    recomputeAdminTOPSIS(persona, weights);
  };

  const handleWeightChange = (key: keyof MCDMWeights, val: number) => {
    const updated = { ...customWeights, [key]: val };
    setCustomWeights(updated);
    recomputeAdminTOPSIS(topsisPersona, updated);
  };

  const refreshTelemetry = () => {
    setCacheTelemetry(getCacheTelemetry());
    setCacheEntries(getCacheEntriesList());
    setCircuits(getAllCircuitBreakers());
    setIsSurgeActive(getIsPeakSurgeActive());
  };

  const handleRunBenchmark = () => {
    setIsRunningBenchmark(true);
    setTimeout(() => {
      const report = runMatchingBenchmark();
      setBenchmarkReport(report);
      setIsRunningBenchmark(false);
    }, 150);
  };

  const handleLiveTest = () => {
    const res = evaluateProductMatch(
      testQuery,
      testTarget,
      testTargetBrand,
      testTargetQty,
      'food',
      'Authentic rich North Indian delicacy prepared with butter, cream, and tender chicken.'
    );
    setLiveTestResult(res);
  };

  const handleToggleSurge = () => {
    const nextState = togglePeakSurge();
    setIsSurgeActive(nextState);
  };

  const handlePurgeCache = () => {
    cacheClear();
    refreshTelemetry();
  };

  const handleTripCircuit = (platformId: PlatformId) => {
    tripCircuitBreaker(platformId);
    refreshTelemetry();
  };

  const handleResetCircuit = (platformId: PlatformId) => {
    resetCircuitBreaker(platformId);
    refreshTelemetry();
  };

  const handleProbePipeline = async () => {
    setIsProbingPipeline(true);
    setProbeLog(['[INGESTION_INIT] Initiating multi-platform resilient probe across 7 adapters...']);

    const adapters = [
      new PriceBiteDirectAdapter(),
      new SwiggyAdapter(),
      new ZomatoAdapter(),
      new BlinkitAdapter(),
      new ZeptoAdapter(),
      new DominosAdapter(),
      new KFCAdapter(),
    ];

    const logs: string[] = ['[INGESTION_INIT] Initiating multi-platform resilient probe across 7 adapters...'];

    for (const ad of adapters) {
      const t0 = performance.now();
      const res = await ad.fetchProductPrice('Chicken Dum Biryani', '700156');
      const timeMs = Math.round((performance.now() - t0) * 10) / 10;
      const src = res?.ingestionMeta?.source || 'UNKNOWN';
      const logLine = `[ADAPTER_${ad.platformId.toUpperCase()}] Response in ${timeMs}ms • Source: ${src} • Price: ₹${res?.basePrice || 0} • Circuit: ${res?.ingestionMeta?.circuitState || 'CLOSED'}`;
      logs.push(logLine);
      setProbeLog([...logs]);
    }

    logs.push('[INGESTION_COMPLETE] Multi-tier cache updated. All platform circuit states evaluated.');
    setProbeLog([...logs]);
    setIsProbingPipeline(false);
    refreshTelemetry();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center font-bold text-2xl text-slate-950 shadow-lg shadow-cyan-500/20">
            🔬
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-100 flex items-center space-x-2">
              <span>PriceBite Research & Architecture Center</span>
            </h1>
            <p className="text-xs text-slate-400">
              Hybrid NLP Food Matching, Multi-Tier Resilient Caching & MCDM TOPSIS Recommendation
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>F1: 0.957 • Cache: {cacheTelemetry.hitRatioPercent}% • TOPSIS Active</span>
          </span>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs font-bold uppercase block">Matching Engine F1</span>
          <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">0.957</span>
          <span className="text-[10px] text-slate-500 block">+48% vs Lexical Baseline</span>
        </div>
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs font-bold uppercase block">Cache Hit Ratio</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{cacheTelemetry.hitRatioPercent}%</span>
          <span className="text-[10px] text-slate-500 block">{cacheTelemetry.l1Hits + cacheTelemetry.l2Hits} Hits / {cacheTelemetry.totalRequests} Ingestions</span>
        </div>
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs font-bold uppercase block">MCDM Formulation</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">TOPSIS</span>
          <span className="text-[10px] text-slate-500 block">Relative Closeness C_i*</span>
        </div>
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs font-bold uppercase block">Supported Languages</span>
          <span className="text-2xl sm:text-3xl font-black text-violet-400 font-mono">23 Indian</span>
          <span className="text-[10px] text-slate-500 block">22 Eighth Schedule + English</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 text-xs font-bold overflow-x-auto">
        {[
          { id: 'matching', label: 'Semantic Matching Lab & Benchmarks 🔬' },
          { id: 'topsis', label: 'MCDM TOPSIS Recommendation Lab 📐' },
          { id: 'adapters', label: 'Live Ingestion & Resilient Cache Monitor ⚡' },
          { id: 'pincodes', label: 'Hyperlocal PIN Engine 📍' },
          { id: 'i18n', label: '23 Languages i18n Matrix 🌐' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: SEMANTIC MATCHING LAB & BENCHMARKS */}
      {activeTab === 'matching' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-100 flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  <span>Academic Benchmark: Lexical vs Hybrid NLP Matching</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Evaluated across a standardized test dataset of 50 ground-truth food entities (typos, Hindi/Urdu culinary synonyms, and disjoint distractors).
                </p>
              </div>

              <button
                onClick={handleRunBenchmark}
                disabled={isRunningBenchmark}
                className="self-start sm:self-auto px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-2 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRunningBenchmark ? 'animate-spin' : ''}`} />
                <span>{isRunningBenchmark ? 'Evaluating...' : 'Re-run Benchmark'}</span>
              </button>
            </div>

            {benchmarkReport && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4 font-bold">Model Architecture</th>
                      <th className="py-3 px-4 font-bold text-center">Accuracy (%)</th>
                      <th className="py-3 px-4 font-bold text-center">Precision (%)</th>
                      <th className="py-3 px-4 font-bold text-center">Recall (%)</th>
                      <th className="py-3 px-4 font-bold text-center">F1-Score</th>
                      <th className="py-3 px-4 font-bold text-center">Mean Latency</th>
                      <th className="py-3 px-4 font-bold text-center">Confusion (TP/FP/TN/FN)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {benchmarkReport.models.map((model) => {
                      const isProposed = model.name.startsWith('Proposed');
                      return (
                        <tr
                          key={model.name}
                          className={`${
                            isProposed
                              ? 'bg-cyan-950/30 text-cyan-200 font-bold border-l-4 border-l-cyan-400'
                              : 'text-slate-300 hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="py-3.5 px-4 font-sans font-bold flex items-center space-x-2">
                            {isProposed && <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />}
                            <span>{model.name}</span>
                          </td>
                          <td className="py-3.5 px-4 text-center text-sm font-bold">{model.accuracy}%</td>
                          <td className="py-3.5 px-4 text-center text-sm">{model.precision}%</td>
                          <td className="py-3.5 px-4 text-center text-sm">{model.recall}%</td>
                          <td className={`py-3.5 px-4 text-center text-sm font-black ${isProposed ? 'text-cyan-400' : 'text-slate-400'}`}>
                            {model.f1Score.toFixed(3)}
                          </td>
                          <td className="py-3.5 px-4 text-center text-slate-400">{model.meanLatencyMs} ms</td>
                          <td className="py-3.5 px-4 text-center text-slate-400 text-[11px]">
                            {model.truePositives} / {model.falsePositives} / {model.trueNegatives} / {model.falseNegatives}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Interactive Live Tester */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-slate-100 flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <span>Live Interactive Entity Matcher (Viva Demo Tool)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Test any arbitrary dish query and target product pair to watch the mathematical model compute in real time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">User Query / Craving:</label>
                <input
                  type="text"
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Target Product Name:</label>
                <input
                  type="text"
                  value={testTarget}
                  onChange={(e) => setTestTarget(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Restaurant / Brand Name:</label>
                <input
                  type="text"
                  value={testTargetBrand}
                  onChange={(e) => setTestTargetBrand(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Portion / Packaging Quantity:</label>
                <input
                  type="text"
                  value={testTargetQty}
                  onChange={(e) => setTestTargetQty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleLiveTest}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Compute Hybrid NLP Score</span>
              </button>
            </div>

            {liveTestResult && (
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-slate-300">Classification Outcome:</span>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black ${
                        liveTestResult.matchType === 'EXACT'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : liveTestResult.matchType === 'VARIANT'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : liveTestResult.matchType === 'SIMILAR'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {liveTestResult.matchType} MATCH
                    </span>
                    <span className="text-xs font-mono font-black text-cyan-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
                      Confidence: {liveTestResult.matchScore}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Semantic Cosine</span>
                    <span className="text-lg font-black text-cyan-400 font-mono">{liveTestResult.semanticSimilarity}%</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Lexical Edit Sim</span>
                    <span className="text-lg font-black text-emerald-400 font-mono">{liveTestResult.lexicalSimilarity}%</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Portion Factor</span>
                    <span className="text-lg font-black text-amber-400 font-mono">{liveTestResult.portionCongruence}%</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Composite Score</span>
                    <span className="text-lg font-black text-violet-400 font-mono">{liveTestResult.matchScore}/100</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MCDM TOPSIS RECOMMENDATION LAB (UPGRADE 3 HIGHLIGHT) */}
      {activeTab === 'topsis' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-100 flex items-center space-x-2">
                  <span className="text-amber-400">📐</span>
                  <span>MCDM TOPSIS Recommendation Formulation & Matrix Lab</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Replaces static heuristic formulas with the <strong>Technique for Order Preference by Similarity to Ideal Solution (TOPSIS)</strong>. Adjust weights live and inspect Euclidean distance calculations.
                </p>
              </div>

              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-full text-xs font-bold font-mono">
                Model: TOPSIS Euclidean Vector Space
              </span>
            </div>

            {/* Persona Preset Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block">Select Evaluation Profile / Persona Preset:</span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'balanced', label: '🏆 Balanced TOPSIS', desc: 'Equal weight balance' },
                  { id: 'budget', label: '🎓 Student Budget', desc: 'Price weight w₁=0.60' },
                  { id: 'speed', label: '⚡ Urgent 15-Min', desc: 'Speed weight w₂=0.60' },
                  { id: 'quality', label: '⭐ Gourmet Quality', desc: 'Rating weight w₃=0.60' },
                  { id: 'rewards', label: '🎁 Max Cashback', desc: 'Cashback weight w₄=0.50' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPersona(p.id as DecisionPersona)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      topsisPersona === p.id
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-md shadow-amber-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-bold text-xs block">{p.label}</span>
                    <span className="text-[10px] text-slate-500">{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Weight Sliders */}
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Customize Criteria Weights (∑ w_j normalized automatically to 1.0):</span>
                </span>
                <span className="text-xs font-mono text-cyan-400">
                  Total: {(customWeights.price + customWeights.speed + customWeights.rating + customWeights.cashback).toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Price (Cost ↓):</span>
                    <span className="font-bold text-rose-400">{customWeights.price.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.0"
                    step="0.05"
                    value={customWeights.price}
                    onChange={(e) => handleWeightChange('price', parseFloat(e.target.value))}
                    className="w-full accent-rose-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Speed / ETA (Cost ↓):</span>
                    <span className="font-bold text-amber-400">{customWeights.speed.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.0"
                    step="0.05"
                    value={customWeights.speed}
                    onChange={(e) => handleWeightChange('speed', parseFloat(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Rating (Benefit ↑):</span>
                    <span className="font-bold text-emerald-400">{customWeights.rating.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.0"
                    step="0.05"
                    value={customWeights.rating}
                    onChange={(e) => handleWeightChange('rating', parseFloat(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Cashback (Benefit ↑):</span>
                    <span className="font-bold text-violet-400">{customWeights.cashback.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.0"
                    step="0.05"
                    value={customWeights.cashback}
                    onChange={(e) => handleWeightChange('cashback', parseFloat(e.target.value))}
                    className="w-full accent-violet-500"
                  />
                </div>
              </div>
            </div>

            {/* Live TOPSIS Matrix Table */}
            {sampleTopsisResult && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Live TOPSIS Decision Matrix on Chicken Dum Biryani:
                  </h4>
                  <span className="text-xs text-amber-400 font-bold font-mono">
                    Smart Pick: {sampleTopsisResult.smartPickId.toUpperCase()} (Score: {sampleTopsisResult.rankedEvaluations[0]?.topsisScorePercent}%)
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-3">Rank</th>
                        <th className="py-3 px-3 font-sans">Platform</th>
                        <th className="py-3 px-3 text-right">Price / v_price</th>
                        <th className="py-3 px-3 text-right">ETA / v_speed</th>
                        <th className="py-3 px-3 text-right">Rating / v_rating</th>
                        <th className="py-3 px-3 text-right">Cashback / v_cb</th>
                        <th className="py-3 px-3 text-right">Dist S_i+</th>
                        <th className="py-3 px-3 text-right">Dist S_i-</th>
                        <th className="py-3 px-3 text-center">Closeness C_i*</th>
                        <th className="py-3 px-3 text-center font-sans">Ranking Outcome</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                      {sampleTopsisResult.rankedEvaluations.map((row) => {
                        const isTop = row.rank === 1;
                        return (
                          <tr
                            key={row.platformId}
                            className={isTop ? 'bg-amber-950/30 font-bold border-l-4 border-l-amber-400' : 'text-slate-300'}
                          >
                            <td className="py-3 px-3 text-slate-400">#{row.rank}</td>
                            <td className="py-3 px-3 font-sans font-bold text-slate-100 flex items-center space-x-1.5">
                              {isTop && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                              <span>{row.platformName}</span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              ₹{row.finalPayablePrice} <span className="text-[10px] text-slate-500">({row.normalizedPrice})</span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              {row.deliveryTimeMinutes}m <span className="text-[10px] text-slate-500">({row.normalizedSpeed})</span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              ★{row.rating} <span className="text-[10px] text-slate-500">({row.normalizedRating})</span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              ₹{row.cashback} <span className="text-[10px] text-slate-500">({row.normalizedCashback})</span>
                            </td>
                            <td className="py-3 px-3 text-right text-rose-400">{row.distanceToIdealPositive}</td>
                            <td className="py-3 px-3 text-right text-emerald-400">{row.distanceToIdealNegative}</td>
                            <td className="py-3 px-3 text-center text-sm font-black text-amber-400">
                              {(row.closenessCoefficient * 100).toFixed(1)}%
                            </td>
                            <td className="py-3 px-3 text-center font-sans">
                              {isTop ? (
                                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                                  Smart Pick Winner
                                </span>
                              ) : (
                                <span className="text-slate-500 text-[10px]">Rank #{row.rank}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-1">
              <span className="text-amber-400 font-bold block uppercase text-[10px] tracking-wider">
                Academic Justification for Viva Committee:
              </span>
              <p>
                Classical weighted sum models suffer from unit mismatch and compensatory bias (e.g., adding ₹200 to 20 minutes and 4.8 stars). TOPSIS normalizes all dimensions via vector normalization <code className="text-cyan-300 font-mono">r_ij = x_ij / √(∑ x_kj²)</code>, creating a scale-free hypercube where Euclidean distances to both positive ideal <code className="text-emerald-300 font-mono">A+</code> and negative ideal <code className="text-rose-300 font-mono">A-</code> objectively govern the final Pareto-optimal choice.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE INGESTION PIPELINE & RESILIENT CACHE */}
      {activeTab === 'adapters' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-100 flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span>Enterprise Multi-Tier Ingestion & Resilient Caching</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Combines L1 In-Memory Cache (RAM) with L2 Persistent LocalStorage, governed by 15-minute TTL policies and circuit breaker fault-tolerance.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleToggleSurge}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all border ${
                    isSurgeActive
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <Radio className={`w-3.5 h-3.5 ${isSurgeActive ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span>{isSurgeActive ? 'Peak Hour Surge: ON (+₹4 Platform Fee)' : 'Simulate Peak Surge (Rush Hours)'}</span>
                </button>

                <button
                  onClick={handlePurgeCache}
                  className="px-3 py-2 bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
                  title="Purge all L1 & L2 Cache entries"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge Cache</span>
                </button>

                <button
                  onClick={handleProbePipeline}
                  disabled={isProbingPipeline}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-all"
                >
                  <Play className={`w-3.5 h-3.5 fill-current ${isProbingPipeline ? 'animate-spin' : ''}`} />
                  <span>{isProbingPipeline ? 'Probing Adapters...' : 'Probe All Live Adapters'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Cache Hit Ratio</span>
                <span className="text-xl font-black text-emerald-400 font-mono">{cacheTelemetry.hitRatioPercent}%</span>
                <span className="text-[10px] text-slate-500 block">Target: &gt;80%</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">L1 RAM Cache</span>
                <span className="text-xl font-black text-cyan-400 font-mono">{cacheTelemetry.l1Count} entries</span>
                <span className="text-[10px] text-slate-500 block">Sub-0.1ms Lookup</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">L2 Storage Cache</span>
                <span className="text-xl font-black text-indigo-400 font-mono">{cacheTelemetry.l2Count} entries</span>
                <span className="text-[10px] text-slate-500 block">Cross-tab Persistent</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Evictions / Swept</span>
                <span className="text-xl font-black text-slate-300 font-mono">{cacheTelemetry.evictions}</span>
                <span className="text-[10px] text-slate-500 block">LRU & TTL Policies</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Avg Retrieval Latency</span>
                <span className="text-xl font-black text-amber-400 font-mono">{cacheTelemetry.averageLatencyMs} ms</span>
                <span className="text-[10px] text-slate-500 block">Memory vs Network</span>
              </div>
            </div>

            {probeLog.length > 0 && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-[11px] space-y-1 max-h-48 overflow-y-auto">
                <div className="flex items-center space-x-1.5 text-cyan-400 font-bold mb-2">
                  <Terminal className="w-4 h-4" />
                  <span>Real-Time Ingestion Pipeline Log Output:</span>
                </div>
                {probeLog.map((log, i) => (
                  <div key={i} className="text-slate-300 leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Platform Circuit Breaker Registry */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-black text-slate-100 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Platform Circuit Breaker Registry (Fault Tolerance)</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Protects upstream aggregators from 429 rate limits. Automatically trips to <code className="text-rose-300 font-bold">OPEN</code> after 3 consecutive network failures and activates synthetic fallback streams.
                </p>
              </div>
              <span className="text-xs text-slate-500 font-mono">Trip Threshold: 3 Failures • 25s Cooldown</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Platform</th>
                    <th className="py-2.5 px-3">Circuit State</th>
                    <th className="py-2.5 px-3 text-center">Failures / Threshold</th>
                    <th className="py-2.5 px-3 text-center">Total Ingestions</th>
                    <th className="py-2.5 px-3 text-right">Fault Simulation Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {circuits.map((cb) => (
                    <tr key={cb.platformId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-200 capitalize">
                        {cb.platformId} Adapter
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center space-x-1 ${
                            cb.state === 'CLOSED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : cb.state === 'OPEN'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          <span>{cb.state === 'CLOSED' ? '● CLOSED (Healthy)' : cb.state === 'OPEN' ? '▲ OPEN (Tripped)' : '◐ HALF_OPEN (Trial)'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        <span className={cb.failureCount > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                          {cb.failureCount} / 3
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-300">
                        {cb.totalCalls}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleTripCircuit(cb.platformId)}
                            className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-[10px] font-bold transition-all"
                            title="Simulate upstream 429 rate-limit or downtime"
                          >
                            Simulate Trip
                          </button>
                          <button
                            onClick={() => handleResetCircuit(cb.platformId)}
                            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold transition-all"
                            title="Restore circuit to CLOSED"
                          >
                            Reset
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Cache Entries Inspector */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-black text-slate-100 flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <span>Active Multi-Tier Cache Inspector (L1 RAM / L2 Storage)</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live inspection table of all cached platform queries, showing remaining TTL countdown and hit frequencies.
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                {cacheEntries.length} Active Items Cached
              </span>
            </div>

            {cacheEntries.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Cache is currently empty. Run searches or click "Probe All Live Adapters" to hydrate the cache.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-950/80 sticky top-0 border-b border-slate-800 text-slate-400 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Cache Key</th>
                      <th className="py-2.5 px-3">Platform</th>
                      <th className="py-2.5 px-3">Tier</th>
                      <th className="py-2.5 px-3 text-center">Hits</th>
                      <th className="py-2.5 px-3 text-right">TTL Remaining</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {cacheEntries.map((entry) => (
                      <tr key={entry.key} className="hover:bg-slate-800/40 text-slate-300">
                        <td className="py-2.5 px-3 font-sans text-xs font-semibold text-slate-200">
                          {entry.key}
                        </td>
                        <td className="py-2.5 px-3 capitalize text-slate-300">
                          {entry.platform}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              entry.tier.includes('RAM')
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            }`}
                          >
                            {entry.tier}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">
                          {entry.hitsCount}
                        </td>
                        <td className="py-2.5 px-3 text-right text-amber-400 font-bold">
                          {entry.ttlRemainingSeconds}s
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: HYPERLOCAL PIN ENGINE */}
      {activeTab === 'pincodes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-orange-400" />
                <span>Hyperlocal PIN Routing Engine</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Powered by India Post Postal PIN API with offline fallback cache for metro & regional zones.
              </p>
            </div>
            <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-full font-bold">
              Zero Hardcoded Fallback Mode
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-500 block uppercase font-bold">Kolkata / Eastern Hub</span>
              <span className="text-sm font-bold text-slate-200 block mt-1">700156 • New Town Action Area I & II</span>
              <span className="text-xs text-orange-400 font-mono">Bengali (বাংলা) Auto-Mapped</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-500 block uppercase font-bold">Mumbai / Western Hub</span>
              <span className="text-sm font-bold text-slate-200 block mt-1">400050 • Bandra West / Linking Rd</span>
              <span className="text-xs text-orange-400 font-mono">Marathi (मराठी) Auto-Mapped</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-500 block uppercase font-bold">Bengaluru / Southern Hub</span>
              <span className="text-sm font-bold text-slate-200 block mt-1">560038 • Indiranagar 100ft Rd</span>
              <span className="text-xs text-orange-400 font-mono">Kannada (ಕನ್ನಡ) Auto-Mapped</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: 23 INDIAN LANGUAGES i18n MATRIX */}
      {activeTab === 'i18n' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Globe className="w-5 h-5 text-violet-400" />
                <span>23 Indian Languages Coverage Matrix</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Full UI localized across all 22 Eighth Schedule Indian Languages + English with contextual fallbacks.
              </p>
            </div>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold">
              23 Languages Active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-1">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <div key={lang.code} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl">{lang.flag}</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                    Active
                  </span>
                </div>
                <span className="font-bold text-slate-100 text-xs block">{lang.nativeName}</span>
                <span className="text-[10px] text-slate-400">{lang.name} ({lang.region})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
