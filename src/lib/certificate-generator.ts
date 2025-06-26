import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { supabase } from '@/integrations/supabase/client';

export interface CertificateData {
  // Required fields
  ownerName: string;
  assetTitle: string;
  contentHash: string;
  protectionDate: string;
  
  // Optional blockchain data
  blockchainHash?: string;
  blockchainNetwork?: string;
  blockchainTimestamp?: string;
  ipfsHash?: string;
  ipfsUrl?: string;
  
  // Additional metadata
  assetType?: string;
  fileSize?: number;
  protectionScore?: number;
  certificateId?: string;
}

export interface CertificateResult {
  certificateId: string;
  pdfBlob: Blob;
  downloadUrl: string;
  ipfsUri?: string;
  verificationUrl: string;
  qrCodeData: string;
  metadata: {
    fileName: string;
    fileSize: number;
    createdAt: string;
    expiresAt?: string;
  };
}

export interface EmailOptions {
  recipientEmail: string;
  recipientName?: string;
  subject?: string;
  message?: string;
}

export class CertificateGenerator {
  private readonly CERTIFICATE_BASE_URL = 'https://chainproof.io/verify';
  private readonly LOGO_SIZE = 40;
  private readonly PAGE_WIDTH = 210; // A4 width in mm
  private readonly PAGE_HEIGHT = 297; // A4 height in mm

  async generateCertificate(data: CertificateData): Promise<CertificateResult> {
    console.log('🏆 Generating certificate for:', data.assetTitle);
    
    // Generate unique certificate ID
    const certificateId = data.certificateId || this.generateCertificateId();
    
    // Create verification URL and QR code data
    const verificationUrl = `${this.CERTIFICATE_BASE_URL}/${certificateId}`;
    const qrCodeData = await this.generateQRCode(verificationUrl, data);
    
    // Generate PDF
    const pdfBlob = await this.createPDFCertificate(data, certificateId, qrCodeData);
    
    // Upload to Supabase Storage
    const downloadUrl = await this.uploadCertificate(pdfBlob, certificateId);
    
    // Optionally upload to IPFS
    let ipfsUri: string | undefined;
    try {
      ipfsUri = await this.uploadToIPFS(pdfBlob, certificateId);
    } catch (error) {
      console.warn('IPFS upload failed:', error);
    }
    
    // Save certificate metadata to database
    await this.saveCertificateMetadata(certificateId, data, downloadUrl, ipfsUri);
    
    const result: CertificateResult = {
      certificateId,
      pdfBlob,
      downloadUrl,
      ipfsUri,
      verificationUrl,
      qrCodeData,
      metadata: {
        fileName: `chainproof-certificate-${certificateId}.pdf`,
        fileSize: pdfBlob.size,
        createdAt: new Date().toISOString(),
        // Certificates don't expire by default, but could add expiration logic
      }
    };
    
    console.log('✅ Certificate generated successfully:', certificateId);
    return result;
  }

  async emailCertificate(
    certificateResult: CertificateResult, 
    emailOptions: EmailOptions
  ): Promise<boolean> {
    try {
      console.log('📧 Sending certificate via email to:', emailOptions.recipientEmail);
      
      // For demo purposes, we'll simulate email sending
      // In production, this would integrate with a service like SendGrid, Mailgun, etc.
      
      // Create email content
      const emailData = {
        to: emailOptions.recipientEmail,
        subject: emailOptions.subject || 'Your ChainProof Protection Certificate',
        html: this.generateEmailTemplate(certificateResult, emailOptions),
        attachments: [
          {
            filename: certificateResult.metadata.fileName,
            content: certificateResult.pdfBlob,
            type: 'application/pdf'
          }
        ]
      };
      
      // Simulate email sending (replace with actual email service)
      await this.simulateEmailSending(emailData);
      
      console.log('✅ Certificate email sent successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to send certificate email:', error);
      return false;
    }
  }

