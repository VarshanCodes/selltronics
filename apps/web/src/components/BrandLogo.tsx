import Image from 'next/image';

export const LOGO_ICON_URL = 'https://ik.imagekit.io/mzpoxy1gg/Picsart_26-10-27_16-51-36-713.png';
export const LOGO_TEXT_URL = 'https://ik.imagekit.io/mzpoxy1gg/Picsart_26-10-27_17-24-38-437.png';

interface BrandLogoProps {
  priority?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
}

export default function BrandLogo({ priority = false, className = '', size = 'md', withText = true }: BrandLogoProps) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div className={`site-brand-logo ${isSm ? 'brand-sm' : isLg ? 'brand-lg' : ''} ${className}`}>
      <span className="brand-icon-wrap" aria-hidden="true">
        <Image
          src={LOGO_ICON_URL}
          alt="Selltronics"
          width={isLg ? 68 : isSm ? 44 : 56}
          height={isLg ? 68 : isSm ? 44 : 56}
          priority={priority}
          className="brand-logo-img"
        />
      </span>
      {withText && (
        <Image
          src={LOGO_TEXT_URL}
          alt="Selltronics"
          width={185}
          height={48}
          priority={priority}
          className="brand-text-img"
        />
      )}
    </div>
  );
}

export function BrandMark({ className = '', size = 48 }: { className?: string; size?: number }) {
  return (
    <span className={`brand-mark ${className}`} aria-hidden="true">
      <Image
        src={LOGO_ICON_URL}
        alt="Selltronics"
        width={size}
        height={size}
        priority
        className="w-full h-full object-contain"
      />
    </span>
  );
}
