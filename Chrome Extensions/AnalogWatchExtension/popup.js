const POPUP_DIMENSIONS = {
  width: 400,
  height: 600
};

// --- CONFIG & DATA ---
const BENGALI_MONTHS = [
  "বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ", "ভাদ্র", "আশ্বিন",
  "কার্তিক", "অগ্রহায়ণ", "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র"
];

const BENGALI_DAYS = [
  "রবিবার", "সোমবার", "মঙ্গলবার", " বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"
];

const SPECIAL_EVENTS = {
  "2-21": "শহীদ দিবস (International Mother Language Day)",
  "3-17": "শেখ মুজিবুর রহমানের জন্মদিন",
  "3-26": "স্বাধীনতা দিবস (Independence Day)",
  "4-14": "পহেলা বৈশাখ (Bengali New Year)",
  "5-1": "মে দিবস (May Day)",
  "8-15": "জাতীয় শোক দিবস",
  "12-16": "বিজয় দিবস (Victory Day)",
  "12-25": "বড়দিন (Christmas Day)"
};

// --- HELPER FUNCTIONS ---
function toBengaliDigit(num) {
  const map = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return num.toString().split('').map(char => map[char] || char).join('');
}

function isLeapYear(year) {
  return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
}

// Simplified Bengali Date Converter
// Based on the traditional system where Boishakh 1 is usually April 14
function getBengaliDate(date) {
  const gYear = date.getFullYear();
  const gMonth = date.getMonth(); // 0-11
  const gDay = date.getDate();
  const dayOfWeek = date.getDay(); // 0 (Sun) - 6 (Sat)

  // Day of year
  const start = new Date(gYear, 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  let bYear = (gMonth < 3 || (gMonth === 3 && gDay < 14)) ? gYear - 594 : gYear - 593;
  
  // Approximate start dates of Bengali months (Gregorian Day of Year)
  // Boishakh starts ~ Apr 14 (Day 104 in non-leap, 105 in leap)
  const isLeap = isLeapYear(gYear);
  const offset = isLeap ? 1 : 0;
  
  // Month lengths and start days (approximate)
  // Starts: Apr 14, May 15, Jun 15, Jul 16, Aug 16, Sep 16, Oct 16, Nov 15, Dec 15, Jan 14, Feb 13, Mar 15
  const monthStarts = [
    104 + offset, // Boishakh (Apr 14)
    135 + offset, // Jyoishtho (May 15)
    166 + offset, // Asharh (Jun 15)
    197 + offset, // Srabon (Jul 16)
    228 + offset, // Bhadro (Aug 16)
    259 + offset, // Ashwin (Sep 16)
    289 + offset, // Kartik (Oct 16)
    319 + offset, // Agrahayan (Nov 15)
    349 + offset, // Poush (Dec 15)
    14,           // Magh (Jan 14) - Handle next year logic carefully
    44,           // Falgun (Feb 13)
    73 + offset   // Chaitra (Mar 15)
  ];
  
  // Logic to find month index and day
  let bMonthIndex = -1;
  let bDay = 0;

  // We need to handle the wrap-around for Jan-Apr 13
  // If dayOfYear < Boishakh Start, it is the previous Bengali year's end (Poush, Magh, Falgun, Chaitra)
  
  // Normalized calculation is complex, let's use a day-count approach relative to Apr 14
  
  // Let's rely on a simpler array lookup relative to Gregorian Date
  // This is a "good enough" approximation for a UI widget
  
  // Maps Gregorian Month -> [Bengali Month Index (Start), Day offset]
  // Note: This logic assumes standard 14th/15th transitions.
  
  // Refined Logic:
  // 1. Calculate days passed since April 14 (Boishakh 1)
  let daysSinceBoishakh1;
  const boishakh1 = new Date(gYear, 3, 14); // April 14
  
  if (date < boishakh1) {
    // Before New Year, so we count from Previous Year's April 14
    const prevBoishakh1 = new Date(gYear - 1, 3, 14);
    daysSinceBoishakh1 = Math.floor((date - prevBoishakh1) / oneDay);
  } else {
    daysSinceBoishakh1 = Math.floor((date - boishakh1) / oneDay);
  }
  
  // Days in Bengali months (Standard West Bengal/Bangladesh mix - treating as fixed for widget)
  // 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29/30, 30
  const bMonthDays = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29, 30];
  if (isLeapYear(bYear + 593)) { // Check leap year for Falgun (Index 10)
    bMonthDays[10] = 30;
  }
  
  let daysRemaining = daysSinceBoishakh1;
  for (let i = 0; i < 12; i++) {
    if (daysRemaining < bMonthDays[i]) {
      bMonthIndex = i;
      bDay = daysRemaining + 1;
      break;
    }
    daysRemaining -= bMonthDays[i];
  }
  
  return {
    year: bYear,
    monthName: BENGALI_MONTHS[bMonthIndex],
    day: bDay,
    dayName: BENGALI_DAYS[dayOfWeek]
  };
}

