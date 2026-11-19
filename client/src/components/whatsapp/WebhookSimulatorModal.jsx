import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { MessageSquare, Send, Sparkles, User, Phone, CheckCircle2, ArrowRight } from 'lucide-react';

export const WebhookSimulatorModal = ({ isOpen, onClose, onSimulated }) => {
  const { addToast } = useToast();
  const [senderName, setSenderName] = useState('Rohan Malhotra');
  const [phone, setPhone] = useState('+919876543210');
  const [messageText, setMessageText] = useState('Hi, I am looking for a 3 BHK luxury apartment on Golf Course Road under 2.5 Cr. Can you share options?');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  const sampleMessages = [
    {
      label: '3 BHK Apartment Discovery',
      text: 'Hi! Looking for a 3 BHK apartment in Golf Course Road under 2.5 Cr. Looking to buy in next 1 month.',
      name: 'Rohan Malhotra',
      phone: '+919876543210'
    },
    {
      label: 'Eco Luxury Villa Seeker',
      text: 'Hello, do you have any 5 BHK villas in Sohna Road with private swimming pool? Budget is around 12 Cr.',
      name: 'Priya Singhania',
      phone: '+919811223344'
    },
    {
      label: 'Human Broker Takeover Escalation',
      text: 'I want to speak to a human agent right now regarding price negotiation and agreement clauses.',
      name: 'Sameer Verma',
      phone: '+919822334455'
    },
    {
      label: 'Policy & Visit Enquiry',
      text: 'What are your site visit timings on Sunday? Can I bring my family for a walkthrough?',
      name: 'Kavita Joshi',
      phone: '+919933445566'
    }
  ];

  const handleSelectSample = (sample) => {
    setMessageText(sample.text);
    setSenderName(sample.name);
    setPhone(sample.phone);
    setSimulationResult(null);
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setIsSubmitting(true);
    setSimulationResult(null);
    try {
      const res = await api.post('/whatsapp/simulate-incoming', {
        phone,
        senderName,
        messageText
      });

      if (res.data.success) {
        setSimulationResult(res.data.result);
        addToast('Incoming WhatsApp webhook simulated successfully!', 'success');
        if (onSimulated) onSimulated(res.data.result);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Simulation failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Meta WhatsApp Webhook Simulator" size="xl">
      <div className="space-y-5">
        <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl text-xs text-teal-900 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Official Meta Cloud API Test Environment</p>
            <p className="mt-0.5 text-teal-800">
              Test how EstateFlow AI handles incoming customer inquiries, extracts buyer requirements, searches MongoDB for grounded property inventory, and generates instant WhatsApp responses in real time.
            </p>
          </div>
        </div>

        {/* Quick Sample Presets */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
            Select A Sample Customer Persona
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sampleMessages.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className="text-left p-3 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all text-xs group"
              >
                <div className="font-semibold text-slate-800 group-hover:text-teal-700 flex items-center justify-between">
                  <span>{sample.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition" />
                </div>
                <div className="text-slate-500 truncate mt-1">{sample.text}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Simulation Form */}
        <form onSubmit={handleSimulate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Customer Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="e.g. Rohan Malhotra"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">WhatsApp Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="+919876543210"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Incoming Message Body</label>
            <textarea
              rows={3}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="Type message as sent by the customer on WhatsApp..."
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} icon={Send}>
              Simulate Incoming Webhook
            </Button>
          </div>
        </form>

        {/* Result Preview */}
        {simulationResult && (
          <div className="mt-5 p-4 rounded-xl bg-slate-900 text-white space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Webhook Processed Successfully
              </span>
              <span className="text-[11px] text-slate-400">
                Customer: {simulationResult.customer?.fullName} ({simulationResult.customer?.phone})
              </span>
            </div>

            {simulationResult.aiMsg && (
              <div>
                <p className="text-xs text-slate-400 mb-1">AI Assistant WhatsApp Response (Grounded in DB):</p>
                <div className="p-3 bg-slate-800 rounded-lg text-xs leading-relaxed text-slate-200 whitespace-pre-line border border-slate-700">
                  {simulationResult.aiMsg.content}
                </div>
              </div>
            )}

            {simulationResult.humanTakeover && (
              <div className="p-3 bg-amber-950/60 border border-amber-800/80 rounded-lg text-xs text-amber-200">
                ⚠️ Human Takeover Activated: AI auto-reply paused. Notification sent to broker console!
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
