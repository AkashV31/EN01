import { create } from 'zustand'

export type Lang = 'en' | 'mr' | 'hi'

interface LangState {
  lang: Lang
  setLang: (l: Lang) => void
}

export const useLang = create<LangState>((set) => ({
  lang: 'en',
  setLang: (lang) => set({ lang }),
}))

type TranslationKey =
  | 'login_title' | 'login_subtitle' | 'select_role'
  | 'student' | 'farmer' | 'ngo'
  | 'name' | 'email' | 'password' | 'institution' | 'farm_location'
  | 'org_name' | 'reg_number' | 'sign_in' | 'welcome_back'
  | 'nav_vision' | 'nav_steps' | 'nav_analysis' | 'nav_dashboard'
  | 'hero_quote' | 'hero_sub'
  | 'vision_title' | 'vision_body'
  | 'steps_title' | 'analysis_title'
  | 'step1' | 'step2' | 'step3' | 'step4'
  | 'dashboard_title' | 'select_state' | 'select_city'
  | 'select_species' | 'select_goal' | 'budget_label'
  | 'run_optimizer' | 'generate_esg' | 'back'
  | 'optimize_title' | 'esg_title' | 'search_nearby'
  | 'private_land_warning' | 'trees_planted' | 'carbon_offset'
  | 'temp_reduction' | 'language'

type Translations = Record<TranslationKey, string>

