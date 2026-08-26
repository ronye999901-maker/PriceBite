import { PINCodeDetails, LanguageCode } from '../types';

const PIN_DATABASE: Record<string, PINCodeDetails> = {
  // Paschim Medinipur / Midnapore
  '721101': { pinCode: '721101', area: 'Midnapore Town / Midnapore HO', district: 'Paschim Medinipur', state: 'West Bengal', recommendedLanguage: 'bn', languageNativeName: 'বাংলা (Bengali)' },
  '721102': { pinCode: '721102', area: 'Midnapore Bus Stand / Rangamati', district: 'Paschim Medinipur', state: 'West Bengal', recommendedLanguage: 'bn', languageNativeName: 'বাংলা (Bengali)' },
  '721301': { pinCode: '721301', area: 'Kharagpur Town', district: 'Paschim Medinipur', state: 'West Bengal', recommendedLanguage: 'bn', languageNativeName: 'বাংলা (Bengali)' },
  '721302': { pinCode: '721302', area: 'IIT Kharagpur Campus', district: 'Paschim Medinipur', state: 'West Bengal', recommendedLanguage: 'bn', languageNativeName: 'বাংলা (Bengali)' },

  // New Town & Rajarhat (Kolkata / North 24 Parganas)
  '700156': { pinCode: '700156', area: 'New Town (Action Area I & II)', district: 'New Town Kolkata', state: 'West Bengal', recommendedLanguage: 'bn', languageNativeName: 'বাংলা (Bengali)' },
  '700135': { pinCode: '700135', area: 'New Town (Action Area III / Unitech)', district: 'New Town Kolkata', state: 'West Bengal', recommendedLanguage: 'bn', languageNativeName: 'বাংলা (Bengali)' },
  '700160': { pinCode: '700160', area: 'Rajarhat Main Road / Chowmatha', district: 'North 24 Parganas', state: 'West Bengal', recommendedLanguage: 'bn', languageNativeName: 'বাংলা (Bengali)' },

  // Salt Lake & Bidhannagar
  '700091': { pinCode: '700091', area: 'Salt Lake Sector V (IT Hub / Technopolis)', district: 'Bidhannagar / Kolkata', state: 'West Bengal', recommendedLanguage: 'bn', languageNativeName: 'বাংলা (Bengali)' },
  '700064': { pinCode: '700064', area: 'Salt Lake Sector I & II (City Centre 1)', district: 'Bidhannagar / Kolkata', state: 'West Bengal', recommendedLanguage: 'bn', languageNativeName: 'বাংলা (Bengali)' },
  '700106': { pinCode: '700106', area: 'Salt Lake Sector III (JA Block)', district: 'Bidhannagar / Kolkata', state: 'West Bengal', recommendedLanguage: 'bn', languageNativeName: 'বাংলা (Bengali)' },

  // Kolkata City Core
  '700001': { pinCode: '700001', area: 'Park Street / BBD Bagh', district: 'Central Kolkata', state: 'West Bengal', recommendedLanguage: 'bn', languageNativeName: 'বাংলা (Bengali)' },
  '700019': { pinCode: '700019', area: 'Ballygunge / Gariahat', district: 'South Kolkata', state: 'West Bengal', recommendedLanguage: 'bn', languageNativeName: 'বাংলা (Bengali)' },
  '700027': { pinCode: '700027', area: 'Alipore / New Alipore', district: 'South Kolkata', state: 'West Bengal', recommendedLanguage: 'bn', languageNativeName: 'বাংলা (Bengali)' },
  '700032': { pinCode: '700032', area: 'Jadavpur / Dhakuria', district: 'South Kolkata', state: 'West Bengal', recommendedLanguage: 'bn', languageNativeName: 'বাংলা (Bengali)' },
  '700084': { pinCode: '700084', area: 'Garia / Narendrapur', district: 'South 24 Parganas', state: 'West Bengal', recommendedLanguage: 'bn', languageNativeName: 'বাংলা (Bengali)' },

  // Mumbai & Suburbs
  '400001': { pinCode: '400001', area: 'Fort / Marine Drive', district: 'South Mumbai', state: 'Maharashtra', recommendedLanguage: 'mr', languageNativeName: 'मराठी (Marathi)' },
  '400050': { pinCode: '400050', area: 'Bandra West / Linking Road', district: 'Mumbai Suburban', state: 'Maharashtra', recommendedLanguage: 'mr', languageNativeName: 'मराठी (Marathi)' },
  '400053': { pinCode: '400053', area: 'Andheri West / Lokhandwala', district: 'Mumbai Suburban', state: 'Maharashtra', recommendedLanguage: 'mr', languageNativeName: 'मराठी (Marathi)' },

  // Delhi NCR
  '110001': { pinCode: '110001', area: 'Connaught Place / Janpath', district: 'New Delhi', state: 'Delhi NCR', recommendedLanguage: 'hi', languageNativeName: 'हिंदी (Hindi)' },
  '201301': { pinCode: '201301', area: 'Noida Sector 18', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', recommendedLanguage: 'hi', languageNativeName: 'हिंदी (Hindi)' },

  // Bengaluru
  '560001': { pinCode: '560001', area: 'MG Road / Brigade Road', district: 'Bengaluru Urban', state: 'Karnataka', recommendedLanguage: 'kn', languageNativeName: 'ಕನ್ನಡ (Kannada)' },
  '560038': { pinCode: '560038', area: 'Indiranagar 100ft Road', district: 'Bengaluru East', state: 'Karnataka', recommendedLanguage: 'kn', languageNativeName: 'ಕನ್ನಡ (Kannada)' },
};

// Real-time API lookup from India Post Postal PIN API
export async function fetchExactPINCode(pinCode: string): Promise<PINCodeDetails | null> {
  const cleanPin = pinCode ? pinCode.trim() : '';
  if (cleanPin.length !== 6) return null;

  // 1. Check local exact database first
  if (PIN_DATABASE[cleanPin]) {
    return PIN_DATABASE[cleanPin];
  }

  // 2. Fetch live exact data from India Post API
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
    const data = await res.json();

    if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
      const po = data[0].PostOffice[0];
      const areaName = `${po.Name} (${po.Block !== 'NA' ? po.Block : po.District})`;
      const districtName = po.District;
      const stateName = po.State;

      const s = stateName.toLowerCase();
      let recLang: LanguageCode = 'hi';
      let langNative = 'हिंदी (Hindi)';

      if (s.includes('bengal') || s.includes('tripura')) {
        recLang = 'bn';
        langNative = 'বাংলা (Bengali)';
      } else if (s.includes('maharashtra')) {
        recLang = 'mr';
        langNative = 'मराठी (Marathi)';
      } else if (s.includes('tamil') || s.includes('puducherry') || s.includes('pondicherry')) {
        recLang = 'ta';
        langNative = 'தமிழ் (Tamil)';
      } else if (s.includes('karnataka')) {
        recLang = 'kn';
        langNative = 'ಕನ್ನಡ (Kannada)';
      } else if (s.includes('telangana') || s.includes('andhra')) {
        recLang = 'te';
        langNative = 'తెలుగు (Telugu)';
      } else if (s.includes('gujarat')) {
        recLang = 'gu';
        langNative = 'ગુજરાતી (Gujarati)';
      } else if (s.includes('punjab')) {
        recLang = 'pa';
        langNative = 'ਪੰਜਾਬੀ (Punjabi)';
      } else if (s.includes('kerala') || s.includes('lakshadweep')) {
        recLang = 'ml';
        langNative = 'മലയാളം (Malayalam)';
      } else if (s.includes('odisha') || s.includes('orissa')) {
        recLang = 'or';
        langNative = 'ଓଡ଼ିଆ (Odia)';
      } else if (s.includes('assam')) {
        recLang = 'as';
        langNative = 'অসমীয়া (Assamese)';
      } else if (s.includes('goa')) {
        recLang = 'kok';
        langNative = 'कोंकणी (Konkani)';
      } else if (s.includes('kashmir') || s.includes('jammu') || s.includes('ladakh')) {
        recLang = 'ur';
        langNative = 'اردو (Urdu) / कॉशुर';
      } else if (s.includes('manipur')) {
        recLang = 'mni';
        langNative = 'মৈতৈলোন্ (Manipuri)';
      } else if (s.includes('sikkim')) {
        recLang = 'ne';
        langNative = 'नेपाली (Nepali)';
      } else if (s.includes('bihar')) {
        recLang = 'mai';
        langNative = 'मैथिली / हिंदी (Hindi/Maithili)';
      }

      return {
        pinCode: cleanPin,
        area: areaName,
        district: districtName,
        state: stateName,
        recommendedLanguage: recLang,
        languageNativeName: langNative,
      };
    }
  } catch (err) {
    console.warn('Live PIN API failed, using fallback heuristic:', err);
  }

  // 3. Fallback Heuristic if API is unreachable
  return lookupPINCode(cleanPin);
}

