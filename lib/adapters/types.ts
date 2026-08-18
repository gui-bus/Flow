import { DetectedField } from '../../types/index';

export interface JobPlatformAdapter {
  name: string;
  matches(url: string): boolean;
  detectFields(document: Document): DetectedField[];
}
