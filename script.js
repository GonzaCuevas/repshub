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
// GLOBAL STATE VARIABLES (must be declared first)
// ============================================
let currentPage = 1;
let totalPages = 1;
let currentFilters = {};

// ============================================
// DOM ELEMENTS (cached for performance)
// ============================================

// DOM Elements - Initialize after DOM is ready
let header, mobileMenuToggle, nav, navList, filterButtons;

function initDOMElements() {
    header = document.getElementById('header');
    mobileMenuToggle = document.getElementById('mobileMenuToggle');
    nav = document.getElementById('nav');
    navList = document.querySelector('.nav-list');
    filterButtons = document.querySelectorAll('.filter-btn');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDOMElements);
} else {
    initDOMElements();
}

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
let rafId = null;

function updateHeader() {
    const currentScroll = window.pageYOffset || window.scrollY;
    
    // Hide/show header based on scroll direction (Infiner style)
    if (currentScroll < lastScroll || currentScroll < 50) {
        // Scrolling up or at top - show header
        if (header) {
            header.style.transform = 'translate3d(0, 0, 0)';
            header.style.opacity = '1';
        }
    } else {
        // Scrolling down - hide header
        if (header && currentScroll > 50) {
            header.style.transform = 'translate3d(0, -100%, 0)';
            header.style.opacity = '0';
        }
    }
    
    // Add 'scrolled' class when scrolling down
    if (currentScroll > 50) {
        header?.classList.add('scrolled');
    } else {
        header?.classList.remove('scrolled');
    }
    
    // Update header height CSS variable for mobile menu positioning (solo cuando sea necesario)
    if (window.innerWidth <= 767 && header && isMenuOpen) {
        const headerHeight = header.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    }
    
    lastScroll = currentScroll;
    ticking = false;
    rafId = null;
}

// Optimizado con requestAnimationFrame y passive listener
function handleScroll() {
    if (!ticking) {
        rafId = requestAnimationFrame(updateHeader);
        ticking = true;
    }
}

window.addEventListener('scroll', handleScroll, { passive: true });

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (rafId) {
        cancelAnimationFrame(rafId);
    }
    window.removeEventListener('scroll', handleScroll);
});

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
    
    // Update on scroll - mantener el menú visible y actualizar posición (optimizado)
    const handleMenuScroll = throttle(() => {
        if (window.innerWidth <= 767 && isMenuOpen && navList?.classList.contains('active')) {
            requestAnimationFrame(updateMobileMenuPosition);
        }
    }, 100);
    
    window.addEventListener('scroll', handleMenuScroll, { passive: true });
    
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

if (filterButtons && filterButtons.length > 0) {
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

// Función para inicializar filtros modernos con badges
async function initModernFilters() {
    const container = document.getElementById('categoriesContainerModern');
    if (!container) return;
    
    try {
        // Obtener estadísticas de categorías desde la API
        const headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json"
        };
        
        const query = `${SUPABASE_REST_URL}/products_clean?select=categoria&activo=eq.true`;
        const res = await secureSupabaseFetch(query, { headers });
        
        if (!res.ok) return;
        
        const products = await res.json();
        
        // Contar productos por categoría
        const categoryCounts = {};
        const categoryMap = {
            'all': 'Todos los Productos',
            'calzado': 'Zapatillas',
            'ropa-superior': 'Remeras',
            'ropa-inferior': 'Pantalones',
            'accesorios': 'Accesorios',
            'conjuntos': 'Conjuntos'
        };
        
        let totalCount = 0;
        products.forEach(product => {
            totalCount++;
            const mappedCategory = mapProductCategory(product);
            if (mappedCategory && mappedCategory !== 'all') {
                categoryCounts[mappedCategory] = (categoryCounts[mappedCategory] || 0) + 1;
            }
        });
        
        // Crear botones de categorías
        container.innerHTML = '';
        
        // Botón "Todos los Productos"
        const allBtn = document.createElement('button');
        allBtn.className = 'category-btn-modern active';
        allBtn.setAttribute('data-category', 'all');
        allBtn.innerHTML = `Todos los Productos <span class="category-badge">${totalCount}</span>`;
        // Aplicar estilos inline para asegurar que se vea en rojo
        allBtn.style.background = '#dc2626';
        allBtn.style.border = 'none';
        allBtn.style.color = '#ffffff';
        allBtn.style.fontWeight = '600';
        allBtn.style.borderRadius = '20px';
        allBtn.style.padding = '0.5rem 1rem';
        container.appendChild(allBtn);
        
        // Botones de otras categorías
        const categories = ['calzado', 'ropa-superior', 'ropa-inferior', 'accesorios', 'conjuntos'];
        categories.forEach(cat => {
            const count = categoryCounts[cat] || 0;
            if (count > 0) {
                const btn = document.createElement('button');
                btn.className = 'category-btn-modern';
                btn.setAttribute('data-category', cat);
                btn.innerHTML = `${categoryMap[cat]} <span class="category-badge">${count}</span>`;
                // Asegurar estilos por defecto para botones inactivos
                btn.style.background = 'transparent';
                btn.style.border = 'none';
                btn.style.color = '';
                container.appendChild(btn);
            }
        });
        
        // Agregar event listeners a los nuevos botones
        const modernButtons = container.querySelectorAll('.category-btn-modern');
        modernButtons.forEach(button => {
            // Asegurar que el botón activo tenga los estilos correctos
            if (button.classList.contains('active')) {
                button.style.background = '#dc2626';
                button.style.border = 'none';
                button.style.color = '#ffffff';
                button.style.fontWeight = '600';
                button.style.borderRadius = '20px';
                button.style.padding = '0.5rem 1rem';
            } else {
                button.style.background = 'transparent';
                button.style.border = 'none';
            }
            
            button.addEventListener('click', () => {
                modernButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.style.background = '';
                    btn.style.borderColor = '';
                    btn.style.color = '';
                });
                button.classList.add('active');
                button.style.background = '#dc2626';
                button.style.borderColor = '#dc2626';
                button.style.color = '#ffffff';
                
                setTimeout(() => {
                    const filters = buildFiltersFromUI();
                    loadProductsPage(1, filters);
                }, 10);
            });
        });
        
    } catch (error) {
        console.error('Error loading category filters:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar filtros modernos si existe el contenedor
    if (document.getElementById('categoriesContainerModern')) {
        // Pequeño delay para asegurar que el DOM esté completamente listo
        setTimeout(() => {
            initModernFilters();
        }, 100);
    }
    
    // Category buttons with filtering (ahora recarga desde API) - mantener compatibilidad con botones antiguos
    const categoryButtons = document.querySelectorAll('.category-btn:not(.category-btn-modern)');
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
    
    // Buscar categoría activa en botones modernos o antiguos
    const activeCategory = document.querySelector('.category-btn-modern.active') || document.querySelector('.category-btn.active');
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

// Global variables for config options (used in other parts of the code)
let currencyOptions, agentOptions;

function initConfigPanel() {
    const configToggle = document.getElementById('configToggle');
    const configPanel = document.getElementById('configPanel');
    const configClose = document.getElementById('configClose');
    currencyOptions = document.querySelectorAll('#currencyOptions .config-option');
    agentOptions = document.querySelectorAll('#agentOptions .config-option');

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
}

// Initialize config panel when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConfigPanel);
} else {
    initConfigPanel();
}

// Theme Toggle Button - Initialize when DOM is ready
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // applyTheme ya guarda en localStorage automáticamente
            applyTheme(newTheme);
        });
    }
}

// Initialize theme toggle when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
} else {
    initThemeToggle();
}


// Function to apply theme (siempre guarda en localStorage)
function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
    // Siempre guardar el tema cuando se aplica para asegurar persistencia
    localStorage.setItem('selectedTheme', theme);
}

