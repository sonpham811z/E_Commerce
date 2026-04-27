import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import AnimatedPage from "@/components/ui/AnimatedPage";
import { toast } from "react-hot-toast";

export default function ResetPasswordForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  // Get token from URL parameters - check both hash and search parameters
  useEffect(() => {
    const getTokenFromHash = () => {
      const hash = window.location.hash;
      if (hash) {
        // Remove the leading '#' and parse the remaining string
        const params = new URLSearchParams(hash.substring(1));
        return params.get("access_token");
      }
      return null;
    };

    const getTokenFromQuery = () => {
      return searchParams.get("token") || searchParams.get("access_token");
    };

    // Try to get token from different sources
    const token = getTokenFromHash() || getTokenFromQuery();

    if (token) {
      console.log("Token found:", token.substring(0, 10) + "..."); // Log first 10 chars for debugging
      sessionStorage.setItem("reset_token", token);
      // Clear URL but keep the path
      window.history.replaceState(null, "", location.pathname);
    } else {
      console.log("No token found in URL");
      const storedToken = sessionStorage.getItem("reset_token");
      if (!storedToken) {
        console.log("No token in session storage");
      }
    }
  }, [location.pathname, searchParams]);

  // Get token from session storage
  const token = sessionStorage.getItem("reset_token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Mật khẩu không khớp");
      }

      if (formData.password.length < 6) {
        throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
      }

      if (!token) {
        throw new Error("Token không hợp lệ hoặc đã hết hạn");
      }

      console.log(
        "Sending reset request with token:",
        token.substring(0, 10) + "..."
      ); // Log first 10 chars for debugging

      const response = await fetch(
        "http://localhost/Do_An_Web/IS207_P21/php_files/resetpassword.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Có lỗi xảy ra khi đặt lại mật khẩu");
      }

      toast.success("Đặt lại mật khẩu thành công!");

      // Clear the reset token from session storage
      sessionStorage.removeItem("reset_token");

      // Chuyển hướng về trang chủ với modal đăng nhập
      setTimeout(() => {
        navigate("/home", { state: { modal: "login" } });
      }, 2000);
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Nếu không có token, chuyển hướng về trang quên mật khẩu
  useEffect(() => {
    if (!token) {
      console.log("No token available, redirecting to forgot password");
      toast.error("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn");
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  if (!token) return null;

  return (
    <AnimatedPage>
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg font-sans mt-12 mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">
          Đặt lại mật khẩu
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu mới"
              className="w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-red-500 transition"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Xác nhận mật khẩu mới"
              className="w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-red-500 transition"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
          >
            {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </button>
        </form>
      </div>
    </AnimatedPage>
  );
}
