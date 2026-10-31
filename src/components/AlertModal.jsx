import { useState } from 'react'
import Modal from './Modal'

let globalShowAlert = null

export function showAlert(title, message, type = 'info') {
  if (globalShowAlert) globalShowAlert({ title, message, type, open: true })
}

export default function AlertModal() {
  const [alert, setAlert] = useState({ open: false, title: '', message: '', type: 'info' })
  globalShowAlert = setAlert

  const colors = {
    info: 'border-ulysse-blue text-ulysse-blue',
    success: 'border-green-500 text-green-400',
    error: 'border-red-500 text-red-400',
    warning: 'border-yellow-500 text-yellow-400',
  }
  const icons = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️' }

  return (
    <Modal isOpen={alert.open} onClose={() => setAlert(prev => ({ ...prev, open: false }))} size="sm">
      <div className={`flex items-center gap-3 p-4 rounded-lg border ${colors[alert.type] || colors.info}`}>
        <span className="text-2xl">{icons[alert.type] || icons.info}</span>
        <p className="text-gray-300">{alert.message}</p>
      </div>
      <div className="flex justify-end mt-4">
        <button onClick={() => setAlert(prev => ({ ...prev, open: false }))} className="px-6 py-2 bg-ulysse-blue text-white rounded-lg">OK</button>
      </div>
    </Modal>
  )
}