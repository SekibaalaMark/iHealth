import React, { useState, useRef } from "react";
import { Box, Typography, Button, List, ListItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
ChartJS.register(ChartDataLabels);

const sidebarOptions = [
  { label: "Home", icon: <HomeIcon />, key: "home" },
  { label: "Add Child", icon: <ChildCareIcon />, key: "add-child" },
  { label: "Medical Records", icon: <AssignmentIcon />, key: "medical-records" },
  { label: "Medical Bill Summary", icon: <ReceiptIcon />, key: "medical-bill-summary" },
  { label: "Month Bill Summary", icon: <CalendarMonthIcon />, key: "month-bill-summary" },
];

const DashboardCdo = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const username = user?.username || "CDO_HEALTH";
  const [selected, setSelected] = useState("home"); // Home is default
  const [addChildState, setAddChildState] = useState({
    name: "",
    child_number: "",
    photo: null,
    date_of_birth: "",
    loading: false,
    success: null,
    error: null,
  });
  const fileInputRef = useRef();
  const [analysisState, setAnalysisState] = useState({
    loading: false,
    error: null,
    data: null,
  });
  const [medicalRecordsState, setMedicalRecordsState] = useState({
    records: [],
    loading: false,
    error: null,
    loaded: false,
  });
  const [billSummaryState, setBillSummaryState] = useState({
    loading: false,
    error: null,
    data: null,
    loaded: false,
  });

  const handleSidebarClick = (key) => {
    setSelected(key);
    // Reset add child form state when switching
    if (key !== "add-child") {
      setAddChildState({
        name: "",
        child_number: "",
        photo: null,
        date_of_birth: "",
        loading: false,
        success: null,
        error: null,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddChildChange = (e) => {
    const { name, value, files } = e.target;
    setAddChildState((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
      success: null,
      error: null,
    }));
  };

  const handleAddChildSubmit = async (e) => {
    e.preventDefault();
    // Validate DD/MM/YYYY format
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (!dateRegex.test(addChildState.date_of_birth)) {
      setAddChildState((prev) => ({
        ...prev,
        error: "Date of Birth must be in DD/MM/YYYY format.",
        success: null,
      }));
      return;
    }
    // Check if it's a real date
    const [day, month, year] = addChildState.date_of_birth.split('/');
    const dateObj = new Date(`${year}-${month}-${day}`);
    if (
      dateObj.getFullYear() !== parseInt(year) ||
      dateObj.getMonth() + 1 !== parseInt(month) ||
      dateObj.getDate() !== parseInt(day)
    ) {
      setAddChildState((prev) => ({
        ...prev,
        error: "Date of Birth is not a valid date.",
        success: null,
      }));
      return;
    }
    setAddChildState((prev) => ({ ...prev, loading: true, success: null, error: null }));
    const formData = new FormData();
    formData.append("name", addChildState.name);
    formData.append("child_number", addChildState.child_number);
    formData.append("photo", addChildState.photo);
    formData.append("date_of_birth", addChildState.date_of_birth);
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch("https://ihealth-vhdl.onrender.com/api/create-child/", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        let errorMsg = "Failed to add child";
        try {
          const errorData = await response.json();
          errorMsg = errorData?.message || JSON.stringify(errorData) || errorMsg;
        } catch (jsonErr) {
          // fallback to text
          const errorText = await response.text();
          if (errorText) errorMsg = errorText;
        }
        throw new Error(errorMsg);
      }
      setAddChildState((prev) => ({
        ...prev,
        loading: false,
        success: "Child added successfully!",
        error: null,
        name: "",
        child_number: "",
        photo: null,
        date_of_birth: "",
      }));
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setAddChildState((prev) => ({
        ...prev,
        loading: false,
        success: null,
        error: err.message || "Failed to add child",
      }));
    }
  };

  const fetchAnalysis = async () => {
    setAnalysisState({ loading: true, error: null, data: null });
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch("https://ihealth-vhdl.onrender.com/api/year-disease-stats/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        let errorMsg = "Failed to fetch analysis data";
        try {
          const errorData = await response.json();
          errorMsg = errorData?.message || JSON.stringify(errorData) || errorMsg;
        } catch (jsonErr) {}
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setAnalysisState({ loading: false, error: null, data });
    } catch (err) {
      setAnalysisState({ loading: false, error: err.message || "Failed to fetch analysis data", data: null });
    }
  };

  const fetchMedicalRecords = async () => {
    setMedicalRecordsState((prev) => ({ ...prev, loading: true, error: null }));
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch("https://ihealth-vhdl.onrender.com/api/medical-records/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        let errorMsg = "Failed to fetch medical records";
        try {
          const errorData = await response.json();
          errorMsg = errorData?.message || JSON.stringify(errorData) || errorMsg;
        } catch (jsonErr) {}
        throw new Error(errorMsg);
      }
      const data = await response.json();
      let records = Array.isArray(data) ? data : [];
      // Sort by date_of_visit descending (newest first)
      records = records.sort((a, b) => new Date(b.date_of_visit) - new Date(a.date_of_visit));
      setMedicalRecordsState({
        records,
        loading: false,
        error: null,
        loaded: true,
      });
    } catch (err) {
      setMedicalRecordsState({
        records: [],
        loading: false,
        error: err.message || "Failed to fetch medical records",
        loaded: true,
      });
    }
  };

  const fetchBillSummary = async () => {
    setBillSummaryState({ loading: true, error: null, data: null, loaded: false });
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch("https://ihealth-vhdl.onrender.com/api/medical-bills-sum/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        let errorMsg = "Failed to fetch bill summary";
        try {
          const errorData = await response.json();
          errorMsg = errorData?.message || JSON.stringify(errorData) || errorMsg;
        } catch (jsonErr) {}
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setBillSummaryState({ loading: false, error: null, data, loaded: true });
    } catch (err) {
      setBillSummaryState({ loading: false, error: err.message || "Failed to fetch bill summary", data: null, loaded: true });
    }
  };

  React.useEffect(() => {
    if (selected === "home") {
      fetchAnalysis();
    }
  }, [selected]);

  // Fetch records when Medical Records is selected
  React.useEffect(() => {
    if (selected === "medical-records" && !medicalRecordsState.loaded) {
      fetchMedicalRecords();
    }
  }, [selected]);

  // Fetch bill summary when Medical Bill Summary is selected
  React.useEffect(() => {
    if (selected === "medical-bill-summary" && !billSummaryState.loaded) {
      fetchBillSummary();
    }
  }, [selected]);

  // Main content for each section
  const renderContent = () => {
    switch (selected) {
      case "home":
        return (
          <>
            <Typography variant="h4" sx={{ color: '#1565c0', fontWeight: 'bold', mb: 2 }}>
              Analysis
            </Typography>
            {analysisState.loading && <Typography>Loading analysis...</Typography>}
            {analysisState.error && <Typography color="error">{analysisState.error}</Typography>}
            {analysisState.data && analysisState.data.disease_statistics && analysisState.data.disease_statistics.length > 0 && (
              <Box sx={{ width: '100%', maxWidth: 600, mt: 3 }}>
                {(() => {
                  const palette = [
                    '#1976d2', '#26a69a', '#ffa726', '#ef5350', '#ab47bc', '#66bb6a', '#ff7043', '#29b6f6', '#ec407a', '#8d6e63',
                  ];
                  const stats = analysisState.data.disease_statistics;
                  const barColors = stats.map((_, i) => palette[i % palette.length]);
                  return (
                    <Bar
                      data={{
                        labels: stats.map(ds => ds.disease_description),
                        datasets: [
                          {
                            label: 'Cases',
                            data: stats.map(ds => ds.count),
                            backgroundColor: barColors,
                            borderRadius: 8,
                            borderSkipped: false,
                            hoverBackgroundColor: barColors.map(c => c + 'cc'),
                            barPercentage: 0.7,
                            categoryPercentage: 0.7,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { display: false },
                          title: { display: true, text: 'Disease Statistics (Current Year)' },
                          tooltip: {
                            backgroundColor: '#fff',
                            titleColor: '#1976d2',
                            bodyColor: '#333',
                            borderColor: '#1976d2',
                            borderWidth: 1,
                          },
                        },
                        scales: {
                          x: { title: { display: true, text: 'Disease' } },
                          y: { title: { display: true, text: 'Cases' }, beginAtZero: true },
                        },
                        layout: { padding: 10 },
                        elements: {
                          bar: {
                            borderRadius: 8,
                            borderSkipped: false,
                          },
                        },
                      }}
                    />
                  );
                })()}
              </Box>
            )}
            {analysisState.data && analysisState.data.disease_statistics && analysisState.data.disease_statistics.length === 0 && (
              <Typography>No disease statistics found.</Typography>
            )}
          </>
        );
      case "add-child":
        return (
          <Box sx={{ width: 350 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>Add Child</Typography>
            <form onSubmit={handleAddChildSubmit} encType="multipart/form-data">
              <Box sx={{ mb: 2 }}>
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={addChildState.name}
                  onChange={handleAddChildChange}
                  required
                  style={{ width: '100%', padding: 8, marginTop: 4 }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <label>Child Number</label>
                <input
                  type="text"
                  name="child_number"
                  value={addChildState.child_number}
                  onChange={handleAddChildChange}
                  required
                  style={{ width: '100%', padding: 8, marginTop: 4 }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <label>Photo</label>
                <input
                  type="file"
                  name="photo"
                  accept="image/*"
                  onChange={handleAddChildChange}
                  required
                  ref={fileInputRef}
                  style={{ width: '100%', marginTop: 4 }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <label>Date of Birth</label>
                <input
                  type="text"
                  name="date_of_birth"
                  value={addChildState.date_of_birth}
                  onChange={handleAddChildChange}
                  required
                  placeholder="DD/MM/YYYY"
                  style={{ width: '100%', padding: 8, marginTop: 4 }}
                />
              </Box>
              {addChildState.error && (
                <Typography color="error" sx={{ mb: 1 }}>{addChildState.error}</Typography>
              )}
              {addChildState.success && (
                <Typography color="success.main" sx={{ mb: 1 }}>{addChildState.success}</Typography>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={addChildState.loading}
              >
                {addChildState.loading ? "Adding..." : "Add Child"}
              </Button>
            </form>
          </Box>
        );
      case "medical-records":
        return (
          <Box sx={{ width: '100%', maxWidth: 900 }}>
            <Typography variant="h4" sx={{ color: '#1565c0', fontWeight: 'bold', mb: 2 }}>
              Medical Records
            </Typography>
            {medicalRecordsState.loading && <Typography>Loading...</Typography>}
            {medicalRecordsState.error && <Typography color="error">{medicalRecordsState.error}</Typography>}
            {!medicalRecordsState.loading && !medicalRecordsState.error && medicalRecordsState.records.length === 0 && (
              <Typography>No medical records found.</Typography>
            )}
            {!medicalRecordsState.loading && !medicalRecordsState.error && medicalRecordsState.records.length > 0 && (
              <Box sx={{ overflowX: 'auto', mt: 2 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8 }}>
                  <thead>
                    <tr style={{ background: '#bbdefb' }}>
                      <th style={{ padding: 8, border: '1px solid #90caf9' }}>Child Name</th>
                      <th style={{ padding: 8, border: '1px solid #90caf9' }}>Child Number</th>
                      <th style={{ padding: 8, border: '1px solid #90caf9' }}>Hospital Name</th>
                      <th style={{ padding: 8, border: '1px solid #90caf9' }}>Date of Visit</th>
                      <th style={{ padding: 8, border: '1px solid #90caf9' }}>Disease Description</th>
                      <th style={{ padding: 8, border: '1px solid #90caf9' }}>Hospital Bill (UGX)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicalRecordsState.records.map((rec, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e3f2fd' }}>
                        <td style={{ padding: 8, border: '1px solid #90caf9' }}>{rec.child_name}</td>
                        <td style={{ padding: 8, border: '1px solid #90caf9' }}>{rec.child_number}</td>
                        <td style={{ padding: 8, border: '1px solid #90caf9' }}>{rec.hospital_name}</td>
                        <td style={{ padding: 8, border: '1px solid #90caf9' }}>{rec.date_of_visit}</td>
                        <td style={{ padding: 8, border: '1px solid #90caf9' }}>{rec.disease_description}</td>
                        <td style={{ padding: 8, border: '1px solid #90caf9' }}>{rec.hospital_bill}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            )}
          </Box>
        );
      case "medical-bill-summary":
        return (
          <Box sx={{ width: '100%', maxWidth: 600 }}>
            <Typography variant="h4" sx={{ color: '#1565c0', fontWeight: 'bold', mb: 2 }}>
              Medical Bill Summary
            </Typography>
            {billSummaryState.loading && <Typography>Loading summary...</Typography>}
            {billSummaryState.error && <Typography color="error">{billSummaryState.error}</Typography>}
            {billSummaryState.data && billSummaryState.data.monthly_totals && Object.keys(billSummaryState.data.monthly_totals).length > 0 && (
              <Box sx={{ width: '100%', maxWidth: 500, mt: 3 }}>
                <Bar
                  data={{
                    labels: Object.keys(billSummaryState.data.monthly_totals),
                    datasets: [
                      {
                        label: 'Monthly Total (UGX)',
                        data: Object.values(billSummaryState.data.monthly_totals),
                        backgroundColor: '#26a69a',
                        borderRadius: 8,
                        borderSkipped: false,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      title: { display: true, text: '' },
                      datalabels: {
                        anchor: 'end',
                        align: 'end',
                        color: '#1976d2',
                        font: { weight: 'bold', size: 14 },
                        formatter: (value) => `UGX ${value.toLocaleString()}`,
                      },
                    },
                    scales: {
                      x: { title: { display: true, text: 'Month' } },
                      y: { title: { display: true, text: 'Total (UGX)' }, beginAtZero: true },
                    },
                    layout: { padding: 10 },
                    elements: {
                      bar: {
                        borderRadius: 8,
                        borderSkipped: false,
                      },
                    },
                  }}
                />
              </Box>
            )}
            {billSummaryState.data && (
              <Typography variant="h6" sx={{ mt: 4, color: '#1976d2' }}>
                Total Yearly Bill: UGX {billSummaryState.data.total_yearly_bill?.toLocaleString()}
              </Typography>
            )}
            {billSummaryState.data && (!billSummaryState.data.monthly_totals || Object.keys(billSummaryState.data.monthly_totals).length === 0) && (
              <Typography>No monthly bill data found.</Typography>
            )}
          </Box>
        );
      case "month-bill-summary":
        return <Typography variant="h5">Month Bill Summary (Coming Soon)</Typography>;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#e3f2fd' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 250,
          background: '#bbdefb',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          py: 3,
          boxShadow: 2,
        }}
      >
        <Box>
          <Typography variant="h6" align="center" sx={{ mb: 3, color: '#1565c0', fontWeight: 'bold' }}>
            CDO_HEALTH DASHBOARD
          </Typography>
          <List>
            {sidebarOptions.map((option) => (
              <ListItem
                button
                key={option.key}
                selected={selected === option.key}
                onClick={() => handleSidebarClick(option.key)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  background: selected === option.key ? '#e3f2fd' : 'transparent',
                  color: '#1565c0',
                  '&:hover': { background: '#e3f2fd' },
                }}
              >
                <ListItemIcon sx={{ color: '#1565c0' }}>{option.icon}</ListItemIcon>
                <ListItemText primary={option.label} />
              </ListItem>
            ))}
          </List>
        </Box>
        <Box sx={{ px: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Button
            variant="outlined"
            color="error"
            fullWidth
            startIcon={<LogoutIcon />}
            onClick={logout}
            sx={{ mb: 1 }}
          >
            Logout
          </Button>
        </Box>
      </Box>
      {/* Main Content */}
      <Box sx={{ flex: 1, p: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default DashboardCdo; 