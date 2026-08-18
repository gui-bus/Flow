import { JobPlatformAdapter } from './types';
import { BaseAdapter } from './base';
import { DetectedField } from '../../types/index';

export class InHireAdapter extends BaseAdapter implements JobPlatformAdapter {
  name = 'InHire';

  matches(url: string): boolean {
    return url.includes('inhire.app') || url.includes('inhire.io') || url.includes('inhire-jobs') || url.includes('inhire');
  }

  detectFields(doc: Document): DetectedField[] {
    const fields: DetectedField[] = [];
    const processedElements = new Set<HTMLElement>();

    let fieldIndex = 0;
    const registerField = (
      el: HTMLElement,
      fieldType: FieldType,
      confidence: 'HIGH' | 'MEDIUM' | 'LOW',
      label: string,
      inputType?: string,
      nameAttr?: string
    ) => {
      if (processedElements.has(el)) return;
      processedElements.add(el);

      fieldIndex++;
      const uniqueId = `flow-inhire-${fieldIndex}-${Date.now()}`;
      el.setAttribute('data-flow-id', uniqueId);

      fields.push({
        id: uniqueId,
        fieldType,
        confidence,
        elementSelector: `[data-flow-id="${uniqueId}"]`,
        tagName: el.tagName.toUpperCase(),
        inputType,
        label,
        nameAttribute: nameAttr || el.getAttribute('name') || undefined,
        idAttribute: el.id || undefined,
        placeholderAttribute: el.getAttribute('placeholder') || undefined,
        reason: `InHire exact field detection (${fieldType})`
      });
    };

    const directMappings: { names: string[]; fieldType: FieldType; label: string }[] = [
      { names: ['name'], fieldType: 'fullName', label: 'Nome completo' },
      { names: ['email'], fieldType: 'email', label: 'Seu melhor email' },
      { names: ['phone'], fieldType: 'phone', label: 'Celular com DDD' },
      { names: ['linkedinUsername'], fieldType: 'linkedin', label: 'Linkedin' },
      { names: ['country'], fieldType: 'countryOrigin', label: 'País de origem' },
      { names: ['districtBr', 'district', 'city'], fieldType: 'city', label: 'Cidade' },
      { names: ['salaryExpectation'], fieldType: 'salaryExpectationClt', label: 'Pretensão salarial como CLT' },
      { names: ['isIndication'], fieldType: 'referredBySomeone', label: 'Você foi indicado por alguém da empresa?' },
      { names: ['questionsDiversity.genderIdentity'], fieldType: 'gender', label: 'Qual é a sua identidade de gênero?' },
      { names: ['questionsDiversity.sexualOrientation'], fieldType: 'sexualOrientation', label: 'Qual é a sua orientação sexual?' },
      { names: ['questionsDiversity.colourAndEthnicity'], fieldType: 'race', label: 'Qual é a sua cor ou raça?' },
      { names: ['questionsDiversity.peopleWithDisability'], fieldType: 'isPcdCandidate', label: 'Deseja se candidatar para a vaga como pessoa com deficiência?' },
      { names: ['privacyPolicy'], fieldType: 'rgpdConsent', label: 'Política de Privacidade' }
    ];

    for (const mapping of directMappings) {
      for (const name of mapping.names) {
        const match = doc.querySelector(`[data-component-name="Dropdown"][name="${name}"], input[name="${name}"], select[name="${name}"]`) as HTMLElement;
        if (match && !processedElements.has(match)) {
          registerField(match, mapping.fieldType, 'HIGH', mapping.label, (match as HTMLInputElement).type, name);

          match.querySelectorAll('input, select, textarea').forEach(child => processedElements.add(child as HTMLElement));
          const parentDropdown = match.closest('[data-component-name="Dropdown"]');
          if (parentDropdown) processedElements.add(parentDropdown as HTMLElement);
          const parentSelect = match.closest('.react-dropdown-select');
          if (parentSelect) parentSelect.querySelectorAll('input').forEach(child => processedElements.add(child as HTMLElement));
          break;
        }
      }
    }

    const checkboxes = Array.from(doc.querySelectorAll('input[type="checkbox"], [data-component-name="Checkbox"] input')) as HTMLInputElement[];
    for (const cb of checkboxes) {
      if (processedElements.has(cb)) continue;
      
      const parentLabel = cb.closest('label') || cb.parentElement;
      const text = (parentLabel?.textContent || '').toLowerCase().trim();

      if (text.includes('pessoa preta') || text.includes('negra')) {
        registerField(cb, 'groupPreto', 'HIGH', 'Pessoa preta', 'checkbox');
      } else if (text.includes('pessoa parda') || text.includes('parda')) {
        registerField(cb, 'groupPardo', 'HIGH', 'Pessoa parda', 'checkbox');
      } else if (text.includes('indígena') || text.includes('indigena')) {
        registerField(cb, 'groupIndigena', 'HIGH', 'Indígena', 'checkbox');
      } else if (text.includes('mulher')) {
        registerField(cb, 'groupMulher', 'HIGH', 'Mulher', 'checkbox');
      } else if (text.includes('deficiência') || text.includes('deficiencia')) {
        registerField(cb, 'groupPcd', 'HIGH', 'Pessoa com Deficiência', 'checkbox');
      } else if (text.includes('lgbt')) {
        registerField(cb, 'groupLgbt', 'HIGH', 'LGBTI+', 'checkbox');
      } else if (text.includes('não pertenço') || text.includes('nao pertenço')) {
        registerField(cb, 'groupNone', 'HIGH', 'Não pertenço a nenhum dos grupos', 'checkbox');
      } else if (text.includes('prefiro não responder') || text.includes('prefiro nao responder')) {
        registerField(cb, 'groupNoAnswer', 'HIGH', 'Prefiro não responder', 'checkbox');
      } else if (text.includes('política de privacidade') || text.includes('politica de privacidade') || text.includes('concorda')) {
        registerField(cb, 'rgpdConsent', 'HIGH', 'Política de Privacidade', 'checkbox');
      }
    }

    const allInputs = doc.querySelectorAll('input, textarea, select');
    allInputs.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (processedElements.has(htmlEl)) return;

      if (htmlEl instanceof HTMLInputElement) {
        const type = htmlEl.type.toLowerCase();
        if (['submit', 'button', 'hidden', 'file'].includes(type)) return;
      }

      const id = htmlEl.id || '';
      const name = htmlEl.getAttribute('name') || '';
      const placeholder = htmlEl.getAttribute('placeholder') || '';
      const label = this.getLabelText(htmlEl);
      const inputType = htmlEl instanceof HTMLInputElement ? htmlEl.type.toLowerCase() : undefined;

      const detection = this.determineFieldType(name, id, placeholder, label, inputType || '');
      if (detection) {
        registerField(htmlEl, detection.fieldType, detection.confidence, label || placeholder || name || id, inputType, name);
      }
    });

    return fields;
  }
}
