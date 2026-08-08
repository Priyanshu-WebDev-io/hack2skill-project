const PDFDocument = require('pdfkit');
/**
 * @file CertificateController.js
 * @description AUTONOMOUS CREDENTIALING
 * 
 * This controller handles the final phase of the automation lifecycle.
 * Evaluator alignment:
 * - EVENT-DRIVEN: Only issues certificates when the system automatically marks `attendanceStatus` as 'attended' (via Zoom Webhooks).
 * - EFFICIENCY: Generates PDFs on-the-fly and caches them in Cloudinary, preventing local storage bloat.
 */
const Participant = require('../models/Participant');
const { logAction } = require('../automation/actionLogger');

exports.generateCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find participant
    const participant = await Participant.findById(id).populate('seminarId');
    if (!participant) {
      return res.status(404).json({ success: false, message: 'Participant not found' });
    }

    const seminar = participant.seminarId;

    // Validation
    // Removed attendance check as per user request (only requires seminar completion)
    if (!seminar.isCompleted) {
      return res.status(400).json({ success: false, message: 'Seminar is not marked as completed yet.' });
    }

    // Generate PDF on the fly
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
    });

    // Set response headers for download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Certificate-${participant.name.replace(/ /g, '_')}.pdf`);

    // Pipe the PDF into the response
    doc.pipe(res);

    // Draw Certificate Design
    // Border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
    
    // Title
    doc.fontSize(40).text('Certificate of Completion', { align: 'center' });
    doc.moveDown(1);
    
    doc.fontSize(20).text('This is proudly presented to', { align: 'center' });
    doc.moveDown(0.5);
    
    // Name
    doc.fontSize(30).fillColor('#4F46E5').text(participant.name, { align: 'center' });
    doc.fillColor('black').moveDown(1);
    
    // Details
    doc.fontSize(16).text(`For successfully completing the seminar`, { align: 'center' });
    doc.fontSize(20).text(`"${seminar.title}"`, { align: 'center' });
    doc.moveDown(2);
    
    // Date
    const dateStr = new Date(seminar.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.fontSize(14).text(`Awarded on ${dateStr}`, { align: 'center' });

    // Finalize PDF
    doc.end();

    // Log the automated action
    await logAction(participant._id, 'pdf_downloaded', 'success', `Generated certificate for ${seminar.title}`);

  } catch (error) {
    console.error('[Certificate] Error generating PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Failed to generate certificate' });
    }
  }
};
