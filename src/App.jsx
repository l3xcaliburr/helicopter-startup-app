import React, { useEffect, useRef, useState } from "react";
import "./styles.css";

const drawGauge = (ctx, temperature) => {
  const centerX = 150;
  const centerY = 150;
  const radius = 90;

  // Clear the canvas with high-quality smoothing
  ctx.clearRect(0, 0, 300, 300);
  ctx.imageSmoothingEnabled = true;

  // Simulate 3D effect with outer black ring
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 20, 0, 2 * Math.PI);  // Larger outer ring
  ctx.fillStyle = "#101010";  // Darker black/gray for the outermost ring
  ctx.fill();
  ctx.closePath();

  // Add beveled edge for the outer ring
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 20, 0, 2 * Math.PI);  // Slightly smaller radius
  ctx.fillStyle = "black";  // Solid black for the beveled outer edge
  ctx.fill();
  ctx.closePath();

  // Inner recessed area
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);  // Inner circle for the main gauge area
  ctx.fillStyle = "#202020";  // Slightly lighter black to simulate a recessed area
  ctx.fill();
  ctx.closePath();

  // Optional inner highlight ring to emphasize the beveled edge
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 10, 0, 2 * Math.PI);  // Inner highlight closer to the center
  ctx.strokeStyle = "#404040";  // Slightly lighter shade for the highlight
  ctx.lineWidth = 4;  // Thicker line for highlight effect
  ctx.stroke();
  ctx.closePath();

  // Add 'TOT' and '°C X 100' text stacked in the center of the gauge
  ctx.fillStyle = "white";  // White text color
  ctx.font = "bold 16px Arial";  // Font for 'TOT'
  ctx.textAlign = "center";  // Center the text horizontally
  ctx.fillText("TOT", centerX, centerY - 33);  // Draw 'TOT' slightly above the center

  ctx.font = "14px Arial";  // Font for '°C X 100'
  ctx.fillText("°C X 100", centerX, centerY - 20);  // Draw '°C X 100' slightly below the center

  // Draw altimeter-style needle
  const needleAngle = getNeedleAngle(temperature); // Assuming getNeedleAngle is correctly calculating the angle

  // Needle parameters
  const needleLength = radius * .9; // Length of the needle (80% of the radius)
  const needleBaseWidth = 12; // Base width of the needle (to make it wide near the center)
  const needleTipWidth = 2; // Width at the tip for a sharp point

  // Calculate the needle's tip (end point)
  const needleX = centerX + needleLength * Math.cos(needleAngle);
  const needleY = centerY + needleLength * Math.sin(needleAngle);

  // Calculate the angle offset for the width of the needle
  const offsetAngle = Math.PI / 2; // 90 degrees to calculate the perpendicular width

  // Calculate the left and right base of the needle (near the center)
  const baseLeftX = centerX + (needleBaseWidth / 2) * Math.cos(needleAngle + offsetAngle);
  const baseLeftY = centerY + (needleBaseWidth / 2) * Math.sin(needleAngle + offsetAngle);
  const baseRightX = centerX + (needleBaseWidth / 2) * Math.cos(needleAngle - offsetAngle);
  const baseRightY = centerY + (needleBaseWidth / 2) * Math.sin(needleAngle - offsetAngle);

  // Draw the needle arm (as a triangle shape)
  ctx.beginPath();
  ctx.moveTo(baseLeftX, baseLeftY); // Left side of the base
  ctx.lineTo(needleX, needleY); // Connect to the needle tip
  ctx.lineTo(baseRightX, baseRightY); // Right side of the base
  ctx.closePath();
  ctx.fillStyle = "white"; // Needle color
  ctx.fill();

  // Draw circular needle base (black circle at the center)
  const baseRadius = 10; // Adjust based on the desired appearance
  ctx.beginPath();
  ctx.arc(centerX, centerY, baseRadius, 0, 2 * Math.PI); // Circular base at center
  ctx.fillStyle = "black"; // Set the base color to black
  ctx.fill();
  ctx.closePath();

  // Optional: Draw white border around the black base (for the circular outline)
  ctx.beginPath();
  ctx.arc(centerX, centerY, baseRadius, 0, 2 * Math.PI);
  ctx.strokeStyle = "white"; // Set the border color to white
  ctx.lineWidth = 2; // Adjust the thickness of the border
  ctx.stroke();
  ctx.closePath();


  // Define tick angles and labels, rotated counterclockwise by 45 degrees
  const tickAngles = [
    { angle: 186-28, label: "0" },   // 0c 
    { angle: 193-28, label: "" },    // 50c
    { angle: 200-28, label: "1" },   // 100c
    { angle: 207-28, label: "" },    // 150c
    { angle: 214-28, label: "2" },   // 200c
    { angle: 221-28, label: "" },    // 250c
    { angle: 228-28, label: "3" },   // 300c
    { angle: 235-28, label: "" },    // 350c
    { angle: 242-28, label: "4" },   // 400c
    { angle: 249-28, label: "" },    // 450c
    { angle: 256-28, label: "5" },   // 500c
    { angle: 263-28, label: "" },    // 550c
    { angle: 270-28, label: "6" },   // 600c
    { angle: 277-28, label: "" },    // 650c
    { angle: 284-28, label: "7" },   // 700c
    { angle: 298-28, label: "" },    // 725c
    { angle: 312-28, label: "" },    // 750c
    { angle: 326-28, label: "" },    // 775c
    { angle: 340-28, label: "8" },   // 800c
    { angle: 354-28, label: "" },    // 825c
    { angle: 8-28, label: "" },    // 850c
    { angle: 22-28, label: "" },    // 875c
    { angle: 36-28, label: "9" },   // 900c
    { angle: 15, label: "" },   // 950c
    { angle: 50-28, label: "10" },     // 1000c
  ];

  // Draw ticks
  tickAngles.forEach(({ angle, label }, index) => {
    const rad = (angle * Math.PI) / 180;

    // Check if it's a main or intermediate tick
    const isMainTick = label !== ""; // Main ticks have labels

    // Set tick length based on main or intermediate tick
    const tickStartRadius = 0.8 * radius; // Same inner radius
    const tickEndRadius = isMainTick ? radius : .95 * radius; // Shorter for intermediate ticks

    // Calculate tick start and end positions
    const xStart = centerX + tickStartRadius * Math.cos(rad);
    const yStart = centerY + tickStartRadius * Math.sin(rad);
    const xEnd = centerX + tickEndRadius * Math.cos(rad);
    const yEnd = centerY + tickEndRadius * Math.sin(rad);

    // Draw tick
    ctx.beginPath();
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xEnd, yEnd);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    // Draw labels for main ticks only
    if (label) {
      // Position label inside the tick, closer to the center (inner circumference)
      const labelRadius = radius * .70;  // Inner radius for labels (adjust as needed)
      const labelX = centerX + labelRadius * Math.cos(rad);  // Calculate label X position
      const labelY = centerY + labelRadius * Math.sin(rad);  // Calculate label Y position

      ctx.fillStyle = "white";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";  // Center the label horizontally
      ctx.fillText(label, labelX, labelY + 1.5);  // Adjust Y slightly for better centering
    }
  });

  // Enhanced arcs with gradient strokes
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - 15, (172 * Math.PI) / 180, (265 * Math.PI) / 180);
  const greenGradient = ctx.createLinearGradient(0, 0, 300, 0);
  greenGradient.addColorStop(0, "lime");
  greenGradient.addColorStop(1, "lime");
  ctx.strokeStyle = greenGradient;
  ctx.lineWidth = 12;
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - 15, (265 * Math.PI) / 180, (294 * Math.PI) / 180);
  const yellowGradient = ctx.createLinearGradient(0, 0, 300, 0);
  yellowGradient.addColorStop(0, "yellow");
  yellowGradient.addColorStop(1, "yellow");
  ctx.strokeStyle = yellowGradient;
  ctx.lineWidth = 12;
  ctx.stroke();
  ctx.closePath();

  // Red tick at 768°C
  const redTickAngle = (294) * Math.PI / 180;
  ctx.beginPath();
  const xStartRed = centerX + radius * 0.75 * Math.cos(redTickAngle);
  const yStartRed = centerY + radius * 0.75 * Math.sin(redTickAngle);
  const xEndRed = centerX + radius * Math.cos(redTickAngle);
  const yEndRed = centerY + radius * Math.sin(redTickAngle);
  ctx.moveTo(xStartRed, yStartRed);
  ctx.lineTo(xEndRed, yEndRed);
  ctx.strokeStyle = "red";
  ctx.lineWidth = 3; // Slightly longer red tick
  ctx.stroke();
  ctx.closePath();

  // Red triangle at 826°C
  const triangleAngle = (327) * Math.PI / 180;
  const triangleRadius = radius * 0.85; // Adjust this factor as needed to align with tick arc
  const triangleX = centerX + triangleRadius * Math.cos(triangleAngle);
  const triangleY = centerY + triangleRadius * Math.sin(triangleAngle);

  // Set the size of the triangle
  const triangleSize = 12;

  // Calculate the three points of the triangle, rotated along the tick line
  ctx.beginPath();

  // Tip of the triangle (pointing towards the center)
  ctx.moveTo(
    triangleX, 
    triangleY
  );

  // Base left point
  ctx.lineTo(
    triangleX + triangleSize * Math.cos(triangleAngle - Math.PI / 6), 
    triangleY + triangleSize * Math.sin(triangleAngle - Math.PI / 6)
  );

  // Base right point
  ctx.lineTo(
    triangleX + triangleSize * Math.cos(triangleAngle + Math.PI / 6), 
    triangleY + triangleSize * Math.sin(triangleAngle + Math.PI / 6)
  );

  ctx.closePath();
  ctx.fillStyle = "red";
  ctx.fill();

  // Red dot at 927°C
  const dotAngle = (12) * Math.PI / 180;
  const dotX = centerX + radius * Math.cos(dotAngle);
  const dotY = centerY + radius * Math.sin(dotAngle);
  ctx.beginPath();
  ctx.arc(dotX, dotY, 4, 0, 2 * Math.PI); // Small red dot
  ctx.fillStyle = "red";
  ctx.fill();

  // Draw digital readout box (centered)
  const boxWidth = 80;  // Adjusted to make it slightly larger and more modern
  const boxHeight = 30;  // Increased height for a more sleek look
  ctx.fillStyle = "#000000";  // Black background to match the modern look
  ctx.fillRect(centerX - boxWidth / 2, centerY + radius / 3, boxWidth, boxHeight); // Centered horizontally below the gauge

  // Draw white border around the box
  ctx.strokeStyle = "#ffffff";  // White border for contrast
  ctx.lineWidth = 2;  // Thicker border to give it a modern look
  ctx.strokeRect(centerX - boxWidth / 2, centerY + radius / 3, boxWidth, boxHeight);

  // Set font style for the digital readout
  ctx.fillStyle = "#ffffff";  // White text to contrast the black background
  ctx.font = "28px 'Arial', monospace";  // Bold, digital-looking monospace font for modern look
  ctx.textAlign = "center";  // Center the text horizontally
  ctx.textBaseline = "middle";  // Vertically align text in the middle

  // Draw the temperature value (centered inside the box)
  ctx.fillText(temperature, centerX, centerY + radius / 3 + boxHeight / 1.8); // Perfectly centered in the box
};

