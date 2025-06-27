import React, { useState, useRef } from "react";
import { Box, Typography, Button, List, ListItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from "../context/authContext";

const sidebarOptions = [
  { label: "Verify Child", icon: <VerifiedUserIcon />, key: "verify-child" },
  { label: "Create Medical Bill", icon: <ReceiptIcon />, key: "create-medical-bill" },
  { label: "Medical Records", icon: <AssignmentIcon />, key: "medical-records" },
];

const DashboardHospital = () => {
  const { user, logout } = useAuth();
  const username = user?.username || "Hospital";
  const [selected, setSelected] = useState("verify-child"); // Default to Verify Child
  const [verifyChildState, setVerifyChildState] = useState({
    child_number: "",
    loading: false,
    error: null,
    result: null,
  });
  const [createBillState, setCreateBillState] = useState({
    child_number: "",
    disease_description: "",
    hospital_bill: "",
    loading: false,
    error: null,
    success: null,
  });
  const [medicalRecordsState, setMedicalRecordsState] = useState({
    records: [],
    loading: false,
    error: null,
    loaded: false,
  });

  const handleSidebarClick = (key) => {
    setSelected(key);
  };

  const handleVerifyChildChange = (e) => {
    setVerifyChildState((prev) => ({
      ...prev,
      child_number: e.target.value,
      error: null,
      result: null,
    }));
  };

  const handleVerifyChildSubmit = async (e) => {
    e.preventDefault();
    setVerifyChildState((prev) => ({ ...prev, loading: true, error: null, result: null }));
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch("https://ihealth-vhdl.onrender.com/api/verify-child/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ child_number: verifyChildState.child_number }),
      });
      if (!response.ok) {
        let errorMsg = "Failed to verify child";
        try {
          const errorData = await response.json();
          errorMsg = errorData?.message || JSON.stringify(errorData) || errorMsg;
        } catch (jsonErr) {
          // Do not try to read the body again
        }
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setVerifyChildState((prev) => ({
        ...prev,
        loading: false,
        error: null,
        result: data,
      }));
    } catch (err) {
      setVerifyChildState((prev) => ({
        ...prev,
        loading: false,
        error: err.message || "Failed to verify child",
        result: null,
      }));
    }
  };

  const handleCreateBillChange = (e) => {
    const { name, value } = e.target;
    setCreateBillState((prev) => ({
      ...prev,
      [name]: value,
      error: null,
      success: null,
    }));
  };

  const handleCreateBillSubmit = async (e) => {
    e.preventDefault();
    setCreateBillState((prev) => ({ ...prev, loading: true, error: null, success: null }));
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch("https://ihealth-vhdl.onrender.com/api/create-medical-bill/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          child_number: createBillState.child_number,
          disease_description: createBillState.disease_description,
          hospital_bill: createBillState.hospital_bill,
        }),
      });
      if (!response.ok) {
        let errorMsg = "Failed to create medical bill";
        try {
          const errorData = await response.json();
          errorMsg = errorData?.message || JSON.stringify(errorData) || errorMsg;
        } catch (jsonErr) {}
        throw new Error(errorMsg);
      }
      setCreateBillState({
        child_number: "",
        disease_description: "",
        hospital_bill: "",
        loading: false,
        error: null,
        success: "Medical bill created successfully!",
      });
    } catch (err) {
      setCreateBillState((prev) => ({
        ...prev,
        loading: false,
        error: err.message || "Failed to create medical bill",
        success: null,
      }));
    }
  };

  const fetchMedicalRecords = async () => {
    setMedicalRecordsState((prev) => ({ ...prev, loading: true, error: null }));
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch("https://ihealth-vhdl.onrender.com/api/hospital-medical-records/", {
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

  // Fetch records when Medical Records is selected
  React.useEffect(() => {
    if (selected === "medical-records" && !medicalRecordsState.loaded) {
      fetchMedicalRecords();
    }
  }, [selected]);

  // Main content for each section
  const renderContent = () => {
    switch (selected) {
      case "verify-child":
        return (
          <Box sx={{ width: 350 }}>
            <Typography variant="h4" sx={{ color: '#1565c0', fontWeight: 'bold', mb: 2 }}>
              Verify Child
            </Typography>
            <form onSubmit={handleVerifyChildSubmit}>
              <Box sx={{ mb: 2 }}>
                <label>Child Number</label>
                <input
                  type="text"
                  name="child_number"
                  value={verifyChildState.child_number}
                  onChange={handleVerifyChildChange}
                  required
                  style={{ width: '100%', padding: 8, marginTop: 4 }}
                />
              </Box>
              {verifyChildState.error && (
                <Typography color="error" sx={{ mb: 1 }}>{verifyChildState.error}</Typography>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={verifyChildState.loading}
              >
                {verifyChildState.loading ? "Verifying..." : "Verify Child"}
              </Button>
            </form>
            {verifyChildState.result && (
              <Box sx={{ mt: 4, textAlign: 'center', p: 2, border: '1px solid #90caf9', borderRadius: 2, background: '#e3f2fd' }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Name: {verifyChildState.result.name}</Typography>
                <Typography variant="h6" sx={{ mb: 2 }}>Age: {verifyChildState.result.age}</Typography>
                {verifyChildState.result.photo && (
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {(() => {
                      const photo = verifyChildState.result.photo;
                      const fullPhotoUrl = photo && !photo.startsWith('http')
                        ? `https://ihealth-vhdl.onrender.com${photo}`
                        : photo;
                      return (
                        <img
                          src={fullPhotoUrl}
                          alt="Child"
                          style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 12, objectFit: 'contain', boxShadow: '0 2px 8px rgba(21,101,192,0.15)' }}
                        />
                      );
                    })()}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        );
      case "create-medical-bill":
        return (
          <Box sx={{ width: 400 }}>
            <Typography variant="h4" sx={{ color: '#1565c0', fontWeight: 'bold', mb: 2 }}>
              Create Medical Bill
            </Typography>
            <form onSubmit={handleCreateBillSubmit}>
              <Box sx={{ mb: 2 }}>
                <label>Child Number</label>
                <input
                  type="text"
                  name="child_number"
                  value={createBillState.child_number}
                  onChange={handleCreateBillChange}
                  required
                  style={{ width: '100%', padding: 8, marginTop: 4 }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <label>Disease Description</label>
                <textarea
                  name="disease_description"
                  value={createBillState.disease_description}
                  onChange={handleCreateBillChange}
                  required
                  rows={3}
                  style={{ width: '100%', padding: 8, marginTop: 4, resize: 'vertical' }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <label>Hospital Bill (UGX)</label>
                <input
                  type="number"
                  name="hospital_bill"
                  value={createBillState.hospital_bill}
                  onChange={handleCreateBillChange}
                  required
                  min={0}
                  style={{ width: '100%', padding: 8, marginTop: 4 }}
                />
              </Box>
              {createBillState.error && (
                <Typography color="error" sx={{ mb: 1 }}>{createBillState.error}</Typography>
              )}
              {createBillState.success && (
                <Typography color="success.main" sx={{ mb: 1 }}>{createBillState.success}</Typography>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={createBillState.loading}
              >
                {createBillState.loading ? "Creating..." : "Create Bill"}
              </Button>
            </form>
          </Box>
        );
      case "medical-records":
        return (
          <Box sx={{ width: '100%', maxWidth: 800 }}>
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
                      <th style={{ padding: 8, border: '1px solid #90caf9' }}>Name</th>
                      <th style={{ padding: 8, border: '1px solid #90caf9' }}>Date of Visit</th>
                      <th style={{ padding: 8, border: '1px solid #90caf9' }}>Disease Description</th>
                      <th style={{ padding: 8, border: '1px solid #90caf9' }}>Hospital Bill (UGX)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicalRecordsState.records.map((rec, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e3f2fd' }}>
                        <td style={{ padding: 8, border: '1px solid #90caf9' }}>{rec.name}</td>
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
            HOSPITAL DASHBOARD
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
        <Typography variant="h5" sx={{ color: '#1565c0', fontWeight: 'bold', mb: 2 }}>
          {`Welcome, ${username}!`}
        </Typography>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default DashboardHospital; 