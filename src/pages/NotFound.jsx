import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-ulysse-night">
      <div className="text-center">
        <h1 className="font-display text-6xl text-ulysse-gold mb-4">404</h1>
        <p className="text-gray-400 text-lg mb-6">Cette page n'existe pas encore...</p>
        <button onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-ulysse-gold text-ulysse-night font-semibold rounded-lg hover:bg-ulysse-gold/90">
          Retour à L'Ithaque
        </button>
      </div>
    </div>
  )
}