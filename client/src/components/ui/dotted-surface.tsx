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
            radial-gradient(circle at center, rgba(46, 184, 184, 0.8) 3px, transparent 3px),
            radial-gradient(circle at center, rgba(46, 184, 184, 0.6) 3px, transparent 3px)
          `,
          backgroundSize: '60px 60px',
          backgroundPosition: '0 0, 30px 30px',
          animation: 'dottedWave 12s ease-in-out infinite',
        }}
        {...props}
      />
      <style>{`
        @keyframes dottedWave {
          0%, 100% {
            background-position: 0 0, 30px 30px;
            opacity: 1;
          }
          25% {
            background-position: 15px -15px, 45px 15px;
            opacity: 0.7;
          }
          50% {
            background-position: 30px 0, 0 30px;
            opacity: 1;
          }
          75% {
            background-position: 15px 15px, 45px 45px;
            opacity: 0.7;
          }
        }
      `}</style>
    </>
  );
}
