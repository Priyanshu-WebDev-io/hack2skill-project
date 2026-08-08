"use client";

import { useEffect, useState } from 'react';
import { Calendar, Plus, Clock, Video, CheckCircle2, X, AlertCircle, Link2, FileText, CalendarClock, RefreshCw } from 'lucide-react';
import seminarService from '@/services/seminarService';

const INITIAL_FORM = { title: '', date: '', time: '', zoomLink: '' };
const INITIAL_ERRORS = { title: '', date: '', time: '', zoomLink: '' };

// Minimum date string for the date input (today)
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function validate(formData) {
  const errors = { ...INITIAL_ERRORS };
  let valid = true;

  if (!formData.title.trim()) {
    errors.title = 'Title is required.';
    valid = false;
  } else if (formData.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters.';
    valid = false;
  }

  if (!formData.date) {
    errors.date = 'Date is required.';
    valid = false;
  }

  if (!formData.time) {
    errors.time = 'Time is required.';
    valid = false;
  }

  if (formData.date && formData.time) {
    const combined = new Date(`${formData.date}T${formData.time}`);
    if (combined <= new Date()) {
      errors.date = 'Seminar must be scheduled in the future.';
      valid = false;
    }
  }

  if (formData.zoomLink && !/^https?:\/\/.+/.test(formData.zoomLink.trim())) {
    errors.zoomLink = 'Must be a valid URL starting with http:// or https://';
    valid = false;
  }

  return { errors, valid };
}

