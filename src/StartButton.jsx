import styled from "styled-components";

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

export default StarterButton;