import { getAdapterForUrl } from '../lib/adapters';
import { fillFieldOnPage } from '../lib/fill';
import { getProfile } from '../lib/storage';
import { FormAnalysis, DetectedField } from '../types/index';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    console.log('Flow Content Script injected');

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'ANALYZE_FORM_REQUEST') {
        analyzePageForm()
          .then((analysis) => sendResponse(analysis))
          .catch((err) => {
            console.error('Flow analysis error:', err);
            sendResponse({ platform: 'Generic', fields: [] });
          });
        return true;
      }

      if (message.type === 'FILL_FORM_REQUEST') {
        const fields = message.payload.fields as DetectedField[];
        fillFormFields(fields)
          .then((result) => sendResponse(result))
          .catch((err) => {
            console.error('Flow fill error:', err);
            sendResponse({ success: false, filledCount: 0, skippedCount: fields.length });
          });
        return true;
      }
    });
  },
});

async function analyzePageForm(): Promise<FormAnalysis> {
  const url = window.location.href;
  const adapter = getAdapterForUrl(url);
  const detected = adapter.detectFields(document);
  const profile = await getProfile();

  const fieldsWithValues = detected.map(field => {
    const val = profile[field.fieldType];
    return {
      ...field,
      matchedValue: val !== undefined && val !== null ? String(val) : undefined
    };
  });

  return {
    platform: adapter.name,
    fields: fieldsWithValues
  };
}

async function fillFormFields(fields: DetectedField[]): Promise<{ success: boolean; filledCount: number; skippedCount: number }> {
  let filledCount = 0;
  let skippedCount = 0;

  const sortedFields = [...fields].sort((a, b) => {
    if (a.fieldType === 'countryOrigin') return -1;
    if (b.fieldType === 'countryOrigin') return 1;
    return 0;
  });

  for (const field of sortedFields) {
    if (field.matchedValue === undefined || field.matchedValue === null || field.matchedValue === '') {
      skippedCount++;
      continue;
    }
    
    const success = await fillFieldOnPage(field);
    if (success) {
      filledCount++;
    } else {
      skippedCount++;
    }
  }

  return {
    success: true,
    filledCount,
    skippedCount
  };
}
