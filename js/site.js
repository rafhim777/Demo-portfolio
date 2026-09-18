/* ==============================================================
   SITE RENDERER
   Reads the current content (your saved Admin Panel draft if one
   exists in this browser, otherwise the default content.js file)
   and fills in every section of the page. Also applies the
   selected color theme, and listens for live changes saved from
   the Admin Panel so the page updates without a reload.
   ============================================================== */
(function(){
  "use strict";

  var DRAFT_KEY = "cms_content_draft";

  function esc(str){
    var d = document.createElement('div');
    d.textContent = String(str == null ? "" : str);
    return d.innerHTML;
  }

  function getContent(){
    try{
      var raw = localStorage.getItem(DRAFT_KEY);
      if(raw){ return JSON.parse(raw); }
    }catch(e){ /* fall through to default */ }
    return window.SITE_CONTENT_DEFAULT;
  }

  function mediaTag(item){
    var isVideo = item.mediaType === 'video' || /^data:video\//.test(item.mediaSrc || '') || /\.(mp4|webm|mov)$/i.test(item.mediaSrc || '');
    if(isVideo){
      return '<video src="'+esc(item.mediaSrc)+'" autoplay muted loop playsinline></video>';
    }
    return '<img src="'+esc(item.mediaSrc)+'" alt="Dashboard preview">';
  }

  function projectCard(p){
    return (
      '<article class="project-card">' +
        '<div class="project-card__thumb"><img src="'+esc(p.thumb)+'" alt="'+esc(p.title)+' thumbnail"></div>' +
        '<div class="project-card__body">' +
          '<p class="project-card__tag">'+esc(p.tag)+'</p>' +
          '<h3 class="project-card__title">'+esc(p.title)+'</h3>' +
          '<p class="project-card__desc">'+esc(p.desc)+'</p>' +
          '<a href="'+esc(p.link || '#')+'" class="project-card__link" target="_blank" rel="noopener">View Full Project' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 17L17 7M9 7h8v8"/></svg>' +
          '</a>' +
        '</div>' +
      '</article>'
    );
  }

  function toolkitGroup(g){
    var items = (g.items || []).map(function(i){
      return '<div class="toolkit__item"><span class="toolkit__dot"></span>'+esc(i)+'</div>';
    }).join('');
    return (
      '<div class="toolkit__group">' +
        '<p class="toolkit__group-title">'+esc(g.title)+'</p>' +
        '<div class="toolkit__items">'+items+'</div>' +
      '</div>'
    );
  }

  function degreeItem(d){
    return (
      '<div class="edu-item">' +
        '<h3 class="edu-item__degree">'+esc(d.degree)+'</h3>' +
        '<p class="edu-item__meta">'+esc(d.institution)+'</p>' +
        '<p class="edu-item__year">Passing Year: '+esc(d.year)+'</p>' +
      '</div>'
    );
  }

  function certItem(c){
    return (
      '<div class="cert-item">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"/><path d="M8.5 13.5L7 21l5-2.5L17 21l-1.5-7.5"/></svg>' +
        '<span>' +
          '<p class="cert-item__title">'+esc(c.title)+'</p>' +
          '<p class="cert-item__meta">'+esc(c.meta)+'</p>' +
        '</span>' +
      '</div>'
    );
  }

  function render(content){
    if(!content) return;
    document.documentElement.setAttribute('data-theme', content.theme || 'ocean-impact');

    // Hero
    if(content.hero){
      byId('heroTagline').textContent = content.hero.tagline || '';
      byId('heroFirstName').textContent = content.hero.firstName || '';
      byId('heroLastName').textContent = content.hero.lastName || '';
      byId('heroRole').textContent = content.hero.role || '';
      var mediaWrap = byId('heroMediaWrap');
      var badge = mediaWrap.querySelector('.video-frame__badge');
      mediaWrap.innerHTML = '';
      if(badge) mediaWrap.appendChild(badge);
      mediaWrap.insertAdjacentHTML('beforeend', mediaTag(content.hero));
    }

    // About
    if(content.about){
      byId('aboutHeading').textContent = content.about.heading || '';
      byId('aboutParagraphs').innerHTML = (content.about.paragraphs || []).map(function(p){
        return '<p>'+esc(p)+'</p>';
      }).join('');
      byId('aboutPills').innerHTML = (content.about.pills || []).map(function(p){
        return '<span class="pill">'+esc(p)+'</span>';
      }).join('');
      byId('aboutPhoto').src = content.about.photo || 'assets/headshot-placeholder.svg';
    }

    // Projects
    if(content.projects){
      byId('projectsGrid').innerHTML = content.projects.map(projectCard).join('');
    }

    // Skills
    if(content.skills){
      byId('toolkitGrid').innerHTML = (content.skills.groups || []).map(toolkitGroup).join('');
    }

    // Education & Certifications
    if(content.education){
      byId('educationList').innerHTML = (content.education.degrees || []).map(degreeItem).join('');
      var certs = content.education.certifications || [];
      byId('certificationsList').innerHTML = certs.length
        ? certs.map(certItem).join('')
        : '<p class="cert-empty">Data analytics certifications coming soon — to be added via the Admin Panel.</p>';
    }

    // CTA / Resume
    if(content.cta){
      byId('ctaTitle').textContent = content.cta.title || '';
      byId('ctaSub').textContent = content.cta.sub || '';
      byId('resumeLink').href = content.cta.resumeFile || '#';
    }

    // Contact
    if(content.contact){
      byId('contactHeading').textContent = content.contact.heading || '';
      byId('contactSub').textContent = content.contact.sub || '';

      byId('emailRow').href = 'mailto:' + (content.contact.email || '');
      byId('emailValue').textContent = content.contact.email || '';

      byId('whatsappRow').href = content.contact.whatsappLink || '#';
      byId('whatsappValue').textContent = content.contact.whatsappNumber || '';

      byId('linkedinRow').href = content.contact.linkedin || '#';
      byId('linkedinValue').textContent = (content.contact.linkedin || '').replace(/^https?:\/\//,'');

      byId('githubRow').href = content.contact.github || '#';
      byId('githubValue').textContent = (content.contact.github || '').replace(/^https?:\/\//,'');

      byId('footerLinkedin').href = content.contact.linkedin || '#';
      byId('footerGithub').href = content.contact.github || '#';
      byId('footerEmail').href = 'mailto:' + (content.contact.email || '');
    }

    // Footer
    if(content.footer){
      byId('footerRole').textContent = content.footer.role || '';
    }

    document.dispatchEvent(new CustomEvent('site:rendered'));
  }

  function byId(id){ return document.getElementById(id); }

  // Initial render
  render(getContent());

  // Live update: when the Admin Panel saves a draft in another tab of
  // this same browser, the "storage" event fires here automatically —
  // re-render immediately, no reload needed.
  window.addEventListener('storage', function(e){
    if(e.key === DRAFT_KEY){
      render(getContent());
    }
  });

  // Expose for the Admin Panel's live-preview iframe (same-tab updates)
  window.__renderSite = render;
  window.__getSiteContent = getContent;

})();
