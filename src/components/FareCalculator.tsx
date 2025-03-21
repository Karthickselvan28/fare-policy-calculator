import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FarePolicy,
  ThresholdFare,
  City,
  VehicleVariant,
  Area,
} from "../types/fare";
import { generateFareData } from "../utils/fareCalculator";
import NewPolicy from "./NewPolicy";
import { loadPolicies, savePolicies } from "../utils/policyStorage";

interface SavedPolicy {
  name: string;
  policy: FarePolicy;
  timestamp: string;
}

interface ApiResponse {
  policies: SavedPolicy[];
}

const initialPolicy: FarePolicy = {
  city: "Bangalore",
  variant: "HATCHBACK",
  area: "default",
  description: "",
  baseKilometers: 4,
  baseFare: 110,
  perExtraKmCharge: 19,
  pickupCharges: 20,
  thresholdFares: [],
  congestionPercentage: 10,
};

const initialNewPolicy: FarePolicy = {
  city: "Bangalore",
  variant: "HATCHBACK",
  area: "default",
  description: "",
  baseKilometers: 4,
  baseFare: 110,
  perExtraKmCharge: 19,
  pickupCharges: 20,
  thresholdFares: [],
  congestionPercentage: 10,
};

const FarePolicyConfigs: React.FC<{
  city: City;
  variant: VehicleVariant;
  area: Area;
  description: string;
  onCityChange: (value: City) => void;
  onVariantChange: (value: VehicleVariant) => void;
  onAreaChange: (value: Area) => void;
  onDescriptionChange: (value: string) => void;
}> = ({
  city,
  variant,
  area,
  description,
  onCityChange,
  onVariantChange,
  onAreaChange,
  onDescriptionChange,
}) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Fare Policy Configurations
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel>City</InputLabel>
            <Select
              value={city}
              label="City"
              onChange={(e) => onCityChange(e.target.value as City)}
            >
              <MenuItem value="Bangalore">Bangalore</MenuItem>
              <MenuItem value="Mysore">Mysore</MenuItem>
              <MenuItem value="Tumkur">Tumkur</MenuItem>
              <MenuItem value="Chennai">Chennai</MenuItem>
              <MenuItem value="Trichy">Trichy</MenuItem>
              <MenuItem value="Hyderabad">Hyderabad</MenuItem>
              <MenuItem value="Kolkata">Kolkata</MenuItem>
              <MenuItem value="TamilNaduCities">TamilNaduCities</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel>Vehicle Variant</InputLabel>
            <Select
              value={variant}
              label="Vehicle Variant"
              onChange={(e) =>
                onVariantChange(e.target.value as VehicleVariant)
              }
            >
              <MenuItem value="AUTO_RICKSHAW">Auto Rickshaw</MenuItem>
              <MenuItem value="HATCHBACK">Hatchback</MenuItem>
              <MenuItem value="SEDAN">Sedan</MenuItem>
              <MenuItem value="SUV">SUV</MenuItem>
              <MenuItem value="SUV_PLUS">SUV Plus</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel>Area</InputLabel>
            <Select
              value={area}
              label="Area"
              onChange={(e) => onAreaChange(e.target.value as Area)}
            >
              <MenuItem value="default">Default</MenuItem>
              <MenuItem value="airport">Airport</MenuItem>
              <MenuItem value="railway station">Railway Station</MenuItem>
              <MenuItem value="metro stations">Metro Stations</MenuItem>
              <MenuItem value="hospitals">Hospitals</MenuItem>
              <MenuItem value="parks">Parks</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Policy Description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Enter a description for this fare policy..."
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

const generateDefaultPolicyName = (policy: FarePolicy): string => {
  const cityPrefix = policy.city.slice(0, 3).toUpperCase();
  const variantPrefix = policy.variant.slice(0, 3).toUpperCase();
  const areaPrefix = policy.area.slice(0, 3).toUpperCase();
  return `${cityPrefix}_${variantPrefix}_${areaPrefix}`;
};

