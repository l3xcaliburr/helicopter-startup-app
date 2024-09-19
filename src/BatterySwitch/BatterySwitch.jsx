import React, { useState } from 'react';
import styled from 'styled-components';

// Container for the entire switch component, maintaining aspect ratio
const SwitchContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 15%;
  height: 15%;
  background-color: black;
  border-radius: 2px;
  position: relative;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  max-width: 100%; /* Ensure responsiveness */
  aspect-ratio: 1 / 2; /* Maintain 1:2 aspect ratio */
`;

// The actual red rocker switch
const RockerSwitch = styled.div`
  width: 60%;
  height: 45%;
  background-color: ${(props) => (props.on ? '#ff0000' : '#ff0000')};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  cursor: pointer;
  position: absolute;
  top: ${(props) => (props.on ? '10%' : 'calc(100% - 55%)')};
  transition: top 0.2s ease-in-out;
  user-select: none;
  color: white;
  font-size: calc(1vw + 1vh); /* Scales the font size based on viewport dimensions */
  font-weight: bold;
`;

const BatterySwitch = ({ onToggle }) => {
  const [isOn, setIsOn] = useState(false);

  // Toggles the switch on or off
  const toggleSwitch = () => {
    setIsOn(!isOn);
    if (onToggle) {
      onToggle(!isOn); // Call the parent handler if provided
    }
  };

  return (
    <SwitchContainer onClick={toggleSwitch}>
      <RockerSwitch on={isOn}>{isOn ? 'I' : 'O'}</RockerSwitch>
    </SwitchContainer>
  );
};

export default BatterySwitch;