// Load saved theme immediately (before DOMContentLoaded to avoid flash)
(function() {
    // Cargar tema guardado, si no hay ninguno guardado, usar dark por defecto
    const savedTheme = localStorage.getItem('selectedTheme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
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
    
    // KakoBuy: https://www.kakobuy.com/item/details?url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D7616832901&affcode=gonza
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

// ============================================
// QC MODAL (Quality Check Viewer)
// ============================================

// Abrir modal QC con información del producto
function openQCModal(product) {
    const qcModal = document.getElementById('qcModal');
    const qcModalBody = document.getElementById('qcModalBody');
    
    if (!qcModal || !qcModalBody) return;
    
    // Obtener imágenes del producto
    // Por ahora usamos la imagen principal y simulamos múltiples imágenes
    const mainImage = product.imagen_url || product.imagen || '';
    const qcImages = product.qc_images || [];
    
    // Si no hay imágenes QC específicas, usar la imagen principal
    const images = qcImages.length > 0 ? qcImages : [mainImage].filter(Boolean);
    
    // Construir HTML del modal
    let modalHTML = '';
    
    if (images.length === 0) {
        modalHTML = `
            <div class="qc-no-images">
                <div class="qc-no-images-icon">📷</div>
                <p>No hay imágenes QC disponibles para este producto</p>
            </div>
        `;
    } else {
        // Imagen principal
        modalHTML = `
            <div class="qc-main-image-container">
                <img src="${images[0]}" alt="${escapeHtml(product.nombre || 'Producto')}" class="qc-main-image" id="qcMainImage" loading="lazy" decoding="async">
            </div>
            ${images.length > 1 ? `
                <div class="qc-gallery" id="qcGallery">
                    ${images.map((img, index) => `
                        <div class="qc-gallery-item ${index === 0 ? 'active' : ''}" data-image-index="${index}">
                            <img src="${img}" alt="QC ${index + 1}" loading="lazy">
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            <div class="qc-product-info">
                <h3 class="qc-product-name">${escapeHtml(product.nombre || 'Producto')}</h3>
                <div class="qc-product-meta">
                    ${product.categoria ? `
                        <div class="qc-meta-item">
                            <span class="qc-meta-label">Categoría</span>
                            <span class="qc-meta-value">${escapeHtml(product.categoria)}</span>
                        </div>
                    ` : ''}
                    ${product.calidad ? `
                        <div class="qc-meta-item">
                            <span class="qc-meta-label">Calidad</span>
                            <span class="qc-meta-value">${escapeHtml(product.calidad)}</span>
                        </div>
                    ` : ''}
                    ${product.precio_cny ? `
                        <div class="qc-meta-item">
                            <span class="qc-meta-label">Precio</span>
                            <span class="qc-meta-value">${formatPrice(product.precio_cny)} CNY</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    qcModalBody.innerHTML = modalHTML;
    
    // Agregar event listeners para la galería
    if (images.length > 1) {
        const galleryItems = qcModalBody.querySelectorAll('.qc-gallery-item');
        const mainImageEl = document.getElementById('qcMainImage');
        
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                // Remover clase active de todos los items
                galleryItems.forEach(i => i.classList.remove('active'));
                // Agregar clase active al item clickeado
                item.classList.add('active');
                // Cambiar imagen principal
                if (mainImageEl) {
                    mainImageEl.src = images[index];
                }
            });
        });
    }
    
    // Mostrar modal
    qcModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Cerrar modal QC
function closeQCModal() {
    const qcModal = document.getElementById('qcModal');
    if (qcModal) {
        qcModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Inicializar eventos del modal QC
function initQCModal() {
    const qcModal = document.getElementById('qcModal');
    const qcModalClose = document.getElementById('qcModalClose');
    const qcModalBackdrop = qcModal?.querySelector('.qc-modal-backdrop');
    
    if (!qcModal) return;
    
    // Cerrar con botón X
    if (qcModalClose) {
        qcModalClose.addEventListener('click', closeQCModal);
    }
    
    // Cerrar con backdrop
    if (qcModalBackdrop) {
        qcModalBackdrop.addEventListener('click', closeQCModal);
    }
    
    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && qcModal.classList.contains('active')) {
            closeQCModal();
        }
    });
    
    // Agregar event listeners a las imágenes de productos
    // Esto se ejecutará después de que se rendericen los productos
    const observer = new MutationObserver(() => {
        attachQCListeners();
    });
    
    const productsGrid = document.querySelector('.products-grid');
    if (productsGrid) {
        observer.observe(productsGrid, { childList: true, subtree: true });
        // Ejecutar una vez al inicio
        attachQCListeners();
    }
}

// Adjuntar listeners a las imágenes de productos para abrir QC
function attachQCListeners() {
    const productImages = document.querySelectorAll('.product-card .product-image');
    
    productImages.forEach((imageContainer) => {
        // Evitar agregar múltiples listeners
        if (imageContainer.dataset.qcListener === 'true') return;
        imageContainer.dataset.qcListener = 'true';
        
        imageContainer.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const card = imageContainer.closest('.product-card');
            if (!card) return;
            
            // Obtener información del producto desde el card
            const productName = card.querySelector('.product-name')?.textContent || '';
            const productCategory = card.querySelector('.product-meta')?.textContent || '';
            const productPrice = card.querySelector('.price-cny')?.getAttribute('data-price-cny') || '';
            const productImage = card.querySelector('.product-image img')?.src || '';
            const productQuality = card.querySelector('.product-quality')?.textContent || '';
            
            // Construir objeto producto
            const product = {
                nombre: productName,
                categoria: productCategory,
                precio_cny: parseFloat(productPrice) || 0,
                imagen_url: productImage,
                calidad: productQuality,
                qc_images: [] // Por ahora vacío, se puede expandir después
            };
            
            // Si hay múltiples imágenes en el card, agregarlas
            const allImages = card.querySelectorAll('.product-image img');
            if (allImages.length > 1) {
                product.qc_images = Array.from(allImages).map(img => img.src);
            }
            
            openQCModal(product);
        });
    });
}

// Inicializar modal QC cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQCModal);
} else {
    initQCModal();
}

// ============================================
// DATABASE STATS (Base de Datos Stats)
// ============================================

// Cargar estadísticas de la base de datos
async function loadDatabaseStats() {
    const totalProductsEl = document.getElementById('totalProducts');
    const totalCategoriesEl = document.getElementById('totalCategories');
    const totalQualityEl = document.getElementById('totalQuality');
    const lastUpdateEl = document.getElementById('lastUpdate');
    
    if (!totalProductsEl) return; // Solo ejecutar en página de productos
    
    try {
        const headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json"
        };
        
        // Obtener todos los productos activos
        const query = `${SUPABASE_REST_URL}/products_clean?select=id,categoria,calidad,created_at&activo=eq.true`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const res = await secureSupabaseFetch(query, {
            headers: headers,
            signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) {
            throw new Error(`Error ${res.status}`);
        }
        
        const products = await res.json();
        
        // Calcular estadísticas
        const totalProducts = products.length;
        
        // Contar categorías únicas
        const categories = new Set();
        products.forEach(p => {
            if (p.categoria) {
                categories.add(p.categoria);
            }
        });
        const totalCategories = categories.size;
        
        // Contar productos calidad 1:1
        const quality1to1 = products.filter(p => 
            p.calidad && p.calidad.toLowerCase().includes('1:1')
        ).length;
        
        // Obtener fecha de última actualización (producto más reciente)
        let lastUpdate = 'N/A';
        if (products.length > 0) {
            const sortedProducts = products
                .filter(p => p.created_at)
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            if (sortedProducts.length > 0) {
                const lastDate = new Date(sortedProducts[0].created_at);
                const now = new Date();
                const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
                
                if (diffDays === 0) {
                    lastUpdate = 'Hoy';
                } else if (diffDays === 1) {
                    lastUpdate = 'Ayer';
                } else if (diffDays < 7) {
                    lastUpdate = `Hace ${diffDays} días`;
                } else {
                    lastUpdate = lastDate.toLocaleDateString('es-AR', { 
                        day: 'numeric', 
                        month: 'short' 
                    });
                }
            }
        }
        
        // Actualizar UI con animación
        animateValue(totalProductsEl, 0, totalProducts, 1000);
        animateValue(totalCategoriesEl, 0, totalCategories, 1000);
        animateValue(totalQualityEl, 0, quality1to1, 1000);
        
        if (lastUpdateEl) {
            lastUpdateEl.textContent = lastUpdate;
        }
        
    } catch (error) {
        console.error('Error loading database stats:', error);
        // Mostrar valores por defecto
        if (totalProductsEl) totalProductsEl.textContent = '1,500+';
        if (totalCategoriesEl) totalCategoriesEl.textContent = '6+';
        if (totalQualityEl) totalQualityEl.textContent = '500+';
        if (lastUpdateEl) lastUpdateEl.textContent = 'Reciente';
    }
}

// Función para animar valores numéricos
function animateValue(element, start, end, duration) {
    if (!element) return;
    
    const range = end - start;
    const increment = range / (duration / 16); // 60fps
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        
        // Formatear número con separador de miles
        const formatted = Math.floor(current).toLocaleString('es-AR');
        element.textContent = formatted;
    }, 16);
}

// Cargar estadísticas cuando la página esté lista
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.pathname.includes('productos.html')) {
            loadDatabaseStats();
        }
    });
} else {
    if (window.location.pathname.includes('productos.html')) {
        loadDatabaseStats();
    }
}

