import { DetectedField } from '../types/index';

export function fillInput(el: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    el instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
    'value'
  )?.set;

  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(el, value);
  } else {
    el.value = value;
  }

  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new Event('blur', { bubbles: true }));
}

export function fillSelect(el: HTMLSelectElement, value: string): boolean {
  let matchedOption = false;
  const lowerValue = value.toLowerCase().trim();

  for (let i = 0; i < el.options.length; i++) {
    const opt = el.options[i];
    if (!opt) continue;
    const optVal = opt.value.toLowerCase().trim();
    const optText = opt.text.toLowerCase().trim();

    if (optVal === lowerValue || optText === lowerValue || optText.includes(lowerValue)) {
      el.selectedIndex = i;
      matchedOption = true;
      break;
    }
  }

  if (!matchedOption) {
    for (let i = 0; i < el.options.length; i++) {
      const opt = el.options[i];
      if (!opt) continue;
      const optText = opt.text.toLowerCase().trim();
      
      if (optText.includes(lowerValue) || lowerValue.includes(optText)) {
        el.selectedIndex = i;
        matchedOption = true;
        break;
      }
    }
  }

  if (matchedOption) {
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  return matchedOption;
}

export function fillRadio(name: string, value: string): boolean {
  const radios = document.querySelectorAll(`input[type="radio"][name="${name}"]`);
  let matched = false;
  const lowerValue = value.toLowerCase().trim();

  radios.forEach(radio => {
    const htmlRadio = radio as HTMLInputElement;
    const label = getRadioOrCheckboxLabel(htmlRadio);
    const radioVal = htmlRadio.value.toLowerCase().trim();

    if (radioVal === lowerValue || label.toLowerCase().includes(lowerValue)) {
      htmlRadio.checked = true;
      htmlRadio.dispatchEvent(new Event('click', { bubbles: true }));
      htmlRadio.dispatchEvent(new Event('change', { bubbles: true }));
      matched = true;
    }
  });

  return matched;
}

export function fillCheckbox(el: HTMLInputElement, checked: boolean): void {
  const currentChecked = el.checked || el.getAttribute('aria-checked') === 'true';
  if (currentChecked !== checked) {
    const parentLabel = el.closest('label') || el.parentElement;
    const target = (parentLabel || el) as HTMLElement;
    clickElement(target);

    el.checked = checked;
    el.setAttribute('aria-checked', String(checked));
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function normalizeTargetForField(fieldType: string, value: string): string[] {
  const val = value.trim();
  const lowerVal = val.toLowerCase();
  const cleanVal = lowerVal.replace(/\s*\(.*?\)/g, '').trim();
  const candidates = new Set<string>([val, lowerVal, cleanVal]);

  if (fieldType === 'countryOrigin' || fieldType === 'country') {
    if (['brasil', 'brazil', 'br', 'brasil (br)'].includes(cleanVal)) {
      candidates.add('Brasil (BR)');
      candidates.add('Brasil');
      candidates.add('brasil (br)');
      candidates.add('brasil');
      candidates.add('BR');
      candidates.add('br');
    }
  }

  if (fieldType === 'city') {
    const cityWithoutState = cleanVal.split('-')[0].trim();
    if (cityWithoutState) {
      candidates.add(cityWithoutState);
    }
  }

  if (fieldType === 'gender') {
    if (['masculino', 'homem', 'homem cis', 'homem cisgênero', 'homem cisgenero', 'male', 'man', 'm'].includes(cleanVal)) {
      candidates.add('Homem cisgênero');
      candidates.add('homem cisgênero');
      candidates.add('homem cisgenero');
      candidates.add('homem');
      candidates.add('masculino');
    } else if (['feminino', 'mulher', 'mulher cis', 'mulher cisgênero', 'mulher cisgenero', 'female', 'woman', 'f'].includes(cleanVal)) {
      candidates.add('Mulher cisgênero');
      candidates.add('mulher cisgênero');
      candidates.add('mulher cisgenero');
      candidates.add('mulher');
      candidates.add('feminino');
    } else if (['homem trans', 'homem transgênero', 'homem transgenero', 'trans masculino'].includes(cleanVal)) {
      candidates.add('Homem transgênero');
      candidates.add('homem transgênero');
      candidates.add('homem transgenero');
    } else if (['mulher trans', 'mulher transgênero', 'mulher transgenero', 'trans feminina'].includes(cleanVal)) {
      candidates.add('Mulher transgênero');
      candidates.add('mulher transgênero');
      candidates.add('mulher transgenero');
    } else if (['não-binário', 'nao-binario', 'não binário', 'nao binario', 'non-binary'].includes(cleanVal)) {
      candidates.add('Não-binário');
      candidates.add('não-binário');
      candidates.add('nao-binario');
      candidates.add('não binário');
    }
  }

  if (fieldType === 'isPcdCandidate' || fieldType === 'disability') {
    if (['não', 'nao', 'no', 'não pertenço', 'nao pertenço', 'nao pertenco', 'false', '0', 'sem deficiência'].includes(cleanVal)) {
      candidates.add('Não');
      candidates.add('não');
      candidates.add('nao');
      candidates.add('sem deficiência');
    } else if (['sim', 'yes', 'true', '1', 'pcd', 'com deficiência'].includes(cleanVal)) {
      candidates.add('Sim');
      candidates.add('sim');
      candidates.add('com deficiência');
      candidates.add('pcd');
    }
  }

  if (fieldType === 'referredBySomeone') {
    if (['não', 'nao', 'no', 'false', '0'].includes(cleanVal)) {
      candidates.add('Não');
      candidates.add('não');
      candidates.add('nao');
      candidates.add('false');
    } else if (['sim', 'yes', 'true', '1'].includes(cleanVal)) {
      candidates.add('Sim');
      candidates.add('sim');
      candidates.add('true');
    }
  }

  return Array.from(candidates);
}

export function clickElement(el: HTMLElement) {
  el.focus();
  const rect = el.getBoundingClientRect();
  const clientX = rect.left > 0 ? rect.left + rect.width / 2 : 100;
  const clientY = rect.top > 0 ? rect.top + rect.height / 2 : 100;
  const mouseOpts: MouseEventInit = {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX,
    clientY,
    screenX: clientX,
    screenY: clientY,
    button: 0,
    buttons: 1
  };

  el.dispatchEvent(new PointerEvent('pointerdown', { ...mouseOpts, pointerId: 1, pointerType: 'mouse', isPrimary: true }));
  el.dispatchEvent(new MouseEvent('mousedown', mouseOpts));
  el.dispatchEvent(new PointerEvent('pointerup', { ...mouseOpts, buttons: 0 }));
  el.dispatchEvent(new MouseEvent('mouseup', { ...mouseOpts, buttons: 0 }));
  el.dispatchEvent(new MouseEvent('click', { ...mouseOpts, buttons: 0 }));
}

export async function preWarmDropdowns(): Promise<void> {
  const countryEl = document.querySelector('[data-component-name="Dropdown"][name="country"], #country, [name="country"]') as HTMLElement;
  if (countryEl) {
    const handle = (countryEl.querySelector('.react-dropdown-select-content') || 
                    countryEl.querySelector('.react-dropdown-select-dropdown-handle') || 
                    countryEl.querySelector('.react-dropdown-select') || 
                    countryEl) as HTMLElement;
    
    clickElement(handle);
    await new Promise(r => setTimeout(r, 350));

    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
    document.body.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    await new Promise(r => setTimeout(r, 200));
  }
}

function getSearchKeyword(fieldType: string, val: string): string {
  let cleaned = val.replace(/\s*\(.*?\)/g, '').trim();
  if (fieldType === 'countryOrigin' && ['brasil', 'brazil', 'br'].includes(cleaned.toLowerCase())) {
    return 'Brasil';
  }
  return cleaned;
}

async function simulateSearchInput(searchInput: HTMLInputElement, searchText: string) {
  searchInput.scrollIntoView({ block: 'nearest' });
  searchInput.focus();
  searchInput.dispatchEvent(new FocusEvent('focus', { bubbles: false }));
  searchInput.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

  const rect = searchInput.getBoundingClientRect();
  const clientX = rect.left > 0 ? rect.left + rect.width / 2 : 100;
  const clientY = rect.top > 0 ? rect.top + rect.height / 2 : 100;
  const mouseOpts: MouseEventInit = {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX,
    clientY,
    screenX: clientX,
    screenY: clientY,
    button: 0,
    buttons: 1
  };

  searchInput.dispatchEvent(new PointerEvent('pointerdown', { ...mouseOpts, pointerId: 1, pointerType: 'mouse', isPrimary: true }));
  searchInput.dispatchEvent(new MouseEvent('mousedown', mouseOpts));
  searchInput.dispatchEvent(new PointerEvent('pointerup', { ...mouseOpts, buttons: 0 }));
  searchInput.dispatchEvent(new MouseEvent('mouseup', { ...mouseOpts, buttons: 0 }));
  searchInput.dispatchEvent(new MouseEvent('click', { ...mouseOpts, buttons: 0 }));

  await new Promise(r => setTimeout(r, 100));

  searchInput.select();
  try {
    document.execCommand('selectAll', false);
    document.execCommand('delete', false);
  } catch (e) {}

  let execSuccess = false;
  try {
    execSuccess = document.execCommand('insertText', false, searchText);
  } catch (e) {
    execSuccess = false;
  }

  if (!execSuccess || searchInput.value !== searchText) {
    const tracker = (searchInput as any)._valueTracker;
    if (tracker) tracker.setValue('');
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    if (nativeSetter) {
      nativeSetter.call(searchInput, searchText);
    } else {
      searchInput.value = searchText;
    }
    searchInput.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, cancelable: true, data: searchText, inputType: 'insertText' }));
    searchInput.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, data: searchText, inputType: 'insertText' }));
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    searchInput.dispatchEvent(new Event('change', { bubbles: true }));
  }

  searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: searchText[0] || 'a', bubbles: true }));
  searchInput.dispatchEvent(new KeyboardEvent('keyup', { key: searchText[searchText.length - 1] || 'a', bubbles: true }));

  searchInput.dispatchEvent(new PointerEvent('pointerdown', { ...mouseOpts, pointerId: 1, pointerType: 'mouse', isPrimary: true }));
  searchInput.dispatchEvent(new MouseEvent('mousedown', mouseOpts));
  searchInput.dispatchEvent(new PointerEvent('pointerup', { ...mouseOpts, buttons: 0 }));
  searchInput.dispatchEvent(new MouseEvent('mouseup', { ...mouseOpts, buttons: 0 }));
  searchInput.dispatchEvent(new MouseEvent('click', { ...mouseOpts, buttons: 0 }));

  await new Promise(r => setTimeout(r, 200));
}

