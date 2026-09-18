import { createContext, useContext, useState, ReactNode } from 'react';

type Lang = 'en' | 'hi';

const strings = {
  en: {
    appName: 'KisanProcure',
    tagline: 'Smart procurement. Less waiting.',
    home: 'Home',
    centers: 'Centers',
    bookings: 'Bookings',
    profile: 'Profile',
    goodMorning: 'Good morning',
    yourToken: 'Your active token',
    farmersAhead: 'farmers ahead',
    estWait: 'Estimated wait',
    trackQueue: 'Track Queue',
    todayAppt: "Today's appointment",
    confirmed: 'Confirmed',
    viewDetails: 'View Details',
    bookSlot: 'Book Slot',
    myToken: 'My Token',
    history: 'History',
    procurementStatus: 'Procurement status',
    findCenter: 'Find a center',
    search: 'Search procurement centers',
    viewCenter: 'View Center',
    bookASlot: 'Book a Slot',
    selectCrop: 'Select Crop',
    enterQty: 'Enter quantity',
    selectDate: 'Select date',
    selectTime: 'Select time slot',
    confirmSlot: 'Confirm Slot',
    slotConfirmed: 'Slot Confirmed',
    trackMyQueue: 'Track My Queue',
    addToCalendar: 'Add to Calendar',
    language: 'Language',
  },
  hi: {
    appName: 'किसानप्रोक्योर',
    tagline: 'स्मार्ट खरीद। कम प्रतीक्षा।',
    home: 'होम',
    centers: 'केंद्र',
    bookings: 'बुकिंग',
    profile: 'प्रोफ़ाइल',
    goodMorning: 'शुभ प्रभात',
    yourToken: 'आपका सक्रिय टोकन',
    farmersAhead: 'किसान आगे',
    estWait: 'अनुमानित प्रतीक्षा',
    trackQueue: 'कतार ट्रैक करें',
    todayAppt: 'आज की नियुक्ति',
    confirmed: 'पुष्टि हुई',
    viewDetails: 'विवरण देखें',
    bookSlot: 'स्लॉट बुक करें',
    myToken: 'मेरा टोकन',
    history: 'इतिहास',
    procurementStatus: 'खरीद स्थिति',
    findCenter: 'केंद्र खोजें',
    search: 'खरीद केंद्र खोजें',
    viewCenter: 'केंद्र देखें',
    bookASlot: 'स्लॉट बुक करें',
    selectCrop: 'फसल चुनें',
    enterQty: 'मात्रा दर्ज करें',
    selectDate: 'तारीख चुनें',
    selectTime: 'समय चुनें',
    confirmSlot: 'स्लॉट की पुष्टि करें',
    slotConfirmed: 'स्लॉट पुष्टि हुई',
    trackMyQueue: 'मेरी कतार ट्रैक करें',
    addToCalendar: 'कैलेंडर में जोड़ें',
    language: 'भाषा',
  },
};

type Strings = typeof strings.en;

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Strings;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: strings.en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  return (
    <LanguageContext.Provider value={{ lang, setLang, t: strings[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
