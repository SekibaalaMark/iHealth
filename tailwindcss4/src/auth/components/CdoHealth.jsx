import { useState, useEffect } from "react";
import { Button } from "../../uii/button";
import { Card, CardContent } from "../../uii/card";
import { Input } from "../../uii/input";
import { Label } from "../../uii/label";
import { cn } from "../../lib/utils";

export function CDOHealthDashboard({ className, ...props }) {
  const [children, setChildren] = useState({});
  const [bills, setBills] = useState({});
  const [newChild, setNewChild] = useState({ name: "", childNumber: "", photo: null, dateOfBirth: "" });
  const [childToDelete, setChildToDelete] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [selectedChild, setSelectedChild] = useState(null);
  const [viewChildNumber, setViewChildNumber] = useState("");
  const [diseaseStatsYearly, setDiseaseStatsYearly] = useState({});
  const [diseaseStatsMonthly, setDiseaseStatsMonthly] = useState({});

  // Fetch initial children data (replace with actual GET endpoint if available)
  useEffect(() => {
    // Placeholder: Fetch children from API if endpoint exists
    // fetch("https://health-vhd.onrender.com/api/children/")
    //   .then(res => res.json())
    //   .then(data => setChildren(data))
    //   .catch(error => setStatusMessage(`❌ Error fetching children: ${error.message}`));
  }, []);

  // Fetch disease statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [yearlyRes, monthlyRes] = await Promise.all([
          fetch("https://health-vhd.onrender.com/api/year-disease-stats"),
          fetch("https://health-vhd.onrender.com/api/month-disease-stats"),
        ]);
        const yearlyData = await yearlyRes.json();
        const monthlyData = await monthlyRes.json();
        if (yearlyRes.ok && monthlyRes.ok) {
          setDiseaseStatsYearly(yearlyData);
          setDiseaseStatsMonthly(monthlyData);
        } else {
          setStatusMessage(`❌ Error fetching stats: ${yearlyData.detail || monthlyData.detail}`);
        }
      } catch (error) {
        setStatusMessage(`❌ Error: ${error.message}`);
      }
    };
    fetchStats();
  }, []);

  // Create new child (API call)
  const createChild = async (e) => {
    e.preventDefault();
    if (!newChild.name || !newChild.childNumber || !newChild.photo || !newChild.dateOfBirth) {
      setStatusMessage("❌ Please fill all fields and upload a photo.");
      return;
    }

    const formData = new FormData();
    formData.append("name", newChild.name);
    formData.append("child_number", newChild.childNumber);
    formData.append("photo", newChild.photo);
    formData.append("date_of_birth", newChild.dateOfBirth);

    try {
      const response = await fetch("https://health-vhd.onrender.com/api/create-child/", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setChildren((prev) => ({ ...prev, [newChild.childNumber]: { ...newChild, photo: URL.createObjectURL(newChild.photo) } }));
        setNewChild({ name: "", childNumber: "", photo: null, dateOfBirth: "" });
        setStatusMessage("✅ Child created successfully.");
      } else {
        setStatusMessage(`❌ ${data.detail || "Failed to create child."}`);
      }
    } catch (error) {
      setStatusMessage(`❌ Error: ${error.message}`);
    }
  };

  // Delete child (API call)
  const deleteChild = async (e) => {
    e.preventDefault();
    if (!childToDelete) {
      setStatusMessage("❌ Please enter a child number.");
      return;
    }

    try {
      const response = await fetch(`https://health-vhd.onrender.com/api/delete-child/${childToDelete}/`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        const newChildren = { ...children };
        delete newChildren[childToDelete];
        setChildren(newChildren);
        setChildToDelete("");
        setStatusMessage("✅ Child deleted successfully.");
      } else {
        setStatusMessage(`❌ ${data.detail || "Failed to delete child."}`);
      }
    } catch (error) {
      setStatusMessage(`❌ Error: ${error.message}`);
    }
  };

  // View child details and bills (local for now, replace with API when available)
  const viewChild = (childNumber) => {
    // Placeholder: Fetch child details from API if endpoint exists
    // fetch(`https://health-vhd.onrender.com/api/child/${childNumber}/`)
    //   .then(res => res.json())
    //   .then(data => setSelectedChild(data))
    //   .catch(error => setSelectedChild({ error: error.message }));
    setSelectedChild(children[childNumber] || { error: "Child not found" });
  };

  // Calculate total bills per month (local for now, replace with API if available)
  const getMonthlyBills = () => {
    const monthlyTotals = {};
    Object.values(bills).forEach(bill => {
      const monthYear = bill.childNumber + "_" + new Date().getFullYear() + "-" + (new Date().getMonth() + 1).toString().padStart(2, '0');
      monthlyTotals[monthYear] = (monthlyTotals[monthYear] || 0) + parseFloat(bill.hospitalBill || 0);
    });
    return monthlyTotals;
  };

  // Calculate yearly total (local for now, replace with API if available)
  const getYearlyTotal = () => {
    return Object.values(bills).reduce((total, bill) => total + parseFloat(bill.hospitalBill || 0), 0);
  };

  // Handle file upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewChild({ ...newChild, photo: file });
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 bg-blue-100 p-6 text-gray-800", className)} {...props}>
      <Card className="overflow-hidden shadow-lg border border-blue-200">
        <CardContent className="p-6 bg-blue-50">
          <h1 className="text-3xl font-bold text-blue-800 mb-6">CDO Health Dashboard</h1>

          {/* Create Child Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">Create Child</h2>
            <form onSubmit={createChild} className="grid gap-4">
              <Label htmlFor="name" className="text-blue-700">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter name"
                value={newChild.name}
                onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <Label htmlFor="childNumber" className="text-blue-700">Child Number</Label>
              <Input
                id="childNumber"
                type="text"
                placeholder="Enter child number (e.g., 001)"
                value={newChild.childNumber}
                onChange={(e) => setNewChild({ ...newChild, childNumber: e.target.value })}
                className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <Label htmlFor="photo" className="text-blue-700">Upload Photo</Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <Label htmlFor="dateOfBirth" className="text-blue-700">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={newChild.dateOfBirth}
                onChange={(e) => setNewChild({ ...newChild, dateOfBirth: e.target.value })}
                className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <Button
                type="submit"
                className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
              >
                Create Child
              </Button>
            </form>
          </div>

          {/* Delete Child Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">Delete Child</h2>
            <form onSubmit={deleteChild} className="grid gap-4">
              <Label htmlFor="deleteChildNumber" className="text-blue-700">Child Number</Label>
              <Input
                id="deleteChildNumber"
                type="text"
                placeholder="Enter child number to delete"
                value={childToDelete}
                onChange={(e) => setChildToDelete(e.target.value)}
                className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <Button
                type="submit"
                className="w-full bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400"
              >
                Delete Child
              </Button>
            </form>
          </div>

          {/* View Child and Bills Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">View Child Details</h2>
            <form onSubmit={(e) => { e.preventDefault(); viewChild(viewChildNumber); }} className="grid gap-4">
              <Label htmlFor="viewChildNumber" className="text-blue-700">Child Number</Label>
              <Input
                id="viewChildNumber"
                type="text"
                placeholder="Enter child number (e.g., 001)"
                value={viewChildNumber}
                onChange={(e) => {
                  setViewChildNumber(e.target.value);
                  setStatusMessage("");
                }}
                className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <Button
                type="submit"
                className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
              >
                View
              </Button>
            </form>
            {selectedChild && !selectedChild.error && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                {selectedChild.photo && (
                  <img src={selectedChild.photo} alt="Child" className="w-40 h-40 object-cover mb-2 rounded" />
                )}
                <p><strong>Name:</strong> {selectedChild.name}</p>
                <p><strong>Child Number:</strong> {selectedChild.childNumber}</p>
                <p><strong>Date of Birth:</strong> {selectedChild.dateOfBirth}</p>
                <h3 className="mt-2 font-semibold">Medical Bills:</h3>
                <ul>
                  {Object.values(bills).filter(bill => bill.childNumber === selectedChild.childNumber).map((bill, index) => (
                    <li key={index} className="text-sm">
                      {bill.diseaseDescription}: ${bill.hospitalBill}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selectedChild && selectedChild.error && (
              <p className="mt-3 text-red-600">{selectedChild.error}</p>
            )}
          </div>

          {/* Total Bills and Statistics */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">Financial & Disease Stats</h2>
            <div className="grid gap-4">
              <div>
                <h3 className="font-semibold">Monthly Disease Stats:</h3>
                <ul>
                  {Object.entries(diseaseStatsMonthly).map(([disease, count]) => (
                    <li key={disease} className="text-sm">{disease}: {count} case(s)</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Yearly Disease Stats:</h3>
                <ul>
                  {Object.entries(diseaseStatsYearly).map(([disease, count]) => (
                    <li key={disease} className="text-sm">{disease}: {count} case(s)</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Monthly Totals (2025):</h3>
                <ul>
                  {Object.entries(getMonthlyBills()).map(([month, total]) => (
                    <li key={month} className="text-sm">${total.toFixed(2)} - {month}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Yearly Total (2025):</h3>
                <p>${getYearlyTotal().toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <p className={`mt-3 font-medium ${statusMessage.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
              {statusMessage}
            </p>
          )}
        </CardContent>
      </Card>
      <div className="text-center text-sm text-blue-700 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-blue-900">
        Today is {new Date().toLocaleString("en-US", { timeZone: "Africa/Nairobi", hour12: true })} EAT
      </div>
    </div>
  );
}

export { CDOHealthDashboard as default };