document.addEventListener('DOMContentLoaded', () => {
    const initialMessage = document.getElementById('initial-message');
    const alarmClock = document.getElementById('alarm-clock');
    const stopwatch = document.getElementById('stopwatch');
    const timer = document.getElementById('timer');
    const weatherDisplay = document.getElementById('weather-display');
    const orientationDebug = document.getElementById('orientation-debug');

    const alarmTimeInput = document.getElementById('alarm-time');
    const setAlarmBtn = document.getElementById('set-alarm-btn');
    const alarmStatus = document.getElementById('alarm-status');
    let alarmTimeout;

    const stopwatchDisplay = document.getElementById('stopwatch-display');
    const startStopwatchBtn = document.getElementById('start-stopwatch-btn');
    const resetStopwatchBtn = document.getElementById('reset-stopwatch-btn');
    let stopwatchDisplayInterval;
    let stopwatchStartTime = 0;
    let stopwatchElapsedTime = 0;
    let isStopwatchRunning = false;

    const timerDisplay = document.getElementById('timer-display');
    const timerMinutesInput = document.getElementById('timer-minutes');
    const startTimerBtn = document.getElementById('start-timer-btn');
    const resetTimerBtn = document.getElementById('reset-timer-btn');
    let timerDisplayInterval;
    let timerEndTime = 0;
    let timerRemainingDuration = 0;
    let isTimerRunning = false;

    const WEATHER_API_KEY = "20540bfb70f5c03fec99ad5d4a37783b";
    const weatherContent = document.getElementById('weather-content');

    let lastOrientation = null;

    function hideAllFeatures() {
        document.querySelectorAll('.feature-section').forEach(section => {
            section.classList.remove('active');
        });
    }

    function updateUI(orientation) {
        hideAllFeatures();

        if (stopwatchDisplayInterval) clearInterval(stopwatchDisplayInterval);
        if (timerDisplayInterval) clearInterval(timerDisplayInterval);
        if (alarmTimeout) clearTimeout(alarmTimeout);

        switch (orientation) {
            case 'portrait-primary':
                alarmClock.classList.add('active');
                break;
            case 'landscape-primary':
                stopwatch.classList.add('active');
                if (isStopwatchRunning) {
                    stopwatchDisplayInterval = setInterval(updateStopwatchDisplay, 100);
                }
                updateStopwatchDisplay();
                break;
            case 'portrait-secondary':
                timer.classList.add('active');
                if (isTimerRunning) {
                    timerDisplayInterval = setInterval(updateTimerDisplay, 100);
                }
                updateTimerDisplay();
                break;
            case 'landscape-secondary':
                weatherDisplay.classList.add('active');
                fetchWeather();
                break;
            default:
                initialMessage.classList.add('active');
                break;
        }
    }

    function handleOrientationChange() {
        const type = screen.orientation.type;
        orientationDebug.textContent = `Orientation: ${type}`;
        if (type !== lastOrientation) {
            lastOrientation = type;
            updateUI(type);
        }
    }

    function attachOrientationListeners() {
        if (screen.orientation) {
            screen.orientation.addEventListener('change', handleOrientationChange);
            handleOrientationChange();
        } else {
            orientationDebug.textContent = "Screen Orientation API not supported.";
            initialMessage.classList.add('active');
            const p = initialMessage.querySelector('p');
            if(p) p.textContent = "Sorry, your browser does not support orientation changes.";
        }
    }

    setAlarmBtn.addEventListener('click', () => {
        if (!alarmTimeInput.value) {
            alarmStatus.textContent = 'Please set a time!';
            return;
        }
        const [hours, minutes] = alarmTimeInput.value.split(':').map(Number);
        const now = new Date();
        const alarm = new Date();
        alarm.setHours(hours, minutes, 0, 0);
        if (alarm.getTime() <= now.getTime()) {
            alarm.setDate(alarm.getDate() + 1);
        }
        const timeToAlarm = alarm.getTime() - now.getTime();
        alarmStatus.textContent = `Alarm set for ${alarmTimeInput.value}`;
        if (alarmTimeout) clearTimeout(alarmTimeout);
        alarmTimeout = setTimeout(() => {
            alert('🔔 ALARM! Time to wake up!');
            alarmStatus.textContent = 'Alarm triggered!';
        }, timeToAlarm);
    });

    function formatStopwatchTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const s = String(totalSeconds % 60).padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    function updateStopwatchDisplay() {
        const elapsed = isStopwatchRunning ? (Date.now() - stopwatchStartTime) : stopwatchElapsedTime;
        stopwatchDisplay.textContent = formatStopwatchTime(elapsed);
    }

    startStopwatchBtn.addEventListener('click', () => {
        if (isStopwatchRunning) {
            isStopwatchRunning = false;
            stopwatchElapsedTime = Date.now() - stopwatchStartTime;
            clearInterval(stopwatchDisplayInterval);
            startStopwatchBtn.textContent = 'Start';
        } else {
            isStopwatchRunning = true;
            stopwatchStartTime = Date.now() - stopwatchElapsedTime;
            stopwatchDisplayInterval = setInterval(updateStopwatchDisplay, 100);
            startStopwatchBtn.textContent = 'Stop';
        }
    });

    resetStopwatchBtn.addEventListener('click', () => {
        isStopwatchRunning = false;
        stopwatchElapsedTime = 0;
        clearInterval(stopwatchDisplayInterval);
        updateStopwatchDisplay();
        startStopwatchBtn.textContent = 'Start';
    });

    function formatTimerTime(ms) {
        if (ms < 0) ms = 0;
        const totalSeconds = Math.floor(ms / 1000);
        const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const s = String(totalSeconds % 60).padStart(2, '0');
        return `${m}:${s}`;
    }

    function updateTimerDisplay() {
        const remaining = isTimerRunning ? (timerEndTime - Date.now()) : timerRemainingDuration;
        timerDisplay.textContent = formatTimerTime(remaining);
        if (isTimerRunning && remaining <= 0) {
            alert('⏰ TIMER FINISHED!');
            isTimerRunning = false;
            clearInterval(timerDisplayInterval);
            timerRemainingDuration = 0;
            updateTimerDisplay();
            startTimerBtn.textContent = 'Start';
        }
    }

    startTimerBtn.addEventListener('click', () => {
        if (isTimerRunning) {
            isTimerRunning = false;
            timerRemainingDuration = timerEndTime - Date.now();
            clearInterval(timerDisplayInterval);
            startTimerBtn.textContent = 'Start';
        } else {
            isTimerRunning = true;
            const durationToSet = timerRemainingDuration > 0 ? timerRemainingDuration : (parseInt(timerMinutesInput.value, 10) * 60 * 1000);
            if(durationToSet <= 0) {
                 alert('Please set a valid duration!');
                 isTimerRunning = false;
                 return;
            }
            timerEndTime = Date.now() + durationToSet;
            timerDisplayInterval = setInterval(updateTimerDisplay, 100);
            startTimerBtn.textContent = 'Pause';
        }
    });

    resetTimerBtn.addEventListener('click', () => {
        isTimerRunning = false;
        clearInterval(timerDisplayInterval);
        timerRemainingDuration = parseInt(timerMinutesInput.value, 10) * 60 * 1000;
        updateTimerDisplay();
        startTimerBtn.textContent = 'Start';
    });

    timerMinutesInput.addEventListener('input', () => {
        if (!isTimerRunning) {
            timerRemainingDuration = parseInt(timerMinutesInput.value, 10) * 60 * 1000;
            updateTimerDisplay();
        }
    });

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

    attachOrientationListeners();
});
