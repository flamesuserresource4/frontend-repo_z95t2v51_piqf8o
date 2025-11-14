import { useEffect, useState } from 'react'

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
  const [mode, setMode] = useState('login') // login | register
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
      const body = mode === 'login' ? { email, password } : { name, email, password }
      const res = await fetch(API_BASE + url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
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
                </h2>
                <p className="text-sm text-gray-600">গেম কিনুন আপনার পছন্দের পেমেন্ট মেথডে। অর্ডার করলে ২ ঘন্টার মধ্যে ইমেইলে পাবেন।</p>
              </div>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• bKash / Nagad সমর্থিত (অ্যাডমিন যেভাবে সেট করবেন)</li>
                <li>• Transaction ID আবশ্যক</li>
                <li>• Delivery Email অবশ্যই ঠিক দিন</li>
              </ul>
            </div>
            <form onSubmit={submit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Full name</label>
                  <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" className="w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-fuchsia-500" required />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-fuchsia-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" className="w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-fuchsia-500" required />
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <button disabled={loading} className="w-full rounded-lg py-2.5 text-white font-medium bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 hover:from-rose-600 hover:via-fuchsia-600 hover:to-indigo-600 shadow">
                {loading ? 'Please wait…' : (
                  mode === 'login' ? 'Login' : 'Register'
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
      <div className="mt-2 flex flex-wrap gap-1">
        {(game.payment_methods||[]).map(m => (
          <span key={m} className="text-[11px] px-2 py-0.5 rounded bg-gray-100 border">{m}</span>
        ))}
        {(game.payment_modes||[]).map(m => (
          <span key={m} className="text-[11px] px-2 py-0.5 rounded bg-gray-50 border border-dashed">{m}</span>
        ))}
      </div>
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
  const [paymentMethod, setPaymentMethod] = useState((game.payment_methods && game.payment_methods[0]) || 'Nagad')
  const [paymentMode, setPaymentMode] = useState((game.payment_modes && game.payment_modes[0]) || 'Send Money')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(()=>{
    // Ensure current selections are valid if game props change
    if (game.payment_methods?.length && !game.payment_methods.includes(paymentMethod)) {
      setPaymentMethod(game.payment_methods[0])
    }
    if (game.payment_modes?.length && !game.payment_modes.includes(paymentMode)) {
      setPaymentMode(game.payment_modes[0])
    }
  }, [game])

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
          delivery_email: deliveryEmail,
          payment_method: paymentMethod,
          payment_mode: paymentMode
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

  const methodList = game.payment_methods?.length ? game.payment_methods : ['Nagad']
  const modeList = game.payment_modes?.length ? game.payment_modes : ['Send Money']

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Payment Method</label>
            <select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)} className="w-full border rounded-lg px-3 py-2.5">
              {methodList.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Payment Mode</label>
            <select value={paymentMode} onChange={e=>setPaymentMode(e.target.value)} className="w-full border rounded-lg px-3 py-2.5">
              {modeList.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Delivery Email</label>
          <input type="email" value={deliveryEmail} onChange={e=>setDeliveryEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2.5" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Transaction ID ({paymentMethod}{paymentMode ? ` • ${paymentMode}` : ''})</label>
          <input value={trx} onChange={e=>setTrx(e.target.value)} className="w-full border rounded-lg px-3 py-2.5" placeholder="Txn ID" required />
        </div>
        <div className="text-sm text-gray-700 bg-gray-50 border rounded-lg p-3">
          পেমেন্ট: {paymentMethod} {paymentMode ? `(${paymentMode})` : ''}. Txn ID দিন। ২ ঘন্টার মধ্যে ইমেইলে গেম/কোড পাবেন।
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
  const [editingId, setEditingId] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    platforms: 'PC,Android',
    categories: 'Action',
    price: 0,
    image_url: '',
    is_active: true,
    payment_methods: ['Nagad'],
    payment_modes: ['Send Money']
  })
  const [message, setMessage] = useState('')
  const [imgUploading, setImgUploading] = useState(false)

  const authJson = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  const authOnly = { 'Authorization': `Bearer ${token}` }

  const loadGames = async () => {
    const res = await fetch(API_BASE + '/admin/games', { headers: authOnly })
    const data = await res.json()
    setGames(data)
  }
  useEffect(() => { loadGames() }, [])

  const handleUpload = async (file) => {
    if (!file) return
    setImgUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(API_BASE + '/admin/upload-image', { method: 'POST', headers: authOnly, body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Upload failed')
      setForm(prev => ({ ...prev, image_url: data.url }))
    } catch (e) {
      setMessage(e.message)
    } finally {
      setImgUploading(false)
    }
  }

  const resetForm = () => {
    setEditingId('')
    setForm({ title: '', description: '', platforms: 'PC,Android', categories: 'Action', price: 0, image_url: '', is_active: true, payment_methods: ['Nagad'], payment_modes: ['Send Money'] })
  }

  const toggleArrayValue = (key, value) => {
    setForm(prev => {
      const arr = new Set(prev[key] || [])
      if (arr.has(value)) arr.delete(value); else arr.add(value)
      return { ...prev, [key]: Array.from(arr) }
    })
  }

  const submitGame = async (e) => {
    e.preventDefault()
    setMessage('')
    const methods = (form.payment_methods || []).filter(Boolean)
    const modes = (form.payment_modes || []).filter(Boolean)
    if (methods.length === 0) { setMessage('Select at least one payment method'); return }
    if (modes.length === 0) { setMessage('Select at least one payment mode'); return }

    const payload = {
      title: form.title,
      description: form.description,
      platforms: form.platforms.split(',').map(s=>s.trim()).filter(Boolean),
      categories: form.categories.split(',').map(s=>s.trim()).filter(Boolean),
      price: parseFloat(form.price),
      image_url: form.image_url,
      is_active: !!form.is_active,
      payment_methods: methods,
      payment_modes: modes,
    }
    const url = editingId ? `/admin/games/${editingId}` : '/admin/games'
    const method = editingId ? 'PUT' : 'POST'
    const res = await fetch(API_BASE + url, { method, headers: authJson, body: JSON.stringify(payload) })
    const data = await res.json()
    if (!res.ok) { setMessage(data.detail || 'Failed'); return }
    setMessage(editingId ? 'Game updated' : 'Game added')
    resetForm()
    loadGames()
  }

  const editGame = (g) => {
    setEditingId(g.id)
    setForm({
      title: g.title || '',
      description: g.description || '',
      platforms: (g.platforms || []).join(','),
      categories: (g.categories || []).join(','),
      price: g.price || 0,
      image_url: g.image_url || '',
      is_active: g.is_active,
      payment_methods: g.payment_methods && g.payment_methods.length ? g.payment_methods : ['Nagad'],
      payment_modes: g.payment_modes && g.payment_modes.length ? g.payment_modes : ['Send Money'],
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteGame = async (id) => {
    if (!confirm('Delete this game?')) return
    const res = await fetch(API_BASE + `/admin/games/${id}`, { method: 'DELETE', headers: authOnly })
    if (res.ok) {
      setMessage('Game deleted')
      loadGames()
      if (editingId === id) resetForm()
    }
  }

  const toggleActive = async (id) => {
    const res = await fetch(API_BASE + `/admin/games/${id}/toggle`, { method: 'PATCH', headers: authOnly })
    if (res.ok) loadGames()
  }

  // Orders
  const [orders, setOrders] = useState([])
  const [orderStatus, setOrderStatus] = useState('')
  const [orderQ, setOrderQ] = useState('')
  const loadOrders = async () => {
    const params = new URLSearchParams()
    if (orderStatus) params.set('status', orderStatus)
    if (orderQ) params.set('q', orderQ)
    const res = await fetch(API_BASE + '/admin/orders' + (params.toString() ? `?${params.toString()}` : ''), { headers: authOnly })
    const data = await res.json()
    setOrders(data)
  }
  useEffect(() => { if (tab==='orders') loadOrders() }, [tab])

  const markStatus = async (id, status) => {
    const res = await fetch(API_BASE + `/admin/orders/${id}`, { method: 'PATCH', headers: authJson, body: JSON.stringify({ status }) })
    if (res.ok) loadOrders()
  }

  // Users
  const [users, setUsers] = useState([])
  const loadUsers = async () => {
    const res = await fetch(API_BASE + '/admin/users', { headers: authOnly })
    const data = await res.json()
    setUsers(data)
  }
  useEffect(() => { if (tab==='users') loadUsers() }, [tab])

  const updateUser = async (id, updates) => {
    const res = await fetch(API_BASE + `/admin/users/${id}`, { method: 'PATCH', headers: authJson, body: JSON.stringify(updates) })
    if (res.ok) loadUsers()
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex gap-3 mb-4">
        <button className={`px-3 py-1.5 rounded-lg ${tab==='games'?'bg-gray-900 text-white':'bg-gray-200'}`} onClick={()=>setTab('games')}>Games</button>
        <button className={`px-3 py-1.5 rounded-lg ${tab==='orders'?'bg-gray-900 text-white':'bg-gray-200'}`} onClick={()=>setTab('orders')}>Orders</button>
        <button className={`px-3 py-1.5 rounded-lg ${tab==='users'?'bg-gray-900 text-white':'bg-gray-200'}`} onClick={()=>setTab('users')}>Users</button>
      </div>

      {tab === 'games' && (
        <div className="grid md:grid-cols-2 gap-6">
          <form onSubmit={submitGame} className="bg-white rounded-xl border shadow p-4 space-y-2">
            <h3 className="font-semibold mb-2">{editingId ? 'Edit Game' : 'Add New Game'}</h3>
            <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Title" className="w-full border rounded-lg px-3 py-2.5" required />
            <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder="Description" className="w-full border rounded-lg px-3 py-2.5" />
            <input value={form.platforms} onChange={e=>setForm({...form, platforms:e.target.value})} placeholder="Platforms (comma separated)" className="w-full border rounded-lg px-3 py-2.5" />
            <input value={form.categories} onChange={e=>setForm({...form, categories:e.target.value})} placeholder="Categories (comma separated)" className="w-full border rounded-lg px-3 py-2.5" />
            <input type="number" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} placeholder="Price" className="w-full border rounded-lg px-3 py-2.5" required />

            <div className="flex items-center gap-3">
              <input value={form.image_url} onChange={e=>setForm({...form, image_url:e.target.value})} placeholder="Image URL" className="flex-1 border rounded-lg px-3 py-2.5" />
              <label className="inline-flex items-center gap-2 text-sm">
                <span className="px-3 py-2 border rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">{imgUploading ? 'Uploading…' : 'Upload'}</span>
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e)=>handleUpload(e.target.files?.[0])} />
              </label>
            </div>
            {form.image_url && <img src={form.image_url} alt="preview" className="h-28 w-full object-cover rounded-lg border" />}

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="border rounded-lg p-3">
                <div className="font-medium text-sm mb-2">Payment Methods</div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.payment_methods?.includes('Nagad')||false} onChange={()=>toggleArrayValue('payment_methods','Nagad')} /> Nagad
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.payment_methods?.includes('bKash')||false} onChange={()=>toggleArrayValue('payment_methods','bKash')} /> bKash
                </label>
              </div>
              <div className="border rounded-lg p-3">
                <div className="font-medium text-sm mb-2">Payment Modes</div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.payment_modes?.includes('Send Money')||false} onChange={()=>toggleArrayValue('payment_modes','Send Money')} /> Send Money
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.payment_modes?.includes('Cash Out')||false} onChange={()=>toggleArrayValue('payment_modes','Cash Out')} /> Cash Out
                </label>
              </div>
            </div>

            <label className="inline-flex items-center gap-2 text-sm mt-2">
              <input type="checkbox" checked={!!form.is_active} onChange={e=>setForm({...form, is_active:e.target.checked})} /> Active
            </label>

            {message && <div className="text-sm">{message}</div>}
            <div className="flex gap-2">
              <button className="flex-1 bg-gray-900 hover:bg-gray-700 text-white rounded-lg px-4 py-2.5">{editingId ? 'Update' : 'Save'}</button>
              {editingId && <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-lg border">Cancel</button>}
            </div>
          </form>

          <div className="grid sm:grid-cols-2 gap-3">
            {games.map(g => (
              <div key={g.id} className="border rounded-xl p-3 flex gap-3">
                {g.image_url && <img src={g.image_url} alt={g.title} className="h-16 w-16 object-cover rounded" />}
                <div className="flex-1">
                  <div className="font-medium line-clamp-1">{g.title}</div>
                  <div className="text-sm">৳ {g.price} • <span className={g.is_active? 'text-green-600':'text-red-600'}>{g.is_active? 'Active':'Inactive'}</span></div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(g.payment_methods||[]).map(m => <span key={m} className="text-[11px] px-2 py-0.5 rounded bg-gray-100 border">{m}</span>)}
                    {(g.payment_modes||[]).map(m => <span key={m} className="text-[11px] px-2 py-0.5 rounded bg-gray-50 border border-dashed">{m}</span>)}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button onClick={()=>editGame(g)} className="px-2 py-1 text-xs rounded bg-indigo-600 text-white">Edit</button>
                    <button onClick={()=>toggleActive(g.id)} className="px-2 py-1 text-xs rounded bg-gray-200">Toggle</button>
                    <button onClick={()=>deleteGame(g.id)} className="px-2 py-1 text-xs rounded bg-red-600 text-white">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <select value={orderStatus} onChange={e=>setOrderStatus(e.target.value)} className="border rounded px-3 py-2">
              <option value="">All</option>
              <option>pending</option>
              <option>completed</option>
              <option>cancelled</option>
            </select>
            <input value={orderQ} onChange={e=>setOrderQ(e.target.value)} placeholder="Search email/txn" className="border rounded px-3 py-2 flex-1" />
            <button onClick={loadOrders} className="px-3 py-2 rounded bg-gray-900 text-white">Filter</button>
          </div>
          {orders.map(o => (
            <div key={o.id} className="bg-white rounded-xl border shadow p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{o.delivery_email} • ৳{o.amount}</div>
                <div className="text-sm text-gray-600">Txn: {o.transaction_id} • Status: {o.status} • Platform: {o.platform} • {o.payment_method}{o.payment_mode ? ` (${o.payment_mode})` : ''}</div>
              </div>
              <div className="flex gap-2">
                {o.status !== 'completed' && (
                  <button onClick={()=>markStatus(o.id, 'completed')} className="px-3 py-1.5 rounded-lg bg-green-600 text-white">Mark Completed</button>
                )}
                {o.status !== 'cancelled' && (
                  <button onClick={()=>markStatus(o.id, 'cancelled')} className="px-3 py-1.5 rounded-lg bg-red-600 text-white">Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-3">
          {users.map(u => (
            <div key={u.id} className="bg-white rounded-xl border shadow p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{u.name} <span className="text-xs text-gray-500">({u.email})</span></div>
                <div className="text-sm text-gray-600">Role: {u.role} • Active: {u.is_active ? 'Yes' : 'No'}</div>
              </div>
              <div className="flex items-center gap-2">
                <select value={u.role} onChange={(e)=>updateUser(u.id, { role: e.target.value })} className="border rounded px-2 py-1 text-sm">
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
                <button onClick={()=>updateUser(u.id, { is_active: !u.is_active })} className="px-3 py-1.5 rounded bg-gray-200 text-sm">{u.is_active ? 'Disable' : 'Enable'}</button>
              </div>
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
            <p className="text-gray-600 mt-2">PC ও মোবাইল সব ধরনের গেম। পেমেন্ট bKash/Nagad, Send Money বা Cash Out — Transaction ID দিন, ২ ঘন্টার মধ্যে ইমেইলে ডেলিভারি।</p>
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
            <p className="text-sm text-gray-600">গেম, ইমেজ, পেমেন্ট মেথড/মোড, অর্ডার ফিল্টার, ইউজার কন্ট্রোল—সব একসাথে।</p>
          </div>
          <AdminPanel token={token} />
        </div>
      )}
    </div>
  )
}
