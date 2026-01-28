/**
 * ============================================
 * MAIN JAVASCRIPT FILE
 * ============================================
 * Handles:
 * - Scroll animations
 * - Mobile menu toggle
 * - Sticky header on scroll
 * - Smooth scrolling
 * - Filter button interactions (visual only)
 */

// ============================================
// DOM ELEMENTS (cached for performance)
// ============================================

const header = document.getElementById('header');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const nav = document.getElementById('nav');
const navList = document.querySelector('.nav-list');
const filterButtons = document.querySelectorAll('.filter-btn');

// ============================================
// PERFORMANCE HELPERS
// ============================================

// Throttle function para optimizar eventos frecuentes
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Debounce function para optimizar búsquedas
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// STICKY HEADER ON SCROLL
// ============================================

let lastScroll = 0;
let ticking = false;

function updateHeader() {
    const currentScroll = window.pageYOffset;
    
    // Add 'scrolled' class when scrolling down
    if (currentScroll > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    // Update header height CSS variable for mobile menu positioning
    if (window.innerWidth <= 767 && header) {
        const headerHeight = header.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    }
    
    lastScroll = currentScroll;
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
    }
}, { passive: true });

// ============================================
// MOBILE MENU TOGGLE
// ============================================

if (mobileMenuToggle) {
    let isMenuOpen = false;
    
    // Update header height and menu position on load and resize
    function updateMobileMenuPosition() {
        if (window.innerWidth <= 767 && header && navList) {
            const headerRect = header.getBoundingClientRect();
            const headerHeight = headerRect.height;
            const headerTop = headerRect.top;
            
            // Actualizar la variable CSS con la altura del header
            document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
            
            // Si el menú está abierto, actualizar su posición para que siempre esté debajo del header
            if (isMenuOpen && navList.classList.contains('active')) {
                // Calcular la posición correcta del menú basada en la posición actual del header
                const menuTop = headerTop + headerHeight;
                navList.style.top = `${menuTop}px`;
                navList.style.height = `calc(100vh - ${menuTop}px)`;
            }
        }
    }
    
    // Initial update on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateMobileMenuPosition);
    } else {
        updateMobileMenuPosition();
    }
    
    // Update on resize
    window.addEventListener('resize', throttle(updateMobileMenuPosition, 100));
    
    // Update on scroll - mantener el menú visible y actualizar posición
    window.addEventListener('scroll', throttle(() => {
        if (window.innerWidth <= 767 && isMenuOpen && navList.classList.contains('active')) {
            updateMobileMenuPosition();
        }
    }, 50), { passive: true });
    
    mobileMenuToggle.addEventListener('click', () => {
        // Update position before opening/closing menu
        updateMobileMenuPosition();
        
        // Toggle menu state
        const wasOpen = navList.classList.contains('active');
        navList.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
        isMenuOpen = !wasOpen;
        
        // Prevenir scroll del body cuando el menú está abierto
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
            // Actualizar posición después de abrir para asegurar que esté correcta
            setTimeout(() => updateMobileMenuPosition(), 10);
        } else {
            document.body.style.overflow = '';
        }
        
        // Animate hamburger icon
        const spans = mobileMenuToggle.querySelectorAll('span');
        if (navList.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
    
    // Cerrar menú al hacer click fuera de él
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 767 && isMenuOpen && navList.classList.contains('active')) {
            const isClickInsideMenu = navList.contains(e.target);
            const isClickOnToggle = mobileMenuToggle.contains(e.target);
            
            if (!isClickInsideMenu && !isClickOnToggle) {
                navList.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                isMenuOpen = false;
                document.body.style.overflow = '';
                
                // Reset hamburger icon
                const spans = mobileMenuToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        }
    });
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navList.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            isMenuOpen = false;
            document.body.style.overflow = '';
            const spans = mobileMenuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && navList.classList.contains('active')) {
            navList.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            const spans = mobileMenuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// ============================================
// SMOOTH SCROLLING FOR ANCHOR LINKS
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Skip if it's just "#" or if it has data-agent-link (product links)
        if (href === '#' || this.hasAttribute('data-agent-link')) {
            return;
        }
        
        const target = document.querySelector(href);
        
        if (target) {
            e.preventDefault();
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// SCROLL ANIMATIONS (Intersection Observer)
// ============================================

/**
 * Observe elements with 'slide-up' class
 * Add 'visible' class when they enter the viewport
 */
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Unobserve after animation to improve performance
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all elements with 'slide-up' class
function initScrollAnimations() {
    const slideUpElements = document.querySelectorAll('.slide-up:not(.observed)');
    slideUpElements.forEach(el => {
        observer.observe(el);
        el.classList.add('observed'); // Marcar como observado para evitar duplicados
    });
}

// Inicializar animaciones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
});

// ============================================
// FILTER BUTTON INTERACTIONS (Visual Only)
// ============================================

if (filterButtons.length > 0) {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Visual feedback
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);
            
            // Note: This is visual only - no actual filtering functionality
            // In a real application, you would filter products here
        });
    });
}

// ============================================
// PRODUCT FILTERS SIDEBAR
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Category buttons with filtering (ahora recarga desde API)
    const categoryButtons = document.querySelectorAll('.category-btn');
    if (categoryButtons.length > 0) {
        categoryButtons.forEach(button => {
            // Verificar si ya tiene un listener para evitar duplicados
            if (!button.dataset.listenerAdded) {
                button.dataset.listenerAdded = 'true';
                button.addEventListener('click', () => {
                    categoryButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    
                    // Esperar un momento para que el DOM se actualice antes de construir filtros
                    setTimeout(() => {
                        const filters = buildFiltersFromUI();
                        loadProductsPage(1, filters);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 10);
                });
            }
        });
    }
    
    // Search input con debounce optimizado
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        const handleSearch = debounce((e) => {
            const searchTerm = e.target.value.trim();
            const filters = buildFiltersFromUI();
            if (searchTerm) {
                filters.search = searchTerm;
            }
            loadProductsPage(1, filters);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 400);
        
        searchInput.addEventListener('input', handleSearch, { passive: true });
    }
    
    // Sort select change handler
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const selectedValue = this.value;
            const filters = buildFiltersFromUI();
            filters.sort = selectedValue;
            // Resetear a página 1 cuando cambia el ordenamiento
            currentPage = 1;
            loadProductsPage(1, filters);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Filter section accordions
    const filterSectionHeaders = document.querySelectorAll('.filter-section-header');
    filterSectionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const section = header.getAttribute('data-section');
            const content = document.getElementById(`${section}Content`);
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            
            // Close all other sections
            filterSectionHeaders.forEach(h => {
                if (h !== header) {
                    h.setAttribute('aria-expanded', 'false');
                    const otherSection = h.getAttribute('data-section');
                    const otherContent = document.getElementById(`${otherSection}Content`);
                    if (otherContent) {
                        otherContent.classList.remove('expanded');
                    }
                }
            });
            
            // Toggle current section
            header.setAttribute('aria-expanded', !isExpanded);
            if (content) {
                content.classList.toggle('expanded', !isExpanded);
            }
        });
        
        // Set initial state (closed by default)
        header.setAttribute('aria-expanded', 'false');
        const section = header.getAttribute('data-section');
        const content = document.getElementById(`${section}Content`);
        if (content) {
            content.classList.remove('expanded');
        }
    });
    
    // Quality buttons with filtering (ahora recarga desde API)
    const qualityButtons = document.querySelectorAll('.quality-btn');
    qualityButtons.forEach(button => {
        button.addEventListener('click', () => {
            qualityButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filters = buildFiltersFromUI();
            const quality = button.getAttribute('data-quality');
            if (quality) {
                filters.quality = quality;
            }
            loadProductsPage(1, filters);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
    
    // Brand buttons with filtering (ahora recarga desde API)
    const brandButtons = document.querySelectorAll('.brand-btn');
    brandButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Desactivar todas las demás marcas (solo una activa a la vez)
            brandButtons.forEach(btn => {
                if (btn !== button) {
                    btn.classList.remove('active');
                }
            });
            button.classList.toggle('active');
            
            const filters = buildFiltersFromUI();
            loadProductsPage(1, filters);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
});

// Construir objeto de filtros desde la UI
function buildFiltersFromUI() {
    const filters = {};
    
    const searchInput = document.getElementById('productSearch');
    if (searchInput && searchInput.value.trim()) {
        filters.search = searchInput.value.trim();
    }
    
    const activeCategory = document.querySelector('.category-btn.active');
    if (activeCategory) {
        const category = activeCategory.getAttribute('data-category');
        if (category && category !== 'all') {
            // Guardar la categoría directamente (sin convertir) para el filtrado en el cliente
            // El filtrado usa mapProductCategory que retorna valores como 'calzado', 'ropa-superior', etc.
            filters.category = category;
        }
    }
    
    const activeQuality = document.querySelector('.quality-btn.active');
    if (activeQuality) {
        const quality = activeQuality.getAttribute('data-quality');
        if (quality) {
            filters.quality = quality;
        }
    }
    
    const activeBrand = document.querySelector('.brand-btn.active');
    if (activeBrand) {
        // Usar el atributo data-brand si existe, sino usar el texto
        const brandValue = activeBrand.getAttribute('data-brand') || activeBrand.textContent.trim();
        filters.brand = brandValue;
    }
    
    // Agregar ordenamiento
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        filters.sort = sortSelect.value;
    }
    
    return filters;
}

// ============================================
// PRODUCT CARD HOVER EFFECTS (Enhanced)
// ============================================

const productCards = document.querySelectorAll('.product-card');

productCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease-in-out';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transition = 'all 0.3s ease-in-out';
    });
});

