// src/utils/pdfGenerator.js
import jsPDF from 'jspdf';

export class PDFGenerator {
  static async generateDocument(headerText, subTitleText, projects) {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      let yPosition = 20;
      
      // Process each project
      for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        const projectNumber = i + 1;
        
        // Add new page for subsequent projects
        if (i > 0) {
          pdf.addPage();
          yPosition = 20;
        }
        
        // Header text - centered (BESAR)
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        const titleText = `${headerText} ${projectNumber}`;
        const titleWidth = pdf.getTextWidth(titleText);
        const pageWidth = 210; // A4 width in mm
        pdf.text(titleText, (pageWidth - titleWidth) / 2, yPosition);
        yPosition += 15;
        
        // Sub title text (smaller, centered)
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'normal');
        const subTitleWidth = pdf.getTextWidth(subTitleText);
        pdf.text(subTitleText, (pageWidth - subTitleWidth) / 2, yPosition);
        yPosition += 20;
        
        // Create table
        await this.createTable(pdf, project, yPosition);
      }
      
      return pdf;
    } catch (error) {
      console.error('Error creating PDF:', error);
      throw error;
    }
  }
  
 static async createTable(pdf, project, startY) {
  const progressLevels = ['0%', '50%', '100%'];
  const tableStartX = 20;
  const tableWidth = 170;
  const progressColWidth = 40;
  const imageColWidth = 130;

  const pageHeight = 297;
  const bottomMargin = 20;
  const availableHeight = pageHeight - startY - bottomMargin;
  const rowHeight = availableHeight / progressLevels.length;

  for (let i = 0; i < progressLevels.length; i++) {
    const progress = progressLevels[i];
    const rowY = startY + (i * rowHeight);

    // Draw borders
    pdf.setLineWidth(0.5);
    pdf.rect(tableStartX, rowY, progressColWidth, rowHeight);
    pdf.rect(tableStartX + progressColWidth, rowY, imageColWidth, rowHeight);

    // Center progress text
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    const progressTextWidth = pdf.getTextWidth(progress);
    const centerX = tableStartX + (progressColWidth / 2);
    const centerY = rowY + (rowHeight / 2) + 6;

    pdf.text(progress, centerX - (progressTextWidth / 2), centerY);

    // Handle image or placeholder
    const photo = project.photos?.[progress];
    const imageX = tableStartX + progressColWidth + 5;
    const imageY = rowY + 5;
    const imageWidth = imageColWidth - 10;
    const imageHeight = rowHeight - 10;

    if (photo) {
      try {
        pdf.addImage(photo.data, 'JPEG', imageX, imageY, imageWidth, imageHeight);
      } catch (err) {
        const errorText = 'Foto tidak dapat dimuat';
        const errorTextWidth = pdf.getTextWidth(errorText);
        const imageCellCenterX = imageX + (imageWidth / 2);
        pdf.setFontSize(10);
        pdf.text(errorText, imageCellCenterX - (errorTextWidth / 2), centerY);
      }
    } else {
      const placeholder = `Foto ${progress} belum tersedia`;
      const placeholderWidth = pdf.getTextWidth(placeholder);
      const imageCellCenterX = imageX + (imageWidth / 2);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(placeholder, imageCellCenterX - (placeholderWidth / 2), centerY);
    }
  }
}

  static downloadPDF(pdf, filename) {
    pdf.save(filename);
  }
}