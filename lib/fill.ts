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
    simulateClick(target);

    if ((el.checked || el.getAttribute('aria-checked') === 'true') !== checked) {
      el.checked = checked;
      el.setAttribute('aria-checked', String(checked));
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
}

function normalizeTargetForField(fieldType: string, value: string): string[] {
  const val = value.toLowerCase().trim();
  const cleanVal = val.replace(/\s*\(.*?\)/g, '').trim();
  const candidates = new Set<string>([cleanVal, val]);

  if (fieldType === 'countryOrigin') {
    if (['brasil', 'brazil', 'br'].includes(cleanVal)) {
      candidates.add('brasil');
      candidates.add('brasil (br)');
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
      candidates.add('homem cisgênero');
      candidates.add('homem cisgenero');
      candidates.add('homem');
      candidates.add('masculino');
    } else if (['feminino', 'mulher', 'mulher cis', 'mulher cisgênero', 'mulher cisgenero', 'female', 'woman', 'f'].includes(cleanVal)) {
      candidates.add('mulher cisgênero');
      candidates.add('mulher cisgenero');
      candidates.add('mulher');
      candidates.add('feminino');
    } else if (['homem trans', 'homem transgênero', 'homem transgenero', 'trans masculino'].includes(cleanVal)) {
      candidates.add('homem transgênero');
      candidates.add('homem transgenero');
    } else if (['mulher trans', 'mulher transgênero', 'mulher transgenero', 'trans feminina'].includes(cleanVal)) {
      candidates.add('mulher transgênero');
      candidates.add('mulher transgenero');
    } else if (['não-binário', 'nao-binario', 'não binário', 'nao binario', 'non-binary'].includes(cleanVal)) {
      candidates.add('não-binário');
      candidates.add('nao-binario');
      candidates.add('não binário');
    }
  }

  if (fieldType === 'isPcdCandidate' || fieldType === 'disability') {
    if (['não', 'nao', 'no', 'não pertenço', 'nao pertenço', 'nao pertenco', 'false', '0', 'sem deficiência'].includes(cleanVal)) {
      candidates.add('não');
      candidates.add('nao');
      candidates.add('sem deficiência');
    } else if (['sim', 'yes', 'true', '1', 'pcd', 'com deficiência'].includes(cleanVal)) {
      candidates.add('sim');
      candidates.add('com deficiência');
      candidates.add('pcd');
    }
  }

  if (fieldType === 'referredBySomeone') {
    if (['não', 'nao', 'no', 'false', '0'].includes(cleanVal)) {
      candidates.add('não');
      candidates.add('nao');
      candidates.add('false');
    } else if (['sim', 'yes', 'true', '1'].includes(cleanVal)) {
      candidates.add('sim');
      candidates.add('true');
    }
  }

  return Array.from(candidates);
}

function triggerReactClick(el: HTMLElement): boolean {
  const reactKeys = Object.keys(el).filter(key => 
    key.startsWith('__reactFiber') || 
    key.startsWith('__reactProps') || 
    key.startsWith('__reactEventHandlers') ||
    key.startsWith('__reactInternalInstance')
  );

  for (const key of reactKeys) {
    try {
      const fiber = (el as any)[key];
      let node = fiber;
      while (node) {
        const props = node.memoizedProps || node.pendingProps || node.props;
        if (props && typeof props.onClick === 'function') {
          props.onClick({
            target: el,
            currentTarget: el,
            bubbles: true,
            cancelable: true,
            preventDefault: () => {},
            stopPropagation: () => {},
            nativeEvent: new MouseEvent('click', { bubbles: true })
          });
          return true;
        }
        node = node.return || node._debugOwner;
      }
    } catch (_) {}
  }
  return false;
}

function simulateClick(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
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

  element.focus();
  element.dispatchEvent(new PointerEvent('pointerdown', { ...mouseOpts, pointerId: 1, pointerType: 'mouse', isPrimary: true }));
  element.dispatchEvent(new MouseEvent('mousedown', mouseOpts));
  element.dispatchEvent(new PointerEvent('pointerup', { ...mouseOpts, buttons: 0 }));
  element.dispatchEvent(new MouseEvent('mouseup', { ...mouseOpts, buttons: 0 }));
  element.dispatchEvent(new MouseEvent('click', { ...mouseOpts, buttons: 0 }));
  element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
  element.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
  
  triggerReactClick(element);
  element.click();
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

      const selectHandle = (reactDropdown.querySelector('.react-dropdown-select-content') || 
                            reactDropdown.querySelector('.react-dropdown-select-dropdown-handle') || 
                            reactDropdown) as HTMLElement;

      simulateClick(selectHandle);
      await new Promise(resolve => setTimeout(resolve, 250));

      const candidateTargets = normalizeTargetForField(field.fieldType, finalValue);
      let buttonToClick: HTMLElement | undefined;

      const findOptionButton = (): HTMLElement | undefined => {
        const optionsList = reactDropdown.querySelector('[data-component-name="DropdownOptionsList"], .react-dropdown-select-dropdown') ||
                            document.querySelector('[data-component-name="DropdownOptionsList"], [data-component-name="DropdownOptions"]') ||
                            document.body;
        const optionButtons = Array.from(
          optionsList.querySelectorAll('button[data-component-name="DropdownOption"], button[role="option"], [data-option-value], [role="option"]')
        ) as HTMLElement[];

        for (const btn of optionButtons) {
          const aria = (btn.getAttribute('aria-label') || '').toLowerCase().trim();
          const optVal = (btn.getAttribute('data-option-value') || '').toLowerCase().trim();
          const text = (btn.textContent || '').toLowerCase().trim();

          for (const target of candidateTargets) {
            if (aria === target || (target.length >= 3 && aria.includes(target)) ||
                optVal === target ||
                text === target || (target.length >= 3 && text.includes(target))) {
              return btn;
            }
          }
        }
        return undefined;
      };

      buttonToClick = findOptionButton();

      if (!buttonToClick) {
        const searchInput = (reactDropdown.querySelector('input[placeholder*="Pesquis"], [data-component-name="DropdownOptionsSearch"] input') ||
                            document.querySelector('[data-component-name="DropdownOptionsSearch"] input, input[placeholder*="Pesquis"]')) as HTMLInputElement;

        if (searchInput) {
          searchInput.focus();
          const tracker = (searchInput as any)._valueTracker;
          if (tracker) tracker.setValue('');
          
          const primarySearch = candidateTargets[0] || finalValue;
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
          if (nativeSetter) {
            nativeSetter.call(searchInput, primarySearch);
          } else {
            searchInput.value = primarySearch;
          }
          searchInput.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, data: primarySearch }));
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          searchInput.dispatchEvent(new Event('change', { bubbles: true }));
          searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', keyCode: 40, which: 40, bubbles: true }));
          searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, which: 13, bubbles: true }));
          searchInput.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', keyCode: 13, which: 13, bubbles: true }));
          
          const waitStart = Date.now();
          while (Date.now() - waitStart < 1000) {
            await new Promise(resolve => setTimeout(resolve, 80));
            buttonToClick = findOptionButton();
            if (buttonToClick) break;
          }
        }
      }

      if (buttonToClick) {
        buttonToClick.scrollIntoView({ block: 'nearest' });
        simulateClick(buttonToClick);

        if (field.fieldType === 'countryOrigin') {
          await new Promise(resolve => setTimeout(resolve, 800));
        } else {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        return true;
      }
      return true;
    }

    if (el instanceof HTMLInputElement) {
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
