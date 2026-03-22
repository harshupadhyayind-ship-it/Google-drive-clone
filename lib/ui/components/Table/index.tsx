import * as React from "react";

export const Table = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        {children}
      </table>
    </div>
  );
};