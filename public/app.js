// =============================================
//  STAYFIND — APP LOGIC
// =============================================

// ---- HOSTEL DATA ----
let HOSTELS = [];

// ---- STATE ----
let filteredHostels = [...HOSTELS];
let activeFilter = "all";
let currentCity = "All Locations";

// ---- NAVBAR SCROLL ----
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 60);
});

// ---- HAMBURGER MENU ----
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobile-menu");
hamburger.addEventListener("click", () => {
  mobileMenu.classList.toggle("open");
});
document.addEventListener("click", (e) => {
  if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
    mobileMenu.classList.remove("open");
  }
});

// ---- PARTICLES ----
function spawnParticles() {
  const container = document.getElementById("hero-particles");
  for (let i = 0; i < 22; i++) {
    const p = document.createElement("div");
    p.classList.add("particle");
    p.style.left = Math.random() * 100 + "vw";
    p.style.width = p.style.height = Math.random() * 4 + 2 + "px";
    p.style.animationDuration = Math.random() * 14 + 8 + "s";
    p.style.animationDelay = Math.random() * 12 + "s";
    p.style.opacity = Math.random() * 0.6 + 0.2;
    container.appendChild(p);
  }
}
spawnParticles();

// ---- COUNTER ANIMATION ----
function animateCounters() {
  document.querySelectorAll(".stat-number").forEach((el) => {
    const target = parseInt(el.dataset.target);
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.floor(current).toLocaleString();
    }, 25);
  });
}
// Trigger counters when stats bar is visible
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { animateCounters(); statsObserver.disconnect(); } });
}, { threshold: 0.5 });
const statsBar = document.querySelector(".stats-bar");
if (statsBar) statsObserver.observe(statsBar);

// ---- SEARCH TABS ----
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// ---- SUGGESTION CHIPS ----
document.querySelectorAll(".suggestion-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const city = chip.dataset.city;
    document.getElementById("location-input").value = city;
    performSearch(city);
  });
});

// ---- LOCATE ME ----
document.getElementById("locate-btn").addEventListener("click", () => {
  if (!navigator.geolocation) return showToast("Geolocation not supported by your browser.");
  showToast("📍 Detecting your location...");
  navigator.geolocation.getCurrentPosition(
    () => {
      document.getElementById("location-input").value = "Current Location";
      performSearch("Current Location");
    },
    () => showToast("⚠️ Could not access location. Please allow permission.")
  );
});

// ---- SEARCH BUTTON ----
document.getElementById("search-btn").addEventListener("click", () => {
  const city = document.getElementById("location-input").value.trim();
  const roomType = document.getElementById("room-type-filter").value;
  const maxRent = document.getElementById("rent-filter").value;
  const gender = document.getElementById("gender-filter").value;
  performSearch(city, roomType, parseInt(maxRent) || null, gender);
});
document.getElementById("location-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("search-btn").click();
});

// ---- FILTER CHIPS ----
document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    activeFilter = chip.dataset.filter;
    renderCards(applyFilterAndSort(HOSTELS));
  });
});

// ---- SORT SELECT ----
document.getElementById("sort-select").addEventListener("change", () => {
  renderCards(applyFilterAndSort(filteredHostels));
});

// ---- PERFORM SEARCH ----
function performSearch(city = "", roomType = "", maxRent = null, gender = "") {
  currentCity = city || "All Locations";
  document.getElementById("location-badge").textContent = "📍 " + currentCity;

  let results = [...HOSTELS];

  if (city && city !== "Current Location" && city !== "All Locations") {
    results = results.filter(
      (h) =>
        h.city.toLowerCase().includes(city.toLowerCase()) ||
        h.location.toLowerCase().includes(city.toLowerCase())
    );
  }
  if (roomType) results = results.filter((h) => h.roomType === roomType);
  if (maxRent) results = results.filter((h) => h.rent <= maxRent);
  if (gender) results = results.filter((h) => h.gender === gender);

  filteredHostels = results;
  activeFilter = "all";
  document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
  document.querySelector('.chip[data-filter="all"]').classList.add("active");

  renderCards(applyFilterAndSort(filteredHostels));

  document.getElementById("listings").scrollIntoView({ behavior: "smooth", block: "start" });
  showToast(`✅ Found ${results.length} hostel${results.length !== 1 ? "s" : ""} in ${currentCity}`);
}

