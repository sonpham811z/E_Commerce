import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { supabase } from "../services/supabase";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Lấy access_token và type từ hash URL (xử lý mọi trường hợp lặp #access_token=...)
  const getTokenAndTypeFromHash = () => {
    let hash = window.location.hash;
    // Loại bỏ tất cả ký tự # ở đầu
    while (hash.startsWith("#")) hash = hash.substring(1);
    // Nếu access_token bị lặp (access_token=#access_token=...), lấy phần cuối cùng access_token xuất hiện
    const lastAccessTokenIdx = hash.lastIndexOf("access_token=");
    if (lastAccessTokenIdx !== -1) {
      hash = hash.substring(lastAccessTokenIdx);
    }
    // Nếu có dấu ? phía sau hash, chỉ lấy phần trước dấu ?
    if (hash.includes("?")) {
      hash = hash.split("?")[0];
    }
    const params = new URLSearchParams(hash);
    return {
      access_token: params.get("access_token"),
      refresh_token: params.get("refresh_token"),
      type: params.get("type"),
    };
  };
  const { access_token, refresh_token, type } = getTokenAndTypeFromHash();

  const handleRequestNewLink = () => {
    navigate("/home", { state: { modal: "forgot-password" } });
  };

  // Nếu không có access_token hoặc type !== 'recovery', báo lỗi
  if (!access_token || type !== "recovery") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="text-red-600 text-5xl mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không thể đặt lại mật khẩu
          </h2>
          <p className="text-gray-600 mb-6">
            Link đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng
          </p>
          <button
            onClick={handleRequestNewLink}
            className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Yêu cầu link mới
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu không khớp");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (!access_token) {
      toast.error("Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn");
      return;
    }
    setIsLoading(true);
    try {
      // Đưa access_token và refresh_token vào session Supabase
      await supabase.auth.setSession({ access_token, refresh_token });
      // Xác thực access_token
      const { data: userData, error: verifyError } =
        await supabase.auth.getUser();
      if (verifyError || !userData?.user) {
        throw new Error(
          "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn hoặc đã được sử dụng"
        );
      }
      // Đổi mật khẩu trực tiếp
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password,
      });
      if (updateError) {
        if (updateError.status === 403) {
          throw new Error(
            "Token đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu link mới."
          );
        }
        throw updateError;
      }
      toast.success("Đặt lại mật khẩu thành công!");
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      // Đợi 2 giây rồi đóng tab trình duyệt
      setTimeout(() => {
        window.close();
      }, 2000);
    } catch (error) {
      console.error("Update password error:", error);
      toast.error(error.message || "Không thể cập nhật mật khẩu");
    } finally {
      setIsLoading(false);
    }
  };

  // Hiển thị form nhập mật khẩu mới
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Đặt lại mật khẩu
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Vui lòng nhập mật khẩu mới của bạn
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                type="password"
                name="password"
                placeholder="Mật khẩu mới"
                className="w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-red-500 transition"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
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
    </div>
  );
}