// Simple Moon Phase Calculation (Conway's Algorithm approx)
function getMoonPhase(year, month, day) {
  let r = year % 100;
  r %= 19;
  if (r > 9) { r -= 19; }
  r = ((r * 11) % 30) + parseInt(month) + day;
  if (month < 3) { r += 2; }
  r -= ((year < 2000) ? 4 : 8.3);
  r = Math.floor(r + 0.5) % 30;
  return (r < 0) ? r + 30 : r;
}

function getPanjikaInfo(date) {
  // Age of moon: 0=New, 15=Full, 29=New
  const age = getMoonPhase(date.getFullYear(), date.getMonth() + 1, date.getDate());
  
  let text = "";
  if (age <= 1 || age >= 29) text = "অমাবস্যা (Amavasya)";
  else if (age >= 14 && age <= 16) text = "পূর্ণিমা (Purnima)";
  else if (age < 15) text = "শুক্লপক্ষ (Shukla Paksha)";
  else text = "কৃষ্ণপক্ষ (Krishna Paksha)";
  
  return text;
}

// --- MAIN CLASS ---

class AnalogWatch {
  constructor() {
    this.hourHand = document.getElementById('hour-hand');
    this.minuteHand = document.getElementById('minute-hand');
    this.secondHand = document.getElementById('second-hand');
    
    this.digitHour = document.getElementById('digit-hour');
    this.digitMinute = document.getElementById('digit-minute');
    this.digitSecond = document.getElementById('digit-second');
    this.digitAmPm = document.getElementById('digit-ampm');
    
    this.formatToggle = document.getElementById('format-toggle');
    
    this.weatherTemp = document.getElementById('weather-temp');
    this.weatherDesc = document.getElementById('weather-desc');
    this.weatherAnim = document.getElementById('weather-anim');
    
    this.englishDateEl = document.getElementById('english-date');
    this.specialEventEl = document.getElementById('special-event');
    this.bengaliDateEl = document.getElementById('bengali-date');
    this.panjikaInfoEl = document.getElementById('panjika-info');

    this.is24Hour = false;
    
    this.init();
  }

  init() {
    this.setupDimensions();
    this.setupListeners();
    this.updateClock();
    this.updateDate();
    this.fetchWeather();
    
    setInterval(() => this.updateClock(), 1000);
    setInterval(() => this.fetchWeather(), 600000); // 10 mins
    
    // Check Date change every minute
    setInterval(() => this.updateDate(), 60000);
  }
  
  setupDimensions() {
     const widthValue = `${POPUP_DIMENSIONS.width}px`;
     const heightValue = `${POPUP_DIMENSIONS.height}px`;
     const root = document.documentElement;
     const body = document.body;
     
     root.style.setProperty('--popup-width', widthValue);
     root.style.setProperty('--popup-height', heightValue);
  }
  
  setupListeners() {
    this.formatToggle.addEventListener('click', () => {
      this.is24Hour = !this.is24Hour;
      this.formatToggle.textContent = this.is24Hour ? "24H" : "12H";
      this.updateClock(); // Immediate update
    });
  }

  updateClock() {
    const now = new Date();
    
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    
    // Analog Math
    const secondsDegrees = (seconds + milliseconds / 1000) * 6;
    const minutesDegrees = (minutes + seconds / 60) * 6;
    const hoursDegrees = (hours % 12 + minutes / 60) * 30;
    
    this.secondHand.style.transform = `rotate(${secondsDegrees}deg)`;
    this.minuteHand.style.transform = `rotate(${minutesDegrees}deg)`;
    this.hourHand.style.transform = `rotate(${hoursDegrees}deg)`;
    
    // Digital Math
    let displayHour = hours;
    let ampm = "";
    
    if (!this.is24Hour) {
      ampm = displayHour >= 12 ? "PM" : "AM";
      displayHour = displayHour % 12;
      displayHour = displayHour ? displayHour : 12; // the hour '0' should be '12'
    }
    
    this.digitHour.textContent = this.padZero(displayHour);
    this.digitMinute.textContent = this.padZero(minutes);
    this.digitSecond.textContent = this.padZero(seconds);
    this.digitAmPm.textContent = ampm;
  }

