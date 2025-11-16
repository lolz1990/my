class AnalogWatch {
  constructor() {
    this.hourHand = document.getElementById('hour-hand');
    this.minuteHand = document.getElementById('minute-hand');
    this.secondHand = document.getElementById('second-hand');
    this.digitalTime = document.getElementById('digital-time');
    this.temperatureDisplay = document.getElementById('temperature');
    
    this.init();
  }

  init() {
    this.updateClock();
    this.fetchTemperature();
    
    setInterval(() => this.updateClock(), 1000);
    setInterval(() => this.fetchTemperature(), 600000);
  }

  updateClock() {
    const now = new Date();
    
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    
    const secondsDegrees = (seconds + milliseconds / 1000) * 6;
    const minutesDegrees = (minutes + seconds / 60) * 6;
    const hoursDegrees = (hours % 12 + minutes / 60) * 30;
    
    this.secondHand.style.transform = `rotate(${secondsDegrees}deg)`;
    this.minuteHand.style.transform = `rotate(${minutesDegrees}deg)`;
    this.hourHand.style.transform = `rotate(${hoursDegrees}deg)`;
    
    const timeString = this.formatTime(hours, minutes, seconds);
    this.digitalTime.textContent = timeString;
  }

  formatTime(hours, minutes, seconds) {
    return `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`;
  }

  padZero(num) {
    return num.toString().padStart(2, '0');
  }

  fetchTemperature() {
    this.getLocationAndFetchWeather();
  }

  getLocationAndFetchWeather() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.getWeatherData(latitude, longitude);
        },
        (error) => {
          this.setDefaultTemperature();
        }
      );
    } else {
      this.setDefaultTemperature();
    }
  }

  getWeatherData(latitude, longitude) {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=celsius`;
    
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data.current && data.current.temperature_2m !== undefined) {
          const temperature = Math.round(data.current.temperature_2m);
          this.updateTemperatureDisplay(temperature, 'C');
        } else {
          this.setDefaultTemperature();
        }
      })
      .catch(() => {
        this.setDefaultTemperature();
      });
  }

  updateTemperatureDisplay(temp, unit) {
    this.temperatureDisplay.textContent = `${temp}°${unit}`;
  }

  setDefaultTemperature() {
    this.temperatureDisplay.textContent = '--°C';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AnalogWatch();
});