// ============================================
// BUTTON HOVER EFFECTS
// ============================================

const buttons = document.querySelectorAll('.btn');

buttons.forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease-in-out';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transition = 'all 0.3s ease-in-out';
    });
});

// ============================================
// ACTIVE NAVIGATION LINK HIGHLIGHTING
// ============================================

/**
 * Highlight the active navigation link based on current page
 */
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        const linkPath = link.getAttribute('href');
        
        // Check if current path matches link path
        if (currentPath.includes(linkPath) || 
            (currentPath === '/' && linkPath === 'index.html') ||
            (currentPath.endsWith('/') && linkPath === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Set active link on page load
document.addEventListener('DOMContentLoaded', setActiveNavLink);

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================

/**
 * Throttle function for scroll events
 */

// ============================================
// CONFIGURATION PANEL
// ============================================

const configToggle = document.getElementById('configToggle');
const configPanel = document.getElementById('configPanel');
const configClose = document.getElementById('configClose');
const currencyOptions = document.querySelectorAll('#currencyOptions .config-option');
const agentOptions = document.querySelectorAll('#agentOptions .config-option');

// Open/Close Config Panel
if (configToggle && configPanel) {
    configToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Calculate button position
        const buttonRect = configToggle.getBoundingClientRect();
        const panelContent = configPanel.querySelector('.config-panel-content');
        
        if (panelContent) {
            // Position panel next to the button
            // Position it to the left of the button, aligned with top
            const panelWidth = 360; // max-width from CSS
            const spacing = 8; // spacing between button and panel
            
            // Calculate position: button right edge - panel width - spacing
            const leftPosition = buttonRect.right - panelWidth - spacing;
            const topPosition = buttonRect.bottom + spacing;
            
            panelContent.style.position = 'absolute';
            panelContent.style.top = `${topPosition}px`;
            panelContent.style.right = 'auto';
            panelContent.style.left = `${Math.max(spacing, leftPosition)}px`;
            panelContent.style.transform = 'none';
        }
        
        configPanel.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    // Update position on window resize (throttled for performance)
    const updatePanelPosition = throttle(() => {
        if (configPanel.classList.contains('active') && configToggle) {
            const buttonRect = configToggle.getBoundingClientRect();
            const panelContent = configPanel.querySelector('.config-panel-content');
            
            if (panelContent) {
                const panelWidth = 360;
                const spacing = 8;
                const leftPosition = buttonRect.right - panelWidth - spacing;
                const topPosition = buttonRect.bottom + spacing;
                
                panelContent.style.left = `${Math.max(spacing, leftPosition)}px`;
                panelContent.style.top = `${topPosition}px`;
            }
        }
    }, 100);
    
    window.addEventListener('resize', updatePanelPosition, { passive: true });
}

if (configClose && configPanel) {
    configClose.addEventListener('click', () => {
        configPanel.classList.remove('active');
        document.body.style.overflow = '';
    });
}

// Close panel when clicking outside
if (configPanel) {
    configPanel.addEventListener('click', (e) => {
        if (e.target === configPanel) {
            configPanel.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Currency Selection
currencyOptions.forEach(option => {
    option.addEventListener('click', () => {
        // Remove active class from all options
        currencyOptions.forEach(opt => opt.classList.remove('active'));
        // Add active class to clicked option
        option.classList.add('active');
        
        // Store selection
        const selectedCurrency = option.getAttribute('data-currency');
        localStorage.setItem('selectedCurrency', selectedCurrency);
        
        // Update all product prices
        updateProductPrices(selectedCurrency);
        
    });
});

// Agent Selection
agentOptions.forEach(option => {
    option.addEventListener('click', () => {
        // Remove active class from all options
        agentOptions.forEach(opt => opt.classList.remove('active'));
        // Add active class to clicked option
        option.classList.add('active');
        
        // Store selection (for future use)
        const selectedAgent = option.getAttribute('data-agent');
        localStorage.setItem('selectedAgent', selectedAgent);
        
        // Update all product links based on selected agent
        updateProductLinks(selectedAgent);
        
        // Visual feedback
    });
});

// Theme Toggle Button
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        applyTheme(newTheme);
        localStorage.setItem('selectedTheme', newTheme);
    });
}


// Function to apply theme
function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

// Load saved theme immediately (before DOMContentLoaded to avoid flash)
(function() {
    // Siempre empezar con tema oscuro
    const savedTheme = localStorage.getItem('selectedTheme');
    if (!savedTheme || savedTheme === 'light') {
        localStorage.setItem('selectedTheme', 'dark');
        applyTheme('dark');
    } else {
        applyTheme(savedTheme);
    }
})();


// Function to extract product ID and platform from URL
// Function to get agent display name
function getAgentDisplayName(agentCode) {
    const agentOption = document.querySelector(`.agent-option[data-agent="${agentCode}"]`);
    if (agentOption) {
        const agentNameSpan = agentOption.querySelector('.agent-name');
        if (agentNameSpan) {
            return agentNameSpan.textContent.trim();
        }
    }
    // Fallback names (solo los 5 agentes activos)
    const agentNames = {
        'Hubbuy': 'Hubbuy',
        'KakoBuy': 'KakoBuy',
        'Kakobuy': 'KakoBuy',
        'MuleBuy': 'MuleBuy',
        'Mulebuy': 'MuleBuy',
        'CssBuy': 'CssBuy',
        'CSSBuy': 'CssBuy',
        'cssbuy': 'CssBuy',
        'Oopbuy': 'Oopbuy',
        'OOPBuy': 'Oopbuy',
        'oopbuy': 'Oopbuy'
    };
    return agentNames[agentCode] || agentCode;
}

// Extraer link base (weidian/1688/taobao) desde cualquier link de agente
// Esta función debe estar definida antes de updateProductLinks
function extractBaseUrlFromAgentLink(agentLink) {
    if (!agentLink || typeof agentLink !== 'string') {
        return null;
    }
    
    const url = agentLink.trim();
    
    // Si el link ya es un link base (weidian/1688/taobao), retornarlo directamente
    if (url.includes('weidian.com') || url.includes('1688.com') || url.includes('taobao.com')) {
        return url;
    }
    
    // KakoBuy: https://www.kakobuy.com/item/details?url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D7616832901&affcode=allreps
    if (url.includes('kakobuy.com/item/details')) {
        // Buscar el parámetro url= en la query string
        const urlMatch = url.match(/[?&]url=([^&]+)/);
        if (urlMatch && urlMatch[1]) {
            try {
                // Intentar decodificar una vez
                let decodedUrl = decodeURIComponent(urlMatch[1]);
                // Si aún contiene % codificado, decodificar de nuevo
                if (decodedUrl.includes('%')) {
                    decodedUrl = decodeURIComponent(decodedUrl);
                }
                // Verificar que sea un link base válido
                if (decodedUrl.includes('weidian.com') || decodedUrl.includes('1688.com') || decodedUrl.includes('taobao.com')) {
                    return decodedUrl;
                }
            } catch (e) {
                // Error decoding URL
            }
        }
    }
    
    // Hubbuy/HipoBuy: https://www.hubbuycn.com/product/item?url=https://weidian.com/item.html?itemID=7616832901=product_link&invitation_code=0O40qL00
    if (url.includes('hubbuycn.com') || url.includes('hipobuy')) {
        const match = url.match(/url=([^=&]+)/);
        if (match) {
            // Remover "=product_link" si existe
            let baseUrl = match[1];
            if (baseUrl.includes('=product_link')) {
                baseUrl = baseUrl.replace('=product_link', '');
            }
            try {
                return decodeURIComponent(baseUrl);
            } catch (e) {
                // Si falla el decode, retornar tal cual
                return baseUrl;
            }
        }
    }
    
    // Oopbuy: https://oopbuy.com/product/weidian/7616832901
    // Extraer plataforma e ID
    const oopbuyMatch = url.match(/oopbuy\.com\/product\/([^\/]+)\/(\d+)/);
    if (oopbuyMatch) {
        const platform = oopbuyMatch[1];
        const productId = oopbuyMatch[2];
        
        // Reconstruir link base según plataforma
        if (platform === 'weidian' || platform === 'WEIDIAN') {
            return `https://weidian.com/item.html?itemID=${productId}`;
        } else if (platform === '1688') {
            return `https://detail.1688.com/offer/${productId}.html`;
        } else if (platform === 'taobao') {
            return `https://item.taobao.com/item.htm?id=${productId}`;
        }
    }
    
    // MuleBuy: https://mulebuy.com/product?id=7616832901&platform=WEIDIAN&ref=200118463
    const mulebuyMatch = url.match(/mulebuy\.com\/product\?id=(\d+)&platform=([^&]+)/);
    if (mulebuyMatch) {
        const productId = mulebuyMatch[1];
        const platform = mulebuyMatch[2];
        
        // Reconstruir link base según plataforma
        if (platform === 'WEIDIAN') {
            return `https://weidian.com/item.html?itemID=${productId}`;
        } else if (platform === 'ALI_1688') {
            return `https://detail.1688.com/offer/${productId}.html`;
        } else if (platform === 'TAOBAO') {
            return `https://item.taobao.com/item.htm?id=${productId}`;
        }
    }
    
    // CssBuy: https://www.cssbuy.com/item-698667801968.html
    // Formato: item-{productId}.html
    // Intentar extraer productId del link de CssBuy
    const cssbuyMatch = url.match(/cssbuy\.com\/item-(\d+)\.html/i);
    if (cssbuyMatch) {
        const productId = cssbuyMatch[1];
        // No podemos determinar la plataforma desde CssBuy, así que retornamos null
        // El link base se obtendrá desde source_url en la base de datos
        return null;
    }
    
    return null;
}

// Function to update all product links based on selected agent
function updateProductLinks(selectedAgent) {
    // If no agent provided, get it from localStorage or active button
    if (!selectedAgent) {
        selectedAgent = localStorage.getItem('selectedAgent') || 
                       document.querySelector('.agent-option.active')?.getAttribute('data-agent') || 
                       'Hubbuy';
    }
    
    // Get the display name of the agent
    const agentDisplayName = getAgentDisplayName(selectedAgent);
    
    // Select all product links (buttons with data-agent-link attribute)
    const productLinks = document.querySelectorAll('a[data-agent-link]');
    
    // Procesar todos los links de forma optimizada
    productLinks.forEach((link) => {
        const card = link.closest('.product-card');
        if (!card) {
            link.textContent = `Ver en ${agentDisplayName}`;
            link.href = 'javascript:void(0);';
            link.style.opacity = '0.5';
            link.style.cursor = 'not-allowed';
            return;
        }
        
        // Obtener source_url del card (link base weidian/1688/taobao)
        let baseUrl = card.getAttribute('data-base-url');
        
        // Validar y limpiar baseUrl si es necesario
        if (baseUrl && baseUrl.trim() !== '') {
            // Si es un link de agente, extraer el link base real
            if (baseUrl.includes('kakobuy.com') || baseUrl.includes('hubbuycn.com') || baseUrl.includes('mulebuy.com') || baseUrl.includes('cssbuy.com') || baseUrl.includes('oopbuy.com')) {
                const realBaseUrl = extractBaseUrlFromAgentLink(baseUrl);
                if (realBaseUrl && (realBaseUrl.includes('weidian.com') || realBaseUrl.includes('1688.com') || realBaseUrl.includes('taobao.com'))) {
                    baseUrl = realBaseUrl;
                } else {
                    baseUrl = null;
                }
            } else if (!baseUrl.includes('weidian.com') && !baseUrl.includes('1688.com') && !baseUrl.includes('taobao.com')) {
                baseUrl = null;
            }
        } else {
            baseUrl = null;
        }
        
        // Convertir link base al agente seleccionado
        if (baseUrl && baseUrl.trim() !== '') {
            // Usar async/await para la conversión
            (async () => {
                const convertedLink = await convertToAgentLink(baseUrl, selectedAgent);
                
                if (convertedLink && convertedLink.trim() !== '' && convertedLink.startsWith('http')) {
                    link.href = convertedLink;
                    link.textContent = `Ver en ${agentDisplayName}`;
                    link.style.opacity = '';
                    link.style.cursor = '';
                } else {
                    link.href = 'javascript:void(0);';
                    link.textContent = `Sin link disponible`;
                    link.style.opacity = '0.5';
                    link.style.cursor = 'not-allowed';
                }
            })();
        } else {
            link.href = 'javascript:void(0);';
            link.textContent = `Sin link disponible`;
            link.style.opacity = '0.5';
            link.style.cursor = 'not-allowed';
        }
    });
}


// Exchange rates (will be updated from API if available)
// Base currency is now CNY (products prices are stored in CNY)
let exchangeRates = {
    CNY: 1.0,    // Base currency
    USD: 0.155,  // 1 CNY = 0.155 USD
    ARS: 225.525, // 1 CNY = 0.155 USD * 1455 ARS/USD ≈ 225.525 ARS (will update from API)
    CLP: 144.15  // 1 CNY = 0.155 USD * 930 CLP/USD ≈ 144.15 CLP (approximate)
};

// Function to fetch exchange rates
async function fetchExchangeRates() {
    try {
        // Use external API directly (dolarsi - more reliable)
        try {
            const response = await fetch('https://www.dolarsi.com/api/api.php?type=valoresprincipales');
            if (response.ok) {
                const data = await response.json();
                // Find "Dolar Oficial" in the response
                const oficial = data.find(item => item.casa.nombre === 'Dolar Oficial');
                if (oficial && oficial.casa.venta) {
                    const ventaOficial = parseFloat(oficial.casa.venta.replace(',', '.'));
                    if (!isNaN(ventaOficial)) {
                        // 1 USD = ventaOficial ARS
                        exchangeRates.ARS = ventaOficial;
                        return;
                    }
                }
            }
        } catch (e) {
            // Fallback to default rate (1455 ARS per USD)
            exchangeRates.ARS = 1455;
        }
    } catch (e) {
        // Keep default rates
        exchangeRates.ARS = 1455;
    }
}

// Function to update all product prices based on selected currency (optimizado)
function updateProductPrices(selectedCurrency) {
    const priceElements = document.querySelectorAll('.price-cny[data-price-cny]');
    
    // Pre-calcular formato según moneda para evitar cálculos repetidos
    let formatPriceFn;
    switch(selectedCurrency) {
        case 'CNY':
            formatPriceFn = (priceCNY) => `¥${priceCNY.toFixed(2)} CNY`;
            break;
        case 'USD':
            formatPriceFn = (priceCNY) => {
                const convertedPrice = priceCNY * exchangeRates.USD;
                return `$${convertedPrice.toFixed(2)} USD`;
            };
            break;
        case 'ARS':
            formatPriceFn = (priceCNY) => {
                const convertedPrice = priceCNY * exchangeRates.ARS;
                return `$${Math.round(convertedPrice).toLocaleString('es-AR')} ARS`;
            };
            break;
        case 'CLP':
            formatPriceFn = (priceCNY) => {
                const convertedPrice = priceCNY * exchangeRates.CLP;
                return `$${Math.round(convertedPrice).toLocaleString('es-CL')} CLP`;
            };
            break;
        default:
            formatPriceFn = (priceCNY) => `¥${priceCNY.toFixed(2)} CNY`;
    }
    
    // Usar requestAnimationFrame para batch updates si hay muchos elementos
    if (priceElements.length > 20) {
        let index = 0;
        const updateBatch = () => {
            const batchSize = 10;
            const end = Math.min(index + batchSize, priceElements.length);
            
            for (let i = index; i < end; i++) {
                const priceEl = priceElements[i];
                const originalPriceText = priceEl.getAttribute('data-price-cny');
                if (!originalPriceText) continue;
                
                const priceCNY = parseFloat(originalPriceText);
                if (isNaN(priceCNY)) continue;
                
                const formattedPrice = formatPriceFn(priceCNY);
                priceEl.textContent = `Desde ${formattedPrice}`;
            }
            
            index = end;
            if (index < priceElements.length) {
                requestAnimationFrame(updateBatch);
            }
        };
        requestAnimationFrame(updateBatch);
    } else {
        // Para pocos elementos, actualizar directamente
        priceElements.forEach(priceEl => {
            const originalPriceText = priceEl.getAttribute('data-price-cny');
            if (!originalPriceText) return;
            
            const priceCNY = parseFloat(originalPriceText);
            if (isNaN(priceCNY)) return;
            
            const formattedPrice = formatPriceFn(priceCNY);
            priceEl.textContent = `Desde ${formattedPrice}`;
        });
    }
}

// Load saved preferences on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Fetch exchange rates first
    await fetchExchangeRates();
    
    // Siempre empezar con tema oscuro (forzar dark por defecto)
    const savedTheme = localStorage.getItem('selectedTheme');
    // Si no hay tema guardado o es light, usar dark
    if (!savedTheme || savedTheme === 'light') {
        localStorage.setItem('selectedTheme', 'dark');
        applyTheme('dark');
    } else {
        applyTheme(savedTheme);
    }
    
    const savedCurrency = localStorage.getItem('selectedCurrency');
    const savedAgent = localStorage.getItem('selectedAgent');
    
    if (savedCurrency) {
        currencyOptions.forEach(option => {
            if (option.getAttribute('data-currency') === savedCurrency) {
                currencyOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                // Update prices with saved currency
                updateProductPrices(savedCurrency);
            }
        });
    } else {
        // Default to CNY if no saved preference
        const defaultCurrency = 'CNY';
        updateProductPrices(defaultCurrency);
    }
    
    if (savedAgent) {
        agentOptions.forEach(option => {
            if (option.getAttribute('data-agent') === savedAgent) {
                agentOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                updateProductLinks(savedAgent);
            }
        });
    } else {
        // Default to Hubbuy if no saved preference (Hubbuy is the default active option)
        const defaultAgent = 'Hubbuy';
        // Update links if we're on a page with products
        if (document.querySelectorAll('a[data-agent-link]').length > 0) {
            updateProductLinks(defaultAgent);
        }
    }
});

// ============================================
// ARGENTINA TAX CALCULATOR
// ============================================
// Safe, isolated calculator that only runs if elements exist
// Does not interfere with other site features

document.addEventListener("DOMContentLoaded", () => {
    // Get calculator elements
    const compraInput = document.getElementById("compraUSD");
    const envioInput = document.getElementById("envioUSD");
    const impuestosUSD = document.getElementById("impuestosUSD");
    const impuestosARS = document.getElementById("impuestosARS");
    const limpiarBtn = document.getElementById("limpiarCalc");
    const toggleFranquicia = document.getElementById("toggleFranquicia");
    const toggleTasaGestion = document.getElementById("toggleTasaGestion");
    const calculationSummary = document.getElementById("calculationSummary");
    const franquiciaStatus = document.getElementById("franquiciaStatus");
    const configAccordionToggle = document.getElementById("configAccordionToggle");
    const configCard = document.getElementById("configCard");
    
    // Safety check: exit if calculator elements don't exist
    if (!compraInput || !envioInput || !impuestosUSD || !impuestosARS || !limpiarBtn) {
        return; // Calculator not on this page, exit silently
    }
    
    // Get UI elements for exchange rates
    const dolarOficialDisplay = document.getElementById("dolarOficial");
    const contadoLiquiDisplay = document.getElementById("contadoLiqui");
    
    // Constants
    let DOLAR_OFICIAL = 1455; // Default value, will be updated from API
    let CONTADO_LIQUI = 1513.90; // Default value, will be updated from API
    const FRANQUICIA = 50; // $50 USD
    const TASA_GESTION = 4.95; // $4.95 USD
    
    // Fetch exchange rates from API
    async function fetchExchangeRates() {
        try {
            // Use external API directly (dolarsi - more reliable)
            try {
                const response = await fetch('https://www.dolarsi.com/api/api.php?type=valoresprincipales');
                if (response.ok) {
                    const data = await response.json();
                    // Find "Dolar Oficial" in the response
                    const oficial = data.find(item => item.casa.nombre === 'Dolar Oficial');
                    const ccl = data.find(item => item.casa.nombre === 'Contado con Liquidacion' || item.casa.nombre === 'Dolar Contado con Liquidacion');
                    
                    if (oficial && oficial.casa.venta) {
                        const ventaOficial = parseFloat(oficial.casa.venta.replace(',', '.'));
                        if (!isNaN(ventaOficial)) {
                            DOLAR_OFICIAL = ventaOficial;
                            if (dolarOficialDisplay) {
                                dolarOficialDisplay.textContent = `$${DOLAR_OFICIAL.toFixed(2)}`;
                            }
                        }
                    }
                    
                    if (ccl && ccl.casa.venta) {
                        const ventaCCL = parseFloat(ccl.casa.venta.replace(',', '.'));
                        if (!isNaN(ventaCCL)) {
                            CONTADO_LIQUI = ventaCCL;
                            if (contadoLiquiDisplay) {
                                contadoLiquiDisplay.textContent = `$${CONTADO_LIQUI.toFixed(2)}`;
                            }
                        }
                    }
                }
            } catch (e) {
                // Keep default values
            }
            
            // Update calculation if rates changed
            calcular();
            
        } catch (error) {
            // Keep default values
        }
    }
    
    // Fetch rates on page load (usar requestIdleCallback si está disponible)
    if ('requestIdleCallback' in window) {
        requestIdleCallback(fetchExchangeRates, { timeout: 2000 });
    } else {
        setTimeout(fetchExchangeRates, 100);
    }
    
    // Refresh rates every 30 minutes (optimizado para no bloquear)
    setInterval(() => {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(fetchExchangeRates);
        } else {
            fetchExchangeRates();
        }
    }, 30 * 60 * 1000);
    
    // Animate number update
    function animateNumber(element) {
        element.classList.add("animate");
        setTimeout(() => {
            element.classList.remove("animate");
        }, 400);
    }
    
    // Update franquicia status display
    function updateFranquiciaStatus(usarFranquicia) {
        if (!franquiciaStatus) return;
        
        if (usarFranquicia) {
            franquiciaStatus.textContent = "Franquicia aplicada: -$50";
        } else {
            franquiciaStatus.textContent = "Franquicia no aplicada";
        }
    }
    
    // Update calculation summary
    function updateSummary(usarTasaGestion) {
        if (!calculationSummary) return;
        
        let summary = "Estimación: 50% de la base imponible";
        if (usarTasaGestion) {
            summary += " + tasa fija ($4.95 USD)";
        }
        calculationSummary.textContent = summary;
    }
    
    // Calculation function
    function calcular() {
        // Get input values (default to 0 if empty or invalid)
        const compra = parseFloat(compraInput.value) || 0;
        const envio = parseFloat(envioInput.value) || 0;
        
        // Calculate total USD
        const totalUSD = compra + envio;
        
        // Check if franquicia is enabled
        const usarFranquicia = toggleFranquicia ? toggleFranquicia.checked : true;
        const usarTasaGestion = toggleTasaGestion ? toggleTasaGestion.checked : true;
        
        // Calculate taxable base based on franquicia status
        let baseImponible;
        if (usarFranquicia) {
            // If franquicia is ON: subtract $50 from the total (minimum 0)
            baseImponible = Math.max(0, totalUSD - FRANQUICIA);
        } else {
            // If franquicia is OFF: no discount, full total is taxable
            baseImponible = totalUSD;
        }
        
        // Calculate taxes: (taxableBase * 0.5) + tasa de gestión (if enabled)
        let impuestos = (baseImponible * 0.5);
        if (usarTasaGestion) {
            impuestos += TASA_GESTION;
        }
        
        // Store previous values to detect changes
        const prevUSD = impuestosUSD.textContent;
        const prevARS = impuestosARS.textContent;
        
        // Format and display USD (2 decimals)
        impuestosUSD.textContent = `$${impuestos.toFixed(2)}`;
        
        // Convert to ARS and format (es-AR locale)
        const impuestosARSValue = impuestos * DOLAR_OFICIAL;
        impuestosARS.textContent = `$${impuestosARSValue.toLocaleString("es-AR", { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2,
            useGrouping: true
        })}`;
        
        // Update dollar note in ARS result box
        const dolarOficialNote = document.getElementById("dolarOficialNote");
        if (dolarOficialNote) {
            dolarOficialNote.textContent = `Dólar Oficial: $${DOLAR_OFICIAL.toFixed(2)}`;
        }
        
        // Animate if values changed
        if (prevUSD !== impuestosUSD.textContent) {
            animateNumber(impuestosUSD);
        }
        if (prevARS !== impuestosARS.textContent) {
            animateNumber(impuestosARS);
        }
        
        // Update UI status displays
        updateFranquiciaStatus(usarFranquicia);
        updateSummary(usarTasaGestion);
    }
    
    // Add event listeners for real-time calculation
    compraInput.addEventListener("input", calcular);
    envioInput.addEventListener("input", calcular);
    
    // Toggle listeners
    if (toggleFranquicia) {
        toggleFranquicia.addEventListener("change", calcular);
    }
    if (toggleTasaGestion) {
        toggleTasaGestion.addEventListener("change", calcular);
    }
    
    // Clear button functionality
    limpiarBtn.addEventListener("click", () => {
        compraInput.value = "";
        envioInput.value = "";
        impuestosUSD.textContent = "$0.00";
        impuestosARS.textContent = "$0.00";
        if (calculationSummary) {
            calculationSummary.textContent = "Estimación: 50% de la base imponible + tasa fija (si aplica)";
        }
        if (franquiciaStatus) {
            const usarFranquicia = toggleFranquicia ? toggleFranquicia.checked : true;
            updateFranquiciaStatus(usarFranquicia);
        }
        animateNumber(impuestosUSD);
        animateNumber(impuestosARS);
    });
    
    
    // Initial calculation (in case there are pre-filled values)
    calcular();
    
    // Confirm calculator is connected
});


