export default function WhatsAppButton({ phone, message, label, className }) {
  if (!phone) return null
  
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  const formattedPhone = cleanPhone.startsWith('0') 
    ? '216' + cleanPhone.slice(1) 
    : cleanPhone
  
  const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message || 'Bonjour')}`
  
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className={className || "inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors text-sm font-medium"}
    >
      📱 {label || 'WhatsApp'}
    </a>
  )
}
