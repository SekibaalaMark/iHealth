import { useState } from "react";
import { getEmailVerification } from "../lib/allauth";
import { useNavigate } from "react-router-dom";
import { Button } from "../../uii/button";
import { Card, CardContent } from "../../uii/card";
import { Input } from "../../uii/input";
import { Label } from "../../uii/label";
import { cn } from "../../lib/utils";
import { LoaderIcon } from "lucide-react";
import { toast } from "sonner";

function VerifyEmail() {
  const [key, setKey] = useState("");
  const [fetching, setFetching] = useState(false);
  const navigate = useNavigate();

  async function verify() {
    setFetching(true);
    try {
      const response = await getEmailVerification(key);
      if (response.status === 200) {
        toast.success("Email verified! Redirecting to login...");
        setTimeout(() => navigate("/account/login"), 1000); // Redirect to login dashboard
      } else {
        toast.error(
          <span className="font-bold text-white">Verification Failed</span>,
          {
            description: response.errors?.map((e, i) => <span key={i}>{e.message}</span>) || "Invalid verification code",
            action: { label: "OK" },
            style: { background: "red" },
          }
        );
      }
    } catch (e) {
      console.error("Verification Error:", e);
      toast.error("An error occurred during verification. Please try again.");
    } finally {
      setFetching(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6 bg-blue-100 p-6 text-gray-800")}>
      <Card className="overflow-hidden shadow-lg border border-blue-200">
        <CardContent className="p-6 bg-blue-50">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl font-bold text-blue-800">Verify Your Email</h1>
            <p className="mt-2 text-balance text-blue-600">
              Please enter the verification code sent to your email.
            </p>
          </div>
          <form className="mt-6 grid gap-4" onSubmit={(e) => { e.preventDefault(); verify(); }}>
            <div className="grid gap-4">
              <Label htmlFor="verification-key" className="text-blue-700">Verification Code</Label>
              <Input
                id="verification-key"
                type="text"
                placeholder="Enter code from email"
                required
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
              disabled={fetching}
            >
              {fetching ? <LoaderIcon className="animate-spin" /> : "Verify Email"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default VerifyEmail;