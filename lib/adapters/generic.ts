import { JobPlatformAdapter } from './types';
import { BaseAdapter } from './base';
import { DetectedField } from '../../types/index';

export class GenericAdapter extends BaseAdapter implements JobPlatformAdapter {
  name = 'Generic';

  matches(url: string): boolean {
    return true;
  }

  detectFields(doc: Document): DetectedField[] {
    const fields: DetectedField[] = [];
    
    const inputs = doc.querySelectorAll('input, textarea, select');
    
    inputs.forEach((el, index) => {
      const htmlEl = el as HTMLElement;
      
      if (htmlEl instanceof HTMLInputElement) {
        const type = htmlEl.type.toLowerCase();
        if (['submit', 'button', 'image', 'hidden', 'file', 'reset'].includes(type)) {
          return;
        }
      }

      const id = htmlEl.id || '';
      const name = htmlEl.getAttribute('name') || '';
      const placeholder = htmlEl.getAttribute('placeholder') || '';
      const label = this.getLabelText(htmlEl);
      const tagName = htmlEl.tagName.toUpperCase();
      const inputType = htmlEl instanceof HTMLInputElement ? htmlEl.type.toLowerCase() : undefined;

      const detection = this.determineFieldType(name, id, placeholder, label, inputType || '');

      if (detection) {
        fields.push({
          id: id || `flow-field-${index}-${Date.now()}`,
          fieldType: detection.fieldType,
          confidence: detection.confidence,
          elementSelector: this.getSelector(htmlEl),
          tagName,
          inputType,
          label: label || placeholder || name || id,
          nameAttribute: name || undefined,
          idAttribute: id || undefined,
          placeholderAttribute: placeholder || undefined,
          reason: detection.reason
        });
      }
    });

    return fields;
  }
}
