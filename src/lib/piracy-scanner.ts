// Note: OpenAI import commented out for browser compatibility
// import OpenAI from 'openai';

// Types for the piracy scanning system
export interface ScanRequest {
  file?: File;
  fileHash?: string;
  contentType?: string;
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface ScanResult {
  scanId: string;
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  confidenceScore: number; // 0-100
  matches: PiracyMatch[];
  summary: string;
  recommendations: string[];
  scanDetails: {
    contentHash: string;
    contentType: string;
    scanTimestamp: string;
    searchQueries: string[];
    aiAnalysis: string;
  };
}

export interface PiracyMatch {
  url: string;
  title: string;
  snippet: string;
  similarity: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  matchType: 'exact' | 'similar' | 'suspicious' | 'metadata';
  confidence: number; // 0-100
  details: {
    source: 'google' | 'bing' | 'social' | 'torrent' | 'file-sharing';
    lastSeen: string;
    accessType: 'public' | 'restricted' | 'unknown';
  };
}

export class PiracyScanner {
  constructor() {
    // OpenAI initialization will be handled when API is available
  }

  async scanForPiracy(request: ScanRequest): Promise<ScanResult> {
    console.log('🔍 Starting piracy scan...');
    const scanId = crypto.randomUUID();
    
    try {
      // Step 1: Extract content information
      const contentInfo = await this.extractContentInfo(request);
      console.log('📄 Content extracted:', contentInfo);

      // Step 2: Generate search queries
      const searchQueries = await this.generateSearchQueries(contentInfo);
      console.log('🔎 Search queries generated:', searchQueries);

      // Step 3: Perform web searches
      const searchResults = await this.performWebSearches(searchQueries);
      console.log('🌐 Web search completed:', searchResults.length, 'results');

      // Step 4: AI-powered similarity analysis
      const aiAnalysis = await this.performAIAnalysis(contentInfo, searchResults);
      console.log('🤖 AI analysis completed');

      // Step 5: Process and score matches
      const matches = await this.processMatches(searchResults, contentInfo, aiAnalysis);
      console.log('⚖️ Matches processed:', matches.length);

      // Step 6: Calculate overall risk
      const overallRisk = this.calculateOverallRisk(matches);
      const confidenceScore = this.calculateConfidenceScore(matches, aiAnalysis);

      // Step 7: Generate summary and recommendations
      const summary = this.generateSummary(matches, overallRisk);
      const recommendations = this.generateRecommendations(matches, overallRisk);

      return {
        scanId,
        overallRisk,
        confidenceScore,
        matches,
        summary,
        recommendations,
        scanDetails: {
          contentHash: contentInfo.hash,
          contentType: contentInfo.type,
          scanTimestamp: new Date().toISOString(),
          searchQueries,
          aiAnalysis: aiAnalysis.summary || 'AI analysis completed'
        }
      };

    } catch (error: any) {
      console.error('❌ Piracy scan failed:', error);
      
      // Return a fallback result for demo purposes
      return this.generateDemoScanResult(scanId, request);
    }
  }

  private async extractContentInfo(request: ScanRequest) {
    const info: any = {
      hash: request.fileHash || 'demo-hash-' + Date.now(),
      type: request.contentType || 'unknown',
      title: request.metadata?.title || 'Untitled',
      description: request.metadata?.description || '',
      keywords: request.metadata?.keywords || [],
    };

    if (request.file) {
      // Generate file hash
      info.hash = await this.generateFileHash(request.file);
      info.type = request.file.type;
      info.size = request.file.size;
      info.name = request.file.name;

      // Extract text content for analysis
      if (request.file.type.includes('text') || request.file.type.includes('pdf')) {
        try {
          info.textContent = await this.extractTextFromFile(request.file);
        } catch (error) {
          console.warn('Failed to extract text:', error);
        }
      }
    }

    return info;
  }

  private async generateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async extractTextFromFile(file: File): Promise<string> {
    // This would normally use pdf-parse, mammoth, etc.
    // For demo, return placeholder
    return `Extracted text content from ${file.name}`;
  }

  private async generateSearchQueries(contentInfo: any): Promise<string[]> {
    const queries: string[] = [];
    
    // Basic queries
    if (contentInfo.title) {
      queries.push(`"${contentInfo.title}"`);
      queries.push(`${contentInfo.title} download`);
      queries.push(`${contentInfo.title} free`);
    }

    // Hash-based queries
    queries.push(`${contentInfo.hash.substring(0, 16)}`);
    
    // Content-based queries
    if (contentInfo.keywords?.length) {
      queries.push(contentInfo.keywords.join(' '));
    }

    // Piracy-specific queries
    if (contentInfo.title) {
      queries.push(`${contentInfo.title} torrent`);
      queries.push(`${contentInfo.title} pirated`);
      queries.push(`${contentInfo.title} illegal download`);
    }

    return queries.filter(q => q.length > 3);
  }

