export type ButtonProps = {
  children: React.ReactNode;
  variant?: "default" | "outline";
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
};