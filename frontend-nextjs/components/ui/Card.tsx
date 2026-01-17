export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`bg-white shadow-md rounded-lg p-8 ${className}`}>
      {children}
    </div>
  );
};