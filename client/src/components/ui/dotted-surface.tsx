import { cn } from '@/lib/utils';

type DottedSurfaceProps = Omit<React.ComponentProps<'div'>, 'ref'>;

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
  return (
    <>
      <div
        className={cn('pointer-events-none fixed inset-0 overflow-hidden', className)}
        style={{
          zIndex: 1,
          backgroundImage: `
            radial-gradient(circle at center, #2EB8B8 4px, transparent 4px)
          `,
          backgroundSize: '80px 80px',
          opacity: 0.15,
        }}
        {...props}
      />
    </>
  );
}
