import React, { useState } from 'react';
import { Search, MapPin, Cloud, Shield, Users, Hotel, UtensilsCrossed, Bus, Phone, Wallet, Sparkles, Loader2, ChevronRight, Star, Clock, X, Heart } from 'lucide-react';

const MOCK_DB = {
  weather: { temp: 27, condition: 'Partly cloudy', aqi: 78, humidity: 58, wind: 12 },
  safety: 82,
  crowd: 'Moderate',
  places: [
    { name: 'Old Fort & Ramparts', rating: 4.6, time: '2-3 hrs', price: '₹50', hours: '6 AM - 6 PM', tag: 'Heritage' },
    { name: 'Riverside Promenade', rating: 4.4, time: '1 hr', price: 'Free', hours: 'Open 24 hrs', tag: 'Hidden gem' },
    { name: 'Central Bazaar', rating: 4.3, time: '2 hrs', price: 'Free', hours: '10 AM - 9 PM', tag: 'Shopping' },
    { name: 'Hilltop Temple', rating: 4.7, time: '1.5 hrs', price: 'Free', hours: '5 AM - 8 PM', tag: 'Heritage' },
  ],
  hotels: [
    { name: 'Budget Inn', tier: 'Budget', price: 1200, rating: 4.0 },
    { name: 'City Comfort Suites', tier: 'Standard', price: 2800, rating: 4.3 },
    { name: 'The Grand Residency', tier: 'Premium', price: 5500, rating: 4.6 },
    { name: 'Royal Heritage Palace', tier: 'Luxury', price: 11000, rating: 4.8 },
  ],
  food: [
    { dish: 'Local Thali', price: '₹150-250', spot: 'Sharma Dhaba' },
    { dish: 'Street Chaat', price: '₹40-80', spot: 'Bazaar Food Lane' },
    { dish: 'Kebab Platter', price: '₹300-450', spot: 'Old City Grill' },
  ],
  emergency: [
    { type: 'Hospital', name: 'City General Hospital', dist: '1.2 km', phone: '108' },
    { type: 'Police', name: 'Central Police Station', dist: '0.8 km', phone: '100' },
    { type: 'Pharmacy', name: 'Apollo Pharmacy', dist: '0.5 km', phone: '—' },
  ],
};

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 16, padding: '16px 18px', flex: '1 1 140px', minWidth: 140
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Icon size={16} color={accent || '#00E5FF'} />
        <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, color: '#fff' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function GlassCard({ children, style }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 18, padding: 20, ...style
    }}>
      {children}
    </div>
  );
}

