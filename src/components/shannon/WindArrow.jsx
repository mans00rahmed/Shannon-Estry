export default function WindArrow({ direction, speed, size = 32 }) {
  const color = speed < 20 ? '#22c55e' : speed < 40 ? '#f59e0b' : '#ef4444'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      style={{ transform: `rotate(${direction}deg)`, display: 'inline-block' }}
    >
      <polygon points="16,2 22,26 16,21 10,26" fill={color} opacity="0.9" />
    </svg>
  )
}
