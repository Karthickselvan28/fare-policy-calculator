import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const Home: React.FC = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: "0 auto" }}>
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <img
          src="/namma-yatri-logo.png"
          alt="Namma Yatri Logo"
          style={{
            width: "300px",
            height: "auto",
            objectFit: "contain",
          }}
        />
      </Box>

      <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 500 }}>
          Welcome to Fare Policy Calculator
        </Typography>

        <Typography variant="body1" paragraph>
          The Fare Policy Calculator is a comprehensive tool designed to help
          manage and analyze fare policies for Namma Yatri. This tool enables
          you to create, compare, and optimize fare structures efficiently.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
          Key Features:
        </Typography>

        <Typography component="div" sx={{ mb: 3 }}>
          <ul>
            <li>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Working Tab:</strong> Create and modify fare policies
                with real-time visualization of fare calculations.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Compare Tab:</strong> Analyze multiple fare policies
                side by side to understand their differences and impact.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Saved Policies Tab:</strong> Access your library of
                saved fare policies for quick reference and reuse.
              </Typography>
            </li>
          </ul>
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
          Features Include:
        </Typography>

        <Typography component="div">
          <ul>
            <li>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Base fare and per-kilometer rate configuration
              </Typography>
            </li>
            <li>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Peak time fare adjustments
              </Typography>
            </li>
            <li>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Threshold-based fare calculations
              </Typography>
            </li>
            <li>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Visual fare comparisons and analytics
              </Typography>
            </li>
            <li>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Policy storage and management
              </Typography>
            </li>
          </ul>
        </Typography>

        <Typography variant="body1" sx={{ mt: 4 }} color="text.secondary">
          To get started, navigate to the Working tab to create your first fare
          policy, or explore existing policies in the Saved Policies tab.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Home;
