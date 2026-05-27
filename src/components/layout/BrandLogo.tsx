type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = "h-10 w-auto" }: BrandLogoProps) {
  return <img src="/logo.png" alt="ACE" draggable={false} className={`object-contain ${className}`} />;
}