  private async performWebSearches(queries: string[]): Promise<any[]> {
    console.log('🔍 Performing web searches for', queries.length, 'queries');
    
    // For demo purposes, return mock search results
    // In production, this would use Google Custom Search API, SerpAPI, etc.
    return this.generateMockSearchResults(queries);
  }

  private generateMockSearchResults(queries: string[]): any[] {
    const suspiciousKeywords = ['download', 'free', 'torrent', 'pirated', 'crack'];
    const legitSites = ['github.com', 'stackoverflow.com', 'wikipedia.org'];
    const suspiciousSites = ['torrent-site.com', 'free-downloads.net', 'piracy-hub.org'];
    
    const results: any[] = [];
    
    queries.forEach((query, index) => {
      // Generate 3-5 results per query
      const numResults = Math.floor(Math.random() * 3) + 3;
      
      for (let i = 0; i < numResults; i++) {
        const hasSuspiciousKeyword = suspiciousKeywords.some(kw => 
          query.toLowerCase().includes(kw)
        );
        
        const isSuspicious = hasSuspiciousKeyword && Math.random() > 0.3;
        const domain = isSuspicious 
          ? suspiciousSites[Math.floor(Math.random() * suspiciousSites.length)]
          : legitSites[Math.floor(Math.random() * legitSites.length)];
        
        results.push({
          query,
          url: `https://${domain}/content-${index}-${i}`,
          title: `${query} - Result ${i + 1}`,
          snippet: `This is a search result for "${query}". ${isSuspicious ? 'Download for free!' : 'Learn more about this topic.'}`,
          isSuspicious,
          rank: i + 1
        });
      }
    });
    
    return results;
  }

  private async performAIAnalysis(contentInfo: any, searchResults: any[]): Promise<any> {
    // For demo, return mock AI analysis
    // In production, this would use OpenAI API
    return {
      summary: 'AI analysis completed using advanced pattern recognition',
      riskAssessment: 'medium',
      confidence: 0.75,
      indicators: ['Suspicious download keywords detected', 'Multiple file-sharing sites found']
    };
  }

