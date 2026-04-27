import { useForm } from "react-hook-form";

export function useForgotPasswordLogic() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return {
    register,
    handleSubmit,
    errors,
  };
}