// ============================================
// REGISTRATION MODAL (Index page only)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const registerModal = document.getElementById('registerModal');
    const registerModalClose = document.getElementById('registerModalClose');
    const registerModalBackdrop = registerModal?.querySelector('.register-modal-backdrop');
    
    // Only show on index.html
    const isHomePage = window.location.pathname.endsWith('index.html') || 
                       window.location.pathname.endsWith('/') || 
                       window.location.pathname === '' ||
                       !window.location.pathname.includes('.html');
    
    if (!registerModal || !isHomePage) return;
    
    // Show modal after page is fully loaded (optimized to prevent lag)
    // Usar delays más largos y CSS para animaciones suaves
    const showModal = () => {
        // Usar requestIdleCallback si está disponible para mejor rendimiento, sino requestAnimationFrame
        const show = () => {
            registerModal.classList.add('active');
            // Solo bloquear scroll en desktop
            if (window.innerWidth > 640) {
                document.body.style.overflow = 'hidden';
            }
        };
        
        if ('requestIdleCallback' in window) {
            requestIdleCallback(show, { timeout: 3000 });
        } else {
            setTimeout(() => requestAnimationFrame(show), 3000);
        }
    };
    
    // Esperar a que la página esté completamente cargada y el contenido principal renderizado
    if (document.readyState === 'complete') {
        setTimeout(showModal, 2000);
    } else {
        window.addEventListener('load', () => {
            setTimeout(showModal, 2000);
        }, { once: true });
    }
    
    // Close modal function
    const closeModal = () => {
        registerModal.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    // Close button
    if (registerModalClose) {
        registerModalClose.addEventListener('click', closeModal);
    }
    
    // Close on backdrop click
    if (registerModalBackdrop) {
        registerModalBackdrop.addEventListener('click', closeModal);
    }
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && registerModal.classList.contains('active')) {
            closeModal();
        }
    });
});

