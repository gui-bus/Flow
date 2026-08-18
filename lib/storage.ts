import { UserProfile } from '../types/index';

const STORAGE_KEY = 'flow_user_profile';

export const DEFAULT_PROFILE: UserProfile = {
  firstName: '',
  lastName: '',
  fullName: '',
  email: '',
  phone: '',
  linkedin: '',
  github: '',
  portfolio: '',
  city: '',
  state: '',
  country: '',
  countryOrigin: '',
  salaryExpectationClt: '',
  salaryExpectationPj: '',
  experienceYears: '',
  gender: '',
  race: '',
  disability: '',
  workAuthorization: '',
  availability: '',
  
  sexualOrientation: '',
  isPcdCandidate: '',
  referredBySomeone: '',
  referredByName: '',
  lgbtqia: '',
  rgpdConsent: '',

  
  groupPreto: false,
  groupPardo: false,
  groupIndigena: false,
  groupMulher: false,
  groupPcd: false,
  groupLgbt: false,
  groupNone: false,
  groupNoAnswer: false,
};

export async function getProfile(): Promise<UserProfile> {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      if (result && result[STORAGE_KEY]) {
        resolve({ ...DEFAULT_PROFILE, ...result[STORAGE_KEY] });
      } else {
        resolve(DEFAULT_PROFILE);
      }
    });
  });
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: profile }, () => {
      resolve();
    });
  });
}
