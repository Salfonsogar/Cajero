export default function Machine({ children }) {
  return (
    <div className="rig">
      <div className="brand"><span>Cajero Automático</span></div>
      <div className="machine">
        <div className="cam"></div>
        {children}
      </div>
    </div>
  );
}