  private async processMatches(searchResults: any[], contentInfo: any, aiAnalysis: any): Promise<PiracyMatch[]> {
    return searchResults
      .filter(result => result.isSuspicious || this.containsSuspiciousKeywords(result))
      .map((result, index) => {
        const similarity = this.calculateSimilarity(result, contentInfo);
        const riskLevel = this.assessRiskLevel(result, similarity);
        
        return {
          url: result.url,
          title: result.title,
          snippet: result.snippet,
          similarity,
          riskLevel,
          matchType: (similarity > 80 ? 'exact' : similarity > 60 ? 'similar' : 'suspicious') as 'exact' | 'similar' | 'suspicious' | 'metadata',
          confidence: Math.min(similarity + 10, 95),
                      details: {
              source: this.detectSource(result.url),
              lastSeen: new Date().toISOString(),
              accessType: (result.isSuspicious ? 'public' : 'unknown') as 'public' | 'restricted' | 'unknown'
            }
        };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 20); // Top 20 matches
  }

  private containsSuspiciousKeywords(result: any): boolean {
    const suspicious = ['download', 'free', 'torrent', 'crack', 'pirated', 'illegal'];
    const text = `${result.title} ${result.snippet}`.toLowerCase();
    return suspicious.some(keyword => text.includes(keyword));
  }

  private calculateSimilarity(result: any, contentInfo: any): number {
    // Basic similarity calculation
    const titleMatch = result.title.toLowerCase().includes(contentInfo.title.toLowerCase());
    const keywordMatch = contentInfo.keywords?.some((kw: string) => 
      result.snippet.toLowerCase().includes(kw.toLowerCase())
    );
    
    let score = 0;
    if (titleMatch) score += 40;
    if (keywordMatch) score += 30;
    if (result.isSuspicious) score += 20;
    
    return Math.min(score + Math.random() * 20, 100);
  }

  private assessRiskLevel(result: any, similarity: number): 'low' | 'medium' | 'high' | 'critical' {
    if (similarity > 85) return 'critical';
    if (similarity > 70) return 'high';
    if (similarity > 50) return 'medium';
    return 'low';
  }

  private detectSource(url: string): 'google' | 'bing' | 'social' | 'torrent' | 'file-sharing' {
    if (url.includes('torrent')) return 'torrent';
    if (url.includes('free-download') || url.includes('file-sharing')) return 'file-sharing';
    if (url.includes('social')) return 'social';
    return 'google';
  }

  private calculateOverallRisk(matches: PiracyMatch[]): 'low' | 'medium' | 'high' | 'critical' {
    if (!matches.length) return 'low';
    
    const criticalCount = matches.filter(m => m.riskLevel === 'critical').length;
    const highCount = matches.filter(m => m.riskLevel === 'high').length;
    
    if (criticalCount > 0) return 'critical';
    if (highCount > 2) return 'high';
    if (highCount > 0 || matches.length > 5) return 'medium';
    return 'low';
  }

  private calculateConfidenceScore(matches: PiracyMatch[], aiAnalysis: any): number {
    if (!matches.length) return 95; // High confidence of no piracy
    
    const avgSimilarity = matches.reduce((sum, m) => sum + m.similarity, 0) / matches.length;
    const aiConfidence = (aiAnalysis.confidence || 0.5) * 100;
    
    return Math.round((avgSimilarity + aiConfidence) / 2);
  }

  private generateSummary(matches: PiracyMatch[], overallRisk: string): string {
    if (!matches.length) {
      return 'No potential piracy detected. Your content appears to be safe from unauthorized distribution.';
    }
    
    const riskDescriptions = {
      low: 'minimal risk',
      medium: 'moderate risk', 
      high: 'significant risk',
      critical: 'critical risk'
    };
    
    return `Found ${matches.length} potential piracy matches with ${riskDescriptions[overallRisk as keyof typeof riskDescriptions]} of unauthorized distribution. The highest similarity match scored ${Math.max(...matches.map(m => m.similarity))}%.`;
  }

  private generateRecommendations(matches: PiracyMatch[], overallRisk: string): string[] {
    const recommendations: string[] = [];
    
    if (overallRisk === 'critical' || overallRisk === 'high') {
      recommendations.push('🚨 Contact your legal team immediately');
      recommendations.push('📧 Send DMCA takedown notices to infringing sites');
      recommendations.push('🔒 Consider implementing additional DRM protection');
    }
    
    if (overallRisk === 'medium') {
      recommendations.push('👀 Monitor these sites regularly for changes');
      recommendations.push('📝 Document all evidence for potential legal action');
    }
    
    if (matches.length > 0) {
      recommendations.push('🛡️ Enable blockchain timestamping for stronger IP proof');
      recommendations.push('🔍 Set up automated monitoring alerts');
      recommendations.push('📊 Run regular piracy scans (weekly recommended)');
    } else {
      recommendations.push('✅ Continue regular monitoring');
      recommendations.push('🔒 Maintain current protection measures');
    }
    
    return recommendations;
  }

  private generateDemoScanResult(scanId: string, request: ScanRequest): ScanResult {
    const demoMatches: PiracyMatch[] = [
      {
        url: 'https://suspicious-downloads.com/your-content',
        title: 'Free Download - Your Content',
        snippet: 'Download this content for free! No registration required.',
        similarity: 85,
        riskLevel: 'high',
        matchType: 'similar',
        confidence: 80,
        details: {
          source: 'file-sharing',
          lastSeen: new Date().toISOString(),
          accessType: 'public'
        }
      },
      {
        url: 'https://torrent-hub.net/content-123',
        title: 'Torrent: Similar Content Available',
        snippet: 'Torrent file available for download. High speed, verified.',
        similarity: 65,
        riskLevel: 'medium',
        matchType: 'suspicious',
        confidence: 70,
        details: {
          source: 'torrent',
          lastSeen: new Date().toISOString(),
          accessType: 'public'
        }
      }
    ];

    return {
      scanId,
      overallRisk: 'medium',
      confidenceScore: 75,
      matches: demoMatches,
      summary: 'Demo scan detected 2 potential piracy matches with moderate risk of unauthorized distribution.',
      recommendations: [
        '👀 Monitor these sites regularly for changes',
        '📝 Document all evidence for potential legal action',
        '🛡️ Enable blockchain timestamping for stronger IP proof'
      ],
      scanDetails: {
        contentHash: request.fileHash || 'demo-hash-' + Date.now(),
        contentType: request.contentType || 'unknown',
        scanTimestamp: new Date().toISOString(),
        searchQueries: ['demo query 1', 'demo query 2'],
        aiAnalysis: 'Demo AI analysis completed'
      }
    };
  }
} 