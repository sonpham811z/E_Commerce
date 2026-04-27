function Button({ children, variant = "primary", ...props }) {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 hover:bg-gray-50",
  };

  return (
    <button
      className={`px-4 py-2 rounded-md transition-colors ${variants[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
