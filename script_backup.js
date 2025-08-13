document.addEventListener('DOMContentLoaded', () => {
    // UI elements
    const initialMessage = document.getElementById('initial-message');
    const alarmClock = document.getElementById('alarm-clock');
    const stopwatch = document.getElementById('stopwatch');
    const timer = document.getElementById('timer');
    const weatherDisplay = document.getElementById('weather-display');

    // Alarm Clock elements
    const alarmTimeInput = document.getElementById('alarm-time');
    const setAlarmBtn = document.getElementById('set-alarm-btn');
    const alarmStatus = document.getElementById('alarm-status');
    let alarmTimeout;

    // Stopwatch elements
    const stopwatchDisplay = document.getElementById('stopwatch-display');
    const startStopwatchBtn = document.getElementById('start-stopwatch-btn');
    const resetStopwatchBtn = document.getElementById('reset-stopwatch-btn');
    let stopwatchInterval;
    let stopwatchTime = 0;
    let isStopwatchRunning = false;

    // Timer elements
    const timerDisplay = document.getElementById('timer-display');
    const timerMinutesInput = document.getElementById('timer-minutes');
    const startTimerBtn = document.getElementById('start-timer-btn');
    const resetTimerBtn = document.getElementById('reset-timer-btn');
    let timerInterval;
    let timerDuration;
    let isTimerRunning = false;

    // Weather API
    const WEATHER_API_KEY = "20540bfb70f5c03fec99ad5d4a37783b";
    const weatherContent = document.getElementById('weather-content');

    // --- Orientation Logic ---
    let lastOrientation = null;
    let orientTimer = null;
    const ORIENT_DEBOUNCE = 200;

    function getOrientationFallback(event) {
        if (event && typeof event.beta === 'number' && typeof event.gamma === 'number') {
            const beta = event.beta;
            const gamma = event.gamma;
            if (Math.abs(gamma) < 30 && beta > 45 && beta < 135) return 'portrait-upright';
            if (Math.abs(gamma) < 30 && beta < -45 && beta > -135) return 'portrait-upsidedown';
            if (Math.abs(beta) < 30 && gamma > 45) return 'landscape-right';
            if (Math.abs(beta) < 30 && gamma < -45) return 'landscape-left';
            return 'unknown';
        }
        const angle = window.orientation;
        if (angle === 0) return 'portrait-upright';
        if (angle === 180) return 'portrait-upsidedown';
        if (angle === 90) return 'landscape-right';
        if (angle === -90) return 'landscape-left';
        return 'unknown';
    }

    function detectOrientation(event) {
        const orientation = getOrientationFallback(event);
        if (orientation !== 'unknown' && orientation !== lastOrientation) {
            lastOrientation = orientation;
            updateUI(orientation);
        }
    }

    function attachOrientationListeners() {
        if (screen.orientation && typeof screen.orientation.addEventListener === 'function') {
            screen.orientation.addEventListener('change', () => {
                clearTimeout(orientTimer);
                orientTimer = setTimeout(() => detectOrientation(), ORIENT_DEBOUNCE);
            });
        }
        window.addEventListener('orientationchange', () => {
            clearTimeout(orientTimer);
            orientTimer = setTimeout(() => detectOrientation(), ORIENT_DEBOUNCE);
        });
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (event) => {
                clearTimeout(orientTimer);
                orientTimer = setTimeout(() => detectOrientation(event), ORIENT_DEBOUNCE);
            }, true);
        }
        detectOrientation();
    }

    attachOrientationListeners();

    function hideAllFeatures() {
        initialMessage.style.display = 'none';
        alarmClock.style.display = 'none';
        stopwatch.style.display = 'none';
        timer.style.display = 'none';
        weatherDisplay.style.display = 'none';
    }

    function updateUI(orientation) {
        hideAllFeatures();
        switch (orientation) {
            case 'portrait-upright':
                alarmClock.style.display = 'flex';
                stopStopwatch();
                stopTimer();
                break;
            case 'landscape-right':
                stopwatch.style.display = 'flex';
                stopTimer();
                clearTimeout(alarmTimeout);
                break;
            case 'portrait-upsidedown':
                timer.style.display = 'flex';
                stopStopwatch();
                clearTimeout(alarmTimeout);
                break;
            case 'landscape-left':
                weatherDisplay.style.display = 'flex';
                fetchWeather();
                stopStopwatch();
                stopTimer();
                clearTimeout(alarmTimeout);
                break;
            default:
                initialMessage.style.display = 'flex';
                break;
        }
    }

    // Alarm Clock
    setAlarmBtn.addEventListener('click', () => {
        const [hours, minutes] = alarmTimeInput.value.split(':').map(Number);
        const now = new Date();
        const alarm = new Date();
        alarm.setHours(hours, minutes, 0);
        if (alarm.getTime() < now.getTime()) {
            alarm.setDate(alarm.getDate() + 1);
        }
        const timeToAlarm = alarm.getTime() - now.getTime();
        alarmStatus.textContent = `Alarm set for ${alarmTimeInput.value}.`;
        if (alarmTimeout) clearTimeout(alarmTimeout);
        alarmTimeout = setTimeout(() => {
            alert('ALARM!');
            alarmStatus.textContent = 'Alarm triggered.';
        }, timeToAlarm);
    });

    // Stopwatch
    function updateStopwatch() {
        stopwatchTime++;
        const h = String(Math.floor(stopwatchTime / 3600)).padStart(2, '0');
        const m = String(Math.floor((stopwatchTime % 3600) / 60)).padStart(2, '0');
        const s = String(stopwatchTime % 60).padStart(2, '0');
        stopwatchDisplay.textContent = `${h}:${m}:${s}`;
    }
    function startStopwatch() {
        if (!isStopwatchRunning) {
            stopwatchInterval = setInterval(updateStopwatch, 1000);
            isStopwatchRunning = true;
            startStopwatchBtn.textContent = 'Stop';
        }
    }
    function stopStopwatch() {
        if (isStopwatchRunning) {
            clearInterval(stopwatchInterval);
            isStopwatchRunning = false;
            startStopwatchBtn.textContent = 'Start';
        }
    }
    function resetStopwatch() {
        stopStopwatch();
        stopwatchTime = 0;
        stopwatchDisplay.textContent = '00:00:00';
    }
    startStopwatchBtn.addEventListener('click', () => {
        if (isStopwatchRunning) {
            stopStopwatch();
        } else {
            startStopwatch();
        }
    });
    resetStopwatchBtn.addEventListener('click', resetStopwatch);

    // Timer
    function updateTimer() {
        const minutes = Math.floor(timerDuration / 60);
        const seconds = timerDuration % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        if (timerDuration <= 0) {
            alert('TIMER DONE!');
            stopTimer();
            timerDisplay.textContent = '00:00';
            return;
        }
        timerDuration--;
    }
    function startTimer() {
        if (!isTimerRunning) {
            timerDuration = parseInt(timerMinutesInput.value, 10) * 60;
            updateTimer();
            timerInterval = setInterval(updateTimer, 1000);
            isTimerRunning = true;
            startTimerBtn.textContent = 'Pause';
        } else {
            stopTimer();
        }
    }
    function stopTimer() {
        clearInterval(timerInterval);
        isTimerRunning = false;
        startTimerBtn.textContent = 'Start';
    }
    function resetTimer() {
        stopTimer();
        timerMinutesInput.value = 5;
        timerDisplay.textContent = '05:00';
    }
    startTimerBtn.addEventListener('click', startTimer);
    resetTimerBtn.addEventListener('click', resetTimer);

    // Weather Display
    function fetchWeather() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        const city = data.name;
                        const temp = data.main.temp;
                        const description = data.weather[0].description;
                        const icon = data.weather[0].icon;
                        weatherContent.innerHTML = `
                            <h3>${city}</h3>
                            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Weather icon">
                            <p>${description}</p>
                            <p>${temp}°C</p>
                        `;
                    })
                    .catch(error => {
                        console.error("Error fetching weather data:", error);
                        weatherContent.innerHTML = "<p>Could not fetch weather.</p>";
                    });
            });
        } else {
            weatherContent.innerHTML = "<p>Geolocation not supported.</p>";
        }
    }
});
