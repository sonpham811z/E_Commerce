export const fetchPCComponents = async () => {
  return [
    {
      id: 1,
      name: "CPU",
      icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/3169cd3dab5620da0f9fd34581e2c0e28e8ef028"
    },
    // ...other components
  ];
};

export const calculateTotalPrice = (components) => {
  return components.reduce((total, component) => total + component.price, 0);
};