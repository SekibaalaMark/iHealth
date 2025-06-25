import { useState } from "react";
import { signUp } from "../lib/allauth";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../uii/button";
import { Card, CardContent } from "../../uii/card";
import { Input } from "../../uii/input";
import { Label } from "../../uii/label";
import { cn } from "../../lib/utils";
import { LoaderIcon, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import FormErrors from "../../pages/formerrors";

export function SignupForm({ className, ...props }) {
  const [mode, setMode] = useState("signup"); // 'login' or 'signup'
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState(""); // Only for signup
  const [password2Errors, setPassword2Errors] = useState([]);
  const [response, setResponse] = useState({ fetching: false, content: null });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  // Function to validate passwords (only for signup)
  function validatePasswords(password1, password2) {
    if (password1.length < 8) {
      return { param: "password", message: "Password must be at least 8 characters long." };
    }
    if (password1 !== password2) {
      return { param: "password2", message: "Passwords do not match." };
    }
    return null;
  }

  // Submit handler
  function submit(e) {
    e.preventDefault();

    if (mode === "signup") {
      const validationError = validatePasswords(password, password2);
      if (validationError) {
        setPassword2Errors([validationError]);
        return;
      }
      setPassword2Errors([]);
      setResponse({ ...response, fetching: true });

      signUp({ email, username, password, role })
        .then((content) => {
          setResponse((r) => ({ ...r, content }));

          if (content.status === 200) {
            toast.success("Verification email sent! Please check your inbox to verify.");
            setTimeout(() => navigate("/verify-email"), 1000);
          } else if (content.status !== 200) {
            toast.error(
              <span className="font-bold text-white">Error Signing Up</span>,
              {
                description: content.errors?.map((e, i) => <span key={i}>{e.message}</span>) || "An error occurred",
                action: { label: "OK" },
                style: { background: "red" },
              }
            );
          }
        })
        .catch((e) => {
          console.error("Signup Error:", e);
          toast.error("An error occurred during signup. Please try again.");
        })
        .finally(() => {
          setResponse((r) => ({ ...r, fetching: false }));
        });
    } else if (mode === "login") {
      navigate("/account/login"); // Redirect to login page
    }
  }

  return (
    <div className={cn("flex flex-col gap-6 bg-blue-100 p-6 text-gray-800", className)} {...props}>
      <Card className="overflow-hidden shadow-lg border border-blue-200">
        <CardContent className="p-6 bg-blue-50">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl font-bold text-blue-800">
              {mode === "signup" ? "Create an Account" : "Login"}
            </h1>
            {mode === "signup" && (
              <p className="mt-2 text-balance text-blue-600">
                Already have an account?{" "}
                <Link
                  to="#"
                  onClick={(e) => { e.preventDefault(); setMode("login"); }}
                  className="text-blue-700 underline underline-offset-4 hover:text-blue-900"
                >
                  Login here.
                </Link>
              </p>
            )}
            {mode === "login" && (
              <p className="mt-2 text-balance text-blue-600">
                Need an account?{" "}
                <Link
                  to="#"
                  onClick={(e) => { e.preventDefault(); setMode("signup"); }}
                  className="text-blue-700 underline underline-offset-4 hover:text-blue-900"
                >
                  Sign up here.
                </Link>
              </p>
            )}
          </div>
          <form className="mt-6 grid gap-4" onSubmit={submit}>
            <div className="grid gap-4">
              <Label htmlFor="email" className="text-blue-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <FormErrors param="email" errors={response.content?.errors || []} />
            </div>
            {mode === "signup" && (
              <div className="grid gap-4">
                <Label htmlFor="username" className="text-blue-700">Username</Label>
                <Input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <FormErrors param="username" errors={response.content?.errors || []} />
              </div>
            )}
            <div className="flex flex-col md:flex-row gap-6 md:items-center">
              <div className="flex flex-col gap-4 relative">
                <Label htmlFor="password" className="text-blue-700">Password</Label>
                <Input
                  id="password"
                  type={passwordVisible ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <FormErrors param="password" errors={response.content?.errors || []} />
              </div>
              {mode === "signup" && (
                <div className="flex flex-col gap-4 relative">
                  <Label htmlFor="password2" className="text-blue-700">Repeat Password</Label>
                  <Input
                    id="password2"
                    type={passwordVisible ? "text" : "password"}
                    required
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-1 top-4 right-3 flex items-center text-blue-600"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <FormErrors param="password2" errors={password2Errors} />
                </div>
              )}
            </div>
            {mode === "signup" && (
              <div className="grid gap-4">
                <Label htmlFor="role" className="text-blue-700">Role</Label>
                <select
                  id="role"
                  value={role}
                  required
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2 border border-blue-300 rounded bg-white text-blue-800 focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="" disabled>Select a role</option>
                  <option value="Hospital">Hospital</option>
                  <option value="CDO_HEALTH">CDO Health</option>
                </select>
                <FormErrors param="role" errors={response.content?.errors || []} />
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
              disabled={response.fetching}
            >
              {response.fetching ? <LoaderIcon className="animate-spin" /> : (mode === "signup" ? "Sign Up" : "Login")}
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="text-center text-sm text-blue-700 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-blue-900">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}

export { SignupForm as default };