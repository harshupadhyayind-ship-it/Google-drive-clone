export const StatCard = ({
  title,
  value,
  icon,
  color,
}: any) => {
  const colors: any = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="p-4 bg-white border rounded-xl shadow-sm flex items-center gap-3">
      <div className={`p-2 rounded-lg ${colors[color]}`}>
        {icon}
      </div>

      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <h2 className="text-lg font-semibold">{value}</h2>
      </div>
    </div>
  );
};