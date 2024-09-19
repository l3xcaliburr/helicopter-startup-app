import React, { useEffect, useRef, useState } from "react";
import "./styles.css";
import TotGauge from './TOTGauge'; 
import N1Gauge from './N1Gauge';
import VoltageMeter from './VoltageMeter';
import BatterySwitch from "./BatterySwitch";
import StarterButton from "./StartButton";

const baseTemperature = 600; // Base temperature (e.g., ambient)
const maxTemperature = 1000; // Max temperature during light-off
const normalOperatingTemp = 710; // Normal operating temperature after self-sustaining
const k = 12.5; // Constant for exponential function
const fuelSensitivity = 20; // Set fuel sensitivity to 20

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
  const [isSelfSustaining, setIsSelfSustaining] = useState(false); // Moved inside the component

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
    ngValue,
    isLightOff,
  ]);

  // N1 increase/decrease logic
  useEffect(() => {
    let n1Interval;

    if (isStarting && isBatteryOn) {
      // Starter is engaged and battery is on
      n1Interval = setInterval(() => {
        setNgValue((prevNg) => {
          const newNg = prevNg + 0.5; // Increased rate for faster N1 rise
          if (newNg >= 55) {
            setIsSelfSustaining(true); // Engine becomes self-sustaining
          }
          return newNg;
        });
      }, 100);
    } else if (isBatteryOn && isSelfSustaining && fuelFlow > 0) {
      // Engine is self-sustaining and fuel flow is sufficient
      n1Interval = setInterval(() => {
        setNgValue((prevNg) => {
          const idleFuelFlow = 0.4; // 40% fuel flow corresponds to idle
          const idleNg = 67;
          const maxNg = 96;

          let targetNg;
          if (fuelFlow <= idleFuelFlow) {
            targetNg = idleNg;
          } else {
            const fuelFlowRange = 1 - idleFuelFlow;
            const ngRange = maxNg - idleNg;
            const fuelFlowAboveIdle = fuelFlow - idleFuelFlow;
            const ngIncrement = (fuelFlowAboveIdle / fuelFlowRange) * ngRange;
            targetNg = idleNg + ngIncrement;
          }

          // Smooth N1 adjustment towards targetNg
          const ngDifference = targetNg - prevNg;
          const ngAdjustment = ngDifference * 0.08; // Adjust response rate as needed

          return prevNg + ngAdjustment;
        });
      }, 100);
    } else {
      // N1 decreases when conditions are not met
      n1Interval = setInterval(() => {
        setNgValue((prevNg) => {
          if (prevNg <= 0) {
            clearInterval(n1Interval);
            setIsSelfSustaining(false); // Reset self-sustaining state
            return 0;
          }
          return prevNg - 0.5; // Adjust rate as needed
        });
      }, 100);
    }

    return () => {
      clearInterval(n1Interval);
    };
  }, [isStarting, isBatteryOn, fuelFlow, isSelfSustaining]);

  // Handle starter button press
  const handleStarterPress = () => {
    if (isBatteryOn) {
      setIsStarting(true);
      setVoltage(22); 
    }
  };

  // Handle starter button release
  const handleStarterRelease = () => {
    setIsStarting(false);
    // N1 behavior after release is handled in the N1 useEffect
  };

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
                setIsSelfSustaining(false); // Reset self-sustaining state
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
  );
};

export default StartPanel;