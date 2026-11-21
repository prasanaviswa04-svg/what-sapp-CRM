import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import {
  Building2,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  MapPin,
  DollarSign,
  MessageSquare,
  Shield,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Sparkles,
  PhoneCall
} from 'lucide-react';

const WORKFLOW_STEPS = [
  { id: 'New Submission', label: '1. Received', desc: 'Captured in Marketplace registry' },
  { id: 'Under Review', label: '2. Under Review', desc: 'Duplicate check & info inspection' },
  { id: 'Verified', label: '3. Verified', desc: 'Documents & pricing validated' },
  { id: 'Approved', label: '4. Approved / Published', desc: 'Synced to CRM & live inventory' }
];

export const SubmissionTracker = () => {
  const { submissionId: routeSubmissionId } = useParams();
  const navigate = useNavigate();

  const [inputVal, setInputVal] = useState(routeSubmissionId || '');
  const [activeId, setActiveId] = useState(routeSubmissionId || '');
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTracking = async (idToSearch) => {
    if (!idToSearch || !idToSearch.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/marketplace/track/${idToSearch.trim()}`);
      setSubmission(res.data.submission);
    } catch (err) {
      console.error('Tracking fetch error:', err);
      setError(err.response?.data?.message || `No submission found with reference ID "${idToSearch}"`);
      setSubmission(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeSubmissionId) {
      setInputVal(routeSubmissionId);
      setActiveId(routeSubmissionId);
      fetchTracking(routeSubmissionId);
    }
  }, [routeSubmissionId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setActiveId(inputVal.trim());
      navigate(`/marketplace/track/${inputVal.trim()}`);
      fetchTracking(inputVal.trim());
    }
  };

  const getStepStatus = (stepId) => {
    if (!submission) return 'upcoming';
    const status = submission.status;

    if (status === 'Rejected') return 'error';

    const order = ['New Submission', 'Under Review', 'Verified', 'Approved', 'Published'];
    const currentIndex = order.indexOf(status);
    const stepIndex = order.indexOf(stepId);

    if (currentIndex >= stepIndex) return 'completed';
    if (currentIndex + 1 === stepIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/marketplace" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-950 flex items-center justify-center text-white">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-zinc-950">
              EstateFlow Marketplace
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/marketplace/submit-property">
              <Button size="sm" variant="ghost" className="text-xs">
                Submit Listing
              </Button>
            </Link>
            <Link to="/marketplace/login">
              <Button size="sm" variant="outline" className="text-xs">
                Partner Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title */}
        <div className="text-center max-w-lg mx-auto">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">
            Real-Time Audit Trail
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight mt-1">
            Track Submission Status
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Enter your unique reference number (e.g. SUB-2026-0001) to view verification notes, CRM publishing status, and WhatsApp log updates.
          </p>
        </div>

        {/* Search Bar */}
        <Card className="p-4 bg-white border-zinc-200">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder="Enter Submission ID (e.g. SUB-2026-0001, SUB-2026-0002)..."
                className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-mono font-semibold focus:ring-1 focus:ring-zinc-950 focus:bg-white outline-none"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs px-5"
            >
              {loading ? 'Searching...' : 'Track'}
            </Button>
          </form>

          {/* Quick Demo Pre-fills */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-zinc-100 text-xs">
            <span className="text-zinc-400 text-[11px] font-medium mr-1">Demo References:</span>
            {['SUB-2026-0001', 'SUB-2026-0002', 'SUB-2026-0003', 'SUB-2026-0004', 'SUB-2026-0005'].map(id => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setInputVal(id);
                  navigate(`/marketplace/track/${id}`);
                  fetchTracking(id);
                }}
                className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200 transition-colors"
              >
                {id}
              </button>
            ))}
          </div>
        </Card>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <p className="font-bold">Record Not Found</p>
              <p className="text-[11px] mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Found Submission Card */}
        {submission && (
          <div className="space-y-6">
            {/* Main Overview Card */}
            <Card className="p-6 bg-white border-zinc-200 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-zinc-950">
                      {submission.submissionId}
                    </span>
                    <span className="text-xs text-zinc-400">•</span>
                    <span className="text-xs text-zinc-500 font-medium">
                      {submission.submissionType}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-zinc-950 mt-1">
                    {submission.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      submission.status === 'Approved' || submission.status === 'Published'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : submission.status === 'Information Required'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : submission.status === 'Rejected'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {submission.status}
                  </span>
                </div>
              </div>

              {/* Progress Stepper */}
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
                  Lifecycle Milestones
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {WORKFLOW_STEPS.map((step, idx) => {
                    const status = getStepStatus(step.id);
                    return (
                      <div
                        key={step.id}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          status === 'completed'
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : status === 'current'
                            ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                            : status === 'error'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-zinc-50 border-zinc-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-xs font-bold ${
                              status === 'current' ? 'text-white' : 'text-zinc-950'
                            }`}
                          >
                            {step.label}
                          </span>
                          {status === 'completed' && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          {status === 'current' && (
                            <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                          )}
                        </div>
                        <p
                          className={`text-[10px] ${
                            status === 'current' ? 'text-zinc-300' : 'text-zinc-500'
                          }`}
                        >
                          {step.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Required Banner if status === Information Required */}
              {submission.status === 'Information Required' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 space-y-1">
                    <p className="font-bold">Information Clarification Requested by Verification Desk</p>
                    <p className="text-amber-800">
                      {submission.verification?.notes || 'Please provide updated RERA registration documents or floor plan.'}
                    </p>
                    <p className="text-[11px] text-amber-700">
                      Sign in to your Partner/Owner portal to update submission details, or reply directly to our WhatsApp desk.
                    </p>
                  </div>
                </div>
              )}

              {/* Duplicate Flag Notice if any */}
              {submission.duplicateDetection?.isDuplicate && (
                <div className="p-3 bg-zinc-100 border border-zinc-200 rounded-xl text-xs text-zinc-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-zinc-900">Duplicate Check Review: </span>
                    <span>{submission.duplicateDetection.flaggedReason} (Pending manual resolution by staff).</span>
                  </div>
                </div>
              )}

              {/* Submission Specifics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <span className="text-zinc-400 text-[10px] font-bold uppercase block">Source Category</span>
                  <span className="font-bold text-zinc-900 mt-0.5 block">{submission.source}</span>
                  <span className="text-[11px] text-zinc-500 truncate block">{submission.submitterName}</span>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <span className="text-zinc-400 text-[10px] font-bold uppercase block">Valuation / Budget</span>
                  <span className="font-bold text-zinc-900 mt-0.5 block">
                    {submission.submissionCategory === 'Property'
                      ? `₹${((submission.propertyDetails?.price || 0) / 10000000).toFixed(2)} Cr`
                      : `₹${((submission.requirementDetails?.budgetMin || 0) / 10000000).toFixed(2)} - ₹${((submission.requirementDetails?.budgetMax || 0) / 10000000).toFixed(2)} Cr`}
                  </span>
                  <span className="text-[11px] text-zinc-500 block">
                    {submission.propertyDetails?.purpose || submission.requirementDetails?.customerType || 'Sale'}
                  </span>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <span className="text-zinc-400 text-[10px] font-bold uppercase block">Location / City</span>
                  <span className="font-bold text-zinc-900 mt-0.5 block truncate">
                    {submission.submissionCategory === 'Property'
                      ? `${submission.propertyDetails?.address?.locality || ''}, ${submission.propertyDetails?.address?.city || 'Gurugram'}`
                      : submission.requirementDetails?.preferredLocations?.join(', ') || 'Gurugram'}
                  </span>
                  <span className="text-[11px] text-zinc-500 block">Delhi-NCR</span>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <span className="text-zinc-400 text-[10px] font-bold uppercase block">CRM Sync State</span>
                  <span className="font-bold text-zinc-900 mt-0.5 block">
                    {submission.crmMapping?.syncStatus || 'Pending Approval'}
                  </span>
                  <span className="text-[11px] text-zinc-500 block">
                    {new Date(submission.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>

            {/* Audit Trail & Status History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status History */}
              <Card className="p-5 bg-white border-zinc-200 space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-400">
                  Review & Action History
                </h3>
                {submission.statusHistory && submission.statusHistory.length > 0 ? (
                  <div className="space-y-3">
                    {submission.statusHistory.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs pb-2 border-b border-zinc-100 last:border-none">
                        <div className="w-2 h-2 rounded-full bg-zinc-950 mt-1.5 shrink-0" />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-zinc-900">{item.status}</span>
                            <span className="text-[10px] text-zinc-400">
                              {new Date(item.timestamp).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {item.notes && (
                            <p className="text-[11px] text-zinc-600 mt-0.5 italic">
                              "{item.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400">No review changes recorded yet.</p>
                )}
              </Card>

              {/* Communication Dispatch Log */}
              <Card className="p-5 bg-white border-zinc-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-400">
                    Automated WhatsApp Dispatch Log
                  </h3>
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                {submission.communicationHistory && submission.communicationHistory.length > 0 ? (
                  <div className="space-y-3">
                    {submission.communicationHistory.map((comm, idx) => (
                      <div key={idx} className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            WhatsApp • {comm.template || 'Notification'}
                          </span>
                          <span className="text-zinc-400 font-mono">
                            {new Date(comm.timestamp).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-zinc-800 text-[11px] leading-relaxed pt-1">
                          {comm.message}
                        </p>
                        <div className="flex justify-between items-center text-[10px] text-zinc-400 pt-1">
                          <span>To: {comm.recipientPhone}</span>
                          <span className="capitalize text-emerald-600 font-semibold">{comm.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-zinc-50 rounded-xl text-center text-xs text-zinc-400">
                    No outbound messages recorded for this reference yet.
                  </div>
                )}
              </Card>
            </div>

            {/* Assistance Card */}
            <div className="p-4 bg-zinc-100 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-zinc-700 shrink-0" />
                <span className="text-zinc-600">
                  Have questions regarding your verification? Connect directly with our Real Estate Marketplace desk.
                </span>
              </div>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="shrink-0 font-bold text-zinc-950 underline hover:text-zinc-800"
              >
                Chat on WhatsApp Support →
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
