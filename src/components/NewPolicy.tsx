import React from "react";
import {
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { FarePolicy, ThresholdFare } from "../types/fare";

interface NewPolicyProps {
  policy: FarePolicy;
  onPolicyChange: (field: keyof FarePolicy, value: number) => void;
  onAddThreshold: () => void;
  onThresholdChange: (
    index: number,
    field: keyof ThresholdFare,
    value: number
  ) => void;
  onRemoveThreshold: (index: number) => void;
}

const NewPolicy: React.FC<NewPolicyProps> = ({
  policy,
  onPolicyChange,
  onAddThreshold,
  onThresholdChange,
  onRemoveThreshold,
}) => {
  return (
    <Box>
      <Paper sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">New Policy</Typography>
          <Button variant="contained" color="primary" onClick={onAddThreshold}>
            Add Threshold Fare
          </Button>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Pickup Charges (₹)"
              type="number"
              value={policy.pickupCharges}
              onChange={(e) =>
                onPolicyChange("pickupCharges", Number(e.target.value))
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Base Kilometers"
              type="number"
              value={policy.baseKilometers}
              onChange={(e) =>
                onPolicyChange("baseKilometers", Number(e.target.value))
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Base Fare (₹)"
              type="number"
              value={policy.baseFare}
              onChange={(e) =>
                onPolicyChange("baseFare", Number(e.target.value))
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Per Extra KM Charge (₹)"
              type="number"
              value={policy.perExtraKmCharge}
              onChange={(e) =>
                onPolicyChange("perExtraKmCharge", Number(e.target.value))
              }
            />
          </Grid>
          {policy.thresholdFares.map((threshold, index) => (
            <React.Fragment key={index}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label={`Threshold ${index + 1} Distance (km)`}
                  type="number"
                  value={threshold.threshold}
                  onChange={(e) =>
                    onThresholdChange(
                      index,
                      "threshold",
                      Number(e.target.value)
                    )
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TextField
                    fullWidth
                    label={`Threshold ${index + 1} Charge (₹)`}
                    type="number"
                    value={threshold.charge}
                    onChange={(e) =>
                      onThresholdChange(index, "charge", Number(e.target.value))
                    }
                  />
                  <IconButton
                    color="error"
                    onClick={() => onRemoveThreshold(index)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Grid>
            </React.Fragment>
          ))}
        </Grid>
      </Paper>

      {/* Peak Time Fare Settings */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          New Peak Time Fare Settings
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="New Congestion Percentage (%)"
              type="number"
              value={policy.congestionPercentage}
              onChange={(e) =>
                onPolicyChange("congestionPercentage", Number(e.target.value))
              }
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default NewPolicy;
