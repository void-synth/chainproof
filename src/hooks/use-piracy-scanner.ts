import { useState, useCallback } from 'react';
import { PiracyScanner, ScanRequest, ScanResult } from '@/lib/piracy-scanner';
import { supabase } from '@/integrations/supabase/client';

export interface PiracyScanState {
  isScanning: boolean;
  scanProgress: number;
  scanStage: string;
  result: ScanResult | null;
  error: string | null;
}

export const usePiracyScanner = () => {
  const [state, setState] = useState<PiracyScanState>({
    isScanning: false,
    scanProgress: 0,
    scanStage: 'Ready to scan',
    result: null,
    error: null
  });

  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const scanner = new PiracyScanner();

  const updateProgress = (progress: number, stage: string) => {
    setState(prev => ({
      ...prev,
      scanProgress: progress,
      scanStage: stage
    }));
  };

  const scanFile = useCallback(async (file: File, metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
  }) => {
    setState({
      isScanning: true,
      scanProgress: 0,
      scanStage: 'Initializing scan...',
      result: null,
      error: null
    });

    try {
      updateProgress(10, 'Extracting file information...');
      
      const scanRequest: ScanRequest = {
        file,
        metadata
      };

      updateProgress(25, 'Generating search queries...');
      
      const result = await scanner.scanForPiracy(scanRequest);
      
      updateProgress(75, 'Analyzing results...');
      
      // Save scan result to database
      await saveScanResult(result);
      
      updateProgress(100, 'Scan completed');
      
      setState({
        isScanning: false,
        scanProgress: 100,
        scanStage: 'Scan completed',
        result,
        error: null
      });

      // Add to history
      setScanHistory(prev => [result, ...prev].slice(0, 10)); // Keep last 10 scans

      return result;

    } catch (error: any) {
      console.error('Piracy scan failed:', error);
      setState({
        isScanning: false,
        scanProgress: 0,
        scanStage: 'Scan failed',
        result: null,
        error: error.message || 'Failed to complete piracy scan'
      });
      throw error;
    }
  }, []);

  const scanHash = useCallback(async (fileHash: string, contentType: string, metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
  }) => {
    setState({
      isScanning: true,
      scanProgress: 0,
      scanStage: 'Initializing hash scan...',
      result: null,
      error: null
    });

    try {
      updateProgress(20, 'Processing file hash...');
      
      const scanRequest: ScanRequest = {
        fileHash,
        contentType,
        metadata
      };

      updateProgress(40, 'Performing web search...');
      
      const result = await scanner.scanForPiracy(scanRequest);
      
      updateProgress(80, 'Analyzing threat patterns...');
      
      // Save scan result to database
      await saveScanResult(result);
      
      updateProgress(100, 'Hash scan completed');
      
      setState({
        isScanning: false,
        scanProgress: 100,
        scanStage: 'Hash scan completed',
        result,
        error: null
      });

      // Add to history
      setScanHistory(prev => [result, ...prev].slice(0, 10));

      return result;

    } catch (error: any) {
      console.error('Hash scan failed:', error);
      setState({
        isScanning: false,
        scanProgress: 0,
        scanStage: 'Hash scan failed',
        result: null,
        error: error.message || 'Failed to complete hash scan'
      });
      throw error;
    }
  }, []);

  const saveScanResult = async (result: ScanResult) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No user logged in, skipping scan result save');
        return;
      }

      const { error } = await supabase
        .from('piracy_scans')
        .insert({
          user_id: user.id,
          scan_id: result.scanId,
          overall_risk: result.overallRisk,
          confidence_score: result.confidenceScore,
          matches_count: result.matches.length,
          scan_summary: result.summary,
          scan_details: result.scanDetails,
          matches: result.matches,
          recommendations: result.recommendations,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to save scan result:', error);
      }
    } catch (error) {
      console.error('Error saving scan result:', error);
    }
  };

  const loadScanHistory = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('piracy_scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Failed to load scan history:', error);
        return;
      }

      // Convert database records to ScanResult format
      const history: ScanResult[] = data?.map(record => ({
        scanId: record.scan_id,
        overallRisk: record.overall_risk,
        confidenceScore: record.confidence_score,
        matches: record.matches || [],
        summary: record.scan_summary,
        recommendations: record.recommendations || [],
        scanDetails: record.scan_details || {
          contentHash: '',
          contentType: '',
          scanTimestamp: record.created_at,
          searchQueries: [],
          aiAnalysis: ''
        }
      })) || [];

      setScanHistory(history);
    } catch (error) {
      console.error('Error loading scan history:', error);
    }
  }, []);

  const clearResults = useCallback(() => {
    setState({
      isScanning: false,
      scanProgress: 0,
      scanStage: 'Ready to scan',
      result: null,
      error: null
    });
  }, []);

  const clearHistory = useCallback(() => {
    setScanHistory([]);
  }, []);

  return {
    // State
    ...state,
    scanHistory,
    
    // Actions
    scanFile,
    scanHash,
    loadScanHistory,
    clearResults,
    clearHistory,
    
    // Computed properties
    hasResults: !!state.result,
    hasMatches: (state.result?.matches.length || 0) > 0,
    riskLevel: state.result?.overallRisk,
    matchCount: state.result?.matches.length || 0,
    highRiskMatches: state.result?.matches.filter(m => m.riskLevel === 'high' || m.riskLevel === 'critical').length || 0
  };
}; 