// Exchange rates (will be updated from API if available)
// Base currency is now CNY (products prices are stored in CNY)
let exchangeRates = {
    CNY: 1.0,    // Base currency
    USD: 0.155,  // 1 CNY = 0.155 USD (tasa aproximada)
    ARS: 1455,   // 1 USD = 1455 ARS (dólar oficial, se actualiza desde API)
    CLP: 930     // 1 USD = 930 CLP (tasa aproximada)
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
                    if (!isNaN(ventaOficial) && ventaOficial > 0) {
                        // 1 USD = ventaOficial ARS
                        // Actualizar la tasa ARS/USD
                        exchangeRates.ARS = ventaOficial;
                        console.log('Exchange rate updated: 1 USD =', ventaOficial, 'ARS');
                        return;
                    }
                }
            }
        } catch (e) {
            console.warn('Error fetching exchange rates, using default:', e);
            // Fallback to default rate (1455 ARS per USD)
            exchangeRates.ARS = 1455;
        }
    } catch (e) {
        console.warn('Error in fetchExchangeRates, using default:', e);
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
                // Convertir CNY -> USD -> ARS
                // exchangeRates.USD = 0.155 (1 CNY = 0.155 USD)
                // exchangeRates.ARS = dólar oficial ARS/USD (ej: 1455)
                // Primero convertir CNY a USD, luego USD a ARS
                const priceUSD = priceCNY * exchangeRates.USD;
                const convertedPrice = priceUSD * exchangeRates.ARS;
                // Redondear y formatear sin decimales para ARS
                const roundedPrice = Math.round(convertedPrice);
                return `$${roundedPrice.toLocaleString('es-AR')} ARS`;
            };
            break;
        case 'CLP':
            formatPriceFn = (priceCNY) => {
                // Convertir CNY -> USD -> CLP
                const priceUSD = priceCNY * exchangeRates.USD;
                const convertedPrice = priceUSD * exchangeRates.CLP;
                const roundedPrice = Math.round(convertedPrice);
                return `$${roundedPrice.toLocaleString('es-CL')} CLP`;
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
    
    // Asegurar que el tema guardado se mantenga (sincronizar con el guardado)
    const savedTheme = localStorage.getItem('selectedTheme') || 'dark';
    const currentTheme = document.documentElement.getAttribute('data-theme');
    // Solo aplicar si el tema actual es diferente al guardado (evita cambios innecesarios)
    if (currentTheme !== savedTheme) {
        applyTheme(savedTheme);
    }
    
    const savedCurrency = localStorage.getItem('selectedCurrency');
    const savedAgent = localStorage.getItem('selectedAgent');
    
    if (savedCurrency && currencyOptions && currencyOptions.length > 0) {
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
    
    if (savedAgent && agentOptions && agentOptions.length > 0) {
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
    
    // Función para girar la ruleta (optimizada con GPU acceleration)
    const spinWheel = () => {
        if (isSpinning || hasSpunToday) return;
        
        isSpinning = true;
        if (wheelSpinCenter) {
            wheelSpinCenter.disabled = true;
        }
        if (wheelMain) {
            wheelMain.classList.add('spinning');
            // Forzar GPU acceleration
            wheelMain.style.willChange = 'transform';
            wheelMain.style.transform = 'translateZ(0)';
        }
        
        // Siempre termina en "Envío Gratis" (posición 0, 90, 180, o 270 grados)
        // Usamos posición 0 (primer segmento)
        const targetAngle = 0;
        const spins = 5; // Vueltas completas
        const finalAngle = spins * 360 + (360 - targetAngle);
        
        // Usar requestAnimationFrame para suavizar la animación
        requestAnimationFrame(() => {
            if (wheelMain) {
                wheelMain.style.transform = `translateZ(0) rotate(${finalAngle}deg)`;
            }
        });
        
        // Después de la animación (3 segundos)
        setTimeout(() => {
            isSpinning = false;
            if (wheelMain) {
                wheelMain.classList.remove('spinning');
                // Limpiar will-change después de la animación para mejor rendimiento
                wheelMain.style.willChange = 'auto';
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

// ============================================
// PROTECCIÓN DE SEGURIDAD
// ============================================

// Dominios autorizados (repshub.vercel.app es el dominio principal)
const AUTHORIZED_DOMAINS = [
    'repshub.vercel.app',
    'www.repshub.vercel.app',
    'repshub1.vercel.app',
    'www.repshub1.vercel.app',
    'fashionreps.vercel.app',
    'www.fashionreps.vercel.app',
    'localhost',
    '127.0.0.1'
];

// Token de sesión
let sessionToken = null;
let sessionExpiresAt = null;

// Verificar si el dominio está autorizado (definir primero para que esté disponible)
function isAuthorizedDomain() {
    const currentDomain = window.location.hostname;
    const currentOrigin = window.location.origin;
    
    return AUTHORIZED_DOMAINS.some(authorized => {
        return currentDomain === authorized ||
               currentDomain.includes(authorized) ||
               currentOrigin.includes(authorized);
    });
}

// Validar dominio mediante API
async function validateDomain() {
    try {
        const currentDomain = window.location.hostname;
        const currentOrigin = window.location.origin;
        
        const response = await fetch('/api/validate-domain', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                domain: currentDomain,
                origin: currentOrigin
            })
        });
        
        const data = await response.json();
        
        if (data.ok && data.authorized) {
            sessionToken = data.sessionToken;
            sessionExpiresAt = data.expiresAt;
            return true;
        }
        
        return false;
    } catch (error) {
        // Si hay error en la validación, retornar false pero no bloquear si dominio está autorizado localmente
        // Esto permite que el sitio funcione incluso si la API no está disponible
        return false;
    }
}


// Verificar sesión válida
function isSessionValid() {
    if (!sessionToken || !sessionExpiresAt) {
        return false;
    }
    return Date.now() < sessionExpiresAt;
}

// Wrapper seguro para fetch a Supabase
async function secureSupabaseFetch(url, options = {}) {
    // Verificar dominio local primero
    const isAuthorized = isAuthorizedDomain();
    console.log('Domain authorized:', isAuthorized, 'Current domain:', window.location.hostname);
    
    if (!isAuthorized) {
        console.error('Domain not authorized:', window.location.hostname);
        throw new Error('Acceso denegado: Dominio no autorizado');
    }
    
    // Verificar sesión (validar cada hora) - pero si falla la API, permitir acceso si dominio está autorizado
    if (!isSessionValid()) {
        try {
            const isValid = await validateDomain();
            console.log('Domain validation result:', isValid);
            if (!isValid) {
                // Si la validación falla pero el dominio está autorizado localmente, permitir acceso
                // Esto evita bloqueos si la API no está disponible
                if (isAuthorizedDomain()) {
                    console.log('Domain authorized locally, allowing fetch without session token');
                    // Permitir acceso pero sin token de sesión
                    return fetch(url, options);
                }
                throw new Error('Acceso denegado: Validación de dominio fallida');
            }
        } catch (error) {
            console.warn('Domain validation error, but domain is authorized locally:', error);
            // Si hay error en la validación pero el dominio está autorizado, permitir acceso
            if (isAuthorizedDomain()) {
                return fetch(url, options);
            }
            throw error;
        }
    }
    
    // Agregar token de sesión a headers si existe
    const secureOptions = {
        ...options,
        headers: {
            ...options.headers,
            'X-Session-Token': sessionToken || ''
        }
    };
    
    console.log('Fetching with options:', { url, headers: secureOptions.headers });
    return fetch(url, secureOptions);
}

// Mostrar error de acceso denegado
function showUnauthorizedError() {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'unauthorized-error';
    errorDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.95);
        color: #ff4444;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        font-family: Arial, sans-serif;
        font-size: 1.5rem;
        text-align: center;
        padding: 2rem;
    `;
    errorDiv.innerHTML = `
        <div>
            <h1 style="color: #ff4444; margin-bottom: 1rem;">Acceso Denegado</h1>
            <p>Este sitio solo es accesible desde dominios autorizados.</p>
            <p style="font-size: 1rem; margin-top: 1rem; color: #ccc;">Si crees que esto es un error, contacta al administrador.</p>
        </div>
    `;
    document.body.appendChild(errorDiv);
}

// Inicializar validación al cargar
(async function initSecurity() {
    if (!isAuthorizedDomain()) {
        showUnauthorizedError();
        return;
    }
    
    // Intentar validar dominio, pero no bloquear si falla (puede ser problema de API)
    try {
        const isValid = await validateDomain();
        if (!isValid && !isAuthorizedDomain()) {
            showUnauthorizedError();
            return;
        }
    } catch (error) {
        // Si falla la validación pero el dominio está autorizado localmente, continuar
        // Esto permite que el sitio funcione incluso si la API no está disponible
        if (!isAuthorizedDomain()) {
            showUnauthorizedError();
            return;
        }
    }
})();

// ============================================
// PROTECCIÓN CONTRA COPIA Y CONSOLA
// ============================================

// Bloquear DevTools y consola
(function() {
    'use strict';
    
    // Solo bloquear DevTools si NO estamos en un dominio autorizado
    // Esto permite debugging en desarrollo y producción autorizada
    if (!isAuthorizedDomain()) {
        let devtools = {open: false, orientation: null};
        const threshold = 160;
        
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtools.open) {
                    devtools.open = true;
                    document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-size:2rem;color:#ff4444;">Acceso denegado: DevTools detectado</div>';
                }
            } else {
                devtools.open = false;
            }
        }, 500);
    }
    
    // Solo bloquear atajos de teclado si NO estamos en un dominio autorizado
    if (!isAuthorizedDomain()) {
        document.addEventListener('keydown', function(e) {
            // F12
            if (e.keyCode === 123) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            // Ctrl+Shift+I
            if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            // Ctrl+Shift+J
            if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            // Ctrl+Shift+C
            if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            // Ctrl+U (ver código fuente)
            if (e.ctrlKey && e.keyCode === 85) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            // Ctrl+S (guardar página)
            if (e.ctrlKey && e.keyCode === 83) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            // Ctrl+A (seleccionar todo)
            if (e.ctrlKey && e.keyCode === 65) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            // Ctrl+C (copiar)
            if (e.ctrlKey && e.keyCode === 67 && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            // Ctrl+V (pegar)
            if (e.ctrlKey && e.keyCode === 86) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            // Ctrl+X (cortar)
            if (e.ctrlKey && e.keyCode === 88) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            // Ctrl+P (imprimir)
            if (e.ctrlKey && e.keyCode === 80) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        });
    }
    
    // Solo bloquear eventos de copia si NO estamos en un dominio autorizado
    if (!isAuthorizedDomain()) {
        // Bloquear right-click
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        
        // Bloquear selección de texto
        document.addEventListener('selectstart', function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        
        // Bloquear drag and drop
        document.addEventListener('dragstart', function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        
        // Bloquear eventos de copia
        document.addEventListener('copy', function(e) {
            e.clipboardData.setData('text/plain', '');
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        
        // Bloquear eventos de cortar
        document.addEventListener('cut', function(e) {
            e.clipboardData.setData('text/plain', '');
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        
        // CSS para deshabilitar selección
        const style = document.createElement('style');
        style.textContent = `
            * {
                -webkit-user-select: none !important;
                -moz-user-select: none !important;
                -ms-user-select: none !important;
                user-select: none !important;
                -webkit-touch-callout: none !important;
                -webkit-tap-highlight-color: transparent !important;
            }
            input, textarea {
                -webkit-user-select: text !important;
                -moz-user-select: text !important;
                -ms-user-select: text !important;
                user-select: text !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Solo bloquear console si NO estamos en un dominio autorizado
    // Esto permite debugging en desarrollo y producción autorizada
    if (!isAuthorizedDomain()) {
        const noop = () => {};
        const methods = ['log', 'debug', 'info', 'warn', 'error', 'assert', 'dir', 'dirxml', 'group', 'groupEnd', 'time', 'timeEnd', 'count', 'trace', 'profile', 'profileEnd'];
        methods.forEach(method => {
            window.console[method] = noop;
        });
        
        // Bloquear acceso a console solo en dominios no autorizados
        try {
            Object.defineProperty(window, 'console', {
                value: {},
                writable: false,
                configurable: false
            });
        } catch (e) {
            // Si falla, continuar sin bloquear
        }
    }
})();

// ============================================
// PROTECCIÓN ADICIONAL: DETECCIÓN DE CÓDIGO COPIADO
// ============================================

// Detectar si el código está siendo ejecutado fuera del dominio autorizado
(function detectUnauthorizedExecution() {
    'use strict';
    
    const currentDomain = window.location.hostname;
    const isAuthorized = AUTHORIZED_DOMAINS.some(domain => 
        currentDomain === domain || currentDomain.includes(domain)
    );
    
    if (!isAuthorized) {
        // Si el código se ejecuta fuera del dominio autorizado, deshabilitar funcionalidad
        window.addEventListener('load', function() {
            document.body.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;height:100vh;font-size:1.5rem;color:#ff4444;text-align:center;padding:2rem;font-family:Arial,sans-serif;">
                    <div>
                        <h1 style="color:#ff4444;margin-bottom:1rem;">Código Protegido</h1>
                        <p>Este código solo puede ejecutarse desde dominios autorizados.</p>
                        <p style="font-size:1rem;margin-top:1rem;color:#ccc;">El código está protegido y no funcionará fuera del entorno autorizado.</p>
                    </div>
                </div>
            `;
        });
        
        // Deshabilitar todas las funciones críticas
        window.fetch = function() {
            return Promise.reject(new Error('Acceso denegado'));
        };
        
        return;
    }
    
    // Verificar integridad del código (detección básica de modificación)
    const codeIntegrity = {
        check: function() {
            // Verificar que las funciones críticas existan
            if (typeof secureSupabaseFetch !== 'function' || 
                typeof validateDomain !== 'function' ||
                typeof isAuthorizedDomain !== 'function') {
                console.error('Integridad del código comprometida');
                return false;
            }
            return true;
        }
    };
    
    // Ejecutar verificación periódicamente
    setInterval(() => {
        if (!codeIntegrity.check()) {
            document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-size:2rem;color:#ff4444;">Código modificado detectado</div>';
        }
    }, 5000);
})();

// ===== SUPABASE CONFIG =====
const SUPABASE_URL = "https://szohpkcgubckxoauspmr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6b2hwa2NndWJja3hvYXVzcG1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NTMwNTksImV4cCI6MjA4NTAyOTA1OX0.bSbr61juTNd0Y4LchHjT2YbvCl-uau2GN83V-2HhkWE";
const SUPABASE_REST_URL = `${SUPABASE_URL}/rest/v1`;
const LOCAL_PRODUCTS_PATH = 'data/products.local.json';
const CATALOG_CACHE_TTL_MS = 60 * 1000;

let catalogCache = {
    data: null,
    expiresAt: 0,
    promise: null
};

function normalizeCatalogProduct(rawProduct, index = 0, source = 'local') {
    if (!rawProduct || typeof rawProduct !== 'object') return null;

    const normalized = {
        ...rawProduct,
        id: rawProduct.id ?? `${source}-${index}`,
        nombre: rawProduct.nombre || rawProduct.name || 'Producto sin nombre',
        categoria: rawProduct.categoria || rawProduct.category || '',
        descripcion: rawProduct.descripcion || rawProduct.description || '',
        calidad: rawProduct.calidad || rawProduct.quality || '',
        precio_cny: parseFloat(
            rawProduct.precio_cny ??
            rawProduct.precio ??
            rawProduct.price_cny ??
            rawProduct.price ??
            0
        ) || 0,
        imagen_url: rawProduct.imagen_url || rawProduct.image || rawProduct.imagen || '',
        source_url: rawProduct.source_url || rawProduct.url || rawProduct.link || '',
        created_at: rawProduct.created_at || rawProduct.createdAt || new Date(0).toISOString(),
        activo: rawProduct.activo !== false,
        qc_images: Array.isArray(rawProduct.qc_images) ? rawProduct.qc_images : []
    };

    return normalized.activo ? normalized : null;
}

function buildProductDedupKey(product) {
    const sourceUrl = String(product.source_url || '').trim().toLowerCase();
    const nombre = String(product.nombre || '').trim().toLowerCase();
    const precio = String(product.precio_cny || 0).trim();
    return `${sourceUrl}|${nombre}|${precio}`;
}

async function fetchSupabaseCatalogProducts() {
    const headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        "Range": "0-1999",
        "Prefer": "count=exact"
    };

    const query = `${SUPABASE_REST_URL}/products_clean?select=*&activo=eq.true&order=created_at.desc`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const res = await secureSupabaseFetch(query, {
            headers,
            signal: controller.signal,
            cache: 'default'
        });

        if (!res.ok) {
            const txt = await res.text();
            throw new Error(`Supabase error ${res.status}: ${txt}`);
        }

        const products = await res.json();
        return Array.isArray(products)
            ? products.map((product, index) => normalizeCatalogProduct(product, index, 'supabase')).filter(Boolean)
            : [];
    } finally {
        clearTimeout(timeoutId);
    }
}

async function fetchLocalCatalogProducts() {
    try {
        const res = await fetch(LOCAL_PRODUCTS_PATH, {
            cache: 'no-store'
        });

        if (!res.ok) {
            if (res.status === 404) {
                return [];
            }
            throw new Error(`Local catalog error ${res.status}`);
        }

        const payload = await res.json();
        const products = Array.isArray(payload) ? payload : payload.products;

        if (!Array.isArray(products)) {
            console.warn('Local catalog exists but has an invalid format');
            return [];
        }

        return products
            .map((product, index) => normalizeCatalogProduct(product, index, 'local'))
            .filter(Boolean);
    } catch (error) {
        console.warn('Local catalog could not be loaded:', error);
        return [];
    }
}

async function getActiveCatalogProducts(options = {}) {
    const { forceRefresh = false } = options;
    const now = Date.now();

    if (!forceRefresh && catalogCache.data && catalogCache.expiresAt > now) {
        return [...catalogCache.data];
    }

    if (!forceRefresh && catalogCache.promise) {
        const cachedProducts = await catalogCache.promise;
        return [...cachedProducts];
    }

    catalogCache.promise = (async () => {
        const [supabaseProducts, localProducts] = await Promise.all([
            fetchSupabaseCatalogProducts().catch(error => {
                console.error('Error loading Supabase catalog:', error);
                return [];
            }),
            fetchLocalCatalogProducts()
        ]);

        const mergedProducts = [];
        const dedupMap = new Map();

        [...supabaseProducts, ...localProducts].forEach(product => {
            const key = buildProductDedupKey(product);
            dedupMap.set(key, product);
        });

        dedupMap.forEach(product => {
            mergedProducts.push(product);
        });

        mergedProducts.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

        catalogCache.data = mergedProducts;
        catalogCache.expiresAt = Date.now() + CATALOG_CACHE_TTL_MS;
        catalogCache.promise = null;

        return mergedProducts;
    })();

    const products = await catalogCache.promise;
    return [...products];
}


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
            // https://www.kakobuy.com/item/details?url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D7616832901&affcode=gonza
            const encodedUrl = encodeURIComponent(url);
            return `https://www.kakobuy.com/item/details?url=${encodedUrl}&affcode=gonza`;
            
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
    if (!grid) {
        console.error('Products grid not found in renderProducts');
        return;
    }

    console.log('Rendering products:', products?.length || 0);

    // Usar DocumentFragment para mejor rendimiento (batch DOM updates)
    const fragment = document.createDocumentFragment();

    if (!products || !products.length) {
        console.warn('No products to render');
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
        // Adjuntar listeners de QC después de renderizar
        attachQCListeners();
    });
}

// Cargar productos destacados aleatorios desde Supabase
async function loadFeaturedProducts() {
    // Intentar múltiples selectores para encontrar el carousel track
    let carouselTrack = document.querySelector('#productCarousel .carousel-track') || 
                       document.querySelector('#carouselTrack') ||
                       document.querySelector('.carousel-track');
    
    if (!carouselTrack) {
        console.error('Carousel track not found! Attempting to find by ID...');
        carouselTrack = document.getElementById('carouselTrack');
    }
    
    if (!carouselTrack) {
        console.error('Carousel track not found with any selector!');
        console.error('Available elements:', {
            productCarousel: !!document.getElementById('productCarousel'),
            carouselTrack: !!document.getElementById('carouselTrack'),
            carouselWrapper: !!document.getElementById('carouselWrapper'),
            featuredProducts: !!document.getElementById('featured-products')
        });
        return;
    }
    console.log('loadFeaturedProducts called, carouselTrack found:', !!carouselTrack);
    
    try {
        const headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json"
        };
        
        // Obtener 50 productos aleatorios
        const query = `${SUPABASE_REST_URL}/products_clean?select=*&activo=eq.true&limit=50&order=created_at.desc`;
        
        console.log('Fetching products from:', query);
        console.log('Domain authorized:', isAuthorizedDomain());
        console.log('Current hostname:', window.location.hostname);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        let res;
        try {
            res = await secureSupabaseFetch(query, {
                headers: headers,
                signal: controller.signal,
            });
        } catch (fetchError) {
            clearTimeout(timeoutId);
            console.error('Fetch error:', fetchError);
            throw new Error(`Error al conectar con la API: ${fetchError.message}`);
        }
        
        clearTimeout(timeoutId);
        
        console.log('Response status:', res.status, res.statusText);
        
        if (!res.ok) {
            const txt = await res.text();
            console.error('API error response:', txt);
            throw new Error(`Supabase error ${res.status}: ${txt}`);
        }
        
        let products;
        try {
            products = await res.json();
        } catch (jsonError) {
            console.error('JSON parse error:', jsonError);
            const text = await res.text();
            console.error('Response text:', text);
            throw new Error(`Error al procesar respuesta: ${jsonError.message}`);
        }
        
        console.log('Products received from API:', products ? products.length : 0);
        if (products && products.length > 0) {
            console.log('First product sample:', {
                nombre: products[0].nombre,
                imagen_url: products[0].imagen_url,
                activo: products[0].activo
            });
        }
        
        if (!products || products.length === 0) {
            console.warn('No products received from API');
            // Crear o actualizar mensaje
            let noProductsMsg = carouselTrack.querySelector('.carousel-loading');
            if (!noProductsMsg) {
                noProductsMsg = document.createElement('div');
                noProductsMsg.className = 'carousel-loading';
                noProductsMsg.style.cssText = 'display: flex; align-items: center; justify-content: center; min-height: 200px; color: rgba(255,255,255,0.8); padding: 1.5rem; width: 100%; font-size: 1rem; position: relative;';
                carouselTrack.appendChild(noProductsMsg);
            }
            noProductsMsg.textContent = 'No hay productos disponibles en este momento.';
            noProductsMsg.style.color = 'var(--muted)';
            noProductsMsg.style.display = 'flex';
            noProductsMsg.style.position = 'relative';
            
            // Asegurar visibilidad
            carouselTrack.style.display = 'flex';
            carouselTrack.style.visibility = 'visible';
            carouselTrack.style.opacity = '1';
            carouselTrack.style.minHeight = '200px';
            carouselTrack.style.justifyContent = 'center';
            carouselTrack.style.alignItems = 'center';
            return;
        }
        
        // Seleccionar 8 productos aleatorios para mejor visualización del carousel
        const shuffled = products.sort(() => 0.5 - Math.random());
        const selectedProducts = shuffled.slice(0, 8);
        
        // Limpiar el carousel (incluyendo el mensaje de carga)
        const loadingMsg = carouselTrack.querySelector('.carousel-loading');
        if (loadingMsg) {
            loadingMsg.remove();
        }
        // Limpiar solo los items del carousel existentes
        const existingItems = carouselTrack.querySelectorAll('.carousel-item');
        existingItems.forEach(item => item.remove());
        
        // Asegurar que el carousel esté configurado correctamente antes de agregar productos
        carouselTrack.style.display = 'flex';
        carouselTrack.style.visibility = 'visible';
        carouselTrack.style.opacity = '1';
        carouselTrack.style.minHeight = '200px';
        carouselTrack.style.gap = '1rem';
        carouselTrack.style.flexWrap = 'nowrap';
        
        // Declarar wrapper y section una sola vez al principio
        const wrapper = carouselTrack.closest('.carousel-wrapper');
        const section = carouselTrack.closest('.featured-products-modern');
        
        // Asegurar que el carousel sea visible
        carouselTrack.style.display = 'flex';
        carouselTrack.style.visibility = 'visible';
        carouselTrack.style.opacity = '1';
        carouselTrack.style.minHeight = '200px';
        
        if (wrapper) {
            wrapper.style.display = 'block';
            wrapper.style.visibility = 'visible';
            wrapper.style.opacity = '1';
            wrapper.style.minHeight = '200px';
        }
        
        if (section) {
            section.style.display = 'block';
            section.style.visibility = 'visible';
            section.style.opacity = '1';
        }
        
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
            carouselItem.style.cssText = 'min-width: 180px !important; max-width: 180px !important; flex-shrink: 0 !important; display: block !important; visibility: visible !important; opacity: 1 !important; background: var(--bg-card); border-radius: 8px; overflow: hidden;';
            
            // Detectar tema actual para ajustar estilos
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const imageBg = currentTheme === 'light' ? '#f5f5f5' : 'rgba(255,255,255,0.05)';
            
            carouselItem.innerHTML = `
                <a href="productos.html" class="carousel-product-card" style="display: block !important; text-decoration: none; color: inherit; height: 100%;">
                    <div class="carousel-product-image" style="height: 150px !important; width: 100% !important; display: block !important; overflow: hidden; background: ${imageBg};">
                        <img src="${image}" alt="${escapeHtml(product.nombre)}" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='https://via.placeholder.com/300x300?text=Sin+imagen';" style="width: 100% !important; height: 100% !important; object-fit: cover !important; display: block !important;">
                    </div>
                    <h3 class="carousel-product-name" style="font-size: 0.85rem !important; padding: 0.5rem !important; color: var(--text) !important; margin: 0 !important; text-align: center;">${escapeHtml(product.nombre)}</h3>
                </a>
            `;
            
            carouselTrack.appendChild(carouselItem);
            console.log('Product added to carousel:', product.nombre);
        });
        
        console.log('Total products rendered:', carouselTrack.children.length);
        console.log('Carousel track innerHTML length:', carouselTrack.innerHTML.length);
        
        // Duplicar items para loop infinito perfecto sin cortes (optimizado con DocumentFragment)
        const originalItems = Array.from(carouselTrack.querySelectorAll('.carousel-item'));
        const originalCount = originalItems.length;
        
        if (originalCount === 0) {
            console.warn('No products to display in carousel');
            return;
        }
        
        console.log('Carousel initialized with', originalCount, 'products');
        
        // Verificar que los items sean visibles
        originalItems.forEach((item, index) => {
            const computedStyle = window.getComputedStyle(item);
            console.log(`Item ${index} - display: ${computedStyle.display}, visibility: ${computedStyle.visibility}, opacity: ${computedStyle.opacity}, width: ${computedStyle.width}`);
        });
        
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
                // Asegurar que los clones también sean visibles
                clone.style.cssText = item.style.cssText;
                fragment.appendChild(clone);
            });
        }
        
        // Agregar todos los clones de una vez (mejor rendimiento)
        carouselTrack.appendChild(fragment);
        
        console.log('Total items in carousel after cloning:', carouselTrack.children.length);
        
        // Asegurar que la animación esté activa y configurada correctamente
        carouselTrack.style.display = 'flex';
        carouselTrack.style.gap = '1rem';
        carouselTrack.style.animation = 'scroll 60s linear infinite';
        carouselTrack.style.willChange = 'transform';
        carouselTrack.style.minWidth = 'max-content';
        carouselTrack.style.width = 'max-content';
        carouselTrack.style.flexWrap = 'nowrap';
        carouselTrack.style.contain = 'layout style paint';
        carouselTrack.style.visibility = 'visible';
        carouselTrack.style.opacity = '1';
        carouselTrack.style.height = 'auto';
        carouselTrack.style.minHeight = '200px';
        carouselTrack.style.display = 'flex';
        
        // Asegurar que el wrapper y la sección sean visibles (reutilizar variables ya declaradas)
        if (wrapper) {
            wrapper.style.display = 'block';
            wrapper.style.visibility = 'visible';
            wrapper.style.opacity = '1';
            wrapper.style.minHeight = '200px';
            wrapper.style.height = '200px';
        }
        
        if (section) {
            section.style.display = 'block';
            section.style.visibility = 'visible';
            section.style.opacity = '1';
        }
        
        // Forzar reflow y asegurar que la animación se inicie (optimizado)
        carouselTrack.style.backfaceVisibility = 'hidden';
        carouselTrack.style.transform = 'translateZ(0)';
        
        // Log para debug
        console.log('Carousel track styles applied. Items count:', carouselTrack.children.length);
        const trackStyle = window.getComputedStyle(carouselTrack);
        console.log('Carousel track computed display:', trackStyle.display);
        console.log('Carousel track computed visibility:', trackStyle.visibility);
        console.log('Carousel track computed opacity:', trackStyle.opacity);
        console.log('Carousel track computed width:', trackStyle.width);
        console.log('Carousel track computed height:', trackStyle.height);
        console.log('Carousel track computed transform:', trackStyle.transform);
        
        // Verificar que el wrapper también sea visible (reutilizar variable ya declarada)
        if (wrapper) {
            const wrapperStyle = window.getComputedStyle(wrapper);
            console.log('Carousel wrapper display:', wrapperStyle.display);
            console.log('Carousel wrapper visibility:', wrapperStyle.visibility);
            console.log('Carousel wrapper height:', wrapperStyle.height);
        }
        
        // Reiniciar animación para asegurar que funcione
        setTimeout(() => {
            carouselTrack.style.animation = 'none';
            requestAnimationFrame(() => {
                carouselTrack.style.animation = 'scroll 60s linear infinite';
                console.log('Carousel animation restarted');
                // Forzar un reflow
                void carouselTrack.offsetHeight;
            });
        }, 100);
        
        // Verificar visibilidad después de un breve delay
        setTimeout(() => {
            const rect = carouselTrack.getBoundingClientRect();
            console.log('Carousel track position:', {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                visible: rect.width > 0 && rect.height > 0
            });
            
            const wrapperRect = wrapper ? wrapper.getBoundingClientRect() : null;
            if (wrapperRect) {
                console.log('Carousel wrapper position:', {
                    top: wrapperRect.top,
                    left: wrapperRect.left,
                    width: wrapperRect.width,
                    height: wrapperRect.height,
                    visible: wrapperRect.width > 0 && wrapperRect.height > 0
                });
            }
        }, 500);
        
    } catch (error) {
        console.error('Error loading featured products:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        // Crear o actualizar mensaje de error
        let errorMsg = carouselTrack.querySelector('.carousel-loading');
        if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'carousel-loading';
            errorMsg.style.cssText = 'display: flex; align-items: center; justify-content: center; min-height: 200px; color: rgba(255,255,255,0.8); padding: 1.5rem; width: 100%; font-size: 1rem; position: relative;';
            carouselTrack.appendChild(errorMsg);
        }
        
        errorMsg.textContent = 'Error al cargar productos. Por favor, recarga la página.';
        errorMsg.style.color = '#ff4444';
        errorMsg.style.display = 'flex';
        errorMsg.style.position = 'relative';
        
        // Obtener wrapper y section si no están declarados (puede estar en el catch)
        const errorWrapper = carouselTrack.closest('.carousel-wrapper');
        const errorSection = carouselTrack.closest('.featured-products-modern');
        
        // Asegurar que el carousel siga siendo visible incluso con error
        carouselTrack.style.display = 'flex';
        carouselTrack.style.visibility = 'visible';
        carouselTrack.style.opacity = '1';
        carouselTrack.style.minHeight = '200px';
        carouselTrack.style.justifyContent = 'center';
        carouselTrack.style.alignItems = 'center';
        
        if (errorWrapper) {
            errorWrapper.style.display = 'block';
            errorWrapper.style.visibility = 'visible';
            errorWrapper.style.opacity = '1';
            errorWrapper.style.minHeight = '200px';
            errorWrapper.style.height = '200px';
        }
        
        if (errorSection) {
            errorSection.style.display = 'block';
            errorSection.style.visibility = 'visible';
            errorSection.style.opacity = '1';
        }
    }
}

