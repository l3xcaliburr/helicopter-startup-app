import React from 'react';
import { Slider, Typography, Box } from '@mui/material';
import { withStyles } from '@mui/styles';

const FuelSlider = withStyles({
  root: {
    color: '#ff6f00',
    height: '100%',
    padding: '0 15px',
  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    marginLeft: -9,
    marginTop: -12,
    '&:focus, &:hover, &$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  valueLabel: {
    top: 'calc(-50% + 12px)',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  track: {
    width: 8,
    borderRadius: 4,
  },
  rail: {
    width: 8,
    borderRadius: 4,
    opacity: 1,
    backgroundColor: '#bfbfbf',
  },
})(Slider);

const FuelControl = ({ value, onChange }) => {
  const getColor = (value) => {
    if (value > 75) return '#4caf50';
    if (value > 50) return '#ffeb3b';
    if (value > 25) return '#ff9800';
    return '#f44336';
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Fuel Flow
      </Typography>
      <FuelSlider
        value={value}
        onChange={onChange}
        aria-labelledby="fuel-flow-slider"
        valueLabelDisplay="auto"
        min={0}
        max={100}
        orientation="vertical"
        sx={{
          color: getColor(value),
          // ...existing styles...
        }}
      />
    </Box>
  );
};

export default FuelControl;