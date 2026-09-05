export default function Screen({ children }) {
  return (
    <div className="screen-frame">
      <div className="screen">
        {children}
      </div>
    </div>
  );
}
