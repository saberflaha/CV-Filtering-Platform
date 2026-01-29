
import React, { useState } from 'react';

// @ts-ignore
const PptxGenJS: any = (window as any).PptxGenJS;

interface TechSpec {
  key: string;
  value: string;
}

interface DocSection {
  id: string;
  phase: string;
  title: string;
  icon: string;
  summary: string;
  details: React.ReactNode;
  specs: TechSpec[];
  exportText: string; // Plain text version for PPT export
}

export const SystemGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState('infra');

  const sections: DocSection[] = [
    {
      id: 'infra',
      phase: 'PHASE 0',
      title: 'System Infrastructure',
      icon: '🏢',
      summary: 'Multi-branch isolation and granular RBAC (Role-Based Access Control).',
      exportText: 'The platform operates on a Branch Infrastructure. This allows a single organization to create independent recruitment environments. Governance: Admins are bound to specific Branch IDs. No data leakage occurs between branches. Role Protocols: Granular permissions are managed per module.',
      specs: [
        { key: 'Architecture', value: 'Multi-tenant Logical Isolation' },
        { key: 'Auth Method', value: 'Mock Branch-Key Protocol' },
        { key: 'Database', value: 'Local Persistence (hireai_*)' }
      ],
      details: (
        <div className="space-y-6">
          <p className="text-lg font-medium leading-relaxed">
            The platform operates on a <span className="text-indigo-600 font-bold underline">Branch Infrastructure</span>. This allows a single organization to create independent recruitment environments for different physical locations or subsidiaries.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-slate-900 rounded-3xl border border-white/10">
              <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Governance</h5>
              <p className="text-xs text-slate-400 leading-relaxed">Admins are bound to specific Branch IDs. No data leakage occurs between branches unless a Super Admin overrides via Global Command.</p>
            </div>
            <div className="p-6 bg-slate-900 rounded-3xl border border-white/10">
              <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Role Protocols</h5>
              <p className="text-xs text-slate-400 leading-relaxed">Granular permissions (VIEW, CREATE, EXECUTE) are managed per module, ensuring strict technical compliance with internal HR policies.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'jobs',
      phase: 'PHASE A',
      title: 'Requisition Design',
      icon: '✍️',
      summary: 'Architecting job posts with AI-assisted skill extraction and matching weights.',
      exportText: 'Administrators define the Professional Benchmark. Using Gemini-3-Flash, the AI identifies core competencies automatically. Matching Weights: Skills (40%), Experience (30%), Keywords (20%), Education (10%).',
      specs: [
        { key: 'AI Service', value: 'Gemini-3-Flash' },
        { key: 'Logic', value: 'Natural Language to Array' },
        { key: 'Config', value: 'Dynamic Weighting' }
      ],
      details: (
        <div className="space-y-6">
          <p className="text-slate-600 dark:text-slate-400">
            Administrators define the <span className="font-bold text-slate-900 dark:text-white">Professional Benchmark</span>. By pasting a raw job description, the AI service identifies core competencies and soft skills automatically.
          </p>
          <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border-2 border-indigo-100 dark:border-indigo-800">
            <h5 className="text-xs font-black text-indigo-600 uppercase mb-4">Matching Weights Algorithm</h5>
            <ul className="space-y-3 text-xs font-bold text-slate-600 dark:text-slate-400">
              <li>• <span className="text-indigo-600">Skills (40%):</span> Direct technical stack overlap.</li>
              <li>• <span className="text-indigo-600">Experience (30%):</span> Industry tenure validation.</li>
              <li>• <span className="text-indigo-600">Keywords (20%):</span> Mandatory certifications/tech.</li>
              <li>• <span className="text-indigo-600">Education (10%):</span> Minimum academic requirements.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'scale',
      phase: 'PHASE X',
      title: 'Scalability & Production',
      icon: '🚀',
      summary: 'Architectural blueprint for handling 200,000+ candidate records.',
      exportText: 'To achieve 200k record capacity, system must move to PostgreSQL/NoSQL managed clusters. File storage should migrate to S3/GCS. Search must use Vector Indices (Pinecone) or ElasticSearch for performance.',
      specs: [
        { key: 'Database', value: 'PostgreSQL / Supabase' },
        { key: 'Search', value: 'Vector DB (Pinecone)' },
        { key: 'Auth', value: 'JWT / Clerk / Firebase' }
      ],
      details: (
        <div className="space-y-6">
          <p className="text-lg font-medium leading-relaxed">
            The target benchmark is <span className="text-indigo-600 font-black">200,000 Candidates</span>. This requires a shift from Client-Side storage to a Distributed Server Architecture.
          </p>
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-800">
            <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Production Stack Migration</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <p className="font-bold text-slate-700 dark:text-slate-200">1. Data Persistence</p>
                <p className="text-slate-500">Migrate from localStorage to PostgreSQL. Use Connection Pooling for high-concurrency parsing.</p>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-slate-700 dark:text-slate-200">2. Vector Search</p>
                <p className="text-slate-500">Enable Semantic Matching using Gemini Embeddings and Pinecone for millisecond retrieval across 200k files.</p>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-slate-700 dark:text-slate-200">3. Binary Storage</p>
                <p className="text-slate-500">Use AWS S3 or Google Cloud Storage for CV PDF hosting. Never store binary data in the DB.</p>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-slate-700 dark:text-slate-200">4. Asynchronous Queues</p>
                <p className="text-slate-500">Implement Redis/BullMQ to handle AI processing of bulk CV uploads without timing out the UI.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'parsing',
      phase: 'PHASE B',
      title: 'Talent Ingress',
      icon: '📤',
      summary: 'Multi-format CV parsing and automated profile generation.',
      exportText: 'Parsing Engine executes text-normalization. Uses PDF.js and Mammoth.js for OCR and text cleansing. Gemini extracts entities into structured JSON mapping.',
      specs: [
        { key: 'Library', value: 'PDF.js / Mammoth.js' },
        { key: 'Parsing', value: 'AI Entity Extraction' },
        { key: 'Response', value: 'Structured JSON Mapping' }
      ],
      details: (
        <div className="space-y-6">
          <p className="text-slate-600 dark:text-slate-400">
            When a file is uploaded, the <span className="font-bold text-slate-900 dark:text-white">Parsing Engine</span> executes a text-normalization process.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {['OCR Scan', 'Text Cleansing', 'Entity Mapping'].map(step => (
              <div key={step} className="p-4 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase">{step}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 p-4 rounded-xl">
            Endpoint: parseResume(text: string) => ExtractedCVData
          </p>
        </div>
      )
    },
    {
      id: 'oracle',
      phase: 'PHASE C',
      title: 'Market Oracle',
      icon: '🔮',
      summary: 'Grounded search logic for localized Jordanian market benchmarking.',
      exportText: 'Jordanian Context Intelligence: Queries tech salaries in Amman hubs. Analyzes local demand and provides 5-phase career roadmaps. Currency: JOD/USD (Fixed rate 1.41).',
      specs: [
        { key: 'Tooling', value: 'Google Search Grounding' },
        { key: 'Region', value: 'Jordan (Amman)' },
        { key: 'Currency', value: 'JOD/USD (Fixed rate 1.41)' }
      ],
      details: (
        <div className="space-y-6">
          <div className="p-8 bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-800 rounded-[2.5rem]">
            <h4 className="font-black text-amber-600 uppercase text-xs mb-4">Jordanian Context Intelligence</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Unlike generic HR tools, the **Oracle Service** specifically queries current tech salaries in Amman hubs like the King Hussein Business Park. It analyzes local demand for specific tech stacks (e.g., .NET in Banking, React in Startups) to provide a 5-phase career roadmap.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'assessment',
      phase: 'PHASE D',
      title: 'Technical Validation',
      icon: '🧠',
      summary: 'Dynamic exam generation based on individual candidate skills.',
      exportText: 'Generates unique assessments for every candidate. AI evaluates transferable skills. Logic flow: Generate Test -> User Answers -> AI Evaluation.',
      specs: [
        { key: 'Method', value: 'Real-time Generation' },
        { key: 'Evaluation', value: 'AI Grading & Reasoning' },
        { key: 'Output', value: 'Percentage + Technical Fit' }
      ],
      details: (
        <div className="space-y-6">
          <p className="text-slate-600 dark:text-slate-400">
            The platform generates a unique assessment for every candidate. If a job requires "React" but the candidate knows "Vue", the AI adapts the test to evaluate transferable skills or deep-dives into the overlap.
          </p>
          <div className="p-6 bg-slate-900 text-white rounded-3xl border border-white/5">
             <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-indigo-400 uppercase">Assessment Logic Flow</span>
                <span className="text-[10px] font-mono opacity-50">v2.5.0</span>
             </div>
             <div className="flex items-center gap-4 text-xs font-mono">
                <div className="px-3 py-1 bg-slate-800 rounded border border-white/10">Gen Test</div>
                <div className="text-indigo-400">→</div>
                <div className="px-3 py-1 bg-slate-800 rounded border border-white/10">User Answers</div>
                <div className="text-indigo-400">→</div>
                <div className="px-3 py-1 bg-indigo-600 rounded">AI Evaluate</div>
             </div>
          </div>
        </div>
      )
    },
    {
      id: 'intelligence',
      phase: 'PHASE E',
      title: 'Decision ROI',
      icon: '📊',
      summary: 'Multi-variable ranking and executive hiring recommendations.',
      exportText: 'Aggregates all data points: Match Score, Test Result, Salary Expectations, and Availability. Produces a single Intelligence Score and Hiring Rationale.',
      specs: [
        { key: 'Analysis', value: 'Candidate Intelligence' },
        { key: 'Recommendation', value: 'Hiring Rationale' },
        { key: 'Risk Engine', value: 'Salary vs Fit Analysis' }
      ],
      details: (
        <div className="space-y-6">
          <p className="text-slate-600 dark:text-slate-400">
            The **Intelligence Module** aggregates all data points (Match Score, Test Result, Salary Expectations, Availability) to produce a single "Intelligence Score."
          </p>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 italic">
            "AI analyzes the trade-offs between an immediate junior hire vs. a senior hire with a 60-day notice period."
          </p>
        </div>
      )
    },
    {
      id: 'comms',
      phase: 'PHASE Z',
      title: 'Communication Hub',
      icon: '✉️',
      summary: 'Final automated protocol dispatch via email.',
      exportText: 'Automated notification protocols using EmailJS API. Triggers for Confirmation, Rejection, and Interview Scheduling.',
      specs: [
        { key: 'Protocol', value: 'EmailJS API' },
        { key: 'Triggers', value: 'Status Change' },
        { key: 'Template', value: 'Dynamic Key-Value Mapping' }
      ],
      details: (
        <div className="space-y-6">
          <p className="text-slate-600 dark:text-slate-400">
            The system concludes the lifecycle with automated notifications. Every major step (Applied, Test Passed, Interview Set) triggers a pre-formatted email to the candidate.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900 text-xs font-black text-emerald-600 text-center">CONFIRMATION</div>
            <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900 text-xs font-black text-red-600 text-center">REJECTION</div>
          </div>
        </div>
      )
    }
  ];

  const downloadPPTX = () => {
    if (!PptxGenJS) {
      alert("Presentation generator not loaded. Please check your connection.");
      return;
    }
    // Fix: Using type casting to any to allow constructor call
    const pptx = new (PptxGenJS as any)();
    pptx.title = 'HR Documentation';
    
    // Cover Slide
    const cover = pptx.addSlide();
    cover.background = { color: '0f172a' };
    cover.addText("HR DOCUMENTATION", { x: 0.5, y: 2.0, w: '90%', fontSize: 48, bold: true, color: '4f46e5', align: 'center' });
    cover.addText("Proprietary Operational Guidelines v2.5", { x: 0.5, y: 3.2, w: '90%', fontSize: 18, color: 'ffffff', align: 'center' });
    cover.addText("Confidential • HR PLATFORME ECOSYSTEM", { x: 0.5, y: 5.0, w: '90%', fontSize: 12, color: '64748b', align: 'center' });

    // Section Slides
    sections.forEach((section) => {
      const s = pptx.addSlide();
      // Header
      s.addText(section.phase, { x: 0.5, y: 0.4, w: '90%', fontSize: 12, bold: true, color: '64748b' });
      s.addText(`${section.icon} ${section.title}`, { x: 0.5, y: 0.8, w: '90%', fontSize: 32, bold: true, color: '4f46e5' });
      
      // Main Content
      s.addText("OPERATIONAL THEORY", { x: 0.5, y: 1.8, fontSize: 10, bold: true, color: '4f46e5' });
      s.addText(section.exportText, { x: 0.5, y: 2.1, w: '60%', fontSize: 14, color: '334155', align: 'left' });

      // Technical Specs
      s.addText("SYSTEM SPECIFICATIONS", { x: 6.8, y: 1.8, fontSize: 10, bold: true, color: '64748b' });
      section.specs.forEach((spec, idx) => {
        s.addText(`${spec.key}:`, { x: 6.8, y: 2.2 + (idx * 0.8), fontSize: 9, bold: true, color: '94a3b8' });
        s.addText(spec.value, { x: 6.8, y: 2.4 + (idx * 0.8), fontSize: 11, color: '0f172a' });
      });
      
      // Footer
      s.addText("© 2024 HR PLATFORME ECOSYSTEM", { x: 0.5, y: 5.2, fontSize: 8, color: '94a3b8' });
    });

    pptx.writeFile({ fileName: 'HR_Documentation_Comprehensive.pptx' });
  };

  const activeSectionData = sections.find(s => s.id === activeSection);

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-12 text-left animate-fade-in-up font-sans">
      <style>{`
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>

      {/* High-Contrast Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8 no-print">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-lg">Official Manual</span>
            <span className="text-[10px] font-mono text-slate-400">ID: HR-DOC-2024-X</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-4">HR <span className="text-indigo-600 underline">Documentation</span></h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Detailed operational guidelines for the Elite Recruitment Protocol.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={downloadPPTX}
            className="btn-premium bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl transition-all flex items-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Print Manual (PPTX)
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-12 no-print">
        {/* Technical Nav Sidebar */}
        <aside className="lg:w-96 flex-shrink-0 space-y-4">
          <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-[2rem] border-2 border-slate-200 dark:border-slate-700 mb-8">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">SYSTEM BREADCRUMB</h4>
            <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 truncate">
              HR Documentation / {activeSectionData?.title}
            </div>
          </div>
          
          <nav className="space-y-3">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all group text-left ${
                  activeSection === section.id 
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-2xl shadow-indigo-600/30' 
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center gap-5">
                   <span className="text-2xl">{section.icon}</span>
                   <div className="flex flex-col">
                      <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${activeSection === section.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {section.phase}
                      </span>
                      <span className="text-xs font-black uppercase tracking-widest">{section.title}</span>
                   </div>
                </div>
                {activeSection === section.id && (
                  <svg className="w-5 h-5 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content View: Technical Manual Style */}
        <main className="flex-grow space-y-8 animate-in fade-in slide-in-from-right-12 duration-700">
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 md:p-16 border-2 border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/5 blur-[100px] -mr-40 -mt-40"></div>
             
             <div className="relative z-10">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 border-b-4 border-indigo-600 pb-10">
                  <div>
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em] mb-3 block">{activeSectionData?.phase}</span>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{activeSectionData?.title}</h2>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Service Classification</p>
                    <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-[10px] font-black uppercase border border-slate-200 dark:border-slate-700">CORE_MODULE_0{sections.indexOf(activeSectionData!) + 1}</span>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                 {/* Narrative Column */}
                 <div className="lg:col-span-2 text-left">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">Operational Theory</h4>
                    {activeSectionData?.details}
                 </div>

                 {/* Specification Sidebar */}
                 <div className="lg:col-span-1 space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">System Specification</h4>
                    <div className="space-y-4">
                      {activeSectionData?.specs.map((spec, i) => (
                        <div key={i} className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-slate-100 dark:border-slate-800 group hover:border-indigo-500 transition-all">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">{spec.key}</span>
                          <span className="text-[11px] font-mono font-bold text-slate-900 dark:text-white">{spec.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-12 p-8 bg-indigo-600 text-white rounded-[2.5rem] shadow-xl shadow-indigo-600/20">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4">Manual Note</p>
                      <p className="text-xs font-medium leading-relaxed opacity-90 italic">
                        "Refer to the Governance Protocol v2.5 for override procedures related to this module."
                      </p>
                    </div>
                 </div>
               </div>
             </div>
          </div>

          {/* Quick Start Footer */}
          <div className="p-10 bg-slate-900 text-white rounded-[3rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black">AI</div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Integrity: <span className="text-emerald-400">100% OPERATIONAL</span></p>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">© 2024 ELITE RECRUITMENT SYSTEM • PROPRIETARY DOCUMENTATION</p>
          </div>
        </main>
      </div>
    </div>
  );
};