// ============================================
// WHEEL WIDGET (Ruleta Flotante Siempre Visible)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const wheelWidget = document.getElementById('wheelWidget');
    const wheelToggleBtn = document.getElementById('wheelToggleBtn');
    const wheelPopup = document.getElementById('wheelPopup');
    const wheelPopupClose = document.getElementById('wheelPopupClose');
    const wheelSpinCenter = document.getElementById('wheelSpinCenter');
    const wheelMain = document.getElementById('wheelMain');
    const prizeModal = document.getElementById('prizeModal');
    const prizeCloseBtn = document.getElementById('prizeCloseBtn');
    const prizeText = document.getElementById('prizeText');
    
    // Solo mostrar en la página principal
    const isHomePage = window.location.pathname.endsWith('index.html') || 
                       window.location.pathname.endsWith('/') || 
                       window.location.pathname === '' ||
                       !window.location.pathname.includes('.html');
    
    if (!wheelWidget || !isHomePage) return;
    
    let isSpinning = false;
    let isPopupOpen = false;
    
    // Verificar si ya giró hoy
    const lastSpinDate = localStorage.getItem('lastWheelSpin');
    const today = new Date().toDateString();
    const hasSpunToday = lastSpinDate === today;
    
    // Si ya giró hoy, cambiar el texto del botón
    if (hasSpunToday && wheelToggleBtn) {
        const toggleText = wheelToggleBtn.querySelector('.wheel-toggle-text');
        if (toggleText) {
            toggleText.textContent = 'Ya jugaste hoy';
        }
        wheelToggleBtn.style.opacity = '0.7';
    }
    
    // Toggle del popup
    const togglePopup = () => {
        if (hasSpunToday && !isPopupOpen) {
            // Si ya giró hoy, mostrar mensaje
            return;
        }
        
        isPopupOpen = !isPopupOpen;
        if (wheelPopup) {
            wheelPopup.classList.toggle('active', isPopupOpen);
        }
    };
    
    if (wheelToggleBtn) {
        wheelToggleBtn.addEventListener('click', togglePopup);
    }
    
    // Cerrar popup
    const closePopup = () => {
        isPopupOpen = false;
        if (wheelPopup) {
            wheelPopup.classList.remove('active');
        }
    };
    
    if (wheelPopupClose) {
        wheelPopupClose.addEventListener('click', (e) => {
            e.stopPropagation();
            closePopup();
        });
    }
    
    // Cerrar modal de premio
    const closePrizeModal = () => {
        if (prizeModal) {
            prizeModal.classList.remove('active');
        }
    };
    
    if (prizeCloseBtn) {
        prizeCloseBtn.addEventListener('click', closePrizeModal);
    }
    
    if (prizeModal) {
        prizeModal.querySelector('.prize-modal-backdrop')?.addEventListener('click', closePrizeModal);
    }
    
    // Función para girar la ruleta
    const spinWheel = () => {
        if (isSpinning || hasSpunToday) return;
        
        isSpinning = true;
        if (wheelSpinCenter) {
            wheelSpinCenter.disabled = true;
        }
        if (wheelMain) {
            wheelMain.classList.add('spinning');
        }
        
        // Siempre termina en "Envío Gratis" (posición 0, 90, 180, o 270 grados)
        // Usamos posición 0 (primer segmento)
        const targetAngle = 0;
        const spins = 5; // Vueltas completas
        const finalAngle = spins * 360 + (360 - targetAngle);
        
        if (wheelMain) {
            wheelMain.style.transform = `rotate(${finalAngle}deg)`;
        }
        
        // Después de la animación (3 segundos)
        setTimeout(() => {
            isSpinning = false;
            if (wheelMain) {
                wheelMain.classList.remove('spinning');
            }
            
            // Guardar que ya giró hoy
            localStorage.setItem('lastWheelSpin', today);
            
            // Mostrar modal de premio
            if (prizeText) {
                prizeText.textContent = 'Envío Gratis';
            }
            closePopup();
            
            setTimeout(() => {
                if (prizeModal) {
                    prizeModal.classList.add('active');
                }
                
                // Actualizar botón
                if (wheelToggleBtn) {
                    const toggleText = wheelToggleBtn.querySelector('.wheel-toggle-text');
                    if (toggleText) {
                        toggleText.textContent = 'Ya jugaste hoy';
                    }
                    wheelToggleBtn.style.opacity = '0.7';
                }
            }, 300);
        }, 3000);
    };
    
    if (wheelSpinCenter) {
        wheelSpinCenter.addEventListener('click', spinWheel);
    }
    
    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (isPopupOpen) {
                closePopup();
            }
            if (prizeModal && prizeModal.classList.contains('active')) {
                closePrizeModal();
            }
        }
    });
});

