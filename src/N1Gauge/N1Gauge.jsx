const N1Gauge = (ctx, ngValue) => {
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
    // Draw the ngValue value (centered inside the box)
    ctx.fillText(ngValue.toFixed(1), centerX, centerY + radius / 3 + boxHeight / 1.8); // Always show one decimal place
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

export default N1Gauge;