const dict: Record<Lang, Translations> = {
  en: {
    login_title: 'CanopyROI',
    login_subtitle: 'Urban Tree Equity Auditor',
    select_role: 'Who are you?',
    student: 'Student / Researcher',
    farmer: 'Farmer',
    ngo: 'NGO Official',
    name: 'Full Name',
    email: 'Email Address',
    password: 'Password',
    institution: 'Institution / University',
    farm_location: 'Farm Location',
    org_name: 'Organisation Name',
    reg_number: 'Registration Number',
    sign_in: 'Sign In',
    welcome_back: 'Welcome back',
    nav_vision: 'Our Vision',
    nav_steps: 'How It Works',
    nav_analysis: 'Global Analysis',
    nav_dashboard: 'Dashboard',
    hero_quote: 'A city without trees is not a city — it is a concrete apology.',
    hero_sub: 'We use satellites to find where green is needed most.',
    vision_title: 'Our Vision',
    vision_body: 'CanopyROI maps urban heat, vegetation loss, and socioeconomic vulnerability — then shows exactly where planting one tree delivers the most impact.',
    steps_title: 'How It Works',
    analysis_title: 'City Heat Analysis',
    step1: 'Satellite Scan',
    step2: 'AI Analysis',
    step3: 'Zone Selection',
    step4: 'ESG Receipt',
    dashboard_title: 'CanopyROI Dashboard',
    select_state: 'State',
    select_city: 'City',
    select_species: 'Tree Species',
    select_goal: 'Goal',
    budget_label: 'Budget',
    run_optimizer: 'Run Optimizer',
    generate_esg: 'Download ESG Report',
    back: 'Back',
    optimize_title: 'Optimal Planting Zones',
    esg_title: 'ESG Impact Report',
    search_nearby: 'Find Alternatives',
    private_land_warning: 'Private Land Alert',
    trees_planted: 'Trees Planted',
    carbon_offset: 'CO₂ Offset (10yr)',
    temp_reduction: 'Temp. Reduction',
    language: 'Language',
  },
  mr: {
    login_title: 'CanopyROI',
    login_subtitle: 'शहरी वृक्ष न्याय लेखापरीक्षक',
    select_role: 'तुम्ही कोण आहात?',
    student: 'विद्यार्थी / संशोधक',
    farmer: 'शेतकरी',
    ngo: 'स्वयंसेवी संस्था अधिकारी',
    name: 'पूर्ण नाव',
    email: 'ईमेल पत्ता',
    password: 'पासवर्ड',
    institution: 'संस्था / विद्यापीठ',
    farm_location: 'शेताचे ठिकाण',
    org_name: 'संस्थेचे नाव',
    reg_number: 'नोंदणी क्रमांक',
    sign_in: 'प्रवेश करा',
    welcome_back: 'पुन्हा स्वागत',
    nav_vision: 'आमची दृष्टी',
    nav_steps: 'हे कसे कार्य करते',
    nav_analysis: 'जागतिक विश्लेषण',
    nav_dashboard: 'डॅशबोर्ड',
    hero_quote: 'झाडांशिवाय शहर म्हणजे काँक्रीटची माफी आहे.',
    hero_sub: 'आम्ही उपग्रहांचा वापर करून हिरवाईची सर्वाधिक गरज कुठे आहे ते शोधतो.',
    vision_title: 'आमची दृष्टी',
    vision_body: 'CanopyROI शहरी उष्णता, वनस्पती नाश आणि सामाजिक-आर्थिक असुरक्षितता यांचे मॅपिंग करते.',
    steps_title: 'हे कसे कार्य करते',
    analysis_title: 'शहर उष्णता विश्लेषण',
    step1: 'उपग्रह स्कॅन',
    step2: 'AI विश्लेषण',
    step3: 'क्षेत्र निवड',
    step4: 'ESG पावती',
    dashboard_title: 'CanopyROI डॅशबोर्ड',
    select_state: 'राज्य',
    select_city: 'शहर',
    select_species: 'वृक्ष प्रजाती',
    select_goal: 'उद्दिष्ट',
    budget_label: 'बजेट',
    run_optimizer: 'ऑप्टिमायझर चालवा',
    generate_esg: 'ESG अहवाल डाउनलोड करा',
    back: 'मागे',
    optimize_title: 'इष्टतम लागवड क्षेत्रे',
    esg_title: 'ESG प्रभाव अहवाल',
    search_nearby: 'पर्याय शोधा',
    private_land_warning: 'खाजगी जमीन सूचना',
    trees_planted: 'लागवड केलेली झाडे',
    carbon_offset: 'CO₂ ऑफसेट (10 वर्षे)',
    temp_reduction: 'तापमान घट',
    language: 'भाषा',
  },
  hi: {
    login_title: 'CanopyROI',
    login_subtitle: 'शहरी वृक्ष समता लेखापरीक्षक',
    select_role: 'आप कौन हैं?',
    student: 'छात्र / शोधकर्ता',
    farmer: 'किसान',
    ngo: 'एनजीओ अधिकारी',
    name: 'पूरा नाम',
    email: 'ईमेल पता',
    password: 'पासवर्ड',
    institution: 'संस्था / विश्वविद्यालय',
    farm_location: 'खेत का स्थान',
    org_name: 'संगठन का नाम',
    reg_number: 'पंजीकरण संख्या',
    sign_in: 'साइन इन करें',
    welcome_back: 'वापसी पर स्वागत',
    nav_vision: 'हमारी दृष्टि',
    nav_steps: 'यह कैसे काम करता है',
    nav_analysis: 'वैश्विक विश्लेषण',
    nav_dashboard: 'डैशबोर्ड',
    hero_quote: 'पेड़ों के बिना शहर, शहर नहीं — कंक्रीट की माफ़ी है।',
    hero_sub: 'हम उपग्रहों का उपयोग करके देखते हैं कहाँ हरियाली की सबसे ज़्यादा ज़रूरत है।',
    vision_title: 'हमारी दृष्टि',
    vision_body: 'CanopyROI शहरी गर्मी, वनस्पति नाश और सामाजिक-आर्थिक असुरक्षा की मैपिंग करता है।',
    steps_title: 'यह कैसे काम करता है',
    analysis_title: 'शहर ताप विश्लेषण',
    step1: 'उपग्रह स्कैन',
    step2: 'AI विश्लेषण',
    step3: 'क्षेत्र चयन',
    step4: 'ESG रसीद',
    dashboard_title: 'CanopyROI डैशबोर्ड',
    select_state: 'राज्य',
    select_city: 'शहर',
    select_species: 'वृक्ष प्रजाति',
    select_goal: 'लक्ष्य',
    budget_label: 'बजट',
    run_optimizer: 'ऑप्टिमाइज़र चलाएं',
    generate_esg: 'ESG रिपोर्ट डाउनलोड करें',
    back: 'वापस',
    optimize_title: 'इष्टतम रोपण क्षेत्र',
    esg_title: 'ESG प्रभाव रिपोर्ट',
    search_nearby: 'विकल्प खोजें',
    private_land_warning: 'निजी भूमि चेतावनी',
    trees_planted: 'लगाए गए पेड़',
    carbon_offset: 'CO₂ ऑफसेट (10 वर्ष)',
    temp_reduction: 'तापमान में कमी',
    language: 'भाषा',
  },
}

export function t(key: TranslationKey, lang: Lang): string {
  return dict[lang][key] ?? dict['en'][key] ?? key
}
