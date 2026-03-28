export const Section = ({
  title,
  children,
}: any) => {
  return (
    <section>
      <h2 className="text-lg font-medium mb-3 text-foreground">
        {title}
      </h2>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {children}
      </div>
    </section>
  );
};