export default function AISaarthi() {
  const [query, setQuery] = useState('');
  const [destination, setDestination] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [budget, setBudget] = useState(15000);
  const [days, setDays] = useState(3);
  const [interests, setInterests] = useState(['Historical']);
  const [itinerary, setItinerary] = useState(null);
  const [loadingItinerary, setLoadingItinerary] = useState(false);
  const [itineraryError, setItineraryError] = useState(null);

  const [people, setPeople] = useState(2);
  const [style, setStyle] = useState('Standard');

  const allInterests = ['Historical', 'Adventure', 'Food', 'Nature', 'Shopping', 'Nightlife'];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setDestination(query.trim());
    setActiveTab('overview');
    setItinerary(null);
  };

  const toggleInterest = (i) => {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const generateItinerary = async () => {
    setLoadingItinerary(true);
    setItineraryError(null);
    setItinerary(null);
    try {
      const prompt = `Create a ${days}-day travel itinerary for ${destination}, India. Budget: ₹${budget} total. Traveler interests: ${interests.join(', ') || 'general sightseeing'}.

Respond ONLY with valid JSON, no markdown fences, no preamble. Format:
{
  "summary": "one sentence trip summary",
  "days": [
    {
      "day": 1,
      "morning": "activity description",
      "afternoon": "activity description",
      "evening": "activity description",
      "estimatedCost": 2500
    }
  ],
  "totalEstimate": 7500,
  "tip": "one practical local tip"
}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
        })
      });
      const data = await response.json();
      const text = data.content.map(b => b.text || '').join('');
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      setItinerary(parsed);
    } catch (err) {
      setItineraryError("Couldn't generate the itinerary. Try again.");
    } finally {
      setLoadingItinerary(false);
    }
  };

  const tierMultiplier = { Budget: 0.6, Standard: 1, Premium: 1.6, Luxury: 2.5 };
  const estHotel = Math.round(2800 * tierMultiplier[style] * days * (people > 2 ? Math.ceil(people / 2) : 1));
  const estFood = Math.round(400 * tierMultiplier[style] * days * people);
  const estTransport = Math.round(600 * days * (people > 1 ? 1.3 : 1));
  const estTickets = Math.round(300 * days * people);
  const estTotal = estHotel + estFood + estTransport + estTickets;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: MapPin },
    { id: 'places', label: 'Places', icon: Star },
    { id: 'hotels', label: 'Hotels', icon: Hotel },
    { id: 'food', label: 'Food', icon: UtensilsCrossed },
    { id: 'emergency', label: 'Emergency', icon: Phone },
    { id: 'planner', label: 'AI Planner', icon: Sparkles },
    { id: 'budget', label: 'Budget', icon: Wallet },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(180deg, #050816 0%, #0A0E27 100%)',
      fontFamily: "'Poppins', system-ui, sans-serif", color: '#fff'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::placeholder { color: #6B7280; }
        button { font-family: inherit; cursor: pointer; }
        input { font-family: inherit; }
      `}</style>

      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #00E5FF, #7B61FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sparkles size={18} color="#050816" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1 }}>AI Saarthi</div>
            <div style={{ fontSize: 10, color: '#7B61FF', letterSpacing: 0.5 }}>KNOW BEFORE YOU GO</div>
          </div>
        </div>
        {destination && (
          <button onClick={() => setDestination(null)} style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10, padding: '8px 14px', color: '#fff', fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <X size={14} /> New search
          </button>
        )}
      </header>

      {!destination ? (
        // HOME / SEARCH STATE
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '80px 24px 100px', textAlign: 'center'
        }}>
          <div style={{
            fontSize: 12, color: '#00E5FF', letterSpacing: 1, marginBottom: 14,
            border: '1px solid rgba(0,229,255,0.3)', borderRadius: 20, padding: '6px 14px'
          }}>
            AI-POWERED TRAVEL GUIDANCE
          </div>
          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, maxWidth: 700,
            lineHeight: 1.15, margin: '0 0 16px',
            background: 'linear-gradient(135deg, #fff, #9CA3AF)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Travel smarter with AI Saarthi
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: 16, maxWidth: 480, marginBottom: 36 }}>
            Discover destinations, generate intelligent itineraries, and estimate your budget before you go.
          </p>

          <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: 500, position: 'relative' }}>
            <Search size={18} color="#6B7280" style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a city, e.g. Jaipur, Varanasi, Goa..."
              style={{
                width: '100%', padding: '16px 16px 16px 48px', borderRadius: 14,
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff', fontSize: 15, outline: 'none'
              }}
            />
            <button type="submit" style={{
              position: 'absolute', right: 6, top: 6, bottom: 6,
              background: 'linear-gradient(135deg, #00E5FF, #7B61FF)',
              border: 'none', borderRadius: 10, padding: '0 20px', color: '#050816',
              fontWeight: 600, fontSize: 14
            }}>
              Explore
            </button>
          </form>

          <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['Jaipur', 'Varanasi', 'Goa', 'Manali', 'Udaipur'].map(c => (
              <button key={c} onClick={() => { setQuery(c); setDestination(c); }} style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 20, padding: '6px 14px', color: '#D1D5DB', fontSize: 13
              }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      ) : (
        // DESTINATION DASHBOARD
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 60px' }}>
          {/* Hero */}
          <div style={{
            borderRadius: 20, padding: '36px 28px', marginBottom: 20,
            background: 'linear-gradient(135deg, rgba(123,97,255,0.25), rgba(0,229,255,0.12))',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#00E5FF', fontSize: 13, marginBottom: 8 }}>
              <MapPin size={14} /> Destination
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 14px' }}>{destination}</h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <StatCard icon={Cloud} label="Weather" value={`${MOCK_DB.weather.temp}°C`} sub={MOCK_DB.weather.condition} />
              <StatCard icon={Shield} label="Safety score" value={`${MOCK_DB.safety}/100`} accent="#00D26A" />
              <StatCard icon={Users} label="Crowd level" value={MOCK_DB.crowd} accent="#FFB547" />
              <StatCard icon={Wallet} label="AQI" value={MOCK_DB.weather.aqi} sub="Moderate" />
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {navItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: activeTab === item.id ? 'rgba(0,229,255,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeTab === item.id ? 'rgba(0,229,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: activeTab === item.id ? '#00E5FF' : '#9CA3AF',
                borderRadius: 12, padding: '9px 14px', fontSize: 13, fontWeight: 500
              }}>
                <item.icon size={14} /> {item.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <GlassCard>
                <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Top picks</h3>
                {MOCK_DB.places.slice(0, 3).map(p => (
                  <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: 14 }}>{p.name}</span>
                    <span style={{ fontSize: 13, color: '#00E5FF', display: 'flex', alignItems: 'center', gap: 4 }}><Star size={12} fill="#00E5FF" />{p.rating}</span>
                  </div>
                ))}
              </GlassCard>
              <GlassCard>
                <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Travel tips</h3>
                <ul style={{ paddingLeft: 18, color: '#D1D5DB', fontSize: 14, lineHeight: 1.8, margin: 0 }}>
                  <li>Carry cash — many local vendors don't accept cards</li>
                  <li>Best visited early morning or evening to avoid crowds</li>
                  <li>Negotiate auto/taxi fares before starting the ride</li>
                </ul>
              </GlassCard>
            </div>
          )}

          {activeTab === 'places' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              {MOCK_DB.places.map(p => (
                <GlassCard key={p.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                    <h4 style={{ margin: 0, fontSize: 15 }}>{p.name}</h4>
                    <span style={{ fontSize: 10, background: 'rgba(123,97,255,0.2)', color: '#A78BFA', padding: '3px 8px', borderRadius: 8 }}>{p.tag}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#9CA3AF', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Star size={12} color="#FFB547" /> {p.rating} rating</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={12} /> {p.time} · {p.hours}</span>
                    <span>Entry: {p.price}</span>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {activeTab === 'hotels' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              {MOCK_DB.hotels.map(h => (
                <GlassCard key={h.name}>
                  <span style={{ fontSize: 10, background: 'rgba(0,229,255,0.15)', color: '#00E5FF', padding: '3px 8px', borderRadius: 8 }}>{h.tier}</span>
                  <h4 style={{ margin: '10px 0 6px', fontSize: 15 }}>{h.name}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 18, fontWeight: 600 }}>₹{h.price}<span style={{ fontSize: 11, color: '#6B7280', fontWeight: 400 }}>/night</span></span>
                    <span style={{ fontSize: 13, color: '#FFB547', display: 'flex', alignItems: 'center', gap: 3 }}><Star size={12} fill="#FFB547" />{h.rating}</span>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {activeTab === 'food' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {MOCK_DB.food.map(f => (
                <GlassCard key={f.dish}>
                  <h4 style={{ margin: '0 0 6px', fontSize: 15 }}>{f.dish}</h4>
                  <div style={{ fontSize: 13, color: '#9CA3AF' }}>{f.spot}</div>
                  <div style={{ fontSize: 14, color: '#00D26A', marginTop: 8 }}>{f.price}</div>
                </GlassCard>
              ))}
            </div>
          )}

          {activeTab === 'emergency' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              {MOCK_DB.emergency.map(e => (
                <GlassCard key={e.name}>
                  <span style={{ fontSize: 10, background: 'rgba(255,77,109,0.15)', color: '#FF4D6D', padding: '3px 8px', borderRadius: 8 }}>{e.type}</span>
                  <h4 style={{ margin: '10px 0 6px', fontSize: 15 }}>{e.name}</h4>
                  <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 10 }}>{e.dist} away</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#00E5FF', fontSize: 14, fontWeight: 600 }}>
                    <Phone size={14} /> {e.phone}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {activeTab === 'planner' && (
            <GlassCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <Sparkles size={18} color="#7B61FF" />
                <h3 style={{ margin: 0, fontSize: 17 }}>AI itinerary planner</h3>
              </div>

              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 18 }}>
                <div style={{ flex: '1 1 160px' }}>
                  <label style={{ fontSize: 12, color: '#9CA3AF', display: 'block', marginBottom: 6 }}>Budget (₹)</label>
                  <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)', color: '#fff'
                  }} />
                </div>
                <div style={{ flex: '1 1 100px' }}>
                  <label style={{ fontSize: 12, color: '#9CA3AF', display: 'block', marginBottom: 6 }}>Days</label>
                  <input type="number" min={1} max={14} value={days} onChange={e => setDays(Number(e.target.value))} style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)', color: '#fff'
                  }} />
                </div>
              </div>

              <label style={{ fontSize: 12, color: '#9CA3AF', display: 'block', marginBottom: 8 }}>Interests</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
                {allInterests.map(i => (
                  <button key={i} onClick={() => toggleInterest(i)} style={{
                    padding: '7px 14px', borderRadius: 20, fontSize: 13,
                    background: interests.includes(i) ? 'rgba(0,229,255,0.18)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${interests.includes(i) ? '#00E5FF' : 'rgba(255,255,255,0.1)'}`,
                    color: interests.includes(i) ? '#00E5FF' : '#9CA3AF'
                  }}>
                    {i}
                  </button>
                ))}
              </div>

              <button onClick={generateItinerary} disabled={loadingItinerary} style={{
                background: 'linear-gradient(135deg, #00E5FF, #7B61FF)', border: 'none',
                borderRadius: 12, padding: '12px 24px', color: '#050816', fontWeight: 600,
                fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, opacity: loadingItinerary ? 0.7 : 1
              }}>
                {loadingItinerary ? <Loader2 size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={16} />}
                {loadingItinerary ? 'Generating itinerary...' : 'Generate itinerary'}
              </button>
              <style>{`@keyframes spin { from {transform: rotate(0deg);} to {transform: rotate(360deg);} }`}</style>

              {itineraryError && <div style={{ marginTop: 16, color: '#FF4D6D', fontSize: 14 }}>{itineraryError}</div>}

              {itinerary && (
                <div style={{ marginTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20 }}>
                  <p style={{ color: '#D1D5DB', fontSize: 14, marginBottom: 18 }}>{itinerary.summary}</p>
                  {itinerary.days?.map(d => (
                    <div key={d.day} style={{
                      background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 16, marginBottom: 12,
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontWeight: 600, color: '#00E5FF', fontSize: 14 }}>Day {d.day}</span>
                        <span style={{ fontSize: 13, color: '#9CA3AF' }}>~₹{d.estimatedCost}</span>
                      </div>
                      <div style={{ fontSize: 13, color: '#D1D5DB', lineHeight: 1.7 }}>
                        <div><b style={{ color: '#9CA3AF', fontWeight: 500 }}>Morning:</b> {d.morning}</div>
                        <div><b style={{ color: '#9CA3AF', fontWeight: 500 }}>Afternoon:</b> {d.afternoon}</div>
                        <div><b style={{ color: '#9CA3AF', fontWeight: 500 }}>Evening:</b> {d.evening}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ fontWeight: 600 }}>Total estimate</span>
                    <span style={{ fontWeight: 700, color: '#00D26A' }}>₹{itinerary.totalEstimate}</span>
                  </div>
                  {itinerary.tip && (
                    <div style={{ marginTop: 10, fontSize: 13, color: '#FFB547', display: 'flex', gap: 8 }}>
                      <span>💡</span> {itinerary.tip}
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          )}

          {activeTab === 'budget' && (
            <GlassCard>
              <h3 style={{ margin: '0 0 18px', fontSize: 17 }}>Budget calculator</h3>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 22 }}>
                <div style={{ flex: '1 1 100px' }}>
                  <label style={{ fontSize: 12, color: '#9CA3AF', display: 'block', marginBottom: 6 }}>People</label>
                  <input type="number" min={1} value={people} onChange={e => setPeople(Number(e.target.value))} style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)', color: '#fff'
                  }} />
                </div>
                <div style={{ flex: '1 1 100px' }}>
                  <label style={{ fontSize: 12, color: '#9CA3AF', display: 'block', marginBottom: 6 }}>Days</label>
                  <input type="number" min={1} value={days} onChange={e => setDays(Number(e.target.value))} style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)', color: '#fff'
                  }} />
                </div>
                <div style={{ flex: '1 1 160px' }}>
                  <label style={{ fontSize: 12, color: '#9CA3AF', display: 'block', marginBottom: 6 }}>Travel style</label>
                  <select value={style} onChange={e => setStyle(e.target.value)} style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)', color: '#fff'
                  }}>
                    {Object.keys(tierMultiplier).map(s => <option key={s} value={s} style={{ background: '#0A0E27' }}>{s}</option>)}
                  </select>
                </div>
              </div>

              {[
                ['Hotel', estHotel], ['Food', estFood], ['Transport', estTransport], ['Tickets & activities', estTickets]
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 14 }}>
                  <span style={{ color: '#9CA3AF' }}>{label}</span>
                  <span>₹{val.toLocaleString()}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0', fontSize: 17, fontWeight: 700 }}>
                <span>Estimated total</span>
                <span style={{ color: '#00D26A' }}>₹{estTotal.toLocaleString()}</span>
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
