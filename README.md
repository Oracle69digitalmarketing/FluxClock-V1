# ⚡ FluxClock

### A device-orientation-driven clock utility for mobile.

FluxClock is a minimalist, single-page application that transforms a mobile device into a multi-functional clock. By leveraging a user's device orientation, the app dynamically switches between four core utilities: an alarm, a stopwatch, a timer, and real-time local weather.

The core innovation is a zero-UI interaction model. Instead of tapping through menus, the user simply rotates their device to access the desired feature, making the experience fast, intuitive, and distraction-free.

---

### Key Features

* **Alarm Clock:** Set a custom alarm time in portrait-upright mode.
* **Stopwatch:** A simple, elegant stopwatch for tracking time in landscape-right mode.
* **Timer:** A countdown timer with configurable minutes in portrait-upsidedown mode.
* **Weather:** Real-time local weather data, automatically fetched via the OpenWeatherMap API, in landscape-left mode.

---

### How It Works

The application uses the `screen.orientation` and `window.orientation` APIs to detect the device's physical rotation. A custom JavaScript function then maps each of the four cardinal orientations to a specific app feature, which is rendered dynamically. This approach ensures maximum compatibility and performance across modern mobile browsers.

* **Portrait Upright (0°):** Activates the **Alarm Clock**.
* **Landscape Right (90°):** Activates the **Stopwatch**.
* **Portrait Upsidedown (180°):** Activates the **Timer**.
* **Landscape Left (270°):** Activates the **Weather**.

---

### Technical Stack

* **Frontend:** Plain HTML, CSS, and JavaScript.
* **APIs:** OpenWeatherMap API for weather data.
* **Deployment:** Vercel.

---

### Getting Started

To run the project locally or deploy it yourself, follow these steps.

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/your-username/omni-orient-app.git](https://github.com/your-username/omni-orient-app.git)
    cd omni-orient-app
    ```
2.  **Open in Browser**
    Simply open the `index.html` file in your preferred web browser.

3.  **Deploy on Vercel**
    Connect your GitHub repository to a new Vercel project. Vercel will automatically detect the static file and deploy it.

---

### GTM & Scaling Strategy

This project serves as a compelling MVP for a scalable product. Future development could include:

* **Monetization:** Integrate a sponsored daily weather fact or a "premium features" tier (e.g., custom alarm sounds, multiple timers).
* **Expansion:** Build a native app version for better sensor support and push notifications.
* **Platform Integration:** Create a widget for smart home devices or digital displays.
* **Branding:** Position FluxClock as a productivity tool for athletes, meditators, or professionals.

Developed by Prince Adewumi Adewale.