// Estado de paginación global (ya declarado arriba)
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
        console.log('Fetching products from:', query);
        const res = await secureSupabaseFetch(query, {
            headers: headers,
            signal: controller.signal,
            // Agregar cache para mejorar rendimiento
            cache: 'default'
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            const txt = await res.text();
            console.error('Supabase error:', res.status, txt);
            throw new Error(`Supabase error ${res.status}: ${txt}`);
        }

        let products = await res.json();
        console.log('Raw products from API:', products?.length || 0);
        
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
async function initModernFilters() {
    const container = document.getElementById('categoriesContainerModern');
    if (!container) return;

    try {
        const products = await getActiveCatalogProducts();
        if (!products.length) return;

        const categoryCounts = {};
        const categoryMap = {
            'all': 'Todos los Productos',
            'calzado': 'Zapatillas',
            'ropa-superior': 'Remeras',
            'ropa-inferior': 'Pantalones',
            'accesorios': 'Accesorios',
            'conjuntos': 'Conjuntos'
        };

        let totalCount = 0;
        products.forEach(product => {
            totalCount++;
            const mappedCategory = mapProductCategory(product);
            if (mappedCategory && mappedCategory !== 'all') {
                categoryCounts[mappedCategory] = (categoryCounts[mappedCategory] || 0) + 1;
            }
        });

        container.innerHTML = '';

        const allBtn = document.createElement('button');
        allBtn.className = 'category-btn-modern active';
        allBtn.setAttribute('data-category', 'all');
        allBtn.innerHTML = `Todos los Productos <span class="category-badge">${totalCount}</span>`;
        allBtn.style.background = '#dc2626';
        allBtn.style.border = 'none';
        allBtn.style.color = '#ffffff';
        allBtn.style.fontWeight = '600';
        allBtn.style.borderRadius = '20px';
        allBtn.style.padding = '0.5rem 1rem';
        container.appendChild(allBtn);

        const categories = ['calzado', 'ropa-superior', 'ropa-inferior', 'accesorios', 'conjuntos'];
        categories.forEach(cat => {
            const count = categoryCounts[cat] || 0;
            if (count > 0) {
                const btn = document.createElement('button');
                btn.className = 'category-btn-modern';
                btn.setAttribute('data-category', cat);
                btn.innerHTML = `${categoryMap[cat]} <span class="category-badge">${count}</span>`;
                btn.style.background = 'transparent';
                btn.style.border = 'none';
                btn.style.color = '';
                container.appendChild(btn);
            }
        });

        const modernButtons = container.querySelectorAll('.category-btn-modern');
        modernButtons.forEach(button => {
            if (button.classList.contains('active')) {
                button.style.background = '#dc2626';
                button.style.border = 'none';
                button.style.color = '#ffffff';
                button.style.fontWeight = '600';
                button.style.borderRadius = '20px';
                button.style.padding = '0.5rem 1rem';
            } else {
                button.style.background = 'transparent';
                button.style.border = 'none';
            }

            button.addEventListener('click', () => {
                modernButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.style.background = '';
                    btn.style.borderColor = '';
                    btn.style.color = '';
                });
                button.classList.add('active');
                button.style.background = '#dc2626';
                button.style.borderColor = '#dc2626';
                button.style.color = '#ffffff';

                setTimeout(() => {
                    const filters = buildFiltersFromUI();
                    loadProductsPage(1, filters);
                }, 10);
            });
        });
    } catch (error) {
        console.error('Error loading category filters:', error);
    }
}