// ---- APPLY FILTER & SORT ----
function applyFilterAndSort(base) {
  let data =
    activeFilter === "all" ? [...base] : base.filter((h) => h.roomType === activeFilter);
  const sort = document.getElementById("sort-select").value;
  if (sort === "price-asc") data.sort((a, b) => a.rent - b.rent);
  else if (sort === "price-desc") data.sort((a, b) => b.rent - a.rent);
  else if (sort === "rating") data.sort((a, b) => b.rating - a.rating);
  else if (sort === "distance") data.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  return data;
}

// ---- RENDER CARDS ----
function renderCards(data) {
  const grid = document.getElementById("cards-grid");
  const countEl = document.getElementById("results-count");
  countEl.textContent = `Showing ${data.length} hostel${data.length !== 1 ? "s" : ""}`;
  if (data.length === 0) {
    grid.innerHTML = `<div class="no-results">
      <div class="emoji">🔍</div>
      <h3>No hostels found</h3>
      <p>Try adjusting your filters or searching a different location.</p>
    </div>`;
    return;
  }
  grid.innerHTML = data.map((h, i) => hostelCard(h, i)).join("");
  grid.querySelectorAll(".hostel-card").forEach((card) => {
    card.style.animationDelay = parseFloat(card.style.animationDelay || "0") + "s";
    card.addEventListener("click", (e) => {
      if (!e.target.closest(".card-fav") && !e.target.closest(".card-cta")) {
        openModal(parseInt(card.dataset.id));
      }
    });
  });
  // Fav buttons
  grid.querySelectorAll(".card-fav").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      btn.classList.toggle("active");
      const hostelId = btn.dataset.id;
      const hostel = HOSTELS.find((h) => h.id == hostelId);
      showToast(btn.classList.contains("active") ? `❤️ Saved "${hostel.name}"` : `💔 Removed "${hostel.name}"`);
    });
  });
  // CTA buttons
  grid.querySelectorAll(".card-cta").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openModal(parseInt(btn.dataset.id));
    });
  });
}

// ---- CARD TEMPLATE ----
function hostelCard(h, i) {
  const badgeClass = {
    dorm: "badge-dorm", private: "badge-private",
    shared: "badge-shared", suite: "badge-suite",
  }[h.roomType] || "badge-dorm";

  const roomLabel = { dorm: "Dormitory", private: "Private", shared: "Shared", suite: "Suite" }[h.roomType];
  const genderClass = { male: "gender-male", female: "gender-female", coed: "gender-coed" }[h.gender];
  const genderLabel = { male: "👨 Male Only", female: "👩 Female Only", coed: "🤝 Co-ed" }[h.gender];
  const stars = "⭐".repeat(Math.round(h.rating));

  const tagsHTML = h.tags.slice(0, 4).map(t => `<span class="facility-tag">${t}</span>`).join("");

  return `
  <div class="hostel-card" data-id="${h.id}" style="animation-delay:${i * 0.07}s">
    <div class="card-img-wrap">
      <span class="card-badge ${badgeClass}">${roomLabel}</span>
      <button class="card-fav" data-id="${h.id}" title="Save hostel">♡</button>
      <img src="${h.image}" alt="${h.name}" loading="lazy" />
      <span class="card-distance">📍 ${h.distance}</span>
    </div>
    <div class="card-body">
      <div class="card-header">
        <div class="card-title">${h.name}</div>
        <div class="card-rating">
          <span class="star">★</span>
          <span>${h.rating}</span>
        </div>
      </div>
      <div class="card-location"><span class="pin">📍</span>${h.location}</div>
      <div class="card-rent">
        <span class="rent-currency">₹</span>
        <span class="rent-amount">${h.rent.toLocaleString()}</span>
        <span class="rent-period">/ month</span>
      </div>
      <div class="card-facilities">${tagsHTML}</div>
      <div class="card-footer">
        <span class="card-gender ${genderClass}">${genderLabel}</span>
        <button class="card-cta" data-id="${h.id}">View Details →</button>
      </div>
    </div>
  </div>`;
}

