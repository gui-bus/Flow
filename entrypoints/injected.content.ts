export default defineContentScript({
  matches: ['<all_urls>'],
  world: 'MAIN',
  runAt: 'document_start',
  main() {
    window.addEventListener('__FLOW_FILL_DROPDOWN__', async (e: any) => {
      const { requestId, fieldType, finalValue, candidateTargets, selector, nameAttr } = e.detail || {};

      try {
        const targetElem = document.querySelector(selector) || 
                           document.querySelector(`[data-component-name="Dropdown"][name="${nameAttr}"]`) ||
                           document.querySelector(`[name="${nameAttr}"]`) ||
                           document.querySelector(`#${nameAttr}`) as HTMLElement;

        if (!targetElem) {
          window.dispatchEvent(new CustomEvent('__FLOW_FILL_DROPDOWN_REPLY__', { detail: { requestId, success: false } }));
          return;
        }

        const dropdown = (targetElem.closest('.react-dropdown-select') || 
                          targetElem.querySelector('.react-dropdown-select') || 
                          targetElem.closest('[data-component-name="Dropdown"]')?.querySelector('.react-dropdown-select') ||
                          targetElem.closest('[data-component-name="Dropdown"]') || targetElem) as HTMLElement;

        const selectElem = (dropdown.querySelector('.react-dropdown-select') || dropdown) as HTMLElement;
        const isExpanded = selectElem.getAttribute('aria-expanded') === 'true';

        if (!isExpanded) {
          const handle = (selectElem.querySelector('.react-dropdown-select-content') || 
                          selectElem.querySelector('.react-dropdown-select-dropdown-handle') || 
                          selectElem) as HTMLElement;
          handle.focus();
          handle.click();
          await new Promise(r => setTimeout(r, 300));
        }

        const findButton = (): HTMLElement | null => {
          const optionButtons = Array.from(
            document.querySelectorAll('button[data-component-name="DropdownOption"], button[role="option"], [data-option-value], [role="option"]')
          ) as HTMLElement[];

          for (const btn of optionButtons) {
            const aria = (btn.getAttribute('aria-label') || '').toLowerCase().trim();
            const optVal = (btn.getAttribute('data-option-value') || '').toLowerCase().trim();
            const text = (btn.textContent || '').toLowerCase().trim();

            for (const target of candidateTargets) {
              const t = String(target).toLowerCase().trim();
              if (aria === t || (t.length >= 3 && aria.includes(t)) ||
                  optVal === t ||
                  text === t || (t.length >= 3 && text.includes(t))) {
                return btn;
              }
            }
          }
          return null;
        };

        let optBtn = findButton();

        if (!optBtn) {
          const searchInput = (dropdown.querySelector('input[placeholder*="Pesquis"], [data-component-name="DropdownOptionsSearch"] input') ||
                              document.querySelector('[data-component-name="DropdownOptionsSearch"] input, input[placeholder*="Pesquis"]')) as HTMLInputElement;

          if (searchInput) {
            searchInput.focus();
            const cleanQuery = finalValue.replace(/\s*\(.*?\)/g, '').trim();
            const primarySearch = cleanQuery || candidateTargets[0] || finalValue;

            const tracker = (searchInput as any)._valueTracker;
            if (tracker) tracker.setValue('');

            const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
            if (nativeSetter) {
              nativeSetter.call(searchInput, primarySearch);
            } else {
              searchInput.value = primarySearch;
            }
            searchInput.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, data: primarySearch, inputType: 'insertText' }));
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            searchInput.dispatchEvent(new Event('change', { bubbles: true }));

            const waitStart = Date.now();
            while (Date.now() - waitStart < 1200) {
              await new Promise(r => setTimeout(r, 100));
              optBtn = findButton();
              if (optBtn) break;
            }
          }
        }

        if (optBtn) {
          optBtn.scrollIntoView({ block: 'nearest' });
          await new Promise(r => setTimeout(r, 100));

          for (const k in optBtn) {
            if (k.startsWith('__reactFiber') || k.startsWith('__reactProps') || k.startsWith('__reactEventHandlers') || k.startsWith('__reactInternalInstance')) {
              let node = (optBtn as any)[k];
              while (node) {
                const props = node.memoizedProps || node.pendingProps || node.props;
                if (props && typeof props.onClick === 'function') {
                  try {
                    props.onClick({
                      target: optBtn,
                      currentTarget: optBtn,
                      bubbles: true,
                      cancelable: true,
                      preventDefault: () => {},
                      stopPropagation: () => {},
                      nativeEvent: new MouseEvent('click', { bubbles: true })
                    });
                    break;
                  } catch (_) {}
                }
                node = node.return || node._debugOwner;
              }
            }
          }

          const rect = optBtn.getBoundingClientRect();
          const clientX = rect.left > 0 ? rect.left + rect.width / 2 : 100;
          const clientY = rect.top > 0 ? rect.top + rect.height / 2 : 100;
          const mOpts = {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX,
            clientY,
            button: 0,
            buttons: 1
          };

          optBtn.dispatchEvent(new PointerEvent('pointerdown', { ...mOpts, pointerId: 1, pointerType: 'mouse', isPrimary: true }));
          optBtn.dispatchEvent(new MouseEvent('mousedown', mOpts));
          optBtn.dispatchEvent(new PointerEvent('pointerup', { ...mOpts, buttons: 0 }));
          optBtn.dispatchEvent(new MouseEvent('mouseup', { ...mOpts, buttons: 0 }));
          optBtn.dispatchEvent(new MouseEvent('click', { ...mOpts, buttons: 0 }));
          optBtn.click();

          await new Promise(r => setTimeout(r, 300));
        } else {
          const searchInput = document.querySelector('[data-component-name="DropdownOptionsSearch"] input, input[placeholder*="Pesquis"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', keyCode: 40, which: 40, bubbles: true }));
            searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, which: 13, bubbles: true }));
            searchInput.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', keyCode: 13, which: 13, bubbles: true }));
            await new Promise(r => setTimeout(r, 200));
          }
        }

        window.dispatchEvent(new CustomEvent('__FLOW_FILL_DROPDOWN_REPLY__', { detail: { requestId, success: true } }));
      } catch (err) {
        window.dispatchEvent(new CustomEvent('__FLOW_FILL_DROPDOWN_REPLY__', { detail: { requestId, success: false } }));
      }
    });
  }
});
