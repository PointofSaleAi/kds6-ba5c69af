interface Flag86ButtonProps {
  productName: string;
}

export function Flag86Button({ productName }: Flag86ButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // eslint-disable-next-line no-console
    console.log(`86 tapped: ${productName}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onDoubleClick={(e) => e.stopPropagation()}
      aria-label={`86 ${productName}`}
      className="shrink-0 inline-flex items-center justify-center animate-flag86-pulse"
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        backgroundColor: '#DC2626',
        border: '2px solid #EF4444',
        marginLeft: 8,
        marginRight: 4,
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: '0.5px',
        lineHeight: 1,
        cursor: 'pointer',
      }}
    >
      86
    </button>
  );
}
