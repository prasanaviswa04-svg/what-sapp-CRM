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
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleSelect = (url) => {
    navigate(url);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="flex min-h-full items-start justify-center p-4 pt-16 sm:pt-24">
        <div className="relative w-full max-w-xl rounded-xl bg-white shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-100">
          {/* Search Input */}
          <div className="flex items-center px-4 border-b border-zinc-100 bg-zinc-50/50">
            <Search className="w-4 h-4 text-zinc-400 mr-2.5" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search customers, phone, property code, locality..."
              className="w-full py-3.5 bg-transparent text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none"
            />
            {loading && <Loader2 className="w-4 h-4 text-zinc-900 animate-spin mr-2" />}
            <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-900 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results Area */}
          <div className="p-2.5 max-h-96 overflow-y-auto divide-y divide-zinc-100">
            {!results && !loading && (
              <div className="py-8 text-center text-xs text-zinc-400 tracking-tight">
                Type 2 or more characters to search across customers, inventory, and leads...
              </div>
            )}

            {results && (
              <>
                {/* Customers */}
                {results.customers?.length > 0 && (
                  <div className="py-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-3 mb-1 block">
                      Customers
                    </span>
                    {results.customers.map((c) => (
                      <div
                        key={c._id}
                        onClick={() => handleSelect(`/customers/${c._id}`)}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-100 cursor-pointer transition text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <Users className="w-4 h-4 text-zinc-900" />
                          <div>
                            <span className="font-semibold text-zinc-900">{c.fullName}</span>
                            <span className="text-zinc-400 ml-2 font-mono text-[11px]">{c.phone}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Properties */}
                {results.properties?.length > 0 && (
                  <div className="py-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-3 mb-1 block">
                      Properties
                    </span>
                    {results.properties.map((p) => (
                      <div
                        key={p._id}
                        onClick={() => handleSelect(`/properties/${p._id}`)}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-100 cursor-pointer transition text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <Building2 className="w-4 h-4 text-zinc-900" />
                          <div>
                            <span className="font-semibold text-zinc-900">{p.title}</span>
                            <span className="text-zinc-400 ml-2 text-[10px] font-mono">({p.propertyCode})</span>
                          </div>
                        </div>
                        <span className="font-bold text-zinc-950">₹{(p.totalPrice / 10000000).toFixed(2)} Cr</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Leads */}
                {results.leads?.length > 0 && (
                  <div className="py-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-3 mb-1 block">
                      Leads & Pipeline
                    </span>
                    {results.leads.map((l) => (
                      <div
                        key={l._id}
                        onClick={() => handleSelect('/leads')}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-100 cursor-pointer transition text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <GitBranch className="w-4 h-4 text-zinc-900" />
                          <span className="font-semibold text-zinc-900">{l.title}</span>
                        </div>
                        <span className="text-zinc-500">{l.customerId?.fullName}</span>
                      </div>
                    ))}
                  </div>
                )}

                {results.customers?.length === 0 &&
                  results.properties?.length === 0 &&
                  results.leads?.length === 0 && (
                    <div className="py-8 text-center text-xs text-zinc-400 tracking-tight">
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
