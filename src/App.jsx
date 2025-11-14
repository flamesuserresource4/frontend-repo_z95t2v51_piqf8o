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

function Header({ user, onLogout }) {
  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-xl font-extrabold tracking-tight">GameHub</div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-gray-600">{user.name} ({user.role})</span>
              <button onClick={onLogout} className="px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300 text-sm">Logout</button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function AuthPanel({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const url = mode === 'login' ? '/auth/login' : '/auth/register'
      const res = await fetch(API_BASE + url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'login' ? { email, password } : { name, email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed')
      onLogin(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow rounded p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{mode === 'login' ? 'Login' : 'Register'}</h2>
        <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-sm text-blue-600 hover:underline">
          {mode === 'login' ? 'Create account' : 'Already have an account?'}
        </button>
      </div>
      <form onSubmit={submit} className="space-y-3">
        {mode === 'register' && (
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="w-full border rounded px-3 py-2" required />
        )}
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full border rounded px-3 py-2" required />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full border rounded px-3 py-2" required />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2">
          {loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Register')}
        </button>
      </form>
    </div>
  )
}

function GameCard({ game, onSelect }) {
  return (
    <div className="bg-white rounded shadow hover:shadow-md transition p-3 flex flex-col">
      {game.image_url && <img src={game.image_url} alt={game.title} className="h-40 w-full object-cover rounded" />}
      <div className="mt-2 font-semibold">{game.title}</div>
      <div className="text-sm text-gray-600 line-clamp-2">{game.description}</div>
      <div className="mt-2 flex items-center justify-between">
        <span className="font-bold">৳ {game.price}</span>
        <button onClick={() => onSelect(game)} className="px-3 py-1.5 text-sm bg-green-600 text-white rounded">Buy</button>
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
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search games" className="flex-1 border rounded px-3 py-2" />
        <select value={platform} onChange={e=>setPlatform(e.target.value)} className="border rounded px-3 py-2">
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
    <div className="max-w-md mx-auto bg-white rounded shadow p-6">
      <button onClick={onBack} className="text-sm text-blue-600 hover:underline">← Back</button>
      <h3 className="text-xl font-semibold mt-2 mb-4">Checkout - {game.title}</h3>
      <form onSubmit={placeOrder} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Platform</label>
          <select value={platform} onChange={e=>setPlatform(e.target.value)} className="w-full border rounded px-3 py-2" required>
            {game.platforms?.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Delivery Email</label>
          <input type="email" value={deliveryEmail} onChange={e=>setDeliveryEmail(e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Nagad Transaction ID</label>
          <input value={trx} onChange={e=>setTrx(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Txn ID" required />
        </div>
        <div className="text-sm text-gray-600 bg-gray-50 border rounded p-3">
          পেমেন্ট পদ্ধতি: নগদ Send Money. Txn ID দিয়ে অর্ডার কনফার্ম করুন। ২ ঘন্টার মধ্যে ইমেইলে গেম/কোড পাবেন।
        </div>
        <button disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2">
          {loading ? 'Placing...' : `Pay ৳${game.price} & Place Order`}
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
        <button className={`px-3 py-1.5 rounded ${tab==='games'?'bg-blue-600 text-white':'bg-gray-200'}`} onClick={()=>setTab('games')}>Games</button>
        <button className={`px-3 py-1.5 rounded ${tab==='orders'?'bg-blue-600 text-white':'bg-gray-200'}`} onClick={()=>setTab('orders')}>Orders</button>
      </div>
      {tab === 'games' && (
        <div className="grid md:grid-cols-2 gap-6">
          <form onSubmit={createGame} className="bg-white rounded shadow p-4 space-y-2">
            <h3 className="font-semibold mb-2">Add New Game</h3>
            <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Title" className="w-full border rounded px-3 py-2" required />
            <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder="Description" className="w-full border rounded px-3 py-2" />
            <input value={form.platforms} onChange={e=>setForm({...form, platforms:e.target.value})} placeholder="Platforms (comma separated)" className="w-full border rounded px-3 py-2" />
            <input value={form.categories} onChange={e=>setForm({...form, categories:e.target.value})} placeholder="Categories (comma separated)" className="w-full border rounded px-3 py-2" />
            <input type="number" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} placeholder="Price" className="w-full border rounded px-3 py-2" required />
            <input value={form.image_url} onChange={e=>setForm({...form, image_url:e.target.value})} placeholder="Image URL" className="w-full border rounded px-3 py-2" />
            {message && <div className="text-sm">{message}</div>}
            <button className="w-full bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2">Save</button>
          </form>
          <div className="grid sm:grid-cols-2 gap-3">
            {games.map(g => (
              <div key={g.id} className="border rounded p-2">
                <div className="font-medium">{g.title}</div>
                <div className="text-sm">৳ {g.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === 'orders' && (
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o.id} className="bg-white rounded shadow p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{o.delivery_email} • ৳{o.amount}</div>
                <div className="text-sm text-gray-600">Txn: {o.transaction_id} • Status: {o.status}</div>
              </div>
              {o.status !== 'completed' && (
                <button onClick={()=>markCompleted(o.id)} className="px-3 py-1.5 rounded bg-blue-600 text-white">Mark Completed</button>
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header user={user} onLogout={logout} />

      {!user && (
        <div className="py-10">
          <div className="max-w-3xl mx-auto text-center mb-6">
            <h1 className="text-3xl font-extrabold">গেম স্টোর</h1>
            <p className="text-gray-600">PC ও মোবাইল সব ধরনের গেম। পেমেন্ট শুধুমাত্র নগদ Send Money।</p>
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
          <AdminPanel token={token} />
        </div>
      )}
    </div>
  )
}