const FareCalculator: React.FC = () => {
  const [policy, setPolicy] = useState<FarePolicy>(initialPolicy);
  const [newPolicy, setNewPolicy] = useState<FarePolicy>(initialNewPolicy);
  const [visibleLines, setVisibleLines] = useState({
    baseFarePerKm: false,
    baseFare: true,
    basePeakTimeFare: false,
    basePeakTimeFarePerKm: false,
    newFarePerKm: false,
    newFare: true,
    newPeakTimeFare: false,
    newPeakTimeFarePerKm: false,
  });
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [policyName, setPolicyName] = useState("");
  const [savedPolicies, setSavedPolicies] = useState<SavedPolicy[]>([]);

  useEffect(() => {
    const loadSavedPolicies = async () => {
      try {
        console.log("Loading saved policies in FareCalculator...");
        const response = await loadPolicies();
        console.log("Loaded policies in FareCalculator:", response);

        if (Array.isArray(response)) {
          setSavedPolicies(response);
        } else if (
          response &&
          typeof response === "object" &&
          "policies" in response
        ) {
          setSavedPolicies(response.policies);
        } else {
          console.error("Invalid policies format:", response);
          setSavedPolicies([]);
        }
      } catch (error) {
        console.error("Error loading saved policies in FareCalculator:", error);
        setSavedPolicies([]);
      }
    };
    loadSavedPolicies();
  }, []);

  const handlePolicyChange = (
    field: keyof FarePolicy,
    value: number | City | VehicleVariant | string
  ) => {
    setPolicy((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddThreshold = () => {
    setPolicy((prev) => ({
      ...prev,
      thresholdFares: [...prev.thresholdFares, { threshold: 10, charge: 17 }],
    }));
  };

  const handleThresholdChange = (
    index: number,
    field: keyof ThresholdFare,
    value: number
  ) => {
    setPolicy((prev) => ({
      ...prev,
      thresholdFares: prev.thresholdFares.map((threshold, i) =>
        i === index ? { ...threshold, [field]: value } : threshold
      ),
    }));
  };

  const handleRemoveThreshold = (index: number) => {
    setPolicy((prev) => ({
      ...prev,
      thresholdFares: prev.thresholdFares.filter((_, i) => i !== index),
    }));
  };

  const handleLegendClick = (entry: any) => {
    if (entry.dataKey) {
      setVisibleLines((prev) => ({
        ...prev,
        [entry.dataKey]: !prev[entry.dataKey as keyof typeof prev],
      }));
    }
  };

  const chartData = generateFareData(policy, 35);
  const newPolicyChartData = generateFareData(newPolicy, 50);

  // Prepare combined data for the chart
  const combinedChartData = chartData.map((baseRow, index) => {
    const newRow = newPolicyChartData[index];
    return {
      distance: baseRow.distance,
      // Base policy data
      baseFarePerKm: baseRow.farePerKm,
      baseFare: baseRow.fare,
      basePeakTimeFare: baseRow.peakTimeFare,
      basePeakTimeFarePerKm: baseRow.peakTimeFarePerKm,
      // New policy data
      newFarePerKm: newRow.farePerKm,
      newFare: newRow.fare,
      newPeakTimeFare: newRow.peakTimeFare,
      newPeakTimeFarePerKm: newRow.peakTimeFarePerKm,
    };
  });

  const handleOpenSaveDialog = () => {
    setPolicyName(generateDefaultPolicyName(newPolicy));
    setSaveDialogOpen(true);
  };

  const handleSavePolicy = async (): Promise<void> => {
    if (!policyName.trim()) return;

    try {
      const newSavedPolicy: SavedPolicy = {
        name: policyName.trim(),
        policy: newPolicy,
        timestamp: new Date().toLocaleString(),
      };

      const updatedPolicies = [...savedPolicies, newSavedPolicy];
      setSavedPolicies(updatedPolicies);
      await savePolicies(updatedPolicies);
      setPolicyName("");
      setSaveDialogOpen(false);
      console.log("Policy saved successfully:", newSavedPolicy);
    } catch (error) {
      console.error("Error saving policy:", error);
      // You might want to show an error message to the user here
    }
  };

  const handleLoadPolicy = async (savedPolicy: SavedPolicy): Promise<void> => {
    try {
      console.log("Loading policy:", savedPolicy);

      // Set the base policy for comparison
      setPolicy(savedPolicy.policy);
      console.log("Base policy set:", savedPolicy.policy);

      // Set the new policy to match the loaded policy
      setNewPolicy(savedPolicy.policy);
      console.log("New policy set:", savedPolicy.policy);

      // Close the dialog
      setLoadDialogOpen(false);
      console.log("Load dialog closed");
    } catch (error) {
      console.error("Error loading policy:", error);
    }
  };

  const handleDeletePolicy = async (index: number): Promise<void> => {
    try {
      const updatedPolicies = savedPolicies.filter(
        (_: SavedPolicy, i: number) => i !== index
      );
      setSavedPolicies(updatedPolicies);
      await savePolicies(updatedPolicies);
    } catch (error) {
      console.error("Error deleting policy:", error);
      // You might want to show an error message to the user here
    }
  };

  const handleNewPolicyChange = (field: keyof FarePolicy, value: number) => {
    setNewPolicy((prev) => ({ ...prev, [field]: value }));
  };

  const handleNewPolicyAddThreshold = () => {
    setNewPolicy((prev) => ({
      ...prev,
      thresholdFares: [...prev.thresholdFares, { threshold: 10, charge: 17 }],
    }));
  };

  const handleNewPolicyThresholdChange = (
    index: number,
    field: keyof ThresholdFare,
    value: number
  ) => {
    setNewPolicy((prev) => ({
      ...prev,
      thresholdFares: prev.thresholdFares.map((threshold, i) =>
        i === index ? { ...threshold, [field]: value } : threshold
      ),
    }));
  };

  const handleNewPolicyRemoveThreshold = (index: number) => {
    setNewPolicy((prev) => ({
      ...prev,
      thresholdFares: prev.thresholdFares.filter((_, i) => i !== index),
    }));
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: "0 auto" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Fare Calculator</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleOpenSaveDialog}
          >
            Save Policy
          </Button>
          <Button
            variant="outlined"
            startIcon={<FolderOpenIcon />}
            onClick={() => setLoadDialogOpen(true)}
          >
            Load Policy
          </Button>
        </Box>
      </Box>

      {/* Save Policy Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Fare Policy</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Policy Name"
            fullWidth
            value={policyName}
            onChange={(e) => setPolicyName(e.target.value)}
            helperText="You can edit the default name or add more text"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSavePolicy} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Load Policy Dialog */}
      <Dialog
        open={loadDialogOpen}
        onClose={() => {
          console.log("Load dialog closed by user");
          setLoadDialogOpen(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Load Fare Policy</DialogTitle>
        <DialogContent>
          <List>
            {savedPolicies.map((savedPolicy, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => handleDeletePolicy(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemButton
                  onClick={() => {
                    console.log("Policy selected:", savedPolicy);
                    handleLoadPolicy(savedPolicy);
                  }}
                >
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
          <Button
            onClick={() => {
              console.log("Load dialog closed by user");
              setLoadDialogOpen(false);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FarePolicyConfigs
            city={policy.city}
            variant={policy.variant}
            area={policy.area}
            description={policy.description}
            onCityChange={(value) => handlePolicyChange("city", value)}
            onVariantChange={(value) => handlePolicyChange("variant", value)}
            onAreaChange={(value) => handlePolicyChange("area", value)}
            onDescriptionChange={(value) =>
              handlePolicyChange("description", value)
            }
          />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Base Policy</Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddThreshold}
              >
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
                    handlePolicyChange("pickupCharges", Number(e.target.value))
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
                    handlePolicyChange("baseKilometers", Number(e.target.value))
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
                    handlePolicyChange("baseFare", Number(e.target.value))
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
                    handlePolicyChange(
                      "perExtraKmCharge",
                      Number(e.target.value)
                    )
                  }
                />
              </Grid>

              {/* Base Peak Time Fare Settings */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                  Base Peak Time Fare Settings
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Base Congestion Percentage (%)"
                  type="number"
                  value={policy.congestionPercentage}
                  onChange={(e) =>
                    handlePolicyChange(
                      "congestionPercentage",
                      Number(e.target.value)
                    )
                  }
                />
              </Grid>

              {/* Threshold Fares */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                  Threshold Fares
                </Typography>
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
                        handleThresholdChange(
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
                          handleThresholdChange(
                            index,
                            "charge",
                            Number(e.target.value)
                          )
                        }
                      />
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveThreshold(index)}
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
        </Grid>

        <Grid item xs={12}>
          <NewPolicy
            policy={newPolicy}
            onPolicyChange={handleNewPolicyChange}
            onAddThreshold={handleNewPolicyAddThreshold}
            onThresholdChange={handleNewPolicyThresholdChange}
            onRemoveThreshold={handleNewPolicyRemoveThreshold}
          />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="distance"
                  label={{ value: "Distance (km)", position: "bottom" }}
                  domain={[2, 35]}
                  ticks={[2, 5, 10, 15, 20, 25, 30, 35]}
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  tickFormatter={(value) => `₹${value}`}
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(value) => `₹${value}`}
                  domain={[0, 1000]}
                  ticks={[0, 200, 400, 600, 800, 1000]}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `₹${value.toFixed(2)}${
                      name.includes("PerKm") ? "/km" : ""
                    }`,
                    name.startsWith("base")
                      ? "Base " + name.slice(4)
                      : "New " + name.slice(3),
                  ]}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  onClick={handleLegendClick}
                  wrapperStyle={{ pointerEvents: "auto" }}
                />
                {/* Base Policy Lines */}
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="baseFarePerKm"
                  stroke="#4BC0C0"
                  strokeWidth={2}
                  dot={true}
                  activeDot={{ r: 8 }}
                  name="Base Fare per Kilometer"
                  hide={!visibleLines.baseFarePerKm}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="baseFare"
                  stroke="#FF8042"
                  strokeWidth={2}
                  dot={true}
                  activeDot={{ r: 8 }}
                  name="Base Total Fare"
                  hide={!visibleLines.baseFare}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="basePeakTimeFare"
                  stroke="#FF6B6B"
                  strokeWidth={2}
                  dot={true}
                  activeDot={{ r: 8 }}
                  name="Base Peak Time Fare"
                  hide={!visibleLines.basePeakTimeFare}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="basePeakTimeFarePerKm"
                  stroke="#4ECDC4"
                  strokeWidth={2}
                  dot={true}
                  activeDot={{ r: 8 }}
                  name="Base Peak Time Fare per km"
                  hide={!visibleLines.basePeakTimeFarePerKm}
                />
                {/* New Policy Lines */}
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="newFarePerKm"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={true}
                  activeDot={{ r: 8 }}
                  name="New Fare per Kilometer"
                  hide={!visibleLines.newFarePerKm}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="newFare"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={true}
                  activeDot={{ r: 8 }}
                  name="New Total Fare"
                  hide={!visibleLines.newFare}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="newPeakTimeFare"
                  stroke="#ffc658"
                  strokeWidth={2}
                  dot={true}
                  activeDot={{ r: 8 }}
                  name="New Peak Time Fare"
                  hide={!visibleLines.newPeakTimeFare}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="newPeakTimeFarePerKm"
                  stroke="#d53e4f"
                  strokeWidth={2}
                  dot={true}
                  activeDot={{ r: 8 }}
                  name="New Peak Time Fare per km"
                  hide={!visibleLines.newPeakTimeFarePerKm}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Base Policy Fare Details
            </Typography>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Distance (km)</TableCell>
                    <TableCell align="right">Fare (₹)</TableCell>
                    <TableCell align="right">Price per KM (₹)</TableCell>
                    <TableCell align="right">Peak Time Fare (₹)</TableCell>
                    <TableCell align="right">
                      Peak Time Price per KM (₹)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chartData.map((row) => (
                    <TableRow key={row.distance}>
                      <TableCell>{row.distance}</TableCell>
                      <TableCell align="right">{row.fare.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        {(row.fare / row.distance).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {row.peakTimeFare.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {(row.peakTimeFare / row.distance).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              New Policy Fare Details
            </Typography>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Distance (km)</TableCell>
                    <TableCell align="right">Fare (₹)</TableCell>
                    <TableCell align="right">Price per KM (₹)</TableCell>
                    <TableCell align="right">Peak Time Fare (₹)</TableCell>
                    <TableCell align="right">
                      Peak Time Price per KM (₹)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {newPolicyChartData.map((row) => (
                    <TableRow key={row.distance}>
                      <TableCell>{row.distance}</TableCell>
                      <TableCell align="right">{row.fare.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        {(row.fare / row.distance).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {row.peakTimeFare.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        {(row.peakTimeFare / row.distance).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FareCalculator;
