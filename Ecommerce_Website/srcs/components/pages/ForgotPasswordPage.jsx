import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedPage from "@/components/ui/AnimatedPage";
import { toast } from "react-hot-toast";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost/Do_An_Web/IS207_P21/php_files/forgotpassword.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Có lỗi xảy ra khi gửi yêu cầu");
      }

      // Hiển thị thông báo thành công
      toast.success(data.message);

      // Chuyển hướng đến trang thông báo kiểm tra email
      navigate("/reset-password-notice");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg font-sans mt-12 mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">
          Quên mật khẩu?
        </h2>
        <p className="text-gray-600 text-center mb-8">
          Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Nhập email của bạn"
              className="w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-red-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
          >
            {isLoading ? "Đang gửi..." : "Gửi yêu cầu đặt lại mật khẩu"}
          </button>
        </form>
      </div>
    </AnimatedPage>
  );
}