const drawNgGauge = (ctx, ngValue) => {
  const centerX = 150;
  const centerY = 150;
  const radius = 90;

  // Clear the canvas
  ctx.clearRect(0, 0, 300, 300);

  // Draw background
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 20, 0, 2 * Math.PI);
  ctx.fillStyle = "#101010";  // Dark outer ring
  ctx.fill();
  ctx.closePath();

  // Inner ring
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.fillStyle = "#202020";
  ctx.fill();
  ctx.closePath();

  // Optional highlight ring
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 10, 0, 2 * Math.PI);
  ctx.strokeStyle = "#404040";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.closePath();

  // Add 'NG' and 'RPM X 100' text in the center of the gauge
  ctx.fillStyle = "white";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.fillText("%N1", centerX, centerY - 22);

  // Draw altimeter-style needle
  const needleAngle = getN1Angle(ngValue); // Use the ngValue and map it to the correct angle

  // Needle parameters
  const needleLength = radius * .9; // Length of the needle (80% of the radius)
  const needleBaseWidth = 12; // Base width of the needle (to make it wide near the center)
  const needleTipWidth = 2; // Width at the tip for a sharp point

  // Calculate the needle's tip (end point)
  const needleX = centerX + needleLength * Math.cos(needleAngle);
  const needleY = centerY + needleLength * Math.sin(needleAngle);

  // Calculate the angle offset for the width of the needle
  const offsetAngle = Math.PI / 2; // 90 degrees to calculate the perpendicular width

  // Calculate the left and right base of the needle (near the center)
  const baseLeftX = centerX + (needleBaseWidth / 2) * Math.cos(needleAngle + offsetAngle);
  const baseLeftY = centerY + (needleBaseWidth / 2) * Math.sin(needleAngle + offsetAngle);
  const baseRightX = centerX + (needleBaseWidth / 2) * Math.cos(needleAngle - offsetAngle);
  const baseRightY = centerY + (needleBaseWidth / 2) * Math.sin(needleAngle - offsetAngle);

  // Draw the needle arm (as a triangle shape)
  ctx.beginPath();
  ctx.moveTo(baseLeftX, baseLeftY); // Left side of the base
  ctx.lineTo(needleX, needleY); // Connect to the needle tip
  ctx.lineTo(baseRightX, baseRightY); // Right side of the base
  ctx.closePath();
  ctx.fillStyle = "white"; // Needle color
  ctx.fill();

  // Draw circular needle base (black circle at the center)
  const baseRadius = 10; // Adjust based on the desired appearance
  ctx.beginPath();
  ctx.arc(centerX, centerY, baseRadius, 0, 2 * Math.PI); // Circular base at center
  ctx.fillStyle = "black"; // Set the base color to black
  ctx.fill();
  ctx.closePath();

  // Optional: Draw white border around the black base (for the circular outline)
  ctx.beginPath();
  ctx.arc(centerX, centerY, baseRadius, 0, 2 * Math.PI);
  ctx.strokeStyle = "white"; // Set the border color to white
  ctx.lineWidth = 2; // Adjust the thickness of the border
  ctx.stroke();
  ctx.closePath();

  // Define tick angles and labels, rotated counterclockwise by 45 degrees
  const tickAngles = [
    { angle: 186-35, label: "0" },   // 0% N1 
    { angle: 193-35, label: "" },    // 5% N1
    { angle: 200-35, label: "10" },   // 10% N1
    { angle: 207-35, label: "" },    // 15% N1
    { angle: 214-35, label: "20" },   // 20% N1
    { angle: 221-35, label: "" },    // 25% N1
    { angle: 228-35, label: "30" },   // 30% N1
    { angle: 235-35, label: "" },    // 35% N1
    { angle: 242-35, label: "40" },   // 40% N1
    { angle: 249-35, label: "" },    // 45% N1
    { angle: 256-35, label: "50" },   // 50% N1
    { angle: 270-35, label: "" },   // 55% N1
    { angle: 284-35, label: "60" },   // 60% N1
    { angle: 298-35, label: "" },    // 65% N1
    { angle: 312-35, label: "70" },    // 70% N1
    { angle: 326-35, label: "" },    // 75% N1
    { angle: 340-35, label: "80" },   // 80% N1
    { angle: 354-35, label: "" },    // 85% N1
    { angle: 8-35, label: "90" },    // 90% N1
    { angle: 22-35, label: "" },    // 95% N1
    { angle: 36-35, label: "100" },   // 100% N1
    { angle: 50-35, label: "" },   // 105% N1
    { angle: 64-35, label: "110" } // 110% N1
  ];

  // Draw ticks
  tickAngles.forEach(({ angle, label }, index) => {
    const rad = (angle * Math.PI) / 180;

    // Check if it's a main or intermediate tick
    const isMainTick = label !== ""; // Main ticks have labels

    // Set tick length based on main or intermediate tick
    const tickStartRadius = 0.8 * radius; // Same inner radius
    const tickEndRadius = isMainTick ? radius : .95 * radius; // Shorter for intermediate ticks

    // Calculate tick start and end positions
    const xStart = centerX + tickStartRadius * Math.cos(rad);
    const yStart = centerY + tickStartRadius * Math.sin(rad);
    const xEnd = centerX + tickEndRadius * Math.cos(rad);
    const yEnd = centerY + tickEndRadius * Math.sin(rad);

    // Draw tick
    ctx.beginPath();
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xEnd, yEnd);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    // Draw labels for main ticks only
    if (label) {
      // Position label inside the tick, closer to the center (inner circumference)
      const labelRadius = radius * .70;  // Inner radius for labels (adjust as needed)
      const labelX = centerX + labelRadius * Math.cos(rad);  // Calculate label X position
      const labelY = centerY + labelRadius * Math.sin(rad);  // Calculate label Y position

      ctx.fillStyle = "white";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";  // Center the label horizontally
      ctx.fillText(label, labelX, labelY + 1.5);  // Adjust Y slightly for better centering
    }
  });

    // Enhanced arcs with gradient strokes
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 15, (257.4 * Math.PI) / 180, (15 * Math.PI) / 180);
    const greenGradient = ctx.createLinearGradient(0, 0, 300, 0);
    greenGradient.addColorStop(0, "lime");
    greenGradient.addColorStop(1, "lime");
    ctx.strokeStyle = greenGradient;
    ctx.lineWidth = 12;
    ctx.stroke();
    ctx.closePath();

    // Red tick at 105% N1
    const redTickAngle = (15) * Math.PI / 180;
    ctx.beginPath();
    const xStartRed = centerX + radius * 0.75 * Math.cos(redTickAngle);
    const yStartRed = centerY + radius * 0.75 * Math.sin(redTickAngle);
    const xEndRed = centerX + radius * Math.cos(redTickAngle);
    const yEndRed = centerY + radius * Math.sin(redTickAngle);
    ctx.moveTo(xStartRed, yStartRed);
    ctx.lineTo(xEndRed, yEndRed);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3; // Slightly longer red tick
    ctx.stroke();
    ctx.closePath();


    // Draw digital readout box (centered)
    const boxWidth = 80;  // Adjusted to make it slightly larger and more modern
    const boxHeight = 30;  // Increased height for a more sleek look
    ctx.fillStyle = "#000000";  // Black background to match the modern look
    ctx.fillRect(centerX - boxWidth / 2, centerY + radius / 3, boxWidth, boxHeight); // Centered horizontally below the gauge
  
    // Draw white border around the box
    ctx.strokeStyle = "#ffffff";  // White border for contrast
    ctx.lineWidth = 2;  // Thicker border to give it a modern look
    ctx.strokeRect(centerX - boxWidth / 2, centerY + radius / 3, boxWidth, boxHeight);
  
    // Set font style for the digital readout
    ctx.fillStyle = "#ffffff";  // White text to contrast the black background
    ctx.font = "28px 'Arial', monospace";  // Bold, digital-looking monospace font for modern look
    ctx.textAlign = "center";  // Center the text horizontally
    ctx.textBaseline = "middle";  // Vertically align text in the middle
  
    // Draw the ngValue value (centered inside the box)
    ctx.fillText(ngValue, centerX, centerY + radius / 3 + boxHeight / 1.8); // Perfectly centered in the box
};

