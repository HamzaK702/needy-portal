// src/pages/auth/ResetPassword.tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { resetPassword } from "@/supabase/auth/reset-password";
import { supabase } from "@/supabase/client";
import { Eye, EyeOff, Heart, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

type ResetPasswordValues = {
  newPassword: string;
  confirmPassword: string;
};

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<ResetPasswordValues>();

  // Check if we have a valid reset token and exchange it for session
  useEffect(() => {
    const checkToken = async () => {
      // IMPORTANT: Set recovery flag IMMEDIATELY if we detect recovery token in URL
      // This prevents auth hook from setting user before we can handle it
      const hash = window.location.hash;
      const hasRecoveryToken = hash.includes("type=recovery") || hash.includes("access_token");
      
      if (hasRecoveryToken) {
        // Set flag immediately to prevent auth hook from setting user
        sessionStorage.setItem("recovery_session_validated", "true");
        console.log("ResetPassword - Recovery token detected, flag set immediately");
      }
      
      // Log for debugging
      console.log("ResetPassword - Current hash:", hash);
      console.log("ResetPassword - Current pathname:", window.location.pathname);
      console.log("ResetPassword - Full URL:", window.location.href);
      
      // Check if we've already validated a recovery session (stored flag)
      const recoverySessionFlag = sessionStorage.getItem("recovery_session_validated");
      
      // First check if there's a recovery token in the URL
      if (hasRecoveryToken) {
        console.log("ResetPassword - Recovery token detected in hash");
        // Token is in hash - Supabase will process it automatically
        // Give it a moment to process, then check session
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error exchanging token:", error);
          setIsValidToken(false);
          sessionStorage.removeItem("recovery_session_validated");
          return;
        }
        
        // Check if this is a recovery token (type=recovery in hash)
        const isRecoveryToken = hash.includes("type=recovery");
        
        // If we have a session and recovery token in hash, it's valid
        if (session && isRecoveryToken) {
          // Mark this as a validated recovery session
          sessionStorage.setItem("recovery_session_validated", "true");
          setIsValidToken(true);
          // Clear the hash from URL for security
          window.history.replaceState(null, "", window.location.pathname);
        } else if (session && hash.includes("access_token")) {
          // Access token might be from recovery - Supabase processes it
          // If we have a session from access_token on reset-password route, assume it's recovery
          // Store flag to prevent redirect
          sessionStorage.setItem("recovery_session_validated", "true");
          setIsValidToken(true);
          window.history.replaceState(null, "", window.location.pathname);
        } else {
          // Wait a bit more and check again (hash might still be processing)
          await new Promise(resolve => setTimeout(resolve, 1000));
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (retrySession) {
            // If we got a session, it's likely from recovery token
            sessionStorage.setItem("recovery_session_validated", "true");
            setIsValidToken(true);
            window.history.replaceState(null, "", window.location.pathname);
          } else {
            setIsValidToken(false);
            sessionStorage.removeItem("recovery_session_validated");
          }
        }
      } else if (recoverySessionFlag === "true") {
        // We've already validated a recovery session, check if session still exists
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Session exists and we've validated it as recovery - allow password reset
          setIsValidToken(true);
        } else {
          // Session expired or was cleared
          setIsValidToken(false);
          sessionStorage.removeItem("recovery_session_validated");
        }
      } else {
        // Check if token is in query params (some email clients or Supabase redirect format)
        const token = searchParams.get("token");
        const type = searchParams.get("type");
        
        // Supabase sometimes uses query params: ?token=xxx&type=recovery
        if (token && type === "recovery") {
          console.log("ResetPassword - Recovery token found in query params");
          // Exchange the token for a session
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'recovery'
          });
          
          if (error) {
            console.error("Error verifying recovery token:", error);
            setIsValidToken(false);
          } else if (data.session) {
            sessionStorage.setItem("recovery_session_validated", "true");
            setIsValidToken(true);
            // Clear query params from URL
            window.history.replaceState(null, "", window.location.pathname);
          } else {
            setIsValidToken(false);
          }
        } else if (token) {
          // Token without type - try to verify it
          console.log("ResetPassword - Token found in query params (no type)");
          setIsValidToken(true);
          sessionStorage.setItem("recovery_session_validated", "true");
        } else {
          // No recovery token in URL and no validated recovery session
          // Check if user navigated here directly without recovery token
          const { data: { session } } = await supabase.auth.getSession();
          if (session && !recoverySessionFlag) {
            // User has a regular session but no recovery token - redirect to home
            // This prevents logged-in users from accessing reset password
            console.log("ResetPassword - Regular session detected, redirecting to home");
            navigate("/");
          } else {
            // No session and no token - invalid
            console.log("ResetPassword - No valid recovery token or session found");
            setIsValidToken(false);
          }
        }
      }
    };

    checkToken();
  }, [searchParams, navigate]);

  const onSubmit = async (data: ResetPasswordValues) => {
    try {
      await resetPassword({ newPassword: data.newPassword });
      
      // Clear recovery session flag
      sessionStorage.removeItem("recovery_session_validated");
      
      // Sign out after password reset to force re-login with new password
      await supabase.auth.signOut();
      
      toast({
        title: "Password reset successful!",
        description: "Your password has been updated. Please sign in with your new password.",
      });
      navigate("/sign-in");
    } catch (error: any) {
      toast({
        title: error.message || "Failed to reset password",
        variant: "destructive",
      });
    }
  };

  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Validating token...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                <Lock className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Invalid Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                Please request a new password reset link from the sign in page.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button asChild className="w-full">
              <Link to="/forgot-password">Request New Reset Link</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/sign-in">Back to Sign In</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="pl-10 pr-10"
                  {...register("newPassword", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-xs">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="pl-10 pr-10"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (val) =>
                      val === watch("newPassword") || "Passwords do not match",
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              to="/sign-in"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}


