import { cn } from "../../lib/utils";
import { Button } from "../../uii/button";
import { Card, CardContent } from "../../uii/card";
import { Input } from "../../uii/input";
import { Label } from "../../uii/label";
import { useState, useEffect } from "react";
import { login, getSessionToken } from "../lib/allauth";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function LoginForm({ className, ...props }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [response, setResponse] = useState({ fetching: false, content: null });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already authenticated on mount
    const sessionToken = getSessionToken();
    if (sessionToken) {
      navigate("/dashboard"); // Redirect if already logged in
    }
  }, [navigate]);

  function submit(e) {
    e.preventDefault();
    setResponse({ ...response, fetching: true });

    login({ email, password })
      .then((content) => {
        setResponse((r) => ({ ...r, content }));

        if (content.status === 200 && content.meta?.is_authenticated) {
          toast.success("Login successful!");
          // Redirect to dashboard after successful login
          setTimeout(() => navigate("/dashboard"), 1000); // Delay for toast visibility
        } else if (content.status !== 200) {
          toast.error(
            <span className="font-bold text-white">Error Logging In</span>,
            {
              description: content.errors?.map((e, i) => <span key={i}>{e.message}</span>) || "Invalid email or password",
              action: { label: "OK" },
              style: { background: "red" },
            }
          );
        }
      })
      .catch((e) => {
        console.error("LoginError", { e });
        toast.error("An error occurred during login. Please try again.");
      })
      .finally(() => {
        setResponse((r) => ({ ...r, fetching: false }));
      });
  }

  return (
    <div className={cn("flex flex-col gap-6 bg-blue-100 p-6 text-gray-800", className)} {...props}>
      <Card className="overflow-hidden shadow-lg border border-blue-200">
        <CardContent className="p-6 bg-blue-50">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl font-bold text-blue-800">Welcome back</h1>
            <p className="mt-2 text-balance text-blue-600">
              Login to your CDO Health account
            </p>
          </div>
          <form className="mt-6 grid gap-4" onSubmit={submit}>
            <Label htmlFor="email" className="text-blue-700">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <div className="grid gap-4">
              <div className="flex items-center">
                <Label htmlFor="password" className="text-blue-700">Password</Label>
                <Link
                  to="/account/password/reset"
                  className="ml-auto text-sm text-blue-700 underline underline-offset-2 hover:text-blue-900"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
              disabled={response.fetching}
            >
              {response.fetching ? "Logging in..." : "Login"}
            </Button>
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link
                to="/account/signup"
                className="text-blue-700 underline underline-offset-4 hover:text-blue-900"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-center text-sm text-blue-700 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-blue-900">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}

export { LoginForm as default };