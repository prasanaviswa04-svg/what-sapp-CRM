import React from 'react';
import { Card, CardHeader, CardContent } from '../../components/common/Card';

export const HelpSupport = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-5">
        <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Help Center & Meta API Setup Guide</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Comprehensive technical documentation and operational rules for the EstateFlow platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Meta WhatsApp Cloud API Setup */}
        <Card>
          <CardHeader title="1. Official Meta WhatsApp Cloud API Setup" />
          <CardContent className="space-y-3 text-xs text-zinc-600 leading-relaxed">
            <p>
              EstateFlow integrates exclusively with the <strong>official Meta WhatsApp Business Cloud API</strong> (no browser automation, web scraping, or unofficial proxies).
            </p>
            <ol className="list-decimal pl-4 space-y-1.5 text-zinc-800">
              <li>Register as a developer on <strong>developers.facebook.com</strong> and create a Business App.</li>
              <li>Add the <strong>WhatsApp</strong> product to your App.</li>
              <li>Under <strong>WhatsApp &gt; Configuration</strong>, set the Webhook Callback URL to your EstateFlow server URL: <code className="bg-zinc-100 p-1 rounded font-mono text-zinc-950 border border-zinc-200">/api/whatsapp/webhook</code>.</li>
              <li>Set the Verify Token to <code className="bg-zinc-100 p-1 rounded font-mono text-zinc-950 border border-zinc-200">estateflow_verify_token_2026</code>.</li>
              <li>Subscribe to the <code className="font-mono text-zinc-900">messages</code> and <code className="font-mono text-zinc-900">message_deliveries</code> webhook events.</li>
              <li>Generate a Permanent System User Token in Business Manager and paste it in EstateFlow Integrations.</li>
            </ol>
          </CardContent>
        </Card>

        {/* 24-Hour Messaging Policy */}
        <Card>
          <CardHeader title="2. Meta 24-Hour Customer Service Window" />
          <CardContent className="space-y-3 text-xs text-zinc-600 leading-relaxed">
            <p>
              When a customer messages your business on WhatsApp, a <strong>24-hour customer service window</strong> opens:
            </p>
            <ul className="list-disc pl-4 space-y-1.5 text-zinc-800">
              <li>Inside this 24-hour window, you and the AI Assistant can send free-form text messages, images, documents, and property cards.</li>
              <li>Outside the 24-hour window, WhatsApp policy requires sending an <strong>approved WhatsApp message template</strong> to re-open the conversation.</li>
              <li>The platform automatically checks customer consent and suppresses promotional broadcasts if a client opts out.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Database-Grounded AI */}
        <Card>
          <CardHeader title="3. Database-Grounded AI Assistant" />
          <CardContent className="space-y-3 text-xs text-zinc-600 leading-relaxed">
            <p>
              EstateFlow AI is strictly grounded in your MongoDB property inventory and knowledge base:
            </p>
            <ul className="list-disc pl-4 space-y-1.5 text-zinc-800">
              <li>The AI never invents property prices, addresses, amenities, or fake availability.</li>
              <li>Only properties with status <code className="text-zinc-950 font-bold">Available</code> are ever recommended to clients.</li>
              <li>When a customer requests to speak with a human broker, the system automatically activates <strong>Human Takeover</strong>, pauses AI replies, and alerts the broker.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Conflict Detection & Booking Safety */}
        <Card>
          <CardHeader title="4. Transaction Safety & Double-Booking Lock" />
          <CardContent className="space-y-3 text-xs text-zinc-600 leading-relaxed">
            <p>
              To protect real estate agencies from catastrophic double-selling:
            </p>
            <ul className="list-disc pl-4 space-y-1.5 text-zinc-800">
              <li>When a property booking is confirmed, the inventory status is locked to <strong>Reserved</strong> or <strong>Sold</strong>.</li>
              <li>The platform prevents creating another confirmed booking on the same property until the active booking is cancelled.</li>
              <li>Broker scheduling detects calendar conflicts so agents are not double-booked for visits at the same time.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
