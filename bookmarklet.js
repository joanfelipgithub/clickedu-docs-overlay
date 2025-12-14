(function() {
  'use strict';
  
  // =====================================================
  // CONFIGURATION
  // =====================================================
  
  const CONFIG = {
    backendAPI: 'https://clickedu-docs-api.clickedu-docs.workers.dev',
    version: '1.0.0'
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
    
    const loadingMsg = document.createElement('div');
    loadingMsg.textContent = '📥 Carregant documents...';
    Object.assign(loadingMsg.style, {
      color: '#fff',
      fontSize: '24px',
      fontWeight: 'bold'
    });
    overlay.appendChild(loadingMsg);
    
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
    
    loadDocs(overlay, loadingMsg);
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.style.display = 'none';
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.style.display === 'flex') {
        overlay.style.display = 'none';
      }
    });
  }
  
  async function loadDocs(overlay, loadingMsg) {
    try {
      const response = await fetch(`${CONFIG.backendAPI}/api/documents`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load documents');
      }
      
      loadingMsg.remove();
      buildUI(data.documents, overlay);
      
    } catch (error) {
      loadingMsg.remove();
      showError(`❌ Error: ${error.message}`, overlay);
      console.error('Error loading documents:', error);
    }
  }
  
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
    
    for (const [groupName, docs] of Object.entries(groups)) {
      const section = document.createElement('div');
      section.style.marginBottom = '30px';
      
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
      
      const grid = document.createElement('div');
      Object.assign(grid.style, {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '15px'
      });
      
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
        btn.onmouseover = () => {
          btn.style.transform = 'translateY(-3px)';
          btn.style.boxShadow = '0 6px 20px rgba(0,123,255,0.4)';
        };
        btn.onmouseout = () => {
          btn.style.transform = 'translateY(0)';
          btn.style.boxShadow = '0 4px 12px rgba(0,123,255,0.3)';
        };
        btn.onclick = () => {
          window.open(doc.url, '_blank');
        };
        grid.appendChild(btn);
      }
      
      section.appendChild(grid);
      container.appendChild(section);
    }
    
    overlay.appendChild(container);
  }
  
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
    
    errorBox.innerHTML = `
      <div style="font-size: 64px; margin-bottom: 20px;">❌</div>
      <div style="font-size: 24px; font-weight: bold; color: #dc3545; margin-bottom: 15px;">
        Error
      </div>
      <div style="font-size: 18px; color: #333; margin-bottom: 20px;">
        ${message}
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
  
  console.log('📂 ClickEdu Docs Overlay v' + CONFIG.version + ' loaded');
  openOverlay();
  
})();