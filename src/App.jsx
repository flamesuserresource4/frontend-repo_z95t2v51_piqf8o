import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''

function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })
  const login = (data) => {
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('user', JSON.stringify({ email: data.email, role: data.role, name: data.name }))
    setToken(data.access_token)
    setUser({ email: data.email, role: data.role, name: data.name })
  }
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken('')
    setUser(null)
  }
  return { token, user, login, logout }
}

function BrandLogo() {
  return (
    <div className="flex items-center gap-2 select-none">
      <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-rose-500 via-fuchsia-500 to-indigo-500 shadow-lg shadow-fuchsia-300/40 grid place-items-center text-white font-black">RS</div>
      <div className="font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
        RS GAME GHOR
      </div>
    </div>
  )
}

function Header({ user, onLogout }) {
  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <BrandLogo />
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-gray-600 hidden sm:block">{user.name} ({user.role})</span>
              <button onClick={onLogout} className="px-3 py-1.5 rounded bg-gray-900 text-white hover:bg-gray-700 text-sm">Logout</button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function AuthPanel({ onLogin }) {
  const [mode, setMode] = useState('login') // login | register | forgot | reset
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [devCode, setDevCode] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setInfo('')
    setDevCode('')
    try {
      if (mode === 'login' || mode === 'register') {
        const url = mode === 'login' ? '/auth/login' : '/auth/register'
        const body = mode === 'login' ? { email, password } : { name, email, password }
        const res = await fetch(API_BASE + url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || 'Failed')
        onLogin(data)
      } else if (mode === 'forgot') {
        const res = await fetch(API_BASE + '/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || 'Failed')
        setInfo('একটা কোড ইমেইলে পাঠানো হয়েছে। ১৫ মিনিটের মধ্যে ব্যবহার করুন।')
        if (data.debug_code) setDevCode(String(data.debug_code))
        setMode('reset')
      } else if (mode === 'reset') {
        if (password.length < 6) throw new Error('Password must be at least 6 characters')
        const res = await fetch(API_BASE + '/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code, new_password: password })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || 'Failed')
        setInfo('পাসওয়ার্ড রিসেট হয়েছে। এখন লগইন করুন।')
        setMode('login')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 blur-3xl opacity-70 bg-[radial-gradient(circle_at_20%_0%,rgba(244,63,94,0.35),transparent_40%),radial-gradient(circle_at_100%_40%,rgba(217,70,239,0.25),transparent_35%),radial-gradient(circle_at_0%_100%,rgba(99,102,241,0.25),transparent_40%)]" />
      <div className="relative max-w-3xl mx-auto">
        <div className="rounded-2xl p-1 bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 shadow-xl">
          <div className="rounded-2xl bg-white/90 backdrop-blur p-8 md:p-10 grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <BrandLogo />
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-extrabold">
                  {mode === 'login' && 'Welcome back!'}
                  {mode === 'register' && 'Create your account'}
                  {mode === 'forgot' && 'Forgot password?'}
                  {mode === 'reset' && 'Reset password'}
                </h2>
                <p className="text-sm text-gray-600">গেম কিনুন নগদ Send Money দিয়ে। অর্ডার করলে ২ ঘন্টার মধ্যে ইমেইলে পাবেন।</p>
              </div>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• শুধুমাত্র Nagad Send Money</li>
                <li>• Transaction ID আবশ্যক</li>
                <li>• Delivery Email অবশ্যই ঠিক দিন</li>
              </ul>
              {devCode && (
                <div className="text-xs text-fuchsia-700 bg-fuchsia-50 border border-fuchsia-200 rounded p-2">
                  Dev: Reset code {devCode}
                </div>
              )}
            </div>
            <form onSubmit={submit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Full name</label>
                  <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" className="w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-fuchsia-500" required />
                </div>
              )}
              {(mode === 'login' || mode === 'register' || mode === 'forgot' || mode === 'reset') && (
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-fuchsia-500" required />
                </div>
              )}
              {(mode === 'login' || mode === 'register') && (
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" className="w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-fuchsia-500" required />
                </div>
              )}
              {mode === 'reset' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Reset code</label>
                    <input value={code} onChange={e=>setCode(e.target.value)} placeholder="6-digit code" className="w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-fuchsia-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">New password</label>
                    <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-fuchsia-500" required />
                  </div>
                </>
              )}
              {mode === 'forgot' && (
                <div className="text-sm text-gray-600">আপনার ইমেইল দিন। আমরা একটি ৬-সংখ্যার কোড পাঠাব।</div>
              )}

              {error && <div className="text-red-600 text-sm">{error}</div>}
              {info && <div className="text-green-700 text-sm">{info}</div>}

              <button disabled={loading} className="w-full rounded-lg py-2.5 text-white font-medium bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 hover:from-rose-600 hover:via-fuchsia-600 hover:to-indigo-600 shadow">
                {loading ? 'Please wait…' : (
                  mode === 'login' ? 'Login' :
                  mode === 'register' ? 'Register' :
                  mode === 'forgot' ? 'Send reset code' :
                  'Reset password'
                )}
              </button>

              {mode !== 'login' && (
                <button type="button" onClick={() => setMode('login')} className="w-full text-center text-sm text-fuchsia-600 hover:underline">
                  Back to login
                </button>
              )}
              {mode === 'login' && (
                <div className="flex flex-col gap-1">
                  <button type="button" onClick={() => setMode('register')} className="w-full text-center text-sm text-fuchsia-600 hover:underline">
                    Create a new account
                  </button>
                  <button type="button" onClick={() => setMode('forgot')} className="w-full text-center text-sm text-fuchsia-600 hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

function GameCard({ game, onSelect }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm hover:shadow-md transition p-3 flex flex-col">
      {game.image_url && <img src={game.image_url} alt={game.title} className="h-44 w-full object-cover rounded-lg" />}
      <div className="mt-3 font-semibold line-clamp-1">{game.title}</div>
      <div className="text-sm text-gray-600 line-clamp-2">{game.description}</div>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-bold">৳ {game.price}</span>
        <button onClick={() => onSelect(game)} className="px-3 py-1.5 text-sm bg-gray-900 hover:bg-gray-700 text-white rounded-lg">Buy</button>
      </div>
    </div>
  )
}

function GameList({ onSelect }) {
  const [games, setGames] = useState([])
  const [q, setQ] = useState('')
  const [platform, setPlatform] = useState('')
  useEffect(() => {
    const fetchGames = async () => {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (platform) params.set('platform', platform)
      const res = await fetch(API_BASE + '/games?' + params.toString())
      const data = await res.json()
      setGames(data)
    }
    fetchGames()
  }, [q, platform])
  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex items-center gap-3 mb-4">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search games" className="flex-1 border rounded-lg px-3 py-2.5" />
        <select value={platform} onChange={e=>setPlatform(e.target.value)} className="border rounded-lg px-3 py-2.5">
          <option value="">All Platforms</option>
          <option>PC</option>
          <option>Android</option>
          <option>iOS</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {games.map(g => <GameCard key={g.id} game={g} onSelect={onSelect} />)}
      </div>
    </div>
  )
}

function Checkout({ game, token, onBack }) {
  const [platform, setPlatform] = useState(game.platforms?.[0] || '')
  const [deliveryEmail, setDeliveryEmail] = useState('')
  const [trx, setTrx] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const placeOrder = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    try {
      const res = await fetch(API_BASE + '/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          game_id: game.id,
          platform,
          amount: game.price,
          transaction_id: trx,
          delivery_email: deliveryEmail
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed')
      setMsg('অর্ডার সফল হয়েছে! ২ ঘন্টার মধ্যে ইমেইলে পেয়ে যাবেন।')
    } catch (err) {
      setMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl border shadow p-6">
      <button onClick={onBack} className="text-sm text-fuchsia-600 hover:underline">← Back</button>
      <h3 className="text-xl font-semibold mt-2 mb-4">Checkout - {game.title}</h3>
      <form onSubmit={placeOrder} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Platform</label>
          <select value={platform} onChange={e=>setPlatform(e.target.value)} className="w-full border rounded-lg px-3 py-2.5" required>
            {game.platforms?.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Delivery Email</label>
          <input type="email" value={deliveryEmail} onChange={e=>setDeliveryEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2.5" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Nagad Transaction ID</label>
          <input value={trx} onChange={e=>setTrx(e.target.value)} className="w-full border rounded-lg px-3 py-2.5" placeholder="Txn ID" required />
        </div>
        <div className="text-sm text-gray-700 bg-gray-50 border rounded-lg p-3">
          পেমেন্ট: নগদ Send Money. Txn ID দিন। ২ ঘন্টার মধ্যে ইমেইলে গেম/কোড পাবেন।
        </div>
        <button disabled={loading} className="w-full bg-gray-900 hover:bg-gray-700 text-white rounded-lg px-4 py-2.5">
          {loading ? 'Placing…' : `Pay ৳${game.price} & Place Order`}
        </button>
        {msg && <div className="text-center text-sm mt-2">{msg}</div>}
      </form>
    </div>
  )
}

function AdminPanel({ token }) {
  const [tab, setTab] = useState('games')
  const [games, setGames] = useState([])
  const [form, setForm] = useState({ title: '', description: '', platforms: 'PC,Android', categories: 'Action', price: 0, image_url: '' })
  const [message, setMessage] = useState('')
  const authHeader = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }

  const loadGames = async () => {
    const res = await fetch(API_BASE + '/games')
    const data = await res.json()
    setGames(data)
  }
  useEffect(() => { loadGames() }, [])

  const createGame = async (e) => {
    e.preventDefault()
    setMessage('')
    const payload = {
      ...form,
      platforms: form.platforms.split(',').map(s=>s.trim()).filter(Boolean),
      categories: form.categories.split(',').map(s=>s.trim()).filter(Boolean),
      price: parseFloat(form.price)
    }
    const res = await fetch(API_BASE + '/admin/games', { method: 'POST', headers: authHeader, body: JSON.stringify(payload) })
    const data = await res.json()
    if (!res.ok) { setMessage(data.detail || 'Failed'); return }
    setMessage('Game added')
    setForm({ title: '', description: '', platforms: 'PC,Android', categories: 'Action', price: 0, image_url: '' })
    loadGames()
  }

  const [orders, setOrders] = useState([])
  const loadOrders = async () => {
    const res = await fetch(API_BASE + '/admin/orders', { headers: { 'Authorization': `Bearer ${token}` } })
    const data = await res.json()
    setOrders(data)
  }
  useEffect(() => { if (tab==='orders') loadOrders() }, [tab])

  const markCompleted = async (id) => {
    const res = await fetch(API_BASE + `/admin/orders/${id}`, { method: 'PATCH', headers: authHeader, body: JSON.stringify({ status: 'completed' }) })
    if (res.ok) loadOrders()
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex gap-3 mb-4">
        <button className={`px-3 py-1.5 rounded-lg ${tab==='games'?'bg-gray-900 text-white':'bg-gray-200'}`} onClick={()=>setTab('games')}>Games</button>
        <button className={`px-3 py-1.5 rounded-lg ${tab==='orders'?'bg-gray-900 text-white':'bg-gray-200'}`} onClick={()=>setTab('orders')}>Orders</button>
      </div>
      {tab === 'games' && (
        <div className="grid md:grid-cols-2 gap-6">
          <form onSubmit={createGame} className="bg-white rounded-xl border shadow p-4 space-y-2">
            <h3 className="font-semibold mb-2">Add New Game</h3>
            <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Title" className="w-full border rounded-lg px-3 py-2.5" required />
            <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder="Description" className="w-full border rounded-lg px-3 py-2.5" />
            <input value={form.platforms} onChange={e=>setForm({...form, platforms:e.target.value})} placeholder="Platforms (comma separated)" className="w-full border rounded-lg px-3 py-2.5" />
            <input value={form.categories} onChange={e=>setForm({...form, categories:e.target.value})} placeholder="Categories (comma separated)" className="w-full border rounded-lg px-3 py-2.5" />
            <input type="number" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} placeholder="Price" className="w-full border rounded-lg px-3 py-2.5" required />
            <input value={form.image_url} onChange={e=>setForm({...form, image_url:e.target.value})} placeholder="Image URL" className="w-full border rounded-lg px-3 py-2.5" />
            {message && <div className="text-sm">{message}</div>}
            <button className="w-full bg-gray-900 hover:bg-gray-700 text-white rounded-lg px-4 py-2.5">Save</button>
          </form>
          <div className="grid sm:grid-cols-2 gap-3">
            {games.map(g => (
              <div key={g.id} className="border rounded-xl p-3">
                <div className="font-medium line-clamp-1">{g.title}</div>
                <div className="text-sm">৳ {g.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === 'orders' && (
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o.id} className="bg-white rounded-xl border shadow p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{o.delivery_email} • ৳{o.amount}</div>
                <div className="text-sm text-gray-600">Txn: {o.transaction_id} • Status: {o.status}</div>
              </div>
              {o.status !== 'completed' && (
                <button onClick={()=>markCompleted(o.id)} className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-700 text-white">Mark Completed</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function App() {
  const { token, user, login, logout } = useAuth()
  const [selectedGame, setSelectedGame] = useState(null)
  const isAdmin = user?.role === 'admin'

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header user={user} onLogout={logout} />

      {!user && (
        <div className="py-10">
          <div className="max-w-5xl mx-auto text-center mb-8 px-4">
            <h1 className="text-4xl font-extrabold tracking-tight">সব গেম একসাথে — RS GAME GHOR</h1>
            <p className="text-gray-600 mt-2">PC ও মোবাইল সব ধরনের গেম। পেমেন্ট শুধুমাত্র নগদ Send Money। Transaction ID দিন, ২ ঘন্টার মধ্যে ইমেইলে ডেলিভারি।</p>
          </div>
          <AuthPanel onLogin={login} />
        </div>
      )}

      {user && !isAdmin && (
        <div className="py-8 space-y-6">
          {!selectedGame ? (
            <GameList onSelect={setSelectedGame} />
          ) : (
            <Checkout game={selectedGame} token={token} onBack={() => setSelectedGame(null)} />
          )}
        </div>
      )}

      {user && isAdmin && (
        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4 mb-4">
            <h2 className="text-2xl font-bold">Admin Panel</h2>
            <p className="text-sm text-gray-600">গেম, দাম, ছবি ম্যানেজ করুন; অর্ডার কমপ্লিট করুন।</p>
          </div>
          <AdminPanel token={token} />
        </div>
      )}
    </div>
  )
}
