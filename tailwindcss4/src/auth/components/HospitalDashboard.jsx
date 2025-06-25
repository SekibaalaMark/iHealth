import { useState } from "react";
import { Button } from "../../uii/button";
import { Card, CardContent } from "../../uii/card";
import { Input } from "../../uii/input";
import { Label } from "../../uii/label";
import { cn } from "../../lib/utils";
import CompassionLogo from "../../images/Co.JPEG";

export function HospitalDashboard({ className, ...props }) {
  const [childNumber, setChildNumber] = useState("");
  const [childDetails, setChildDetails] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [bill, setBill] = useState({ childNumber: "", diseaseDescription: "", hospitalBill: "" });

  // Mock database of children (replace with real API call in production)
  const childrenDatabase = {
    "001": { name: "John Doe", age: 5, photo: "https://via.placeholder.com/150", details: "Registered on 2025-06-01" },
    "002": { name: "Jane Smith", age: 7, photo: "https://via.placeholder.com/150", details: "Registered on 2025-06-10" },
  };

  // Verify child by child number
  const verifyChild = (e) => {
    e.preventDefault();
    const child = childrenDatabase[childNumber];
    if (child) {
      setChildDetails(child);
      setStatusMessage("✅ Child verified successfully.");
    } else {
      setChildDetails({ error: "Child not found" });
      setStatusMessage("❌ Child not found.");
    }
  };

  // Handle bill creation
  const createBill = (e) => {
    e.preventDefault();
    if (!bill.childNumber || !bill.diseaseDescription || !bill.hospitalBill) {
      alert("Please fill all fields");
      return;
    }
    console.log("Medical Bill Created:", bill); // Replace with API call or state management in production
    setBill({ childNumber: "", diseaseDescription: "", hospitalBill: "" });
    alert("Bill created successfully!");
  };

  return (
    <div className={cn("flex flex-col gap-6 bg-blue-100 p-6 text-gray-800", className)} {...props}>
      <Card className="overflow-hidden shadow-lg border border-blue-200">
        <CardContent className="grid p-0 md:grid-cols-2 bg-blue-50">
          <div className="relative hidden md:block bg-blue-200">
            <img
              src={CompassionLogo}
              alt="COMPASSION LOGO"
              className="absolute inset-0 h-full w-full object-contain opacity-50"
            />
          </div>
          <div className="p-6 md:p-8 bg-white rounded-r-lg">
            <h1 className="text-3xl font-bold text-blue-800 mb-6">Hospital Dashboard</h1>

            {/* Child Verification Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-blue-700 mb-4">Verify Child</h2>
              <form onSubmit={verifyChild} className="grid gap-4">
                <Label htmlFor="childNumber" className="text-blue-700">Child Number</Label>
                <Input
                  id="childNumber"
                  type="text"
                  placeholder="Enter child number (e.g., 001)"
                  value={childNumber}
                  onChange={(e) => {
                    setChildNumber(e.target.value);
                    setStatusMessage(""); // clear status when typing
                  }}
                  className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <Button
                  type="submit"
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
                >
                  Verify
                </Button>
              </form>

              {/* Status Message */}
              {statusMessage && (
                <p
                  className={`mt-3 font-medium ${
                    statusMessage.includes("verified")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {statusMessage}
                </p>
              )}

              {/* Child Details */}
              {childDetails && !childDetails.error && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <img src={childDetails.photo} alt="Child" className="w-40 h-40 object-cover mb-2 rounded" />
                  <p><strong>Name:</strong> {childDetails.name}</p>
                  <p><strong>Age:</strong> {childDetails.age}</p>
                  <p><strong>Details:</strong> {childDetails.details}</p>
                </div>
              )}
            </div>

            {/* Medical Bill Creation Section */}
            <div>
              <h2 className="text-xl font-semibold text-blue-700 mb-4">Create Medical Bill</h2>
              <form onSubmit={createBill} className="grid gap-4">
                <Label htmlFor="billChildNumber" className="text-blue-700">Child Number</Label>
                <Input
                  id="billChildNumber"
                  type="text"
                  placeholder="Enter child number"
                  value={bill.childNumber}
                  onChange={(e) => setBill({ ...bill, childNumber: e.target.value })}
                  className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <Label htmlFor="diseaseDescription" className="text-blue-700">Disease Description</Label>
                <Input
                  id="diseaseDescription"
                  type="text"
                  placeholder="Describe the disease"
                  value={bill.diseaseDescription}
                  onChange={(e) => setBill({ ...bill, diseaseDescription: e.target.value })}
                  className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <Label htmlFor="hospitalBill" className="text-blue-700">Hospital Bill (USD)</Label>
                <Input
                  id="hospitalBill"
                  type="number"
                  placeholder="Enter bill amount"
                  value={bill.hospitalBill}
                  onChange={(e) => setBill({ ...bill, hospitalBill: e.target.value })}
                  className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <Button
                  type="submit"
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
                >
                  Create Bill
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-center text-sm text-blue-700 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-blue-900">
        Today is {new Date().toLocaleString("en-US", { timeZone: "Africa/Nairobi", hour12: true })} EAT
      </div>
    </div>
  );
}

export { HospitalDashboard as default };
