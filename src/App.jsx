import React, { useEffect, useRef, useState } from "react";
import "./styles.css";
import TotGauge from './TOTGauge'; 
import N1Gauge from './N1Gauge';
import VoltageMeter from './VoltageMeter';

const StartPanel = () => {
  const tempCanvasRef = useRef(null); // Ref for the TOT gauge
  const ngCanvasRef = useRef(null); // Ref for the NG gauge
  const batteryCanvasRef = useRef(null); // Ref for the Battery gauge
  
  const [temperature, setTemperature] = useState(0); // State for temperature
  const [ngValue, setNgValue] = useState(0); // State for NG value
  const [voltage, setVoltage] = useState(24); // State for battery voltage, default to 24V

  // UseEffect for the TOT gauge
  useEffect(() => {
    const tempCanvas = tempCanvasRef.current;
    const tempCtx = tempCanvas.getContext("2d");
    TotGauge(tempCtx, temperature); // Draw the TOT gauge
  }, [temperature]);

  // UseEffect for the NG gauge
  useEffect(() => {
    const ngCanvas = ngCanvasRef.current;
    const ngCtx = ngCanvas.getContext("2d");
    N1Gauge(ngCtx, ngValue); // Draw the NG gauge
  }, [ngValue]);

  // UseEffect for the battery voltage gauge
  useEffect(() => {
    const batteryCanvas = batteryCanvasRef.current;
    const batteryCtx = batteryCanvas.getContext("2d");
    VoltageMeter(batteryCtx, voltage); // Draw the Battery gauge
  }, [voltage]);

  const handleTemperatureChange = (e) => {
    setTemperature(parseFloat(e.target.value)); // Update temperature state
  };

  const handleNgChange = (e) => {
    setNgValue(parseFloat(e.target.value)); // Update NG value state
  };

  const handleVoltageChange = (e) => {
    setVoltage(parseFloat(e.target.value)); // Update voltage state
  };

  return (
    <div className="gauge-container">
      <div className="gauges">
        {/* TOT Gauge */}
        <div className="gauge-item">
          <canvas ref={tempCanvasRef} width={300} height={300}></canvas>
          <input
            type="range"
            min="0"
            max="1000"
            value={temperature}
            onChange={handleTemperatureChange}
            step="1"
          />
        </div>

        {/* Battery Voltage Gauge */}
        <div className="gauge-item">
          <canvas ref={batteryCanvasRef} width={300} height={150}></canvas>
          <input
            type="range"
            min="0"
            max="28.5"
            value={voltage}
            onChange={handleVoltageChange}
            step="0.1"
          />
        </div>

        {/* NG Gauge */}
        <div className="gauge-item">
          <canvas ref={ngCanvasRef} width={300} height={300}></canvas>
          <input
            type="range"
            min="0"
            max="110"
            value={ngValue}
            onChange={handleNgChange}
            step="0.1"
          />
        </div>
      </div>
    </div>
  );
};

export default StartPanel;