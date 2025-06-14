import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Notification Modal Component with blur background
const NotificationModal = ({ isOpen, onClose, message, type }) => {
  if (!isOpen) return null;

  // Auto close after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md transition-opacity">
      <div className="bg-white bg-opacity-90 rounded-lg shadow-xl w-80 overflow-hidden transform transition-all">
        <div
          className={`p-1 ${
            type === "success" ? "bg-[#1399c6]" : "bg-red-500"
          }`}
        ></div>
        <div className="p-4">
          <div className="flex items-center mb-3">
            {type === "success" ? (
              <div className="bg-green-100 rounded-full p-2 mr-3">
                <svg
                  className="w-6 h-6 text-[#1399c6]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            ) : (
              <div className="bg-red-100 rounded-full p-2 mr-3">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            )}
            <h3 className="text-lg font-medium text-gray-900">
              {type === "success" ? "Success" : "Error"}
            </h3>
          </div>
          <p className="text-gray-700">{message}</p>
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-md text-white ${
                type === "success"
                  ? "bg-[#1399c6] hover:bg-[#1399c6]"
                  : "bg-red-500 hover:bg-red-600"
              } transition-colors`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SignUp = () => {
  const navigate = useNavigate();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const googleBtnRef = useRef(null);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);

  // State for modal
  const [modal, setModal] = useState({
    isOpen: false,
    message: "",
    type: "success", // 'success' or 'error'
  });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    password: "",
  });

  // //////////////////////
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  const showNotification = (message, type) => {
    setModal({
      isOpen: true,
      message,
      type,
    });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Add withCredentials to ensure cookies are sent/received
      const res = await axios.post(
        "http://localhost:5000/user/signup",
        formData,
        {
          withCredentials: true,
        }
      );

      console.log("Regular signup response:", res.data);
      showNotification(res.data.message, "success");

      // Store user info
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Make sure to store the token
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        console.log("Token stored successfully:", res.data.token);
      } else {
        console.warn("No token received from signup API");
      }

      window.dispatchEvent(new Event("loginStateChanged"));

      // Slight delay before navigation to allow users to see the success message
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error("Signup error:", err);
      showNotification(err.response?.data?.message || "Signup failed", "error");
    }
  };

  // ////////////////////////
  const handleSendOtp = async () => {
    // Validate all fields before sending OTP
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.mobileNumber ||
      !formData.password
    ) {
      showNotification(
        "Please fill all fields before verifying email",
        "error"
      );
      return;
    }

    try {
      setIsVerifying(true);

      // Call your existing send-otp endpoint with all user data
      const res = await axios.post(
        "http://localhost:5000/user/send-otp",
        {
          fullName: formData.fullName,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
          password: formData.password,
        },
        {
          withCredentials: true,
        }
      );

      console.log("OTP sent response:", res.data);
      showNotification(
        "OTP sent successfully to your email address",
        "success"
      );
      setOtpSent(true);

      // ////
      // Start resend timer
      setResendTimer(60);
      setCanResend(false);
    } catch (err) {
      console.error("OTP sending error:", err);
      showNotification(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to send OTP",
        "error"
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyAndSignup = async () => {
    if (!otp) {
      showNotification("Please enter OTP", "error");
      return;
    }

    try {
      setIsVerifying(true);

      // Call your existing verify-otp-signup endpoint
      const verifyRes = await axios.post(
        "http://localhost:5000/user/verify-otp-signup",
        {
          email: formData.email,
          otp: otp,
        },
        {
          withCredentials: true,
        }
      );

      console.log("Verification response:", verifyRes.data);
      showNotification("Account created and verified successfully!", "success");

      // Store user info
      localStorage.setItem("user", JSON.stringify(verifyRes.data.user));

      // Store the token
      if (verifyRes.data.token) {
        localStorage.setItem("token", verifyRes.data.token);
        console.log("Token stored successfully:", verifyRes.data.token);
      }

      window.dispatchEvent(new Event("loginStateChanged"));

      // Navigate to home page after a short delay
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error("OTP verification error:", err);
      showNotification(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "OTP verification failed",
        "error"
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // ///////////////////////////
  const handleResendOtp = async () => {
    try {
      setIsVerifying(true);

      const res = await axios.post(
        "http://localhost:5000/user/resend-otp",
        {
          email: formData.email,
        },
        {
          withCredentials: true,
        }
      );

      console.log("OTP resent response:", res.data);
      showNotification(
        "OTP resent successfully to your email address",
        "success"
      );

      // Reset timer
      setResendTimer(60);
      setCanResend(false);
    } catch (err) {
      console.error("Resend OTP error:", err);
      showNotification(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to resend OTP",
        "error"
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGoogleCallback = async (response) => {
    try {
      console.log("Google response received:", response);

      const result = await axios.post(
        "http://localhost:5000/user/google-auth",
        {
          token: response.credential,
        },
        { withCredentials: true }
      ); // Enable credentials to allow cookies

      console.log("Server response:", result.data);
      showNotification(result.data.message, "success");

      // Store user and token securely in localStorage
      localStorage.setItem("user", JSON.stringify(result.data.user));

      // Make sure to store the token
      if (result.data.token) {
        localStorage.setItem("token", result.data.token);
        console.log("Token stored successfully:", result.data.token);
      } else {
        console.warn("No token received from Google auth API");
      }

      // Fire login state change event
      window.dispatchEvent(new Event("loginStateChanged"));

      // Navigate to home page after a short delay
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Google Auth Error:", error);
      showNotification(
        error.response?.data?.message || "Google authentication failed",
        "error"
      );
    }
  };

  const initializeGoogleLogin = () => {
    if (!window.google || !googleBtnRef.current) {
      console.error(
        "Google Identity Services not loaded or button ref not available"
      );
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCallback,
      });

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        text: "signup_with",
        shape: "pill",
        logo_alignment: "center",
        width: 280,
      });

      // Also display the One Tap prompt
      window.google.accounts.id.prompt();

      console.log("Google button initialized");
    } catch (error) {
      console.error("Failed to initialize Google button:", error);
    }
  };

  useEffect(() => {
    // Check if client ID is available
    if (!clientId) {
      console.error(
        "Google Client ID is missing. Please check your environment variables."
      );
      return;
    }

    // Load the Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("Google Identity Services script loaded");
      setGoogleScriptLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Google Identity Services script");
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [clientId]);

  // Initialize Google Sign-In after the script is loaded
  useEffect(() => {
    if (googleScriptLoaded) {
      initializeGoogleLogin();
    }
  }, [googleScriptLoaded]);

  // ///////////////////
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-white overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-[-50px] left-[-50px] w-60 h-60 bg-[#1399c6] opacity-20 rounded-full z-0"></div>
      <div className="absolute bottom-[-60px] right-[-40px] w-72 h-72 bg-[#2AB3E6] opacity-20 rounded-full z-0"></div>
      <div className="absolute top-[200px] left-[-80px] w-40 h-40 bg-[#016D6D] opacity-20 rounded-full z-0"></div>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-96 text-center z-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Create Account
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1399c6]"
          />
          <input
            type="email"
            name="email"
            placeholder="Email ID"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1399c6]"
          />

          {/* //////////////////////// */}
          <input
            type="tel"
            name="mobileNumber"
            placeholder="Mobile Number"
            value={formData.mobileNumber}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1399c6]"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1399c6]"
          />

          {/* //////////////////////////////// */}
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={isVerifying || otpSent}
            className={`w-full p-3 text-white font-semibold rounded-lg transition-all ${
              otpSent
                ? "bg-green-500 cursor-not-allowed"
                : "bg-gradient-to-r from-[#1399c6] to-[#2AB3E6] hover:from-[#0e7fa3] hover:to-[#1a9acc]"
            }`}
          >
            {isVerifying
              ? "Sending OTP..."
              : otpSent
              ? "OTP Sent to Email ✓"
              : "Verify Email"}
          </button>

          {/* OTP INPUT FIELD - SHOWS ONLY AFTER OTP IS SENT */}
          {otpSent && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter OTP received in email"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                className="w-full p-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1399c6]"
              />

              {/* Resend OTP Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || isVerifying}
                  className={`text-sm px-4 py-2 rounded-md transition-all ${
                    canResend && !isVerifying
                      ? "text-[#1399c6] hover:bg-blue-50 cursor-pointer"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isVerifying
                    ? "Resending..."
                    : resendTimer > 0
                    ? `Resend OTP in ${resendTimer}s`
                    : "Resend OTP"}
                </button>
              </div>
            </div>
          )}
        </form>

       
        {/* /////////////////////////////////////// */}
        <div className="mt-4">
          <button
            onClick={handleVerifyAndSignup}
            disabled={!otpSent || !otp || isVerifying}
            className={`w-full p-3 text-white font-semibold rounded-lg transition-all ${
              !otpSent || !otp
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-[#1399c6] to-[#2AB3E6] hover:from-[#0e7fa3] hover:to-[#1a9acc]"
            }`}
          >
            {isVerifying
              ? "Verifying & Creating Account..."
              : "Verify & Sign Up"}
          </button>
        </div>

        <div className="my-6 flex justify-center items-center">
          <div className="border-t border-gray-300 flex-grow"></div>
          <div className="mx-4 text-gray-500">or</div>
          <div className="border-t border-gray-300 flex-grow"></div>
        </div>

        <div className="flex justify-center my-4">
          <div
            id="googleSignInButton"
            ref={googleBtnRef}
            className="w-full flex justify-center"
          ></div>
        </div>

        {!googleScriptLoaded && (
          <p className="text-sm text-gray-500">Loading Google Sign-Up...</p>
        )}

        <p className="mt-4 text-gray-600">
          Already have an account?
          <a
            href="/login"
            className="text-[#1399c6] font-medium hover:underline"
          >
            {" "}
            Log in
          </a>
        </p>
      </div>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
};

export default SignUp;
