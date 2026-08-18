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
          handle.click();
          await new Promise(r => setTimeout(r, 150));
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
              if (aria === target || (target.length >= 3 && aria.includes(target)) ||
                  optVal === target ||
                  text === target || (target.length >= 3 && text.includes(target))) {
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
            const primarySearch = candidateTargets[0] || finalValue;
            const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
            if (nativeSetter) {
              nativeSetter.call(searchInput, primarySearch);
            } else {
              searchInput.value = primarySearch;
            }
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            searchInput.dispatchEvent(new Event('change', { bubbles: true }));

            await new Promise(r => setTimeout(r, 200));
            optBtn = findButton();
          }
        }

        if (optBtn) {
          optBtn.scrollIntoView({ block: 'nearest' });

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

          optBtn.click();
        } else {
          const searchInput = document.querySelector('[data-component-name="DropdownOptionsSearch"] input, input[placeholder*="Pesquis"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', keyCode: 40, which: 40, bubbles: true }));
            searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, which: 13, bubbles: true }));
            searchInput.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', keyCode: 13, which: 13, bubbles: true }));
          }
        }

        window.dispatchEvent(new CustomEvent('__FLOW_FILL_DROPDOWN_REPLY__', { detail: { requestId, success: true } }));
      } catch (err) {
        window.dispatchEvent(new CustomEvent('__FLOW_FILL_DROPDOWN_REPLY__', { detail: { requestId, success: false } }));
      }
    });
  }
});
