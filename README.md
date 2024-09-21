Helicopter Turbine Engine Start Simulation

ROTORDEV, LLC
Author - Alex Brooks
rotordev.com
alex@rotordev.com

This React application simulates the start-up sequence of a helicopter turbine engine. It features interactive controls for engaging the starter, managing fuel flow, and monitoring engine parameters like temperature (TOT) and engine speed (N1, Ng). The project aims to provide a realistic experience of manually starting a helicopter turbine engine, such as those found in Bell 206 and similar aircraft without Full Authority Digital Engine Control (FADEC).

Features:
- Interactive gauge displays for N1, TOT, and voltage.
- Controls for the battery switch, starter button, and fuel flow.
- Realistic simulation of engine start-up physics including temperature effects and engine speed dynamics.
- Visual and audio feedback on engine status and warnings.

Getting Started:
To run this project on your local machine, follow these steps:

1. Prerequisites:
   - Ensure you have Node.js installed on your system.
   - Clone the repository to your local machine.
   - Navigate to the project directory and install dependencies using npm or yarn:

   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

2. Running the Application:
   - Start the application by running:
   
   ```
   npm start
   ```
   or
   ```
   yarn start
   ```
   - Open your web browser and access http://localhost:3000 to view the application.

3. Building for Production:
   - To build the application for production, run:
   
   ```
   npm run build
   ```
   or
   ```
   yarn build
   ```
   - This will generate a 'build' folder with optimized files for deployment.

Using the Simulation:
- Power the System: Toggle the battery switch to "On" to power up the helicopter's electrical systems.
- Engage the Starter: Press and hold the starter button (SPACEBAR) until the N1 gauge shows the engine reaching about 42% (or the specified self-sustaining speed). Release the starter once this threshold is met.
- Manage Fuel Flow: Gradually increase the fuel flow using the slider (SCROLL) to raise the engine's temperature and speed without exceeding safe limits. Monitor the TOT and N1 gauges to ensure the engine does not overheat or stall.
- Monitor and Adjust: Continue to adjust the fuel flow as needed to bring the engine to a stable operating condition. Watch for visual and audio feedback to guide your adjustments.
- Shutting Down: Reduce the fuel flow to zero using the slider to shut down the engine safely. Turn off the battery switch to power down the system.

Please note: This simulation is for educational and demonstration purposes and may not accurately reflect all dynamics of an actual turbine engine start-up.
