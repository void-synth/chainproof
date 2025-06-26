import { useState, useCallback } from 'react';
import { CertificateGenerator, CertificateData, CertificateResult, EmailOptions } from '@/lib/certificate-generator';
import { supabase } from '@/integrations/supabase/client';

export interface CertificateGenerationState {
  isGenerating: boolean;
  generationProgress: number;
  generationStage: string;
  result: CertificateResult | null;
  error: string | null;
}

export interface UserCertificate {
  id: string;
  certificateId: string;
  ownerName: string;
  assetTitle: string;
  contentHash: string;
  protectionDate: string;
  downloadUrl: string;
  ipfsUri?: string;
  verificationUrl: string;
  status: 'active' | 'revoked' | 'expired';
  createdAt: string;
  verificationCount: number;
}

export const useCertificateGenerator = () => {
  const [state, setState] = useState<CertificateGenerationState>({
    isGenerating: false,
    generationProgress: 0,
    generationStage: 'Ready to generate',
    result: null,
    error: null
  });

  const [certificates, setCertificates] = useState<UserCertificate[]>([]);
  const [isLoadingCertificates, setIsLoadingCertificates] = useState(false);
  const generator = new CertificateGenerator();

  const updateProgress = (progress: number, stage: string) => {
    setState(prev => ({
      ...prev,
      generationProgress: progress,
      generationStage: stage
    }));
  };

  const generateCertificate = useCallback(async (data: CertificateData): Promise<CertificateResult> => {
    setState({
      isGenerating: true,
      generationProgress: 0,
      generationStage: 'Initializing certificate generation...',
      result: null,
      error: null
    });

    try {
      updateProgress(10, 'Preparing certificate data...');
      
      // Ensure required fields
      if (!data.ownerName || !data.assetTitle || !data.contentHash) {
        throw new Error('Missing required certificate data');
      }

      updateProgress(25, 'Generating QR code...');
      
      const result = await generator.generateCertificate(data);
      
      updateProgress(75, 'Uploading certificate...');
      
      updateProgress(90, 'Saving metadata...');
      
      updateProgress(100, 'Certificate generated successfully!');
      
      setState({
        isGenerating: false,
        generationProgress: 100,
        generationStage: 'Certificate ready',
        result,
        error: null
      });

      // Refresh certificates list
      await loadUserCertificates();

      return result;

    } catch (error: any) {
      console.error('Certificate generation failed:', error);
      setState({
        isGenerating: false,
        generationProgress: 0,
        generationStage: 'Generation failed',
        result: null,
        error: error.message || 'Failed to generate certificate'
      });
      throw error;
    }
  }, []);

  const emailCertificate = useCallback(async (
    certificateResult: CertificateResult, 
    emailOptions: EmailOptions
  ): Promise<boolean> => {
    try {
      console.log('📧 Sending certificate via email...');
      
      const success = await generator.emailCertificate(certificateResult, emailOptions);
      
      if (success) {
        // Update database to mark email as sent
        await supabase
          .from('certificates')
          .update({
            email_sent: true,
            email_sent_at: new Date().toISOString(),
            recipient_email: emailOptions.recipientEmail
          })
          .eq('certificate_id', certificateResult.certificateId);
      }
      
      return success;
    } catch (error) {
      console.error('Failed to email certificate:', error);
      return false;
    }
  }, []);

  const loadUserCertificates = useCallback(async () => {
    setIsLoadingCertificates(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCertificates([]);
        return;
      }

      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load certificates:', error);
        return;
      }

      const userCertificates: UserCertificate[] = data?.map(cert => ({
        id: cert.id,
        certificateId: cert.certificate_id,
        ownerName: cert.owner_name,
        assetTitle: cert.asset_title,
        contentHash: cert.content_hash,
        protectionDate: cert.protection_date,
        downloadUrl: cert.download_url,
        ipfsUri: cert.ipfs_uri,
        verificationUrl: `https://chainproof.io/verify/${cert.certificate_id}`,
        status: cert.status,
        createdAt: cert.created_at,
        verificationCount: cert.verification_count || 0
      })) || [];

      setCertificates(userCertificates);
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setIsLoadingCertificates(false);
    }
  }, []);

  const verifyCertificate = useCallback(async (certificateId: string) => {
    try {
      const result = await generator.verifyCertificate(certificateId);
      
      if (result.valid) {
        // Increment verification count
        await supabase.rpc('increment_certificate_verification', {
          cert_id: certificateId
        });
      }
      
      return result;
    } catch (error) {
      console.error('Certificate verification failed:', error);
      return { valid: false, error: 'Verification failed' };
    }
  }, []);

  const downloadCertificate = useCallback((certificateResult: CertificateResult) => {
    try {
      const url = URL.createObjectURL(certificateResult.pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = certificateResult.metadata.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download certificate:', error);
    }
  }, []);

  const revokeCertificate = useCallback(async (certificateId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('certificates')
        .update({
          status: 'revoked',
          revoked_at: new Date().toISOString(),
          revocation_reason: reason
        })
        .eq('certificate_id', certificateId);

      if (error) {
        throw error;
      }

      // Refresh certificates list
      await loadUserCertificates();
      
      return true;
    } catch (error) {
      console.error('Failed to revoke certificate:', error);
      return false;
    }
  }, [loadUserCertificates]);

  const clearResult = useCallback(() => {
    setState({
      isGenerating: false,
      generationProgress: 0,
      generationStage: 'Ready to generate',
      result: null,
      error: null
    });
  }, []);

  // Auto-generate certificate from content protection data
  const generateFromProtectedContent = useCallback(async (contentId: string) => {
    try {
      // Get content data from database
      const { data: content, error } = await supabase
        .from('content')
        .select('*')
        .eq('id', contentId)
        .single();

      if (error || !content) {
        throw new Error('Content not found');
      }

      // Get user data
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.user_metadata?.full_name) {
        throw new Error('User information not found');
      }

      const certificateData: CertificateData = {
        ownerName: user.user_metadata.full_name,
        assetTitle: content.title,
        contentHash: content.content_hash,
        protectionDate: content.created_at,
        blockchainHash: content.blockchain_hash,
        blockchainNetwork: content.blockchain_network,
        blockchainTimestamp: content.blockchain_timestamp,
        ipfsHash: content.ipfs_hash,
        ipfsUrl: content.ipfs_url,
        assetType: content.file_type,
        fileSize: content.file_size,
        protectionScore: content.protection_score
      };

      return await generateCertificate(certificateData);
    } catch (error: any) {
      console.error('Failed to generate certificate from content:', error);
      throw error;
    }
  }, [generateCertificate]);

  return {
    // State
    ...state,
    certificates,
    isLoadingCertificates,
    
    // Actions
    generateCertificate,
    generateFromProtectedContent,
    emailCertificate,
    loadUserCertificates,
    verifyCertificate,
    downloadCertificate,
    revokeCertificate,
    clearResult,
    
    // Computed properties
    hasResult: !!state.result,
    canEmail: !!state.result && !state.isGenerating,
    canDownload: !!state.result && !state.isGenerating,
    activeCertificates: certificates.filter(cert => cert.status === 'active'),
    revokedCertificates: certificates.filter(cert => cert.status === 'revoked'),
    totalVerifications: certificates.reduce((sum, cert) => sum + cert.verificationCount, 0)
  };
}; 