  padZero(num) {
    return num.toString().padStart(2, '0');
  }
  
  updateDate() {
    const now = new Date();
    
    // English Date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    this.englishDateEl.textContent = now.toLocaleDateString('en-US', options);
    
    // Special Event
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const key = `${month}-${day}`;
    if (SPECIAL_EVENTS[key]) {
      this.specialEventEl.textContent = "★ " + SPECIAL_EVENTS[key];
    } else {
      this.specialEventEl.textContent = "";
    }
    
    // Bengali Date
    const bDate = getBengaliDate(now);
    const bDateString = `${bDate.dayName}, ${toBengaliDigit(bDate.day)} ${bDate.monthName} ${toBengaliDigit(bDate.year)}`;
    this.bengaliDateEl.textContent = bDateString;
    
    // Panjika
    this.panjikaInfoEl.textContent = getPanjikaInfo(now);
  }

  fetchWeather() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => this.getWeatherData(pos.coords.latitude, pos.coords.longitude),
        () => this.setDefaultWeather()
      );
    } else {
      this.setDefaultWeather();
    }
  }

  getWeatherData(lat, lon) {
    // Open-Meteo API
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&temperature_unit=celsius&timezone=auto`;
    
    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Weather HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        let temp = null;
        let code = 0;
        let isDay = 1;

        if (data.current && typeof data.current.temperature_2m === 'number') {
          temp = Math.round(data.current.temperature_2m);
          code = data.current.weather_code;
          isDay = data.current.is_day;
        } else if (data.current_weather && typeof data.current_weather.temperature === 'number') {
          temp = Math.round(data.current_weather.temperature);
          code = data.current_weather.weathercode;
          isDay = data.current_weather.is_day != null ? data.current_weather.is_day : 1;
        }

        if (typeof temp === 'number' && !Number.isNaN(temp)) {
          this.weatherTemp.textContent = `${temp}°C`;
          this.updateWeatherIcon(code, isDay);
        } else {
          this.setDefaultWeather();
        }
      })
      .catch(e => {
        console.error(e);
        this.setDefaultWeather();
      });
  }
  
  updateWeatherIcon(code, isDay) {
    // WMO Weather interpretation codes (http://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM)
    // 0: Clear sky
    // 1, 2, 3: Mainly clear, partly cloudy, and overcast
    // 45, 48: Fog
    // 51, 53, 55: Drizzle
    // 61, 63, 65: Rain
    // 80, 81, 82: Rain showers
    // 95, 96, 99: Thunderstorm
    
    const wmoCode = Number(code);
    const isDaytime = isDay === 1 || isDay === true || isDay === "1";
    
    let desc = "Clear";
    let animClass = "anim-sun"; // Default
    
    this.weatherAnim.innerHTML = ""; // Clear existing
    const iconDiv = document.createElement('div');
    iconDiv.classList.add('weather-symbol');

    if (wmoCode === 0 || wmoCode === 1) {
      desc = isDaytime ? "Sunny" : "Clear Night";
      animClass = isDaytime ? "anim-sun" : "anim-sun"; // Could add moon if time permitted
    } else if (wmoCode === 2 || wmoCode === 3 || wmoCode === 45 || wmoCode === 48) {
      desc = "Cloudy";
      animClass = "anim-cloud";
    } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(wmoCode)) {
      desc = "Rainy";
      animClass = "anim-rain";
    } else if (wmoCode >= 95) {
      desc = "Stormy";
      animClass = "anim-rain"; // Reuse rain for now
    }
    
    this.weatherDesc.textContent = desc;
    iconDiv.classList.add(animClass);
    this.weatherAnim.appendChild(iconDiv);
  }

  setDefaultWeather() {
    this.weatherTemp.textContent = "--°C";
    this.weatherDesc.textContent = "Unavailable";
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AnalogWatch();
});
