export const Skeleton = ({
  className = "h-4 w-full",
}: {
  className?: string;
}) => (
  <div className={`animate-pulse rounded-xl bg-teal-100/70 ${className}`} />
);

export const PageLoader = ({ label = "Loading..." }: { label?: string }) => (
  <div
    role="status"
    aria-live="polite"
    className="mx-auto flex max-w-md flex-col gap-3 px-6 py-12"
  >
    <span className="sr-only">{label}</span>
    <Skeleton className="h-6 w-1/2" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
  </div>
);
