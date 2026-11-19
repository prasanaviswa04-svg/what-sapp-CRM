import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageSquare,
  Sparkles,
  Send,
  CheckCircle2,
  ArrowLeft,
  Share2
} from 'lucide-react';

export const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers/${id}`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to fetch customer details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !data.conversation) return;

    setSendingMsg(true);
    try {
      const res = await api.post('/whatsapp/send', {
        conversationId: data.conversation._id,
        content: newMessage
      });

      if (res.data.success) {
        setNewMessage('');
        addToast('Message sent to WhatsApp!', 'success');
        fetchCustomerDetails();
      }
    } catch (err) {
      addToast('Failed to send WhatsApp message', 'error');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleShareProperty = async (property) => {
    if (!data.conversation) {
      addToast('No WhatsApp conversation exists for this customer yet.', 'warning');
      return;
    }

    try {
      await api.post('/whatsapp/send', {
        conversationId: data.conversation._id,
        propertyId: property._id
      });
      addToast(`Shared ${property.title} via WhatsApp!`, 'success');
      setActiveTab('chat');
      fetchCustomerDetails();
    } catch (err) {
      addToast('Failed to share property', 'error');
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  const { customer, leads, matchedProperties, appointments, bookings, payments, conversation, messages, activityLogs } = data;

  return (
    <div className="space-y-6">
      {/* Back button & Action Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/customers')} icon={ArrowLeft}>
          Back to Customers
        </Button>
        <div className="flex items-center gap-2">
          {conversation && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate(`/whatsapp?conversationId=${conversation._id}`)}
              icon={MessageSquare}
            >
              Open WhatsApp Web Chat
            </Button>
          )}
        </div>
      </div>

      {/* Customer Hero Profile Card */}
      <Card className="bg-white text-zinc-900 p-6 rounded-2xl shadow-xs border border-zinc-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 font-bold text-2xl">
              {customer.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-zinc-950">{customer.fullName}</h1>
                <Badge variant={customer.priority}>{customer.priority} Priority</Badge>
                <Badge variant={customer.leadStatus}>{customer.leadStatus}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 mt-2">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" /> {customer.phone}
                </span>
                {customer.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" /> {customer.email}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" /> {customer.preferredLocation || 'Gurugram'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-zinc-200 sm:pl-6">
            <div className="text-xs text-zinc-400 uppercase tracking-wider">Maximum Budget</div>
            <div className="text-2xl font-bold text-zinc-950 mt-0.5">
              {customer.requirements?.maxBudget
                ? `₹${(customer.requirements.maxBudget / 10000000).toFixed(2)} Cr`
                : 'Flexible'}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">
              {customer.requirements?.bedrooms || 3} BHK {customer.requirements?.propertyCategory || 'Apartment'}
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Tabs */}
      <div className="border-b border-zinc-200">
        <nav className="flex space-x-6 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Requirements' },
            { id: 'matching', label: `AI Matched Properties (${matchedProperties.length})` },
            { id: 'leads', label: `Pipeline Leads (${leads.length})` },
            { id: 'chat', label: 'WhatsApp Chat Thread' },
            { id: 'appointments', label: `Site Visits (${appointments.length})` },
            { id: 'bookings', label: `Bookings & Payments (${bookings.length})` },
            { id: 'timeline', label: 'Activity Timeline' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-zinc-950 text-zinc-950 font-bold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-950 hover:border-zinc-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab 1: Overview & Preferences */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Property Search Requirements" subtitle="Captured from conversational discovery" />
            <CardContent className="space-y-3.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500">Property Category</span>
                <span className="font-semibold text-zinc-900">{customer.requirements?.propertyCategory}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500">Purpose</span>
                <span className="font-semibold text-zinc-900">{customer.requirements?.purpose || 'Buy'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500">Target Bedrooms</span>
                <span className="font-semibold text-zinc-900">{customer.requirements?.bedrooms || 'Any'} BHK</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500">Budget Range</span>
                <span className="font-bold text-zinc-950">
                  ₹{(customer.requirements?.minBudget / 10000000).toFixed(2)} Cr - ₹
                  {(customer.requirements?.maxBudget / 10000000).toFixed(2)} Cr
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500">Preferred Locality</span>
                <span className="font-semibold text-zinc-900">{customer.preferredLocation || 'Any'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-zinc-500">Purchase Timeline</span>
                <span className="font-semibold text-zinc-900">{customer.requirements?.purchaseTimeline}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Customer Metadata & Notes" subtitle="Internal brokerage information" />
            <CardContent className="space-y-3 text-xs">
              <div>
                <span className="text-zinc-500 block mb-1">Acquisition Source</span>
                <Badge>{customer.source}</Badge>
              </div>
              <div>
                <span className="text-zinc-500 block mb-1">Assigned Broker</span>
                <span className="font-semibold text-zinc-900">
                  {customer.assignedBrokerId ? `${customer.assignedBrokerId.firstName} ${customer.assignedBrokerId.lastName}` : 'Unassigned'}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-1">Internal Broker Notes</span>
                <p className="p-3 bg-zinc-50 rounded-lg text-zinc-800 border border-zinc-200 leading-relaxed">
                  {customer.internalNotes || 'No internal notes recorded yet.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Matched Properties */}
      {activeTab === 'matching' && (
        <div className="space-y-4">
          <div className="bg-zinc-100 border border-zinc-200 p-4 rounded-xl text-xs text-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-zinc-900" />
              <span>
                Matching engine ranked <strong>{matchedProperties.length} verified available properties</strong> against{' '}
                {customer.fullName}'s budget and location criteria.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchedProperties.map(({ property, matchPercentage }) => (
              <Card key={property._id} className="overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <img
                    src={property.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600'}
                    alt={property.title}
                    className="w-full sm:w-48 h-40 object-cover"
                  />
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-zinc-400">{property.propertyCode}</span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-zinc-100 text-zinc-900 border border-zinc-200">
                          {matchPercentage} Match
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-zinc-900 mt-1">{property.title}</h4>
                      <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-zinc-400" /> {property.address?.locality}, {property.address?.city}
                      </p>
                      <div className="text-sm font-extrabold text-zinc-950 mt-2">
                        ₹{(property.totalPrice / 10000000).toFixed(2)} Cr
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between">
                      <Button
                        size="sm"
                        variant="primary"
                        icon={Share2}
                        onClick={() => handleShareProperty(property)}
                      >
                        Share via WhatsApp
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/properties/${property._id}`)}
                      >
                        View Property
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Leads */}
      {activeTab === 'leads' && (
        <Card>
          <CardHeader title="CRM Pipeline Leads" subtitle="Pipeline progression and lead scoring intelligence" />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-200">
                <tr>
                  <th className="py-3 px-4">Lead Title</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">AI Score</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Last Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b border-zinc-200">
                {leads.map((l) => (
                  <tr key={l._id}>
                    <td className="py-3 px-4 font-semibold text-zinc-900">{l.title}</td>
                    <td className="py-3 px-4">
                      <Badge variant={l.stage}>{l.stage}</Badge>
                    </td>
                    <td className="py-3 px-4 font-bold text-zinc-950">{l.score}/100</td>
                    <td className="py-3 px-4">
                      <Badge variant={l.scoreClassification}>{l.scoreClassification}</Badge>
                    </td>
                    <td className="py-3 px-4 text-zinc-500">
                      {new Date(l.lastContactDate || l.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 4: WhatsApp Chat */}
      {activeTab === 'chat' && (
        <Card className="max-w-3xl mx-auto shadow-sm">
          <CardHeader
            title={`WhatsApp Conversation with ${customer.fullName}`}
            subtitle={customer.phone}
            action={
              conversation?.humanTakeover && (
                <span className="text-[11px] bg-zinc-100 text-zinc-900 border border-zinc-300 px-2 py-0.5 rounded font-semibold">
                  Human Takeover Active
                </span>
              )
            }
          />
          <div className="h-96 overflow-y-auto p-4 bg-zinc-50 space-y-3 border-y border-zinc-200">
            {messages.length === 0 ? (
              <div className="text-center text-zinc-400 text-xs py-12">No messages exchanged yet.</div>
            ) : (
              messages.map((m) => {
                const isCustomer = m.senderType === 'customer';
                return (
                  <div key={m._id} className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs relative ${
                        isCustomer
                          ? 'bg-white text-zinc-900 border border-zinc-200 rounded-tl-none'
                          : 'bg-zinc-800 text-white rounded-tr-none'
                      }`}
                    >
                      <div className="text-[10px] font-bold opacity-75 mb-1">
                        {isCustomer ? customer.fullName : m.senderName || 'EstateFlow Agent'}
                      </div>
                      <div className="whitespace-pre-line">{m.content}</div>
                      <div className="text-[9px] opacity-70 text-right mt-1.5 flex items-center justify-end gap-1">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {!isCustomer && <CheckCircle2 className="w-2.5 h-2.5 inline" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <form onSubmit={handleSendMessage} className="p-3 bg-white flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type message directly to client's WhatsApp..."
              className="flex-1 text-xs border border-zinc-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950"
            />
            <Button type="submit" size="sm" isLoading={sendingMsg} icon={Send}>
              Send
            </Button>
          </form>
        </Card>
      )}

      {/* Tab 5: Appointments */}
      {activeTab === 'appointments' && (
        <Card>
          <CardHeader title="Site Visits & Appointments" subtitle="Scheduled and completed property walkthroughs" />
          <div className="divide-y divide-zinc-200">
            {appointments.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">No visits scheduled yet.</div>
            ) : (
              appointments.map((a) => (
                <div key={a._id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-zinc-700" />
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900">{a.propertyId?.title}</h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {new Date(a.visitDate).toLocaleDateString()} at {a.visitTime} • Location: {a.meetingLocation}
                      </p>
                    </div>
                  </div>
                  <Badge variant={a.status}>{a.status}</Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Tab 6: Bookings & Payments */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <Card>
            <CardHeader title="Confirmed Property Bookings" subtitle="Official booking agreements" />
            <div className="divide-y divide-zinc-200">
              {bookings.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400">No bookings recorded yet.</div>
              ) : (
                bookings.map((b) => (
                  <div key={b._id} className="p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-zinc-400">{b.bookingCode}</span>
                      <h4 className="text-xs font-bold text-zinc-900 mt-0.5">{b.propertyId?.title}</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Agreed Price: ₹{(b.agreedPrice / 10000000).toFixed(2)} Cr • Advance: ₹
                        {(b.advanceAmount / 10000000).toFixed(2)} Cr
                      </p>
                    </div>
                    <Badge variant={b.bookingStatus}>{b.bookingStatus}</Badge>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Transaction & Payment History" subtitle="Verified advances and installment receipts" />
            <div className="divide-y divide-zinc-200">
              {payments.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400">No transactions recorded yet.</div>
              ) : (
                payments.map((p) => (
                  <div key={p._id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-zinc-900">{p.invoiceNumber}</span>
                      <span className="text-zinc-400 ml-2">({p.transactionId})</span>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        Method: {p.paymentMethod} • Date: {new Date(p.paidAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-zinc-950">₹{(p.amountPaid / 100000).toFixed(2)} Lakhs</div>
                      <Badge variant={p.status}>{p.status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 7: Timeline */}
      {activeTab === 'timeline' && (
        <Card>
          <CardHeader title="Complete Customer Activity Timeline" subtitle="Audit trail of CRM events" />
          <div className="p-5 space-y-4">
            {activityLogs.length === 0 ? (
              <div className="text-center text-zinc-400 text-xs py-8">No activity logged yet.</div>
            ) : (
              activityLogs.map((log) => (
                <div key={log._id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-zinc-950 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="font-semibold text-zinc-900">{log.action}</span>
                    <span className="text-zinc-400 ml-2">by {log.userName}</span>
                    <div className="text-[10px] text-zinc-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