export default function SeminarsPage() {
  const [seminars, setSeminars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [markingId, setMarkingId] = useState(null);
  const [generatingZoom, setGeneratingZoom] = useState(false);
  const [zoomGenError, setZoomGenError] = useState('');

  const [formData, setFormData] = useState({ ...INITIAL_FORM });
  const [fieldErrors, setFieldErrors] = useState({ ...INITIAL_ERRORS });
  const [touched, setTouched] = useState({});

  useEffect(() => {
    fetchSeminars();
  }, []);

  const fetchSeminars = async () => {
    setLoading(true);
    try {
      const data = await seminarService.getSeminars();
      setSeminars(data.data || []);
    } catch (error) {
      console.error("Failed to fetch seminars", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    if (touched[name]) {
      const { errors } = validate(updated);
      setFieldErrors(prev => ({ ...prev, [name]: errors[name] }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const { errors } = validate(formData);
    setFieldErrors(prev => ({ ...prev, [name]: errors[name] }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setTouched({ title: true, date: true, time: true, zoomLink: true });
    const { errors, valid } = validate(formData);
    setFieldErrors(errors);
    if (!valid) return;

    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      // Combine date + time into ISO string
      const combinedDate = new Date(`${formData.date}T${formData.time}`).toISOString();
      const res = await seminarService.createSeminar({
        title: formData.title.trim(),
        date: combinedDate,
        zoomLink: formData.zoomLink.trim(),
      });
      setSubmitSuccess(`Seminar "${res.data?.title || formData.title}" created successfully!`);
      setShowForm(false);
      setFormData({ ...INITIAL_FORM });
      setTouched({});
      setFieldErrors({ ...INITIAL_ERRORS });
      fetchSeminars();
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Failed to create seminar. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({ ...INITIAL_FORM });
    setFieldErrors({ ...INITIAL_ERRORS });
    setTouched({});
    setSubmitError('');
    setZoomGenError('');
  };

  const handleGenerateZoom = async () => {
    // Require date + time + title before generating
    if (!formData.date || !formData.time) {
      setZoomGenError('Please set the date and time first.');
      return;
    }
    setGeneratingZoom(true);
    setZoomGenError('');
    try {
      const combinedDate = new Date(`${formData.date}T${formData.time}`).toISOString();
      const res = await seminarService.generateZoomLink({
        topic: formData.title.trim() || 'Seminar',
        date: combinedDate,
      });
      setFormData(prev => ({ ...prev, zoomLink: res.zoomLink }));
    } catch (err) {
      setZoomGenError(err.response?.data?.message || 'Failed to generate Zoom link.');
    } finally {
      setGeneratingZoom(false);
    }
  };

  const markCompleted = async (id) => {
    setMarkingId(id);
    try {
      await seminarService.markCompleted(id);
      fetchSeminars();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as completed.');
    } finally {
      setMarkingId(null);
    }
  };

  const inputClass = (name) =>
    `w-full px-4 py-3 rounded-xl border text-white text-sm placeholder-neutral-600 bg-neutral-950 focus:outline-none focus:ring-2 transition-all ${
      fieldErrors[name]
        ? 'border-red-500/60 focus:ring-red-500/30 focus:border-red-500'
        : touched[name] && !fieldErrors[name]
        ? 'border-emerald-500/40 focus:ring-emerald-500/20 focus:border-emerald-500/60'
        : 'border-white/10 focus:ring-indigo-500/30 focus:border-indigo-500/60'
    }`;

  return (
    <div className="p-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Seminars</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage upcoming seminars and cohorts.</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setSubmitError(''); setSubmitSuccess(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm rounded-xl transition-colors ${
            showForm
              ? 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10'
              : 'bg-white text-black hover:bg-neutral-200'
          }`}
        >
          {showForm ? <><X size={15}/> Cancel</> : <><Plus size={15}/> Create Seminar</>}
        </button>
      </div>

      {/* Success banner */}
      {submitSuccess && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
          <CheckCircle2 size={16} className="shrink-0" />
          {submitSuccess}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="bg-neutral-900/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">New Seminar</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Fields marked <span className="text-red-400">*</span> are required</p>
            </div>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <CalendarClock size={20} />
            </div>
          </div>

          <form onSubmit={handleCreate} noValidate className="px-8 py-6 space-y-5">
            {submitError && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                <FileText size={12} className="text-indigo-400" /> Seminar Title <span className="text-red-400">*</span>
              </label>
              <input
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                onBlur={() => handleBlur('title')}
                placeholder="e.g. Advanced React Patterns"
                className={inputClass('title')}
              />
              {fieldErrors.title ? (
                <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle size={11} /> {fieldErrors.title}</p>
              ) : (
                <p className="text-xs text-neutral-600">Minimum 3 characters</p>
              )}
            </div>

            {/* Date + Time side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  <Calendar size={12} className="text-indigo-400" /> Date <span className="text-red-400">*</span>
                </label>
                <input
                  name="date"
                  type="date"
                  min={todayStr()}
                  value={formData.date}
                  onChange={handleChange}
                  onBlur={() => handleBlur('date')}
                  className={inputClass('date')}
                  style={{ colorScheme: 'dark' }}
                />
                {fieldErrors.date && (
                  <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle size={11} /> {fieldErrors.date}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  <Clock size={12} className="text-indigo-400" /> Time (IST) <span className="text-red-400">*</span>
                </label>
                <input
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  onBlur={() => handleBlur('time')}
                  className={inputClass('time')}
                  style={{ colorScheme: 'dark' }}
                />
                {fieldErrors.time && (
                  <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle size={11} /> {fieldErrors.time}</p>
                )}
              </div>
            </div>

            {/* Zoom Link + Generate Button */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                <Link2 size={12} className="text-indigo-400" /> Zoom Meeting Link
              </label>
              <div className="flex gap-2">
                <input
                  name="zoomLink"
                  type="url"
                  value={formData.zoomLink}
                  onChange={handleChange}
                  onBlur={() => handleBlur('zoomLink')}
                  placeholder="https://zoom.us/j/123456789"
                  className={inputClass('zoomLink') + ' flex-1'}
                />
                <button
                  type="button"
                  onClick={handleGenerateZoom}
                  disabled={generatingZoom || !formData.date || !formData.time}
                  title={!formData.date || !formData.time ? 'Set date and time first' : 'Auto-generate a Zoom meeting'}
                  className="shrink-0 flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white font-bold text-xs rounded-xl transition-colors disabled:cursor-not-allowed"
                >
                  {generatingZoom ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><RefreshCw size={14} /> Generate</>
                  )}
                </button>
              </div>
              {zoomGenError && (
                <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle size={11} /> {zoomGenError}</p>
              )}
              {fieldErrors.zoomLink && (
                <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle size={11} /> {fieldErrors.zoomLink}</p>
              )}
              {!fieldErrors.zoomLink && !zoomGenError && (
                <p className="text-xs text-neutral-600">Optional — set date/time first, then click Generate to auto-create via Zoom API</p>
              )}
            </div>

            {/* Info box */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-300/70 text-xs leading-relaxed">
              <AlertCircle size={14} className="shrink-0 mt-0.5 text-indigo-400" />
              The week number and registration window are automatically calculated from the date. If no Zoom link is given, the system will retry on the next automation cycle.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
              <button type="button" onClick={handleCancel} className="px-5 py-2.5 text-sm font-semibold text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-indigo-900/30 disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Plus size={16} /> Create Seminar</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Seminars Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center p-12">
            <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : seminars.map(seminar => (
          <div key={seminar._id} className="p-6 rounded-2xl bg-neutral-900 border border-white/5 hover:border-white/10 flex flex-col transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
                  Week {seminar.weekNumber}
                </div>
                        <h3 className="text-lg font-bold text-white">{seminar.title}</h3>
                        <p className="text-xs text-neutral-500 mt-1">{seminar.weekLabel || `Week ${seminar.weekNumber}`}</p>
              </div>
              <div className="shrink-0">
                {seminar.isCompleted ? (
                  <div className="text-emerald-400 bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 size={16} />
                  </div>
                ) : seminar.registrationOpen ? (
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">● Open</span>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 bg-neutral-800 px-2 py-1 rounded-full border border-neutral-700">Closed</span>
                )}
              </div>
            </div>

            <div className="space-y-2.5 flex-1 text-sm text-neutral-400">
              <div className="flex items-center gap-2.5">
                <Calendar size={14} className="text-indigo-400 shrink-0" />
                <span>{new Date(seminar.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock size={14} className="text-indigo-400 shrink-0" />
                <span>{new Date(seminar.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST</span>
              </div>
              {!seminar.isCompleted && (
                seminar.zoomLink ? (
                  <div className="flex items-center gap-2.5 text-blue-400">
                    <Video size={14} className="shrink-0" />
                    <a href={seminar.zoomLink} target="_blank" rel="noopener noreferrer" className="truncate hover:underline text-xs">{seminar.zoomLink}</a>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 text-neutral-600">
                    <Video size={14} className="shrink-0" />
                    <span className="text-xs italic">No zoom link yet</span>
                  </div>
                )
              )}
            </div>

            {!seminar.isCompleted && (
              <div className="mt-5 pt-4 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => markCompleted(seminar._id)}
                  disabled={markingId === seminar._id}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20 text-white text-xs font-semibold rounded-xl transition-all border border-white/10 disabled:opacity-60"
                >
                  {markingId === seminar._id ? (
                    <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  ) : (
                    <><CheckCircle2 size={13} /> Mark Completed</>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
        {!loading && seminars.length === 0 && (
          <div className="col-span-full p-12 text-center bg-neutral-900 rounded-2xl border border-white/5">
            <CalendarClock size={32} className="mx-auto mb-3 text-neutral-700" />
            <p className="text-neutral-500">No seminars yet. Create one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
