(function () {
  const app = document.getElementById("app");

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function parseVideoEmbed(rawUrl) {
    const url = (rawUrl || "").trim();
    if (!url) return null;

    // Direct MP4 / WebM
    if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
      return { type: "video", src: url };
    }

    // YouTube watch / shorts / youtu.be / embed
    let ytMatch =
      url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/) ||
      url.match(/[?&]v=([A-Za-z0-9_-]{11})/);
    if (ytMatch) {
      return {
        type: "iframe",
        src: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
      };
    }

    // Google Drive
    const gdMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (gdMatch) {
      return {
        type: "iframe",
        src: `https://drive.google.com/file/d/${gdMatch[1]}/preview`,
      };
    }

    // Vimeo
    const vmMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vmMatch) {
      return {
        type: "iframe",
        src: `https://player.vimeo.com/video/${vmMatch[1]}`,
      };
    }

    // Fallback iframe
    return { type: "iframe", src: url };
  }

  function renderVideoPlayerHtml(url, modeLabel) {
    const parsed = parseVideoEmbed(url);
    if (!parsed) {
      return `
        <div class="video-placeholder">
          <div class="video-placeholder-icon">▶</div>
          <h3>${escapeHtml(modeLabel)}</h3>
          <p>سيتم إضافة فيديو الشرح قريبًا بإذن الله. يمكنك التبديل إلى التبويب الآخر أو مراجعة خلاصة القاعدة أسفل الصفحة.</p>
        </div>
      `;
    }
    if (parsed.type === "video") {
      return `<video controls playsinline preload="metadata" src="${escapeHtml(parsed.src)}"></video>`;
    }
    return `<iframe src="${escapeHtml(parsed.src)}" title="${escapeHtml(modeLabel)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  }

  function renderTwoTabVideoWidget({
    tab1Label = "شرح حضوري",
    tab2Label = "شرح عن بُعد",
    inPersonVideo = "",
    remoteVideo = "",
    lessonTitle = "",
  }) {
    return `
      <section class="video-panel" id="videoPanel">
        <div class="tabs-bar" role="tablist">
          <button type="button" class="tab-btn active" role="tab" aria-selected="true" data-tab="inPerson">
            <span class="tab-icon" aria-hidden="true">🏛️</span>
            <span>${escapeHtml(tab1Label)}</span>
          </button>
          <button type="button" class="tab-btn tab-remote" role="tab" aria-selected="false" data-tab="remote">
            <span class="tab-icon" aria-hidden="true">💻</span>
            <span>${escapeHtml(tab2Label)}</span>
          </button>
        </div>
        <div class="video-stage">
          <div class="video-caption">
            <h2 id="videoActiveTitle">${escapeHtml(tab1Label)} — ${escapeHtml(lessonTitle)}</h2>
            <span class="video-badge-pill" id="videoModePill">مسار الشرح الحضوري</span>
          </div>
          <div class="video-frame-wrap" id="videoFrameWrap">
            ${renderVideoPlayerHtml(inPersonVideo, tab1Label)}
          </div>
        </div>
      </section>
    `;
  }

  function attachVideoTabs({
    tab1Label = "شرح حضوري",
    tab2Label = "شرح عن بُعد",
    inPersonVideo = "",
    remoteVideo = "",
    lessonTitle = "",
  }) {
    const panel = document.getElementById("videoPanel");
    if (!panel) return;
    const buttons = panel.querySelectorAll(".tab-btn");
    const wrap = document.getElementById("videoFrameWrap");
    const titleEl = document.getElementById("videoActiveTitle");
    const pillEl = document.getElementById("videoModePill");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.getAttribute("data-tab");
        buttons.forEach((b) => {
          b.classList.remove("active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");

        if (mode === "inPerson") {
          titleEl.textContent = `${tab1Label} — ${lessonTitle}`;
          pillEl.textContent = "مسار الشرح الحضوري";
          pillEl.className = "video-badge-pill";
          wrap.innerHTML = renderVideoPlayerHtml(inPersonVideo, tab1Label);
        } else {
          titleEl.textContent = `${tab2Label} — ${lessonTitle}`;
          pillEl.textContent = "مسار الشرح عن بُعد";
          pillEl.className = "video-badge-pill remote";
          wrap.innerHTML = renderVideoPlayerHtml(remoteVideo, tab2Label);
        }
      });
    });
  }

  function setActiveNav(key) {
    document.querySelectorAll("[data-nav]").forEach((el) => {
      el.classList.toggle("active", el.getAttribute("data-nav") === key);
    });
  }

  // ==================== HOME VIEW ====================
  function renderHome() {
    document.title = SITE_CONFIG.title;
    setActiveNav("home");

    app.innerHTML = `
      <div class="container">
        <section class="hero">
          <span class="hero-badge">المنصة التفاعلية للكتاب • شرح حضوري وعن بُعد</span>
          <h1>أَحْكَامُ التَّجْوِيدِ الأَسَاسِيَّةُ<br />مِنْ خِلَالِ الهِجَاءِ القُرْآنِيِّ</h1>
          <p class="hero-sub">
            اختر أي درس أو تتمّة لمشاهدة الشرح <strong>الحضوري</strong> والشرح <strong>عن بُعد</strong>، مع خلاصة القاعدة التجويدية وروابط المواسح الضوئية (QR) الجاهزة للطباعة في الكتاب.
          </p>
          <div class="hero-actions">
            <a href="?p=achievements" class="btn btn-gold">🏆 الإنجازات والتعريف بالدورة</a>
            <a href="?p=qr" class="btn btn-outline-light">📱 صفحة جميع المواسح الضوئية (24 كود)</a>
          </div>
        </section>

        <div class="controls-bar">
          <div class="filter-pills" id="filterPills">
            <button type="button" class="pill active" data-filter="all">الكل (${LESSONS.length})</button>
            <button type="button" class="pill" data-filter="lesson">دروس الهجاء القرآني (${LESSONS.filter((l) => l.category === "lesson").length})</button>
            <button type="button" class="pill" data-filter="supplement">تتمات الهجاء القرآني (${LESSONS.filter((l) => l.category === "supplement").length})</button>
          </div>
          <input type="search" id="searchInput" class="search-input" placeholder="ابحث عن درس أو حكم تجويدي..." aria-label="بحث" />
        </div>

        <div id="lessonsContainer"></div>
      </div>
    `;

    let currentFilter = "all";
    let searchTerm = "";

    function drawList() {
      const container = document.getElementById("lessonsContainer");
      const filtered = LESSONS.filter((item) => {
        const matchesCat = currentFilter === "all" || item.category === currentFilter;
        const q = searchTerm.trim();
        const matchesQ =
          !q ||
          item.title.includes(q) ||
          item.tag.includes(q) ||
          item.subtitle.includes(q);
        return matchesCat && matchesQ;
      });

      if (!filtered.length) {
        container.innerHTML = `<div class="rule-card"><h3>لا توجد نتائج مطابقة للبحث</h3><p>جرّب كتابة كلمة أخرى مثل: المد، القلقلة، التنوين، الإخفاء.</p></div>`;
        return;
      }

      const mainLessons = filtered.filter((l) => l.category === "lesson");
      const supplements = filtered.filter((l) => l.category === "supplement");

      let html = "";
      if (mainLessons.length) {
        html += `<h2 class="section-heading">دروس كتاب الهجاء القرآني</h2><div class="lessons-grid">${mainLessons.map(renderCard).join("")}</div>`;
      }
      if (supplements.length) {
        html += `<h2 class="section-heading">تتمات الهجاء القرآني</h2><div class="lessons-grid">${supplements.map(renderCard).join("")}</div>`;
      }
      container.innerHTML = html;
    }

    function renderCard(item) {
      return `
        <a href="?p=${encodeURIComponent(item.slug)}" class="lesson-card ${item.category === "supplement" ? "supplement" : ""}">
          <span class="card-tag">${escapeHtml(item.tag)}</span>
          <div class="card-title">${escapeHtml(item.title)}</div>
          <div class="card-desc">${escapeHtml(item.subtitle)}</div>
          <div class="card-meta">
            <div class="video-badges">
              <span class="vbadge">🏛️ حضوري</span>
              <span class="vbadge">💻 عن بُعد</span>
            </div>
            <span>فتح الدرس ←</span>
          </div>
        </a>
      `;
    }

    document.querySelectorAll("#filterPills .pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        document.querySelectorAll("#filterPills .pill").forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        currentFilter = pill.getAttribute("data-filter");
        drawList();
      });
    });

    document.getElementById("searchInput").addEventListener("input", (e) => {
      searchTerm = e.target.value;
      drawList();
    });

    drawList();
  }

  // ==================== ACHIEVEMENTS VIEW ====================
  function renderAchievements() {
    const a = ACHIEVEMENTS_DATA;
    document.title = `${a.title} | ${SITE_CONFIG.title}`;
    setActiveNav("achievements");

    app.innerHTML = `
      <div class="container">
        <div class="breadcrumb">
          <a href="./">الرئيسية</a>
          <span>/</span>
          <span>${escapeHtml(a.tag)}</span>
        </div>

        <section class="lesson-header-card">
          <span class="lesson-header-tag">🏆 ${escapeHtml(a.tag)}</span>
          <h1>${escapeHtml(a.title)}</h1>
          <p class="lesson-header-sub">${escapeHtml(a.subtitle)}</p>
        </section>

        ${renderTwoTabVideoWidget({
          tab1Label: a.tab1Label,
          tab2Label: a.tab2Label,
          inPersonVideo: a.inPersonVideo,
          remoteVideo: a.remoteVideo,
          lessonTitle: "مقدمة الدورة والإنجازات",
        })}

        <div class="stats-grid">
          ${a.stats
            .map(
              (s) => `
            <div class="stat-card">
              <div class="stat-num">${escapeHtml(s.number)}</div>
              <div class="stat-label">${escapeHtml(s.label)}</div>
            </div>`
            )
            .join("")}
        </div>

        <section class="rule-card">
          <h3>أبرز إنجازات ومميزات الدورة</h3>
          <ul class="rule-list">
            ${a.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}
          </ul>
        </section>

        <h2 class="section-heading">كيف يستفيد المستهدفون من هذه الدورة المباركة؟</h2>
        <div class="audience-grid">
          ${a.audiences
            .map(
              (aud) => `
            <div class="audience-card">
              <h3>◆ ${escapeHtml(aud.title)}</h3>
              <p>${escapeHtml(aud.desc)}</p>
            </div>`
            )
            .join("")}
        </div>

        <div class="alert-box">⚠️ ${escapeHtml(a.warning)}</div>

        <div class="lesson-nav-bar">
          <a href="./" class="btn btn-soft">← جميع الدروس</a>
          <a href="?p=${encodeURIComponent(LESSONS[0].slug)}" class="btn btn-teal">ابدأ بالدرس الأول ←</a>
        </div>
      </div>
    `;

    attachVideoTabs({
      tab1Label: a.tab1Label,
      tab2Label: a.tab2Label,
      inPersonVideo: a.inPersonVideo,
      remoteVideo: a.remoteVideo,
      lessonTitle: "مقدمة الدورة والإنجازات",
    });
  }

  // ==================== LESSON VIEW ====================
  function renderLesson(slug) {
    const idx = LESSONS.findIndex((l) => l.slug === slug);
    if (idx === -1) {
      renderHome();
      return;
    }
    const item = LESSONS[idx];
    const prev = idx > 0 ? LESSONS[idx - 1] : null;
    const next = idx < LESSONS.length - 1 ? LESSONS[idx + 1] : null;

    document.title = `${item.tag}: ${item.title} | ${SITE_CONFIG.title}`;
    setActiveNav("");

    app.innerHTML = `
      <div class="container">
        <div class="breadcrumb">
          <a href="./">الرئيسية</a>
          <span>/</span>
          <span>${escapeHtml(item.tag)}</span>
        </div>

        <section class="lesson-header-card">
          <span class="lesson-header-tag">${escapeHtml(item.tag)}</span>
          <h1>${escapeHtml(item.title)}</h1>
          <p class="lesson-header-sub">${escapeHtml(item.subtitle)}</p>
        </section>

        ${renderTwoTabVideoWidget({
          tab1Label: "شرح حضوري",
          tab2Label: "شرح عن بُعد",
          inPersonVideo: item.inPersonVideo,
          remoteVideo: item.remoteVideo,
          lessonTitle: item.tag,
        })}

        <section class="rule-card">
          <h3>خلاصة القاعدة التجويدية</h3>
          <ul class="rule-list">
            ${item.rules.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}
          </ul>
        </section>

        <div class="lesson-nav-bar">
          ${
            prev
              ? `<a href="?p=${encodeURIComponent(prev.slug)}" class="btn btn-soft">→ السابق: ${escapeHtml(prev.tag)}</a>`
              : `<a href="?p=achievements" class="btn btn-soft">→ مقدمة الدورة والإنجازات</a>`
          }
          <a href="./" class="btn btn-soft">فهرس الدروس</a>
          ${
            next
              ? `<a href="?p=${encodeURIComponent(next.slug)}" class="btn btn-teal">التالي: ${escapeHtml(next.tag)} ←</a>`
              : `<a href="?p=qr" class="btn btn-gold">المواسح الضوئية ←</a>`
          }
        </div>
      </div>
    `;

    attachVideoTabs({
      tab1Label: "شرح حضوري",
      tab2Label: "شرح عن بُعد",
      inPersonVideo: item.inPersonVideo,
      remoteVideo: item.remoteVideo,
      lessonTitle: item.tag,
    });
  }

  // ==================== QR GALLERY VIEW ====================
  function renderQrGallery() {
    document.title = `المواسح الضوئية (QR) | ${SITE_CONFIG.title}`;
    setActiveNav("qr");

    const allItems = [
      {
        slug: ACHIEVEMENTS_DATA.slug,
        tag: "أول الكتاب",
        title: "الإنجازات والتعريف بالدورة",
      },
      ...LESSONS.map((l) => ({
        slug: l.slug,
        tag: l.tag,
        title: l.title,
      })),
    ];

    app.innerHTML = `
      <div class="container">
        <div class="breadcrumb">
          <a href="./">الرئيسية</a>
          <span>/</span>
          <span>المواسح الضوئية (QR Codes)</span>
        </div>

        <section class="lesson-header-card">
          <span class="lesson-header-tag">📱 جاهزة للطباعة واللصق في الكتاب</span>
          <h1>جميع المواسح الضوئية للدورة (${allItems.length} ماسحًا)</h1>
          <p class="lesson-header-sub">
            كل ماسح ضوئي يفتح مباشرةً صفحة الدرس بـ <strong>تبويبين (شرح حضوري + شرح عن بُعد)</strong> على رابط GitHub Pages.
          </p>
        </section>

        <div class="qr-toolbar">
          <div>
            <strong>الرابط الأساسي للموقع:</strong>
            <span dir="ltr" style="color:var(--teal);font-weight:700;">${escapeHtml(SITE_CONFIG.baseUrl)}</span>
          </div>
          <button type="button" class="btn btn-gold" onclick="window.print()">🖨️ طباعة جميع المواسح</button>
        </div>

        <div class="qr-grid">
          ${allItems
            .map(
              (item, index) => `
            <div class="qr-card">
              <span class="qr-card-tag">${escapeHtml(item.tag)}</span>
              <img src="qr-codes/${String(index).padStart(2, "0")}_${escapeHtml(item.slug)}.png" alt="QR ${escapeHtml(item.tag)}" loading="lazy" />
              <div class="qr-card-title">${escapeHtml(item.title)}</div>
              <div class="qr-card-actions">
                <a href="qr-codes/${String(index).padStart(2, "0")}_${escapeHtml(item.slug)}.png" download="${String(index).padStart(2, "0")}_${escapeHtml(item.slug)}.png" class="btn btn-teal">تحميل PNG</a>
                <a href="?p=${encodeURIComponent(item.slug)}" class="btn btn-soft">معاينة</a>
              </div>
            </div>`
            )
            .join("")}
        </div>
      </div>
    `;
  }

  // ==================== ROUTER ====================
  const page = getParam("p");
  if (!page) {
    renderHome();
  } else if (page === "achievements") {
    renderAchievements();
  } else if (page === "qr") {
    renderQrGallery();
  } else {
    renderLesson(page);
  }
})();
