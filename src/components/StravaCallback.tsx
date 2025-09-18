import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import stravaService from '../services/stravaService';

const StravaCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verbindung zu Strava wird hergestellt...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL Parameter auslesen
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          throw new Error(`Strava Fehler: ${error}`);
        }

        if (!code) {
          throw new Error('Kein Autorisierungscode erhalten');
        }

        setMessage('Autorisierungscode verarbeiten...');
        
        // Token mit Strava austauschen
        await stravaService.exchangeCodeForTokens(code);
        
        setStatus('success');
        setMessage('Erfolgreich mit Strava verbunden! 🎉');
        
        // Nach 2 Sekunden zur Strava-Seite weiterleiten
        setTimeout(() => {
          navigate('/strava');
        }, 2000);
        
      } catch (error) {
        console.error('Strava callback error:', error);
        setStatus('error');
        setMessage(`Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
        
        // Nach 3 Sekunden zur Strava-Seite weiterleiten (zum erneuten Versuch)
        setTimeout(() => {
          navigate('/strava');
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card text-center py-8">
          <div className="mb-6">
            {status === 'loading' && (
              <Loader2 className="w-16 h-16 text-primary-500 mx-auto animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-16 h-16 text-success-500 mx-auto" />
            )}
            {status === 'error' && (
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            )}
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Strava Autorisierung
          </h2>
          
          <p className={`text-sm mb-6 ${
            status === 'error' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {message}
          </p>
          
          {status === 'loading' && (
            <div className="flex justify-center">
              <div className="animate-pulse flex space-x-1">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              </div>
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-success-600 text-sm">
              Du wirst automatisch weitergeleitet...
            </div>
          )}
          
          {status === 'error' && (
            <button
              onClick={() => navigate('/strava')}
              className="btn-primary"
            >
              Zurück zu Strava Integration
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StravaCallback;
