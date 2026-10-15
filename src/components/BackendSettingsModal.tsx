import { useState, useEffect } from 'react';
import { X, Server, Key, CheckCircle2, AlertCircle, RefreshCw, Radio } from 'lucide-react';
import { BackendConfig } from '../types/bus';
import { getStoredBackendConfig, saveBackendConfig } from '../services/ltaBusService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export function BackendSettingsModal({ isOpen, onClose, onConfigUpdated }: Props) {
  const [config, setConfig] = useState<BackendConfig>(getStoredBackendConfig());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setConfig(getStoredBackendConfig());
      setTestStatus('idle');
      setTestMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveBackendConfig(config);
    onConfigUpdated();
    onClose();
  };

  const handleTestBackend = async () => {
    if (config.mode === 'simulator') {
      setTestStatus('success');
      setTestMessage('Real-time LTA Simulator is active and updating live predictions.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Testing connection to endpoint...');

    try {
      const url = `${config.backendEndpoint}?BusStopCode=09048`;
      const headers: Record<string, string> = { 'Accept': 'application/json' };
      if (config.ltaAccountKey) {
        headers['AccountKey'] = config.ltaAccountKey;
      }

      const res = await fetch(url, { headers });
      if (res.ok) {
        const json = await res.json();
        setTestStatus('success');
        setTestMessage(`Connected successfully! Received ${json.Services?.length || 0} bus services from backend.`);
      } else {
        setTestStatus('error');
        setTestMessage(`Server returned HTTP ${res.status} (${res.statusText}).`);
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(err.message || 'Network error connecting to backend endpoint.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Backend & LTA API Integration</h3>
              <p className="text-xs text-slate-400">Configure data source or connect your server proxy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-5">
          {/* Mode Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Data Source Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfig({ ...config, mode: 'simulator' })}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  config.mode === 'simulator'
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">Real-Time Simulator</span>
                  <Radio className={`w-4 h-4 ${config.mode === 'simulator' ? 'text-emerald-400' : 'text-slate-600'}`} />
                </div>
                <p className="text-xs text-slate-400">
                  Full Singapore LTA DataMall simulation with live GPS bus locations & realistic crowd occupancy.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setConfig({ ...config, mode: 'custom_backend' })}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  config.mode === 'custom_backend'
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">Custom Backend / Proxy</span>
                  <Radio className={`w-4 h-4 ${config.mode === 'custom_backend' ? 'text-emerald-400' : 'text-slate-600'}`} />
                </div>
                <p className="text-xs text-slate-400">
                  Forward requests to your Express / Node.js backend proxy or LTA DataMall v2 API endpoint.
                </p>
              </button>
            </div>
          </div>

          {/* Backend Config Inputs */}
          {config.mode === 'custom_backend' && (
            <div className="space-y-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Backend Endpoint URL
                </label>
                <input
                  type="text"
                  value={config.backendEndpoint}
                  onChange={(e) => setConfig({ ...config, backendEndpoint: e.target.value })}
                  placeholder="e.g. /api/bus-arrival or https://your-server.com/api/bus"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  The frontend will query: <code className="text-emerald-400">{config.backendEndpoint}?BusStopCode=[5-digit-code]</code>
                </span>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-1">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  Optional LTA AccountKey (if forwarding directly)
                </label>
                <input
                  type="password"
                  value={config.ltaAccountKey || ''}
                  onChange={(e) => setConfig({ ...config, ltaAccountKey: e.target.value })}
                  placeholder="Enter LTA DataMall AccountKey (optional)"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleTestBackend}
                  disabled={testStatus === 'testing'}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin text-emerald-400' : ''}`} />
                  Test Connection
                </button>
              </div>
            </div>
          )}

          {/* Test Status Feedback */}
          {testMessage && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2.5 ${
                testStatus === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                  : testStatus === 'error'
                  ? 'bg-rose-950/60 border border-rose-800 text-rose-300'
                  : 'bg-slate-800 border border-slate-700 text-slate-300'
              }`}
            >
              {testStatus === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span>{testMessage}</span>
            </div>
          )}

          {/* LTA API Format Reference Guide */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <span className="font-semibold text-slate-300 block">LTA DataMall v2 Schema Compatible:</span>
            <p>
              When you implement your backend, return JSON matching LTA format:{' '}
              <code className="text-emerald-400 font-mono">
                &#123; BusStopCode, Services: [ &#123; ServiceNo, Operator, NextBus, NextBus2, NextBus3 &#125; ] &#125;
              </code>
            </p>
            <p>
              Includes <code className="text-slate-300">Load</code> (SEA, SDA, LSD), <code className="text-slate-300">Feature</code> (WAB), <code className="text-slate-300">Type</code> (SD, DD, BD), and real-time GPS <code className="text-slate-300">Latitude/Longitude</code> for live bus tracking.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-md shadow-emerald-500/20"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
