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
      <div className="space-y-4">
        <div className="bg-zinc-100 p-3.5 rounded-xl text-xs text-zinc-900 border border-zinc-200 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-zinc-950 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-xs tracking-tight text-zinc-950">Official Meta Cloud API Test Environment</p>
            <p className="mt-0.5 text-zinc-600 leading-relaxed text-[11px]">
              Simulate customer WhatsApp messages, test conversational requirement extraction, MongoDB inventory grounding, and automated WhatsApp replies in real time.
            </p>
          </div>
        </div>

        {/* Quick Sample Presets */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 block">
            Select Sample Customer Persona
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sampleMessages.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className="text-left p-2.5 rounded-lg border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 transition-all text-xs group"
              >
                <div className="font-semibold text-zinc-900 flex items-center justify-between">
                  <span>{sample.label}</span>
                  <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:text-zinc-900 transition" />
                </div>
                <div className="text-zinc-500 truncate mt-0.5 text-[11px]">{sample.text}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Simulation Form */}
        <form onSubmit={handleSimulate} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Customer Full Name</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none"
                placeholder="e.g. Rohan Malhotra"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">WhatsApp Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none font-mono"
                placeholder="+919876543210"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Incoming Message Body</label>
            <textarea
              rows={3}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full p-2.5 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-950 focus:outline-none"
              placeholder="Type message as sent by the customer on WhatsApp..."
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting} icon={Send}>
              Simulate Incoming Webhook
            </Button>
          </div>
        </form>

        {/* Result Preview */}
        {simulationResult && (
          <div className="p-4 rounded-xl bg-zinc-950 text-white space-y-3 animate-in fade-in duration-150 border border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Webhook Processed Successfully
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">
                {simulationResult.customer?.fullName} ({simulationResult.customer?.phone})
              </span>
            </div>

            {simulationResult.aiMsg && (
              <div>
                <p className="text-[11px] text-zinc-400 mb-1">AI Assistant WhatsApp Response (Grounded in DB):</p>
                <div className="p-3 bg-zinc-900 rounded-lg text-xs leading-relaxed text-zinc-200 whitespace-pre-line border border-zinc-800">
                  {simulationResult.aiMsg.content}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
