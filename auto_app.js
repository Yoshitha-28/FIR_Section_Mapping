import React, { useState } from 'react';
import { Upload, FileText, Search, BookOpen, Scale, AlertCircle, CheckCircle, Loader, Brain, Database } from 'lucide-react';

const FIRLegalRAGSystem = () => {
  const [step, setStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [extractedKeywords, setExtractedKeywords] = useState([]);
  const [mappedSections, setMappedSections] = useState({ bns: [], bnss: [] });
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisLog, setAnalysisLog] = useState([]);

  // Comprehensive BNS Knowledge Base (Expandable structure)
  const bnsDatabase = {
    // Chapter 1: Preliminary
    definitions: {
      'dishonestly': { section: '2(7)', description: 'Doing anything with intention of causing wrongful gain or loss', keywords: ['wrongful gain', 'wrongful loss', 'intention', 'gain', 'loss'] },
      'fraudulently': { section: '2(9)', description: 'Doing anything with intention to defraud', keywords: ['fraud', 'defraud', 'deceive', 'cheat'] },
      'voluntarily': { section: '2(33)', description: 'Causing effect by intended means or means known to be likely', keywords: ['intentional', 'knowingly', 'deliberately'] },
      'wrongful gain': { section: '2(36)', description: 'Gain by unlawful means of property not entitled', keywords: ['illegal gain', 'unlawful profit', 'unauthorized benefit'] },
      'wrongful loss': { section: '2(37)', description: 'Loss by unlawful means of property entitled', keywords: ['illegal loss', 'unlawful deprivation', 'unauthorized taking'] },
    },
    
    // Offences Against Human Body
    violenceOffences: {
      'murder': { 
        section: '103', 
        description: 'Whoever causes death with intention of causing death or with knowledge likely to cause death',
        keywords: ['kill', 'death', 'murdered', 'killed', 'fatal', 'died', 'dead', 'life ended', 'lifeless', 'slain'],
        punishment: 'Death or life imprisonment',
        relatedSections: ['101 - Culpable Homicide', '104 - Culpable Homicide not amounting to murder']
      },
      'culpable homicide': {
        section: '101',
        description: 'Causing death by doing act with intention of causing death or bodily injury likely to cause death',
        keywords: ['causing death', 'death caused', 'resulted in death', 'led to death'],
        punishment: 'Life imprisonment or imprisonment up to 10 years',
        relatedSections: ['103 - Murder', '104 - Exception to Murder']
      },
      'hurt': {
        section: '115',
        description: 'Voluntarily causing hurt - causing bodily pain, disease or infirmity',
        keywords: ['hurt', 'injured', 'wound', 'pain', 'hit', 'beat', 'struck', 'attacked', 'physical harm', 'bodily injury'],
        punishment: 'Imprisonment up to 1 year or fine up to 10,000 or both',
        relatedSections: ['118 - Causing hurt by dangerous weapons', '117 - Causing grievous hurt']
      },
      'grievous hurt': {
        section: '121',
        description: 'Eight types of hurt deemed grievous - emasculation, permanent sight loss, hearing loss, etc.',
        keywords: ['serious injury', 'severe harm', 'permanent damage', 'disfigurement', 'fracture', 'broken bones', 'disabled'],
        punishment: 'Imprisonment up to 7 years and fine',
        relatedSections: ['117 - Voluntarily causing grievous hurt', '115 - Simple hurt']
      },
      'assault': {
        section: '131',
        description: 'Use of criminal force on any person',
        keywords: ['assault', 'force', 'pushed', 'shoved', 'grabbed', 'physical contact', 'touched', 'manhandled'],
        punishment: 'Imprisonment up to 3 months or fine up to 1,000 or both',
        relatedSections: ['132 - Assault with intent', '74 - Criminal force']
      },
      'wrongful restraint': {
        section: '126',
        description: 'Voluntarily obstructing person so as to prevent from proceeding',
        keywords: ['restrained', 'blocked', 'prevented', 'obstructed', 'stopped', 'confined', 'trapped'],
        punishment: 'Imprisonment up to 1 month or fine up to 5,000 or both',
        relatedSections: ['127 - Wrongful confinement']
      },
      'wrongful confinement': {
        section: '127',
        description: 'Wrongfully restraining person so as to prevent proceeding beyond certain limits',
        keywords: ['confined', 'locked up', 'imprisoned', 'detained', 'held captive', 'kidnapped', 'abducted'],
        punishment: 'Imprisonment up to 1 year or fine up to 5,000 or both',
        relatedSections: ['126 - Wrongful restraint', '137 - Kidnapping']
      },
      'kidnapping': {
        section: '137',
        description: 'Kidnapping from India or from lawful guardianship',
        keywords: ['kidnapped', 'abducted', 'taken away', 'forcibly removed', 'child taken', 'missing person'],
        punishment: 'Imprisonment up to 7 years and fine',
        relatedSections: ['139 - Kidnapping for ransom', '140 - Kidnapping for murder']
      },
    },

    // Property Offences
    propertyOffences: {
      'theft': {
        section: '303',
        description: 'Dishonestly taking movable property without consent with intention to take it',
        keywords: ['theft', 'stolen', 'took', 'taking', 'stole', 'thief', 'missing items', 'removed', 'disappeared', 'lost belongings'],
        punishment: 'Imprisonment up to 3 years or fine or both',
        relatedSections: ['304 - Theft in dwelling', '305 - Theft by clerk or servant']
      },
      'extortion': {
        section: '308',
        description: 'Intentionally putting person in fear of injury to person/reputation/property to deliver property',
        keywords: ['extortion', 'threatened', 'demanded money', 'blackmail', 'forced to pay', 'coerced', 'intimidated for money'],
        punishment: 'Imprisonment up to 3 years or fine or both',
        relatedSections: ['309 - Robbery', '310 - Dacoity']
      },
      'robbery': {
        section: '309',
        description: 'Theft with force or threat of force or putting person in fear of death or hurt',
        keywords: ['robbery', 'robbed', 'forcibly taken', 'snatched', 'looted', 'plundered', 'forceful theft', 'threatened and took'],
        punishment: 'Rigorous imprisonment up to 10 years and fine',
        relatedSections: ['310 - Dacoity', '303 - Theft']
      },
      'dacoity': {
        section: '310',
        description: 'When 5 or more persons conjointly commit or attempt robbery',
        keywords: ['gang robbery', 'group attack', 'multiple attackers', 'armed gang', 'looted by group'],
        punishment: 'Life imprisonment or rigorous imprisonment up to 10 years and fine',
        relatedSections: ['309 - Robbery', '311 - Robbery or dacoity with attempt to cause death']
      },
      'criminal breach of trust': {
        section: '316',
        description: 'Dishonest misappropriation or conversion of property entrusted',
        keywords: ['breach of trust', 'misappropriation', 'embezzlement', 'entrusted', 'misused', 'converted', 'betrayed trust'],
        punishment: 'Imprisonment up to 3 years or fine or both',
        relatedSections: ['317 - CBT by public servant', '318 - Cheating']
      },
      'cheating': {
        section: '318',
        description: 'Fraudulently or dishonestly inducing person to deliver property or make/alter valuable security',
        keywords: ['cheating', 'cheated', 'fraud', 'deceived', 'tricked', 'conned', 'swindled', 'duped', 'scammed', 'false promise'],
        punishment: 'Imprisonment up to 3 years or fine or both',
        relatedSections: ['319 - Cheating by personation', '316 - Criminal breach of trust']
      },
      'criminal trespass': {
        section: '329',
        description: 'Entry into property in possession of another with intent to commit offence or intimidate',
        keywords: ['trespass', 'entered', 'unauthorized entry', 'broke in', 'intruded', 'unlawful entry', 'invaded property'],
        punishment: 'Imprisonment up to 3 months or fine up to 3,000 or both',
        relatedSections: ['331 - House-breaking', '303 - Theft']
      },
      'house-breaking': {
        section: '331',
        description: 'Breaking house or building to commit offense',
        keywords: ['broke into house', 'forced entry', 'breaking and entering', 'smashed door', 'broken lock', 'burglary'],
        punishment: 'Imprisonment up to 2 years and fine',
        relatedSections: ['329 - Criminal trespass', '303 - Theft']
      },
      'mischief': {
        section: '324',
        description: 'Causing wrongful loss or damage to property with intent',
        keywords: ['damage', 'destroyed', 'vandalism', 'damaged property', 'broke items', 'ruined', 'defaced', 'harmed belongings'],
        punishment: 'Imprisonment up to 3 months or fine or both',
        relatedSections: ['325 - Mischief by fire or explosive']
      },
    },

    // Sexual Offences
    sexualOffences: {
      'rape': {
        section: '63',
        description: 'Sexual intercourse without consent or with consent obtained by fraud/coercion',
        keywords: ['rape', 'sexual assault', 'forced', 'non-consensual', 'molested', 'sexually abused', 'violated'],
        punishment: 'Rigorous imprisonment not less than 10 years, may extend to life and fine',
        relatedSections: ['64 - Rape with certain aggravating circumstances', '74 - Sexual harassment']
      },
      'sexual harassment': {
        section: '74',
        description: 'Unwelcome physical contact, advances, demand for sexual favors, or sexually colored remarks',
        keywords: ['sexual harassment', 'inappropriate touch', 'unwanted advances', 'lewd remarks', 'sexual comments'],
        punishment: 'Imprisonment up to 3 years or fine or both',
        relatedSections: ['63 - Rape', '75 - Assault with intent to outrage modesty']
      },
      'outraging modesty': {
        section: '75',
        description: 'Assault or criminal force with intent to outrage modesty',
        keywords: ['modesty', 'inappropriate behavior', 'indecent act', 'obscene gesture', 'outraged dignity'],
        punishment: 'Imprisonment up to 5 years and fine',
        relatedSections: ['74 - Sexual harassment']
      },
    },

    // Public Tranquility
    publicOrder: {
      'rioting': {
        section: '189',
        description: 'Force or violence by unlawful assembly',
        keywords: ['riot', 'mob violence', 'public disturbance', 'violent protest', 'mass violence', 'unruly crowd'],
        punishment: 'Imprisonment up to 2 years or fine or both',
        relatedSections: ['190 - Rioting with deadly weapon', '191 - Unlawful assembly']
      },
      'criminal intimidation': {
        section: '351',
        description: 'Threatening person with injury to person, reputation or property with intent to cause alarm',
        keywords: ['threatened', 'intimidated', 'warned', 'menaced', 'scared', 'terrorized', 'frightened', 'warning given'],
        punishment: 'Imprisonment up to 2 years or fine or both',
        relatedSections: ['308 - Extortion', '352 - Criminal intimidation with death threat']
      },
    },

    // Document Offences
    documentOffences: {
      'forgery': {
        section: '336',
        description: 'Making false document with intent to cause damage or injury or to claim property',
        keywords: ['forged', 'fake document', 'false papers', 'counterfeit', 'fabricated', 'falsified', 'altered document'],
        punishment: 'Imprisonment up to 2 years or fine or both',
        relatedSections: ['337 - Forgery of valuable security', '340 - Using forged document']
      },
      'using forged document': {
        section: '340',
        description: 'Fraudulently or dishonestly using document known to be forged',
        keywords: ['used fake document', 'presented false papers', 'submitted forged', 'showed counterfeit'],
        punishment: 'Same as forgery',
        relatedSections: ['336 - Forgery']
      },
    },
  };

  // BNSS Database (Procedural provisions)
  const bnssDatabase = {
    investigation: {
      'fir': {
        section: '173',
        title: 'Information in cognizable cases',
        description: 'Police to register FIR for cognizable offences and begin investigation',
        keywords: ['complaint', 'report', 'fir', 'police report', 'lodge complaint', 'file case'],
        applicableWhen: 'Any cognizable offence'
      },
      'investigation': {
        section: '176',
        title: 'Investigation by police',
        description: 'Police officer to investigate cognizable case and examine witnesses',
        keywords: ['investigate', 'inquiry', 'probe', 'examination', 'questioning'],
        applicableWhen: 'After FIR registration'
      },
      'arrest': {
        section: '35-46',
        title: 'Arrest provisions',
        description: 'How and when arrest can be made, rights of arrested person',
        keywords: ['arrest', 'detained', 'custody', 'apprehended', 'taken into custody'],
        applicableWhen: 'During investigation for cognizable offences'
      },
      'search and seizure': {
        section: '47-56',
        title: 'Search and Seizure',
        description: 'Powers to search places and seize property',
        keywords: ['search', 'seized', 'recovered', 'found', 'confiscated', 'taken possession'],
        applicableWhen: 'During investigation'
      },
    },
    
    trial: {
      'charge': {
        section: '230',
        title: 'Framing of charge',
        description: 'How charges are to be framed against accused',
        keywords: ['charge', 'accused', 'alleged', 'charged with'],
        applicableWhen: 'Before trial begins'
      },
      'evidence': {
        section: '268-294',
        title: 'Trial procedures and evidence',
        description: 'Recording evidence, examination of witnesses, judgment',
        keywords: ['evidence', 'witness', 'testimony', 'proof', 'statement'],
        applicableWhen: 'During trial'
      },
      'bail': {
        section: '479-482',
        title: 'Bail provisions',
        description: 'When bail can be granted or refused',
        keywords: ['bail', 'released', 'surety', 'bond'],
        applicableWhen: 'After arrest or during trial'
      },
    },

    cognizability: {
      'cognizable': {
        section: '2(c)',
        title: 'Cognizable offence definition',
        description: 'Offence for which police can arrest without warrant',
        keywords: ['serious offence', 'arrestable', 'non-bailable'],
        applicableWhen: 'Serious offences like murder, rape, robbery, kidnapping'
      },
      'non-cognizable': {
        section: '2(l)',
        title: 'Non-cognizable offence definition',
        description: 'Offence for which police cannot arrest without warrant',
        keywords: ['minor offence', 'warrant required'],
        applicableWhen: 'Less serious offences like simple hurt, defamation'
      },
    },

    victimRights: {
      'victim compensation': {
        section: '385',
        title: 'Compensation to victims',
        description: 'Court can order compensation to victim or legal heir',
        keywords: ['compensation', 'damages', 'reparation', 'relief'],
        applicableWhen: 'After conviction or during trial'
      },
      'protection': {
        section: '397',
        title: 'Protection of witnesses and victims',
        description: 'Measures for protection of witnesses and victims',
        keywords: ['protection', 'safety', 'security', 'shield'],
        applicableWhen: 'When victim or witness is threatened'
      },
    },
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setIsProcessing(true);
      
      // Simulate OCR processing with natural language FIR
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

  const analyzeWithClaude = async () => {
    setIsProcessing(true);
    setAnalysisLog([]);
    
    const log = (message) => {
      setAnalysisLog(prev => [...prev, { time: new Date().toLocaleTimeString(), message }]);
    };

    log('Starting AI-powered analysis of FIR text...');
    
    // Simulate Claude API analysis
    setTimeout(async () => {
      log('Extracting keywords and understanding context...');
      
      // Extract keywords from natural language
      const keywords = [];
      const text = ocrText.toLowerCase();
      
      // Search through entire BNS database
      const allBnsSections = [];
      const allBnssSections = [];
      
      // Check each BNS section
      Object.values(bnsDatabase).forEach(category => {
        Object.entries(category).forEach(([offense, data]) => {
          let relevanceScore = 0;
          const matchedKeywords = [];
          
          data.keywords.forEach(keyword => {
            if (text.includes(keyword.toLowerCase())) {
              relevanceScore++;
              matchedKeywords.push(keyword);
              if (!keywords.find(k => k.word === keyword)) {
                keywords.push({ word: keyword, offense: offense });
              }
            }
          });
          
          if (relevanceScore > 0) {
            allBnsSections.push({
              offense: offense,
              section: data.section,
              description: data.description,
              punishment: data.punishment,
              relevanceScore: relevanceScore,
              matchedKeywords: matchedKeywords,
              relatedSections: data.relatedSections || []
            });
          }
        });
      });
      
      log(`Found ${keywords.length} relevant keywords in FIR text`);
      log(`Identified ${allBnsSections.length} potentially applicable BNS sections`);
      
      // Sort by relevance
      allBnsSections.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      // Determine BNSS sections based on BNS offences
      log('Mapping to BNSS procedural sections...');
      
      const cognizableOffenses = ['murder', 'rape', 'robbery', 'dacoity', 'kidnapping', 'grievous hurt', 'house-breaking'];
      const isCognizable = allBnsSections.some(s => cognizableOffenses.includes(s.offense));
      
      // Add relevant BNSS sections
      allBnssSections.push({
        section: '173',
        title: 'Registration of FIR',
        description: 'Police to register FIR for cognizable offences',
        reason: 'FIR must be registered as offences are cognizable'
      });
      
      allBnssSections.push({
        section: '176',
        title: 'Investigation by Police',
        description: 'Police to investigate and collect evidence',
        reason: 'Investigation required for all reported offences'
      });
      
      if (allBnsSections.some(s => ['murder', 'rape', 'robbery', 'dacoity', 'kidnapping'].includes(s.offense))) {
        allBnssSections.push({
          section: '35-46',
          title: 'Arrest without Warrant',
          description: 'Police can arrest accused without warrant in cognizable cases',
          reason: 'Serious cognizable offences - arrest powers applicable'
        });
      }
      
      if (text.includes('threatened') || text.includes('weapon') || text.includes('hurt')) {
        allBnssSections.push({
          section: '47-56',
          title: 'Search and Seizure',
          description: 'Police can search premises and seize weapons/stolen property',
          reason: 'Weapons mentioned - search and seizure applicable'
        });
      }
      
      allBnssSections.push({
        section: '2(c)',
        title: 'Cognizable Offence',
        description: 'Offences are cognizable - police can act without magistrate order',
        reason: isCognizable ? 'Case involves cognizable offences' : 'Need to determine cognizability'
      });
      
      allBnssSections.push({
        section: '230',
        title: 'Framing of Charges',
        description: 'Formal charges to be framed against accused',
        reason: 'Required before trial can commence'
      });
      
      allBnssSections.push({
        section: '268-294',
        title: 'Trial Procedure',
        description: 'Recording of evidence and witness examination',
        reason: 'Standard trial procedure for all cases'
      });
      
      if (text.includes('scared') || text.includes('threatened') || text.includes('traumatized')) {
        allBnssSections.push({
          section: '397',
          title: 'Witness/Victim Protection',
          description: 'Protection measures for threatened victims',
          reason: 'Victim mentions threats and fear - protection needed'
        });
      }
      
      allBnssSections.push({
        section: '385',
        title: 'Victim Compensation',
        description: 'Court can order compensation to victim',
        reason: 'Victim suffered injuries and property loss'
      });
      
      log('Analysis complete! Generated comprehensive legal mapping');
      
      setExtractedKeywords(keywords);
      setMappedSections({ bns: allBnsSections, bnss: allBnssSections });
      setIsProcessing(false);
      setStep(3);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-8 mb-6 border-t-4 border-indigo-600">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Brain className="w-10 h-10 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">AI-Powered FIR Legal Analysis System</h1>
              <p className="text-gray-600 mt-1">Comprehensive RAG-based mapping to entire BNS and BNSS</p>
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            {[
              { num: 1, label: 'Upload FIR', icon: Upload },
              { num: 2, label: 'AI Analysis', icon: Brain },
              { num: 3, label: 'Legal Mapping', icon: Scale }
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
              Step 1: Upload Handwritten FIR Document
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
                Step 2: Digitized FIR Text (Natural Language)
              </h2>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg mb-6 border border-gray-200 max-h-96 overflow-y-auto">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{ocrText}</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Natural Language Processing</p>
                    <p>This system uses AI to analyze natural language complaints without requiring legal terminology. The RAG system will search through the entire BNS and BNSS databases to find all relevant sections.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={analyzeWithClaude}
                disabled={isProcessing}
                className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition flex items-center gap-3 text-lg font-medium shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Brain className="w-6 h-6" />
                    Analyze and Map to Legal Sections
                  </>
                )}
              </button>

              {analysisLog.length > 0 && (
                <div className="mt-6 bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm max-h-48 overflow-y-auto">
                  {analysisLog.map((log, idx) => (
                    <div key={idx} className="mb-1">
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
            <div className="bg-white rounded-xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                <Search className="w-7 h-7 text-indigo-600" />
                Step 3: Extracted Keywords from Natural Language
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Keywords Found</h3>
                  </div>
                  <p className="text-3xl font-bold text-blue-700">{extractedKeywords.length}</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-purple-900">BNS Sections</h3>
                  </div>
                  <p className="text-3xl font-bold text-purple-700">{mappedSections.bns.length}</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-900">BNSS Sections</h3>
                  </div>
                  <p className="text-3xl font-bold text-green-700">{mappedSections.bnss.length}</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Keywords Extracted from FIR
                </h3>
                <div className="flex flex-wrap gap-2">
                  {extractedKeywords.slice(0, 20).map((kw, idx) => (
                    <span key={idx} className="bg-yellow-200 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium">
                      {kw.word}
                    </span>
                  ))}
                  {extractedKeywords.length > 20 && (
                    <span className="text-yellow-700 px-3 py-1 text-sm">
                      +{extractedKeywords.length - 20} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                <Scale className="w-7 h-7 text-purple-600" />
                BNS (Bharatiya Nyaya Sanhita) - Applicable Sections
              </h2>
              
              <div className="space-y-4">
                {mappedSections.bns.map((section, idx) => (
                  <div key={idx} className="border-2 border-purple-200 rounded-lg p-6 hover:shadow-lg transition bg-gradient-to-r from-purple-50 to-white">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                            Section {section.section}
                          </span>
                          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                            Relevance: {section.relevanceScore} matches
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-purple-900 mb-2 capitalize">
                          {section.offense.replace(/-/g, ' ')}
                        </h3>
                        <p className="text-gray-700 mb-3">{section.description}</p>
                        
                        <div className="bg-white rounded-lg p-3 mb-3 border border-purple-100">
                          <p className="text-sm font-semibold text-purple-800 mb-2">Matched Keywords:</p>
                          <div className="flex flex-wrap gap-2">
                            {section.matchedKeywords.map((kw, i) => (
                              <span key={i} className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {section.punishment && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                            <p className="text-sm font-semibold text-red-800">Punishment:</p>
                            <p className="text-sm text-red-700">{section.punishment}</p>
                          </div>
                        )}
                        
                        {section.relatedSections && section.relatedSections.length > 0 && (
                          <div className="bg-purple-50 rounded-lg p-3">
                            <p className="text-sm font-semibold text-purple-800 mb-2">Related Sections:</p>
                            <div className="space-y-1">
                              {section.relatedSections.map((rel, i) => (
                                <p key={i} className="text-sm text-purple-700">• {rel}</p>
                              ))}
                            </div>
                          </div>
                        )}
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
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                <BookOpen className="w-7 h-7 text-green-600" />
                BNSS (Bharatiya Nagarik Suraksha Sanhita) - Procedural Sections
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mappedSections.bnss.map((section, idx) => (
                  <div key={idx} className="border-2 border-green-200 rounded-lg p-5 hover:shadow-lg transition bg-gradient-to-br from-green-50 to-white">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-bold whitespace-nowrap">
                        Section {section.section}
                      </div>
                      <h3 className="text-lg font-bold text-green-900">{section.title}</h3>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-3">{section.description}</p>
                    
                    <div className="bg-green-100 rounded-lg p-3">
                      <p className="text-xs font-semibold text-green-800 mb-1">Why Applicable:</p>
                      <p className="text-xs text-green-700">{section.reason}</p>
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
                    The system has successfully analyzed the natural language FIR and identified {mappedSections.bns.length} applicable BNS sections 
                    and {mappedSections.bnss.length} relevant BNSS procedural provisions. This comprehensive mapping can now be used for:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span>Legal documentation and case filing with proper section references</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span>Investigation guidance for law enforcement officers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span>Charge sheet preparation with relevant substantive and procedural laws</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span>Legal advisory for victims understanding their rights and applicable laws</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setStep(1);
                  setUploadedFile(null);
                  setOcrText('');
                  setExtractedKeywords([]);
                  setMappedSections({ bns: [], bnss: [] });
                  setAnalysisLog([]);
                }}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Process Another FIR
              </button>
              
              <button
                onClick={() => {
                  const report = `FIR LEGAL ANALYSIS REPORT
                  
Generated: ${new Date().toLocaleString()}

APPLICABLE BNS SECTIONS:
${mappedSections.bns.map((s, i) => `
${i + 1}. Section ${s.section} - ${s.offense}
   Description: ${s.description}
   Punishment: ${s.punishment}
   Matched Keywords: ${s.matchedKeywords.join(', ')}
`).join('\n')}

APPLICABLE BNSS SECTIONS:
${mappedSections.bnss.map((s, i) => `
${i + 1}. Section ${s.section} - ${s.title}
   Description: ${s.description}
   Reason: ${s.reason}
`).join('\n')}`;
                  
                  const blob = new Blob([report], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'fir-legal-analysis.txt';
                  a.click();
                }}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Download Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FIRLegalRAGSystem;+
