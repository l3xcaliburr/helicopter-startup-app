const VoltageMeter = (ctx, voltage) => {
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
}


export default VoltageMeter;