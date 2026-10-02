/* GharFix web app
 * One-page app on top of the original GharFix design.
 * - SERVICES: catalogue data for the 8 service categories
 * - API: the "backend". Same interface a server would have (signup, login, bookings, tickets),
 *   stored in the visitor's browser (localStorage) so the site runs on any static host.
 *   To go multi-device, swap these functions for calls to Supabase / Firebase / your own API.
 * - Views: home, all services, service detail + booking, bookings, account, support.
 */
(function () {
  'use strict';

  // ------------------------------------------------------------------ helpers
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rupee = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const icon = (name, cls) => `<span class="material-symbols-outlined ${cls || ''}" aria-hidden="true">${name}</span>`;
  const fmtDate = (s) => new Date(s + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const slotLabel = (h) => { const ap = h >= 12 ? 'PM' : 'AM'; const hh = ((h + 11) % 12) + 1; return `${hh}:00 ${ap}`; };

  // ------------------------------------------------------------------ catalogue
  const SERVICES = [
    { id: 'e-appliance', label: 'E-Appliance', title: 'Smart Setup & Repair', icon: 'settings_input_component', img: 'images/services/e-appliance.jpg', rating: 4.8, reviews: 2140, warranty: '30-day repair warranty',
      tagline: 'AC, washing machine, fridge, chimney and more, fixed at home.',
      about: 'Certified appliance technicians diagnose the problem first, share the price before starting, and carry common spare parts so most repairs are done in one visit.',
      included: ['Free diagnosis with any repair', 'Genuine spare parts with bill', 'Upfront price before work starts', 'Clean-up after the job'],
      items: [
        { id: 'ac-service', name: 'AC service (split / window)', desc: 'Filter, coil and drain cleaning, gas pressure check', price: 599, mins: 60 },
        { id: 'ac-gas', name: 'AC gas refill', desc: 'Leak check and full refill', price: 2499, mins: 90 },
        { id: 'wm-repair', name: 'Washing machine repair', desc: 'Not spinning, leaking, noise or error codes', price: 449, mins: 60 },
        { id: 'fridge-repair', name: 'Refrigerator repair', desc: 'Not cooling, ice build-up, noise', price: 499, mins: 60 },
        { id: 'micro-repair', name: 'Microwave / oven repair', desc: 'Not heating, sparking, panel issues', price: 399, mins: 45 },
        { id: 'chimney', name: 'Chimney deep cleaning', desc: 'Filter and motor degreasing', price: 799, mins: 75 },
        { id: 'tv-mount', name: 'TV wall mounting', desc: 'Up to 55 inch, bracket included', price: 499, mins: 45 }
      ],
      faqs: [['Do I pay for diagnosis?', 'No, diagnosis is free if you go ahead with the repair. Otherwise a ₹199 visit fee applies.'], ['Are spare parts extra?', 'Yes. The technician shows you the part and price before using it, and you get a bill.']] },
    { id: 'electrician', label: 'Electrician', title: 'Expert Electrical Care', icon: 'bolt', img: 'images/services/electrician.jpg', rating: 4.8, reviews: 3015, warranty: '30-day service warranty',
      tagline: 'Switches, fans, lights, wiring and inverters, done safely.',
      about: 'Licensed electricians who follow safety checks on every job, from a single switch to a full-home wiring inspection.',
      included: ['Safety check of the work area', 'Insulated tools and testers', 'Upfront pricing', 'Old fittings removed on request'],
      items: [
        { id: 'switch', name: 'Switch / socket replacement', desc: 'Per point, material extra', price: 299, mins: 30 },
        { id: 'fan', name: 'Ceiling fan installation', desc: 'Including regulator fitting', price: 349, mins: 45 },
        { id: 'light', name: 'Light fixture installation', desc: 'Panel, pendant or wall light', price: 299, mins: 30 },
        { id: 'mcb', name: 'MCB / fuse repair', desc: 'Tripping or burnt fuse', price: 399, mins: 45 },
        { id: 'inverter', name: 'Inverter installation', desc: 'With battery connection', price: 599, mins: 60 },
        { id: 'wiring-check', name: 'Full-home wiring check', desc: 'Up to 3 BHK, written report', price: 999, mins: 120 }
      ],
      faqs: [['Do you bring the switches and wires?', 'The electrician can buy them for you at MRP, or use material you already have.'], ['Is the work insured?', 'Yes, every job is covered by our 30-day service warranty.']] },
    { id: 'plumber', label: 'Plumber', title: 'Modern Plumbing', icon: 'plumbing', img: 'images/services/plumber.jpg', rating: 4.7, reviews: 2588, warranty: '30-day leak-free warranty',
      tagline: 'Leaks, blockages, taps, toilets and tanks, sorted.',
      about: 'Experienced plumbers who find the source of a leak instead of patching the symptom, with a leak-free warranty on the work.',
      included: ['Leak source detection', 'Standard fittings and sealant', 'Water-pressure test after work', 'Mess-free clean-up'],
      items: [
        { id: 'tap', name: 'Tap repair / replacement', desc: 'Kitchen or bathroom tap', price: 399, mins: 30 },
        { id: 'leak', name: 'Pipe leak fixing', desc: 'Exposed pipes, joints and connections', price: 449, mins: 45 },
        { id: 'block', name: 'Drain blockage removal', desc: 'Sink, wash basin or floor drain', price: 499, mins: 45 },
        { id: 'toilet', name: 'Toilet / flush repair', desc: 'Flush tank, seat or leakage', price: 549, mins: 60 },
        { id: 'tank', name: 'Water tank cleaning', desc: 'Up to 1,000 litres', price: 999, mins: 90 },
        { id: 'geyser', name: 'Geyser installation', desc: 'Wall-mounted, up to 25 litres', price: 699, mins: 60 }
      ],
      faqs: [['What if the leak comes back?', 'It is covered for 30 days. We send a plumber again at no cost.'], ['Do you fix concealed pipe leaks?', 'We detect them and give a quote, as wall work may be needed.']] },
    { id: 'carpenter', label: 'Carpenter', title: 'Custom Woodwork', icon: 'carpenter', img: 'images/services/carpenter.jpg', rating: 4.8, reviews: 1762, warranty: '60-day workmanship warranty',
      tagline: 'Repairs, assembly, hinges, locks and custom shelves.',
      about: 'Skilled carpenters for everyday fixes and small custom builds, using branded hardware for hinges, channels and locks.',
      included: ['Branded hinges and channels on request', 'Measurement before custom work', 'Dust sheet and clean-up', 'Fixing of old screws and fittings'],
      items: [
        { id: 'furniture', name: 'Furniture repair', desc: 'Loose joints, broken legs, drawers', price: 499, mins: 60 },
        { id: 'hinge', name: 'Hinge & drawer channel fix', desc: 'Kitchen or wardrobe shutters', price: 499, mins: 45 },
        { id: 'lock', name: 'Door lock installation', desc: 'Main door or room lock', price: 549, mins: 45 },
        { id: 'assembly', name: 'Bed / wardrobe assembly', desc: 'Flat-pack furniture', price: 799, mins: 90 },
        { id: 'kitchen', name: 'Modular kitchen repair', desc: 'Shutters, baskets, skirting', price: 899, mins: 90 },
        { id: 'shelf', name: 'Custom wall shelf', desc: 'Up to 4 ft, material included', price: 1499, mins: 120 }
      ],
      faqs: [['Can you supply branded hardware?', 'Yes, hinges and channels from leading brands at MRP, or we fit what you provide.'], ['Do you make furniture from scratch?', 'Small custom builds yes; for full furniture we send a carpenter for measurement and a quote.']] },
    { id: 'painting', label: 'Painting', title: 'Precision Painting', icon: 'format_paint', img: 'images/services/painting.jpg', rating: 4.7, reviews: 1290, warranty: '1-year finish warranty',
      tagline: 'Touch-ups to full homes, with furniture covered and cleaned up.',
      about: 'Trained painting crews with branded paints, proper surface preparation, and furniture protection from start to finish.',
      included: ['Free colour consultation', 'Furniture and floor covering', 'Putty and primer as needed', 'Post-paint cleaning'],
      items: [
        { id: 'touchup', name: 'Wall touch-up', desc: 'One wall, up to 120 sq ft', price: 499, mins: 90 },
        { id: 'room', name: 'One-room painting', desc: 'Up to 12x12 ft room, 2 coats', price: 4999, mins: 480 },
        { id: 'texture', name: 'Texture accent wall', desc: 'Designer texture, one wall', price: 2499, mins: 240 },
        { id: 'waterproof', name: 'Waterproofing', desc: 'Damp wall or terrace patch', price: 2999, mins: 240 },
        { id: 'polish', name: 'Wood polish', desc: 'Door or one furniture piece', price: 1999, mins: 240 },
        { id: 'fullhome', name: 'Full-home painting (2 BHK)', desc: 'Interiors, branded paint', price: 18999, mins: 2880 }
      ],
      faqs: [['How long does a room take?', 'About a day for one room, including drying between coats.'], ['Which paints do you use?', 'Branded emulsions; you can choose the brand and shade.']] },
    { id: 'cleaning', label: 'Pest & Garden', title: 'Professional Cleaning', icon: 'pest_control', img: 'images/services/cleaning.jpg', rating: 4.8, reviews: 3870, warranty: 'Re-clean guarantee',
      tagline: 'Deep cleaning, sofa cleaning, pest control and garden care.',
      about: 'Background-verified cleaning and pest-control teams with professional machines and safe, approved chemicals.',
      included: ['Machines and cleaning supplies', 'Pet- and child-safe products', 'Trained, verified staff', 'Free re-clean if not satisfied'],
      items: [
        { id: 'bath', name: 'Bathroom deep clean', desc: 'Tiles, fittings, descaling', price: 299, mins: 60 },
        { id: 'kitchen-clean', name: 'Kitchen deep clean', desc: 'Cabinets, hob, tiles, sink', price: 1299, mins: 180 },
        { id: 'home-clean', name: 'Full-home deep clean (2 BHK)', desc: 'All rooms, kitchen and bathrooms', price: 3499, mins: 360 },
        { id: 'sofa', name: 'Sofa cleaning', desc: 'Up to 5 seats, shampoo and vacuum', price: 599, mins: 60 },
        { id: 'pest', name: 'Cockroach & ant control', desc: 'Gel treatment, odourless', price: 799, mins: 60 },
        { id: 'termite', name: 'Termite treatment', desc: 'Drill-fill-seal method', price: 2499, mins: 180 },
        { id: 'garden', name: 'Garden maintenance', desc: 'Trimming, weeding, soil care', price: 699, mins: 90 }
      ],
      faqs: [['Do I need to leave the house for pest control?', 'Not for gel treatment. For spray treatments, about 2 hours.'], ['What does the re-clean guarantee cover?', 'If any area is missed, we return within 48 hours at no cost.']] },
    { id: 'wall-panelling', label: 'Wall Panelling', title: 'Modern Textures', icon: 'grid_view', img: 'images/services/wall-panelling.jpg', rating: 4.9, reviews: 640, warranty: '2-year installation warranty',
      tagline: 'Fluted panels, stone finishes and lit ceilings that change a room.',
      about: 'Design-led wall and ceiling upgrades. A designer visits first to measure and share options, then a crew installs in a day or two.',
      included: ['Home visit with samples', '3D preview on request', 'Moisture-resistant panels', 'Clean installation, no dust left'],
      items: [
        { id: 'consult', name: 'Design consultation & measurement', desc: 'Adjusted against your order', price: 499, mins: 60 },
        { id: 'ceiling', name: 'Ceiling profile lighting', desc: 'Up to 12x12 ft room', price: 3999, mins: 240 },
        { id: 'tvpanel', name: 'TV unit back panel', desc: 'Up to 8x8 ft, with cut-outs', price: 6499, mins: 360 },
        { id: 'stone', name: 'PU stone accent wall', desc: 'Up to 60 sq ft', price: 7499, mins: 360 },
        { id: 'fluted', name: 'WPC fluted panel wall', desc: 'Up to 80 sq ft', price: 9999, mins: 480 }
      ],
      faqs: [['Is it waterproof?', 'WPC and PU panels are moisture-resistant and suit Indian weather.'], ['How long does installation take?', 'Most walls are done in one day after the materials arrive.']] },
    { id: 'salon', label: 'Unisex Salon', title: 'Professional Grooming', icon: 'content_cut', img: 'images/services/grooming.jpg', rating: 4.8, reviews: 4120, warranty: 'Hygiene-first, single-use kits',
      tagline: 'Salon-quality grooming at home, for men and women.',
      about: 'Trained beauticians and stylists who bring sanitised tools and single-use kits for every appointment.',
      included: ['Single-use kits', 'Branded products', 'Mat and sheet to keep the floor clean', 'Trained, verified professionals'],
      items: [
        { id: 'cut-m', name: 'Haircut (men)', desc: 'Cut, wash and styling', price: 499, mins: 45 },
        { id: 'beard', name: 'Beard grooming', desc: 'Trim, shape and hot towel', price: 499, mins: 30 },
        { id: 'cut-w', name: 'Haircut (women)', desc: 'Consultation, cut and blow-dry', price: 699, mins: 60 },
        { id: 'wax', name: 'Full-arm & leg waxing', desc: 'Rica or honey wax', price: 799, mins: 60 },
        { id: 'mani', name: 'Manicure & pedicure', desc: 'With scrub and massage', price: 999, mins: 75 },
        { id: 'facial', name: 'Facial', desc: 'Cleanup and glow facial', price: 1199, mins: 60 }
      ],
      faqs: [['Do you serve both men and women?', 'Yes. You can ask for a stylist of a specific gender when booking, in the notes.'], ['Are products and tools hygienic?', 'Every visit uses a sealed single-use kit and sanitised tools.']] }
  ];
  const svcById = (id) => SERVICES.find((s) => s.id === id);
  const CITIES = ['Great Lakes Bilaspur, Gurgaon', 'Gurgaon', 'Delhi', 'Noida', 'Faridabad', 'Bengaluru', 'Mumbai', 'Pune', 'Jaipur', 'Hyderabad'];
  const SLOTS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  const PROS = ['Ravi K.', 'Imran S.', 'Sunita M.', 'Deepak R.', 'Anjali T.', 'Vikas P.', 'Farhan A.', 'Pooja N.'];
  const FEE = 49, FREE_FEE_ABOVE = 999;
  const COUPONS = { FIRSTFIX: { off: 100, min: 499, firstOnly: true, label: '₹100 off your first booking' }, GHAR10: { pct: 10, max: 300, min: 999, label: '10% off up to ₹300' } };

  // ------------------------------------------------------------------ storage
  const KEY = 'gharfix_db_v1', SKEY = 'gharfix_session_v1', LKEY = 'gharfix_location_v1';
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };
  const db = () => store.get(KEY, { users: [], bookings: [], tickets: [] });
  const save = (d) => store.set(KEY, d);
  const uid = (p) => p + '-' + Date.now().toString(36).toUpperCase().slice(-4) + Math.random().toString(36).slice(2, 6).toUpperCase();

  async function hashPw(pw, salt) {
    const data = salt + '|' + pw;
    try {
      if (window.crypto && crypto.subtle) {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
        return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (e) { /* fall back */ }
    let h = 5381; for (let i = 0; i < data.length; i++) h = ((h << 5) + h + data.charCodeAt(i)) >>> 0; return 'x' + h.toString(16);
  }
  const fail = (msg) => { const e = new Error(msg); e.userFacing = true; throw e; };
  const publicUser = (u) => u && { id: u.id, name: u.name, email: u.email, phone: u.phone, addresses: u.addresses || [], createdAt: u.createdAt };

  // ------------------------------------------------------------------ API ("backend")
  const API = {
    async signup({ name, email, phone, password }) {
      await sleep(350);
      name = (name || '').trim(); email = (email || '').trim().toLowerCase(); phone = (phone || '').replace(/\D/g, '');
      if (name.length < 2) fail('Please enter your full name.');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fail('Please enter a valid email address.');
      if (!/^[6-9]\d{9}$/.test(phone)) fail('Please enter a valid 10-digit mobile number.');
      if ((password || '').length < 6) fail('Password must be at least 6 characters.');
      const d = db();
      if (d.users.some((u) => u.email === email)) fail('An account with this email already exists. Try signing in.');
      if (d.users.some((u) => u.phone === phone)) fail('This mobile number is already registered.');
      const salt = Math.random().toString(36).slice(2);
      const user = { id: uid('U'), name, email, phone, salt, pw: await hashPw(password, salt), addresses: [], createdAt: new Date().toISOString() };
      d.users.push(user); save(d);
      store.set(SKEY, { userId: user.id, at: Date.now() });
      return publicUser(user);
    },
    async login({ id, password }) {
      await sleep(300);
      const key = (id || '').trim().toLowerCase(); const ph = key.replace(/\D/g, '');
      const d = db(); const u = d.users.find((x) => x.email === key || (ph.length === 10 && x.phone === ph));
      if (!u || u.pw !== await hashPw(password || '', u.salt)) fail('Email/mobile or password is incorrect.');
      store.set(SKEY, { userId: u.id, at: Date.now() });
      return publicUser(u);
    },
    async demoLogin() {
      const d = db(); let u = d.users.find((x) => x.email === 'demo@gharfix.in');
      if (!u) return API.signup({ name: 'Guest Demo', email: 'demo@gharfix.in', phone: '9876543210', password: 'demo1234' });
      store.set(SKEY, { userId: u.id, at: Date.now() }); return publicUser(u);
    },
    async resetPassword({ email, phone, password }) {
      await sleep(300);
      const d = db(); const u = d.users.find((x) => x.email === (email || '').trim().toLowerCase() && x.phone === (phone || '').replace(/\D/g, ''));
      if (!u) fail('No account matches that email and mobile number.');
      if ((password || '').length < 6) fail('New password must be at least 6 characters.');
      u.salt = Math.random().toString(36).slice(2); u.pw = await hashPw(password, u.salt); save(d); return true;
    },
    logout() { store.del(SKEY); },
    me() { const s = store.get(SKEY, null); if (!s) return null; const u = db().users.find((x) => x.id === s.userId); return publicUser(u) || null; },
    async updateProfile(patch) {
      await sleep(250);
      const me = API.me(); if (!me) fail('Please sign in.');
      const d = db(); const u = d.users.find((x) => x.id === me.id);
      if (patch.name !== undefined) { if (patch.name.trim().length < 2) fail('Please enter your full name.'); u.name = patch.name.trim(); }
      if (patch.phone !== undefined) { const p = patch.phone.replace(/\D/g, ''); if (!/^[6-9]\d{9}$/.test(p)) fail('Please enter a valid 10-digit mobile number.'); if (d.users.some((x) => x.phone === p && x.id !== u.id)) fail('This mobile number is already registered.'); u.phone = p; }
      if (patch.addresses) u.addresses = patch.addresses;
      save(d); return publicUser(u);
    },
    takenSlots(serviceId, date) {
      const d = db(); const taken = {};
      d.bookings.filter((b) => b.serviceId === serviceId && b.date === date && b.status !== 'Cancelled').forEach((b) => { taken[b.slot] = (taken[b.slot] || 0) + 1; });
      return taken;
    },
    quote(serviceId, cart, code, userId) {
      const s = svcById(serviceId); const lines = [];
      let subtotal = 0, mins = 0;
      Object.entries(cart).forEach(([iid, q]) => { const it = s.items.find((x) => x.id === iid); if (it && q > 0) { lines.push({ id: it.id, name: it.name, qty: q, price: it.price, total: it.price * q }); subtotal += it.price * q; mins += it.mins * q; } });
      const fee = subtotal === 0 || subtotal >= FREE_FEE_ABOVE ? 0 : FEE;
      let discount = 0, couponMsg = '';
      if (code) {
        const c = COUPONS[code.toUpperCase()];
        if (!c) couponMsg = 'This coupon code is not valid.';
        else if (subtotal < c.min) couponMsg = `Add items worth ${rupee(c.min)} or more to use this code.`;
        else if (c.firstOnly && userId && db().bookings.some((b) => b.userId === userId && b.status !== 'Cancelled')) couponMsg = 'This code is only for your first booking.';
        else { discount = c.off || Math.min(c.max, Math.round(subtotal * c.pct / 100)); couponMsg = 'Applied: ' + c.label; }
      }
      return { lines, subtotal, fee, discount, total: Math.max(0, subtotal + fee - discount), mins, couponMsg, couponOk: discount > 0 };
    },
    async createBooking({ serviceId, cart, date, slot, address, notes, coupon }) {
      await sleep(500);
      const me = API.me(); if (!me) fail('Please sign in to book.');
      const q = API.quote(serviceId, cart, coupon, me.id);
      if (!q.lines.length) fail('Choose at least one service.');
      if (!date || slot == null) fail('Choose a date and time slot.');
      const when = new Date(date + 'T' + pad(slot) + ':00:00');
      if (when.getTime() < Date.now() + 60 * 60 * 1000) fail('Please choose a slot at least 1 hour from now.');
      if ((API.takenSlots(serviceId, date)[slot] || 0) >= 2) fail('That slot just filled up. Please choose another.');
      if (!address || !address.line || address.line.trim().length < 5) fail('Please add your full address.');
      const d = db();
      const b = { id: 'GF' + Math.floor(100000 + Math.random() * 900000), userId: me.id, serviceId, mins: q.mins, lines: q.lines, subtotal: q.subtotal, fee: q.fee, discount: q.discount, total: q.total, coupon: q.couponOk ? coupon.toUpperCase() : '',
        date, slot, address, notes: (notes || '').slice(0, 500), status: 'Confirmed', pro: PROS[Math.floor(Math.random() * PROS.length)], proRating: (4.6 + Math.random() * 0.4).toFixed(1),
        otp: String(Math.floor(1000 + Math.random() * 9000)), payment: 'Pay after service (UPI / card / cash)', createdAt: new Date().toISOString(), history: [{ at: new Date().toISOString(), what: 'Booking confirmed' }] };
      d.bookings.push(b);
      const u = d.users.find((x) => x.id === me.id);
      if (address.save && !(u.addresses || []).some((a) => a.line === address.line)) { u.addresses = (u.addresses || []).concat([{ label: address.label || 'Home', line: address.line, city: address.city }]); }
      save(d); return b;
    },
    myBookings() { const me = API.me(); if (!me) return []; return db().bookings.filter((b) => b.userId === me.id).map(withLiveStatus).sort((a, b) => (b.date + pad(b.slot)).localeCompare(a.date + pad(a.slot))); },
    booking(id) { const me = API.me(); const b = db().bookings.find((x) => x.id === id && me && x.userId === me.id); return b ? withLiveStatus(b) : null; },
    async cancelBooking(id, reason) {
      await sleep(300); const d = db(); const me = API.me(); const b = d.bookings.find((x) => x.id === id && me && x.userId === me.id);
      if (!b) fail('Booking not found.');
      if (withLiveStatus(b).status !== 'Upcoming') fail('Only upcoming bookings can be cancelled.');
      b.status = 'Cancelled'; b.cancelReason = reason || ''; b.history.push({ at: new Date().toISOString(), what: 'Cancelled' + (reason ? ': ' + reason : '') }); save(d); return b;
    },
    async reschedule(id, date, slot) {
      await sleep(300); const d = db(); const me = API.me(); const b = d.bookings.find((x) => x.id === id && me && x.userId === me.id);
      if (!b) fail('Booking not found.');
      const when = new Date(date + 'T' + pad(slot) + ':00:00'); if (when.getTime() < Date.now() + 60 * 60 * 1000) fail('Please choose a slot at least 1 hour from now.');
      if ((API.takenSlots(b.serviceId, date)[slot] || 0) >= 2) fail('That slot is full. Please choose another.');
      b.history.push({ at: new Date().toISOString(), what: `Rescheduled from ${fmtDate(b.date)}, ${slotLabel(b.slot)} to ${fmtDate(date)}, ${slotLabel(slot)}` });
      b.date = date; b.slot = slot; save(d); return b;
    },
    async rate(id, stars, comment) {
      await sleep(250); const d = db(); const me = API.me(); const b = d.bookings.find((x) => x.id === id && me && x.userId === me.id);
      if (!b) fail('Booking not found.'); b.rating = { stars, comment: (comment || '').slice(0, 400), at: new Date().toISOString() }; save(d); return b;
    },
    async createTicket({ subject, bookingId, message, name, email }) {
      await sleep(350); const me = API.me();
      if (!subject) fail('Please choose a topic.'); if (!message || message.trim().length < 10) fail('Please describe the issue in a few more words.');
      if (!me && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email || '')) fail('Please enter a valid email so we can reply.');
      const d = db(); const t = { id: 'TK' + Math.floor(10000 + Math.random() * 90000), userId: me ? me.id : null, name: me ? me.name : name, email: me ? me.email : email, subject, bookingId: bookingId || '', message: message.trim(), status: 'Open', createdAt: new Date().toISOString() };
      d.tickets.push(t); save(d); return t;
    },
    myTickets() { const me = API.me(); if (!me) return []; return db().tickets.filter((t) => t.userId === me.id).reverse(); }
  };
  function withLiveStatus(b) {
    const c = Object.assign({}, b);
    if (b.status === 'Cancelled') { c.status = 'Cancelled'; return c; }
    const start = new Date(b.date + 'T' + pad(b.slot) + ':00:00').getTime(); const now = Date.now();
    const dur = Math.max(60, b.mins || 60) * 60 * 1000;
    if (now >= start + dur) c.status = 'Completed'; else if (now >= start) c.status = 'In progress'; else c.status = 'Upcoming';
    return c;
  }

  // ------------------------------------------------------------------ UI primitives
  function toast(msg, kind) {
    let box = $('#gf-toasts'); if (!box) { box = document.createElement('div'); box.id = 'gf-toasts'; box.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none px-4 w-full max-w-md'; document.body.appendChild(box); }
    const t = document.createElement('div');
    t.className = 'pointer-events-auto w-full px-4 py-3 rounded-lg shadow-lg font-label-md text-label-md flex items-center gap-2 transition-opacity duration-300 ' + (kind === 'error' ? 'bg-[#ba1a1a] text-white' : 'bg-primary-container text-surface-container-high');
    t.setAttribute('role', 'status'); t.innerHTML = icon(kind === 'error' ? 'error' : 'check_circle', 'text-[20px]') + '<span>' + esc(msg) + '</span>';
    box.appendChild(t); setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3200);
  }
  let modalReturn = null;
  function openModal(html, opts) {
    closeModal();
    modalReturn = document.activeElement;
    const wrap = document.createElement('div'); wrap.id = 'gf-modal';
    wrap.className = 'fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4';
    wrap.innerHTML = `<div role="dialog" aria-modal="true" class="bg-surface-container-high text-primary-container w-full sm:max-w-${(opts && opts.size) || 'md'} rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">${html}</div>`;
    wrap.addEventListener('click', (e) => { if (e.target === wrap) closeModal(); });
    document.body.appendChild(wrap); document.body.style.overflow = 'hidden';
    const f = wrap.querySelector('input,select,textarea,button'); if (f) f.focus();
    $$('[data-close]', wrap).forEach((b) => b.addEventListener('click', closeModal));
    return wrap;
  }
  function closeModal() { const m = $('#gf-modal'); if (m) { m.remove(); document.body.style.overflow = ''; if (modalReturn && modalReturn.focus) modalReturn.focus(); } }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal(); closeMenus(); } });
  const modalHead = (title, sub) => `<div class="flex items-start justify-between gap-4 p-6 pb-2"><div><h2 class="font-headline-md text-headline-md">${esc(title)}</h2>${sub ? `<p class="font-body-sm text-body-sm text-primary-container/70 mt-1">${esc(sub)}</p>` : ''}</div><button data-close class="p-1 rounded hover:bg-primary-container/10" aria-label="Close">${icon('close')}</button></div>`;
  const field = (label, inner, hint) => `<label class="flex flex-col gap-1 font-label-sm text-label-sm">${esc(label)}${inner}${hint ? `<span class="text-primary-container/60 font-body-sm text-body-sm">${hint}</span>` : ''}</label>`;
  const inputCls = 'w-full rounded-lg border border-primary-container/20 bg-surface px-3 py-2.5 font-body-md text-body-md text-primary-container focus:border-[#D9A857] focus:ring-[#D9A857]';
  const btnDark = 'bg-primary-container text-surface-container-high px-5 py-3 rounded-lg font-label-md text-label-md hover:bg-[#D9A857] transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const btnLight = 'border border-primary-container/30 text-primary-container px-5 py-3 rounded-lg font-label-md text-label-md hover:border-[#D9A857] hover:text-[#8a6a2f] transition-colors';
  async function busy(btn, fn) { const t = btn.innerHTML; btn.disabled = true; btn.innerHTML = '<span class="inline-block w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin align-[-2px]"></span>'; try { return await fn(); } finally { btn.disabled = false; btn.innerHTML = t; } }

  // ------------------------------------------------------------------ auth modal
  function openAuth(mode, after) {
    mode = mode || 'signin';
    const tabs = `<div class="flex gap-2 px-6"><button data-tab="signin" class="flex-1 py-2 rounded-lg font-label-md text-label-md ${mode === 'signin' ? 'bg-primary-container text-surface-container-high' : 'bg-primary-container/5'}">Sign in</button><button data-tab="signup" class="flex-1 py-2 rounded-lg font-label-md text-label-md ${mode === 'signup' ? 'bg-primary-container text-surface-container-high' : 'bg-primary-container/5'}">Create account</button></div>`;
    let body;
    if (mode === 'signin') body = `<form class="flex flex-col gap-4 p-6" novalidate>
        ${field('Email or mobile number', `<input name="id" autocomplete="username" class="${inputCls}" required>`)}
        ${field('Password', `<input name="password" type="password" autocomplete="current-password" class="${inputCls}" required>`)}
        <p class="gf-err text-[#ba1a1a] font-body-sm text-body-sm hidden" role="alert"></p>
        <button class="${btnDark}" type="submit">Sign in</button>
        <div class="flex justify-between font-body-sm text-body-sm"><button type="button" data-tab="reset" class="underline">Forgot password?</button><button type="button" data-demo class="underline">Use demo account</button></div></form>`;
    else if (mode === 'signup') body = `<form class="flex flex-col gap-4 p-6" novalidate>
        ${field('Full name', `<input name="name" autocomplete="name" class="${inputCls}" required>`)}
        ${field('Mobile number', `<input name="phone" inputmode="numeric" autocomplete="tel" maxlength="10" class="${inputCls}" placeholder="10-digit number" required>`)}
        ${field('Email', `<input name="email" type="email" autocomplete="email" class="${inputCls}" required>`)}
        ${field('Password', `<input name="password" type="password" autocomplete="new-password" class="${inputCls}" required>`, 'At least 6 characters')}
        <p class="gf-err text-[#ba1a1a] font-body-sm text-body-sm hidden" role="alert"></p>
        <button class="${btnDark}" type="submit">Create account</button>
        <p class="font-body-sm text-body-sm text-primary-container/60">Your details are stored securely in this browser for this demo site.</p></form>`;
    else body = `<form class="flex flex-col gap-4 p-6" novalidate>
        <p class="font-body-sm text-body-sm text-primary-container/70">Confirm the email and mobile number on your account, then set a new password.</p>
        ${field('Email', `<input name="email" type="email" class="${inputCls}" required>`)}
        ${field('Mobile number', `<input name="phone" inputmode="numeric" maxlength="10" class="${inputCls}" required>`)}
        ${field('New password', `<input name="password" type="password" autocomplete="new-password" class="${inputCls}" required>`)}
        <p class="gf-err text-[#ba1a1a] font-body-sm text-body-sm hidden" role="alert"></p>
        <button class="${btnDark}" type="submit">Reset password</button>
        <button type="button" data-tab="signin" class="font-body-sm text-body-sm underline">Back to sign in</button></form>`;
    const m = openModal(modalHead(mode === 'reset' ? 'Reset password' : 'Welcome to GharFix', mode === 'reset' ? '' : 'Sign in to book and track your services.') + (mode === 'reset' ? '' : tabs) + body);
    $$('[data-tab]', m).forEach((b) => b.addEventListener('click', () => openAuth(b.dataset.tab, after)));
    const err = $('.gf-err', m); const form = $('form', m);
    const demo = $('[data-demo]', m); if (demo) demo.addEventListener('click', async () => { await API.demoLogin(); closeModal(); renderHeader(); toast('Signed in with the demo account'); if (after) after(); else route(); });
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); err.classList.add('hidden');
      const data = Object.fromEntries(new FormData(form).entries());
      try {
        await busy($('button[type=submit]', form), async () => {
          if (mode === 'signin') { const u = await API.login(data); toast('Welcome back, ' + u.name.split(' ')[0]); }
          else if (mode === 'signup') { const u = await API.signup(data); toast('Account created. Welcome, ' + u.name.split(' ')[0] + '!'); }
          else { await API.resetPassword(data); toast('Password updated. Please sign in.'); openAuth('signin', after); return; }
          closeModal(); renderHeader(); if (after) after(); else route();
        });
      } catch (ex) { err.textContent = ex.userFacing ? ex.message : 'Something went wrong. Please try again.'; err.classList.remove('hidden'); }
    });
  }
  function requireAuth(next) { if (API.me()) return next(); openAuth('signin', next); }

  // ------------------------------------------------------------------ header
  function currentPath() { return (location.hash || '#/').slice(1) || '/'; }
  function navLink(href, label, ico) {
    const active = currentPath().startsWith(href.slice(1)) && href !== '#/';
    return `<a href="${href}" class="${active ? 'text-primary-container font-bold border-b-2 border-primary-container pb-1' : 'text-primary-container/70'} hover:text-[#D9A857] transition-colors duration-200 flex items-center gap-1">${ico ? icon(ico, 'text-primary-container text-[16px]') : ''}${label}</a>`;
  }
  function closeMenus() { $$('[data-menu]').forEach((m) => m.classList.add('hidden')); $$('[aria-expanded="true"]').forEach((b) => b.setAttribute('aria-expanded', 'false')); }
  document.addEventListener('click', (e) => { if (!e.target.closest('[data-menu-root]')) closeMenus(); });
  function renderHeader() {
    const me = API.me(); const loc = store.get(LKEY, CITIES[0]);
    const right = me ? `<div class="relative" data-menu-root>
          <button id="gf-user-btn" aria-haspopup="true" aria-expanded="false" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary-container/5"><span class="w-7 h-7 rounded-full bg-primary-container text-surface-container-high grid place-items-center font-label-sm text-label-sm">${esc(me.name.charAt(0).toUpperCase())}</span><span class="hidden sm:inline">${esc(me.name.split(' ')[0])}</span>${icon('expand_more', 'text-[18px]')}</button>
          <div data-menu class="hidden absolute right-0 mt-2 w-56 bg-surface-container-high rounded-xl shadow-xl border border-primary-container/10 py-2 z-50">
            <div class="px-4 py-2 border-b border-primary-container/10 mb-1"><p class="font-label-md text-label-md">${esc(me.name)}</p><p class="font-body-sm text-body-sm text-primary-container/60 truncate">${esc(me.email)}</p></div>
            <a href="#/bookings" class="flex items-center gap-2 px-4 py-2 hover:bg-[#D9A857]/10">${icon('shopping_basket', 'text-[18px]')}Your bookings</a>
            <a href="#/account" class="flex items-center gap-2 px-4 py-2 hover:bg-[#D9A857]/10">${icon('person', 'text-[18px]')}Profile & addresses</a>
            <a href="#/support" class="flex items-center gap-2 px-4 py-2 hover:bg-[#D9A857]/10">${icon('support_agent', 'text-[18px]')}Help & support</a>
            <button id="gf-logout" class="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-[#D9A857]/10">${icon('logout', 'text-[18px]')}Sign out</button>
          </div></div>`
      : `<button id="gf-signin" class="text-primary-container hover:text-[#D9A857] transition-colors px-4 py-2">Sign In</button><button id="gf-signup" class="hidden sm:flex bg-primary-container text-surface-container-high px-4 py-2 rounded-lg hover:bg-[#D9A857] transition-colors">Create account</button>`;
    $('#site-header').innerHTML = `
      <div class="bg-surface-container-high border-b border-outline-variant/30 py-2 px-margin-mobile md:px-margin-desktop text-label-sm font-label-sm flex justify-end items-center gap-6">
        <button id="gf-loc" class="flex items-center gap-2 text-primary-container/70 hover:text-primary-container transition-colors truncate">${icon('location_on', 'text-primary-container text-[16px]')}<span class="truncate">Current Location: <b>${esc(loc)}</b></span>${icon('keyboard_arrow_down', 'text-primary-container text-[16px]')}</button>
        <div class="relative hidden md:block" data-menu-root><button id="gf-lang" aria-haspopup="true" aria-expanded="false" class="flex items-center gap-2 text-primary-container/70 hover:text-primary-container transition-colors">${icon('language', 'text-primary-container text-[16px]')}English (US)</button>
          <div data-menu class="hidden absolute right-0 mt-2 w-44 bg-surface-container-high rounded-xl shadow-xl border border-primary-container/10 py-2 z-50"><div class="px-4 py-2 flex justify-between">English (US) ${icon('check', 'text-[16px]')}</div><div class="px-4 py-2 text-primary-container/50">हिन्दी (coming soon)</div></div></div>
      </div>
      <nav class="bg-surface-container-high w-full shadow-sm shadow-[#A8A196]/20 flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 mx-auto">
        <div class="flex items-center gap-8">
          <a class="font-headline-md text-headline-md font-bold text-primary-container" href="#/"><span class="bg-primary-container text-surface-container-high px-2 rounded">घर</span><span class="text-primary-container ml-1">fix</span></a>
          <div class="hidden md:flex items-center gap-6 font-label-sm text-label-sm">${navLink('#/services', 'Services', 'home_repair_service')}${navLink('#/bookings', 'Your Bookings', 'shopping_basket')}${navLink('#/support', 'Support')}</div>
        </div>
        <div class="flex items-center gap-2 font-label-sm text-label-sm">${right}
          <button id="gf-burger" class="md:hidden p-2 rounded hover:bg-primary-container/5" aria-label="Open menu" aria-expanded="false">${icon('menu')}</button></div>
      </nav>
      <div id="gf-mobile" class="hidden md:hidden bg-surface-container-high border-t border-primary-container/10 px-margin-mobile py-3 flex flex-col gap-3 font-label-md text-label-md">
        <a href="#/services">Services</a><a href="#/bookings">Your Bookings</a><a href="#/support">Support</a>${me ? '<a href="#/account">Profile & addresses</a>' : ''}
      </div>`;
    const sub = (id, fn) => { const el = $(id); if (el) el.addEventListener('click', fn); };
    sub('#gf-signin', () => openAuth('signin')); sub('#gf-signup', () => openAuth('signup'));
    sub('#gf-logout', () => { API.logout(); renderHeader(); toast('Signed out'); if (/^\/(bookings|account|booking)/.test(currentPath())) location.hash = '#/'; else route(); });
    sub('#gf-loc', openLocation);
    $$('[data-menu-root] > button').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); const m = b.parentElement.querySelector('[data-menu]'); const open = m.classList.contains('hidden'); closeMenus(); if (open) { m.classList.remove('hidden'); b.setAttribute('aria-expanded', 'true'); } }));
    sub('#gf-burger', () => { const m = $('#gf-mobile'); m.classList.toggle('hidden'); $('#gf-burger').setAttribute('aria-expanded', String(!m.classList.contains('hidden'))); });
  }
  function openLocation() {
    const cur = store.get(LKEY, CITIES[0]);
    const m = openModal(modalHead('Choose your location', 'We show slots for professionals near you.') + `<div class="p-6 pt-2 flex flex-col gap-2">${CITIES.map((c) => `<button data-city="${esc(c)}" class="text-left px-4 py-3 rounded-lg border ${c === cur ? 'border-[#D9A857] bg-[#D9A857]/10' : 'border-primary-container/10 hover:border-[#D9A857]'} flex items-center justify-between">${esc(c)}${c === cur ? icon('check') : ''}</button>`).join('')}</div>`);
    $$('[data-city]', m).forEach((b) => b.addEventListener('click', () => { store.set(LKEY, b.dataset.city); closeModal(); renderHeader(); toast('Location set to ' + b.dataset.city); }));
  }

  // ------------------------------------------------------------------ views
  const wrapPage = (inner) => `<div class="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-10 md:py-stack-lg">${inner}</div>`;
  const crumbs = (items) => `<nav aria-label="Breadcrumb" class="font-label-sm text-label-sm text-primary-container/60 mb-6 flex items-center gap-1 flex-wrap">${items.map((it, i) => (i < items.length - 1 ? `<a href="${it[1]}" class="hover:text-primary-container">${esc(it[0])}</a>${icon('chevron_right', 'text-[16px]')}` : `<span class="text-primary-container">${esc(it[0])}</span>`)).join('')}</nav>`;
  const stars = (r) => `<span class="inline-flex items-center gap-1 text-[#8a6a2f]">${icon('star', 'text-[18px] text-[#D9A857]')}<b>${r}</b></span>`;

  function viewServices() {
    return wrapPage(crumbs([['Home', '#/'], ['All services']]) + `
      <h1 class="font-headline-lg text-headline-lg mb-2">All services</h1>
      <p class="font-body-md text-body-md text-primary-container/70 mb-8 max-w-2xl">Verified professionals, upfront prices and a warranty on every job. Pick a service to see what’s included and book a slot.</p>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-gutter">${SERVICES.map((s) => `
        <a href="#/service/${s.id}" class="group bg-surface rounded-xl overflow-hidden border border-primary-container/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
          <div class="h-40 overflow-hidden"><img src="${s.img}" alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"></div>
          <div class="p-4 flex flex-col gap-1 flex-1"><span class="font-label-sm text-label-sm text-primary-container/60 flex items-center gap-1">${icon(s.icon, 'text-[16px]')}${esc(s.label)}</span>
            <h2 class="font-headline-md text-[20px] leading-tight">${esc(s.title)}</h2>
            <p class="font-body-sm text-body-sm text-primary-container/70 flex-1">${esc(s.tagline)}</p>
            <div class="flex items-center justify-between mt-2 font-label-md text-label-md"><span>${rupee(Math.min(...s.items.map((i) => i.price)))} onwards</span>${stars(s.rating)}</div></div></a>`).join('')}</div>`);
  }

  // booking state per visit
  let bk = null;
  function next7() { const out = []; const d = new Date(); for (let i = 0; i < 7; i++) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i); out.push(x); } return out; }
  function slotOpen(date, h, taken) { const when = new Date(date + 'T' + pad(h) + ':00:00').getTime(); return when >= Date.now() + 60 * 60 * 1000 && (taken[h] || 0) < 2; }

  function viewService(id) {
    const s = svcById(id); if (!s) return viewNotFound();
    if (!bk || bk.serviceId !== id) {
      const me = API.me(); const saved = me && me.addresses && me.addresses[0];
      const firstOpen = next7().map(ymd).find((d) => SLOTS.some((h) => slotOpen(d, h, API.takenSlots(id, d))));
      bk = { serviceId: id, cart: {}, date: firstOpen, slot: null, coupon: '', notes: '', addr: saved ? { line: saved.line, label: saved.label, city: saved.city, save: false, picked: 0 } : { line: '', label: 'Home', city: store.get(LKEY, CITIES[0]), save: true, picked: -1 } };
    }
    return wrapPage(crumbs([['Home', '#/'], ['All services', '#/services'], [s.label]]) + `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div class="min-w-0 lg:col-span-7 flex flex-col gap-6">
          <div class="rounded-2xl overflow-hidden h-64 md:h-80 relative"><img src="${s.img}" alt="${esc(s.title)}" class="w-full h-full object-cover"><div class="absolute inset-0 bg-gradient-to-t from-primary-container/80 to-transparent"></div>
            <div class="absolute bottom-0 p-6 text-surface-container-high"><span class="bg-surface-container-high/90 text-primary-container px-2 py-0.5 rounded-full font-label-sm text-label-sm inline-flex items-center gap-1">${icon(s.icon, 'text-[14px]')}${esc(s.label)}</span>
              <h1 class="font-headline-lg text-headline-lg mt-2">${esc(s.title)}</h1><p class="font-body-md text-body-md opacity-90">${esc(s.tagline)}</p></div></div>
          <div class="flex flex-wrap gap-4 font-label-md text-label-md">${stars(s.rating)}<span class="text-primary-container/70">${s.reviews.toLocaleString('en-IN')} bookings</span><span class="flex items-center gap-1 text-primary-container/70">${icon('verified_user', 'text-[18px]')}${esc(s.warranty)}</span></div>
          <p class="font-body-lg text-body-lg">${esc(s.about)}</p>
          <div class="bg-surface rounded-xl p-6 border border-primary-container/10"><h2 class="font-headline-md text-[20px] mb-3">What’s included</h2><ul class="grid sm:grid-cols-2 gap-2">${s.included.map((x) => `<li class="flex gap-2 font-body-md text-body-md">${icon('check_circle', 'text-[#8a6a2f] text-[20px]')}${esc(x)}</li>`).join('')}</ul></div>
          <div><h2 class="font-headline-md text-[20px] mb-3">Questions people ask</h2>${s.faqs.map(([q, a]) => `<details class="bg-surface rounded-xl border border-primary-container/10 mb-2 group"><summary class="cursor-pointer list-none p-4 font-label-md text-label-md flex justify-between items-center">${esc(q)}${icon('expand_more', 'group-open:rotate-180 transition-transform')}</summary><p class="px-4 pb-4 font-body-md text-body-md text-primary-container/80">${esc(a)}</p></details>`).join('')}</div>
        </div>
        <aside class="min-w-0 lg:col-span-5"><div id="gf-book" class="bg-surface rounded-2xl border border-primary-container/10 shadow-[0_8px_30px_rgba(43,36,32,0.08)] lg:sticky lg:top-6"></div></aside>
      </div>`);
  }
  function renderBookPanel() {
    const s = svcById(bk.serviceId); const el = $('#gf-book'); if (!el) return;
    const me = API.me(); const q = API.quote(s.id, bk.cart, bk.coupon, me && me.id);
    const taken = bk.date ? API.takenSlots(s.id, bk.date) : {};
    const step = (n, t) => `<h3 class="font-label-md text-label-md flex items-center gap-2 mb-3"><span class="w-6 h-6 rounded-full bg-primary-container text-surface-container-high grid place-items-center text-[12px]">${n}</span>${t}</h3>`;
    const addrOptions = me && me.addresses && me.addresses.length ? `<div class="flex flex-col gap-2 mb-3">${me.addresses.map((a, i) => `<label class="flex gap-2 items-start p-3 rounded-lg border ${bk.addr.picked === i ? 'border-[#D9A857] bg-[#D9A857]/10' : 'border-primary-container/10'} cursor-pointer"><input type="radio" name="addrpick" value="${i}" ${bk.addr.picked === i ? 'checked' : ''} class="mt-1 text-primary-container"><span><b class="font-label-sm text-label-sm">${esc(a.label)}</b><br><span class="font-body-sm text-body-sm">${esc(a.line)}, ${esc(a.city)}</span></span></label>`).join('')}<label class="flex gap-2 items-center p-3 rounded-lg border ${bk.addr.picked === -1 ? 'border-[#D9A857] bg-[#D9A857]/10' : 'border-primary-container/10'} cursor-pointer"><input type="radio" name="addrpick" value="-1" ${bk.addr.picked === -1 ? 'checked' : ''} class="text-primary-container"><span class="font-label-sm text-label-sm">Use a new address</span></label></div>` : '';
    const newAddr = bk.addr.picked === -1 ? `<div class="flex flex-col gap-3">${field('House / flat, street and area', `<textarea id="gf-addr" rows="2" class="${inputCls}" placeholder="e.g. Flat 304, Tower B, Sector 54">${esc(bk.addr.line)}</textarea>`)}
        <div class="grid grid-cols-2 gap-3">${field('City', `<select id="gf-city" class="${inputCls}">${CITIES.slice(1).map((c) => `<option ${c === bk.addr.city || (bk.addr.city || '').includes(c) ? 'selected' : ''}>${c}</option>`).join('')}</select>`)}${field('Save as', `<select id="gf-label" class="${inputCls}">${['Home', 'Work', 'Other'].map((l) => `<option ${l === bk.addr.label ? 'selected' : ''}>${l}</option>`).join('')}</select>`)}</div>
        ${me ? `<label class="flex items-center gap-2 font-body-sm text-body-sm"><input id="gf-saveaddr" type="checkbox" ${bk.addr.save ? 'checked' : ''} class="rounded text-primary-container">Save this address for next time</label>` : ''}</div>` : '';
    el.innerHTML = `<div class="p-6 border-b border-primary-container/10">${step(1, 'Choose services')}
        <div class="flex flex-col gap-2">${s.items.map((it) => { const qn = bk.cart[it.id] || 0; return `<div class="flex items-center justify-between gap-3 p-3 rounded-lg border ${qn ? 'border-[#D9A857] bg-[#D9A857]/5' : 'border-primary-container/10'}">
          <div class="min-w-0"><p class="font-label-md text-label-md">${esc(it.name)}</p><p class="font-body-sm text-body-sm text-primary-container/60">${esc(it.desc)}</p><p class="font-label-sm text-label-sm mt-1">${rupee(it.price)} · ${it.mins >= 480 ? Math.round(it.mins / 480) + ' day' + (it.mins >= 960 ? 's' : '') : it.mins + ' min'}</p></div>
          ${qn ? `<div class="flex items-center gap-2 shrink-0"><button data-dec="${it.id}" class="w-8 h-8 rounded-lg border border-primary-container/30" aria-label="Remove one ${esc(it.name)}">−</button><span class="w-5 text-center font-label-md" aria-live="polite">${qn}</span><button data-inc="${it.id}" class="w-8 h-8 rounded-lg border border-primary-container/30" aria-label="Add one more ${esc(it.name)}">+</button></div>` : `<button data-inc="${it.id}" class="shrink-0 border border-primary-container/40 px-4 py-1.5 rounded-lg font-label-sm text-label-sm hover:bg-primary-container hover:text-surface-container-high transition-colors">Add</button>`}</div>`; }).join('')}</div></div>
      <div class="p-6 border-b border-primary-container/10">${step(2, 'Pick a date and time')}
        <div class="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">${next7().map((d) => { const v = ymd(d); const any = SLOTS.some((h) => slotOpen(v, h, API.takenSlots(s.id, v))); return `<button data-date="${v}" ${any ? '' : 'disabled'} class="shrink-0 w-16 py-2 rounded-lg border text-center ${bk.date === v ? 'bg-primary-container text-surface-container-high border-primary-container' : 'border-primary-container/20'} disabled:opacity-40"><span class="block font-label-sm text-[11px] uppercase">${d.toLocaleDateString('en-IN', { weekday: 'short' })}</span><span class="block font-headline-md text-[18px]">${d.getDate()}</span></button>`; }).join('')}</div>
        <div class="grid grid-cols-3 gap-2 mt-3">${SLOTS.map((h) => { const ok = bk.date && slotOpen(bk.date, h, taken); return `<button data-slot="${h}" ${ok ? '' : 'disabled'} class="py-2 rounded-lg border font-label-sm text-label-sm ${bk.slot === h ? 'bg-primary-container text-surface-container-high border-primary-container' : 'border-primary-container/20 hover:border-[#D9A857]'} disabled:opacity-35 disabled:line-through">${slotLabel(h)}</button>`; }).join('')}</div></div>
      <div class="p-6 border-b border-primary-container/10">${step(3, 'Where should we come?')}${addrOptions}${newAddr}
        <div class="mt-3">${field('Notes for the professional (optional)', `<input id="gf-notes" class="${inputCls}" value="${esc(bk.notes)}" placeholder="e.g. gate code, parking, preferences">`)}</div></div>
      <div class="p-6">${step(4, 'Review and book')}
        ${q.lines.length ? `<div class="flex flex-col gap-1 font-body-md text-body-md">${q.lines.map((l) => `<div class="flex justify-between"><span>${esc(l.name)}${l.qty > 1 ? ' × ' + l.qty : ''}</span><span>${rupee(l.total)}</span></div>`).join('')}
          <div class="flex justify-between text-primary-container/70"><span>Visit fee${q.fee ? '' : ' (free above ' + rupee(FREE_FEE_ABOVE) + ')'}</span><span>${q.fee ? rupee(q.fee) : 'Free'}</span></div>
          ${q.discount ? `<div class="flex justify-between text-[#2e7d32]"><span>Coupon ${esc(bk.coupon.toUpperCase())}</span><span>− ${rupee(q.discount)}</span></div>` : ''}
          <div class="flex justify-between font-headline-md text-[20px] border-t border-primary-container/10 pt-2 mt-1"><span>Total</span><span>${rupee(q.total)}</span></div>
          <p class="font-body-sm text-body-sm text-primary-container/60">Prices include taxes. Pay after the service, by UPI, card or cash.</p></div>
          <div class="flex gap-2 mt-4"><input id="gf-coupon" class="${inputCls}" placeholder="Coupon code (try FIRSTFIX)" value="${esc(bk.coupon)}"><button id="gf-apply" class="${btnLight} py-2">Apply</button></div>
          ${bk.coupon ? `<p class="font-body-sm text-body-sm mt-1 ${q.couponOk ? 'text-[#2e7d32]' : 'text-[#ba1a1a]'}">${esc(q.couponMsg)}</p>` : ''}`
        : '<p class="font-body-md text-body-md text-primary-container/60">Add at least one service to see your total.</p>'}
        <p id="gf-book-err" class="text-[#ba1a1a] font-body-sm text-body-sm mt-3 hidden" role="alert"></p>
        <button id="gf-book-btn" class="${btnDark} w-full mt-4" ${q.lines.length ? '' : 'disabled'}>${me ? 'Confirm booking' + (q.lines.length ? ' · ' + rupee(q.total) : '') : 'Sign in to book'}</button>
        ${me ? '' : '<p class="font-body-sm text-body-sm text-primary-container/60 mt-2 text-center">New here? You can create an account in a few seconds.</p>'}</div>`;
    // events
    $$('[data-inc]', el).forEach((b) => b.addEventListener('click', () => { bk.cart[b.dataset.inc] = Math.min(5, (bk.cart[b.dataset.inc] || 0) + 1); renderBookPanel(); }));
    $$('[data-dec]', el).forEach((b) => b.addEventListener('click', () => { bk.cart[b.dataset.dec] = Math.max(0, (bk.cart[b.dataset.dec] || 0) - 1); renderBookPanel(); }));
    $$('[data-date]', el).forEach((b) => b.addEventListener('click', () => { bk.date = b.dataset.date; bk.slot = null; renderBookPanel(); }));
    $$('[data-slot]', el).forEach((b) => b.addEventListener('click', () => { bk.slot = Number(b.dataset.slot); renderBookPanel(); }));
    $$('input[name=addrpick]', el).forEach((r) => r.addEventListener('change', () => { const i = Number(r.value); const a = me.addresses[i]; bk.addr = i >= 0 ? { line: a.line, label: a.label, city: a.city, picked: i, save: false } : { line: '', label: 'Home', city: store.get(LKEY, CITIES[1]), picked: -1, save: true }; renderBookPanel(); }));
    const sync = () => { const a = $('#gf-addr', el); if (a) bk.addr.line = a.value; const c = $('#gf-city', el); if (c) bk.addr.city = c.value; const l = $('#gf-label', el); if (l) bk.addr.label = l.value; const sv = $('#gf-saveaddr', el); if (sv) bk.addr.save = sv.checked; const n = $('#gf-notes', el); if (n) bk.notes = n.value; };
    ['#gf-addr', '#gf-city', '#gf-label', '#gf-saveaddr', '#gf-notes'].forEach((sel) => { const x = $(sel, el); if (x) x.addEventListener('input', sync); if (x) x.addEventListener('change', sync); });
    const ap = $('#gf-apply', el); if (ap) ap.addEventListener('click', () => { bk.coupon = $('#gf-coupon', el).value.trim(); renderBookPanel(); });
    $('#gf-book-btn', el).addEventListener('click', () => {
      sync();
      const go = async () => {
        const err = $('#gf-book-err'); err.classList.add('hidden');
        try {
          const b = await busy($('#gf-book-btn'), () => API.createBooking({ serviceId: s.id, cart: bk.cart, date: bk.date, slot: bk.slot, address: { line: bk.addr.line, city: bk.addr.city, label: bk.addr.label, save: bk.addr.picked === -1 && bk.addr.save }, notes: bk.notes, coupon: bk.coupon }));
          bk = null; location.hash = '#/booking/' + b.id + '/new';
        } catch (ex) { err.textContent = ex.userFacing ? ex.message : 'Something went wrong. Please try again.'; err.classList.remove('hidden'); renderHeader(); }
      };
      if (!API.me()) openAuth('signin', () => { renderBookPanel(); }); else go();
    });
  }

  const statusPill = (st) => { const m = { Upcoming: 'bg-[#D9A857]/20 text-[#6b511f]', 'In progress': 'bg-[#1565c0]/15 text-[#0d47a1]', Completed: 'bg-[#2e7d32]/15 text-[#1b5e20]', Cancelled: 'bg-[#ba1a1a]/10 text-[#93000a]' }; return `<span class="px-2.5 py-1 rounded-full font-label-sm text-label-sm ${m[st] || ''}">${st}</span>`; };

  function viewBooking(id, isNew) {
    const b = API.booking(id); if (!b) return wrapPage(`<p class="font-body-lg text-body-lg">We couldn’t find that booking. <a class="underline" href="#/bookings">See your bookings</a>.</p>`);
    const s = svcById(b.serviceId);
    const steps = ['Booked', 'Professional assigned', 'Service in progress', 'Completed'];
    const reached = b.status === 'Cancelled' ? -1 : b.status === 'Completed' ? 3 : b.status === 'In progress' ? 2 : 1;
    return wrapPage(crumbs([['Home', '#/'], ['Your bookings', '#/bookings'], [b.id]]) + `
      ${isNew ? `<div class="bg-[#2e7d32]/10 border border-[#2e7d32]/30 rounded-2xl p-6 mb-6 flex gap-4 items-start">${icon('task_alt', 'text-[#2e7d32] text-[36px]')}<div><h1 class="font-headline-lg text-headline-lg text-[#1b5e20]">Booking confirmed</h1><p class="font-body-md text-body-md">Your booking ID is <b>${b.id}</b>. ${esc(b.pro)} will reach you on ${fmtDate(b.date)} at ${slotLabel(b.slot)}. Share the OTP <b>${b.otp}</b> to start the job.</p></div></div>` : `<h1 class="font-headline-lg text-headline-lg mb-4">Booking ${b.id}</h1>`}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div class="min-w-0 lg:col-span-7 bg-surface rounded-2xl border border-primary-container/10 p-6 flex flex-col gap-5">
          <div class="flex items-center justify-between gap-3"><div class="flex items-center gap-3"><img src="${s.img}" alt="" class="w-14 h-14 rounded-lg object-cover"><div><p class="font-label-sm text-label-sm text-primary-container/60">${esc(s.label)}</p><h2 class="font-headline-md text-[20px]">${esc(s.title)}</h2></div></div>${statusPill(b.status)}</div>
          ${b.status !== 'Cancelled' ? `<ol class="grid grid-cols-4 gap-2">${steps.map((t, i) => `<li class="flex flex-col gap-1"><span class="h-1.5 rounded-full ${i <= reached ? 'bg-[#D9A857]' : 'bg-primary-container/10'}"></span><span class="font-label-sm text-[11px] ${i <= reached ? '' : 'text-primary-container/50'}">${t}</span></li>`).join('')}</ol>` : `<p class="font-body-md text-body-md text-[#93000a]">This booking was cancelled${b.cancelReason ? ': ' + esc(b.cancelReason) : ''}.</p>`}
          <dl class="grid sm:grid-cols-2 gap-4 font-body-md text-body-md">
            <div><dt class="font-label-sm text-label-sm text-primary-container/60">When</dt><dd>${fmtDate(b.date)}, ${slotLabel(b.slot)}</dd></div>
            <div><dt class="font-label-sm text-label-sm text-primary-container/60">Where</dt><dd>${esc(b.address.line)}, ${esc(b.address.city)}</dd></div>
            <div><dt class="font-label-sm text-label-sm text-primary-container/60">Professional</dt><dd>${esc(b.pro)} · ★ ${b.proRating}</dd></div>
            <div><dt class="font-label-sm text-label-sm text-primary-container/60">Start-job OTP</dt><dd class="tracking-[0.3em] font-bold">${b.otp}</dd></div>
            ${b.notes ? `<div class="sm:col-span-2"><dt class="font-label-sm text-label-sm text-primary-container/60">Your notes</dt><dd>${esc(b.notes)}</dd></div>` : ''}
          </dl>
          <div><h3 class="font-label-md text-label-md mb-2">Activity</h3><ul class="flex flex-col gap-1 font-body-sm text-body-sm text-primary-container/70">${b.history.slice().reverse().map((h) => `<li>${new Date(h.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })} · ${esc(h.what)}</li>`).join('')}</ul></div>
        </div>
        <div class="min-w-0 lg:col-span-5 flex flex-col gap-gutter">
          <div class="bg-surface rounded-2xl border border-primary-container/10 p-6 font-body-md text-body-md"><h3 class="font-label-md text-label-md mb-3">Payment summary</h3>
            ${b.lines.map((l) => `<div class="flex justify-between"><span>${esc(l.name)}${l.qty > 1 ? ' × ' + l.qty : ''}</span><span>${rupee(l.total)}</span></div>`).join('')}
            <div class="flex justify-between text-primary-container/70"><span>Visit fee</span><span>${b.fee ? rupee(b.fee) : 'Free'}</span></div>
            ${b.discount ? `<div class="flex justify-between text-[#2e7d32]"><span>Coupon ${esc(b.coupon)}</span><span>− ${rupee(b.discount)}</span></div>` : ''}
            <div class="flex justify-between font-headline-md text-[20px] border-t border-primary-container/10 pt-2 mt-2"><span>Total</span><span>${rupee(b.total)}</span></div>
            <p class="font-body-sm text-body-sm text-primary-container/60 mt-1">${esc(b.payment)}</p></div>
          <div class="flex flex-col gap-2">
            ${b.status === 'Upcoming' ? `<button data-resched="${b.id}" class="${btnDark}">Reschedule</button><button data-cancel="${b.id}" class="${btnLight}">Cancel booking</button>` : ''}
            ${b.status === 'Completed' && !b.rating ? `<button data-rate="${b.id}" class="${btnDark}">Rate this service</button>` : ''}
            ${b.rating ? `<p class="font-body-md text-body-md">You rated this ${'★'.repeat(b.rating.stars)}${'☆'.repeat(5 - b.rating.stars)}${b.rating.comment ? ': “' + esc(b.rating.comment) + '”' : ''}</p>` : ''}
            <a href="#/service/${s.id}" class="${btnLight} text-center">Book again</a>
            <a href="#/support?b=${b.id}" class="font-body-sm text-body-sm underline text-center mt-1">Need help with this booking?</a>
          </div></div></div>`);
  }

  let bookingsTab = 'Upcoming';
  function viewBookings() {
    if (!API.me()) return wrapPage(`<div class="max-w-md mx-auto text-center flex flex-col items-center gap-4 py-10">${icon('shopping_basket', 'text-[48px] text-[#D9A857]')}<h1 class="font-headline-lg text-headline-lg">Your bookings</h1><p class="font-body-md text-body-md text-primary-container/70">Sign in to see and manage your bookings.</p><button id="gf-need-signin" class="${btnDark}">Sign in</button></div>`);
    const all = API.myBookings(); const tabs = ['Upcoming', 'Completed', 'Cancelled'];
    const list = all.filter((b) => (bookingsTab === 'Upcoming' ? b.status === 'Upcoming' || b.status === 'In progress' : b.status === bookingsTab));
    return wrapPage(crumbs([['Home', '#/'], ['Your bookings']]) + `<h1 class="font-headline-lg text-headline-lg mb-6">Your bookings</h1>
      <div class="flex gap-2 mb-6" role="tablist">${tabs.map((t) => { const n = all.filter((b) => (t === 'Upcoming' ? b.status === 'Upcoming' || b.status === 'In progress' : b.status === t)).length; return `<button role="tab" aria-selected="${t === bookingsTab}" data-btab="${t}" class="px-4 py-2 rounded-lg font-label-md text-label-md ${t === bookingsTab ? 'bg-primary-container text-surface-container-high' : 'bg-primary-container/5'}">${t} (${n})</button>`; }).join('')}</div>
      ${list.length ? `<div class="grid md:grid-cols-2 gap-gutter">${list.map((b) => { const s = svcById(b.serviceId); return `<div class="bg-surface rounded-2xl border border-primary-container/10 p-5 flex flex-col gap-3">
          <div class="flex items-start justify-between gap-3"><div class="flex items-center gap-3"><img src="${s.img}" alt="" class="w-12 h-12 rounded-lg object-cover"><div><p class="font-label-md text-label-md">${esc(s.title)}</p><p class="font-body-sm text-body-sm text-primary-container/60">${b.id} · ${b.lines.map((l) => esc(l.name)).join(', ')}</p></div></div>${statusPill(b.status)}</div>
          <p class="font-body-md text-body-md flex items-center gap-2">${icon('event', 'text-[18px]')}${fmtDate(b.date)}, ${slotLabel(b.slot)}</p>
          <p class="font-body-sm text-body-sm text-primary-container/70 flex items-center gap-2">${icon('location_on', 'text-[18px]')}${esc(b.address.line)}, ${esc(b.address.city)}</p>
          <div class="flex items-center justify-between mt-1"><b class="font-label-md text-label-md">${rupee(b.total)}</b><div class="flex gap-2">
            ${b.status === 'Upcoming' ? `<button data-resched="${b.id}" class="${btnLight} py-2 px-3">Reschedule</button><button data-cancel="${b.id}" class="${btnLight} py-2 px-3">Cancel</button>` : ''}
            ${b.status === 'Completed' && !b.rating ? `<button data-rate="${b.id}" class="${btnLight} py-2 px-3">Rate</button>` : ''}
            <a href="#/booking/${b.id}" class="${btnDark} py-2 px-3">Details</a></div></div></div>`; }).join('')}</div>`
        : `<div class="text-center py-16 bg-surface rounded-2xl border border-primary-container/10"><p class="font-body-lg text-body-lg mb-4">No ${bookingsTab.toLowerCase()} bookings yet.</p><a href="#/services" class="${btnDark} inline-block">Browse services</a></div>`}`);
  }
  function wireBookingActions(root) {
    $$('[data-btab]', root).forEach((b) => b.addEventListener('click', () => { bookingsTab = b.dataset.btab; route(); }));
    const ns = $('#gf-need-signin', root); if (ns) ns.addEventListener('click', () => openAuth('signin'));
    $$('[data-cancel]', root).forEach((b) => b.addEventListener('click', () => {
      const m = openModal(modalHead('Cancel this booking?', 'Cancelling is free up to 1 hour before the slot.') + `<form class="p-6 pt-2 flex flex-col gap-3">${['Booked by mistake', 'Found a different time', 'Issue already fixed', 'Other'].map((r, i) => `<label class="flex items-center gap-2 font-body-md text-body-md"><input type="radio" name="r" value="${r}" ${i === 0 ? 'checked' : ''} class="text-primary-container">${r}</label>`).join('')}<div class="flex gap-2 mt-2"><button type="button" data-close class="${btnLight} flex-1">Keep booking</button><button class="${btnDark} flex-1" type="submit">Cancel booking</button></div></form>`);
      $('form', m).addEventListener('submit', async (e) => { e.preventDefault(); try { await busy($('button[type=submit]', m), () => API.cancelBooking(b.dataset.cancel, new FormData(e.target).get('r'))); closeModal(); toast('Booking cancelled'); route(); } catch (ex) { toast(ex.message, 'error'); } });
    }));
    $$('[data-resched]', root).forEach((b) => b.addEventListener('click', () => {
      const bo = API.booking(b.dataset.resched); let date = bo.date, slot = bo.slot;
      const draw = () => { const taken = API.takenSlots(bo.serviceId, date); const m = openModal(modalHead('Reschedule', 'Pick a new date and time.') + `<div class="p-6 pt-2"><div class="flex gap-2 overflow-x-auto pb-2">${next7().map((d) => { const v = ymd(d); return `<button data-d="${v}" class="shrink-0 w-16 py-2 rounded-lg border text-center ${date === v ? 'bg-primary-container text-surface-container-high' : 'border-primary-container/20'}"><span class="block text-[11px] uppercase">${d.toLocaleDateString('en-IN', { weekday: 'short' })}</span><span class="block font-headline-md text-[18px]">${d.getDate()}</span></button>`; }).join('')}</div>
          <div class="grid grid-cols-3 gap-2 mt-3">${SLOTS.map((h) => { const ok = slotOpen(date, h, taken) || (date === bo.date && h === bo.slot); return `<button data-s="${h}" ${ok ? '' : 'disabled'} class="py-2 rounded-lg border font-label-sm text-label-sm ${slot === h ? 'bg-primary-container text-surface-container-high' : 'border-primary-container/20'} disabled:opacity-35">${slotLabel(h)}</button>`; }).join('')}</div>
          <button id="gf-resched-go" class="${btnDark} w-full mt-4">Confirm new time</button></div>`);
        $$('[data-d]', m).forEach((x) => x.addEventListener('click', () => { date = x.dataset.d; slot = null; draw(); }));
        $$('[data-s]', m).forEach((x) => x.addEventListener('click', () => { slot = Number(x.dataset.s); draw(); }));
        $('#gf-resched-go', m).addEventListener('click', async () => { if (slot == null) return toast('Choose a time slot', 'error'); if (date === bo.date && slot === bo.slot) return closeModal(); try { await busy($('#gf-resched-go'), () => API.reschedule(bo.id, date, slot)); closeModal(); toast('Booking rescheduled'); route(); } catch (ex) { toast(ex.message, 'error'); } }); };
      draw();
    }));
    $$('[data-rate]', root).forEach((b) => b.addEventListener('click', () => {
      let n = 5; const draw = () => { const m = openModal(modalHead('How was your service?') + `<div class="p-6 pt-2 flex flex-col gap-3"><div class="flex gap-1 text-[32px]" role="radiogroup" aria-label="Rating">${[1, 2, 3, 4, 5].map((i) => `<button data-st="${i}" role="radio" aria-checked="${i === n}" aria-label="${i} star${i > 1 ? 's' : ''}" class="${i <= n ? 'text-[#D9A857]' : 'text-primary-container/20'}">★</button>`).join('')}</div><textarea id="gf-rc" rows="3" class="${inputCls}" placeholder="Tell us what went well (optional)"></textarea><button id="gf-rate-go" class="${btnDark}">Submit rating</button></div>`);
        $$('[data-st]', m).forEach((x) => x.addEventListener('click', () => { n = Number(x.dataset.st); draw(); }));
        $('#gf-rate-go', m).addEventListener('click', async () => { await API.rate(b.dataset.rate, n, $('#gf-rc').value); closeModal(); toast('Thanks for your feedback!'); route(); }); };
      draw();
    }));
  }

  function viewAccount() {
    const me = API.me(); if (!me) { setTimeout(() => openAuth('signin'), 0); return wrapPage('<p class="font-body-lg text-body-lg">Please sign in to see your profile.</p>'); }
    return wrapPage(crumbs([['Home', '#/'], ['Profile & addresses']]) + `<h1 class="font-headline-lg text-headline-lg mb-6">Profile & addresses</h1>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <form id="gf-profile" class="bg-surface rounded-2xl border border-primary-container/10 p-6 flex flex-col gap-4" novalidate><h2 class="font-headline-md text-[20px]">Your details</h2>
          ${field('Full name', `<input name="name" value="${esc(me.name)}" class="${inputCls}">`)}${field('Mobile number', `<input name="phone" value="${esc(me.phone)}" maxlength="10" inputmode="numeric" class="${inputCls}">`)}${field('Email', `<input value="${esc(me.email)}" disabled class="${inputCls} opacity-60">`, 'Email can’t be changed')}
          <p class="gf-err text-[#ba1a1a] font-body-sm text-body-sm hidden" role="alert"></p><button class="${btnDark} self-start" type="submit">Save changes</button>
          <p class="font-body-sm text-body-sm text-primary-container/60">Member since ${new Date(me.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} · ${API.myBookings().length} bookings</p></form>
        <div class="bg-surface rounded-2xl border border-primary-container/10 p-6 flex flex-col gap-3"><h2 class="font-headline-md text-[20px]">Saved addresses</h2>
          ${me.addresses.length ? me.addresses.map((a, i) => `<div class="flex justify-between items-start gap-3 p-3 rounded-lg border border-primary-container/10"><div><b class="font-label-sm text-label-sm">${esc(a.label)}</b><p class="font-body-sm text-body-sm">${esc(a.line)}, ${esc(a.city)}</p></div><button data-deladdr="${i}" class="text-[#93000a] font-label-sm text-label-sm">Remove</button></div>`).join('') : '<p class="font-body-md text-body-md text-primary-container/60">No saved addresses yet. They are added when you book.</p>'}
          <form id="gf-addaddr" class="flex flex-col gap-3 mt-2 border-t border-primary-container/10 pt-4"><h3 class="font-label-md text-label-md">Add an address</h3>${field('House / flat, street and area', `<input name="line" class="${inputCls}">`)}<div class="grid grid-cols-2 gap-3">${field('City', `<select name="city" class="${inputCls}">${CITIES.slice(1).map((c) => `<option>${c}</option>`).join('')}</select>`)}${field('Label', `<select name="label" class="${inputCls}"><option>Home</option><option>Work</option><option>Other</option></select>`)}</div><button class="${btnLight} self-start" type="submit">Add address</button></form></div></div>`);
  }
  function wireAccount(root) {
    const pf = $('#gf-profile', root); if (!pf) return;
    pf.addEventListener('submit', async (e) => { e.preventDefault(); const err = $('.gf-err', pf); err.classList.add('hidden'); const d = Object.fromEntries(new FormData(pf).entries()); try { await busy($('button[type=submit]', pf), () => API.updateProfile({ name: d.name, phone: d.phone })); toast('Profile updated'); renderHeader(); route(); } catch (ex) { err.textContent = ex.message; err.classList.remove('hidden'); } });
    $$('[data-deladdr]', root).forEach((b) => b.addEventListener('click', async () => { const me = API.me(); const list = me.addresses.slice(); list.splice(Number(b.dataset.deladdr), 1); await API.updateProfile({ addresses: list }); toast('Address removed'); route(); }));
    $('#gf-addaddr', root).addEventListener('submit', async (e) => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target).entries()); if ((d.line || '').trim().length < 5) return toast('Please enter the full address', 'error'); const me = API.me(); await API.updateProfile({ addresses: me.addresses.concat([{ line: d.line.trim(), city: d.city, label: d.label }]) }); toast('Address saved'); route(); });
  }

  const HELP = [['How do I book a service?', 'Open a service, add what you need, pick a date and time, add your address and confirm. You’ll get a booking ID and an OTP instantly.'], ['Can I reschedule or cancel?', 'Yes, free of charge up to 1 hour before your slot, from Your Bookings.'], ['How do I pay?', 'After the service, by UPI, card or cash. You only pay the amount shown at booking, plus any spare parts you approve.'], ['Are professionals verified?', 'Every professional is background-checked and trained before joining GharFix.'], ['What if I’m not happy with the work?', 'Raise a ticket within 7 days. Repairs are covered by the warranty shown on each service.'], ['Which cities do you serve?', CITIES.slice(1).join(', ') + '.']];
  function viewSupport(params) {
    const me = API.me(); const bookings = me ? API.myBookings() : []; const tickets = me ? API.myTickets() : [];
    const pre = params.get('b') || '';
    return wrapPage(crumbs([['Home', '#/'], ['Support']]) + `<h1 class="font-headline-lg text-headline-lg mb-2">Help & support</h1><p class="font-body-md text-body-md text-primary-container/70 mb-8">Answers to common questions, or write to us and we’ll reply within 24 hours.</p>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div class="min-w-0 lg:col-span-7"><h2 class="font-headline-md text-[20px] mb-3">Frequently asked questions</h2>${HELP.map(([q, a]) => `<details class="bg-surface rounded-xl border border-primary-container/10 mb-2 group"><summary class="cursor-pointer list-none p-4 font-label-md text-label-md flex justify-between items-center">${esc(q)}${icon('expand_more', 'group-open:rotate-180 transition-transform')}</summary><p class="px-4 pb-4 font-body-md text-body-md text-primary-container/80">${esc(a)}</p></details>`).join('')}
          <div class="grid sm:grid-cols-3 gap-3 mt-6">${[['call', 'Call us', '1800-123-4567', 'tel:18001234567'], ['mail', 'Email', 'help@gharfix.in', 'mailto:help@gharfix.in'], ['chat', 'WhatsApp', '+91 98765 43210', 'https://wa.me/919876543210']].map(([i, t, v, h]) => `<a href="${h}" class="bg-surface rounded-xl border border-primary-container/10 p-4 flex flex-col gap-1 hover:border-[#D9A857]">${icon(i, 'text-[#8a6a2f]')}<b class="font-label-md text-label-md">${t}</b><span class="font-body-sm text-body-sm">${v}</span></a>`).join('')}</div></div>
        <div class="min-w-0 lg:col-span-5 flex flex-col gap-gutter">
          <form id="gf-ticket" class="bg-surface rounded-2xl border border-primary-container/10 p-6 flex flex-col gap-4" novalidate><h2 class="font-headline-md text-[20px]">Write to us</h2>
            ${me ? '' : field('Your email', `<input name="email" type="email" class="${inputCls}">`)}
            ${field('Topic', `<select name="subject" class="${inputCls}"><option value="">Choose a topic</option>${['Booking issue', 'Payment or refund', 'Professional feedback', 'Reschedule / cancel help', 'Something else'].map((t) => `<option ${pre && t === 'Booking issue' ? 'selected' : ''}>${t}</option>`).join('')}</select>`)}
            ${me && bookings.length ? field('Related booking (optional)', `<select name="bookingId" class="${inputCls}"><option value="">None</option>${bookings.map((b) => `<option value="${b.id}" ${b.id === pre ? 'selected' : ''}>${b.id} · ${esc(svcById(b.serviceId).title)}</option>`).join('')}</select>`) : ''}
            ${field('Message', `<textarea name="message" rows="4" class="${inputCls}" placeholder="Tell us what happened"></textarea>`)}
            <p class="gf-err text-[#ba1a1a] font-body-sm text-body-sm hidden" role="alert"></p><button class="${btnDark}" type="submit">Send message</button></form>
          ${tickets.length ? `<div class="bg-surface rounded-2xl border border-primary-container/10 p-6"><h2 class="font-headline-md text-[20px] mb-3">Your tickets</h2>${tickets.map((t) => `<div class="py-3 border-b border-primary-container/10 last:border-0"><div class="flex justify-between gap-3"><b class="font-label-md text-label-md">${t.id} · ${esc(t.subject)}</b><span class="px-2 py-0.5 rounded-full bg-[#D9A857]/20 font-label-sm text-label-sm">${t.status}</span></div><p class="font-body-sm text-body-sm text-primary-container/70 mt-1">${esc(t.message)}</p></div>`).join('')}</div>` : ''}
        </div></div>`);
  }
  function wireSupport(root) {
    const f = $('#gf-ticket', root); if (!f) return;
    f.addEventListener('submit', async (e) => { e.preventDefault(); const err = $('.gf-err', f); err.classList.add('hidden'); const d = Object.fromEntries(new FormData(f).entries()); try { const t = await busy($('button[type=submit]', f), () => API.createTicket(d)); toast(`Ticket ${t.id} created. We’ll reply within 24 hours.`); route(); } catch (ex) { err.textContent = ex.message; err.classList.remove('hidden'); } });
  }
  function viewNotFound() { return wrapPage(`<div class="text-center py-16"><h1 class="font-headline-lg text-headline-lg mb-2">Page not found</h1><a class="underline" href="#/">Back to home</a></div>`); }

  // ------------------------------------------------------------------ router
  function route() {
    const path = currentPath(); const [p, qs] = path.split('?'); const params = new URLSearchParams(qs || '');
    const parts = p.split('/').filter(Boolean); const home = parts.length === 0;
    document.body.classList.toggle('gf-app-route', !home);
    const view = $('#view-app'); const homeMain = $('#view-home');
    renderHeader();
    if (home) { view.innerHTML = ''; view.classList.add('hidden'); homeMain.classList.remove('hidden'); window.dispatchEvent(new Event('resize')); document.title = 'GharFix · Home Services, On Your Schedule'; return; }
    homeMain.classList.add('hidden'); view.classList.remove('hidden');
    let html = ''; let title = 'GharFix';
    if (parts[0] === 'services') { html = viewServices(); title = 'All services · GharFix'; }
    else if (parts[0] === 'service') { html = viewService(parts[1]); const s = svcById(parts[1]); title = (s ? s.title : 'Service') + ' · GharFix'; }
    else if (parts[0] === 'bookings') { html = viewBookings(); title = 'Your bookings · GharFix'; }
    else if (parts[0] === 'booking') { html = viewBooking(parts[1], parts[2] === 'new'); title = 'Booking ' + parts[1] + ' · GharFix'; }
    else if (parts[0] === 'account') { html = viewAccount(); title = 'Profile · GharFix'; }
    else if (parts[0] === 'support') { html = viewSupport(params); title = 'Support · GharFix'; }
    else html = viewNotFound();
    view.innerHTML = html; document.title = title;
    if (parts[0] === 'service' && svcById(parts[1])) renderBookPanel();
    wireBookingActions(view); wireAccount(view); wireSupport(view);
    const h1 = view.querySelector('h1'); if (h1) { h1.setAttribute('tabindex', '-1'); }
  }
  let lastPath = null;
  window.addEventListener('hashchange', () => { const p = currentPath().split('?')[0]; if (p !== lastPath) { window.scrollTo(0, 0); lastPath = p; } closeModal(); route(); });

  // ------------------------------------------------------------------ home page wiring
  function wireHome() {
    const order = ['e-appliance', 'electrician', 'plumber', 'carpenter', 'painting', 'cleaning', 'wall-panelling', 'salon'];
    $$('[data-card]').forEach((card, i) => { const id = order[i]; card.setAttribute('role', 'link'); card.setAttribute('tabindex', '0'); card.setAttribute('aria-label', svcById(id).title); card.addEventListener('click', () => { location.hash = '#/service/' + id; }); card.addEventListener('keydown', (e) => { if (e.key === 'Enter') location.hash = '#/service/' + id; }); });
    $$('[data-side]').forEach((a, i) => { a.setAttribute('href', '#/service/' + order[i]); });
    const all = $('[data-viewall]'); if (all) all.addEventListener('click', () => { location.hash = '#/services'; });
    const ex = $('[data-explore]'); if (ex) ex.addEventListener('click', () => { const t = $('#services'); if (t) t.scrollIntoView({ behavior: 'smooth' }); });
  }
  document.addEventListener('DOMContentLoaded', () => { wireHome(); lastPath = currentPath().split('?')[0]; route(); });
  window.GharFix = { API, SERVICES };
})();
