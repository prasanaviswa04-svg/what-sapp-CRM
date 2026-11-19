import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Users, Building2, GitBranch, ArrowRight, Loader2 } from 'lucide-react';
import api from '../../services/api';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        try {
          const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
          if (res.data.success) {
            setResults(res.data.results);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults(null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleSelect = (url) => {
    navigate(url);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-start justify-center p-4 pt-20">
        <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
          {/* Search Input */}
          <div className="flex items-center px-4 border-b border-slate-100 bg-slate-50/50">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search customers, phone, property code, locality..."
              className="w-full py-4 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            {loading && <Loader2 className="w-4 h-4 text-teal-600 animate-spin mr-2" />}
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results Area */}
          <div className="p-3 max-h-96 overflow-y-auto divide-y divide-slate-100">
            {!results && !loading && (
              <div className="py-8 text-center text-xs text-slate-400">
                Type 2 or more characters to search across customers, listings, and leads...
              </div>
            )}

            {results && (
              <>
                {/* Customers */}
                {results.customers?.length > 0 && (
                  <div className="py-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1 block">
                      Customers
                    </span>
                    {results.customers.map((c) => (
                      <div
                        key={c._id}
                        onClick={() => handleSelect(`/customers/${c._id}`)}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <Users className="w-4 h-4 text-teal-600" />
                          <div>
                            <span className="font-semibold text-slate-800">{c.fullName}</span>
                            <span className="text-slate-400 ml-2">{c.phone}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Properties */}
                {results.properties?.length > 0 && (
                  <div className="py-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1 block">
                      Properties
                    </span>
                    {results.properties.map((p) => (
                      <div
                        key={p._id}
                        onClick={() => handleSelect(`/properties/${p._id}`)}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          <div>
                            <span className="font-semibold text-slate-800">{p.title}</span>
                            <span className="text-slate-400 ml-2">({p.propertyCode})</span>
                          </div>
                        </div>
                        <span className="font-semibold text-teal-700">₹{(p.totalPrice / 10000000).toFixed(2)} Cr</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Leads */}
                {results.leads?.length > 0 && (
                  <div className="py-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1 block">
                      Leads & Pipeline
                    </span>
                    {results.leads.map((l) => (
                      <div
                        key={l._id}
                        onClick={() => handleSelect('/leads')}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <GitBranch className="w-4 h-4 text-amber-600" />
                          <span className="font-semibold text-slate-800">{l.title}</span>
                        </div>
                        <span className="text-slate-400">{l.customerId?.fullName}</span>
                      </div>
                    ))}
                  </div>
                )}

                {results.customers?.length === 0 &&
                  results.properties?.length === 0 &&
                  results.leads?.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No matching records found for "{query}".
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