async function loadDatabaseStats() {
    const totalProductsEl = document.getElementById('totalProducts');
    const totalCategoriesEl = document.getElementById('totalCategories');
    const totalQualityEl = document.getElementById('totalQuality');
    const lastUpdateEl = document.getElementById('lastUpdate');

    if (!totalProductsEl) return;

    try {
        const products = await getActiveCatalogProducts();
        const totalProducts = products.length;

        const categories = new Set();
        products.forEach(p => {
            if (p.categoria) {
                categories.add(p.categoria);
            }
        });
        const totalCategories = categories.size;

        const quality1to1 = products.filter(p =>
            p.calidad && p.calidad.toLowerCase().includes('1:1')
        ).length;

        let lastUpdate = 'N/A';
        if (products.length > 0) {
            const sortedProducts = products
                .filter(p => p.created_at)
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            if (sortedProducts.length > 0) {
                const lastDate = new Date(sortedProducts[0].created_at);
                const now = new Date();
                const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));

                if (diffDays === 0) {
                    lastUpdate = 'Hoy';
                } else if (diffDays === 1) {
                    lastUpdate = 'Ayer';
                } else if (diffDays < 7) {
                    lastUpdate = `Hace ${diffDays} días`;
                } else {
                    lastUpdate = lastDate.toLocaleDateString('es-AR', {
                        day: 'numeric',
                        month: 'short'
                    });
                }
            }
        }

        animateValue(totalProductsEl, 0, totalProducts, 1000);
        animateValue(totalCategoriesEl, 0, totalCategories, 1000);
        animateValue(totalQualityEl, 0, quality1to1, 1000);

        if (lastUpdateEl) {
            lastUpdateEl.textContent = lastUpdate;
        }
    } catch (error) {
        console.error('Error loading database stats:', error);
        if (totalProductsEl) totalProductsEl.textContent = '1,500+';
        if (totalCategoriesEl) totalCategoriesEl.textContent = '6+';
        if (totalQualityEl) totalQualityEl.textContent = '500+';
        if (lastUpdateEl) lastUpdateEl.textContent = 'Reciente';
    }
}

