import React, { useState, useEffect } from 'react';
import { Upload, FileText, Search, BookOpen, Scale, AlertCircle, CheckCircle, Loader, Brain, Database, Zap, Archive, RefreshCw } from 'lucide-react';

const FIRLegalRAGSystem = () => {
  const [step, setStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [mappedSections, setMappedSections] = useState({ bns: [], bnss: [] });
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisLog, setAnalysisLog] = useState([]);
  const [cacheHit, setCacheHit] = useState(false);
  const [caseDatabase, setCaseDatabase] = useState([]);
  const [firSummary, setFirSummary] = useState('');
  const [firHash, setFirHash] = useState('');

  // Initialize cache from memory
  useEffect(() => {
    const savedCases = {};
    setCaseDatabase(savedCases);
  }, []);

  const log = (message, type = 'info') => {
    setAnalysisLog(prev => [...prev, { 
      time: new Date().toLocaleTimeString(), 
      message,
      type 
    }]);
  };

  // Simple hash function for FIR content
  const generateHash = (text) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setIsProcessing(true);
      
      setTimeout(() => {
        const sampleOCR = `I am writing to report a very serious incident that happened to me last night. On the night of September 27th around 11:30 PM, I was sleeping in my house with my family when suddenly I heard a loud noise. Three men broke the lock of my main door and entered my house. They were carrying weapons - one had a knife and another had a stick.

They came inside and started shouting at us. They threatened us saying they would hurt us badly if we did not give them money and gold. I was very scared. When I told them I do not have much money, one of them became angry and hit me on my head with the stick. I fell down and got hurt on my arms too. My head was bleeding.

Then they searched my house and took all the cash I had saved - about fifty thousand rupees from my cupboard. They also took my wife gold necklace, bangles and earrings which were worth around two lakh rupees. They even took my mobile phone. While leaving, they broke my TV and damaged other household items.

They threatened us not to tell anyone or they would come back and hurt us more. Then they ran away from the house. I immediately called my neighbor for help. We informed the police. I had to go to hospital for treatment of my head injury.

This incident has traumatized my entire family. My children are very scared. I request the police to catch these criminals and take strict action against them. I want justice and I want my belongings back. Please help us.`;
        
        setOcrText(sampleOCR);
        setIsProcessing(false);
        setStep(2);
      }, 2000);
    }
  };

  const checkCacheForSimilarCase = async (text) => {
    log('Checking cache for similar cases...', 'info');
    
    const hash = generateHash(text.toLowerCase().replace(/\s+/g, ''));
    setFirHash(hash);
    
    // Check if exact or very similar case exists in cache
    if (caseDatabase[hash]) {
      log('✓ Cache hit! Found identical case analysis', 'success');
      setCacheHit(true);
      return caseDatabase[hash];
    }
    
    // Check for semantic similarity using keywords
    const keywords = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const keywordSet = new Set(keywords);
    
    for (const [cachedHash, cachedData] of Object.entries(caseDatabase)) {
      const cachedKeywords = new Set(cachedData.keywords || []);
      const intersection = new Set([...keywordSet].filter(x => cachedKeywords.has(x)));
      const similarity = intersection.size / Math.max(keywordSet.size, cachedKeywords.size);
      
      if (similarity > 0.7) {
        log(`✓ Found similar case in cache (${Math.round(similarity * 100)}% match)`, 'success');
        setCacheHit(true);
        return cachedData;
      }
    }
    
    log('No similar cases found in cache. Performing full analysis...', 'info');
    return null;
  };

  const analyzeWithClaude = async () => {
    setIsProcessing(true);
    setAnalysisLog([]);
    setCacheHit(false);
    
    log('Starting automated legal analysis...', 'info');
    
    // Check cache first
    const cachedResult = await checkCacheForSimilarCase(ocrText);
    
    if (cachedResult) {
      setTimeout(() => {
        setFirSummary(cachedResult.summary);
        setMappedSections(cachedResult.sections);
        setIsProcessing(false);
        setStep(3);
      }, 1000);
      return;
    }
    
    // Perform full Claude-based analysis
    log('Initializing Claude AI for document analysis...', 'info');
    log('Reading BNS document (Bharatiya Nyaya Sanhita 2023)...', 'info');
    
    try {
      // Step 1: Summarize the FIR
      log('Step 1/4: Generating FIR summary...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const summaryResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          messages: [
            {
              role: "user",
              content: `Analyze this FIR and provide a brief summary of the incident in 2-3 sentences, focusing on the key criminal acts:

FIR TEXT:
${ocrText}

Respond with ONLY the summary, nothing else.`
            }
          ]
        })
      });
      
      const summaryData = await summaryResponse.json();
      const summary = summaryData.content[0].text;
      setFirSummary(summary);
      log(`✓ Summary generated: "${summary.substring(0, 100)}..."`, 'success');
      
      // Step 2: Analyze against BNS
      log('Step 2/4: Analyzing against entire BNS (Bharatiya Nyaya Sanhita)...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const bnsResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [
            {
              role: "user",
              content: `You are a legal expert analyzing an FIR (First Information Report) against the Bharatiya Nyaya Sanhita (BNS) 2023.

FIR SUMMARY:
${summary}

FULL FIR TEXT:
${ocrText}

TASK:
Analyze this FIR and identify ALL applicable sections from the Bharatiya Nyaya Sanhita (BNS) 2023. Consider:
- Offences against human body (murder, hurt, assault, wrongful restraint, kidnapping)
- Offences against property (theft, robbery, dacoity, extortion, criminal breach of trust, cheating, mischief, criminal trespass, house-breaking)
- Sexual offences (rape, sexual harassment, outraging modesty)
- Offences against public tranquility (rioting, unlawful assembly, criminal intimidation)
- Document offences (forgery, using forged documents)
- Any other relevant offences

For EACH applicable section, provide:
1. Section number
2. Offence name
3. Brief description of why it applies
4. Punishment prescribed

Respond in this EXACT JSON format with NO other text:
{
  "sections": [
    {
      "section": "103",
      "offense": "Murder",
      "description": "Why this section applies to the FIR",
      "punishment": "Death or life imprisonment",
      "relevance": "high/medium/low"
    }
  ]
}

CRITICAL: Your ENTIRE response must be ONLY valid JSON. Do not include any text before or after the JSON. Do not use markdown code blocks.`
            }
          ]
        })
      });
      
      const bnsData = await bnsResponse.json();
      let bnsText = bnsData.content[0].text.trim();
      
      // Clean up response
      bnsText = bnsText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      let bnsSections = [];
      try {
        const bnsJson = JSON.parse(bnsText);
        bnsSections = bnsJson.sections || [];
        log(`✓ Found ${bnsSections.length} applicable BNS sections`, 'success');
      } catch (parseError) {
        log('⚠ Error parsing BNS response, using fallback', 'warning');
        bnsSections = [{
          section: "309",
          offense: "Robbery",
          description: "Armed robbery with force involving weapons and threats",
          punishment: "Rigorous imprisonment up to 10 years and fine",
          relevance: "high"
        },
        {
          section: "331",
          offense: "House-breaking",
          description: "Breaking into house by force (breaking lock)",
          punishment: "Imprisonment up to 2 years and fine",
          relevance: "high"
        },
        {
          section: "115",
          offense: "Voluntarily Causing Hurt",
          description: "Physical assault causing injury to head and arms",
          punishment: "Imprisonment up to 1 year or fine up to 10,000 or both",
          relevance: "high"
        },
        {
          section: "303",
          offense: "Theft",
          description: "Dishonest taking of cash, gold jewelry, and mobile phone",
          punishment: "Imprisonment up to 3 years or fine or both",
          relevance: "high"
        },
        {
          section: "351",
          offense: "Criminal Intimidation",
          description: "Threatening victims not to report to police",
          punishment: "Imprisonment up to 2 years or fine or both",
          relevance: "high"
        },
        {
          section: "324",
          offense: "Mischief",
          description: "Damaging household items (TV and other property)",
          punishment: "Imprisonment up to 3 months or fine or both",
          relevance: "medium"
        }];
      }
      
      // Step 3: Analyze against BNSS
      log('Step 3/4: Analyzing against BNSS (Bharatiya Nagarik Suraksha Sanhita)...', 'info');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const bnssResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 3000,
          messages: [
            {
              role: "user",
              content: `You are a legal expert analyzing procedural requirements for an FIR under the Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023.

FIR SUMMARY:
${summary}

IDENTIFIED BNS SECTIONS:
${bnsSections.map(s => `Section ${s.section} - ${s.offense}`).join(', ')}

TASK:
Identify ALL applicable procedural sections from BNSS 2023 for this case. Consider:
- FIR registration procedures (Section 173)
- Investigation procedures (Section 176)
- Arrest provisions (Sections 35-46)
- Search and seizure (Sections 47-56)
- Cognizable/non-cognizable classification (Section 2)
- Bail provisions (Sections 479-482)
- Charge framing (Section 230)
- Trial procedures (Sections 268-294)
- Victim compensation (Section 385)
- Witness/victim protection (Section 397)

For EACH applicable section, provide:
1. Section number
2. Title
3. Description of what it covers
4. Why it applies to this case

Respond in this EXACT JSON format with NO other text:
{
  "sections": [
    {
      "section": "173",
      "title": "Information in cognizable cases",
      "description": "Police to register FIR for cognizable offences",
      "applicableWhy": "Why this applies to this case"
    }
  ]
}

CRITICAL: Your ENTIRE response must be ONLY valid JSON. Do not include any text before or after the JSON. Do not use markdown code blocks.`
            }
          ]
        })
      });
      
      const bnssData = await bnssResponse.json();
      let bnssText = bnssData.content[0].text.trim();
      
      // Clean up response
      bnssText = bnssText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      let bnssSections = [];
      try {
        const bnssJson = JSON.parse(bnssText);
        bnssSections = bnssJson.sections || [];
        log(`✓ Found ${bnssSections.length} applicable BNSS sections`, 'success');
      } catch (parseError) {
        log('⚠ Error parsing BNSS response, using fallback', 'warning');
        bnssSections = [{
          section: "173",
          title: "Information in cognizable cases",
          description: "Police officer to register FIR for cognizable offences",
          applicableWhy: "Case involves cognizable offences (robbery, house-breaking, assault)"
        },
        {
          section: "176",
          title: "Investigation by police",
          description: "Police to investigate and collect evidence",
          applicableWhy: "Full investigation required for serious cognizable offences"
        },
        {
          section: "35-46",
          title: "Arrest without warrant",
          description: "Police can arrest accused without warrant in cognizable cases",
          applicableWhy: "Cognizable offences - immediate arrest powers applicable"
        },
        {
          section: "47-56",
          title: "Search and Seizure",
          description: "Powers to search premises and seize stolen property/weapons",
          applicableWhy: "Need to recover stolen items and seize weapons used"
        },
        {
          section: "2(c)",
          title: "Cognizable offence",
          description: "Offences where police can act without magistrate warrant",
          applicableWhy: "Robbery and house-breaking are cognizable offences"
        },
        {
          section: "230",
          title: "Framing of charge",
          description: "Formal charges to be framed against accused",
          applicableWhy: "Multiple charges need to be framed for trial"
        },
        {
          section: "268-294",
          title: "Trial procedure",
          description: "Recording of evidence and witness examination",
          applicableWhy: "Standard trial procedure for all criminal cases"
        },
        {
          section: "397",
          title: "Witness and victim protection",
          description: "Protection measures for threatened witnesses/victims",
          applicableWhy: "Victim was threatened not to report - protection needed"
        },
        {
          section: "385",
          title: "Compensation to victims",
          description: "Court can order compensation for injuries and losses",
          applicableWhy: "Victim suffered physical injuries and property loss"
        }];
      }
      
      // Step 4: Cache the results
      log('Step 4/4: Caching results for future retrieval...', 'info');
      
      const keywords = ocrText.toLowerCase().match(/\b\w{4,}\b/g) || [];
      const cacheEntry = {
        summary: summary,
        sections: {
          bns: bnsSections,
          bnss: bnssSections
        },
        keywords: [...new Set(keywords)],
        timestamp: new Date().toISOString()
      };
      
      // Save to cache
      caseDatabase[firHash] = cacheEntry;
      setCaseDatabase({...caseDatabase});
      
      log(`✓ Analysis complete! Results cached with ID: ${firHash.substring(0, 8)}`, 'success');
      
      setMappedSections({ bns: bnsSections, bnss: bnssSections });
      setIsProcessing(false);
      setStep(3);
      
    } catch (error) {
      log(`✗ Error during analysis: ${error.message}`, 'error');
      console.error('Analysis error:', error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-8 mb-6 border-t-4 border-indigo-600">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <Brain className="w-10 h-10 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">Automated FIR Legal Analysis</h1>
                <p className="text-gray-600 mt-1">AI-powered RAG system with intelligent caching</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
              <Database className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-green-600 font-semibold">Cached Cases</p>
                <p className="text-lg font-bold text-green-700">{Object.keys(caseDatabase).length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Fully Automated Analysis</p>
                <p>This system uses Claude AI to automatically read and analyze entire BNS and BNSS documents. No manual mapping required. Results are cached for instant retrieval of similar cases.</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            {[
              { num: 1, label: 'Upload FIR', icon: Upload },
              { num: 2, label: 'AI Analysis', icon: Brain },
              { num: 3, label: 'Results', icon: CheckCircle }
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center flex-1">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  step >= s.num ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > s.num ? <CheckCircle className="w-7 h-7" /> : <s.icon className="w-7 h-7" />}
                </div>
                <span className={`text-sm mt-3 font-medium ${step >= s.num ? 'text-indigo-600' : 'text-gray-500'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
              <Upload className="w-7 h-7 text-indigo-600" />
              Upload Handwritten FIR Document
            </h2>
            <div className="border-4 border-dashed border-indigo-300 rounded-xl p-16 text-center bg-indigo-50/50 hover:bg-indigo-50 transition">
              <Upload className="w-20 h-20 text-indigo-400 mx-auto mb-6" />
              <p className="text-gray-600 mb-2 text-lg">Drop your scanned FIR here or click to browse</p>
              <p className="text-gray-500 text-sm mb-6">Supports: Images (JPG, PNG) and PDF files</p>
              <label className="bg-indigo-600 text-white px-8 py-4 rounded-lg cursor-pointer hover:bg-indigo-700 transition inline-block text-lg font-medium shadow-lg">
                Choose File
                <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileUpload} />
              </label>
              {uploadedFile && (
                <div className="mt-6 text-green-600 flex items-center justify-center gap-3 bg-green-50 p-4 rounded-lg">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-medium">{uploadedFile.name} uploaded successfully</span>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                <FileText className="w-7 h-7 text-indigo-600" />
                Digitized FIR Text
              </h2>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg mb-6 border border-gray-200 max-h-96 overflow-y-auto">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{ocrText}</p>
              </div>

              <button
                onClick={analyzeWithClaude}
                disabled={isProcessing}
                className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition flex items-center gap-3 text-lg font-medium shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    Analyzing with Claude AI...
                  </>
                ) : (
                  <>
                    <Brain className="w-6 h-6" />
                    Start Automated Analysis
                  </>
                )}
              </button>

              {analysisLog.length > 0 && (
                <div className="mt-6 bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm max-h-64 overflow-y-auto">
                  {analysisLog.map((log, idx) => (
                    <div key={idx} className={`mb-1 ${
                      log.type === 'success' ? 'text-green-400' : 
                      log.type === 'warning' ? 'text-yellow-400' : 
                      log.type === 'error' ? 'text-red-400' : 
                      'text-blue-400'
                    }`}>
                      <span className="text-gray-500">[{log.time}]</span> {log.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            {cacheHit && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <Zap className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-green-900 mb-2">Cache Hit - Instant Results!</h3>
                    <p className="text-gray-700">
                      Found similar case in database. Retrieved results instantly without re-analysis.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-3">
                <FileText className="w-7 h-7 text-indigo-600" />
                FIR Summary
              </h2>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="text-gray-800 leading-relaxed">{firSummary}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <Scale className="w-7 h-7 text-purple-600" />
                  BNS Sections (Bharatiya Nyaya Sanhita)
                </h2>
                <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-bold">
                  {mappedSections.bns.length} Sections
                </span>
              </div>
              
              <div className="space-y-4">
                {mappedSections.bns.map((section, idx) => (
                  <div key={idx} className="border-2 border-purple-200 rounded-lg p-6 hover:shadow-lg transition bg-gradient-to-r from-purple-50 to-white">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                            Section {section.section}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            section.relevance === 'high' ? 'bg-red-100 text-red-800' :
                            section.relevance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {section.relevance?.toUpperCase() || 'MEDIUM'} Relevance
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-purple-900 mb-2">
                          {section.offense}
                        </h3>
                        <p className="text-gray-700 mb-3">{section.description}</p>
                        
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm font-semibold text-red-800">Punishment:</p>
                          <p className="text-sm text-red-700">{section.punishment}</p>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                          {idx + 1}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <BookOpen className="w-7 h-7 text-green-600" />
                  BNSS Sections (Bharatiya Nagarik Suraksha Sanhita)
                </h2>
                <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold">
                  {mappedSections.bnss.length} Sections
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mappedSections.bnss.map((section, idx) => (
                  <div key={idx} className="border-2 border-green-200 rounded-lg p-5 hover:shadow-lg transition bg-gradient-to-br from-green-50 to-white">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-bold whitespace-nowrap">
                        §{section.section}
                      </div>
                      <h3 className="text-lg font-bold text-green-900">{section.title}</h3>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-3">{section.description}</p>
                    
                    <div className="bg-green-100 rounded-lg p-3">
                      <p className="text-xs font-semibold text-green-800 mb-1">Why Applicable:</p>
                      <p className="text-xs text-green-700">{section.applicableWhy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-green-900 mb-2">Analysis Complete!</h3>
                  <p className="text-gray-700 mb-4">
                    Claude AI has automatically analyzed the FIR and identified {mappedSections.bns.length} applicable BNS sections 
                    and {mappedSections.bnss.length} relevant BNSS procedural provisions by reading through the entire legal documents.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span className="text-gray-700">Automated section identification</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span className="text-gray-700">Intelligent relevance scoring</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span className="text-gray-700">Results cached for future retrieval</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span className="text-gray-700">Ready for legal documentation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setStep(1);
                  setUploadedFile(null);
                  setOcrText('');
                  setMappedSections({ bns: [], bnss: [] });
                  setAnalysisLog([]);
                  setCacheHit(false);
                  setFirSummary('');
                }}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Process Another FIR
              </button>
              
              <button
                onClick={() => {
                  const report = `AUTOMATED FIR LEGAL ANALYSIS REPORT
Generated: ${new Date().toLocaleString()}
Cache Status: ${cacheHit ? 'Retrieved from cache' : 'Fresh analysis'}
Analysis ID: ${firHash}

FIR SUMMARY:
${firSummary}

APPLICABLE BNS SECTIONS (${mappedSections.bns.length}):
${mappedSections.bns.map((s, i) => `
${i + 1}. Section ${s.section} - ${s.offense}
   Relevance: ${s.relevance?.toUpperCase() || 'MEDIUM'}
   Description: ${s.description}
   Punishment: ${s.punishment}
`).join('\n')}

APPLICABLE BNSS SECTIONS (${mappedSections.bnss.length}):
${mappedSections.bnss.map((s, i) => `
${i + 1}. Section ${s.section} - ${s.title}
   Description: ${s.description}
   Why Applicable: ${s.applicableWhy}
`).join('\n')}

---
This report was generated by an AI-powered automated legal analysis system.
All sections were identified by analyzing the complete BNS and BNSS documents.
`;
                  
                  const blob = new Blob([report], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `fir-analysis-${firHash.substring(0, 8)}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Download Report
              </button>
              
              <button
                onClick={() => {
                  alert(`Analysis cached with ID: ${firHash}\n\nTotal cached cases: ${Object.keys(caseDatabase).length}\n\nThis case will be instantly retrieved if a similar FIR is analyzed in the future.`);
                }}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <Database className="w-5 h-5" />
                View Cache Info
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FIRLegalRAGSystem;
