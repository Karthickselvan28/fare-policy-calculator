import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import { FarePolicy, SavedPolicy } from "../types/fare";
import { loadPolicies, savePolicies } from "../utils/policyStorage";

const SavedPolicies: React.FC = () => {
  const [savedPolicies, setSavedPolicies] = useState<SavedPolicy[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<SavedPolicy | null>(
    null
  );
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching policies in SavedPolicies component...");
        const policies = await loadPolicies();
        console.log("Fetched policies:", policies);
        setSavedPolicies(policies);
      } catch (err) {
        console.error("Error loading policies:", err);
        setError("Failed to load saved policies. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  const handleDeletePolicy = async (index: number) => {
    try {
      const updatedPolicies = savedPolicies.filter((_, i) => i !== index);
      console.log("Deleting policy at index:", index);
      console.log("Updated policies:", updatedPolicies);
      await savePolicies(updatedPolicies);
      setSavedPolicies(updatedPolicies);
    } catch (err) {
      console.error("Error deleting policy:", err);
      setError("Failed to delete policy. Please try again later.");
    }
  };

  const handleShowDetails = (policy: SavedPolicy) => {
    setSelectedPolicy(policy);
    setDetailsDialogOpen(true);
  };

  const formatValue = (value: number): string => {
    return value.toFixed(2);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom color="error">
          Error
        </Typography>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Saved Fare Policies
      </Typography>

      <Paper sx={{ mt: 2 }}>
        <List>
          {savedPolicies.map((policy, index) => (
            <ListItem
              key={index}
              divider
              secondaryAction={
                <Box>
                  <IconButton
                    edge="end"
                    onClick={() => handleShowDetails(policy)}
                    sx={{ mr: 1 }}
                  >
                    <InfoIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDeletePolicy(index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={policy.name}
                secondary={
                  <>
                    <Typography component="span" variant="body2">
                      {policy.policy.city} - {policy.policy.variant} -{" "}
                      {policy.policy.area}
                    </Typography>
                    <br />
                    <Typography variant="body2" color="text.secondary">
                      {policy.policy.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Saved on: {policy.timestamp}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
          {savedPolicies.length === 0 && (
            <ListItem>
              <ListItemText
                primary="No saved policies found"
                secondary="Save a policy from the Working tab to see it here"
              />
            </ListItem>
          )}
        </List>
      </Paper>

      {/* Policy Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{selectedPolicy?.name} - Policy Details</DialogTitle>
        <DialogContent>
          {selectedPolicy && (
            <>
              <Typography variant="body2" paragraph>
                {selectedPolicy.policy.description}
              </Typography>
              <Typography variant="caption" color="text.secondary" paragraph>
                Saved on: {selectedPolicy.timestamp}
              </Typography>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Parameter</TableCell>
                      <TableCell align="right">Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>City</TableCell>
                      <TableCell align="right">
                        {selectedPolicy.policy.city}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Vehicle Variant</TableCell>
                      <TableCell align="right">
                        {selectedPolicy.policy.variant}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Area</TableCell>
                      <TableCell align="right">
                        {selectedPolicy.policy.area}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Base Kilometers</TableCell>
                      <TableCell align="right">
                        {formatValue(selectedPolicy.policy.baseKilometers)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Base Fare (₹)</TableCell>
                      <TableCell align="right">
                        {formatValue(selectedPolicy.policy.baseFare)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Per Extra KM Charge (₹)</TableCell>
                      <TableCell align="right">
                        {formatValue(selectedPolicy.policy.perExtraKmCharge)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Pickup Charges (₹)</TableCell>
                      <TableCell align="right">
                        {formatValue(selectedPolicy.policy.pickupCharges)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Congestion Percentage (%)</TableCell>
                      <TableCell align="right">
                        {formatValue(
                          selectedPolicy.policy.congestionPercentage
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Threshold Fares</TableCell>
                      <TableCell align="right">
                        {selectedPolicy.policy.thresholdFares.length > 0
                          ? selectedPolicy.policy.thresholdFares
                              .map(
                                (t) =>
                                  `${formatValue(
                                    t.threshold
                                  )}km: ₹${formatValue(t.charge)}`
                              )
                              .join(", ")
                          : "None"}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SavedPolicies;
