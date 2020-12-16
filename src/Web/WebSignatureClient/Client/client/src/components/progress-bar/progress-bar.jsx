import React from 'react';

const ProgressBar = (props) => {
    const { completed } = props;
  
    const containerStyles = {
      height: 20,
      width: '100%',
      backgroundColor: "#B2B2B4",
      borderRadius: 50
    }
  
    const fillerStyles = {
      height: '100%',
      width: `${completed}%`,
      backgroundColor: '#001970',
      borderRadius: 'inherit',
      textAlign: 'right'
    }
  
    const labelStyles = {
      padding: 5,
      color: 'white',
      fontWeight: 'bold'
    }
  
    return (
      <div style={containerStyles}>
        <div style={fillerStyles}>
          <span style={labelStyles}></span>
        </div>
      </div>
    );
  };
  
export default ProgressBar;