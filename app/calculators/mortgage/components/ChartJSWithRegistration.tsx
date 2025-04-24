import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Component to register Chart.js elements
const ChartJSWithRegistration = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  
  useEffect(() => {
    // Register Chart.js components only on client side
    ChartJS.register(
      ArcElement,       // Required for pie charts
      LineElement,      // Required for line charts
      BarElement,       // Required for bar charts
      PointElement,     // Required for scatter and line charts
      CategoryScale,    // Required for bar and line charts
      LinearScale,      // Required for most charts
      LogarithmicScale, // For log scales
      Title,            // For chart titles
      Tooltip,          // For tooltips
      Legend            // For legends
    );
    
    // Register datalabels plugin
    ChartJS.register(ChartDataLabels);
    
    setIsRegistered(true);
  }, []);
  
  return null; // This component doesn't render anything
};

export default ChartJSWithRegistration;