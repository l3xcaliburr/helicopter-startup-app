import React, { useEffect, useRef, useState } from "react";
import "./styles.css";
import TotGauge from './TOTGauge'; 
import N1Gauge from './N1Gauge';
import VoltageMeter from './VoltageMeter';
import BatterySwitch from "./BatterySwitch";
import StarterButton from "./StarterButton";

const baseTemperature = 0; // Base temperature (e.g., ambient)
const maxTemperature = 1000; // Max temperature during light-off
const normalOperatingTemp = 483; // Normal operating temperature after self-sustaining
const k = 8.5; // Constant for exponential function
const fuelSensitivity = 10; // Set fuel sensitivity to 10

const StartPanel = () => {
  const [temperature, setTemperature] = useState(0);
  const [ngValue, setNgValue] = useState(0); 
  const [voltage, setVoltage] = useState(24); 
  const [isBatteryOn, setIsBatteryOn] = useState(false); 
  const [isStarting, setIsStarting] = useState(false);
  const [fuelFlow, setFuelFlow] = useState(0); // Fuel flow percentage
  const [isSelfSustaining, setIsSelfSustaining] = useState(false); // Moved inside the component
  const [isIdleLockReleased, setIsIdleLockReleased] = useState(false);
  
  const tempCanvasRef = useRef(null);
  const ngCanvasRef = useRef(null);
  const batteryCanvasRef = useRef(null);
  const fuelFlowRef = useRef(fuelFlow);
  const isIdleLockReleasedRef = useRef(isIdleLockReleased);

  useEffect(() => {
    isIdleLockReleasedRef.current = isIdleLockReleased;
  }, [isIdleLockReleased]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Control' || event.key === 'Meta') {
        setIsIdleLockReleased(true);
      }
    };
  
    const handleKeyUp = (event) => {
      if (event.key === 'Control' || event.key === 'Meta') {
        setIsIdleLockReleased(false);
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

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
     // Start light-off process if starting or self-sustaining with fuel flow
    if ((isBatteryOn && isStarting && fuelFlow > 0 && !isLightOff) || (isSelfSustaining && fuelFlow > 0 && !isLightOff)) {
      // Clear any existing cooldown interval
      if (coolDownIntervalRef.current) {
        clearInterval(coolDownIntervalRef.current);
        coolDownIntervalRef.current = null;
      }

      // Start light-off delay if not already started
      if (!lightOffTimeoutRef.current) {
        const lightOffDelay = 1500; // milliseconds

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

    // Begin temperature increase when light-off has occurred or engine is self-sustaining
    if (isLightOff || (isSelfSustaining && fuelFlow > 0)) {
      let targetTemperature;

      if (ngValue < 15) {
        // Light-off phase
        targetTemperature =
          baseTemperature +
          (maxTemperature - baseTemperature) * (1 - Math.exp(-k * fuelFlow));
      } else if (ngValue >= 15 && ngValue < 63) {
        // Acceleration phase
        const ngFactor = (63 - ngValue) / 30;
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

      const responseFactor = fuelSensitivity / 200000;
      const temperatureDifference = targetTemperature - temperature;
      const temperatureAdjustment = temperatureDifference * responseFactor;
      const newTemperature = temperature + temperatureAdjustment;

      setTemperature(newTemperature);

      // Overtemperature warning
      if (newTemperature > 900) {
        console.warn('Warning: Overtemperature condition!');
      }
    }

    if ((!isStarting && !isSelfSustaining) || fuelFlow === 0) {
      if (!coolDownIntervalRef.current) {
        coolDownIntervalRef.current = setInterval(() => {
          setTemperature((prevTemp) => {
            const newTemp = prevTemp - 5; // Adjust the cooldown rate as needed
            if (newTemp <= baseTemperature) {
              clearInterval(coolDownIntervalRef.current);
              coolDownIntervalRef.current = null;
              return baseTemperature;
            }
            return newTemp;
          });
        }, 100);
      }
    }

    // Reset isLightOff if starting conditions are not met
    if ((!isStarting && !isSelfSustaining) || !isBatteryOn || fuelFlow === 0) {
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

  // Update the ref whenever fuelFlow changes
  useEffect(() => {
    fuelFlowRef.current = fuelFlow;
  }, [fuelFlow]);

  useEffect(() => {
    let n1Interval;

    if (isStarting && isBatteryOn) {
      // Starter is engaged and battery is on
      n1Interval = setInterval(() => {
        setNgValue((prevNg) => {
          const newNg = prevNg + 0.3; // Increased rate for faster N1 rise
          if (newNg >= 42) {
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
          const idleNg = 63;
          const maxNg = 83.7;

          let targetNg;
          const currentFuelFlow = fuelFlowRef.current; // Access the latest fuel flow

          if (currentFuelFlow === 0) {
            // Fuel flow is zero, Ng should decrease
            targetNg = 0;
          } else if (currentFuelFlow <= idleFuelFlow) {
            // Fuel flow between 0 and idleFuelFlow
            // Set targetNg proportionally between 0 and idleNg
            targetNg = (currentFuelFlow / idleFuelFlow) * idleNg;
          } else {
            // Fuel flow above idleFuelFlow
            const fuelFlowRange = 1 - idleFuelFlow;
            const ngRange = maxNg - idleNg;
            const fuelFlowAboveIdle = currentFuelFlow - idleFuelFlow;
            const ngIncrement = (fuelFlowAboveIdle / fuelFlowRange) * ngRange;
            targetNg = idleNg + ngIncrement;
          }

          // Smooth N1 adjustment towards targetNg
          const ngDifference = targetNg - prevNg;
          const ngAdjustment = ngDifference * 0.1; // Adjust response rate as needed

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
          return prevNg - 0.2; // Adjust rate as needed
        });
      }, 100);
    }

    return () => {
      clearInterval(n1Interval);
    };
  }, [isStarting, isBatteryOn, isSelfSustaining]);

  // Handle starter button press
  const handleStarterPress = () => {
    if (isBatteryOn) {
      setIsStarting(true);
      setVoltage(18.5); 
    }
  };

  // Handle starter button release
  const handleStarterRelease = () => {
    setIsStarting(false);
    // N1 behavior after release is handled in the N1 useEffect
  };

  useEffect(() => {
    const handleScroll = (event) => {
      setFuelFlow(prevFuelFlow => {
        let newFuelFlow = prevFuelFlow;
  
        if (event.deltaY < 0) {
          // Scrolling up - decrease fuel flow
          newFuelFlow = prevFuelFlow - 0.003;
  
          if (prevFuelFlow >= 0.4 && newFuelFlow < 0.4 && !isIdleLockReleasedRef.current) {
            // Idle lock engaged, prevent reducing below 60%
            newFuelFlow = 0.4;
          } else {
            newFuelFlow = Math.max(newFuelFlow, 0);
          }
        } else if (event.deltaY > 0) {
          // Scrolling down - increase fuel flow
          newFuelFlow = Math.min(prevFuelFlow + 0.003, 1);
        }
  
        return newFuelFlow;
      });
    };
  
    window.addEventListener('wheel', handleScroll);
  
    return () => {
      window.removeEventListener('wheel', handleScroll);
    };
  }, []);

  return (
    <div> {/* Added this div to wrap everything into a single parent */}
      <div className="header-container">
        <div className="blank-item">
        </div>
        <div className="blank-item">
        </div>
        <div className="gauge-item">
            <canvas ref={batteryCanvasRef} width={300} height={150}></canvas>
        </div>
        <div className="blank-item">
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
      </div>
      
      <div className="gauge-container">
        <div className="gauge-item">
          <canvas ref={tempCanvasRef} width={300} height={300}></canvas>
        </div>
        <div className="gauge-item">
          <canvas ref={ngCanvasRef} width={300} height={300}></canvas>
        </div>
      </div>

      <div className="gauge-container2">
          <div className="fuel-control">
          <input
              type="range"
              min="0"
              max="1"
              step=".01"
              value={fuelFlow}
              onChange={(e) => {
                let newFuelFlow = parseFloat(e.target.value);

                if (newFuelFlow < 0.6 && fuelFlow >= 0.6 && !isIdleLockReleased) {
                  // Idle lock engaged, prevent reducing below 20%
                  newFuelFlow = 0.6;
                }

                setFuelFlow(newFuelFlow);
              }}
            />
            <label>Fuel Flow: {(fuelFlow * 100).toFixed(0)}%</label> {/* Show percentage */}
          </div>  
      </div>

      <div className="footer-container" >
          <div className="blank-item">
          </div>
          <div className="starter-container">
                <StarterButton
                  onMouseDown={handleStarterPress}
                  onMouseUp={handleStarterRelease}
                >
                  Starter
                </StarterButton>
              </div>
          <div className="blank-item">
          </div>
      </div>
    </div>
  );

};

export default StartPanel;