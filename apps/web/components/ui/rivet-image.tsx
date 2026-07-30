import Image, { type ImageProps } from 'next/image';
import { resolveBlurDataURL } from '@/lib/blur';
import { cn } from '@/lib/utils';

type RivetImageProps = Omit<ImageProps, 'placeholder' | 'blurDataURL'> & {
  /** Skip blur placeholder (rare — e.g. decorative icons). */
  noBlur?: boolean;
  blurDataURL?: string;
};

/**
 * Brand image wrapper: next/image + Cloudinary/Unsplash loader + blur LQIP.
 * Prefer this over raw `next/image` for content media.
 */
export function RivetImage({
  className,
  noBlur,
  blurDataURL,
  alt,
  sizes,
  ...props
}: RivetImageProps) {
  const src = typeof props.src === 'string' ? props.src : undefined;

  return (
    <Image
      alt={alt}
      className={cn(className)}
      sizes={sizes ?? (props.fill ? '100vw' : undefined)}
      {...(noBlur
        ? {}
        : {
            placeholder: 'blur' as const,
            blurDataURL: blurDataURL ?? resolveBlurDataURL(src),
          })}
      {...props}
    />
  );
}
