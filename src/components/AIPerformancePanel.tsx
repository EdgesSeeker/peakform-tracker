import React, { useState, useEffect } from 'react';
import { TrainingSession, UserStats } from '../types';
import { PerformanceAnalyzer, PerformanceMetrics } from '../utils/performanceAnalyzer';
import { 
  Brain, 
  Download, 
  Copy, 
  Save, 
  RefreshCw, 
  TrendingUp, 
  MessageSquare,
  Calendar,
  Target,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

interface AIFeedback {
  id: string;
  analysisId: string;
  feedback: string;
  recommendations: string[];
  date: Date;
  applied: boolean;
}

interface AIPerformancePanelProps {
  sessions: TrainingSession[];
  userStats: UserStats;
  onUpdateSession?: (session: TrainingSession) => void;
}

const AIPerformancePanel: React.FC<AIPerformancePanelProps> = ({ 
  sessions, 
  userStats,
  onUpdateSession 
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [savedFeedback, setSavedFeedback] = useState<AIFeedback[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<AIFeedback | null>(null);
  const [analysisFormat, setAnalysisFormat] = useState<'markdown' | 'json'>('markdown');
  const [loading, setLoading] = useState(false);

  // Lade gespeicherte Feedbacks
  useEffect(() => {
    const saved = localStorage.getItem('ai-feedback-history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedFeedback(parsed.map((fb: any) => ({
          ...fb,
          date: new Date(fb.date)
        })));
      } catch (error) {
        console.error('Fehler beim Laden der Feedback-Historie:', error);
      }
    }
  }, []);

  // Generiere Performance-Analyse
  const generateAnalysis = () => {
    setLoading(true);
    setTimeout(() => {
      const analysis = PerformanceAnalyzer.generateAnalysis(sessions, userStats);
      setMetrics(analysis);
      setLoading(false);
      console.log('📊 Performance-Analyse generiert:', analysis);
    }, 500);
  };

  // Export-Funktionen
  const exportAnalysis = () => {
    if (!metrics) return;
    
    const content = analysisFormat === 'markdown' 
      ? PerformanceAnalyzer.exportAsMarkdown(metrics)
      : PerformanceAnalyzer.exportAsJSON(metrics);
    
    // Download als Datei
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `peakform-analysis-${new Date().toISOString().split('T')[0]}.${analysisFormat === 'markdown' ? 'md' : 'json'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyAnalysisToClipboard = () => {
    if (!metrics) return;
    
    const content = analysisFormat === 'markdown' 
      ? PerformanceAnalyzer.exportAsMarkdown(metrics)
      : PerformanceAnalyzer.exportAsJSON(metrics);
    
    navigator.clipboard.writeText(content).then(() => {
      alert('Analyse in Zwischenablage kopiert! 📋');
    });
  };

  // Speichere KI-Feedback
  const saveFeedback = () => {
    if (!feedbackInput.trim() || !metrics) {
      alert('Bitte gib ein KI-Feedback ein!');
      return;
    }

    const newFeedback: AIFeedback = {
      id: `feedback-${Date.now()}`,
      analysisId: `analysis-${metrics.analysisDate.getTime()}`,
      feedback: feedbackInput.trim(),
      recommendations: extractRecommendations(feedbackInput),
      date: new Date(),
      applied: false
    };

    const updatedFeedbacks = [...savedFeedback, newFeedback];
    setSavedFeedback(updatedFeedbacks);
    setCurrentFeedback(newFeedback);
    
    // Speichere in localStorage
    localStorage.setItem('ai-feedback-history', JSON.stringify(updatedFeedbacks));
    
    setFeedbackInput('');
    alert('KI-Feedback gespeichert! 🤖');
  };

  // Extrahiere Empfehlungen aus KI-Text
  const extractRecommendations = (text: string): string[] => {
    const recommendations: string[] = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
        recommendations.push(trimmed.substring(1).trim());
      }
      if (trimmed.toLowerCase().includes('empfehlung') || 
          trimmed.toLowerCase().includes('vorschlag') ||
          trimmed.toLowerCase().includes('solltest')) {
        recommendations.push(trimmed);
      }
    });
    
    return recommendations.slice(0, 5); // Max 5 Empfehlungen
  };

  // Generiere Analyse beim ersten Laden
  useEffect(() => {
    if (sessions.length > 0 && !metrics) {
      generateAnalysis();
    }
  }, [sessions]);

  const getPerformanceIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'declining': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
              <Brain size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                KI Performance-Analyse
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Intelligente Trainingsanalyse mit externem KI-Feedback
              </p>
            </div>
          </div>
          
          <button
            onClick={generateAnalysis}
            disabled={loading}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <TrendingUp size={16} />}
            Analyse aktualisieren
          </button>
        </div>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Linke Spalte: Analyse-Daten */}
          <div className="xl:col-span-1">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  📊 Deine Performance-Daten
                </h3>
                <div className="flex items-center gap-2">
                  <select
                    value={analysisFormat}
                    onChange={(e) => setAnalysisFormat(e.target.value as 'markdown' | 'json')}
                    className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded"
                  >
                    <option value="markdown">Markdown</option>
                    <option value="json">JSON</option>
                  </select>
                  <button
                    onClick={copyAnalysisToClipboard}
                    className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    title="In Zwischenablage kopieren"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={exportAnalysis}
                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    title="Als Datei herunterladen"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>

              {/* Kompakte Metriken-Übersicht */}
              <div className="space-y-4">
                {/* Grundlegende Stats */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{metrics.totalSessions}</div>
                    <div className="text-xs text-gray-600">Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{metrics.currentStreak}</div>
                    <div className="text-xs text-gray-600">Tage Serie</div>
                  </div>
                </div>

                {/* Sportarten */}
                <div className="space-y-3">
                  {/* Laufen */}
                  {metrics.running.sessions > 0 && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-blue-700 dark:text-blue-300">🏃‍♂️ Laufen</span>
                        <span className={`text-sm ${getTrendColor(metrics.running.recentTrend)}`}>
                          {getPerformanceIcon(metrics.running.recentTrend)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {metrics.running.totalDistance.toFixed(1)} km • {metrics.running.sessions} Sessions
                        {metrics.running.averagePace && (
                          <span> • ⏱️ {metrics.running.averagePace}/km</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Radfahren */}
                  {metrics.cycling.sessions > 0 && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-green-700 dark:text-green-300">🚴‍♂️ Radfahren</span>
                        <span className={`text-sm ${getTrendColor(metrics.cycling.recentTrend)}`}>
                          {getPerformanceIcon(metrics.cycling.recentTrend)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {metrics.cycling.totalDistance.toFixed(1)} km • {metrics.cycling.sessions} Sessions
                        {metrics.cycling.averageSpeed && (
                          <span> • 🚀 {metrics.cycling.averageSpeed.toFixed(1)} km/h</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Schwimmen */}
                  {metrics.swimming.sessions > 0 && (
                    <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-cyan-700 dark:text-cyan-300">🏊‍♂️ Schwimmen</span>
                        <span className={`text-sm ${getTrendColor(metrics.swimming.recentTrend)}`}>
                          {getPerformanceIcon(metrics.swimming.recentTrend)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {(metrics.swimming.totalDistance * 1000).toFixed(0)} m • {metrics.swimming.sessions} Sessions
                        {metrics.swimming.averagePace && (
                          <span> • ⏱️ {metrics.swimming.averagePace}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Personal Bests */}
                {metrics.personalBests.length > 0 && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="font-medium text-yellow-700 dark:text-yellow-300 mb-2">🏆 Bestzeiten</div>
                    <div className="space-y-1">
                      {metrics.personalBests.map((pb, index) => (
                        <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>{pb.activity}:</strong> {pb.time}min ({pb.pace})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mittlere Spalte: KI-Feedback Input */}
          <div className="xl:col-span-1">
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  KI-Feedback einfügen
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-sm">
                  <div className="font-medium text-purple-700 dark:text-purple-300 mb-2">
                    💡 Workflow:
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-purple-600 dark:text-purple-400">
                    <li>Analyse kopieren/exportieren</li>
                    <li>An KI-Agent (Perplexity) senden</li>
                    <li>Antwort hier einfügen</li>
                    <li>Empfehlungen anwenden</li>
                  </ol>
                </div>

                <textarea
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="Füge hier das KI-Feedback von Perplexity oder einem anderen KI-Agent ein...

Beispiel:
Basierend auf deiner Analyse empfehle ich:
- Mehr Schwimmtraining für bessere Triathlon-Balance
- Intervalltraining für Geschwindigkeitsverbesserung
- Recovery-Sessions nach intensiven Einheiten"
                  className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                />

                <button
                  onClick={saveFeedback}
                  disabled={!feedbackInput.trim()}
                  className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  KI-Feedback speichern
                </button>
              </div>
            </div>
          </div>

          {/* Rechte Spalte: Feedback-Ausgabe & Empfehlungen */}
          <div className="xl:col-span-1">
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Empfehlungen & Feedback
                </h3>
              </div>

              {currentFeedback ? (
                <div className="space-y-4">
                  {/* Feedback Text */}
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        🤖 KI-Analyse vom {currentFeedback.date.toLocaleDateString('de-DE')}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        currentFeedback.applied 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {currentFeedback.applied ? '✅ Angewendet' : '⏳ Ausstehend'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {currentFeedback.feedback}
                    </div>
                  </div>

                  {/* Extrahierte Empfehlungen */}
                  {currentFeedback.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        🎯 Konkrete Empfehlungen:
                      </h4>
                      {currentFeedback.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-blue-700 dark:text-blue-300">
                            {rec}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Aktionen */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={() => {
                        const updated = { ...currentFeedback, applied: true };
                        const updatedFeedbacks = savedFeedback.map(fb => 
                          fb.id === currentFeedback.id ? updated : fb
                        );
                        setSavedFeedback(updatedFeedbacks);
                        setCurrentFeedback(updated);
                        localStorage.setItem('ai-feedback-history', JSON.stringify(updatedFeedbacks));
                        alert('Empfehlungen als angewendet markiert! ✅');
                      }}
                      disabled={currentFeedback.applied}
                      className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} />
                      {currentFeedback.applied ? 'Bereits angewendet' : 'Als angewendet markieren'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <MessageSquare size={48} className="mx-auto" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Kein KI-Feedback vorhanden
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Exportiere deine Analyse und hole dir KI-Feedback von Perplexity oder anderen KI-Agenten
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feedback-Historie */}
      {savedFeedback.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📚 Feedback-Historie
          </h3>
          <div className="space-y-3">
            {savedFeedback.slice(-5).reverse().map((feedback) => (
              <div
                key={feedback.id}
                onClick={() => setCurrentFeedback(feedback)}
                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  currentFeedback?.id === feedback.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    KI-Feedback #{feedback.id.split('-')[1]}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {feedback.date.toLocaleDateString('de-DE')}
                    </span>
                    {feedback.applied && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {feedback.feedback.substring(0, 100)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats für KI-Kontext */}
      {metrics && (
        <div className="card bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🎯 Quick Stats für KI-Analyse
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{metrics.multiWorkoutDays}</div>
              <div className="text-gray-600">Multi-Workout Tage</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{metrics.wellness.recoveryScore}/5</div>
              <div className="text-gray-600">Recovery Score</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {Math.round(metrics.intensityDistribution.high + metrics.intensityDistribution.veryHigh)}%
              </div>
              <div className="text-gray-600">Hohe Intensität</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {metrics.dataQuality.consistency}%
              </div>
              <div className="text-gray-600">Konsistenz</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPerformancePanel;
