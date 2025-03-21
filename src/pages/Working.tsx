import React from "react";
import { Box, Typography } from "@mui/material";
import FareCalculator from "../components/FareCalculator";

const Working: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Fare Policy Calculator
      </Typography>
      <Typography variant="body1" paragraph>
        Create and modify fare policies with real-time visualization of fare
        calculations.
      </Typography>
      <FareCalculator />
    </Box>
  );
};

export default Working;