async function loadFeaturedProducts() {
    let carouselTrack = document.querySelector('#productCarousel .carousel-track') ||
                       document.querySelector('#carouselTrack') ||
                       document.querySelector('.carousel-track');

    if (!carouselTrack) {
        carouselTrack = document.getElementById('carouselTrack');
    }

    if (!carouselTrack) {
        console.error('Carousel track not found with any selector');
        return;
    }

    try {
        const products = await getActiveCatalogProducts();

        if (!products || products.length === 0) {
            let noProductsMsg = carouselTrack.querySelector('.carousel-loading');
            if (!noProductsMsg) {
                noProductsMsg = document.createElement('div');
                noProductsMsg.className = 'carousel-loading';
                noProductsMsg.style.cssText = 'display:flex;align-items:center;justify-content:center;min-height:200px;color:rgba(255,255,255,0.8);padding:1.5rem;width:100%;font-size:1rem;position:relative;';
                carouselTrack.appendChild(noProductsMsg);
            }
            noProductsMsg.textContent = 'No hay productos disponibles en este momento.';
            return;
        }

        const shuffled = [...products].sort(() => 0.5 - Math.random());
        const selectedProducts = shuffled.slice(0, 8);
        const loadingMsg = carouselTrack.querySelector('.carousel-loading');
        if (loadingMsg) loadingMsg.remove();

        carouselTrack.innerHTML = '';
        const placeholderImg = 'https://via.placeholder.com/300x300?text=Sin+imagen';

        selectedProducts.forEach(product => {
            let image = product.imagen_url || '';
            image = image ? normalizeImgurUrl(image) : placeholderImg;

            const carouselItem = document.createElement('div');
            carouselItem.className = 'carousel-item';
            carouselItem.innerHTML = `
                <a href="productos.html" class="carousel-product-card" style="display: block !important; text-decoration: none; color: inherit; height: 100%;">
                    <div class="carousel-product-image">
                        <img src="${image}" alt="${escapeHtml(product.nombre)}" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='${placeholderImg}';">
                    </div>
                    <h3 class="carousel-product-name">${escapeHtml(product.nombre)}</h3>
                </a>
            `;
            carouselTrack.appendChild(carouselItem);
        });

        const originalItems = Array.from(carouselTrack.querySelectorAll('.carousel-item'));
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < 6; i++) {
            originalItems.forEach(item => fragment.appendChild(item.cloneNode(true)));
        }
        carouselTrack.appendChild(fragment);

        const wrapper = carouselTrack.closest('.carousel-wrapper');
        const section = carouselTrack.closest('.featured-products-modern');

        carouselTrack.style.display = 'flex';
        carouselTrack.style.gap = '1rem';
        carouselTrack.style.animation = 'scroll 60s linear infinite';
        carouselTrack.style.willChange = 'transform';
        carouselTrack.style.minWidth = 'max-content';
        carouselTrack.style.width = 'max-content';
        carouselTrack.style.flexWrap = 'nowrap';
        carouselTrack.style.contain = 'layout style paint';
        carouselTrack.style.visibility = 'visible';
        carouselTrack.style.opacity = '1';
        carouselTrack.style.height = 'auto';
        carouselTrack.style.minHeight = '200px';
        carouselTrack.style.backfaceVisibility = 'hidden';
        carouselTrack.style.transform = 'translateZ(0)';

        if (wrapper) {
            wrapper.style.display = 'block';
            wrapper.style.visibility = 'visible';
            wrapper.style.opacity = '1';
            wrapper.style.minHeight = '200px';
            wrapper.style.height = '200px';
        }

        if (section) {
            section.style.display = 'block';
            section.style.visibility = 'visible';
            section.style.opacity = '1';
        }

        setTimeout(() => {
            carouselTrack.style.animation = 'none';
            requestAnimationFrame(() => {
                carouselTrack.style.animation = 'scroll 60s linear infinite';
                void carouselTrack.offsetHeight;
            });
        }, 100);
    } catch (error) {
        console.error('Error loading featured products:', error);
    }
}

