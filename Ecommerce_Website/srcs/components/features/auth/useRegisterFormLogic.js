import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "@/components/services/apiRegister";

export function useRegisterFormLogic() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await registerUser({ userData: data });

      setSuccess("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");
      setTimeout(() => {
        navigate("/home", { state: { modal: "login" } });
      }, 3000);
    } catch (err) {
      if (err.message.includes("already registered") || err.message.includes("đã được đăng ký")) {
        setError("Email này đã được đăng ký. Vui lòng dùng email khác hoặc đăng nhập.");
      } else {
        setError(err.message || "Đăng ký thất bại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    watch,
    onSubmit,
    loading,
    error,
    success,
  };
}
