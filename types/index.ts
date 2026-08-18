export type FieldType =
  | 'firstName'
  | 'lastName'
  | 'fullName'
  | 'email'
  | 'phone'
  | 'linkedin'
  | 'github'
  | 'portfolio'
  | 'city'
  | 'state'
  | 'country'
  | 'countryOrigin'
  | 'salaryExpectationClt'
  | 'salaryExpectationPj'
  | 'experienceYears'
  | 'gender'
  | 'race'
  | 'disability'
  | 'workAuthorization'
  | 'availability'
  | 'sexualOrientation'
  | 'isPcdCandidate'
  | 'referredBySomeone'
  | 'referredByName'
  | 'lgbtqia'
  | 'rgpdConsent'
  
  | 'groupPreto'
  | 'groupPardo'
  | 'groupIndigena'
  | 'groupMulher'
  | 'groupPcd'
  | 'groupLgbt'
  | 'groupNone'
  | 'groupNoAnswer';

export interface UserProfile {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  city: string;
  state: string;
  country: string;
  countryOrigin: string;
  salaryExpectationClt: string;
  salaryExpectationPj: string;
  experienceYears: string;
  gender: string;
  race: string;
  disability: string;
  workAuthorization: string;
  availability: string;
  sexualOrientation: string;
  isPcdCandidate: string;
  referredBySomeone: string;
  referredByName: string;
  lgbtqia: string;
  rgpdConsent: string;

  
  groupPreto: boolean;
  groupPardo: boolean;
  groupIndigena: boolean;
  groupMulher: boolean;
  groupPcd: boolean;
  groupLgbt: boolean;
  groupNone: boolean;
  groupNoAnswer: boolean;
}

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface DetectedField {
  id: string;
  fieldType: FieldType;
  confidence: ConfidenceLevel;
  elementSelector: string;
  tagName: string;
  inputType?: string;
  label?: string;
  nameAttribute?: string;
  idAttribute?: string;
  placeholderAttribute?: string;
  matchedValue?: string;
  reason?: string;
}

export interface FormAnalysis {
  platform: string;
  fields: DetectedField[];
}

export type MessageType =
  | { type: 'ANALYZE_FORM_REQUEST' }
  | { type: 'ANALYZE_FORM_RESPONSE'; payload: FormAnalysis }
  | { type: 'FILL_FORM_REQUEST'; payload: { fields: DetectedField[] } }
  | { type: 'FILL_FORM_RESPONSE'; payload: { success: boolean; filledCount: number; skippedCount: number } };
