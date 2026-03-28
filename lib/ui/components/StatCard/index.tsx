export const StatCard = ({
  title,
  value,
  icon,
  color,
}: any) => {
  const colors: any = {
    blue:   "bg-blue-500/15 text-blue-400 dark:bg-blue-500/20 dark:text-blue-300",
    green:  "bg-green-500/15 text-green-500 dark:bg-green-500/20 dark:text-green-300",
    purple: "bg-purple-500/15 text-purple-500 dark:bg-purple-500/20 dark:text-purple-300",
    orange: "bg-orange-500/15 text-orange-500 dark:bg-orange-500/20 dark:text-orange-300",
  };

  return (
    <div className="p-4 bg-card border border-border rounded-xl shadow-sm flex items-center gap-3">
      <div className={`p-2 rounded-lg ${colors[color]}`}>
        {icon}
      </div>

      <div>
        <p className="text-xs text-muted-foreground">{title}</p>
        <h2 className="text-lg font-semibold text-foreground">{value}</h2>
      </div>
    </div>
  );
};