  private generateCertificateId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `CERT-${timestamp}-${random}`.toUpperCase();
  }

  private async generateQRCode(verificationUrl: string, data: CertificateData): Promise<string> {
    try {
      // Create comprehensive QR code data
      const qrData = {
        url: verificationUrl,
        title: data.assetTitle,
        hash: data.contentHash,
        date: data.protectionDate,
        blockchain: data.blockchainHash ? {
          hash: data.blockchainHash,
          network: data.blockchainNetwork,
          timestamp: data.blockchainTimestamp
        } : undefined,
        ipfs: data.ipfsHash ? {
          hash: data.ipfsHash,
          url: data.ipfsUrl
        } : undefined
      };
      
      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      // Return simple URL-based QR code as fallback
      return await QRCode.toDataURL(verificationUrl);
    }
  }

  private async createPDFCertificate(
    data: CertificateData, 
    certificateId: string, 
    qrCodeData: string
  ): Promise<Blob> {
    console.log('📄 Creating PDF certificate...');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set up colors
    const primaryColor = '#1e40af'; // Blue
    const goldColor = '#f59e0b'; // Gold
    const grayColor = '#6b7280'; // Gray

    // Add background elements
    this.addBackgroundElements(pdf, primaryColor, goldColor);
    
    // Add header with logo and title
    this.addHeader(pdf, primaryColor, goldColor);
    
    // Add certificate title
    pdf.setFontSize(28);
    pdf.setTextColor(primaryColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CERTIFICATE OF PROTECTION', this.PAGE_WIDTH / 2, 70, { align: 'center' });
    
    // Add subtitle
    pdf.setFontSize(14);
    pdf.setTextColor(grayColor);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Blockchain-Verified Digital Content Protection', this.PAGE_WIDTH / 2, 80, { align: 'center' });
    
    // Add certificate content
    await this.addCertificateContent(pdf, data, certificateId, qrCodeData, primaryColor, goldColor, grayColor);
    
    // Add footer
    this.addFooter(pdf, certificateId, grayColor);
    
    // Convert to blob
    const pdfBuffer = pdf.output('arraybuffer');
    return new Blob([pdfBuffer], { type: 'application/pdf' });
  }

  private addBackgroundElements(pdf: jsPDF, primaryColor: string, goldColor: string): void {
    // Add decorative border
    pdf.setDrawColor(primaryColor);
    pdf.setLineWidth(2);
    pdf.rect(10, 10, this.PAGE_WIDTH - 20, this.PAGE_HEIGHT - 20);
    
    // Add inner border
    pdf.setDrawColor(goldColor);
    pdf.setLineWidth(0.5);
    pdf.rect(15, 15, this.PAGE_WIDTH - 30, this.PAGE_HEIGHT - 30);
    
    // Add decorative corners
    const cornerSize = 15;
    pdf.setFillColor(goldColor);
    
    // Top corners
    pdf.triangle(15, 15, 15 + cornerSize, 15, 15, 15 + cornerSize);
    pdf.triangle(this.PAGE_WIDTH - 15, 15, this.PAGE_WIDTH - 15 - cornerSize, 15, this.PAGE_WIDTH - 15, 15 + cornerSize);
    
    // Bottom corners
    pdf.triangle(15, this.PAGE_HEIGHT - 15, 15 + cornerSize, this.PAGE_HEIGHT - 15, 15, this.PAGE_HEIGHT - 15 - cornerSize);
    pdf.triangle(this.PAGE_WIDTH - 15, this.PAGE_HEIGHT - 15, this.PAGE_WIDTH - 15 - cornerSize, this.PAGE_HEIGHT - 15, this.PAGE_WIDTH - 15, this.PAGE_HEIGHT - 15 - cornerSize);
  }

  private addHeader(pdf: jsPDF, primaryColor: string, goldColor: string): void {
    // Add ChainProof logo (text-based for now)
    pdf.setFontSize(24);
    pdf.setTextColor(primaryColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text('⛓️ ChainProof', this.PAGE_WIDTH / 2, 35, { align: 'center' });
    
    // Add tagline
    pdf.setFontSize(10);
    pdf.setTextColor(goldColor);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Protecting Digital Assets with Blockchain Technology', this.PAGE_WIDTH / 2, 42, { align: 'center' });
  }

  private async addCertificateContent(
    pdf: jsPDF, 
    data: CertificateData, 
    certificateId: string, 
    qrCodeData: string,
    primaryColor: string,
    goldColor: string,
    grayColor: string
  ): Promise<void> {
    let yPosition = 100;
    const leftMargin = 25;
    const rightMargin = this.PAGE_WIDTH - 25;
    const lineHeight = 8;

    // Certificate statement
    pdf.setFontSize(16);
    pdf.setTextColor(primaryColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text('This certifies that', this.PAGE_WIDTH / 2, yPosition, { align: 'center' });
    
    yPosition += 15;
    
    // Owner name (highlighted)
    pdf.setFontSize(20);
    pdf.setTextColor(goldColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.ownerName, this.PAGE_WIDTH / 2, yPosition, { align: 'center' });
    
    yPosition += 15;
    
    // Asset protection statement
    pdf.setFontSize(14);
    pdf.setTextColor(primaryColor);
    pdf.setFont('helvetica', 'normal');
    pdf.text('has successfully protected the digital asset:', this.PAGE_WIDTH / 2, yPosition, { align: 'center' });
    
    yPosition += 12;
    
    // Asset title (highlighted)
    pdf.setFontSize(18);
    pdf.setTextColor(goldColor);
    pdf.setFont('helvetica', 'bold');
    const wrappedTitle = pdf.splitTextToSize(data.assetTitle, this.PAGE_WIDTH - 50);
    pdf.text(wrappedTitle, this.PAGE_WIDTH / 2, yPosition, { align: 'center' });
    
    yPosition += (wrappedTitle.length * 8) + 10;
    
    // Protection details box
    pdf.setDrawColor(primaryColor);
    pdf.setLineWidth(0.5);
    const boxY = yPosition;
    const boxHeight = 50;
    pdf.rect(leftMargin, boxY, rightMargin - leftMargin, boxHeight);
    
    // Add shaded background to the box
    pdf.setFillColor(248, 250, 252); // Light gray background
    pdf.rect(leftMargin, boxY, rightMargin - leftMargin, boxHeight, 'F');
    pdf.rect(leftMargin, boxY, rightMargin - leftMargin, boxHeight); // Border on top
    
    yPosition += 8;
    
    // Protection details
    pdf.setFontSize(10);
    pdf.setTextColor(grayColor);
    pdf.setFont('helvetica', 'bold');
    
    // Content Hash
    pdf.text('Content Hash:', leftMargin + 5, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.contentHash.substring(0, 40) + '...', leftMargin + 35, yPosition);
    
    yPosition += lineHeight;
    
    // Protection Date
    pdf.setFont('helvetica', 'bold');
    pdf.text('Protected On:', leftMargin + 5, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(new Date(data.protectionDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }), leftMargin + 35, yPosition);
    
    yPosition += lineHeight;
    
    // Asset Type
    if (data.assetType) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Asset Type:', leftMargin + 5, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.assetType, leftMargin + 35, yPosition);
      yPosition += lineHeight;
    }
    
    // File Size
    if (data.fileSize) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('File Size:', leftMargin + 5, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(this.formatFileSize(data.fileSize), leftMargin + 35, yPosition);
      yPosition += lineHeight;
    }
    
    // Protection Score
    if (data.protectionScore) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Protection Score:', leftMargin + 5, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(data.protectionScore >= 75 ? '#059669' : data.protectionScore >= 50 ? '#d97706' : '#dc2626');
      pdf.text(`${data.protectionScore}%`, leftMargin + 35, yPosition);
      pdf.setTextColor(grayColor);
    }
    
    yPosition = boxY + boxHeight + 15;
    
    // Blockchain verification section (if available)
    if (data.blockchainHash) {
      pdf.setFontSize(12);
      pdf.setTextColor(primaryColor);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Blockchain Verification', leftMargin, yPosition);
      
      yPosition += 8;
      
      pdf.setFontSize(9);
      pdf.setTextColor(grayColor);
      pdf.setFont('helvetica', 'normal');
      
      pdf.text(`Network: ${data.blockchainNetwork || 'Polygon Mumbai'}`, leftMargin, yPosition);
      yPosition += 5;
      pdf.text(`Transaction: ${data.blockchainHash.substring(0, 30)}...`, leftMargin, yPosition);
      yPosition += 5;
      if (data.blockchainTimestamp) {
        pdf.text(`Timestamp: ${new Date(data.blockchainTimestamp).toLocaleString()}`, leftMargin, yPosition);
      }
      yPosition += 10;
    }
    
    // IPFS verification section (if available)
    if (data.ipfsHash) {
      pdf.setFontSize(12);
      pdf.setTextColor(primaryColor);
      pdf.setFont('helvetica', 'bold');
      pdf.text('IPFS Distributed Storage', leftMargin, yPosition);
      
      yPosition += 8;
      
      pdf.setFontSize(9);
      pdf.setTextColor(grayColor);
      pdf.setFont('helvetica', 'normal');
      
      pdf.text(`IPFS Hash: ${data.ipfsHash.substring(0, 30)}...`, leftMargin, yPosition);
      yPosition += 5;
      if (data.ipfsUrl) {
        pdf.text(`Gateway URL: ${data.ipfsUrl.substring(0, 40)}...`, leftMargin, yPosition);
      }
      yPosition += 10;
    }
    
    // Add QR code
    const qrSize = 35;
    const qrX = this.PAGE_WIDTH - 50;
    const qrY = 140;
    
    // Add QR code background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 'F');
    
    // Add QR code image
    pdf.addImage(qrCodeData, 'PNG', qrX, qrY, qrSize, qrSize);
    
    // QR code label
    pdf.setFontSize(8);
    pdf.setTextColor(grayColor);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Scan to verify', qrX + (qrSize / 2), qrY + qrSize + 5, { align: 'center' });
  }

  private addFooter(pdf: jsPDF, certificateId: string, grayColor: string): void {
    const footerY = this.PAGE_HEIGHT - 30;
    
    // Certificate ID
    pdf.setFontSize(8);
    pdf.setTextColor(grayColor);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Certificate ID: ${certificateId}`, 25, footerY);
    
    // Verification URL
    pdf.text(`Verify at: ${this.CERTIFICATE_BASE_URL}/${certificateId}`, 25, footerY + 5);
    
    // Generated timestamp
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 25, footerY + 10);
    
    // Disclaimer
    pdf.setFontSize(6);
    pdf.text('This certificate is cryptographically verifiable and serves as proof of digital asset protection.', this.PAGE_WIDTH / 2, footerY + 15, { align: 'center' });
  }

  private async uploadCertificate(pdfBlob: Blob, certificateId: string): Promise<string> {
    try {
      const fileName = `certificates/${certificateId}.pdf`;
      
      const { data, error } = await supabase.storage
        .from('certificates')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf',
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Failed to upload certificate:', error);
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('certificates')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Certificate upload failed:', error);
      // Return a fallback blob URL for demo
      return URL.createObjectURL(pdfBlob);
    }
  }

  private async uploadToIPFS(pdfBlob: Blob, certificateId: string): Promise<string> {
    // For demo purposes, simulate IPFS upload
    // In production, this would use web3.storage or Pinata
    console.log('🌐 Simulating IPFS upload for certificate:', certificateId);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock IPFS URI
    return `ipfs://QmCertificate${certificateId}MockHash`;
  }

  private async saveCertificateMetadata(
    certificateId: string, 
    data: CertificateData, 
    downloadUrl: string, 
    ipfsUri?: string
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No user logged in, skipping certificate metadata save');
        return;
      }

      const { error } = await supabase
        .from('certificates')
        .insert({
          certificate_id: certificateId,
          user_id: user.id,
          owner_name: data.ownerName,
          asset_title: data.assetTitle,
          content_hash: data.contentHash,
          protection_date: data.protectionDate,
          blockchain_hash: data.blockchainHash,
          blockchain_network: data.blockchainNetwork,
          blockchain_timestamp: data.blockchainTimestamp,
          ipfs_hash: data.ipfsHash,
          ipfs_url: data.ipfsUrl,
          asset_type: data.assetType,
          file_size: data.fileSize,
          protection_score: data.protectionScore,
          download_url: downloadUrl,
          ipfs_uri: ipfsUri,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to save certificate metadata:', error);
      }
    } catch (error) {
      console.error('Error saving certificate metadata:', error);
    }
  }

  private generateEmailTemplate(result: CertificateResult, options: EmailOptions): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Your ChainProof Protection Certificate</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 20px; text-align: center; border-radius: 8px; }
            .content { padding: 20px; background: #f8fafc; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            .button { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .qr-code { text-align: center; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏆 Your Protection Certificate is Ready!</h1>
                <p>Your digital asset is now blockchain-protected</p>
            </div>
            
            <div class="content">
                <h2>Hello ${options.recipientName || 'Digital Asset Owner'},</h2>
                
                <p>Your ChainProof protection certificate has been generated successfully!</p>
                
                <p><strong>Certificate Details:</strong></p>
                <ul>
                    <li><strong>Certificate ID:</strong> ${result.certificateId}</li>
                    <li><strong>Generated:</strong> ${new Date(result.metadata.createdAt).toLocaleString()}</li>
                    <li><strong>File Size:</strong> ${this.formatFileSize(result.metadata.fileSize)}</li>
                </ul>
                
                <div class="qr-code">
                    <p><strong>Verification QR Code:</strong></p>
                    <img src="${result.qrCodeData}" alt="Verification QR Code" style="max-width: 200px;">
                    <p><small>Scan this code to verify your certificate</small></p>
                </div>
                
                <p>You can verify your certificate at any time using the following link:</p>
                <p><a href="${result.verificationUrl}" class="button">Verify Certificate Online</a></p>
                
                ${result.ipfsUri ? `<p><strong>IPFS URI:</strong> <code>${result.ipfsUri}</code></p>` : ''}
                
                <p>${options.message || 'Thank you for protecting your digital assets with ChainProof!'}</p>
            </div>
            
            <div class="footer">
                <p>This certificate is attached as a PDF file.</p>
                <p>ChainProof - Protecting Digital Assets with Blockchain Technology</p>
                <p><a href="${result.verificationUrl}">Verify Certificate</a> | <a href="https://chainproof.io">Visit ChainProof</a></p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private async simulateEmailSending(emailData: any): Promise<void> {
    // Simulate email service delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('📧 Email simulation:', {
      to: emailData.to,
      subject: emailData.subject,
      attachments: emailData.attachments.length,
      size: emailData.attachments[0]?.content.size
    });
    
    // In production, integrate with actual email service:
    // - SendGrid: https://sendgrid.com/
    // - Mailgun: https://www.mailgun.com/
    // - AWS SES: https://aws.amazon.com/ses/
    // - Nodemailer with SMTP
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Verification methods
  async verifyCertificate(certificateId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('certificate_id', certificateId)
        .single();

      if (error || !data) {
        return { valid: false, error: 'Certificate not found' };
      }

      return {
        valid: true,
        certificate: data,
        verifiedAt: new Date().toISOString()
      };
    } catch (error) {
      return { valid: false, error: 'Verification failed' };
    }
  }
} 