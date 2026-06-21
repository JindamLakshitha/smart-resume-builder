/* ============================================================
   Smart Resume Builder — JavaScript
   ============================================================ */

(function () {
  'use strict';

  // ── DOM References ──────────────────────────────────────
  const form              = document.getElementById('resumeForm');
  const resumeOutput      = document.getElementById('resumeOutput');
  const previewPlaceholder= document.getElementById('previewPlaceholder');
  const previewActions    = document.getElementById('previewActions');
  const downloadBtn       = document.getElementById('downloadBtn');
  const clearBtn          = document.getElementById('clearBtn');
  const addEducationBtn   = document.getElementById('addEducation');
  const addExperienceBtn  = document.getElementById('addExperience');
  const educationEntries  = document.getElementById('educationEntries');
  const experienceEntries = document.getElementById('experienceEntries');
  const toastEl           = document.getElementById('toast');

  let eduCount = 1;
  let expCount = 1;

  // ── Toast Notification ──────────────────────────────────
  function showToast(message, duration = 2800) {
    toastEl.textContent = message;
    toastEl.classList.add('toast--visible');
    setTimeout(() => toastEl.classList.remove('toast--visible'), duration);
  }

  // ── Dynamic Entry Helpers ───────────────────────────────
  function createEducationEntry(index) {
    const div = document.createElement('div');
    div.className = 'form__entry';
    div.dataset.index = index;
    div.innerHTML = `
      <div class="form__grid">
        <div class="form__group">
          <label class="form__label">Degree / Course</label>
          <input type="text" class="form__input edu-degree" placeholder="e.g. M.Sc in Data Science" />
        </div>
        <div class="form__group">
          <label class="form__label">Institution</label>
          <input type="text" class="form__input edu-institution" placeholder="e.g. Stanford University" />
        </div>
        <div class="form__group">
          <label class="form__label">Year / Duration</label>
          <input type="text" class="form__input edu-year" placeholder="e.g. 2024 – 2026" />
        </div>
      </div>
    `;
    return div;
  }

  function createExperienceEntry(index) {
    const div = document.createElement('div');
    div.className = 'form__entry';
    div.dataset.index = index;
    div.innerHTML = `
      <div class="form__grid">
        <div class="form__group">
          <label class="form__label">Job Title</label>
          <input type="text" class="form__input exp-title" placeholder="e.g. Product Manager" />
        </div>
        <div class="form__group">
          <label class="form__label">Company</label>
          <input type="text" class="form__input exp-company" placeholder="e.g. Meta" />
        </div>
        <div class="form__group">
          <label class="form__label">Duration</label>
          <input type="text" class="form__input exp-duration" placeholder="e.g. Mar 2023 – Dec 2025" />
        </div>
        <div class="form__group form__group--full">
          <label class="form__label">Description</label>
          <textarea class="form__input form__textarea exp-desc" rows="2" placeholder="Key responsibilities and achievements..."></textarea>
        </div>
      </div>
    `;
    return div;
  }

  addEducationBtn.addEventListener('click', () => {
    educationEntries.appendChild(createEducationEntry(eduCount++));
    showToast('Education entry added');
  });

  addExperienceBtn.addEventListener('click', () => {
    experienceEntries.appendChild(createExperienceEntry(expCount++));
    showToast('Experience entry added');
  });

  // ── Collect Form Data ───────────────────────────────────
  function collectData() {
    const val = (id) => document.getElementById(id).value.trim();

    // Education
    const eduEntries = educationEntries.querySelectorAll('.form__entry');
    const education = [];
    eduEntries.forEach(entry => {
      const degree      = entry.querySelector('.edu-degree').value.trim();
      const institution = entry.querySelector('.edu-institution').value.trim();
      const year        = entry.querySelector('.edu-year').value.trim();
      if (degree || institution) education.push({ degree, institution, year });
    });

    // Experience
    const expEntries = experienceEntries.querySelectorAll('.form__entry');
    const experience = [];
    expEntries.forEach(entry => {
      const title    = entry.querySelector('.exp-title').value.trim();
      const company  = entry.querySelector('.exp-company').value.trim();
      const duration = entry.querySelector('.exp-duration').value.trim();
      const desc     = entry.querySelector('.exp-desc').value.trim();
      if (title || company) experience.push({ title, company, duration, desc });
    });

    // Skills
    const rawSkills = val('skills');
    const skills = rawSkills
      ? rawSkills.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    return {
      fullName:  val('fullName'),
      jobTitle:  val('jobTitle'),
      email:     val('email'),
      phone:     val('phone'),
      summary:   val('summary'),
      education,
      skills,
      experience,
    };
  }

  // ── Escape HTML ─────────────────────────────────────────
  function esc(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
  }

  // ── Build Resume HTML ───────────────────────────────────
  function buildResumeHTML(data) {
    let html = '';

    // Header
    html += '<div class="resume__header">';
    if (data.fullName) html += `<h2 class="resume__name">${esc(data.fullName)}</h2>`;
    if (data.jobTitle) html += `<p class="resume__title">${esc(data.jobTitle)}</p>`;
    const contacts = [];
    if (data.email) contacts.push(`📧 ${esc(data.email)}`);
    if (data.phone) contacts.push(`📞 ${esc(data.phone)}`);
    if (contacts.length) html += `<div class="resume__contact">${contacts.map(c => `<span>${c}</span>`).join('')}</div>`;
    html += '</div>';

    // Summary
    if (data.summary) {
      html += `
        <div class="resume__section">
          <h3 class="resume__section-title">Professional Summary</h3>
          <p class="resume__summary">${esc(data.summary)}</p>
        </div>`;
    }

    // Education
    if (data.education.length) {
      html += '<div class="resume__section"><h3 class="resume__section-title">Education</h3>';
      data.education.forEach(e => {
        html += '<div class="resume__entry">';
        html += `<p class="resume__entry-heading">${esc(e.degree)}</p>`;
        const sub = [e.institution, e.year].filter(Boolean).map(esc).join(' · ');
        if (sub) html += `<p class="resume__entry-sub">${sub}</p>`;
        html += '</div>';
      });
      html += '</div>';
    }

    // Skills
    if (data.skills.length) {
      html += '<div class="resume__section"><h3 class="resume__section-title">Skills</h3>';
      html += '<ul class="resume__skills-list">';
      data.skills.forEach(s => { html += `<li class="resume__skill-tag">${esc(s)}</li>`; });
      html += '</ul></div>';
    }

    // Experience
    if (data.experience.length) {
      html += '<div class="resume__section"><h3 class="resume__section-title">Work Experience</h3>';
      data.experience.forEach(e => {
        html += '<div class="resume__entry">';
        html += `<p class="resume__entry-heading">${esc(e.title)}${e.company ? ' — ' + esc(e.company) : ''}</p>`;
        if (e.duration) html += `<p class="resume__entry-sub">${esc(e.duration)}</p>`;
        if (e.desc) html += `<p class="resume__entry-desc">${esc(e.desc)}</p>`;
        html += '</div>';
      });
      html += '</div>';
    }

    return html;
  }

  // ── Generate Resume ─────────────────────────────────────
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = collectData();

    // Basic validation
    if (!data.fullName) {
      showToast('⚠️ Please enter your full name');
      document.getElementById('fullName').focus();
      return;
    }

    const html = buildResumeHTML(data);
    resumeOutput.innerHTML = html;
    resumeOutput.style.display = 'block';
    previewPlaceholder.style.display = 'none';
    previewActions.style.display = 'flex';

    // Scroll to preview
    document.getElementById('preview').scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast('✅ Resume generated!');
  });

  // ── Download Resume (HTML file) ─────────────────────────
  downloadBtn.addEventListener('click', () => {
    const data = collectData();
    const resumeHTML = buildResumeHTML(data);

    const fullPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${esc(data.fullName || 'My')} — Resume</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet"/>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;line-height:1.65;color:#1a1a2e;padding:40px;max-width:800px;margin:0 auto}
    .resume__header{text-align:center;margin-bottom:28px;padding-bottom:20px;border-bottom:3px solid;border-image:linear-gradient(135deg,#6366f1,#a78bfa,#c084fc) 1}
    .resume__name{font-family:'Outfit',sans-serif;font-size:2rem;font-weight:800;color:#1e1b4b;margin-bottom:4px}
    .resume__title{font-size:1.05rem;color:#6366f1;font-weight:600;margin-bottom:12px}
    .resume__contact{display:flex;justify-content:center;flex-wrap:wrap;gap:16px;font-size:.85rem;color:#64748b}
    .resume__section{margin-bottom:28px}
    .resume__section-title{font-family:'Outfit',sans-serif;font-size:1.1rem;font-weight:700;color:#4f46e5;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;border-bottom:2px solid #e5e7eb;margin-bottom:16px}
    .resume__summary{color:#374151;font-size:.93rem}
    .resume__entry{margin-bottom:16px}
    .resume__entry:last-child{margin-bottom:0}
    .resume__entry-heading{font-weight:600;color:#1e293b;font-size:.95rem}
    .resume__entry-sub{font-size:.85rem;color:#6b7280;margin-bottom:4px}
    .resume__entry-desc{font-size:.88rem;color:#4b5563}
    .resume__skills-list{display:flex;flex-wrap:wrap;gap:8px;list-style:none}
    .resume__skill-tag{background:#eef2ff;color:#4338ca;font-size:.8rem;font-weight:500;padding:4px 12px;border-radius:999px;border:1px solid #c7d2fe}
    @media print{body{padding:20px}}
  </style>
</head>
<body>
  ${resumeHTML}
</body>
</html>`;

    const blob = new Blob([fullPage], { type: 'text/html;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${(data.fullName || 'resume').replace(/\s+/g, '_')}_Resume.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('📥 Resume downloaded!');
  });

  // ── Clear All ───────────────────────────────────────────
  clearBtn.addEventListener('click', () => {
    form.reset();
    // Remove extra education / experience entries
    while (educationEntries.children.length > 1) educationEntries.removeChild(educationEntries.lastChild);
    while (experienceEntries.children.length > 1) experienceEntries.removeChild(experienceEntries.lastChild);

    resumeOutput.style.display  = 'none';
    resumeOutput.innerHTML      = '';
    previewPlaceholder.style.display = 'block';
    previewActions.style.display    = 'none';

    eduCount = 1;
    expCount = 1;
    showToast('🗑️ All fields cleared');
  });

})();
