// src/icons.jsx

export const Home2 = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"          // 👈 inherits from parent color
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transition: 'color 0.25s ease, stroke 0.25s ease' }}
  >
    <path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9" />
    <path d="M9 22V12h6v10M2 10.6L12 2l10 8.6" />
  </svg>
)

export const Tag = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transition: 'color 0.25s ease, stroke 0.25s ease' }}
  >
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
)

export const PieChart3 = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transition: 'color 0.25s ease, stroke 0.25s ease' }}
  >
    <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
    <path d="M19 6l-7 6V2.5" />
  </svg>
)

export const CheckSquare = ({ size = 18 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor" // inherits color
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transition: 'color 0.25s ease, stroke 0.25s ease' }}
  >
    {/* outer square */}
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    {/* check mark */}
    <polyline points="9 11 12 14 22 4" />
  </svg>
)