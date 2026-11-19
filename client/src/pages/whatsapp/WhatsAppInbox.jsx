import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import {
  MessageSquare,
  Search,
  Send,
  User,
  Bot,
  UserCheck,
  CheckCircle2,
  Building2,
  CalendarCheck,
  Share2,
  Check,
  CheckCheck,
  Sparkles
} from 'lucide-react';

export const WhatsAppInbox = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [matchedProperties, setMatchedProperties] = useState([]);
  const [showPropertyPicker, setShowPropertyPicker] = useState(false);
  const [availableProperties, setAvailableProperties] = useState([]);

  const messagesEndRef = useRef(null);
  const socket = useSocket();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Join socket room for active conversation
  useEffect(() => {
    if (!socket || !activeConversation?._id) return;
    socket.emit('join_conversation', activeConversation._id);
  }, [socket, activeConversation?._id]);

  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      const res = await api.get('/whatsapp/conversations', {
        params: { filter, search }
      });
      if (res.data.success) {
        setConversations(res.data.conversations || []);
        // If searchParam conversationId is set, open it
        const targetId = searchParams.get('conversationId');
        if (targetId) {
          const found = res.data.conversations.find((c) => c._id === targetId);
          if (found) setActiveConversation(found);
        } else if (!activeConversation && res.data.conversations.length > 0) {
          setActiveConversation(res.data.conversations[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConv(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [filter, search]);

  // Fetch message history for active conversation
  const fetchMessages = async (conversationId) => {
    if (!conversationId) return;
    setLoadingMessages(true);
    try {
      const res = await api.get(`/whatsapp/messages/${conversationId}`);
      if (res.data.success) {
        setMessages(res.data.messages || []);
        setActiveConversation(res.data.conversation);

        // Fetch matched properties for this customer
        if (res.data.conversation?.customerId) {
          const custId = res.data.conversation.customerId._id || res.data.conversation.customerId;
          if (custId) {
            const matchRes = await api.get(`/matching/customer/${custId}`);
            if (matchRes.data.success) {
              setMatchedProperties(matchRes.data.matches?.slice(0, 3) || []);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeConversation?._id) {
      fetchMessages(activeConversation._id);
    }
  }, [activeConversation?._id]);

  // Socket.io Real-time listener
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg) => {
      if (activeConversation && newMsg.conversationId === activeConversation._id) {
        setMessages((prev) => {
          // Replace matching optimistic message or add if new
          const existingIndex = prev.findIndex(
            (m) =>
              m._id === newMsg._id ||
              (String(m._id).startsWith('temp_') && m.content === newMsg.content && m.senderType === newMsg.senderType)
          );
          if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = newMsg;
            return updated;
          }
          return [...prev, newMsg];
        });
      }

      // Live update sidebar preview & order
      setConversations((prev) =>
        prev.map((c) =>
          c._id === newMsg.conversationId
            ? { ...c, lastMessagePreview: newMsg.content, lastMessageAt: newMsg.createdAt }
            : c
        )
      );
    };

    const handleConversationUpdated = (updatedConv) => {
      setConversations((prev) =>
        prev.map((c) => (c._id === updatedConv._id ? { ...c, ...updatedConv } : c))
      );
      if (activeConversation && activeConversation._id === updatedConv._id) {
        setActiveConversation((prev) => ({ ...prev, ...updatedConv }));
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('conversation_updated', handleConversationUpdated);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('conversation_updated', handleConversationUpdated);
    };
  }, [socket, activeConversation]);

  // Fetch all available properties for manual property insertion
  useEffect(() => {
    const loadProps = async () => {
      try {
        const res = await api.get('/properties?status=Available&limit=10');
        if (res.data.success) {
          setAvailableProperties(res.data.properties || []);
        }
      } catch (err) {}
    };
    loadProps();
  }, []);

  // Send message with instantaneous 0ms optimistic UI update
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    const text = inputText.trim();
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const now = new Date().toISOString();
    const agentName = `${user?.firstName || 'Broker'} ${user?.lastName || ''}`.trim() || 'Broker';

    // 1. Instantaneous Optimistic Message added to state with 0ms delay
    const optimisticMsg = {
      _id: tempId,
      conversationId: activeConversation._id,
      senderType: 'agent',
      senderName: agentName,
      content: text,
      messageType: 'text',
      createdAt: now,
      status: 'sending'
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText('');

    // 2. Instantaneous conversation sidebar update
    setConversations((prev) =>
      prev.map((c) =>
        c._id === activeConversation._id
          ? { ...c, lastMessagePreview: text, lastMessageAt: now }
          : c
      )
    );

    // 3. Instant auto-scroll
    setTimeout(scrollToBottom, 30);

    // 4. Send to server in background
    try {
      const res = await api.post('/whatsapp/send', {
        conversationId: activeConversation._id,
        content: text
      });

      if (res.data.success && res.data.message) {
        // Upgrade temporary message with confirmed database record
        setMessages((prev) =>
          prev.map((m) => (m._id === tempId ? res.data.message : m))
        );
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? { ...m, status: 'failed' } : m))
      );
      addToast('Failed to deliver message to WhatsApp', 'error');
    }
  };

  // Toggle Human Takeover
  const handleToggleTakeover = async () => {
    if (!activeConversation) return;
    const nextState = !activeConversation.humanTakeover;

    try {
      const res = await api.put(`/whatsapp/conversations/${activeConversation._id}/takeover`, {
        takeover: nextState
      });

      if (res.data.success) {
        setActiveConversation((prev) => ({ ...prev, humanTakeover: nextState }));
        addToast(
          nextState
            ? 'Human Takeover Activated: AI auto-replies paused.'
            : 'AI Assistant Resumed for this chat.',
          'info'
        );
      }
    } catch (err) {
      addToast('Failed to toggle takeover', 'error');
    }
  };

  // Quick share property into chat with instantaneous 0ms optimistic UI update
  const handleSharePropertyIntoChat = async (prop) => {
    if (!activeConversation) return;

    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const now = new Date().toISOString();
    const agentName = `${user?.firstName || 'Broker'} ${user?.lastName || ''}`.trim() || 'Broker';
    const propContent = `🏡 *${prop.title}* (${prop.propertyCode})\n📍 Locality: ${prop.address?.locality || ''}, ${prop.address?.city || ''}\n💰 Price: ₹${(prop.totalPrice / 10000000).toFixed(2)} Cr\n🛏️ ${prop.bedrooms} BHK | ${prop.builtUpArea} sq.ft\n🏊 ${prop.amenities?.slice(0, 3).join(', ') || ''}`;

    const optimisticMsg = {
      _id: tempId,
      conversationId: activeConversation._id,
      senderType: 'agent',
      senderName: agentName,
      content: propContent,
      messageType: 'text',
      createdAt: now,
      status: 'sending',
      isGrounded: true,
      groundedPropertyId: prop
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setShowPropertyPicker(false);

    setConversations((prev) =>
      prev.map((c) =>
        c._id === activeConversation._id
          ? { ...c, lastMessagePreview: propContent, lastMessageAt: now }
          : c
      )
    );

    setTimeout(scrollToBottom, 30);

    try {
      const res = await api.post('/whatsapp/send', {
        conversationId: activeConversation._id,
        propertyId: prop._id
      });
      if (res.data.success && res.data.message) {
        setMessages((prev) =>
          prev.map((m) => (m._id === tempId ? res.data.message : m))
        );
      }
      addToast(`Shared ${prop.title} to WhatsApp chat!`, 'success');
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? { ...m, status: 'failed' } : m))
      );
      addToast('Failed to share property', 'error');
    }
  };

  const customer = activeConversation?.customerId;

  return (
    <div className="h-[calc(100vh-7.5rem)] flex flex-col bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      {/* 3-Panel Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel 1: Conversation List */}
        <div className="w-80 sm:w-96 border-r border-zinc-200 flex flex-col bg-zinc-50 flex-shrink-0">
          {/* Header & Filter */}
          <div className="p-3.5 border-b border-zinc-200 bg-white space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-zinc-950" />
                <h2 className="font-bold text-zinc-950 text-sm">WhatsApp Inbox</h2>
              </div>
              <span className="text-[10px] bg-zinc-100 text-zinc-800 border border-zinc-200 font-semibold px-2 py-0.5 rounded-full">
                Meta Cloud API
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-100 border border-transparent rounded-lg text-zinc-900 focus:bg-white focus:border-zinc-950 focus:outline-none"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'unread', label: 'Unread' },
                { id: 'human_takeover', label: 'Takeover' },
                { id: 'urgent', label: 'Urgent' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition whitespace-nowrap ${
                    filter === f.id
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-200">
            {loadingConv ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-200 animate-pulse" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-zinc-200 rounded w-1/2 animate-pulse" />
                      <div className="h-2.5 bg-zinc-200 rounded w-3/4 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                No active conversations matching criteria.
              </div>
            ) : (
              conversations.map((c) => {
                const isSelected = activeConversation?._id === c._id;
                return (
                  <div
                    key={c._id}
                    onClick={() => setActiveConversation(c)}
                    className={`p-3.5 transition cursor-pointer flex items-start gap-3 relative ${
                      isSelected
                        ? 'bg-zinc-100 border-l-4 border-l-zinc-900'
                        : 'hover:bg-zinc-100/70 bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-900 font-bold flex items-center justify-center text-xs flex-shrink-0">
                      {c.customerId?.fullName?.charAt(0) || 'C'}
                    </div>

                    <div className="flex-1 min-w-0 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-zinc-950 truncate">
                          {c.customerId?.fullName || c.whatsappPhoneNumber}
                        </span>
                        <span className="text-[10px] text-zinc-400 flex-shrink-0">
                          {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-zinc-500 truncate text-[11px] mt-0.5 leading-snug">
                        {c.lastMessagePreview || 'Active WhatsApp chat'}
                      </p>

                      <div className="flex items-center gap-1.5 mt-1.5">
                        {c.humanTakeover && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-900 border border-zinc-300">
                            Takeover
                          </span>
                        )}
                        {c.customerId?.priority && (
                          <Badge variant={c.customerId.priority} size="xs">
                            {c.customerId.priority}
                          </Badge>
                        )}
                        {c.unreadCount > 0 && (
                          <span className="ml-auto w-4 h-4 rounded-full bg-zinc-900 text-white font-bold text-[10px] flex items-center justify-center">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Panel 2: Active Chat Window */}
        <div className="flex-1 flex flex-col bg-zinc-50 min-w-0">
          {activeConversation ? (
            <>
              {/* Active Chat Header */}
              <div className="h-16 px-4 bg-white border-b border-zinc-200 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-900 font-bold flex items-center justify-center text-xs">
                    {customer?.fullName?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-950 text-xs sm:text-sm">
                      {customer?.fullName || activeConversation.whatsappPhoneNumber}
                    </h3>
                    <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                      <span>{activeConversation.whatsappPhoneNumber}</span>
                      <span className="text-zinc-300">•</span>
                      <span className="text-zinc-700 font-medium flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 text-zinc-950" /> Official Cloud API Connected
                      </span>
                    </div>
                  </div>
                </div>

                {/* Human Takeover Switch */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleTakeover}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      activeConversation.humanTakeover
                        ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                        : 'bg-zinc-100 text-zinc-900 border-zinc-200 hover:bg-zinc-200'
                    }`}
                    title={
                      activeConversation.humanTakeover
                        ? 'Click to resume AI auto-reply'
                        : 'Click to take over conversation and pause AI'
                    }
                  >
                    {activeConversation.humanTakeover ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Broker Takeover (AI Paused)</span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-3.5 h-3.5 text-zinc-900" />
                        <span>AI Assistant Active</span>
                      </>
                    )}
                  </button>

                  <Button
                    size="sm"
                    variant="outline"
                    icon={CalendarCheck}
                    onClick={() =>
                      navigate(
                        `/appointments?action=new&customerId=${customer?._id || ''}`
                      )
                    }
                    className="hidden sm:inline-flex"
                  >
                    Schedule Visit
                  </Button>
                </div>
              </div>

              {/* Chat Messages Scrollable Area */}
              <div
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-zinc-50"
              >
                {/* 24-hr Service Window Notice */}
                <div className="text-center my-2">
                  <span className="inline-block bg-white border border-zinc-200 px-3 py-1 rounded-full text-[10px] text-zinc-600 font-medium shadow-xs">
                    🔒 Official WhatsApp 24-Hour Customer Care Window Active
                  </span>
                </div>

                {loadingMessages ? (
                  <div className="text-center text-xs text-zinc-400 py-12">Loading conversation...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-xs text-zinc-400 py-12">
                    No messages in this conversation. Send a message to start!
                  </div>
                ) : (
                  messages.map((m) => {
                    const isCustomer = m.senderType === 'customer';
                    const isAi = m.senderType === 'ai';

                    return (
                      <div
                        key={m._id}
                        className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                      >
                        <div
                          className={`max-w-md sm:max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs relative ${
                            isCustomer
                              ? 'bg-white text-zinc-900 rounded-tl-none border border-zinc-200'
                              : isAi
                              ? 'bg-zinc-800 text-white rounded-tr-none border border-zinc-700'
                              : 'bg-zinc-900 text-white rounded-tr-none'
                          }`}
                        >
                          {/* Sender Label */}
                          <div
                            className={`text-[10px] font-bold mb-1 flex items-center gap-1 ${
                              isCustomer
                                ? 'text-zinc-600'
                                : 'text-zinc-300'
                            }`}
                          >
                            {isAi && <Bot className="w-3 h-3 text-zinc-300" />}
                            <span>{isCustomer ? customer?.fullName || 'Customer' : isAi ? 'EstateFlow AI Assistant' : m.senderName || 'Broker'}</span>
                          </div>

                          {/* Content */}
                          <div className="whitespace-pre-line">{m.content}</div>

                          {/* Grounded Property Preview if grounded */}
                          {m.isGrounded && m.groundedPropertyId && typeof m.groundedPropertyId === 'object' && (
                            <div className="mt-2.5 p-2.5 bg-black/40 rounded-lg border border-white/10 text-[11px]">
                              <span className="text-[10px] uppercase font-bold text-zinc-300 block">
                                Grounded Property Listing
                              </span>
                              <div className="font-bold text-white mt-0.5">{m.groundedPropertyId.title || 'Property Listing'}</div>
                              <div className="text-zinc-200 font-extrabold mt-0.5">
                                ₹{m.groundedPropertyId.totalPrice ? (m.groundedPropertyId.totalPrice / 10000000).toFixed(2) : '0'} Cr
                              </div>
                            </div>
                          )}

                          {/* Time & Delivery Checkmark */}
                          <div
                            className={`text-[9px] text-right mt-1.5 flex items-center justify-end gap-1 ${
                              isCustomer ? 'text-zinc-400' : 'text-zinc-400'
                            }`}
                          >
                            <span>
                              {new Date(m.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {!isCustomer && (
                              m.status === 'read' ? (
                                <CheckCheck className="w-3 h-3 text-zinc-300 inline" title="Read by customer" />
                              ) : m.status === 'delivered' ? (
                                <CheckCheck className="w-3 h-3 text-zinc-400 inline" title="Delivered to WhatsApp" />
                              ) : m.status === 'sent' ? (
                                <Check className="w-3 h-3 text-zinc-400 inline" title="Sent" />
                              ) : m.status === 'sending' ? (
                                <span className="text-[8px] text-zinc-400 italic">sending...</span>
                              ) : m.status === 'failed' ? (
                                <span className="text-[8px] text-red-500 font-bold">failed</span>
                              ) : (
                                <Check className="w-3 h-3 text-zinc-500 inline" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Footer */}
              <div className="p-3 bg-white border-t border-zinc-200">
                {/* Property Recommendation Inserter Dropdown */}
                {showPropertyPicker && (
                  <div className="mb-2 p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2 animate-in slide-in-from-bottom-2 duration-150">
                    <div className="flex items-center justify-between text-xs font-semibold text-zinc-800">
                      <span>Pick a property to share with client:</span>
                      <button
                        onClick={() => setShowPropertyPicker(false)}
                        className="text-zinc-400 hover:text-zinc-700"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {availableProperties.map((p) => (
                        <div
                          key={p._id}
                          onClick={() => handleSharePropertyIntoChat(p)}
                          className="p-2 bg-white rounded-lg border border-zinc-200 hover:border-zinc-950 cursor-pointer text-xs transition"
                        >
                          <div className="font-semibold text-zinc-900 truncate">{p.title}</div>
                          <div className="text-zinc-950 font-bold">₹{(p.totalPrice / 10000000).toFixed(2)} Cr</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={Building2}
                    onClick={() => setShowPropertyPicker(!showPropertyPicker)}
                    title="Insert Property Card"
                  >
                    Share Property
                  </Button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type message directly to client's official WhatsApp..."
                    className="flex-1 text-xs border border-zinc-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950"
                  />

                  <Button type="submit" size="sm" icon={Send}>
                    Send
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-400">
              <MessageSquare className="w-12 h-12 text-zinc-300 mb-2" />
              <h3 className="text-sm font-semibold text-zinc-700">No Conversation Selected</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                Choose a customer from the left sidebar or simulate an incoming WhatsApp webhook.
              </p>
            </div>
          )}
        </div>

        {/* Panel 3: Customer Context & AI Matched Properties */}
        {activeConversation && customer && (
          <div className="hidden xl:flex w-80 border-l border-zinc-200 bg-white flex-col overflow-y-auto p-4 space-y-4">
            <div className="text-center pb-3 border-b border-zinc-100">
              <div className="w-16 h-16 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-900 font-bold flex items-center justify-center text-xl mx-auto shadow-xs">
                {customer?.fullName?.charAt(0) || 'C'}
              </div>
              <h3 className="font-bold text-zinc-950 text-sm mt-2">{customer?.fullName || 'Client'}</h3>
              <p className="text-xs text-zinc-500">{customer?.phone || ''}</p>
              <div className="flex justify-center gap-1.5 mt-2">
                {customer?.priority && <Badge variant={customer.priority}>{customer.priority} Priority</Badge>}
                {customer?.leadStatus && <Badge variant={customer.leadStatus}>{customer.leadStatus}</Badge>}
              </div>
            </div>

            {/* Quick Specs */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Buyer Requirements
              </span>
              <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Max Budget:</span>
                  <span className="font-bold text-zinc-950">
                    {customer?.requirements?.maxBudget
                      ? `₹${(customer.requirements.maxBudget / 10000000).toFixed(2)} Cr`
                      : 'Open'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Locality:</span>
                  <span className="font-semibold text-zinc-800">{customer?.preferredLocation || 'Gurugram'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Target BHK:</span>
                  <span className="font-semibold text-zinc-800">{customer?.requirements?.bedrooms || 3} BHK</span>
                </div>
              </div>
            </div>

            {/* AI Matched Recommendations for this client */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-zinc-950" /> Top Matches ({matchedProperties.length})
                </span>
              </div>
              <div className="space-y-2">
                {matchedProperties.filter(m => m?.property).map(({ property, matchPercentage }) => (
                  <div
                    key={property._id}
                    className="p-2.5 rounded-lg border border-zinc-200 hover:border-zinc-950 transition space-y-1 bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-950">{matchPercentage} Match</span>
                      <span className="text-[10px] font-extrabold text-zinc-900">
                        ₹{property.totalPrice ? (property.totalPrice / 10000000).toFixed(2) : '0'} Cr
                      </span>
                    </div>
                    <div className="font-semibold text-zinc-900 truncate text-[11px]">{property.title || 'Property Listing'}</div>
                    <button
                      onClick={() => handleSharePropertyIntoChat(property)}
                      className="w-full mt-1 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-[10px] font-semibold flex items-center justify-center gap-1 transition"
                    >
                      <Share2 className="w-2.5 h-2.5" /> Share to Chat
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-zinc-100 space-y-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-xs"
                onClick={() => navigate(`/customers/${customer._id}`)}
              >
                <User className="w-3.5 h-3.5 mr-2" /> Full Customer Profile
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