async function loadProductsFromAPI(page = 1, pageSize = 36, filters = {}) {
    let products = await getActiveCatalogProducts();

    if (filters.quality) {
        const qualityFilter = filters.quality.toLowerCase();
        products = products.filter(product =>
            String(product.calidad || '').toLowerCase() === qualityFilter
        );
    }

    if (filters.search) {
        const searchTerm = filters.search.toLowerCase().trim();
        products = products.filter(product =>
            String(product.nombre || '').toLowerCase().includes(searchTerm) ||
            String(product.descripcion || '').toLowerCase().includes(searchTerm) ||
            String(product.categoria || '').toLowerCase().includes(searchTerm)
        );
    }

    if (filters.brand) {
        let brandNormalized = filters.brand.toLowerCase().trim();
        const brandSearchMap = {
            'acne-studios': 'acne',
            'saint-laurent': 'saint laurent',
            'enfants-riches-deprimes': 'enfants riches',
            'lostkidsclub2000': 'lost kids',
            'martine-rose': 'martine rose',
            'sin-marca': null,
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

        if (brandSearchMap.hasOwnProperty(brandNormalized)) {
            brandNormalized = brandSearchMap[brandNormalized];
        }

        if (brandNormalized) {
            products = products.filter(product =>
                String(product.nombre || '').toLowerCase().includes(brandNormalized)
            );
        }
    }

    if (filters.category && filters.category !== 'all' && products.length > 0) {
        const filterCategoryNormalized = filters.category.toLowerCase();
        products = products.filter(product => mapProductCategory(product) === filterCategoryNormalized);
    }

    switch (filters.sort) {
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
        case 'recientes':
        default:
            products.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
            break;
    }

    const totalCount = products.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = products.slice(startIndex, endIndex);

    return {
        products: paginatedProducts || [],
        totalCount,
        totalPages: totalPages || 1,
        currentPage: page
    };
}

if (typeof window !== 'undefined') {
    window.loadProductsFromAPI = loadProductsFromAPI;
}

// Cargar productos con paginación
async function loadProductsPage(page = 1, filters = {}) {
    const grid = document.querySelector('.products-grid') || document.getElementById('products-grid');
    if (!grid) {
        console.error('Products grid not found');
        return;
    }
    
    if (typeof loadProductsFromAPI !== 'function') {
        console.error('loadProductsFromAPI function not available');
        grid.innerHTML = '<p style="color: #fff; text-align: center; padding: 2rem;">Error: función no disponible. Recarga la página.</p>';
        return;
    }
    
    try {
        // Mostrar estado de carga (solo si el grid está vacío o tiene contenido previo)
        if (!grid.querySelector('.product-card')) {
            grid.innerHTML = '<p style="color: #fff; text-align: center; padding: 2rem;">Cargando productos...</p>';
        }
        
        console.log('Loading products page:', page, 'filters:', filters);
        const result = await loadProductsFromAPI(page, PRODUCTS_PER_PAGE, filters);
        console.log('Products loaded:', result.products?.length || 0, 'products');
        
        if (!result || !result.products) {
            throw new Error('No se recibieron productos del servidor');
        }
        
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
        console.error('Error loading products:', e);
        // Mostrar error pero permitir que la página continúe funcionando
        grid.innerHTML = `
            <div style="color:#fff; text-align:center; opacity:.9; padding:40px;">
                <div style="font-size:22px; margin-bottom:10px;">Error al cargar productos</div>
                <div style="opacity:.7; margin-bottom:20px;">${e.message || 'Error desconocido'}</div>
                <div style="opacity:.5; margin-bottom:20px; font-size:12px;">Abre la consola (F12) para más detalles</div>
                <button onclick="location.reload()" style="padding:10px 20px; background:#dc2626; color:#fff; border:none; border-radius:5px; cursor:pointer;">Recargar página</button>
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
    try {
        console.log('Initializing product loading...');
        console.log('Current pathname:', window.location.pathname);
        console.log('Current href:', window.location.href);
        
        // Verificar si estamos en la página de productos
        const grid = document.querySelector('.products-grid') || document.getElementById('products-grid');
        console.log('Products grid found:', !!grid);
        
        const isProductsPage = window.location.pathname.includes('productos.html') || 
                              window.location.pathname.endsWith('productos.html') ||
                              window.location.href.includes('productos.html') ||
                              !!grid;
        
        console.log('Is products page:', isProductsPage);
        
        if (isProductsPage && grid) {
            // Obtener página desde URL o usar 1 por defecto
            const urlParams = new URLSearchParams(window.location.search);
            const pageFromUrl = parseInt(urlParams.get('page')) || 1;
            
            console.log('Loading products page:', pageFromUrl);
            await loadProductsPage(pageFromUrl, {});
        }
        
        // Verificar si estamos en la página de inicio para cargar productos destacados
        const isHomePage = window.location.pathname.includes('index.html') || 
                           window.location.pathname.endsWith('/') || 
                           window.location.pathname === '' ||
                           (!window.location.pathname.includes('.html') && !isProductsPage);
        
        console.log('Is home page:', isHomePage);
        console.log('Current pathname:', window.location.pathname);
        
        if (isHomePage) {
            const carousel = document.querySelector('#productCarousel');
            const carouselTrack = document.querySelector('#productCarousel .carousel-track');
            console.log('Carousel element found:', !!carousel);
            console.log('Carousel track found:', !!carouselTrack);
            
            if (carousel && carouselTrack) {
                console.log('Loading featured products...');
                // Cargar productos destacados con un pequeño delay para asegurar que el DOM esté listo
                setTimeout(() => {
                    loadFeaturedProducts().catch(error => {
                        console.error('Error loading featured products:', error);
                        // Asegurar que el mensaje de error sea visible
                        const loadingMsg = carouselTrack.querySelector('.carousel-loading');
                        if (loadingMsg) {
                            loadingMsg.textContent = 'Error al cargar productos. Por favor, recarga la página.';
                            loadingMsg.style.color = '#ff4444';
                            loadingMsg.style.display = 'flex';
                            loadingMsg.style.position = 'relative';
                        }
                        // Mantener el carousel visible
                        carouselTrack.style.display = 'flex';
                        carouselTrack.style.visibility = 'visible';
                        carouselTrack.style.opacity = '1';
                        carouselTrack.style.minHeight = '200px';
                    });
                }, 100);
            } else {
                console.warn('Carousel elements not found');
                // Intentar encontrar el elemento por ID directo
                const directTrack = document.getElementById('carouselTrack');
                if (directTrack) {
                    console.log('Found carouselTrack by ID, loading products...');
                    setTimeout(() => {
                        loadFeaturedProducts().catch(error => {
                            console.error('Error loading featured products:', error);
                        });
                    }, 100);
                }
            }
        }
    } catch (error) {
        console.error('Error in initProductLoading:', error);
    }
}

// Cargar productos cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initProductLoading();
        // También inicializar filtros modernos si estamos en la página de productos
        if (document.getElementById('categoriesContainerModern')) {
            setTimeout(() => {
                initModernFilters();
            }, 200);
        }
    });
} else {
    initProductLoading();
    // También inicializar filtros modernos si estamos en la página de productos
    if (document.getElementById('categoriesContainerModern')) {
        setTimeout(() => {
            initModernFilters();
        }, 200);
    }
}

// ============================================
// SELLERS PAGE FUNCTIONALITY (TEMPORALMENTE DESHABILITADO)
// ============================================

/*
// Extraer información del seller desde URL
function extractSellerInfo(url) {
    if (!url) return null;
    
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        
        // Extraer seller ID o nombre desde diferentes plataformas
        let sellerId = null;
        let sellerName = null;
        let platform = null;
        
        if (hostname.includes('weidian.com')) {
            platform = 'Weidian';
            // Formato: https://weidian.com/item.html?itemID=XXXXX&sellerID=YYYYY
            sellerId = urlObj.searchParams.get('sellerID') || urlObj.searchParams.get('sellerId');
            // O intentar desde el path
            const pathMatch = url.match(/sellerId=(\d+)/i);
            if (pathMatch) sellerId = pathMatch[1];
        } else if (hostname.includes('taobao.com')) {
            platform = 'Taobao';
            // Formato: https://item.taobao.com/item.htm?id=XXXXX&seller_id=YYYYY
            sellerId = urlObj.searchParams.get('seller_id') || urlObj.searchParams.get('sellerId');
        } else if (hostname.includes('1688.com')) {
            platform = '1688';
            // Formato: https://detail.1688.com/offer/XXXXX.html
            sellerId = urlObj.searchParams.get('sellerId') || urlObj.searchParams.get('seller_id');
        }
        
        return {
            id: sellerId,
            name: sellerName || `Seller ${sellerId || 'Unknown'}`,
            platform: platform,
            url: url
        };
    } catch (e) {
        return null;
    }
}

// Agrupar productos por seller
function groupProductsBySeller(products) {
    const sellersMap = new Map();
    
    products.forEach(product => {
        if (!product.source_url) return;
        
        const sellerInfo = extractSellerInfo(product.source_url);
        if (!sellerInfo) return;
        
        const sellerKey = `${sellerInfo.platform}_${sellerInfo.id || 'unknown'}`;
        
        if (!sellersMap.has(sellerKey)) {
            sellersMap.set(sellerKey, {
                id: sellerKey,
                name: sellerInfo.name,
                platform: sellerInfo.platform,
                url: sellerInfo.url,
                products: [],
                categories: new Set(),
                quality: new Set(),
                totalProducts: 0
            });
        }
        
        const seller = sellersMap.get(sellerKey);
        seller.products.push(product);
        seller.totalProducts++;
        
        if (product.categoria) {
            seller.categories.add(product.categoria);
        }
        
        if (product.calidad) {
            seller.quality.add(product.calidad);
        }
    });
    
    // Convertir Sets a Arrays
    const sellers = Array.from(sellersMap.values()).map(seller => ({
        ...seller,
        categories: Array.from(seller.categories),
        quality: Array.from(seller.quality),
        // Calcular precio promedio
        avgPrice: seller.products.reduce((sum, p) => sum + (parseFloat(p.precio_cny) || 0), 0) / seller.products.length
    }));
    
    return sellers;
}

// Renderizar sellers en el grid
function renderSellers(sellers, categoryFilter = 'all') {
    const sellersGrid = document.getElementById('sellersGrid');
    if (!sellersGrid) return;
    
    // Filtrar por categoría si es necesario
    let filteredSellers = sellers;
    if (categoryFilter !== 'all') {
        filteredSellers = sellers.filter(seller => 
            seller.categories.some(cat => {
                const mappedCat = mapProductCategory({ categoria: cat });
                return mappedCat === categoryFilter;
            })
        );
    }
    
    if (filteredSellers.length === 0) {
        sellersGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--muted);">
                <p style="font-size: 1.25rem; margin-bottom: 0.5rem;">No se encontraron sellers</p>
                <p style="font-size: 0.875rem;">Intenta con otra categoría</p>
            </div>
        `;
        return;
    }
    
    const fragment = document.createDocumentFragment();
    
    filteredSellers.forEach(seller => {
        const sellerCard = document.createElement('div');
        sellerCard.className = 'seller-card';
        
        // Obtener primera imagen del seller (de sus productos)
        const firstProduct = seller.products[0];
        const sellerImage = firstProduct?.imagen_url || firstProduct?.imagen || '';
        
        // Mapear categorías para mostrar
        const displayCategories = seller.categories.slice(0, 3).map(cat => {
            const mapped = mapProductCategory({ categoria: cat });
            const categoryNames = {
                'calzado': 'Calzados',
                'ropa-superior': 'Ropa Superior',
                'ropa-inferior': 'Ropa Inferior',
                'accesorios': 'Accesorios',
                'conjuntos': 'Conjuntos'
            };
            return categoryNames[mapped] || cat;
        });
        
        sellerCard.innerHTML = `
            <div class="seller-header">
                <div class="seller-logo">
                    ${sellerImage ? `<img src="${sellerImage}" alt="${escapeHtml(seller.name)}" loading="lazy">` : '🏪'}
                </div>
                <div class="seller-info">
                    <h3 class="seller-name">${escapeHtml(seller.name)}</h3>
                    <div class="seller-platform">
                        <span>${seller.platform}</span>
                    </div>
                </div>
            </div>
            <div class="seller-body">
                <div class="seller-stats">
                    <div class="seller-stat">
                        <div class="seller-stat-value">${seller.totalProducts}</div>
                        <div class="seller-stat-label">Productos</div>
                    </div>
                    <div class="seller-stat">
                        <div class="seller-stat-value">${seller.categories.length}</div>
                        <div class="seller-stat-label">Categorías</div>
                    </div>
                </div>
            </div>
            <div class="seller-footer">
                <a href="productos.html?seller=${encodeURIComponent(seller.id)}" class="seller-btn">
                    Ver Productos
                </a>
                ${seller.url ? `
                    <a href="${seller.url}" target="_blank" rel="noopener noreferrer" class="seller-btn seller-btn-secondary">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                    </a>
                ` : ''}
            </div>
        `;
        
        fragment.appendChild(sellerCard);
    });
    
    sellersGrid.innerHTML = '';
    sellersGrid.appendChild(fragment);
}

// Cargar sellers desde la base de datos
async function loadSellers(categoryFilter = 'all') {
    const sellersGrid = document.getElementById('sellersGrid');
    if (!sellersGrid) return;
    
    sellersGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--muted);">
            Cargando sellers...
        </div>
    `;
    
    try {
        const headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json"
        };
        
        // Obtener todos los productos activos
        const query = `${SUPABASE_REST_URL}/products_clean?select=*&activo=eq.true`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const res = await secureSupabaseFetch(query, {
            headers: headers,
            signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) {
            throw new Error(`Error ${res.status}`);
        }
        
        const products = await res.json();
        
        // Agrupar productos por seller
        const sellers = groupProductsBySeller(products);
        
        // Ordenar por número de productos (más productos primero)
        sellers.sort((a, b) => b.totalProducts - a.totalProducts);
        
        // Renderizar sellers
        renderSellers(sellers, categoryFilter);
        
    } catch (error) {
        console.error('Error loading sellers:', error);
        sellersGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--muted);">
                <p style="font-size: 1.25rem; margin-bottom: 0.5rem; color: var(--error);">Error al cargar sellers</p>
                <p style="font-size: 0.875rem;">Por favor, intenta recargar la página</p>
            </div>
        `;
    }
}
*/

