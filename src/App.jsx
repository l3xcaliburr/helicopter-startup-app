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
const k = 12.5; // Constant for exponential function
const fuelSensitivity = 8; // Set fuel sensitivity to 10

const StartPanel = () => {
  const [temperature, setTemperature] = useState(0);
  const [ngValue, setNgValue] = useState(0); 
  const [voltage, setVoltage] = useState(24); 
  const [isBatteryOn, setIsBatteryOn] = useState(false); 
  const [isStarterPressed, setIsStarterPressed] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [fuelFlow, setFuelFlow] = useState(0);
  const [isSelfSustaining, setIsSelfSustaining] = useState(false);
  const [isIdleLockReleased, setIsIdleLockReleased] = useState(false);
  const [isLightOff, setIsLightOff] = useState(false);
  const [setContinueNgAcceleration] = useState(false);
  const [logs, setLogs] = useState([]);

  const tempCanvasRef = useRef(null);
  const ngCanvasRef = useRef(null);
  const batteryCanvasRef = useRef(null);
  const fuelFlowRef = useRef(fuelFlow);
  const isIdleLockReleasedRef = useRef(isIdleLockReleased);
  const lightOffTimeoutRef = useRef(null);
  const coolDownIntervalRef = useRef(null);
  const terminalRef = useRef(null);
  const addLog = (message) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  };

  //Handle terminal window autoscrolling
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  //Voltage drawdown during starter engagement
  const handleStarterPress = () => {
    if (isBatteryOn) {
      setIsStarting(true);
      setVoltage(18.5); 
    }
  };

  //Continue Ng acceleration after starter release
  const handleStarterRelease = () => {
    if (ngValue >= 42) {
      setContinueNgAcceleration(true);  // Allow NG acceleration to continue
    }
    setIsStarting(false);
  };

  //Display TOT gauge animation
  useEffect(() => {
    const tempCanvas = tempCanvasRef.current;
    const tempCtx = tempCanvas.getContext("2d");
    TotGauge(tempCtx, temperature); 
  }, [temperature]);

  //Display N1 gauge animation
  useEffect(() => {
    const ngCanvas = ngCanvasRef.current;
    const ngCtx = ngCanvas.getContext("2d");
    N1Gauge(ngCtx, ngValue); 
  }, [ngValue]);

  //Display voltage gauge animation
  useEffect(() => {
    const batteryCanvas = batteryCanvasRef.current;
    const batteryCtx = batteryCanvas.getContext("2d");
    VoltageMeter(batteryCtx, voltage);
  }, [voltage]);

  //Handle starter press using 'SPACE'
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space' && isBatteryOn) {
        setIsStarterPressed(true);  // Mark button as pressed
        handleStarterPress();
      }
    };
  
    const handleKeyUp = (event) => {
      if (event.code === 'Space' && isBatteryOn) {
        setIsStarterPressed(false);  // Mark button as released
        handleStarterRelease();
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isBatteryOn]);

  //Sets the fuel flow reference
  useEffect(() => {
    fuelFlowRef.current = fuelFlow;
  }, [fuelFlow]);

  //Allow fuel adjustment using 'SCROLL'
  useEffect(() => {
    const handleScroll = (event) => {
      event.preventDefault(); // Prevents the default scrolling behavior
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

  //Set idle lock
  useEffect(() => {
    isIdleLockReleasedRef.current = isIdleLockReleased;
  }, [isIdleLockReleased]);

  //Prevent fuel control from being reduced below idle > 40%
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

  //TOT light off, acceleration and sustain logic
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
        const lightOffDelay = 1100; // milliseconds

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

      if (ngValue < 32) {
        // Light-off phase
        const ngFactor = (50 - ngValue) / 20;
        targetTemperature =
          baseTemperature +
          (maxTemperature - baseTemperature) * (1 - Math.exp(-k * fuelFlow)) * ngFactor;
      } else if (ngValue >= 32 && ngValue < 40) {
        // Acceleration phase
        const ngFactor = (53 - ngValue) / 10;
        targetTemperature =
          baseTemperature +
          (normalOperatingTemp - baseTemperature) * (1 - Math.exp(-k * fuelFlow)) * ngFactor;
      } else {
        // Self-sustaining phase
        const k_sustain = 12.5; // Adjusted constant
        targetTemperature =
          baseTemperature +
          (normalOperatingTemp - baseTemperature) * (1 - Math.exp(-k_sustain * fuelFlow));
      }

      const responseFactor = fuelSensitivity / 400000;
      const temperatureDifference = targetTemperature - temperature;
      const temperatureAdjustment = temperatureDifference * responseFactor;
      const newTemperature = temperature + temperatureAdjustment;

      setTemperature(newTemperature);
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

  //Ng acceleration, sustain and shutdown logic
  useEffect(() => {
    let n1Interval;

    if (isStarting && isBatteryOn) {
      // Starter is engaged and battery is on
      n1Interval = setInterval(() => {
        setNgValue((prevNg) => {
          const newNg = prevNg + 0.25; // Increased rate for faster N1 rise
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
    
    } else if (isBatteryOn && isSelfSustaining && fuelFlow === 0) {
        // Engine is self-sustaining, but fuel flow has been cut
        n1Interval = setInterval(() => {
          setNgValue((prevNg) => {
            // We want the NG to decrease to 0 over 30 seconds (300 intervals of 100ms each)
            const totalDecelTime = 30 * 1000; // 30 seconds
            const intervalTime = 100; // 100ms interval
            const totalIntervals = totalDecelTime / intervalTime; // 300 intervals
            
            const decrement = prevNg / totalIntervals; // Decrement NG over time
            const newNg = prevNg - decrement;
      
            if (newNg <= 0) {  // Stop when NG reaches zero
              clearInterval(n1Interval); // Stop the interval once NG reaches 0
              setIsSelfSustaining(false); // Reset self-sustaining state
              return 0;
            }
      
            return newNg; // Gradually reduce NG over time
        });
      }, 100); // Run every 100ms
    
    } else {
      // N1 decreases when conditions are not met
      n1Interval = setInterval(() => {
        setNgValue((prevNg) => {
          if (prevNg <= 0) {
            clearInterval(n1Interval);
            setIsSelfSustaining(false); // Reset self-sustaining state
            return 0;
          }
          return prevNg - 0.05; // Adjust rate as needed
        });
      }, 100);
    }

    return () => {
      clearInterval(n1Interval);
    };
  }, [isStarting, isBatteryOn, isSelfSustaining]);

  //Display application using HTML
  return (
    <div> {/* Added this div to wrap everything into a single parent */}
      <div className="header-container">

      <div className="gauge-item">
          <StarterButton
            onMouseDown={handleStarterPress}
            onMouseUp={handleStarterRelease}
            isPressed={isStarterPressed}  // Pass the state to track the press
          />
        </div>
        <div className="blank-item">
        </div>
        <div className="gauge-item">
            <canvas ref={batteryCanvasRef} width={300} height={150}></canvas>
        </div>
        <div className="blank-item">
        </div>
        <div className="gauge-item">
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

      <div className="footer-container">
        <div className="blank-item"></div>
        <div className="terminal-window" ref={terminalRef}>
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
        <div className="blank-item"></div>
      </div>

      <div className="footer-container" >
          <div className="blank-item">
            </div>
          
          <div className="blank-item">
        </div>
      </div>
    </div>
  );

};

export default StartPanel;