import { useReducer, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

type ObjectFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
type ObjectPosition = 'center' | 'top' | 'bottom' | 'left' | 'right' | string;

interface ImageProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'width' | 'height'
> {
  src: string;
  alt: string;
  /** Explicit width — required when layout="fixed" */
  width?: number | string;
  /** Explicit height — required when layout="fixed" */
  height?: number | string;
  /**
   * fixed    — exact width/height, no scaling
   * responsive — scales with container, preserves aspect ratio via aspectRatio
   * fill     — stretches to fill the parent (parent must be position:relative with a defined size)
   * intrinsic — like responsive but won't scale beyond its natural size
   */
  layout?: 'fixed' | 'responsive' | 'fill' | 'intrinsic';
  /** CSS aspect-ratio value, e.g. "16/9", "4/3", "1/1". Used when layout="responsive". */
  aspectRatio?: string;
  objectFit?: ObjectFit;
  objectPosition?: ObjectPosition;
  /** Show a skeleton shimmer while loading */
  placeholder?: 'blur' | 'skeleton' | 'none';
  /** Base64 data URI used as the blur placeholder src */
  blurDataURL?: string;
  /** Fallback src or element when the image fails to load */
  fallbackSrc?: string;
  fallback?: React.ReactNode;
  /** Render as a circular avatar */
  rounded?: boolean | 'sm' | 'md' | 'lg' | 'full';
  /** Tailwind priority — skips lazy loading for above-the-fold images */
  priority?: boolean;
  /** Called when the image finishes loading */
  onLoad?: () => void;
  /** Called when the image fails to load */
  onError?: () => void;
  /** Wrapper className */
  wrapperClassName?: string;
}

const ROUNDED_MAP = {
  true: 'rounded',
  false: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
} as const;

const FIT_MAP: Record<ObjectFit, string> = {
  contain: 'object-contain',
  cover: 'object-cover',
  fill: 'object-fill',
  none: 'object-none',
  'scale-down': 'object-scale-down',
};

// 1×1 transparent gif — default blur placeholder
const TRANSPARENT_GIF =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

type ImageState = {
  status: 'loading' | 'loaded' | 'error';
  currentSrc: string;
};

type ImageAction = { type: 'load' } | { type: 'error'; fallbackSrc?: string };

function imageReducer(state: ImageState, action: ImageAction): ImageState {
  if (action.type === 'load') return { ...state, status: 'loaded' };
  if (action.fallbackSrc && state.currentSrc !== action.fallbackSrc) {
    return { status: 'loading', currentSrc: action.fallbackSrc };
  }
  return { ...state, status: 'error' };
}

function getLayout(
  layout: NonNullable<ImageProps['layout']>,
  width: ImageProps['width'],
  height: ImageProps['height'],
  aspectRatio?: string
) {
  const ratio =
    aspectRatio ?? (width && height ? `${width}/${height}` : undefined);
  switch (layout) {
    case 'fill':
      return {
        wrapper: 'absolute inset-0 block overflow-hidden',
        image: 'absolute inset-0 h-full w-full',
        style: undefined,
      };
    case 'fixed':
      return {
        wrapper: 'relative inline-block shrink-0 overflow-hidden',
        image: 'block h-full w-full',
        style: { width, height },
      };
    case 'intrinsic':
      return {
        wrapper: 'relative block overflow-hidden',
        image: 'block h-auto w-full',
        style: { maxWidth: width, aspectRatio: ratio },
      };
    default:
      return {
        wrapper: 'relative block w-full overflow-hidden',
        image: ratio ? 'absolute inset-0 h-full w-full' : 'block h-auto w-full',
        style: { aspectRatio: ratio },
      };
  }
}

// react-doctor-disable-next-line deslop/unused-export
export function Image(props: ImageProps) {
  // A new source owns a new lifecycle, including its cached-load check and fallback.
  return <ImageLifecycle key={props.src} {...props} />;
}

function ImagePlaceholder({
  placeholder,
  blurDataURL,
  objectFit,
  objectPosition,
}: Pick<ImageProps, 'placeholder' | 'blurDataURL' | 'objectPosition'> & {
  objectFit: ObjectFit;
}) {
  if (placeholder === 'skeleton') {
    return <span className="absolute inset-0 animate-pulse bg-muted" />;
  }
  if (placeholder === 'blur') {
    return (
      <img
        src={blurDataURL ?? TRANSPARENT_GIF}
        alt=""
        aria-hidden
        className={cn(
          'absolute inset-0 h-full w-full scale-110 blur-sm',
          FIT_MAP[objectFit]
        )}
        style={{ objectPosition }}
      />
    );
  }
  return null;
}

function ImageLifecycle({
  src,
  alt,
  width,
  height,
  layout = 'responsive',
  aspectRatio,
  objectFit = 'cover',
  objectPosition = 'center',
  placeholder = 'skeleton',
  blurDataURL,
  fallbackSrc,
  fallback,
  rounded = false,
  priority = false,
  onLoad,
  onError,
  className,
  wrapperClassName,
  style,
  ...rest
}: ImageProps) {
  const [state, dispatch] = useReducer(imageReducer, {
    status: 'loading',
    currentSrc: src,
  });
  const imgRef = useRef<HTMLImageElement>(null);

  // Also check fallback sources: cached images may complete before a load event.
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      dispatch({ type: 'load' });
    }
  }, [state.currentSrc]);

  function handleLoad() {
    dispatch({ type: 'load' });
    onLoad?.();
  }

  function handleError() {
    dispatch({ type: 'error', fallbackSrc });
    onError?.();
  }

  const { status, currentSrc } = state;

  const roundedClass =
    typeof rounded === 'boolean'
      ? ROUNDED_MAP[String(rounded) as 'true' | 'false']
      : ROUNDED_MAP[rounded];

  const sizing = getLayout(layout, width, height, aspectRatio);
  const isLoading = status === 'loading';

  return (
    <span
      className={cn(sizing.wrapper, roundedClass, wrapperClassName)}
      style={sizing.style}
    >
      {isLoading && (
        <ImagePlaceholder
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          objectFit={objectFit}
          objectPosition={objectPosition}
        />
      )}
      {status === 'error' && fallback ? (
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            layout === 'responsive' && 'bg-muted text-muted-foreground'
          )}
        >
          {fallback}
        </span>
      ) : (
        <img
          key={currentSrc}
          ref={imgRef}
          src={currentSrc}
          data-src={layout === 'fill' ? currentSrc : undefined}
          alt={alt}
          width={layout === 'fixed' ? width : undefined}
          height={layout === 'fixed' ? height : undefined}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            sizing.image,
            FIT_MAP[objectFit],
            roundedClass,
            isLoading && placeholder === 'blur' && 'opacity-0',
            status === 'loaded' &&
              placeholder === 'blur' &&
              'transition-opacity duration-300',
            className
          )}
          style={{ objectPosition, ...style }}
          {...rest}
        />
      )}
    </span>
  );
}

