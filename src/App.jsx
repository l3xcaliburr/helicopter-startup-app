import React, { useEffect, useRef, useState } from "react";
import "./styles.css";
import TotGauge from './TOTGauge'; 
import N1Gauge from './N1Gauge';
import VoltageMeter from './VoltageMeter';
import BatterySwitch from "./BatterySwitch";
import styled from 'styled-components';


const baseTemperature = 600; // Base temperature (e.g., ambient)
const maxTemperature = 1000; // Max temperature during light-off
const normalOperatingTemp = 710; // Normal operating temperature after self-sustaining
const k = 12.5; // Constant for exponential function



// Styled circular starter button
const StarterButton = styled.button`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #4caf50; /* Green color */
  color: white;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px #2d7031;
  position: fixed; /* Fixed at the bottom of the page */
  bottom: 20px; /* 20px from the bottom */
  left: 50%; /* Centered horizontally */
  transform: translateX(-50%); /* Centering transform */
  
  &:active {
    background-color: #45a049; /* Darken when pressed */
    box-shadow: 0 2px #2d7031;
    transform: translateX(-50%) translateY(4px); /* Simulate button press */
  }
`;

const StartPanel = () => {
  const tempCanvasRef = useRef(null);
  const ngCanvasRef = useRef(null);
  const batteryCanvasRef = useRef(null);
  
  const [temperature, setTemperature] = useState(0);
  const [ngValue, setNgValue] = useState(0); 
  const [voltage, setVoltage] = useState(24); 
  const [isBatteryOn, setIsBatteryOn] = useState(false); 
  const [isStarting, setIsStarting] = useState(false);
  const [fuelFlow, setFuelFlow] = useState(0); // Fuel flow percentage

  useEffect(() => {
    const tempCanvas = tempCanvasRef.current;
    const tempCtx = tempCanvas.getContext("2d");
    TotGauge(tempCtx, temperature); 
  }, [temperature]);

  useEffect(() => {
    const ngCanvas = ngCanvasRef.current;
    const ngCtx = ngCanvas.getContext("2d");
    N1Gauge(ngCtx, ngValue); 
  }, [ngValue]);

  useEffect(() => {
    const batteryCanvas = batteryCanvasRef.current;
    const batteryCtx = batteryCanvas.getContext("2d");
    VoltageMeter(batteryCtx, voltage);
  }, [voltage]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space' && isBatteryOn) {
        handleStarterPress();
      }
    };
  
    const handleKeyUp = (event) => {
      if (event.code === 'Space' && isBatteryOn) {
        handleStarterRelease();
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isBatteryOn]);  // This effect depends on the battery state

// Sensitivity factor for TOT response to fuel flow, adjustable by slider
const [fuelSensitivity, setFuelSensitivity] = useState(20); // Default sensitivity, can be adjusted

const coolDownIntervalRef = useRef(null);
const lightOffTimeoutRef = useRef(null);
const [isLightOff, setIsLightOff] = useState(false);

  useEffect(() => {
    if (isBatteryOn && isStarting && fuelFlow > 0 && !isLightOff) {
      // Clear any existing cooldown interval
      if (coolDownIntervalRef.current) {
        clearInterval(coolDownIntervalRef.current);
        coolDownIntervalRef.current = null;
      }

      // Start light-off delay if not already started
      if (!lightOffTimeoutRef.current) {
        // Set delay duration (e.g., 2 seconds)
        const lightOffDelay = 2000; // milliseconds

        lightOffTimeoutRef.current = setTimeout(() => {
          setIsLightOff(true);
          lightOffTimeoutRef.current = null; // Clear the timeout reference
        }, lightOffDelay);
      }
    }

    // Cleanup if fuel flow drops back to zero before light-off
    if (fuelFlow === 0 && lightOffTimeoutRef.current) {
      clearTimeout(lightOffTimeoutRef.current);
      lightOffTimeoutRef.current = null;
    }

    // Begin temperature increase only after light-off occurs
    if (isLightOff) {
      let targetTemperature;

      if (ngValue < 15) {
        // Light-off phase
        targetTemperature =
          baseTemperature +
          (maxTemperature - baseTemperature) * (1 - Math.exp(-k * fuelFlow));
      } else if (ngValue >= 15 && ngValue < 66) {
        // Acceleration phase
        const ngFactor = (66 - ngValue) / 51;
        targetTemperature =
          baseTemperature +
          ((maxTemperature - baseTemperature) * (1 - Math.exp(-k * fuelFlow))) * ngFactor;
      } else {
        // Self-sustaining phase
        const k_sustain = 15.1; // Adjusted constant
        targetTemperature =
          baseTemperature +
          (normalOperatingTemp - baseTemperature) * (1 - Math.exp(-k_sustain * fuelFlow));
      }

      const responseFactor = fuelSensitivity / 70000;
      const temperatureDifference = targetTemperature - temperature;
      const temperatureAdjustment = temperatureDifference * responseFactor;
      const newTemperature = temperature + temperatureAdjustment;

      setTemperature(newTemperature);

      // Overtemperature warning
      if (newTemperature > 900) {
        console.warn('Warning: Overtemperature condition!');
      }
    }

    // Reset isLightOff if starting conditions are not met
    if (!isStarting || !isBatteryOn || fuelFlow === 0) {
      setIsLightOff(false);

      // Clear light-off timeout if still pending
      if (lightOffTimeoutRef.current) {
        clearTimeout(lightOffTimeoutRef.current);
        lightOffTimeoutRef.current = null;
      }
    }
  }, [
    isBatteryOn,
    isStarting,
    fuelFlow,
    temperature,
    fuelSensitivity,
    ngValue,
    isLightOff,
  ]);


