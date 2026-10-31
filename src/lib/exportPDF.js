import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function exportCommandePDF(commande) {
  console.log('=== DEBUG PDF ===')
  console.log('Commande reçue:', commande)

  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    let y = 20

    // === EN-TÊTE ===
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(212, 163, 115)
    doc.setFontSize(22)
    doc.text('ULYSSE', margin, y)
    doc.setFontSize(9)
    doc.setTextColor(128, 128, 128)
    doc.text('DEZIGN', margin, y + 5)

    const typeDoc = commande.status?.includes('devis') ? 'DEVIS' : 'FACTURE'
    doc.setFontSize(16)
    doc.setTextColor(212, 163, 115)
    doc.text(typeDoc, pageWidth - margin, y, { align: 'right' })
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`N° ${commande.numero || 'Brouillon'}`, pageWidth - margin, y + 7, { align: 'right' })

    y += 15

    doc.setDrawColor(212, 163, 115)
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageWidth - margin, y)
    y += 10

    // === INFOS CLIENT ===
    doc.setFontSize(11)
    doc.setTextColor(60, 60, 60)
    doc.setFont('helvetica', 'bold')
    doc.text('CLIENT', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(commande.clients?.nom || 'N/A', margin, y)
    y += 5
    if (commande.clients?.entreprise) {
      doc.text(commande.clients.entreprise, margin, y)
      y += 5
    }
    if (commande.clients?.phone) {
      doc.text(`Tel: ${commande.clients.phone}`, margin, y)
      y += 5
    }
    if (commande.clients?.email) {
      doc.text(commande.clients.email, margin, y)
      y += 5
    }

    const dateCreation = commande.created_at
      ? new Date(commande.created_at).toLocaleDateString('fr-FR')
      : new Date().toLocaleDateString('fr-FR')
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Date: ${dateCreation}`, pageWidth - margin, 42, { align: 'right' })

    if (commande.deadline) {
      const deadline = new Date(commande.deadline).toLocaleDateString('fr-FR')
      doc.setTextColor(200, 50, 50)
      doc.text(`Deadline: ${deadline}`, pageWidth - margin, 47, { align: 'right' })
    }

    y += 15

    // === TABLEAU PRODUITS ===
    const lignes = commande.lignes_commande || []
    const tableData = lignes.map((l, i) => [
      i + 1,
      l.description || 'Sans description',
      l.type === 'service' ? 'Service' : 'Produit',
      l.quantite,
      `${l.prix_unitaire?.toLocaleString() || 0} DT`,
      `${((l.quantite || 0) * (l.prix_unitaire || 0)).toLocaleString()} DT`,
    ])

    while (tableData.length < 5) {
      tableData.push(['', '', '', '', '', ''])
    }

    autoTable(doc, {
      startY: y,
      head: [['#', 'Description', 'Type', 'Qte', 'Prix U.', 'Total']],
      body: tableData,
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: [212, 163, 115],
        textColor: [11, 17, 32],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [40, 40, 40],
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248],
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 70 },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 12, halign: 'center' },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 25, halign: 'right' },
      },
    })

    y = doc.lastAutoTable.finalY + 10

    // === TOTAUX ===
    const totalHT = commande.total_ht || 0
    const tva = commande.tva || 0
    const totalTTC = commande.total_ttc || 0
    const xDroite = pageWidth - margin - 60

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60, 60, 60)
    doc.text('Total HT', xDroite, y)
    doc.text(`${totalHT.toLocaleString()} DT`, pageWidth - margin, y, { align: 'right' })
    y += 6
    doc.text('TVA (19%)', xDroite, y)
    doc.text(`${tva.toLocaleString()} DT`, pageWidth - margin, y, { align: 'right' })
    y += 6
    doc.setDrawColor(200, 200, 200)
    doc.line(xDroite, y, pageWidth - margin, y)
    y += 5
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(212, 163, 115)
    doc.text('Total TTC', xDroite, y)
    doc.text(`${totalTTC.toLocaleString()} DT`, pageWidth - margin, y, { align: 'right' })
    y += 15

    // === TRANCHES ===
    const tranches = commande.tranches_paiement || []
    if (tranches.length > 0) {
      doc.setFontSize(10)
      doc.setTextColor(60, 60, 60)
      doc.setFont('helvetica', 'bold')
      doc.text('ECHEANCIER DE PAIEMENT', margin, y)
      y += 8

      autoTable(doc, {
        startY: y,
        head: [['Echeance', 'Description', '%', 'Montant', 'Statut']],
        body: tranches.map(t => [
          t.date_prevue ? new Date(t.date_prevue).toLocaleDateString('fr-FR') : '-',
          t.description || '-',
          `${t.pourcentage || 0}%`,
          `${t.montant?.toLocaleString() || 0} DT`,
          t.paye ? 'Paye' : 'En attente',
        ]),
        margin: { left: margin, right: margin },
        headStyles: {
          fillColor: [100, 100, 100],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [40, 40, 40],
        },
      })

      y = doc.lastAutoTable.finalY + 10
    }

    // === NOTES ===
    if (commande.notes_client) {
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.setFont('helvetica', 'italic')
      doc.text('Notes:', margin, y)
      y += 5
      doc.text(commande.notes_client, margin, y)
    }

    // === PIED DE PAGE ===
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.setFont('helvetica', 'normal')
    doc.text('Ulysse Dezign - Votre partenaire creation', margin, 285)
    doc.text('Djerba - Tunisie', margin, 290)

    // === SAUVEGARDE ===
    const fileName = `${typeDoc}_${commande.numero || 'brouillon'}_${commande.clients?.nom || 'client'}.pdf`
      .replace(/\s+/g, '_')
      .toLowerCase()

    console.log('Sauvegarde:', fileName)
    doc.save(fileName)
    console.log('PDF sauvegarde avec succes')

  } catch (error) {
    console.error('Erreur PDF:', error)
    alert('Erreur PDF: ' + error.message)
  }
}