// ============================================
// COMO COMPRAR - STEP ACCORDIONS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const stepHeaders = document.querySelectorAll('.step-header');
    
    stepHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const stepNumber = header.getAttribute('data-step');
            const content = document.getElementById(`step-content-${stepNumber}`);
            
            if (!content) return;
            
            // Toggle active state
            const isActive = header.classList.contains('active');
            
            // Toggle current step
            if (isActive) {
                header.classList.remove('active');
                content.classList.remove('expanded');
            } else {
                header.classList.add('active');
                content.classList.add('expanded');
            }
        });
    });
    
    // Open first step by default
    const firstStep = document.querySelector('.step-header[data-step="1"]');
    if (firstStep) {
        const firstContent = document.getElementById('step-content-1');
        if (firstContent) {
            firstStep.classList.add('active');
            firstContent.classList.add('expanded');
        }
    }
});

// ============================================
// LOAD PRODUCTS FROM SUPABASE
// ============================================

// ===== SUPABASE CONFIG =====
const SUPABASE_URL = "https://szohpkcgubckxoauspmr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6b2hwa2NndWJja3hvYXVzcG1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NTMwNTksImV4cCI6MjA4NTAyOTA1OX0.bSbr61juTNd0Y4LchHjT2YbvCl-uau2GN83V-2HhkWE";
const SUPABASE_REST_URL = `${SUPABASE_URL}/rest/v1`;


