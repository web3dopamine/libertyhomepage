export function Floating3DShapes() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
      {/* Shape 1: Cube */}
      <div className="floating-shape-1 absolute top-20 left-10 w-32 h-32">
        <div className="w-full h-full border-2 border-primary/30 rounded-lg" style={{
          background: 'linear-gradient(135deg, rgba(46, 184, 184, 0.1) 0%, transparent 100%)',
          transform: 'rotateX(45deg) rotateY(45deg)',
          boxShadow: '0 0 40px rgba(46, 184, 184, 0.3)'
        }} />
      </div>

      {/* Shape 2: Circle */}
      <div className="floating-shape-2 absolute top-40 right-20 w-24 h-24">
        <div className="w-full h-full border-2 border-primary/20 rounded-full" style={{
          background: 'radial-gradient(circle, rgba(56, 178, 172, 0.15) 0%, transparent 70%)',
          boxShadow: '0 0 50px rgba(56, 178, 172, 0.4)'
        }} />
      </div>

      {/* Shape 3: Diamond */}
      <div className="floating-shape-3 absolute bottom-32 left-1/4 w-20 h-20">
        <div className="w-full h-full border-2 border-primary/25" style={{
          background: 'linear-gradient(45deg, rgba(102, 204, 204, 0.1) 0%, transparent 100%)',
          transform: 'rotate(45deg)',
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          boxShadow: '0 0 35px rgba(102, 204, 204, 0.35)'
        }} />
      </div>

      {/* Shape 4: Rounded square */}
      <div className="floating-shape-4 absolute top-1/2 right-1/4 w-28 h-28">
        <div className="w-full h-full border-2 border-primary/20 rounded-xl" style={{
          background: 'conic-gradient(from 0deg, rgba(46, 184, 184, 0.1), transparent, rgba(56, 178, 172, 0.1))',
          boxShadow: '0 0 45px rgba(46, 184, 184, 0.25)'
        }} />
      </div>

      {/* Shape 5: Small circle */}
      <div className="floating-shape-5 absolute bottom-20 right-32 w-16 h-16">
        <div className="w-full h-full border-2 border-primary/30 rounded-full" style={{
          background: 'radial-gradient(ellipse at center, rgba(102, 204, 204, 0.2) 0%, transparent 70%)',
          transform: 'rotateY(45deg)',
          boxShadow: '0 0 30px rgba(102, 204, 204, 0.4)'
        }} />
      </div>

      {/* Shape 6: Star */}
      <div className="floating-shape-6 absolute top-3/4 left-1/3 w-36 h-36">
        <div className="w-full h-full border border-primary/15" style={{
          background: 'linear-gradient(225deg, rgba(34, 136, 136, 0.05) 0%, transparent 100%)',
          clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
          boxShadow: '0 0 40px rgba(34, 136, 136, 0.3)'
        }} />
      </div>
    </div>
  );
}