// Inicializar página de sellers (TEMPORALMENTE DESHABILITADO)
/*
function initSellersPage() {
    if (!window.location.pathname.includes('sellers.html')) return;
    
    // Cargar sellers iniciales
    loadSellers('all');
    
    // Agregar event listeners a los botones de categoría
    const categoryButtons = document.querySelectorAll('.seller-category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover active de todos
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // Agregar active al clickeado
            button.classList.add('active');
            
            // Obtener categoría y recargar
            const category = button.getAttribute('data-category');
            loadSellers(category);
        });
    });
}
*/

// Inicializar cuando el DOM esté listo (TEMPORALMENTE DESHABILITADO)
/*
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSellersPage);
} else {
    initSellersPage();
}
*/

// ============================================
// METEORS ANIMATION (Infiner template)
// ============================================
function initMeteors() {
    const meteorsContainer = document.getElementById('meteorsContainer');
    if (!meteorsContainer) return;
    
    // Reducir número de meteors para mejor rendimiento
    const numberOfMeteors = 5;
    
    for (let i = 0; i < numberOfMeteors; i++) {
        const meteor = document.createElement('span');
        meteor.className = 'meteor';
        
        const left = Math.floor(Math.random() * 120);
        const top = Math.floor(Math.random() * 20) - 30;
        const delay = Math.random() * 12;
        const duration = Math.floor(Math.random() * 4 + 3);
        
        meteor.style.left = left + '%';
        meteor.style.top = top + '%';
        meteor.style.animationDelay = delay + 's';
        meteor.style.animationDuration = duration + 's';
        
        meteorsContainer.appendChild(meteor);
    }
}

// Initialize meteors when DOM is ready
function initMeteorsOnReady() {
    if (document.getElementById('meteorsContainer')) {
        initMeteors();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMeteorsOnReady);
} else {
    initMeteorsOnReady();
}

// También intentar inicializar después de un pequeño delay por si acaso
setTimeout(initMeteorsOnReady, 100);

function buildFiltersFromURLParams(urlParams) {
    const filters = {};

    const search = urlParams.get('search');
    const category = urlParams.get('category');
    const quality = urlParams.get('quality');
    const brand = urlParams.get('brand');
    const sort = urlParams.get('sort');

    if (search && search.trim()) filters.search = search.trim();
    if (category && category.trim()) filters.category = category.trim();
    if (quality && quality.trim()) filters.quality = quality.trim();
    if (brand && brand.trim()) filters.brand = brand.trim();
    if (sort && sort.trim()) filters.sort = sort.trim();

    return filters;
}

function syncProductFilterUIFromURL(urlParams) {
    const search = urlParams.get('search');
    const category = urlParams.get('category');
    const quality = urlParams.get('quality');
    const brand = urlParams.get('brand');
    const sort = urlParams.get('sort');

    const searchInput = document.getElementById('productSearch');
    if (searchInput && search) {
        searchInput.value = search;
    }

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect && sort) {
        sortSelect.value = sort;
    }

    const qualityButtons = document.querySelectorAll('.quality-btn');
    if (qualityButtons.length) {
        qualityButtons.forEach(button => {
            const isActive = quality && button.getAttribute('data-quality') === quality;
            button.classList.toggle('active', !!isActive);
        });
    }

    const brandButtons = document.querySelectorAll('.brand-btn');
    if (brandButtons.length) {
        brandButtons.forEach(button => {
            const brandValue = button.getAttribute('data-brand') || '';
            button.classList.toggle('active', !!brand && brandValue === brand);
        });
    }

    if (category) {
        const categoryButtons = document.querySelectorAll('.category-btn-modern');
        if (categoryButtons.length) {
            categoryButtons.forEach(button => {
                const isActive = button.getAttribute('data-category') === category;
                button.classList.toggle('active', isActive);
                if (isActive) {
                    button.style.background = '#dc2626';
                    button.style.borderColor = '#dc2626';
                    button.style.color = '#ffffff';
                } else {
                    button.style.background = '';
                    button.style.borderColor = '';
                    button.style.color = '';
                }
            });
        }
    }
}

async function initModernFilters() {
    const container = document.getElementById('categoriesContainerModern');
    if (!container) return;

    try {
        const products = await getActiveCatalogProducts();
        if (!products.length) return;

        const categoryCounts = {};
        const categoryMap = {
            'all': 'Todos los Productos',
            'calzado': 'Zapatillas',
            'ropa-superior': 'Remeras',
            'ropa-inferior': 'Pantalones',
            'accesorios': 'Accesorios',
            'conjuntos': 'Conjuntos'
        };

        let totalCount = 0;
        products.forEach(product => {
            totalCount++;
            const mappedCategory = mapProductCategory(product);
            if (mappedCategory && mappedCategory !== 'all') {
                categoryCounts[mappedCategory] = (categoryCounts[mappedCategory] || 0) + 1;
            }
        });

        container.innerHTML = '';

        const allBtn = document.createElement('button');
        allBtn.className = 'category-btn-modern active';
        allBtn.setAttribute('data-category', 'all');
        allBtn.innerHTML = `Todos los Productos <span class="category-badge">${totalCount}</span>`;
        allBtn.style.background = '#dc2626';
        allBtn.style.border = 'none';
        allBtn.style.color = '#ffffff';
        allBtn.style.fontWeight = '600';
        allBtn.style.borderRadius = '20px';
        allBtn.style.padding = '0.5rem 1rem';
        container.appendChild(allBtn);

        const categories = ['calzado', 'ropa-superior', 'ropa-inferior', 'accesorios', 'conjuntos'];
        categories.forEach(cat => {
            const count = categoryCounts[cat] || 0;
            if (count > 0) {
                const btn = document.createElement('button');
                btn.className = 'category-btn-modern';
                btn.setAttribute('data-category', cat);
                btn.innerHTML = `${categoryMap[cat]} <span class="category-badge">${count}</span>`;
                btn.style.background = 'transparent';
                btn.style.border = 'none';
                btn.style.color = '';
                container.appendChild(btn);
            }
        });

        const modernButtons = container.querySelectorAll('.category-btn-modern');
        modernButtons.forEach(button => {
            button.addEventListener('click', () => {
                modernButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.style.background = '';
                    btn.style.borderColor = '';
                    btn.style.color = '';
                });

                button.classList.add('active');
                button.style.background = '#dc2626';
                button.style.borderColor = '#dc2626';
                button.style.color = '#ffffff';

                setTimeout(() => {
                    const filters = buildFiltersFromUI();
                    loadProductsPage(1, filters);
                }, 10);
            });
        });

        syncProductFilterUIFromURL(new URLSearchParams(window.location.search));
    } catch (error) {
        console.error('Error loading category filters:', error);
    }
}

async function initProductLoading() {
    try {
        const grid = document.querySelector('.products-grid') || document.getElementById('products-grid');
        const isProductsPage = window.location.pathname.includes('productos.html') ||
                              window.location.pathname.endsWith('productos.html') ||
                              window.location.href.includes('productos.html') ||
                              !!grid;

        if (isProductsPage && grid) {
            const urlParams = new URLSearchParams(window.location.search);
            const pageFromUrl = parseInt(urlParams.get('page')) || 1;
            const filtersFromURL = buildFiltersFromURLParams(urlParams);

            syncProductFilterUIFromURL(urlParams);
            await loadProductsPage(pageFromUrl, filtersFromURL);
        }

        const isHomePage = window.location.pathname.includes('index.html') ||
                           window.location.pathname.endsWith('/') ||
                           window.location.pathname === '' ||
                           (!window.location.pathname.includes('.html') && !isProductsPage);

        if (isHomePage) {
            const carousel = document.querySelector('#productCarousel');
            const carouselTrack = document.querySelector('#productCarousel .carousel-track');

            if (carousel && carouselTrack) {
                setTimeout(() => {
                    loadFeaturedProducts().catch(error => {
                        console.error('Error loading featured products:', error);
                        const loadingMsg = carouselTrack.querySelector('.carousel-loading');
                        if (loadingMsg) {
                            loadingMsg.textContent = 'Error al cargar productos. Por favor, recarga la pÃ¡gina.';
                            loadingMsg.style.color = '#ff4444';
                            loadingMsg.style.display = 'flex';
                            loadingMsg.style.position = 'relative';
                        }
                        carouselTrack.style.display = 'flex';
                        carouselTrack.style.visibility = 'visible';
                        carouselTrack.style.opacity = '1';
                        carouselTrack.style.minHeight = '200px';
                    });
                }, 100);
            }
        }
    } catch (error) {
        console.error('Error in initProductLoading:', error);
    }
}

