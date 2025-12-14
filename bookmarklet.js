(function() {
  'use strict';
  
  // =====================================================
  // DOMAIN RESTRICTION - Only works on ClickEdu
  // =====================================================
  
  const ALLOWED_DOMAINS = [
    'insscf.clickedu.eu'
  ];
  
  const ALLOWED_PATHS = [
    '/sumari/index.php'
  ];
  
  function isAllowedDomain() {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    
    // Check domain
    const domainMatch = ALLOWED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
    
    if (!domainMatch) {
      return {
        allowed: false,
        message: `⚠️ DOMINI NO AUTORITZAT\n\nAquest bookmarklet només funciona a:\n• ${ALLOWED_DOMAINS.join('\n• ')}\n\nDomini actual: ${hostname}`
      };
    }
    
    // Check path
    const pathMatch = ALLOWED_PATHS.some(path => 
      pathname.startsWith(path)
    );
    
    if (!pathMatch) {
      return {
        allowed: false,
        message: `⚠️ PÀGINA NO AUTORITZADA\n\nAquest bookmarklet només funciona a:\n• https://${ALLOWED_DOMAINS[0]}${ALLOWED_PATHS[0]}*\n\nPàgina actual: ${pathname}`
      };
    }
    
    return { allowed: true };
  }
  
  // Check before proceeding
  const domainCheck = isAllowedDomain();
  if (!domainCheck.allowed) {
    alert(domainCheck.message);
    console.error('[SECURITY] Bookmarklet blocked on:', window.location.href);
    console.error('[SECURITY] Allowed domains:', ALLOWED_DOMAINS);
    console.error('[SECURITY] Allowed paths:', ALLOWED_PATHS);
    return; // Stop execution
  }
  
  console.log('[SECURITY] Domain check passed ✅');
  
  // =====================================================
  // CONFIGURATION
  // =====================================================
  
  const CONFIG = {
    backendAPI: 'https://clickedu-docs-api.clickedu-docs.workers.dev',
    version: '1.0.1'  // Updated version
  };
  
  // =====================================================
  // OVERLAY FUNCTIONALITY
  // =====================================================
  
  let overlay = null;
  
  function openOverlay() {
    if (overlay) {
      overlay.style.display = 'flex';
      return;
    }
    
    // Create full-screen overlay
    overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.95)',
      zIndex: 999999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflow: 'auto',
      fontFamily: 'Arial, sans-serif'
    });
    
    // Loading message
    const loadingMsg = document.createElement('div');
    loadingMsg.textContent = '📥 Carregant documents...';
    Object.assign(loadingMsg.style, {
      color: '#fff',
      fontSize: '24px',
      fontWeight: 'bold'
    });
    overlay.appendChild(loadingMsg);
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    Object.assign(closeBtn.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '50px',
      height: '50px',
      fontSize: '28px',
      cursor: 'pointer',
      borderRadius: '50%',
      border: 'none',
      background: '#dc3545',
      color: '#fff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      zIndex: 1000000,
      transition: 'all 0.2s'
    });
    closeBtn.onclick = () => overlay.style.display = 'none';
    closeBtn.onmouseover = () => {
      closeBtn.style.transform = 'scale(1.1)';
      closeBtn.style.background = '#c82333';
    };
    closeBtn.onmouseout = () => {
      closeBtn.style.transform = 'scale(1)';
      closeBtn.style.background = '#dc3545';
    };
    overlay.appendChild(closeBtn);
    
    document.body.appendChild(overlay);
    
    // Load documents from backend
    loadDocs(overlay, loadingMsg);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.style.display === 'flex') {
        overlay.style.display = 'none';
      }
    });
    
    // Click outside to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.style.display = 'none';
      }
    });
  }
  
  // =====================================================
  // FETCH DOCUMENTS - Calls secure backend
  // =====================================================
  
  async function loadDocs(overlay, loadingMsg) {
    try {
      console.log('[INFO] Fetching documents from backend...');
      
      // Call YOUR backend (not Google directly)
      const response = await fetch(`${CONFIG.backendAPI}/api/documents`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load documents');
      }
      
      console.log('[SUCCESS] Loaded', Object.keys(data.documents).length, 'document groups');
      
      loadingMsg.remove();
      buildUI(data.documents, overlay);
      
    } catch (error) {
      loadingMsg.remove();
      showError(`❌ Error: ${error.message}`, overlay);
      console.error('[ERROR] Failed to load documents:', error);
    }
  }
  
  // =====================================================
  // BUILD UI - Display documents
  // =====================================================
  
  function buildUI(groups, overlay) {
    const container = document.createElement('div');
    Object.assign(container.style, {
      background: '#fff',
      borderRadius: '16px',
      padding: '30px',
      maxWidth: '1400px',
      width: '100%',
      maxHeight: '85vh',
      overflow: 'auto',
      boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
    });
    
    // Title
    const title = document.createElement('h1');
    title.textContent = '📂 Documents InsSCF';
    Object.assign(title.style, {
      margin: '0 0 30px 0',
      textAlign: 'center',
      color: '#333',
      fontSize: '36px',
      fontWeight: 'bold'
    });
    container.appendChild(title);
    
    // Security badge
    const badge = document.createElement('div');
    badge.innerHTML = '🔒 Només a insscf.clickedu.eu';
    Object.assign(badge.style, {
      textAlign: 'center',
      fontSize: '14px',
      color: '#28a745',
      marginBottom: '20px',
      fontWeight: 'bold'
    });
    container.appendChild(badge);
    
    // Document groups
    for (const [groupName, docs] of Object.entries(groups)) {
      const section = document.createElement('div');
      section.style.marginBottom = '30px';
      
      // Group title
      const groupTitle = document.createElement('h2');
      groupTitle.textContent = groupName;
      Object.assign(groupTitle.style, {
        color: '#007bff',
        fontSize: '24px',
        marginBottom: '15px',
        paddingBottom: '10px',
        borderBottom: '2px solid #007bff'
      });
      section.appendChild(groupTitle);
      
      // Document grid
      const grid = document.createElement('div');
      Object.assign(grid.style, {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '15px'
      });
      
      // Document buttons
      for (const doc of docs) {
        const btn = document.createElement('button');
        btn.textContent = doc.label;
        Object.assign(btn.style, {
          padding: '15px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          borderRadius: '10px',
          border: 'none',
          background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
          color: '#fff',
          textAlign: 'left',
          boxShadow: '0 4px 12px rgba(0,123,255,0.3)',
          transition: 'all 0.2s',
          fontWeight: '500'
        });
        
        // Hover effects
        btn.onmouseover = () => {
          btn.style.transform = 'translateY(-3px)';
          btn.style.boxShadow = '0 6px 20px rgba(0,123,255,0.4)';
        };
        btn.onmouseout = () => {
          btn.style.transform = 'translateY(0)';
          btn.style.boxShadow = '0 4px 12px rgba(0,123,255,0.3)';
        };
        
        // Click to open
        btn.onclick = () => {
          console.log('[CLICK] Opening document:', doc.label);
          window.open(doc.url, '_blank');
        };
        
        grid.appendChild(btn);
      }
      
      section.appendChild(grid);
      container.appendChild(section);
    }
    
    overlay.appendChild(container);
  }
  
  // =====================================================
  // ERROR DISPLAY
  // =====================================================
  
  function showError(message, overlay) {
    const errorBox = document.createElement('div');
    Object.assign(errorBox.style, {
      background: '#fff',
      padding: '40px',
      borderRadius: '12px',
      maxWidth: '600px',
      textAlign: 'center',
      boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
      border: '3px solid #dc3545'
    });
    
    const safeMessage = document.createElement('div');
    safeMessage.textContent = message;
    
    errorBox.innerHTML = `
      <div style="font-size: 64px; margin-bottom: 20px;">❌</div>
      <div style="font-size: 24px; font-weight: bold; color: #dc3545; margin-bottom: 15px;">
        Error
      </div>
      <div style="font-size: 18px; color: #333; margin-bottom: 20px;">
        ${safeMessage.innerHTML}
      </div>
      <button onclick="location.reload()" style="
        padding: 12px 24px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
      ">
        🔄 Tornar a intentar
      </button>
    `;
    
    overlay.appendChild(errorBox);
  }
  
  // =====================================================
  // INITIALIZATION
  // =====================================================
  
  console.log('📂 ClickEdu Docs Overlay v' + CONFIG.version + ' loaded ✅');
  console.log('🔒 Domain restriction active');
  openOverlay();
  
})();
