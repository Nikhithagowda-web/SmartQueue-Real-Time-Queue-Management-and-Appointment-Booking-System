import { useState, useEffect } from "react";
import './App.css';

function App() {
  const [page, setPage] = useState("home");
  const [show, setShow] = useState("");

  const sampleData = [
    { token: "Q-021", name: "Ravi", service: "Hospital", status: "completed" },
    { token: "Q-022", name: "Priya", service: "Hospital", status: "completed" },
    { token: "Q-023", name: "Dhanushri", service: "Hospital", status: "completed" },
    { token: "Q-024", name: "Manu", service: "Bank", status: "serving" },
    { token: "Q-025", name: "Divya", service: "Salon", status: "waiting" },
    { token: "Q-026", name: "Anusha", service: "Hospital", status: "waiting" },
    { token: "Q-027", name: "ruchitha", service: "Hospital", status: "waiting" },
    { token: "Q-028", name: "varshitha", service: "Hospital", status: "waiting" },
  ];

  const [queueList, setQueueList] = useState(() => {
    const saved = localStorage.getItem("smartqueue_bookings");
    if (saved) return JSON.parse(saved);
    return sampleData;
  });
  const [lastRefresh, setLastRefresh] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    localStorage.setItem("smartqueue_bookings", JSON.stringify(queueList));
  }, [queueList]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [isSignup, setIsSignup] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const times = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM"];

  const currentPerson = queueList.find(p => p.status === "serving");
  const waitingCount = queueList.filter(p => p.status === "waiting").length;
  const servedCount = queueList.filter(p => p.status === "completed").length;

  const goTo = (id) => {
    if (id === "book") { setPage("book"); setShow(""); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    if (id === "login") { setLoginEmail(""); setLoginPassword(""); setSignupName(""); setLoginError(""); setPage("login"); setShow(""); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    if (id === "staff") { setPage("staff"); setShow(""); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    if (page !== "home") { setPage("home"); setTimeout(() => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); }, 100); }
    else { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); }
  };

  const cleanService = (s) => s.replace("🏥 ", "").replace("💇 ", "").replace("🏦 ", "").replace("🏛️ ", "");

  // REALISTIC BOOKING: New person ALWAYS goes to LAST as Waiting, never jumps line
  const bookToken = () => {
    if (!name || !phone || !service || !date || !time) { alert("Please fill all * fields!"); return; }
    const clean = cleanService(service);
    const lastTokenNum = queueList.length > 0 ? parseInt(queueList[queueList.length - 1].token.split("-")[1]) : 20;
    const newToken = `Q-0${lastTokenNum + 1}`;
    // If queue is totally empty or all completed, first person is Serving. Else always Waiting.
    const anyoneServing = queueList.some(p => p.status === "serving");
    const anyoneWaiting = queueList.some(p => p.status === "waiting");
    const newStatus = (!anyoneServing && !anyoneWaiting) ? "serving" : "waiting";
    const newPerson = { token: newToken, name: name, service: clean, status: newStatus };
    setQueueList([...queueList, newPerson]);
    alert(`Thank you ${name}! Your Token is ${newToken} for ${clean} on ${date} at ${time}\nStatus: ${newStatus === "serving" ? "Serving Now - Go to Counter" : "Waiting - Please wait for your turn"}`);
    setPage("home"); setShow("track");
    setName(""); setPhone(""); setEmail(""); setDate(""); setTime("");
  };

  const bookService = (s) => { setService(s); setPage("book"); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const handleSignup = () => {
    if (!signupName || !loginEmail || !loginPassword) { alert("Please fill Name, Email and Password!"); return; }
    if (loginPassword.length < 4) { alert("Password must be at least 4 characters!"); return; }
    const savedUsers = JSON.parse(localStorage.getItem("smartqueue_users") || "[]");
    if (savedUsers.find(u => u.email === loginEmail)) { alert("This Email already exists! Please Login instead."); setIsSignup(false); return; }
    savedUsers.push({ name: signupName, email: loginEmail, password: loginPassword });
    localStorage.setItem("smartqueue_users", JSON.stringify(savedUsers));
    alert(`Account Created! 🎉\nWelcome ${signupName}!`);
    setIsSignup(false); setLoginError(""); setSignupName(""); setLoginEmail(""); setLoginPassword("");
  };

  const handleLogin = () => {
    const savedUsers = JSON.parse(localStorage.getItem("smartqueue_users") || "[]");
    if (savedUsers.length === 0) { setLoginError("❌ No account found! Please Create New Account first."); alert("❌ No account found!"); return; }
    const found = savedUsers.find(u => u.email === loginEmail && u.password === loginPassword);
    if (found) { setLoginError(""); alert(`Login Successful! Welcome ${found.name} ✅`); setLoginEmail(""); setLoginPassword(""); setSignupName(""); setPage("staff"); }
    else { setLoginError("❌ Wrong Email or Password!"); alert("❌ Wrong Email or Password!"); }
  };

  // REALISTIC CALL NEXT - Only 1 person at a time, like real doctor
  const callNext = () => {
    const servingIndex = queueList.findIndex(p => p.status === "serving");
    if (servingIndex === -1) {
      const firstWaiting = queueList.findIndex(p => p.status === "waiting");
      if (firstWaiting === -1) { alert("All Completed ✅\nBook new appointment to start again."); return; }
      const updated = [...queueList];
      updated[firstWaiting] = { ...updated[firstWaiting], status: "serving" };
      setQueueList(updated);
      alert(`Now Serving: ${updated[firstWaiting].token} - ${updated[firstWaiting].name} 📢`);
      return;
    }
    const updatedList = [...queueList];
    const donePerson = updatedList[servingIndex];
    updatedList[servingIndex] = { ...donePerson, status: "completed" };
    const nextIndex = updatedList.findIndex((p, i) => i > servingIndex && p.status === "waiting");
    if (nextIndex !== -1) {
      updatedList[nextIndex] = { ...updatedList[nextIndex], status: "serving" };
      setQueueList(updatedList);
      alert(`✅ ${donePerson.name} Completed!\nNow Serving: ${updatedList[nextIndex].token} - ${updatedList[nextIndex].name} 📢`);
    } else {
      setQueueList(updatedList);
      alert(`✅ ${donePerson.name} Completed!\nAll Queue Finished! 🎉`);
    }
  };

  const refreshQueue = () => {
    const saved = localStorage.getItem("smartqueue_bookings");
    if (saved) setQueueList(JSON.parse(saved));
    setLastRefresh(new Date().toLocaleTimeString());
    alert(`Queue Refreshed ✅\nTime: ${new Date().toLocaleTimeString()}`);
  };

  const stopAutofill = (e) => { e.target.removeAttribute('readOnly'); };

  return (
    <div>
      <nav className="navbar">
        <h2 className="logo" onClick={() => goTo("home")}>✦ SmartQueue</h2>
        <div className="nav-links">
          <button onClick={() => goTo("home")} className="nav-btn">Home</button>
          <button onClick={() => goTo("about")} className="nav-btn">About</button>
          <button onClick={() => goTo("services")} className="nav-btn">Services</button>
          <button onClick={() => goTo("login")} className="nav-btn">Login</button>
          <button onClick={() => goTo("staff")} className="nav-btn">Staff Dashboard</button>
        </div>
      </nav>

      {page === "home" && (
        <>
          <div id="home" className="hero">
            <span className="badge">🔥 No More Waiting In Line</span>
            <h1>Skip the Wait.<br /><span className="gradient-text">Save Your Time.</span></h1>
            <p className="hero-sub">Book your spot from anywhere. Get live updates and walk in right on time.</p>
            <div className="hero-buttons">
              <button onClick={() => goTo("book")} className="btn-big-blue">📅 Book Appointment</button>
              <button onClick={() => setShow(show === "track" ? "" : "track")} className="btn-big-white">👀 Track My Queue</button>
            </div>
            {show === "track" && (
              <div className="popup-card track-card">
                {currentPerson ? (
                  <>
                    <p className="live-text">● LIVE QUEUE - NOW SERVING</p>
                    <h1 className="big-token">{currentPerson.token}</h1>
                    <p>Counter 3 • {currentPerson.service} • {currentPerson.name}</p>
                    <div className="track-info">
                      <div><b>~{waitingCount * 5 + 5} mins</b><br /><span>Your Wait</span></div>
                      <div><b>{waitingCount} People</b><br /><span>Ahead of You</span></div>
                    </div>
                    <div className="progress"><div className="progress-fill"></div></div>
                    <p>Almost your turn! Stay near 😊</p>
                  </>
                ) : (
                  <>
                    <p className="live-text">● LIVE QUEUE</p>
                    <h2>All Completed / No one in queue</h2>
                    <p>Book appointment to start again.</p>
                  </>
                )}
                <button onClick={() => setShow("")} className="white-btn">Close</button>
              </div>
            )}
            <div className="stats-row">
              <div><b>10,000+</b><span>Happy Users</span></div>
              <div><b>50+</b><span>Partners</span></div>
              <div><b>4.9 ⭐</b><span>Rating</span></div>
            </div>
          </div>
          <div id="about" className="about-section">
            <span className="small-badge">ABOUT US</span>
            <h2>Why SmartQueue?</h2>
            <p className="section-text">No more standing in long lines at hospitals, banks, salons or offices. Book online, see live status, reach exactly on time.</p>
            <div className="flex-row">
              <div className="feature-card">⏰<h3>Save Time</h3><p>No waiting in line, come on time</p></div>
              <div className="feature-card">📱<h3>Easy Booking</h3><p>Book in 1 minute from phone</p></div>
              <div className="feature-card">🔔<h3>Live Alerts</h3><p>Get notification when turn comes</p></div>
            </div>
          </div>
          <div id="services" className="services-section">
            <span className="small-badge">OUR SERVICES</span>
            <h2>What We Do For You</h2>
            <p className="section-text">We provide smart queue for all places where you wait in line.</p>
            <div className="flex-row">
              <div className="service-card"><div className="icon blue">🏥</div><h3>Hospital</h3><p>Book token for Doctor, OPD, Lab Test.</p><p style={{ fontSize: "13px", color: "#2563eb", marginTop: "6px" }}>Wait Time: ~15 mins • Open 9AM - 9PM</p><button onClick={() => bookService("🏥 Hospital")} className="link-btn">Book Hospital Token →</button></div>
              <div className="service-card"><div className="icon purple">🏦</div><h3>Bank</h3><p>Book token for Cash Deposit, Account, Loan.</p><p style={{ fontSize: "13px", color: "#2563eb", marginTop: "6px" }}>Wait Time: ~20 mins • Open 10AM - 4PM</p><button onClick={() => bookService("🏦 Bank")} className="link-btn">Book Bank Token →</button></div>
              <div className="service-card"><div className="icon green">💇</div><h3>Salon</h3><p>Book token for Hair Cut, Facial, Spa.</p><p style={{ fontSize: "13px", color: "#2563eb", marginTop: "6px" }}>Wait Time: ~10 mins • Open 10AM - 8PM</p><button onClick={() => bookService("💇 Salon")} className="link-btn">Book Salon Token →</button></div>
              <div className="service-card"><div className="icon blue">🏛️</div><h3>Government Office</h3><p>Book token for Aadhaar, Ration Card, Passport.</p><p style={{ fontSize: "13px", color: "#2563eb", marginTop: "6px" }}>Wait Time: ~25 mins • Open 10AM - 5PM</p><button onClick={() => bookService("🏛️ Government Office")} className="link-btn">Book Govt Token →</button></div>
            </div>
          </div>
          <p className="footer">© 2026 SmartQueue - Made with ❤️ in India</p>
        </>
      )}

      {page === "book" && (
        <div className="book-page">
          <div className="book-card">
            <h2 className="book-title">Book Your Appointment</h2>
            <p className="book-sub">Fill in your details and get your digital queue token.</p>
            <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
              <input type="text" name="fake-username" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
              <input type="password" name="fake-password" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
              <h3 className="form-heading">Personal Details</h3>
              <label className="form-label">Full Name *</label>
              <input className="form-input" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="new-password" name="no-autofill-name-xyz" type="text" readOnly onFocus={stopAutofill} />
              <label className="form-label">Phone Number *</label>
              <input className="form-input" placeholder="Enter 10-digit mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={10} autoComplete="new-password" name="no-autofill-phone-xyz" type="text" inputMode="numeric" readOnly onFocus={stopAutofill} />
              <label className="form-label">Email Address</label>
              <input className="form-input" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="new-password" name="no-autofill-email-xyz" type="text" readOnly onFocus={stopAutofill} />
              <h3 className="form-heading" style={{ marginTop: "28px" }}>Appointment Details</h3>
              <label className="form-label">Select Service *</label>
              <select className="form-input" value={service} onChange={(e) => setService(e.target.value)} autoComplete="off">
                <option value="">Choose a service</option>
                <option>🏥 Hospital</option>
                <option>💇 Salon</option>
                <option>🏦 Bank</option>
                <option>🏛️ Government Office</option>
              </select>
              <label className="form-label">Choose Date *</label>
              <input className="form-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} autoComplete="off" />
              <label className="form-label">Preferred Time *</label>
              <p className="time-label">Select an available time slot</p>
              <div className="time-slots">
                {times.map((t) => (
                  <button type="button" key={t} onClick={() => setTime(t)} className={time === t ? "time-btn active" : "time-btn"}>{t}</button>
                ))}
              </div>
              <button type="button" onClick={bookToken} className="confirm-btn">Confirm Appointment</button>
              <button type="button" onClick={() => goTo("home")} className="white-btn">Back to Home</button>
            </form>
          </div>
        </div>
      )}

      {page === "login" && (
        <div className="page-center">
          <div className="login-card">
            <div className="login-icon">👋</div>
            <h2>{isSignup ? "Create Your Account!" : "Welcome Back!"}</h2>
            <p>{isSignup ? "Create your own login - your email & password" : "Login with your own account"}</p>
            <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
              <input type="text" name="fake-user" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
              <input type="password" name="fake-pass" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
              {isSignup && (
                <>
                  <label>Your Name</label>
                  <input className="input-box" placeholder="Enter Your Name" value={signupName} onChange={(e) => setSignupName(e.target.value)} autoComplete="new-password" name="sq-no-name-999" type="text" readOnly onFocus={stopAutofill} />
                </>
              )}
              <label>Email</label>
              <input className="input-box" placeholder="Enter Your Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} autoComplete="new-password" name="sq-no-email-999" type="text" readOnly onFocus={stopAutofill} />
              <label>Password</label>
              <input className="input-box" placeholder="Enter Your Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} autoComplete="new-password" name="sq-no-pass-999" type="password" readOnly onFocus={stopAutofill} />
              {loginError && <p style={{ color: "red", fontSize: "14px", fontWeight: "bold" }}>{loginError}</p>}
              {isSignup ? (
                <button type="button" onClick={handleSignup} className="blue-btn">Create Account →</button>
              ) : (
                <button type="button" onClick={handleLogin} className="blue-btn">Login →</button>
              )}
              <button type="button" onClick={() => { setIsSignup(!isSignup); setLoginError(""); setLoginEmail(""); setLoginPassword(""); setSignupName(""); }} className="white-btn">
                {isSignup ? "Already have account? Login" : "Don't have account? Create New Account"}
              </button>
              <button type="button" onClick={() => goTo("home")} className="white-btn">Back to Home</button>
            </form>
          </div>
        </div>
      )}

      {page === "staff" && (
        <div className="staff-page">
          <h1>👨‍💼 Staff Dashboard</h1>
          <p>Welcome Staff! Manage queue easily.</p>
          <p style={{ fontSize: "13px", color: "#64748b" }}>Last refreshed: {lastRefresh} • Real queue - First come, first serve</p>
          <div className="flex-row">
            <div className="staff-stat blue-bg"><span>Now Serving</span><h1>{currentPerson ? `${currentPerson.token} - ${currentPerson.name}` : "None - All Done"}</h1></div>
            <div className="staff-stat orange-bg"><span>Waiting</span><h1>{waitingCount}</h1></div>
            <div className="staff-stat green-bg"><span>Completed</span><h1>{servedCount}</h1></div>
            <div className="staff-stat purple-bg"><span>Total in Queue</span><h1>{queueList.length}</h1></div>
          </div>
          <div className="staff-list" style={{ padding: "20px" }}>
            <h3>Today's Queue List</h3>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "-8px" }}>Realistic queue - First booked = First served. No skipping.</p>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px", background: "white" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ padding: "12px 10px" }}>Token</th>
                  <th style={{ padding: "12px 10px" }}>Customer</th>
                  <th style={{ padding: "12px 10px" }}>Service</th>
                  <th style={{ padding: "12px 10px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {queueList.map((person) => {
                  let label = "Waiting"; let bg = "#fef3c7"; let color = "#92400e";
                  if (person.status === "completed") { label = "Completed"; bg = "#dcfce7"; color = "#166534"; }
                  if (person.status === "serving") { label = "Serving Now"; bg = "#dcfce7"; color = "#166534"; }
                  return (
                    <tr key={person.token} style={{ borderBottom: "1px solid #f1f5f9", background: person.status === "serving" ? "#f0fdf4" : "white" }}>
                      <td style={{ padding: "12px 10px", fontWeight: "600" }}>{person.token}</td>
                      <td style={{ padding: "12px 10px" }}>{person.name}</td>
                      <td style={{ padding: "12px 10px" }}>{person.service}</td>
                      <td style={{ padding: "12px 10px" }}>
                        <span style={{ background: bg, color: color, padding: "5px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" }}>{label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
              <button onClick={callNext} className="blue-btn" style={{ flex: 2 }}>📢 Call Next Token</button>
              <button onClick={refreshQueue} className="white-btn" style={{ flex: 1, border: "2px solid #2563eb" }}>🔄 Refresh</button>
            </div>
            <button onClick={() => goTo("home")} className="white-btn">Back to Home</button>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;