export async function fillFieldOnPage(field: DetectedField): Promise<boolean> {
  const el = document.querySelector(field.elementSelector) as HTMLElement;
  if (!el || field.matchedValue === undefined || field.matchedValue === null) return false;

  try {
    const rawVal = String(field.matchedValue).trim();
    let finalValue = rawVal;

    if (el instanceof HTMLInputElement) {
      const type = el.type.toLowerCase();
      if (type === 'checkbox') {
        const isTrue = field.matchedValue === true || rawVal === 'true' || ['yes', 'sim', 'true', '1'].includes(rawVal.toLowerCase());
        fillCheckbox(el, isTrue);
        return true;
      } else if (type === 'radio') {
        if (field.nameAttribute) {
          return fillRadio(field.nameAttribute, finalValue);
        }
        el.checked = true;
        el.dispatchEvent(new Event('click', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    }

    if (field.fieldType === 'salaryExpectationClt' || field.fieldType === 'salaryExpectationPj') {
      if (rawVal.includes(',')) {
        finalValue = rawVal.replace('R$', '').trim();
      } else {
        const digits = rawVal.replace(/\D/g, '');
        if (digits) {
          const numeric = parseInt(digits, 10);
          if (numeric > 0) {
            finalValue = numeric.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          }
        }
      }
    }

    const reactDropdown = el.closest('.react-dropdown-select') || 
                          el.querySelector('.react-dropdown-select') || 
                          el.closest('[data-component-name="Dropdown"]')?.querySelector('.react-dropdown-select') ||
                          el.closest('[data-component-name="Dropdown"]') as HTMLElement;
    
    if (reactDropdown) {
      const hiddenInput = reactDropdown.querySelector('input[name]') as HTMLInputElement;
      if (hiddenInput) {
        const tracker = (hiddenInput as any)._valueTracker;
        if (tracker) tracker.setValue('');
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        if (nativeSetter) {
          nativeSetter.call(hiddenInput, finalValue);
        } else {
          hiddenInput.value = finalValue;
        }
        hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
        hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
      }

      const selectElem = (reactDropdown.querySelector('.react-dropdown-select') || reactDropdown) as HTMLElement;
      const handle = (selectElem.querySelector('.react-dropdown-select-content') || 
                      selectElem.querySelector('.react-dropdown-select-dropdown-handle') || 
                      selectElem) as HTMLElement;

      const isExpanded = selectElem.getAttribute('aria-expanded') === 'true';
      if (!isExpanded) {
        clickElement(handle);
        await new Promise(r => setTimeout(r, 150));
      }

      const candidateTargets = normalizeTargetForField(field.fieldType, finalValue);
      const primarySearch = getSearchKeyword(field.fieldType, finalValue);

      const searchInput = (selectElem.querySelector('input[placeholder*="Pesquis"], [data-component-name="DropdownOptionsSearch"] input') ||
                          document.querySelector('[data-component-name="DropdownOptionsSearch"] input')) as HTMLInputElement;

      if (searchInput) {
        await simulateSearchInput(searchInput, primarySearch);
      }

      const matchesTarget = (btn: HTMLElement, targets: string[]) => {
        const aria = (btn.getAttribute('aria-label') || '').toLowerCase().trim();
        const optVal = (btn.getAttribute('data-option-value') || '').toLowerCase().trim();
        const text = (btn.textContent || '').toLowerCase().trim();
        return targets.some(t => {
          const tL = t.toLowerCase();
          return aria === tL || optVal === tL || text === tL || (tL.length >= 3 && (aria.includes(tL) || text.includes(tL)));
        });
      };

      const findOptionButton = (): HTMLElement | null => {
        const scoped = Array.from(selectElem.querySelectorAll('button[data-component-name="DropdownOption"], button[role="option"], [data-option-value]')) as HTMLElement[];
        for (const btn of scoped) {
          if (matchesTarget(btn, candidateTargets)) return btn;
        }

        const portals = Array.from(document.querySelectorAll('[data-component-name="DropdownOptionsList"], .react-dropdown-select-dropdown'));
        for (const p of portals) {
          const btns = Array.from(p.querySelectorAll('button[data-component-name="DropdownOption"], button[role="option"], [data-option-value]')) as HTMLElement[];
          for (const btn of btns) {
            if (matchesTarget(btn, candidateTargets)) return btn;
          }
        }

        const allButtons = Array.from(document.querySelectorAll('button[data-component-name="DropdownOption"], button[role="option"]')) as HTMLElement[];
        for (const btn of allButtons) {
          if (matchesTarget(btn, candidateTargets)) return btn;
        }

        return null;
      };

      let buttonToClick = findOptionButton();
      if (!buttonToClick && searchInput) {
        const waitStart = Date.now();
        while (Date.now() - waitStart < 500) {
          await new Promise(resolve => setTimeout(resolve, 50));
          buttonToClick = findOptionButton();
          if (buttonToClick) break;
        }
      }

      if (buttonToClick) {
        buttonToClick.scrollIntoView({ block: 'nearest' });
        clickElement(buttonToClick);
        await new Promise(resolve => setTimeout(resolve, 150));
      } else if (searchInput) {
        searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', keyCode: 40, which: 40, bubbles: true }));
        searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, which: 13, bubbles: true }));
        searchInput.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', keyCode: 13, which: 13, bubbles: true }));
        await new Promise(resolve => setTimeout(resolve, 150));
      }

      const stillExpanded = selectElem.getAttribute('aria-expanded') === 'true';
      if (stillExpanded) {
        clickElement(handle);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (field.fieldType === 'countryOrigin') {
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      return true;
    } if (el instanceof HTMLInputElement) {
      const type = el.type.toLowerCase();
      if (type === 'checkbox') {
        const isTrue = finalValue === 'true' || ['yes', 'sim', 'true', '1'].includes(finalValue.toLowerCase());
        fillCheckbox(el, isTrue);
        return true;
      } else if (type === 'radio') {
        if (field.nameAttribute) {
          return fillRadio(field.nameAttribute, finalValue);
        }
        el.checked = true;
        el.dispatchEvent(new Event('click', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      } else {
        fillInput(el, finalValue);
        return true;
      }
    } else if (el instanceof HTMLTextAreaElement) {
      fillInput(el, finalValue);
      return true;
    } else if (el instanceof HTMLSelectElement) {
      return fillSelect(el, finalValue);
    }
  } catch (err) {
    console.error('Flow filling error:', err);
  }

  return false;
}
