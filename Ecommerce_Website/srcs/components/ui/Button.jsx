const Button = ({
  children,
  variant = "primary",
  size = "medium",
  icon,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variantStyles = {
    primary:
      "bg-black text-white hover:bg-gray-800 focus-visible:ring-black border-2 border-black rounded-md hover:rounded-xl",
    secondary:
      "bg-white text-black border border-gray-300 hover:bg-gray-50 focus-visible:ring-gray-400 rounded-md hover:rounded-xl",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 border-2 border-red-600 rounded-md hover:rounded-xl",
    ghost:
      "text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-300 rounded-md hover:rounded-xl", // Ghost
    link: "text-black underline-offset-4 hover:underline focus-visible:ring-gray-300 rounded-md hover:rounded-xl",
  };

  const sizeStyles = {
    small: "px-5 py-2 text-base",
    medium: "px-6 py-3 text-lg",
    large: "px-8 py-4 text-xl",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]}`}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