export function lookupPINCode(pinCode: string): PINCodeDetails | null {
  const cleanPin = pinCode ? pinCode.trim() : '';

  if (!cleanPin) {
    return null;
  }

  if (PIN_DATABASE[cleanPin]) {
    return PIN_DATABASE[cleanPin];
  }

  const firstThree = cleanPin.substring(0, 3);
  const firstFour = cleanPin.substring(0, 4);
  const firstTwo = cleanPin.substring(0, 2);

  // Paschim Medinipur / Medinipur Town Series (721xxx)
  if (firstThree === '721') {
    return {
      pinCode: cleanPin,
      area: cleanPin === '721101' ? 'Midnapore Town / Midnapore HO' : 'Paschim Medinipur Hub',
      district: 'Paschim Medinipur',
      state: 'West Bengal',
      recommendedLanguage: 'bn',
      languageNativeName: 'বাংলা (Bengali)',
    };
  }

  // Greater Kolkata / New Town Series (700xxx)
  if (firstThree === '700') {
    if (firstFour === '7001' || cleanPin.startsWith('70015') || cleanPin.startsWith('70016') || cleanPin.startsWith('70013')) {
      return {
        pinCode: cleanPin,
        area: 'New Town / Rajarhat Township',
        district: 'New Town Kolkata',
        state: 'West Bengal',
        recommendedLanguage: 'bn',
        languageNativeName: 'বাংলা (Bengali)',
      };
    }
    return {
      pinCode: cleanPin,
      area: 'Kolkata Metro Area',
      district: 'Kolkata',
      state: 'West Bengal',
      recommendedLanguage: 'bn',
      languageNativeName: 'বাংলা (Bengali)',
    };
  }

  // Mumbai (400xxx)
  if (firstThree === '400') {
    return {
      pinCode: cleanPin,
      area: 'Mumbai Metropolitan Region',
      district: 'Mumbai',
      state: 'Maharashtra',
      recommendedLanguage: 'mr',
      languageNativeName: 'मराठी (Marathi)',
    };
  }

  // State Level Fallbacks
  let recLang: LanguageCode = 'hi';
  let state = 'India';
  let langNative = 'हिंदी (Hindi)';
  let defaultArea = 'Local Area';
  let district = 'Local District';

  if (['70', '71', '72', '73', '74'].includes(firstTwo)) {
    state = 'West Bengal';
    district = firstTwo === '72' ? 'Paschim Medinipur' : 'Kolkata Region';
    defaultArea = firstTwo === '72' ? 'Midnapore / Paschim Medinipur Zone' : 'West Bengal Zone';
    recLang = 'bn';
    langNative = 'বাংলা (Bengali)';
  } else if (['40', '41', '42', '43', '44'].includes(firstTwo)) {
    state = 'Maharashtra';
    district = 'Maharashtra Region';
    defaultArea = 'Maharashtra Zone';
    recLang = 'mr';
    langNative = 'मराठी (Marathi)';
  } else if (['60', '61', '62', '63', '64'].includes(firstTwo)) {
    state = 'Tamil Nadu';
    district = 'Tamil Nadu Region';
    defaultArea = 'Tamil Nadu Zone';
    recLang = 'ta';
    langNative = 'தமிழ் (Tamil)';
  } else if (['56', '57', '58', '59'].includes(firstTwo)) {
    state = 'Karnataka';
    district = 'Karnataka Region';
    defaultArea = 'Karnataka Zone';
    recLang = 'kn';
    langNative = 'ಕನ್ನಡ (Kannada)';
  } else if (['50', '51', '52', '53'].includes(firstTwo)) {
    state = 'Andhra Pradesh & Telangana';
    district = 'Telangana/AP Region';
    defaultArea = 'Telangana/AP Zone';
    recLang = 'te';
    langNative = 'తెలుగు (Telugu)';
  } else if (['36', '37', '38', '39'].includes(firstTwo)) {
    state = 'Gujarat';
    district = 'Gujarat Region';
    defaultArea = 'Gujarat Zone';
    recLang = 'gu';
    langNative = 'ગુજરાતી (Gujarati)';
  } else if (['14', '15'].includes(firstTwo)) {
    state = 'Punjab';
    district = 'Punjab Region';
    defaultArea = 'Punjab Zone';
    recLang = 'pa';
    langNative = 'ਪੰਜਾਬੀ (Punjabi)';
  } else if (['67', '68', '69'].includes(firstTwo)) {
    state = 'Kerala';
    district = 'Kerala Region';
    defaultArea = 'Kerala Zone';
    recLang = 'ml';
    langNative = 'മലയാളം (Malayalam)';
  } else if (['75', '76', '77'].includes(firstTwo)) {
    state = 'Odisha';
    district = 'Odisha Region';
    defaultArea = 'Odisha Zone';
    recLang = 'or';
    langNative = 'ଓଡ଼ିଆ (Odia)';
  } else if (firstTwo === '78') {
    state = 'Assam';
    district = 'Assam Region';
    defaultArea = 'Assam Zone';
    recLang = 'as';
    langNative = 'অসমীয়া (Assamese)';
  } else if (cleanPin.startsWith('403')) {
    state = 'Goa';
    district = 'Goa Region';
    defaultArea = 'Goa Zone';
    recLang = 'kok';
    langNative = 'कोंकणी (Konkani)';
  } else if (['18', '19'].includes(firstTwo)) {
    state = 'Jammu & Kashmir';
    district = 'J&K Region';
    defaultArea = 'J&K Zone';
    recLang = 'ur';
    langNative = 'اردو (Urdu) / कॉशुर';
  }

  return {
    pinCode: cleanPin,
    area: defaultArea,
    district,
    state,
    recommendedLanguage: recLang,
    languageNativeName: langNative,
  };
}