// ---- OPEN MODAL ----
function openModal(id) {
  const h = HOSTELS.find((h) => h.id === id);
  if (!h) return;
  const roomLabel = { dorm: "Dormitory", private: "Private Room", shared: "Shared Room", suite: "Suite" }[h.roomType];
  const genderLabel = { male: "Male Only", female: "Female Only", coed: "Co-ed" }[h.gender];

  const facilitiesHTML = h.facilities.map(f => `
    <div class="modal-facility">
      <span class="fac-icon">${f.icon}</span>
      <span>${f.label}</span>
    </div>`).join("");

  document.getElementById("modal-content").innerHTML = `
    <img src="${h.image}" alt="${h.name}" class="modal-img" />
    <div class="modal-body">
      <div class="modal-header-row">
        <div>
          <div class="modal-title">${h.name}</div>
          <div class="modal-rating"><span class="stars">★★★★★</span> <strong>${h.rating}</strong> <span style="color:var(--text-muted);font-size:0.82rem">(${h.reviews} reviews)</span></div>
        </div>
      </div>
      <div class="modal-address">📍 ${h.address}</div>

      <div class="modal-section">
        <div class="modal-section-title">Room Details</div>
        <div class="modal-info-grid">
          <div class="modal-info-item"><label>Room Type</label><span>${roomLabel}</span></div>
          <div class="modal-info-item"><label>Monthly Rent</label><span>₹${h.rent.toLocaleString()}</span></div>
          <div class="modal-info-item"><label>Gender Policy</label><span>${genderLabel}</span></div>
          <div class="modal-info-item"><label>Availability</label><span style="color:#4ade80">${h.availability}</span></div>
        </div>
      </div>

      <div class="modal-section">
        <div class="modal-section-title">About This Property</div>
        <p style="font-size:0.9rem;color:var(--text-muted);line-height:1.75">${h.description}</p>
      </div>

      <div class="modal-section">
        <div class="modal-section-title">Facilities & Amenities</div>
        <div class="modal-facilities-grid">${facilitiesHTML}</div>
      </div>

      <div class="modal-actions">
        <button class="modal-btn-primary" onclick="showToast('📞 Connecting you with ${h.name}...')">Call Now</button>
        <button class="modal-btn-outline" onclick="showToast('📅 Schedule a Visit — feature coming soon!')">Schedule Visit</button>
      </div>
    </div>`;

  document.getElementById("modal-overlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

// ---- CLOSE MODAL ----
document.getElementById("modal-close").addEventListener("click", closeModal);
document.getElementById("modal-overlay").addEventListener("click", (e) => {
  if (e.target === document.getElementById("modal-overlay")) closeModal();
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
function closeModal() {
  document.getElementById("modal-overlay").classList.remove("open");
  document.body.style.overflow = "";
}

// ---- LOAD MORE ----
document.getElementById("load-more-btn").addEventListener("click", () => {
  showToast("🔄 Loading more hostels...");
  setTimeout(() => showToast("✅ All hostels loaded! More coming soon."), 1500);
});

// ---- LIST HOSTEL MODAL ----
document.getElementById("list-hostel-btn").addEventListener("click", () => {
  showToast("🏠 Hostel owner registration — coming soon!");
});

// ---- TOAST ----
let toastTimer;
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 3000);
}

// ---- SCROLL ANIMATION ----
const observerCards = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.style.opacity = "1";
      e.target.style.transform = "translateY(0)";
    }
  });
}, { threshold: 0.1 });
function observeElements() {
  document.querySelectorAll(".step-card, .facility-item").forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observerCards.observe(el);
  });
}

// ---- API FETCH & INIT ----
async function fetchHostels() {
  try {
    const res = await fetch('/api/hostels');
    if (!res.ok) throw new Error('Failed to fetch hostels');
    const dbHostels = await res.json();
    
    // Map DB schema to frontend card expectations
    HOSTELS = dbHostels.map(h => ({
      id: h._id,
      name: h.name,
      location: `${h.area}, ${h.city}`,
      city: h.city,
      roomType: "shared", // Defaulting to shared for thumbnail view
      rent: h.rooms && h.rooms.length > 0 ? Math.min(...h.rooms.map(r => r.rent)) : 5000,
      gender: h.gender,
      rating: 4.5, // Placeholder
      reviews: 42,
      distance: "1.2 km",
      image: "hostel1.png",
      description: h.description || "A wonderful place to stay.",
      address: h.address || h.area,
      facilities: (h.facilities || []).map(f => ({ icon: "✔️", label: f })),
      tags: (h.facilities || []).slice(0, 4),
      availability: h.rooms?.reduce((acc, r) => acc + (r.beds?.filter(b=>b.status==='available').length || 0), 0) + " beds available"
    }));

    filteredHostels = [...HOSTELS];
    renderCards(applyFilterAndSort(filteredHostels));
  } catch (error) {
    console.error(error);
    showToast("⚠️ Could not load live hostel data.");
  }
}

// ---- INIT ----
fetchHostels();
observeElements();
