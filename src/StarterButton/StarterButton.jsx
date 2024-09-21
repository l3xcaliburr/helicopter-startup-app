import React, { useEffect, useRef } from "react";

const StarterButton = ({ onMouseDown, onMouseUp, isPressed }) => {
  const canvasRef = useRef(null);

  // Function to draw the button
  const drawButton = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const centerX = 150;
    const centerY = 150;
    const radius = 90;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Outer Circle (button base)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = isPressed
      ? "rgba(128, 0, 0, 1)" // Darker when pressed
      : "rgba(255, 0, 0, 1)"; // Red when not pressed
    ctx.fill();
    ctx.closePath();

    // Inner shadow/highlight ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 10, 0, 2 * Math.PI);
    const gradient = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, radius);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.3)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.1)");
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath();

    // Text inside the button
    ctx.fillStyle = "white";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("START", centerX, centerY + 8); // Center the text
  };

  // Draw the button initially and on state change
  useEffect(() => {
    drawButton();
  }, [isPressed]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={300}
      style={{ cursor: "pointer" }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    />
  );
};

export default StarterButton;