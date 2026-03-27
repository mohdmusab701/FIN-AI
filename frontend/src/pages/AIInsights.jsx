import { useState } from 'react';
import { useLanguage } from '../i18n';
import { getAIInsights, getAIPrediction, getAIAdvice } from '../api/client';
import { Brain, TrendingUp, Lightbulb, AlertTriangle, Sparkles, Send, Mic, MicOff } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';

const AIInsights = () => {
  const [insights, setInsights] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [advice, setAdvice] = useState('');
  const [question, setQuestion] = useState('');
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { t } = useLanguage();

  const handleGetInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await getAIInsights();
      setInsights(res.data);
    } catch { toast.error('Failed to get AI insights. Check your Gemini API key.'); }
    finally { setLoadingInsights(false); }
  };

  const handleGetPrediction = async () => {
    setLoadingPrediction(true);
    try {
      const res = await getAIPrediction();
      setPrediction(res.data);
    } catch { toast.error('Failed to get prediction. Check your Gemini API key.'); }
    finally { setLoadingPrediction(false); }
  };

  const handleAskAdvice = async (e) => {
    e?.preventDefault();
    if (!question.trim()) return;
    setLoadingAdvice(true);
    setAdvice('');
    try {
      const res = await getAIAdvice({ question });
      setAdvice(res.data.advice);
    } catch { toast.error('Failed to get advice. Check your Gemini API key.'); }
    finally { setLoadingAdvice(false); }
  };

  // Voice Input (Web Speech API)
  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice input not supported in this browser');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuestion(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Voice recognition error');
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Brain className="text-purple-500" /> {t('ai.title')}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Get AI-powered analysis and recommendations for your business</p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleGetInsights}
          disabled={loadingInsights}
          className="glass-card p-6 text-left hover:border-purple-500/30 transition-all group"
          style={{ border: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Lightbulb size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('ai.getInsights')}</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Cost-cutting tips & financial analysis</p>
            </div>
          </div>
          {loadingInsights && (
            <div className="flex items-center gap-2 text-sm text-purple-500">
              <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              {t('ai.loading')}
            </div>
          )}
        </button>

        <button
          onClick={handleGetPrediction}
          disabled={loadingPrediction}
          className="glass-card p-6 text-left hover:border-blue-500/30 transition-all"
          style={{ border: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('ai.predictCashFlow')}</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>3-month financial forecast</p>
            </div>
          </div>
          {loadingPrediction && (
            <div className="flex items-center gap-2 text-sm text-blue-500">
              <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              {t('ai.loading')}
            </div>
          )}
        </button>
      </div>

      {/* Insights Results */}
      {insights && (
        <div className="glass-card p-6 space-y-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={20} className="text-purple-500" />
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>AI Insights</h3>
          </div>

          {insights.summary && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{insights.summary}</p>
            </div>
          )}

          {insights.tips?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Lightbulb size={16} className="text-yellow-500" /> Cost-Cutting Tips
              </h4>
              <div className="space-y-2">
                {insights.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                    <span className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-600 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insights.warnings?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-500">
                <AlertTriangle size={16} /> Warnings
              </h4>
              <div className="space-y-2">
                {insights.warnings.map((warning, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                    <span className="text-red-500 text-sm">⚠️</span>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{warning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insights.opportunities?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-emerald-500">
                <TrendingUp size={16} /> Opportunities
              </h4>
              <div className="space-y-2">
                {insights.opportunities.map((opp, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                    <span className="text-emerald-500 text-sm">🚀</span>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{opp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Prediction Results */}
      {prediction && (
        <div className="glass-card p-6 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <TrendingUp size={20} className="text-blue-500" /> Cash Flow Forecast
            </h3>
            <div className="flex gap-2">
              <span className={`badge ${prediction.trend === 'improving' ? 'badge-success' : prediction.trend === 'declining' ? 'badge-danger' : 'badge-info'}`}>
                Trend: {prediction.trend}
              </span>
              <span className="badge badge-neutral">Confidence: {prediction.confidence}</span>
            </div>
          </div>

          {prediction.analysis && (
            <p className="text-sm p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{prediction.analysis}</p>
          )}

          {prediction.predictions?.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={prediction.predictions}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 12 }}
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, '']}
                />
                <Legend />
                <Bar dataKey="predictedRevenue" name="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="predictedExpenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="predictedProfit" name="Profit" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* Ask AI */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Sparkles size={20} className="text-purple-500" /> {t('ai.askQuestion')}
        </h3>
        <form onSubmit={handleAskAdvice} className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              className="input-field pr-12"
              placeholder={t('ai.placeholder')}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button
              type="button"
              onClick={toggleVoice}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${isListening ? 'text-red-500 bg-red-50 dark:bg-red-900/30' : ''}`}
              style={{ color: isListening ? undefined : 'var(--text-muted)' }}
              title="Voice input"
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          </div>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={loadingAdvice || !question.trim()}>
            {loadingAdvice ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <Send size={18} />}
          </button>
        </form>

        {advice && (
          <div className="mt-4 p-4 rounded-xl animate-fade-in" style={{ background: 'var(--bg-tertiary)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Brain size={16} className="text-purple-500" />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>AI Response</span>
            </div>
            <p className="text-sm whitespace-pre-line" style={{ color: 'var(--text-primary)' }}>{advice}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
