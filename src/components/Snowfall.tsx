import React from 'react';
import '@/styles/christmas.css';

const Snowflake = ({ style }: { style: React.CSSProperties }) => {
  return <div className="snowflake" style={style}></div>;
};

const Snowfall = () => {
  const snowflakeCount = 150; // Number of snowflakes
  const snowflakes = Array.from({ length: snowflakeCount }).map((_, index) => {
    const style = {
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 3 + 1}px`,
      height: `${Math.random() * 3 + 1}px`,
      animationDelay: `${Math.random() * 10}s`,
      animationDuration: `${Math.random() * 5 + 5}s`,
      opacity: Math.random() * 0.5 + 0.3,
    };
    return <Snowflake key={index} style={style} />;
  });

  return <div className="snowfall">{snowflakes}</div>;
};

export default Snowfall;