// Helper para escapar HTML
function escapeHtml(str) {
    return String(str ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// Helper para formatear precios
function formatPrice(price) {
    if (price === null || price === undefined || isNaN(price)) {
        return '0.00';
    }
    return parseFloat(price).toFixed(2);
}

// Convertir link base (weidian/1688/taobao) a link del agente seleccionado
// Conversión directa sin usar JadeShip (más rápido y confiable)
async function convertToAgentLink(baseUrl, agent) {
    if (!baseUrl || !baseUrl.trim() || !agent) {
        return '';
    }
    
    let url = baseUrl.trim();
    
    // Si el baseUrl es un link de agente, extraer el link base real
    if (url.includes('kakobuy.com') || url.includes('hubbuycn.com') || url.includes('mulebuy.com') || url.includes('cssbuy.com') || url.includes('oopbuy.com')) {
        const extractedBase = extractBaseUrlFromAgentLink(url);
        if (extractedBase && (extractedBase.includes('weidian.com') || extractedBase.includes('1688.com') || extractedBase.includes('taobao.com'))) {
            url = extractedBase;
        } else {
            return '';
        }
    }
    
    // Verificar que sea un link base válido
    if (!url.includes('weidian.com') && !url.includes('1688.com') && !url.includes('taobao.com')) {
        return '';
    }
    
    // Extraer información del link base
    let productId = '';
    let platform = '';
    
    // Detectar plataforma y extraer ID
    // Weidian: https://weidian.com/item.html?itemID=7616832901
    const weidianMatch = url.match(/weidian\.com\/item\.html\?itemID=(\d+)/i);
    if (weidianMatch) {
        productId = weidianMatch[1];
        platform = 'WEIDIAN';
    }
    
    // 1688: https://detail.1688.com/offer/729540245968.html
    const ali1688Match = url.match(/1688\.com\/offer\/(\d+)/i);
    if (ali1688Match) {
        productId = ali1688Match[1];
        platform = 'ALI_1688';
    }
    
    // Taobao: https://item.taobao.com/item.htm?id=123456789
    const taobaoMatch = url.match(/taobao\.com\/item\.htm\?id=(\d+)/i);
    if (taobaoMatch) {
        productId = taobaoMatch[1];
        platform = 'TAOBAO';
    }
    
    if (!productId) {
        return '';
    }
    
    // Convertir según el agente
    switch (agent) {
        case 'KakoBuy':
        case 'Kakobuy':
        case 'kakobuy':
            // https://www.kakobuy.com/item/details?url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D7616832901&affcode=allreps
            const encodedUrl = encodeURIComponent(url);
            return `https://www.kakobuy.com/item/details?url=${encodedUrl}&affcode=allreps`;
            
        case 'CssBuy':
        case 'CSSBuy':
        case 'cssbuy':
            // https://www.cssbuy.com/item-698667801968.html
            // Formato: item-{productId}.html
            // Funciona con Weidian, 1688 y Taobao
            if (productId) {
                return `https://www.cssbuy.com/item-${productId}.html`;
            }
            // Si no se puede extraer productId, retornar link original
            return url;
            
        case 'Oopbuy':
        case 'OOPBuy':
        case 'oopbuy':
            // https://oopbuy.com/product/weidian/7616832901
            const platformLower = platform.toLowerCase();
            // Mapear plataformas a formato de Oopbuy
            let oopbuyPlatform = platformLower;
            if (platform === 'ALI_1688') {
                oopbuyPlatform = '1688';
            } else if (platform === 'TAOBAO') {
                oopbuyPlatform = 'taobao';
            }
            return `https://oopbuy.com/product/${oopbuyPlatform}/${productId}`;
            
        case 'Hubbuy':
        case 'hubbuy':
            // https://www.hubbuycn.com/product/item?url=https://weidian.com/item.html?itemID=7616832901=product_link&invitation_code=0O40qL00
            // Nota: El formato tiene "=product_link" después del URL base (codificado)
            const encodedHubbuyUrl = encodeURIComponent(url);
            return `https://www.hubbuycn.com/product/item?url=${encodedHubbuyUrl}=product_link&invitation_code=0O40qL00`;
            
        case 'MuleBuy':
        case 'Mulebuy':
        case 'mulebuy':
            // https://mulebuy.com/product?id=7616832901&platform=WEIDIAN&ref=200118463
            return `https://mulebuy.com/product?id=${productId}&platform=${platform}&ref=200118463`;
            
        default:
            // Si no coincide con ningún agente, retornar link original
            return url;
    }
}

// Normalizar URLs de Imgur al formato directo de imagen
function normalizeImgurUrl(url) {
    if (!url || typeof url !== 'string') {
        return url;
    }
    
    const originalUrl = url.trim();
    
    // Si no es Imgur, retornar tal cual
    if (!originalUrl.includes('imgur.com')) {
        return originalUrl;
    }
    
    // Si ya es formato directo (i.imgur.com), asegurar extensión
    if (originalUrl.includes('i.imgur.com')) {
        if (!originalUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            return originalUrl + '.jpg';
        }
        return originalUrl;
    }
    
    // Convertir imgur.com/XXXXX a i.imgur.com/XXXXX.jpg
    // Maneja: imgur.com/XXXXX, imgur.com/a/XXXXX, imgur.com/gallery/XXXXX
    const imgurMatch = originalUrl.match(/imgur\.com\/(?:a\/|gallery\/)?([a-zA-Z0-9]+)(?:\.[a-z]+)?/);
    if (imgurMatch) {
        return `https://i.imgur.com/${imgurMatch[1]}.jpg`;
    }
    
    return originalUrl;
}

// Función para mapear categorías basándose en el nombre y descripción del producto
function mapProductCategory(product) {
    const nombre = (product.nombre || '').toLowerCase();
    const categoria = (product.categoria || '').toLowerCase();
    const descripcion = (product.descripcion || '').toLowerCase();
    const textoCompleto = `${nombre} ${categoria} ${descripcion}`;
    
    // Priorizar "Conjuntos" primero
    if (textoCompleto.includes('conjunto') || textoCompleto.includes('set')) {
        return 'conjuntos';
    }
    
    // Calzado - Solo productos que específicamente digan zapatillas
    // Priorizar "zapatilla" y "zapatillas" como palabras principales
    const tieneZapatilla = textoCompleto.includes('zapatilla') || textoCompleto.includes('zapatillas');
    
    // Palabras que indican que NO es calzado (falsos positivos)
    const palabrasExcluidas = [
        'box', 'boxes', 'caja', 'cajas', 'storage', 'almacenamiento',
        'organizer', 'organizador', 'rack', 'estante', 'display',
        'case', 'estuche', 'bag', 'bolso', 'mochila', 'backpack',
        'cleaner', 'limpiador', 'spray', 'brush', 'cepillo',
        'lace', 'cordón', 'cordones', 'insole', 'plantilla',
        'sock', 'calcetín', 'calcetines', 'socks', 'bracelet',
        'joyería', 'joyeria', 'jewelry', 'remera', 'remeras',
        'tee', 'shirt', 'camiseta', 'short', 'shorts', 'pantalon',
        'pantalones', 'pants', 'sweatpants', 'decoración', 'decoracion',
        'decoration'
    ];
    
    // Verificar si tiene palabras excluidas
    const tieneExcluidas = palabrasExcluidas.some(palabra => textoCompleto.includes(palabra));
    
    // Si tiene "zapatilla" o "zapatillas" y NO tiene palabras excluidas
    if (tieneZapatilla && !tieneExcluidas) {
        return 'calzado';
    }
    
    // También aceptar "sneaker" o "sneakers" si NO tiene palabras excluidas
    if ((textoCompleto.includes('sneaker') || textoCompleto.includes('sneakers')) && !tieneExcluidas) {
        return 'calzado';
    }
    
    // Ropa superior
    if (textoCompleto.includes('campera') || textoCompleto.includes('buzo') || 
        textoCompleto.includes('remera') || textoCompleto.includes('camiseta') ||
        textoCompleto.includes('camisa') || textoCompleto.includes('suéter') ||
        textoCompleto.includes('hoodie') || textoCompleto.includes('sweater') ||
        textoCompleto.includes('jacket') || textoCompleto.includes('shirt')) {
        return 'ropa-superior';
    }
    
    // Ropa inferior
    if (textoCompleto.includes('pantalon') || textoCompleto.includes('jean') ||
        textoCompleto.includes('jogger') || textoCompleto.includes('short') ||
        textoCompleto.includes('pants') || textoCompleto.includes('trouser')) {
        return 'ropa-inferior';
    }
    
    // Por defecto, accesorios
    return 'accesorios';
}

// Renderizar productos en el grid (optimizado con DocumentFragment)
function renderProducts(products) {
    const grid = document.querySelector('.products-grid') || document.getElementById('products-grid');
    if (!grid) return;

    // Usar DocumentFragment para mejor rendimiento (batch DOM updates)
    const fragment = document.createDocumentFragment();

    if (!products.length) {
        grid.innerHTML = `<p style="color:#fff; opacity:.8;">No hay productos todavía.</p>`;
        return;
    }

    // Pre-calcular valores comunes fuera del loop
    const placeholderImg = 'https://via.placeholder.com/300x300?text=Sin+imagen';
    
    for (const p of products) {
        // Normalizar URL de imagen de Imgur si es necesario
        let imagenUrl = p.imagen_url || '';
        if (imagenUrl) {
            imagenUrl = normalizeImgurUrl(imagenUrl);
        } else {
            imagenUrl = placeholderImg;
        }

        const card = document.createElement("article");
        card.className = "product-card slide-up";
        
        // Mapear categoría usando la función inteligente
        const mappedCategory = mapProductCategory(p);
        card.setAttribute('data-category', mappedCategory);
        card.setAttribute('data-quality', (p.calidad || '').toLowerCase());

        // Solo usar source_url (link base) - ya no tenemos links JSONB
        card.setAttribute('data-base-url', p.source_url || '');

        // Usar innerHTML solo una vez por card (más eficiente)
        const precioFormateado = formatPrice(p.precio_cny || 0);
        const nombreEscapado = escapeHtml(p.nombre);
        const categoriaEscapada = escapeHtml(p.categoria || '');
        const calidadBadge = p.calidad ? `<span class="badge-quality product-quality">${escapeHtml(p.calidad)}</span>` : '';

        card.innerHTML = `
            <div class="product-image">
                <img src="${imagenUrl}" alt="${nombreEscapado}" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='${placeholderImg}';">
                ${calidadBadge}
            </div>

            <div class="product-info">
                <h3 class="product-name">${nombreEscapado}</h3>
                <p class="product-meta">${categoriaEscapada}</p>
                <div class="product-price">
                    <span class="price-cny" data-price-cny="${p.precio_cny || 0}">Desde ${precioFormateado} CNY</span>
                </div>
                <div class="product-actions">
                    <a class="btn btn-primary" href="javascript:void(0);" target="_blank" rel="noopener noreferrer" data-agent-link>Ver producto</a>
                </div>
            </div>
        `;

        fragment.appendChild(card);
    }
    
    // Limpiar grid y agregar todos los elementos de una vez (mejor rendimiento)
    grid.innerHTML = "";
    grid.appendChild(fragment);
    
    // Re-inicializar animaciones de scroll para los nuevos productos
    initScrollAnimations();
    
    // Actualizar links y precios después de renderizar (usar requestAnimationFrame para mejor rendimiento)
    requestAnimationFrame(() => {
        updateProductLinks();
        const savedCurrency = localStorage.getItem('selectedCurrency') || 'CNY';
        updateProductPrices(savedCurrency);
    });
}

// Cargar productos destacados aleatorios desde Supabase
async function loadFeaturedProducts() {
    const carouselTrack = document.querySelector('#productCarousel .carousel-track');
    if (!carouselTrack) return;
    
    try {
        const headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json"
        };
        
        // Obtener 50 productos aleatorios
        const query = `${SUPABASE_REST_URL}/products_clean?select=*&activo=eq.true&limit=50&order=created_at.desc`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const res = await fetch(query, {
            headers: headers,
            signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) {
            const txt = await res.text();
            throw new Error(`Supabase error ${res.status}: ${txt}`);
        }
        
        let products = await res.json();
        
        if (products.length === 0) {
            return;
        }
        
        // Seleccionar 5 productos aleatorios
        const shuffled = products.sort(() => 0.5 - Math.random());
        const selectedProducts = shuffled.slice(0, 5);
        
        // Limpiar el carousel
        carouselTrack.innerHTML = '';
        
        // Renderizar productos destacados
        selectedProducts.forEach((product) => {
            let image = product.imagen_url || '';
            if (image) {
                image = normalizeImgurUrl(image);
            } else {
                image = 'https://via.placeholder.com/300x300?text=Sin+imagen';
            }
            
            const carouselItem = document.createElement('div');
            carouselItem.className = 'carousel-item';
            
            carouselItem.innerHTML = `
                <a href="productos.html" class="carousel-product-card">
                    <div class="carousel-product-image">
                        <img src="${image}" alt="${escapeHtml(product.nombre)}" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='https://via.placeholder.com/300x300?text=Sin+imagen';" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <h3 class="carousel-product-name">${escapeHtml(product.nombre)}</h3>
                </a>
            `;
            
            carouselTrack.appendChild(carouselItem);
        });
        
        // Duplicar items para loop infinito perfecto sin cortes (optimizado con DocumentFragment)
        const originalItems = Array.from(carouselTrack.querySelectorAll('.carousel-item'));
        const originalCount = originalItems.length;
        
        if (originalCount === 0) return;
        
        // Usar DocumentFragment para mejor rendimiento al duplicar
        const fragment = document.createDocumentFragment();
        
        // Duplicar los items originales 6 veces para tener 7 sets completos
        for (let i = 0; i < 6; i++) {
            originalItems.forEach(item => {
                const clone = item.cloneNode(true);
                const cloneImg = clone.querySelector('img');
                if (cloneImg) {
                    const originalImg = item.querySelector('img');
                    if (originalImg && originalImg.src) {
                        cloneImg.src = originalImg.src;
                    }
                    cloneImg.loading = 'lazy';
                    cloneImg.decoding = 'async';
                    cloneImg.style.width = '100%';
                    cloneImg.style.height = '100%';
                    cloneImg.style.objectFit = 'cover';
                }
                fragment.appendChild(clone);
            });
        }
        
        // Agregar todos los clones de una vez (mejor rendimiento)
        carouselTrack.appendChild(fragment);
        
        // Asegurar que la animación esté activa y configurada correctamente
        carouselTrack.style.animation = 'scroll 60s linear infinite';
        carouselTrack.style.willChange = 'transform';
        carouselTrack.style.minWidth = 'max-content';
        carouselTrack.style.width = 'max-content';
        carouselTrack.style.flexWrap = 'nowrap';
        
        // Usar requestAnimationFrame para el reflow en lugar de acceso directo
        requestAnimationFrame(() => {
            void carouselTrack.offsetHeight;
        });
        
        
    } catch (error) {
        // Error silencioso - no mostrar en consola para mejor rendimiento
    }
}

// Estado de paginación global
let currentPage = 1;
let totalPages = 1;
let currentFilters = {};
const PRODUCTS_PER_PAGE = 36;

// Traer productos desde Supabase (con paginación)
async function loadProductsFromAPI(page = 1, pageSize = 36, filters = {}) {
    const headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json"
    };

    // Construir query de Supabase
    let query = `${SUPABASE_REST_URL}/products_clean?select=*&activo=eq.true`;
    
    if (filters.quality) {
        query += `&calidad=eq.${encodeURIComponent(filters.quality)}`;
    }
    
    if (filters.search) {
        query += `&nombre=ilike.%25${encodeURIComponent(filters.search)}%25`;
    }
    
    // Filtro de marca: buscar en el nombre del producto (más flexible)
    if (filters.brand) {
        // Normalizar el nombre de la marca para búsqueda flexible
        let brandNormalized = filters.brand.toLowerCase().trim();
        
        // Mapeo de data-brand a términos de búsqueda en los productos
        const brandSearchMap = {
            'acne-studios': 'acne',
            'saint-laurent': 'saint laurent',
            'enfants-riches-deprimes': 'enfants riches',
            'lostkidsclub2000': 'lost kids',
            'martine-rose': 'martine rose',
            'sin-marca': null, // Sin marca no debería filtrar
            'alo': 'alo',
            'balenciaga': 'balenciaga',
            'burberry': 'burberry',
            'chai': 'chai',
            'gymshark': 'gymshark',
            'jordan': 'jordan',
            'longchamp': 'longchamp',
            'mowalola': 'mowalola',
            'nike': 'nike',
            'palace': 'palace',
            'supreme': 'supreme',
            'synaworld': 'synaworld',
            'valley': 'valley'
        };
        
        // Si existe en el mapa, usar el término de búsqueda mapeado
        if (brandSearchMap.hasOwnProperty(brandNormalized)) {
            if (brandSearchMap[brandNormalized] === null) {
                // Sin marca - no aplicar filtro, continuar sin agregar filtro de marca
            } else {
                brandNormalized = brandSearchMap[brandNormalized];
                // Buscar la marca en el nombre del producto (case insensitive, en cualquier parte)
                query += `&nombre=ilike.%25${encodeURIComponent(brandNormalized)}%25`;
            }
        } else {
            // Si no está en el mapa, usar el valor directamente
            // Buscar en cualquier parte del nombre
            query += `&nombre=ilike.%25${encodeURIComponent(brandNormalized)}%25`;
        }
    }
    
    // Aplicar ordenamiento
    if (filters.sort) {
        switch(filters.sort) {
            case 'precio-asc':
                // Precio: menor a mayor
                query += `&order=precio_cny.asc`;
                break;
            case 'precio-desc':
                // Precio: mayor a menor
                query += `&order=precio_cny.desc`;
                break;
            case 'nombre-asc':
                // Nombre: A-Z
                query += `&order=nombre.asc`;
                break;
            case 'nombre-desc':
                // Nombre: Z-A
                query += `&order=nombre.desc`;
                break;
            case 'recientes':
            default:
                // Más recientes (por defecto)
                query += `&order=created_at.desc`;
                break;
        }
    } else {
        // Ordenar por created_at descendente por defecto
        query += `&order=created_at.desc`;
    }
    
    // Si hay filtro de categoría, necesitamos traer más productos para filtrar en el cliente
    // porque el filtro de categoría se hace en el cliente usando mapProductCategory
    const needsClientFiltering = filters.category && filters.category !== 'all';
    
    if (needsClientFiltering) {
        // Traer más productos para poder filtrar correctamente (hasta 1000 productos)
        // Luego filtraremos y paginaremos en el cliente
        headers['Range'] = `0-999`;
        headers['Prefer'] = 'count=exact';
    } else {
        // Paginación normal en Supabase cuando no hay filtro de categoría
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        headers['Range'] = `${from}-${to}`;
        headers['Prefer'] = 'count=exact';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Reducido a 8s para mejor UX

    try {
        const res = await fetch(query, {
            headers: headers,
            signal: controller.signal,
            // Agregar cache para mejorar rendimiento
            cache: 'default'
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            const txt = await res.text();
            throw new Error(`Supabase error ${res.status}: ${txt}`);
        }

        let products = await res.json();
        
        // Aplicar filtro de categoría en el cliente usando el mapeo inteligente
        if (filters.category && filters.category !== 'all' && products && products.length > 0) {
            // El filtro ya viene en el formato correcto ('calzado', 'ropa-superior', etc.)
            // desde buildFiltersFromUI que ahora guarda directamente el data-category
            const filterCategoryNormalized = filters.category.toLowerCase();
            
            products = products.filter(product => {
                const mappedCategory = mapProductCategory(product);
                return mappedCategory === filterCategoryNormalized;
            });
        }
        
        // Si el ordenamiento no funciona desde Supabase, ordenar en el cliente como fallback
        // Ordenar ANTES de paginar
        if (filters.sort && products && products.length > 0) {
            switch(filters.sort) {
                case 'precio-asc':
                    products.sort((a, b) => (parseFloat(a.precio_cny || 0) - parseFloat(b.precio_cny || 0)));
                    break;
                case 'precio-desc':
                    products.sort((a, b) => (parseFloat(b.precio_cny || 0) - parseFloat(a.precio_cny || 0)));
                    break;
                case 'nombre-asc':
                    products.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
                    break;
                case 'nombre-desc':
                    products.sort((a, b) => (b.nombre || '').localeCompare(a.nombre || ''));
                    break;
            }
        }
        
        // Recalcular totalCount después de filtrar por categoría
        let totalCount = parseInt(res.headers.get('content-range')?.split('/')[1] || '0');
        
        if (needsClientFiltering) {
            // Si filtramos por categoría en el cliente, usar el count de productos filtrados
            totalCount = products.length;
            
            // Aplicar paginación DESPUÉS de filtrar y ordenar (paginación en el cliente)
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedProducts = products.slice(startIndex, endIndex);
            
            // Calcular totalPages después de aplicar todos los filtros
            const totalPages = Math.ceil(totalCount / pageSize);
            
            return {
                products: paginatedProducts || [],
                totalCount: totalCount,
                totalPages: totalPages || 1,
                currentPage: page
            };
        } else {
            // Sin filtro de categoría: la paginación ya se hizo en Supabase
            // Calcular totalPages usando el totalCount de Supabase
            const totalPages = Math.ceil(totalCount / pageSize);
            
            return {
                products: products || [],
                totalCount: totalCount,
                totalPages: totalPages || 1,
                currentPage: page
            };
        }
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout: No se pudo cargar los productos');
        }
        throw error;
    }
}

// Asegurar que la función esté disponible globalmente
if (typeof window !== 'undefined') {
    window.loadProductsFromAPI = loadProductsFromAPI;
}

// Cargar productos con paginación
async function loadProductsPage(page = 1, filters = {}) {
    const grid = document.querySelector('.products-grid') || document.getElementById('products-grid');
    if (!grid) return;
    
    if (typeof loadProductsFromAPI !== 'function') {
        grid.innerHTML = '<p style="color: #fff; text-align: center; padding: 2rem;">Error: función no disponible. Recarga la página.</p>';
        return;
    }
    
    try {
        // Mostrar estado de carga (solo si el grid está vacío o tiene contenido previo)
        if (!grid.querySelector('.product-card')) {
            grid.innerHTML = '<p style="color: #fff; text-align: center; padding: 2rem;">Cargando productos...</p>';
        }
        
        const result = await loadProductsFromAPI(page, PRODUCTS_PER_PAGE, filters);
        currentPage = result.currentPage;
        totalPages = result.totalPages;
        currentFilters = filters;
        
        // Usar requestAnimationFrame para renderizado suave
        requestAnimationFrame(() => {
            renderProducts(result.products);
            updatePaginationControls();
            
            // Actualizar precios según la configuración guardada
            const savedCurrency = localStorage.getItem('selectedCurrency') || 'CNY';
            updateProductPrices(savedCurrency);
        });
    } catch (e) {
        // Mostrar error pero permitir que la página continúe funcionando
        grid.innerHTML = `
            <div style="color:#fff; text-align:center; opacity:.9; padding:40px;">
                <div style="font-size:22px; margin-bottom:10px;">Error al cargar productos</div>
                <div style="opacity:.7; margin-bottom:20px;">Abrí consola (F12) para ver el detalle</div>
                <button onclick="location.reload()" style="padding:10px 20px; background:#0066ff; color:#fff; border:none; border-radius:5px; cursor:pointer;">Recargar página</button>
            </div>`;
    }
}

// Actualizar controles de paginación
function updatePaginationControls() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Botón Anterior
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.textContent = '← Anterior';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            loadProductsPage(currentPage - 1, currentFilters);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    paginationContainer.appendChild(prevBtn);
    
    // Números de página
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
        const firstBtn = document.createElement('button');
        firstBtn.className = 'pagination-btn';
        firstBtn.textContent = '1';
        firstBtn.addEventListener('click', () => {
            loadProductsPage(1, currentFilters);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        paginationContainer.appendChild(firstBtn);
        
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i.toString();
        pageBtn.addEventListener('click', () => {
            loadProductsPage(i, currentFilters);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        paginationContainer.appendChild(pageBtn);
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
        
        const lastBtn = document.createElement('button');
        lastBtn.className = 'pagination-btn';
        lastBtn.textContent = totalPages.toString();
        lastBtn.addEventListener('click', () => {
            loadProductsPage(totalPages, currentFilters);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        paginationContainer.appendChild(lastBtn);
    }
    
    // Botón Siguiente
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.textContent = 'Siguiente →';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            loadProductsPage(currentPage + 1, currentFilters);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    paginationContainer.appendChild(nextBtn);
}

// Cargar productos cuando se carga la página de productos
async function initProductLoading() {
    // Verificar si estamos en la página de productos
    const grid = document.querySelector('.products-grid') || document.getElementById('products-grid');
    const isProductsPage = window.location.pathname.includes('productos.html') || 
                          window.location.pathname.endsWith('productos.html') ||
                          window.location.href.includes('productos.html') ||
                          grid;
    
    if (isProductsPage) {
        // Obtener página desde URL o usar 1 por defecto
        const urlParams = new URLSearchParams(window.location.search);
        const pageFromUrl = parseInt(urlParams.get('page')) || 1;
        
        await loadProductsPage(pageFromUrl, {});
    }
    
    // Verificar si estamos en la página de inicio para cargar productos destacados
    const isHomePage = window.location.pathname.includes('index.html') || 
                       window.location.pathname.endsWith('/') || 
                       window.location.pathname === '' ||
                       (!window.location.pathname.includes('.html') && !isProductsPage);
    
    if (isHomePage && document.querySelector('#productCarousel')) {
        loadFeaturedProducts();
    }
}

// Cargar productos cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductLoading);
} else {
    initProductLoading();
}

