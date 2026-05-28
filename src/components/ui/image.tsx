import { useReducer, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

type ObjectFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
type ObjectPosition = 'center' | 'top' | 'bottom' | 'left' | 'right' | string;

interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'> {
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
  prevSrc: string;
};

type ImageAction =
  | { type: 'load' }
  | { type: 'error'; fallbackSrc?: string }
  | { type: 'src_changed'; src: string };

function imageReducer(state: ImageState, action: ImageAction): ImageState {
  switch (action.type) {
    case 'load':
      return { ...state, status: 'loaded' };
    case 'error':
      if (action.fallbackSrc && state.currentSrc !== action.fallbackSrc) {
        return { ...state, currentSrc: action.fallbackSrc };
      }
      return { ...state, status: 'error' };
    case 'src_changed':
      return { status: 'loading', currentSrc: action.src, prevSrc: action.src };
    default:
      return state;
  }
}

// react-doctor-disable-next-line deslop/unused-export
export function Image({
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
    prevSrc: src,
  });

  // Sync src prop changes without derived state
  if (src !== state.prevSrc) {
    dispatch({ type: 'src_changed', src });
  }

  const imgRef = useRef<HTMLImageElement>(null);

  // If the image is already cached the load event fires before React mounts — check immediately
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      dispatch({ type: 'load' });
    }
  }, []);

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

  const fitClass = FIT_MAP[objectFit];

  // --- layout="fill": absolutely fills its positioned parent ---
  if (layout === 'fill') {
    return (
      <span
        className={cn('absolute inset-0 block overflow-hidden', roundedClass, wrapperClassName)}
      >
        {status === 'loading' && placeholder === 'skeleton' && (
          <span className="absolute inset-0 animate-pulse bg-muted" />
        )}
        {status === 'error' && fallback ? (
          <span className="absolute inset-0 flex items-center justify-center">{fallback}</span>
        ) : (
          <img
            ref={imgRef}
            src={placeholder === 'blur' ? (blurDataURL ?? TRANSPARENT_GIF) : currentSrc}
            data-src={currentSrc}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              'absolute inset-0 h-full w-full',
              fitClass,
              roundedClass,
              status === 'loading' && placeholder === 'blur' ? 'scale-110 blur-sm' : '',
              status === 'loaded' ? 'scale-100 blur-0 transition-all duration-300' : '',
              className
            )}
            style={{ objectPosition, ...style }}
            {...rest}
          />
        )}
        {/* swap in real src after mount for blur placeholder */}
        {placeholder === 'blur' && status === 'loading' && (
          <img
            src={currentSrc}
            alt=""
            aria-hidden
            className="sr-only"
            onLoad={() => {
              if (imgRef.current) imgRef.current.src = currentSrc;
            }}
          />
        )}
      </span>
    );
  }

  // --- layout="fixed": exact pixel size, no scaling ---
  if (layout === 'fixed') {
    return (
      <span
        className={cn('relative inline-block shrink-0 overflow-hidden', roundedClass, wrapperClassName)}
        style={{ width, height }}
      >
        {status === 'loading' && placeholder === 'skeleton' && (
          <span className="absolute inset-0 animate-pulse bg-muted" />
        )}
        {status === 'error' && fallback ? (
          <span className="absolute inset-0 flex items-center justify-center">{fallback}</span>
        ) : (
          <img
            ref={imgRef}
            src={currentSrc}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            className={cn('block h-full w-full', fitClass, roundedClass, className)}
            style={{ objectPosition, ...style }}
            {...rest}
          />
        )}
      </span>
    );
  }

  // --- layout="intrinsic": responsive but capped at natural size ---
  if (layout === 'intrinsic') {
    return (
      <span
        className={cn('relative block overflow-hidden', roundedClass, wrapperClassName)}
        style={{ maxWidth: width, aspectRatio: aspectRatio ?? (width && height ? `${width}/${height}` : undefined) }}
      >
        {status === 'loading' && placeholder === 'skeleton' && (
          <span className="absolute inset-0 animate-pulse bg-muted" />
        )}
        {status === 'error' && fallback ? (
          <span className="absolute inset-0 flex items-center justify-center">{fallback}</span>
        ) : (
          <img
            ref={imgRef}
            src={currentSrc}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            className={cn('block h-auto w-full', fitClass, roundedClass, className)}
            style={{ objectPosition, ...style }}
            {...rest}
          />
        )}
      </span>
    );
  }

  // --- layout="responsive" (default): scales to 100% width, aspect ratio via CSS ---
  const resolvedAspectRatio =
    aspectRatio ?? (width && height ? `${width}/${height}` : undefined);

  return (
    <span
      className={cn('relative block w-full overflow-hidden', roundedClass, wrapperClassName)}
      style={{ aspectRatio: resolvedAspectRatio }}
    >
      {status === 'loading' && placeholder === 'skeleton' && (
        <span className="absolute inset-0 animate-pulse bg-muted" />
      )}
      {status === 'error' && fallback ? (
        <span className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
          {fallback}
        </span>
      ) : (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            resolvedAspectRatio ? 'absolute inset-0 h-full w-full' : 'block h-auto w-full',
            fitClass,
            roundedClass,
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

interface AvatarImageProps extends Omit<ImageProps, 'layout' | 'rounded' | 'objectFit'> {
  size?: number;
}

export function AvatarImage({ size = 40, className, wrapperClassName, ...props }: AvatarImageProps) {
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
export function ThumbnailImage({ aspectRatio = '16/9', rounded = 'md', ...props }: ThumbnailImageProps) {
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