// Handle N1 self-sustaining logic (stabilize N1 and release starter once N1 > 66%)
useEffect(() => {
  if (isStarting && ngValue >= 66) {
    setNgValue(67); // Stabilize N1 at 67% once engine is self-sustaining
    setIsStarting(false); // Simulate releasing the starter
    setVoltage(28); // Battery voltage stabilizes
  }
}, [ngValue, isStarting]);

// Handle fuel control scrolling (smooth and bidirectional, usable at any point)
useEffect(() => {
  const handleScroll = (event) => {
    setFuelFlow(prevFuelFlow => {
      let newFuelFlow = prevFuelFlow;

      if (event.deltaY < 0) {
        // Scrolling up - decrease fuel flow
        newFuelFlow = Math.max(prevFuelFlow - 0.003, 0); // Decrease by 0.003, floor at 0%
      } else if (event.deltaY > 0) {
        // Scrolling down - increase fuel flow
        newFuelFlow = Math.min(prevFuelFlow + 0.003, 1); // Increase by 0.003, cap at 100%
      }

      return newFuelFlow;
    });
  };

  window.addEventListener('wheel', handleScroll); // Attach the wheel event listener

  return () => {
    window.removeEventListener('wheel', handleScroll); // Clean up the listener on component unmount
  };
}, []); // No dependencies - active at any point

  useEffect(() => {
    let n1Interval;

    if (isStarting && isBatteryOn) {
      n1Interval = setInterval(() => {
        setNgValue((prevNg) => {
          if (prevNg >= 66) {
            clearInterval(n1Interval);
            return prevNg; // N1 stabilizes or increases slowly after self-sustaining
          }
          return prevNg + 0.5; // Adjust rate as needed
        });
      }, 100);
    } else if (!isStarting || !isBatteryOn) {
      // N1 decreases when the starter is disengaged or battery is off
      n1Interval = setInterval(() => {
        setNgValue((prevNg) => {
          if (prevNg <= 0) {
            clearInterval(n1Interval);
            return 0;
          }
          return prevNg - 0.5; // Adjust rate as needed
        });
      }, 100);
    }

    return () => {
      clearInterval(n1Interval);
    };
}, [isStarting, isBatteryOn]);

// Handle starter button press
const handleStarterPress = () => {
  if (isBatteryOn) {
    setIsStarting(true);
    setVoltage(22); 
  }
};

// Handle starter button release (decrease N1 and slowly cool down TOT)
const handleStarterRelease = () => {
  setIsStarting(false);

  // Start idling down the N1 gauge
  const idleDownInterval = setInterval(() => {
    setNgValue(prevNg => {
      if (prevNg <= 0) {
        clearInterval(idleDownInterval); // Stop once N1 reaches zero
        return 0;
      }
      return prevNg - 0.5; // Smoothly decrease N1 by 0.5% every 100ms
    });
  }, 100); // Run the decrement every 100ms

  // Start cooling down the TOT after shutdown
  const coolDownInterval = setInterval(() => {
    setTemperature(prevTemp => {
      if (prevTemp > 250) {
        return prevTemp - 1; // Cool down slowly until it reaches 250°C
      } else if (prevTemp > 0) {
        return prevTemp - 0.1; // After reaching 250°C, cool even more slowly
      } else {
        clearInterval(coolDownInterval); // Stop once TOT reaches 0
        return 0;
      }
    });
  }, 100); // Run the decrement every 100ms
};

return (
  <div className="gauge-container">
    <div className="gauges">
      <div className="gauge-item">
        <canvas ref={tempCanvasRef} width={300} height={300}></canvas>
      </div>

      <div className="gauge-item">
        <canvas ref={batteryCanvasRef} width={300} height={150}></canvas>
      </div>

      <div className="battery-switch-container">
        <BatterySwitch
          onToggle={(isOn) => {
            setIsBatteryOn(isOn); 
            if (isOn) {
              setVoltage(24); // Turn on the battery
            } else {
              // Reset everything when battery is turned off
              setVoltage(0);
              setNgValue(0);
              setTemperature(0);
              setFuelFlow(0);
            }
          }}
        />
      </div>

      <div className="starter-button-container">
        <StarterButton
          onMouseDown={handleStarterPress}
          onMouseUp={handleStarterRelease}
        >
          Starter
        </StarterButton>
      </div>

      <div className="gauge-item">
        <canvas ref={ngCanvasRef} width={300} height={300}></canvas>
      </div>

      <div>
          <label>Fuel Sensitivity: {fuelSensitivity}</label>
          <input
            type="range"
            min="1"
            max="1000"
            value={fuelSensitivity}
            step="1"
            onChange={(e) => setFuelSensitivity(parseFloat(e.target.value))}
          />

        <div className="fuel-control">
          <input
            type="range"
            min="0"
            max="1"
            step=".01"
            value={fuelFlow}
            onChange={(e) => setFuelFlow(parseFloat(e.target.value))} // Manually controlled fuel flow
          />
          <label>Fuel Flow: {(fuelFlow * 100).toFixed(0)}%</label> {/* Show percentage */}
        </div>
      </div>
    </div>
  </div>
);
};

export default StartPanel;