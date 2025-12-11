const levelColor = (level?: number) => {
  switch (Number(level)) {
    case 1:
      return {
        bg: "bg-blue-50",
        text: "text-blue-600",
        border: "border-blue-200",
      };
    case 2:
      return {
        bg: "bg-orange-50",
        text: "text-orange-600",
        border: "border-orange-200",
      };
    case 3:
      return {
        bg: "bg-purple-50",
        text: "text-purple-600",
        border: "border-purple-200",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-600",
        border: "border-gray-300",
      };
  }
};
export default levelColor;
