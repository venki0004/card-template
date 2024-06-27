
const StatusChip = ({ label, variant, onClick }: any) => {
  const styles = [
    "bg-greenShade text-primaryGreen",
    "bg-[#E5E7EB] text-secondaryGray",
  ];

  return (
    <span
      onClick={onClick}
      className={`${styles[variant]} cursor-pointer text-sm p-2 px-4 rounded-full`}
    >
      {label}
    </span>
  );
};

export default StatusChip;