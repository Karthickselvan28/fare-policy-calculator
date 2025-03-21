import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { FarePolicy } from "../types/fare";
import { calculateFare } from "../utils/fareCalculator";

interface SavedPolicy {
  name: string;
  policy: FarePolicy;
  timestamp: string;
}

const Compare: React.FC = () => {
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [savedPolicies, setSavedPolicies] = useState<SavedPolicy[]>(() => {
    const saved = localStorage.getItem("savedPolicies");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedPolicies, setSelectedPolicies] = useState<SavedPolicy[]>(
    () => {
      const saved = localStorage.getItem("selectedPoliciesForCompare");
      return saved ? JSON.parse(saved) : [];
    }
  );
  const [tempSelectedPolicies, setTempSelectedPolicies] = useState<
    SavedPolicy[]
  >([]);

  // Update localStorage whenever selectedPolicies changes
  useEffect(() => {
    if (selectedPolicies.length > 0) {
      localStorage.setItem(
        "selectedPoliciesForCompare",
        JSON.stringify(selectedPolicies)
      );
    } else {
      localStorage.removeItem("selectedPoliciesForCompare");
    }
  }, [selectedPolicies]);

  const handleLoadDialogOpen = () => {
    setTempSelectedPolicies([]);
    setLoadDialogOpen(true);
  };

  const handlePolicyToggle = (policy: SavedPolicy) => {
    setTempSelectedPolicies((prev) => {
      const isSelected = prev.some((p) => p.name === policy.name);
      if (isSelected) {
        return prev.filter((p) => p.name !== policy.name);
      } else if (prev.length < 2) {
        return [...prev, policy];
      }
      return prev;
    });
  };

  const handleConfirmSelection = () => {
    setSelectedPolicies(tempSelectedPolicies);
    setLoadDialogOpen(false);
  };

  const handleClearSelection = () => {
    setSelectedPolicies([]);
    localStorage.removeItem("selectedPoliciesForCompare");
  };

  const getPolicyDifferences = () => {
    if (selectedPolicies.length !== 2) return null;

    return {
      base: [
        { field: "City", values: selectedPolicies.map((p) => p.policy.city) },
        {
          field: "Variant",
          values: selectedPolicies.map((p) => p.policy.variant),
        },
        { field: "Area", values: selectedPolicies.map((p) => p.policy.area) },
        {
          field: "Base Kilometers",
          values: selectedPolicies.map((p) => p.policy.baseKilometers),
        },
        {
          field: "Base Fare (₹)",
          values: selectedPolicies.map((p) => p.policy.baseFare),
        },
        {
          field: "Per Extra KM Charge (₹)",
          values: selectedPolicies.map((p) => p.policy.perExtraKmCharge),
        },
        {
          field: "Pickup Charges (₹)",
          values: selectedPolicies.map((p) => p.policy.pickupCharges),
        },
        {
          field: "Congestion %",
          values: selectedPolicies.map((p) => p.policy.congestionPercentage),
        },
      ],
      thresholds: selectedPolicies.map((p) => p.policy.thresholdFares),
    };
  };

  const calculateFareForDistance = (policy: FarePolicy, distance: number) => {
    return calculateFare(distance, policy);
  };

  const generateFareComparisonData = () => {
    if (selectedPolicies.length !== 2) return [];

    const distances = Array.from({ length: 50 }, (_, i) => i + 1);
    return distances.map((distance) => {
      const fare1 = calculateFareForDistance(
        selectedPolicies[0].policy,
        distance
      );
      const fare2 = calculateFareForDistance(
        selectedPolicies[1].policy,
        distance
      );
      const difference = fare2 - fare1;
      const farePerKm1 = fare1 / distance;
      const farePerKm2 = fare2 / distance;
      const farePerKmDifference = farePerKm2 - farePerKm1;

      return {
        distance,
        fare1,
        fare2,
        difference,
        farePerKm1,
        farePerKm2,
        farePerKmDifference,
      };
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Compare Fare Policies</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          {selectedPolicies.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearSelection}
            >
              Clear Selection
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<FolderOpenIcon />}
            onClick={handleLoadDialogOpen}
          >
            Load Fare Policy
          </Button>
        </Box>
      </Box>

      {/* Selected Policies */}
      {selectedPolicies.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Selected Policies</Typography>
            <Button size="small" color="error" onClick={handleClearSelection}>
              Clear Selection
            </Button>
          </Box>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {selectedPolicies.map((policy, index) => (
              <Paper
                key={index}
                sx={{
                  p: 2,
                  flex: 1,
                  minWidth: 300,
                  position: "relative",
                  bgcolor: "background.default",
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  {policy.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {policy.policy.city} - {policy.policy.variant} -{" "}
                  {policy.policy.area}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {policy.policy.description}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Paper>
      )}

      {/* Comparison Table */}
      {selectedPolicies.length === 2 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Policy Comparison
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Parameter</TableCell>
                  {selectedPolicies.map((policy, index) => (
                    <TableCell key={index} align="right">
                      {policy.name}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {getPolicyDifferences()?.base.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.field}</TableCell>
                    {row.values.map((value, i) => (
                      <TableCell key={i} align="right">
                        {value}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3}>
                    <Divider sx={{ my: 1 }} />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Threshold Fares</TableCell>
                  {selectedPolicies.map((policy, index) => (
                    <TableCell key={index} align="right">
                      {policy.policy.thresholdFares
                        .map((t) => `${t.threshold}km: ₹${t.charge}`)
                        .join(", ") || "None"}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Policy Parameters Comparison Table */}
      {selectedPolicies.length === 2 && (
        <>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Policy Parameters Comparison
            </Typography>
            <TableContainer>
              <Table size="small">
                {/* ... existing policy parameters table ... */}
              </Table>
            </TableContainer>
          </Paper>

          {/* Fare Comparison Table */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Fare Comparison by Distance
            </Typography>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Distance (km)</TableCell>
                    <TableCell align="right">
                      {selectedPolicies[0].name} Fare (₹)
                    </TableCell>
                    <TableCell align="right">
                      {selectedPolicies[1].name} Fare (₹)
                    </TableCell>
                    <TableCell align="right">Difference (₹)</TableCell>
                    <TableCell align="right">
                      {selectedPolicies[0].name} Fare/km (₹/km)
                    </TableCell>
                    <TableCell align="right">
                      {selectedPolicies[1].name} Fare/km (₹/km)
                    </TableCell>
                    <TableCell align="right">
                      Fare/km Difference (₹/km)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {generateFareComparisonData().map((row) => (
                    <TableRow
                      key={row.distance}
                      sx={{
                        "&:nth-of-type(odd)": {
                          backgroundColor: "action.hover",
                        },
                      }}
                    >
                      <TableCell>{row.distance}</TableCell>
                      <TableCell align="right">
                        {row.fare1.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {row.fare2.toFixed(2)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color:
                            row.difference > 0
                              ? "success.main"
                              : row.difference < 0
                              ? "error.main"
                              : "text.primary",
                        }}
                      >
                        {row.difference.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {row.farePerKm1.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {row.farePerKm2.toFixed(2)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color:
                            row.farePerKmDifference > 0
                              ? "success.main"
                              : row.farePerKmDifference < 0
                              ? "error.main"
                              : "text.primary",
                        }}
                      >
                        {row.farePerKmDifference.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {/* Updated Load Policy Dialog */}
      <Dialog
        open={loadDialogOpen}
        onClose={() => setLoadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Select Two Fare Policies to Compare</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select exactly two policies to compare
          </Typography>
          <List>
            {savedPolicies.map((savedPolicy, index) => (
              <ListItem
                key={index}
                disablePadding
                sx={{
                  bgcolor: tempSelectedPolicies.some(
                    (p) => p.name === savedPolicy.name
                  )
                    ? "action.selected"
                    : "transparent",
                }}
              >
                <ListItemButton
                  onClick={() => handlePolicyToggle(savedPolicy)}
                  disabled={
                    tempSelectedPolicies.length >= 2 &&
                    !tempSelectedPolicies.some(
                      (p) => p.name === savedPolicy.name
                    )
                  }
                >
                  <Checkbox
                    edge="start"
                    checked={tempSelectedPolicies.some(
                      (p) => p.name === savedPolicy.name
                    )}
                    onChange={() => handlePolicyToggle(savedPolicy)}
                    disabled={
                      tempSelectedPolicies.length >= 2 &&
                      !tempSelectedPolicies.some(
                        (p) => p.name === savedPolicy.name
                      )
                    }
                  />
                  <ListItemText
                    primary={savedPolicy.name}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          {savedPolicy.policy.city} -{" "}
                          {savedPolicy.policy.variant} -{" "}
                          {savedPolicy.policy.area}
                        </Typography>
                        <br />
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          {savedPolicy.policy.description}
                        </Typography>
                        <br />
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          Saved on: {savedPolicy.timestamp}
                        </Typography>
                      </>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
            {savedPolicies.length === 0 && (
              <ListItem>
                <ListItemText primary="No saved policies found" />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoadDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmSelection}
            variant="contained"
            disabled={tempSelectedPolicies.length !== 2}
          >
            Compare Selected Policies
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Compare;
