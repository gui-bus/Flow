import React, { useEffect, useState } from 'react';
import { getProfile } from '../../lib/storage';
import { DetectedField, FormAnalysis, UserProfile } from '../../types/index';
import logoWhite from '/logo/logo_white.svg';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [analysis, setAnalysis] = useState<FormAnalysis | null>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'success' | 'no-active-tab' | 'filling' | 'filled'>('idle');
  const [fillStats, setFillStats] = useState<{ filled: number; skipped: number } | null>(null);

  useEffect(() => {
    getProfile().then(setProfile);
    analyzeCurrentTab();
  }, []);

  const openOptionsPage = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
  };

  const analyzeCurrentTab = async () => {
    setStatus('analyzing');
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        setStatus('no-active-tab');
        return;
      }

      chrome.tabs.sendMessage(tab.id, { type: 'ANALYZE_FORM_REQUEST' }, (response) => {
        if (chrome.runtime.lastError || !response) {
          console.warn('Flow script may not be loaded on this page yet:', chrome.runtime.lastError);
          setAnalysis(null);
          setStatus('no-active-tab');
          return;
        }

        setAnalysis(response);
        setStatus('success');
      });
    } catch (err) {
      console.error(err);
      setStatus('no-active-tab');
    }
  };

  const handleFillForm = async () => {
    if (!analysis || analysis.fields.length === 0) return;
    setStatus('filling');

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) return;

      const fieldsToFill = analysis.fields.filter(f => f.matchedValue);

      chrome.tabs.sendMessage(tab.id, { type: 'FILL_FORM_REQUEST', payload: { fields: fieldsToFill } }, (response) => {
        if (chrome.runtime.lastError || !response) {
          setStatus('success');
          return;
        }

        setFillStats({
          filled: response.filledCount,
          skipped: response.skippedCount + (analysis.fields.length - fieldsToFill.length),
        });
        setStatus('filled');
      });
    } catch (err) {
      console.error(err);
      setStatus('success');
    }
  };

  const fieldsWithValues = analysis?.fields.filter(f => f.matchedValue) || [];
  const fieldsNeedReview = analysis?.fields.filter(f => !f.matchedValue && ['gender', 'race', 'disability', 'workAuthorization'].includes(f.fieldType)) || [];
  const emptyFieldsCount = (analysis?.fields.length || 0) - fieldsWithValues.length;

  return (
    <div className="w-[340px] bg-[#F1F1F1] text-slate-800 font-sans shadow-lg flex flex-col min-h-[400px] border border-slate-200 rounded-xl overflow-hidden">
      <header className="px-5 py-4 flex items-center justify-between bg-[#161616] text-white">
        <div className="flex items-center">
          <img src={logoWhite} alt="Flow Logo" className="h-5 w-auto" />
        </div>
        <button
          onClick={openOptionsPage}
          className="text-xs font-semibold text-[#161616] hover:bg-[#7ab503] transition-colors bg-[#8BCE04] px-3 py-1.5 rounded-lg cursor-pointer"
        >
          Meu Perfil
        </button>
      </header>

      
      <main className="flex-1 p-5 flex flex-col justify-between space-y-4">
        <div>
          
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-800">
              {profile?.firstName ? `Olá, ${profile.firstName}` : 'Bem-vindo ao Flow'}
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Assistente de preenchimento automático</p>
          </div>

          
          {status === 'analyzing' && (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <div className="w-6 h-6 border-2 border-[#161616] border-t-[#8BCE04] rounded-full animate-spin"></div>
              <p className="text-xs text-slate-400 font-medium">Analisando página...</p>
            </div>
          )}

          {status === 'no-active-tab' && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center my-2 space-y-1.5 shadow-sm">
              <p className="text-xs text-slate-700 font-bold">Nenhum formulário detectado</p>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Abra um formulário de candidatura e clique em reanalisar.
              </p>
            </div>
          )}

          {(status === 'success' || status === 'filling') && analysis && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Plataforma</span>
                  <span className="font-semibold text-slate-700">
                    {analysis.platform}
                  </span>
                </div>
                
                <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                  <span className="text-slate-400">Campos detectados</span>
                  <span className="font-bold text-slate-800">
                    {analysis.fields.length}
                  </span>
                </div>
              </div>

              
              <div className="space-y-1.5">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Diagnóstico</h3>
                
                <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden text-xs shadow-sm">
                  {fieldsWithValues.length > 0 && (
                    <div className="flex items-center justify-between p-3">
                      <span className="text-slate-600 font-medium">Campos prontos</span>
                      <span className="bg-[#8BCE04]/20 text-[#161616] font-bold px-2 py-0.5 rounded text-[10px]">
                        {fieldsWithValues.length}
                      </span>
                    </div>
                  )}

                  {fieldsNeedReview.length > 0 && (
                    <div className="flex items-center justify-between p-3">
                      <span className="text-slate-600 font-medium">Respostas de diversidade</span>
                      <span className="bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded text-[10px]">
                        {fieldsNeedReview.length}
                      </span>
                    </div>
                  )}

                  {emptyFieldsCount > 0 && (
                    <div className="flex items-center justify-between p-3">
                      <span className="text-slate-400">Campos sem dados</span>
                      <span className="bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded text-[10px]">
                        {emptyFieldsCount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {status === 'filled' && fillStats && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 text-center my-2 space-y-4 shadow-sm">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-800">Campos Preenchidos</h3>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Revise as informações inseridas antes de enviar o formulário.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div className="bg-[#F1F1F1] border border-slate-200 p-2.5 rounded-lg">
                  <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Preenchidos</span>
                  <span className="font-bold text-[#161616] text-base">{fillStats.filled}</span>
                </div>
                <div className="bg-[#F1F1F1] border border-slate-200 p-2.5 rounded-lg">
                  <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Ignorados</span>
                  <span className="font-bold text-slate-800 text-base">{fillStats.skipped}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        
        <div className="pt-3 border-t border-slate-200 flex gap-2">
          {status === 'filled' ? (
            <button
              onClick={analyzeCurrentTab}
              className="w-full py-2.5 bg-[#161616] hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Reanalisar Página
            </button>
          ) : (
            <button
              disabled={status === 'analyzing' || status === 'filling' || !analysis || analysis.fields.length === 0}
              onClick={handleFillForm}
              className="w-full py-2.5 bg-[#8BCE04] hover:bg-[#7ab503] text-[#161616] font-bold text-xs rounded-lg transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {status === 'filling' ? 'Preenchendo...' : 'Preencher Formulário'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
