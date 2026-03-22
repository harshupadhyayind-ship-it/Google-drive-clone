export const Badge = ({ children, variant }: any) => {
  const styles: any = {
    admin: "bg-purple-100 text-purple-600",
    user: "bg-gray-100 text-gray-600",
  };

  return (
    <span className={`px-2 py-1 rounded text-xs ${styles[variant]}`}>
      {children}
    </span>
  );
};