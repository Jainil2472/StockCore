// pages/SendPurchaseOrder.jsx
import React, { useState, useEffect } from 'react';
import {
  Mail, Send, User, Building, Phone, CheckCircle, AlertCircle,
  X, ChevronDown, FileText, Users, Loader
} from 'lucide-react';
import { partyApi } from '@/api/partyapi';
import { emailApi } from '@/api/emailApi';

// ============================================================================
// DEFAULT EMAIL TEMPLATE
// ============================================================================

const DEFAULT_TEMPLATE = `Dear Supplier,

We would like to place the following purchase order.

Please confirm availability and delivery timeline.

IMPORTANT NOTICE
Do not reply to this automated email.
To respond, please send your reply to our company email.

Best Regards
StockCore Team`;

// ============================================================================
// PARTY SELECTION DROPDOWN
// ============================================================================

function PartySelector({ parties, selectedParty, onSelect, loading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredParties = parties.filter(party =>
    party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    party.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (party) => {
    onSelect(party);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Seller / Buyer *
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-left flex items-center justify-between hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {selectedParty ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{selectedParty.name}</p>
              <p className="text-sm text-gray-500">{selectedParty.email}</p>
            </div>
          </div>
        ) : (
          <span className="text-gray-400">Select a seller or buyer...</span>
        )}
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
          </div>

          {/* Party List */}
          <div className="py-2">
            {filteredParties.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>No parties found</p>
              </div>
            ) : (
              filteredParties.map((party) => (
                <button
                  key={party.id}
                  type="button"
                  onClick={() => handleSelect(party)}
                  className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 text-left"
                >
                  <div className={`w-10 h-10 ${
                    party.type === 'SELLER' 
                      ? 'bg-gradient-to-br from-emerald-500 to-blue-600' 
                      : 'bg-gradient-to-br from-blue-500 to-purple-600'
                  } rounded-full flex items-center justify-center`}>
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{party.name}</p>
                    <p className="text-sm text-gray-500 truncate">{party.email}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    party.type === 'SELLER' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {party.type === 'SELLER' ? 'Seller' : 'Buyer'}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SELECTED PARTY INFO CARD
// ============================================================================

function SelectedPartyCard({ party }) {
  if (!party) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-4">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 ${
          party.type === 'SELLER' 
            ? 'bg-gradient-to-br from-emerald-500 to-blue-600' 
            : 'bg-gradient-to-br from-blue-500 to-purple-600'
        } rounded-full flex items-center justify-center flex-shrink-0`}>
          <Users className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-gray-900">{party.name}</h4>
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${
              party.type === 'SELLER' 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {party.type === 'SELLER' ? 'Seller' : 'Buyer'}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <span>{party.email}</span>
            </div>
            {party.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{party.phone}</span>
              </div>
            )}
            {party.gstNumber && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building className="w-4 h-4" />
                <span className="font-mono">{party.gstNumber}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN SEND PURCHASE ORDER PAGE
// ============================================================================

export default function SendPurchaseOrder() {
  const [parties, setParties] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Purchase Order Request');
  const [message, setMessage] = useState(DEFAULT_TEMPLATE);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notification, setNotification] = useState(null);

  // Check if user is OWNER
  const userRole = localStorage.getItem('role');
  const isOwner = userRole === 'OWNER';

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    setLoading(true);
    try {
      const data = await partyApi.getParties();
      // Filter only sellers and buyers
      const filteredParties = Array.isArray(data) 
        ? data.filter(p => p.type === 'SELLER' || p.type === 'BUYER')
        : [];
      setParties(filteredParties);
    } catch (error) {
      console.error('Error fetching parties:', error);
      showNotification('Failed to load sellers/buyers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg, type = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePartySelect = (party) => {
    setSelectedParty(party);
    setEmail(party.email);
  };

  const handleClearForm = () => {
    const confirmed = window.confirm('Are you sure you want to clear the form?');
    if (confirmed) {
      setSelectedParty(null);
      setEmail('');
      setSubject('Purchase Order Request');
      setMessage(DEFAULT_TEMPLATE);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();

    // Validation
    if (!email.trim()) {
      showNotification('Please enter an email address', 'error');
      return;
    }

    if (!subject.trim()) {
      showNotification('Please enter a subject', 'error');
      return;
    }

    if (!message.trim()) {
      showNotification('Please enter a message', 'error');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    setSending(true);

    try {
      await emailApi.sendPurchaseOrderEmail({
        toEmail: email,
        subject: subject,
        message: message
      });

      showNotification('Email sent successfully! 📧', 'success');
      
      // Reset form after successful send
      setTimeout(() => {
        setSelectedParty(null);
        setEmail('');
        setSubject('Purchase Order Request');
        setMessage(DEFAULT_TEMPLATE);
      }, 1500);
    } catch (error) {
      console.error('Error sending email:', error);
      showNotification(
        error.response?.data?.message || 'Failed to send email. Please try again.',
        'error'
      );
    } finally {
      setSending(false);
    }
  };

  // Access control - only OWNER can send purchase orders
  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            Only owners can send purchase orders. Please contact your administrator.
          </p>
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            👤 Staff - View Only
          </span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Send Purchase Order</h1>
              <p className="text-gray-500">Send purchase requests to suppliers or buyers via email</p>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-slide-in ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <p
              className={`font-medium ${
                notification.type === 'success' ? 'text-emerald-800' : 'text-red-800'
              }`}
            >
              {notification.message}
            </p>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <form onSubmit={handleSendEmail} className="p-8 space-y-6">
            
            {/* Party Selector */}
            <PartySelector
              parties={parties}
              selectedParty={selectedParty}
              onSelect={handlePartySelect}
              loading={loading}
            />

            {/* Selected Party Info Card */}
            {selectedParty && (
              <SelectedPartyCard party={selectedParty} />
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="supplier@gmail.com"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                This field is auto-filled when you select a party, but you can edit it.
              </p>
            </div>

            {/* Subject Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Purchase Order Request"
                  required
                  maxLength={200}
                />
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Body *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none font-mono text-sm"
                placeholder="Enter your message..."
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                A default template is provided. Feel free to customize it.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClearForm}
                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={sending}
              >
                <X className="w-5 h-5" />
                Clear Form
              </button>
              
              <button
                type="submit"
                disabled={sending}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Email
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Important Note</h4>
              <p className="text-sm text-blue-800">
                This email will be sent directly to the selected supplier/buyer. Make sure to verify the email address and message content before sending.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
