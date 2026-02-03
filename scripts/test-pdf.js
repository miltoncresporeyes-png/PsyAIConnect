const { jsPDF } = require('jspdf')
const autoTable = require('jspdf-autotable')

try {
    const doc = new jsPDF()
    // Manually invoke if available as function export, or check if it patched
    console.log('autoTable available on doc?', typeof doc.autoTable)

    // If not patched, try passing doc to it? (Depending on version)
    // Or force patch:
    // (autoTable.default || autoTable)(doc)

    doc.text('Hello world', 10, 10)

    // Test autoTable
    doc.autoTable({
        head: [['Name', 'Email']],
        body: [['John', 'john@example.com']]
    })

    const output = doc.output('dataurlstring')
    console.log('PDF Generated successfully. Length:', output.length)
    console.log('Start:', output.substring(0, 50))
} catch (error) {
    console.error('Error generating PDF:', error)
}
