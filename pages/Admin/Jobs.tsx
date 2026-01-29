
import React, { useState, useEffect } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { useTranslation } from '../../hooks/useTranslation';
import { JobPost, JobStatus, JobType, ExperienceLevel, EducationLevel, CustomResource } from '../../types';
import { extractSkillsFromDescription } from '../../services/geminiService';
import { validateRequired } from '../../utils/validation';

export const AdminJobs: React.FC = () => {
  const { jobs, addJob, updateJob, deleteJob, activeBranchId, addToast } = useStorage();
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPost | null>(null);
  const [isExtractingSkills, setIsExtractingSkills] = useState(false);
  const [progress, setProgress] = useState(0);
  const [newManualSkill, setNewManualSkill] = useState('');
  const [newResource, setNewResource] = useState<CustomResource>({ skill: '', title: '', url: '' });

  const initialForm: JobPost = {
    id: Math.random().toString(36).substr(2, 9),
    branchId: activeBranchId,
    title: '',
    department: '',
    location: '',
    description: '',
    type: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID,
    requiredSkills: [],
    minYearsExperience: 2,
    requiredEducationLevel: EducationLevel.BACHELORS,
    keywords: [],
    customResources: [],
    status: JobStatus.OPEN,
    archived: false,
    createdAt: Date.now(),
    matchingRules: {
      skillWeight: 40,
      experienceWeight: 30,
      educationWeight: 10,
      keywordsWeight: 20,
      threshold: 50
    },
    examSettings: {
      enabled: true,
      duration: 30,
      questionCount: 5,
      difficulty: 'Intermediate'
    }
  };

  const [formData, setFormData] = useState<JobPost>(initialForm);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    let interval: any;
    if (isExtractingSkills) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => (prev >= 95 ? 95 : prev + 10));
      }, 300);
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [isExtractingSkills]);

  const validateField = (name: string, value: any) => {
    let error = '';
    if (['title', 'department', 'location', 'description'].includes(name)) {
      if (!validateRequired(value)) error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) validateField(name, value);
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, (formData as any)[name]);
  };

  const handleExtractSkills = async () => {
    if (!formData.description.trim()) return;
    setIsExtractingSkills(true);
    try {
      const skills = await extractSkillsFromDescription(formData.description);
      const existing = new Set(formData.requiredSkills);
      skills.forEach(s => existing.add(s));
      setFormData(prev => ({ ...prev, requiredSkills: Array.from(existing) }));
    } catch (err) {
      addToast("Error extracting skills", 'error');
    } finally {
      setIsExtractingSkills(false);
    }
  };

  const addManualSkill = () => {
    const skill = newManualSkill.trim();
    if (skill && !formData.requiredSkills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, skill]
      }));
      setNewManualSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(s => s !== skillToRemove)
    }));
  };

  const addResource = () => {
    if (newResource.skill && newResource.title && newResource.url) {
      setFormData(prev => ({
        ...prev,
        customResources: [...prev.customResources, { ...newResource }]
      }));
      setNewResource({ skill: '', title: '', url: '' });
    }
  };

  const removeResource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customResources: prev.customResources.filter((_, i) => i !== index)
    }));
  };

  const isFormValid = () => {
    const fields = ['title', 'department', 'location', 'description'];
    const newErrors: { [key: string]: string } = {};
    fields.forEach(f => {
      if (!validateRequired((formData as any)[f])) newErrors[f] = 'Required';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      setTouched({ title: true, department: true, location: true, description: true });
      return;
    }
    if (editingJob) {
      updateJob(editingJob.id, formData);
      addToast("Job Updated Successfully", 'success');
    } else {
      addJob({ ...formData, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now() });
      addToast("Job Published Successfully", 'success');
    }
    setShowForm(false);
    setEditingJob(null);
    setFormData(initialForm);
    setTouched({});
    setErrors({});
  };

  const toggleJobStatus = (job: JobPost) => {
    const newStatus = job.status === JobStatus.OPEN ? JobStatus.CLOSED : JobStatus.OPEN;
    updateJob(job.id, { status: newStatus });
    addToast(`Job ${newStatus === JobStatus.OPEN ? 'Opened' : 'Closed'}`, 'info');
  };

  const handleDeleteJob = (id: string) => {
    if (confirm("Permanently delete this job requisition?")) {
      deleteJob(id);
      addToast("Job Deleted Successfully", 'success');
    }
  };

  const handleEdit = (job: JobPost) => {
    setEditingJob(job);
    setFormData(job);
    setShowForm(true);
  };

  const copyShareableLink = (id: string) => {
    const url = `${window.location.origin}/#/job/${id}`;
    navigator.clipboard.writeText(url);
    addToast("Job Link Copied to Clipboard", 'success');
  };

  const inputStyles = (name: string) => `
    w-full px-5 py-3 rounded-xl border outline-none focus:ring-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-all shadow-sm font-bold text-sm
    ${touched[name] && errors[name] 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' 
      : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/10'}
  `;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 transition-colors duration-300 text-left">
      {isExtractingSkills && (
        <div className="fixed inset-0 bg-[#020617]/90 dark:bg-black/95 z-[110] flex flex-col items-center justify-center animate-in fade-in transition-colors">
          <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Extracting {progress}%</h2>
        </div>
      )}

      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('jobs.title')}</h1>
        </div>
        {!showForm && (
          <button 
            onClick={() => { setShowForm(true); setEditingJob(null); setFormData(initialForm); }}
            className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 flex items-center"
          >
            <svg className="w-5 h-5 mx-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
            {t('jobs.createJob')}
          </button>
        )}
      </header>

      {showForm ? (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 mb-24 transition-colors">
          <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {editingJob ? t('jobs.editJob') : t('jobs.createJob')}
            </h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <div className="p-10 grid lg:grid-cols-2 gap-16 text-left">
            {/* Left Column */}
            <div className="space-y-12">
              <section>
                <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-6 border-b pb-4 border-slate-100 dark:border-slate-800">{t('jobs.jobDetails')}</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mx-1 mb-2">{t('jobs.jobTitle')}</label>
                    <input required className={inputStyles('title')} placeholder="Enter position title" value={formData.title} onChange={e => handleInputChange('title', e.target.value)} onBlur={() => handleBlur('title')} />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mx-1 mb-2">{t('talentPool.department')}</label>
                      <input required className={inputStyles('department')} placeholder="e.g. Technology" value={formData.department} onChange={e => handleInputChange('department', e.target.value)} onBlur={() => handleBlur('department')} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mx-1 mb-2">{t('jobs.location')}</label>
                      <input required className={inputStyles('location')} placeholder="e.g. Berlin (Hybrid)" value={formData.location} onChange={e => handleInputChange('location', e.target.value)} onBlur={() => handleBlur('location')} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mx-1 mb-2">{t('jobs.jobType')}</label>
                      <select className={inputStyles('type')} value={formData.type} onChange={e => handleInputChange('type', e.target.value as JobType)}>
                        {Object.values(JobType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mx-1 mb-2">{t('jobs.experienceLevel')}</label>
                      <select className={inputStyles('experienceLevel')} value={formData.experienceLevel} onChange={e => handleInputChange('experienceLevel', e.target.value as ExperienceLevel)}>
                        {Object.values(ExperienceLevel).map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mx-1 mb-2">{t('jobs.description')}</label>
                    <div className="relative">
                      <textarea required rows={6} className={`${inputStyles('description')} resize-none`} placeholder="Detailed responsibilities..." value={formData.description} onChange={e => handleInputChange('description', e.target.value)} onBlur={() => handleBlur('description')} />
                      <button 
                        type="button" 
                        onClick={handleExtractSkills}
                        disabled={isExtractingSkills}
                        className="absolute bottom-4 right-4 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-600 hover:text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center border border-indigo-600/20 shadow-md"
                      >
                        <svg className={`w-3 h-3 mx-2 ${isExtractingSkills ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        {isExtractingSkills ? t('jobs.extracting') : t('jobs.extractSkills')}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mx-1 mb-2">{t('jobs.requiredSkills')}</label>
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-wrap gap-2 min-h-[60px]">
                        {formData.requiredSkills.map((s, i) => (
                          <span key={i} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[9px] font-black rounded-lg uppercase tracking-wider border border-indigo-100 dark:border-indigo-800/50 flex items-center gap-2">
                            {s}
                            <button type="button" onClick={() => removeSkill(s)} className="text-indigo-300 dark:text-indigo-500 hover:text-red-500">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          className={`${inputStyles('manualSkill')} !py-2 !px-4`} 
                          placeholder={t('jobs.addManual')} 
                          value={newManualSkill}
                          onChange={e => setNewManualSkill(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addManualSkill())}
                        />
                        <button type="button" onClick={addManualSkill} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">{t('jobs.add')}</button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-6 border-b pb-4 border-slate-100 dark:border-slate-800">{t('jobs.learningPath')}</h3>
                <div className="bg-slate-50/50 dark:bg-slate-800/30 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-6">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed italic mb-4">
                    {t('jobs.resSub')}
                  </p>
                  <div className="grid gap-4">
                    <input className={inputStyles('res-skill')} placeholder={t('jobs.resSkill')} value={newResource.skill} onChange={e => setNewResource({...newResource, skill: e.target.value})} />
                    <input className={inputStyles('res-title')} placeholder={t('jobs.resTitle')} value={newResource.title} onChange={e => setNewResource({...newResource, title: e.target.value})} />
                    <input className={inputStyles('res-url')} placeholder={t('jobs.resUrl')} value={newResource.url} onChange={e => setNewResource({...newResource, url: e.target.value})} />
                    <button type="button" onClick={addResource} className="bg-indigo-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg transition-all">{t('jobs.resAdd')}</button>
                  </div>
                  
                  {formData.customResources.length > 0 && (
                    <div className="mt-6 space-y-3">
                      {formData.customResources.map((res, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                          <div className="text-[10px]">
                            <span className="font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mx-3">{res.skill}</span>
                            <span className="text-slate-500 dark:text-slate-300 font-bold">{res.title}</span>
                          </div>
                          <button type="button" onClick={() => removeResource(i)} className="text-red-500 hover:text-red-700">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="space-y-12">
              <section>
                <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-6 border-b pb-4 border-slate-100 dark:border-slate-800">{t('jobs.matchRules')}</h3>
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('jobs.minExp')}</label>
                      <span className="font-black text-indigo-600 dark:text-indigo-400 text-xs bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg">{formData.minYearsExperience} Years</span>
                    </div>
                    <input type="range" min="0" max="20" className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer transition-colors" value={formData.minYearsExperience} onChange={e => handleInputChange('minYearsExperience', parseInt(e.target.value))} />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{t('jobs.eduLevel')}</label>
                    <select className={inputStyles('education')} value={formData.requiredEducationLevel} onChange={e => handleInputChange('requiredEducationLevel', e.target.value as EducationLevel)}>
                      {Object.values(EducationLevel).map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{t('jobs.mandatoryKeywords')}</label>
                    <input 
                      className={inputStyles('keywords')} 
                      placeholder="e.g. Docker, Kubernetes, Fintech" 
                      value={formData.keywords.join(', ')} 
                      onChange={e => handleInputChange('keywords', e.target.value.split(',').map(s => s.trim()))} 
                    />
                  </div>

                  <div className="pt-4 space-y-6">
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">{t('jobs.matchingWeights')}</label>
                    <div className="grid gap-6">
                      {[
                        { label: 'Skill Importance', key: 'skillWeight' },
                        { label: 'Experience Importance', key: 'experienceWeight' },
                        { label: 'Education Importance', key: 'educationWeight' },
                        { label: 'Keywords Importance', key: 'keywordsWeight' }
                      ].map(weight => (
                        <div key={weight.key}>
                          <div className="flex justify-between text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                            <span>{weight.label}</span>
                            <span>{(formData.matchingRules as any)[weight.key]}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" max="100" 
                            className="w-full accent-indigo-50 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer" 
                            value={(formData.matchingRules as any)[weight.key]} 
                            onChange={e => setFormData({
                              ...formData, 
                              matchingRules: { ...formData.matchingRules, [weight.key]: parseInt(e.target.value) }
                            })} 
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-8 rounded-[2rem] border border-red-500/20 bg-red-500/5 dark:bg-red-950/20 mt-10 transition-colors">
                    <div className="flex justify-between items-center mb-4 text-left">
                      <label className="text-sm font-black text-red-600 dark:text-red-400 uppercase tracking-widest">{t('jobs.threshold')}</label>
                      <span className="text-red-600 dark:text-red-400 font-black text-xl">{formData.matchingRules.threshold}%</span>
                    </div>
                    <input type="range" min="0" max="100" className="w-full accent-red-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer" value={formData.matchingRules.threshold} onChange={e => setFormData({...formData, matchingRules: {...formData.matchingRules, threshold: parseInt(e.target.value)}})} />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-6 border-b pb-4 border-slate-100 dark:border-slate-800">{t('jobs.examSettings')}</h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-8 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{t('jobs.enableAssessment')}</span>
                    <button 
                      type="button"
                      onClick={() => handleInputChange('examSettings', {...formData.examSettings, enabled: !formData.examSettings.enabled})}
                      className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${formData.examSettings.enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${formData.examSettings.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {formData.examSettings.enabled && (
                    <div className="grid grid-cols-2 gap-6 animate-in fade-in duration-300">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{t('jobs.duration')}</label>
                        <input type="number" className={inputStyles('duration')} value={formData.examSettings.duration} onChange={e => handleInputChange('examSettings', {...formData.examSettings, duration: parseInt(e.target.value)})} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{t('jobs.difficulty')}</label>
                        <select className={inputStyles('difficulty')} value={formData.examSettings.difficulty} onChange={e => handleInputChange('examSettings', {...formData.examSettings, difficulty: e.target.value as any})}>
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          <div className="p-10 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end items-center gap-8 transition-colors">
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 dark:text-slate-500 font-black uppercase text-xs tracking-widest hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('jobs.cancel')}</button>
            <button type="submit" className="bg-indigo-600 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-indigo-700 hover:scale-105 transition-all shadow-2xl">
              {editingJob ? t('jobs.update') : t('jobs.publish')}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {jobs.map(job => (
            <div key={job.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden text-left">
              <div className="flex justify-between items-start mb-6">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${job.status === JobStatus.OPEN ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                  {job.status}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => copyShareableLink(job.id)}
                    className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 rounded-xl transition-all"
                    title={t('jobs.copyLink')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                  </button>
                  <button 
                    onClick={() => toggleJobStatus(job)}
                    className={`p-3 rounded-xl transition-all ${job.status === JobStatus.OPEN ? 'bg-red-50 dark:bg-red-900/30 text-red-600 hover:bg-red-100 dark:hover:bg-red-800/50' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-800/50'}`}
                    title={job.status === JobStatus.OPEN ? 'Close Requisition' : 'Open Requisition'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={job.status === JobStatus.OPEN ? "M6 18L18 6M6 6l12 12" : "M5 13l4 4L19 7"}></path></svg>
                  </button>
                  <button onClick={() => handleEdit(job)} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  </button>
                  <button onClick={() => handleDeleteJob(job.id)} className="p-3 bg-red-50 dark:bg-red-950/20 text-red-400 hover:text-red-600 rounded-xl transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {job.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">{job.department} &bull; {job.location}</p>
              <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                <span>{job.type}</span>
                <span>{job.minYearsExperience}+ YRS EXP</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
