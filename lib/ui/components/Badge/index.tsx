export const Badge = ({ children, variant }: any) => {
  const styles: any = {
    admin: "bg-purple-500/15 text-purple-500 dark:bg-purple-500/20 dark:text-purple-300",
    user:  "bg-muted text-muted-foreground",
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
};
