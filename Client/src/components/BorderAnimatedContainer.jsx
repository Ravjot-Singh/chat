
function BorderAnimatedContainer({ children }) {
  return (
    <div
      className="
        w-full h-full
        border-animated
        rounded-2xl
        border border-transparent
        flex overflow-hidden
      "
    >
      {children}
    </div>
  );
}

export default BorderAnimatedContainer;