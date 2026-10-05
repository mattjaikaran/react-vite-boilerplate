import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Image } from './image';

describe('Image lifecycle', () => {
  it('loads the real fill source rather than completing when its blur placeholder loads', () => {
    const onLoad = vi.fn();
    const onError = vi.fn();
    const { container } = render(
      <Image
        src="/photo.jpg"
        alt="Photo"
        layout="fill"
        placeholder="blur"
        blurDataURL="/blur.jpg"
        fallbackSrc="/backup.jpg"
        fallback="Unavailable"
        onLoad={onLoad}
        onError={onError}
      />
    );
    const photo = screen.getByAltText('Photo');
    expect(photo).toHaveAttribute('src', '/photo.jpg');
    fireEvent.load(container.querySelector('img[aria-hidden]')!);
    expect(onLoad).not.toHaveBeenCalled();
    expect(photo).toHaveClass('opacity-0');
    fireEvent.error(photo);
    expect(screen.getByAltText('Photo')).toHaveAttribute('src', '/backup.jpg');
    expect(onError).toHaveBeenCalledTimes(1);
    fireEvent.error(screen.getByAltText('Photo'));
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });

  it('resets a failed source and recognizes a cached replacement without a load event', () => {
    const { rerender } = render(
      <Image src="/broken.jpg" alt="Photo" fallback="Unavailable" />
    );
    fireEvent.error(screen.getByAltText('Photo'));
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
    const complete = vi
      .spyOn(HTMLImageElement.prototype, 'complete', 'get')
      .mockReturnValue(true);
    const naturalWidth = vi
      .spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get')
      .mockReturnValue(120);
    try {
      rerender(<Image src="/cached.jpg" alt="Photo" fallback="Unavailable" />);
      expect(screen.queryByText('Unavailable')).not.toBeInTheDocument();
      expect(screen.getByAltText('Photo')).toHaveAttribute(
        'src',
        '/cached.jpg'
      );
      expect(
        screen
          .getByAltText('Photo')
          .parentElement?.querySelector('.animate-pulse')
      ).toBeNull();
    } finally {
      complete.mockRestore();
      naturalWidth.mockRestore();
    }
  });
});