const drawBatteryGauge = (ctx, voltage) => {
  const width = 300;
  const height = 150;
  const gaugeX = 75; // X position of the rectangle (centered within canvas width)
  const gaugeY = 50; // Y position of the rectangle
  const gaugeWidth = 150; // Width of the battery display box
  const gaugeHeight = 50; // Height of the battery display box

  // Clear the canvas
  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;

  // Draw background rectangle for the gauge (main battery box)
  ctx.beginPath();
  ctx.rect(gaugeX, gaugeY, gaugeWidth, gaugeHeight);
  ctx.fillStyle = "#202020"; // Dark background color for the inner recessed area
  ctx.fill();
  ctx.closePath();

  // Add a 3D effect with an outer rectangle and beveled edges
  ctx.beginPath();
  ctx.rect(gaugeX - 10, gaugeY - 10, gaugeWidth + 20, gaugeHeight + 20); // Larger outer box for the 3D effect
  ctx.fillStyle = "#101010"; // Darker black/gray for the outer box
  ctx.fill();
  ctx.closePath();

  // Draw a highlight line to simulate the beveled edge
  ctx.beginPath();
  ctx.rect(gaugeX - 5, gaugeY - 5, gaugeWidth + 10, gaugeHeight + 10); // Highlight closer to the center
  ctx.strokeStyle = "#404040"; // Slightly lighter shade for the highlight
  ctx.lineWidth = 4; // Thicker line for the highlight effect
  ctx.stroke();
  ctx.closePath();

  // Add border around the gauge box
  ctx.beginPath();
  ctx.rect(gaugeX, gaugeY, gaugeWidth, gaugeHeight); // Inner rectangle for the gauge box
  ctx.strokeStyle = "#ffffff"; // White border for contrast
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.closePath();

  // Draw the digital readout in the center of the box
  ctx.fillStyle = "#ffffff"; // White text color for the voltage
  ctx.font = "28px 'Arial', monospace"; // Bold, digital-style font
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${voltage.toFixed(1)} V`, gaugeX + gaugeWidth / 2, gaugeY + gaugeHeight / 2);
};

const getNeedleAngle = (temperature) => {
  // Define temperature-angle mapping (with corresponding temperatures from the tickAngles)
  const tempAngleMap = [
    { temp: 0, angle: (186 - 28) * Math.PI / 180 },    // 0°C
    { temp: 50, angle: (193 - 28) * Math.PI / 180 },   // 50°C
    { temp: 100, angle: (200 - 28) * Math.PI / 180 },  // 100°C
    { temp: 150, angle: (207 - 28) * Math.PI / 180 },  // 150°C
    { temp: 200, angle: (214 - 28) * Math.PI / 180 },  // 200°C
    { temp: 250, angle: (221 - 28) * Math.PI / 180 },  // 250°C
    { temp: 300, angle: (228 - 28) * Math.PI / 180 },  // 300°C
    { temp: 350, angle: (235 - 28) * Math.PI / 180 },  // 350°C
    { temp: 400, angle: (242 - 28) * Math.PI / 180 },  // 400°C
    { temp: 450, angle: (249 - 28) * Math.PI / 180 },  // 450°C
    { temp: 500, angle: (256 - 28) * Math.PI / 180 },  // 500°C
    { temp: 550, angle: (263 - 28) * Math.PI / 180 },  // 550°C
    { temp: 600, angle: (270 - 28) * Math.PI / 180 },  // 600°C
    { temp: 650, angle: (277 - 28) * Math.PI / 180 },  // 650°C
    { temp: 700, angle: (284 - 28) * Math.PI / 180 },  // 700°C
    { temp: 725, angle: (298 - 28) * Math.PI / 180 },  // 725°C
    { temp: 750, angle: (312 - 28) * Math.PI / 180 },  // 750°C
    { temp: 775, angle: (326 - 28) * Math.PI / 180 },  // 775°C
    { temp: 800, angle: (340 - 28) * Math.PI / 180 },  // 800°C
    { temp: 825, angle: (326) * Math.PI / 180 },  // 825°C
    { temp: 850, angle: (340) * Math.PI / 180 },    // 850°C
    { temp: 875, angle: (354) * Math.PI / 180 },   // 875°C
    { temp: 900, angle: (368) * Math.PI / 180},   // 900°C
    { temp: 1000, angle: (382) * Math.PI / 180}   // 1000°C
  ];

  // Find the correct interval and interpolate the angle
  for (let i = 0; i < tempAngleMap.length - 1; i++) {
    const lower = tempAngleMap[i];
    const upper = tempAngleMap[i + 1];

    if (temperature >= lower.temp && temperature <= upper.temp) {
      // Interpolate between the lower and upper angle based on the temperature
      const ratio = (temperature - lower.temp) / (upper.temp - lower.temp);
      return lower.angle + ratio * (upper.angle - lower.angle);
    }
  }

  // If temperature is out of bounds, clamp to the min or max angle
  if (temperature < 0) return tempAngleMap[0].angle;    // 0°C
  if (temperature > 1000) return tempAngleMap[tempAngleMap.length - 1].angle; // 1000°C
};

const getN1Angle = (ngValue) => {
  // Define N1 percentage to angle mapping (similar to your tick angles)
  const ngAngleMap = [
    { ng: 0, angle: (186 - 35) * Math.PI / 180 },   // 0% N1
    { ng: 10, angle: (200 - 35) * Math.PI / 180 },  // 10% N1
    { ng: 20, angle: (214 - 35) * Math.PI / 180 },  // 20% N1
    { ng: 30, angle: (228 - 35) * Math.PI / 180 },  // 30% N1
    { ng: 40, angle: (242 - 35) * Math.PI / 180 },  // 40% N1
    { ng: 50, angle: (256 - 35) * Math.PI / 180 },  // 50% N1
    { ng: 60, angle: (284 - 35) * Math.PI / 180 },  // 60% N1
    { ng: 70, angle: (312 - 35) * Math.PI / 180 },  // 70% N1
    { ng: 80, angle: (340 - 35) * Math.PI / 180 },  // 80% N1
    { ng: 90, angle: (368 - 35) * Math.PI / 180 },    // 90% N1
    { ng: 100, angle: (396 - 35) * Math.PI / 180 },  // 100% N1
    { ng: 110, angle: (424 - 35) * Math.PI / 180 },  // 110% N1
  ];

  // Find the correct interval and interpolate the angle
  for (let i = 0; i < ngAngleMap.length - 1; i++) {
    const lower = ngAngleMap[i];
    const upper = ngAngleMap[i + 1];

    if (ngValue >= lower.ng && ngValue <= upper.ng) {
      // Interpolate between the lower and upper angle based on the NG percentage
      const ratio = (ngValue - lower.ng) / (upper.ng - lower.ng);
      return lower.angle + ratio * (upper.angle - lower.angle);
    }
  }

  // If NG value is out of bounds, clamp to the min or max angle
  if (ngValue < 0) return ngAngleMap[0].angle;    // 0% N1
  if (ngValue > 110) return ngAngleMap[ngAngleMap.length - 1].angle; // 110% N1
};

const TemperatureGauge = () => {
  const tempCanvasRef = useRef(null);
  const ngCanvasRef = useRef(null); // New ref for NG gauge
  const batteryCanvasRef = useRef(null); // New ref for Battery gauge
  const [temperature, setTemperature] = useState(0);
  const [ngValue, setNgValue] = useState(0); // State for NG value
  const [voltage, setVoltage] = useState(12); // State for battery voltage (default at 12V)

  // UseEffect for the temperature gauge
  useEffect(() => {
    const tempCanvas = tempCanvasRef.current;
    const tempCtx = tempCanvas.getContext("2d");
    drawGauge(tempCtx, temperature);
  }, [temperature]);

  // UseEffect for the NG gauge
  useEffect(() => {
    const ngCanvas = ngCanvasRef.current;
    const ngCtx = ngCanvas.getContext("2d");
    drawNgGauge(ngCtx, ngValue);
  }, [ngValue]);

  // UseEffect for the battery voltage gauge
  useEffect(() => {
    const batteryCanvas = batteryCanvasRef.current;
    const batteryCtx = batteryCanvas.getContext("2d");
    drawBatteryGauge(batteryCtx, voltage);
  }, [voltage]);

  const handleTemperatureChange = (e) => {
    setTemperature(e.target.value);
  };

  const handleNgChange = (e) => {
    setNgValue(e.target.value);
  };

  const handleVoltageChange = (e) => {
    setVoltage(parseFloat(e.target.value)); // Convert the slider value to a number
  };

  return (
    <div className="gauge-container">
      <div className="gauges">
        {/* Temperature Gauge */}
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

export default TemperatureGauge;