// --- Convenience variants ---

interface AvatarImageProps extends Omit<
  ImageProps,
  'layout' | 'rounded' | 'objectFit'
> {
  size?: number;
}

export function AvatarImage({
  size = 40,
  className,
  wrapperClassName,
  ...props
}: AvatarImageProps) {
  return (
    <Image
      layout="fixed"
      width={size}
      height={size}
      objectFit="cover"
      rounded="full"
      placeholder="skeleton"
      className={className}
      wrapperClassName={wrapperClassName}
      {...props}
    />
  );
}

interface HeroImageProps extends Omit<ImageProps, 'layout' | 'objectFit'> {
  aspectRatio?: string;
}

// react-doctor-disable-next-line deslop/unused-export
export function HeroImage({ aspectRatio = '16/9', ...props }: HeroImageProps) {
  return (
    <Image
      layout="responsive"
      aspectRatio={aspectRatio}
      objectFit="cover"
      priority
      placeholder="skeleton"
      {...props}
    />
  );
}

interface ThumbnailImageProps extends Omit<ImageProps, 'layout' | 'objectFit'> {
  aspectRatio?: string;
}

// react-doctor-disable-next-line deslop/unused-export
export function ThumbnailImage({
  aspectRatio = '16/9',
  rounded = 'md',
  ...props
}: ThumbnailImageProps) {
  return (
    <Image
      layout="responsive"
      aspectRatio={aspectRatio}
      objectFit="cover"
      rounded={rounded}
      placeholder="skeleton"
      {...props}
    />
  );
}
