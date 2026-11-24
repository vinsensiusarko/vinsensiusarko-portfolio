import { useState, useEffect } from 'react';
import { getWebpSource } from '@/utils/getWebpSource';

export function ResponsivePicture({
  src,
  fallbackSrc = '/assets/images/portfolio-1.png',
  pictureClassName,
  pictureAriaHidden,
  ...imgProps
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const effectiveSrc = failed ? fallbackSrc : src || fallbackSrc;
  const webpSrc = failed ? null : getWebpSource(effectiveSrc);

  return (
    <picture className={pictureClassName} aria-hidden={pictureAriaHidden}>
      {webpSrc ? <source srcSet={webpSrc} type="image/webp" /> : null}
      <img
        {...imgProps}
        src={effectiveSrc}
        onError={() => {
          if (!failed) {
            setFailed(true);
          }
        }}
      />
    </picture>
  );
}
