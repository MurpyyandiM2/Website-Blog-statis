/**
 * MURPYYANDI. - PORTFOLIO JAVASCRIPT
 * Professional Portfolio with Admin Panel
 */

// Admin password (in production, this should be server-side)
const ADMIN_PASSWORD = 'Siapa123apa@@1#';

// Data storage keys
const STORAGE_KEYS = {
    TASKS: 'murpyyandi_tasks',
    CERTIFICATES: 'murpyyandi_certificates',
    CV: 'murpyyandi_cv',
    THEME: 'theme',
    ADMIN_SESSION: 'admin_session'
};

// Initialize data storage with default values
function initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CERTIFICATES)) {
        localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CV)) {
        localStorage.setItem(STORAGE_KEYS.CV, JSON.stringify(null));
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize storage
    initStorage();
    
    // Initialize all functionality
    initNavigation();
    initScrollEffects();
    initTaskFilter();
    initSmoothScroll();
    initTypingEffect();
    initSkillBars();
    initParticleBackground();
    initThemeToggle();
    initBackToTop();
    initCounterAnimation();
    initAdminPanel();
    
    // Load data
    loadTasks();
    loadCertificates();
    updateStats();
});

/**
 * Navigation functionality
 */
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Toggle mobile menu
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

/**
 * Scroll effects - Navbar and active section highlighting
 */
function initScrollEffects() {
    const navbar = document.querySelector('.navbar');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', function() {
        // Navbar background effect
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.boxShadow = 'none';
        }
        
        // Active section highlighting
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}

/**
 * Typing Effect for Hero Title
 */
function initTypingEffect() {
    const textElement = document.getElementById('typing-text');
    const text = "From Code to Creation.";
    let index = 0;
    
    function type() {
        if (index < text.length) {
            textElement.textContent += text.charAt(index);
            index++;
            setTimeout(type, 100);
        }
    }
    
    // Start typing after a short delay
    setTimeout(type, 500);
}

/**
 * Skill Progress Bars Animation
 */
function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.getAttribute('data-width');
                entry.target.style.width = width + '%';
            }
        });
    }, { threshold: 0.5 });
    
    skillBars.forEach(bar => observer.observe(bar));
}

/**
 * Counter Animation for Stats
 */
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-count'));
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 30);
}

/**
 * Particle Background Animation
 */
function initParticleBackground() {
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Wrap around screen
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(79, 70, 229, ${this.opacity})`;
            ctx.fill();
        }
    }
    
    // Create particles
    const particles = [];
    const particleCount = Math.min(50, Math.floor((canvas.width * canvas.height) / 20000));
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // Draw connections between particles
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(79, 70, 229, ${0.1 * (1 - distance / 150)})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        drawConnections();
        requestAnimationFrame(animate);
    }
    
    animate();
}

/**
 * Theme Toggle
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');
    const body = document.body;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme === 'light') {
        body.classList.add('light-theme');
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
    
    themeToggle.addEventListener('click', function() {
        body.classList.toggle('light-theme');
        
        if (body.classList.contains('light-theme')) {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            localStorage.setItem(STORAGE_KEYS.THEME, 'light');
        } else {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
        }
    });
}

/**
 * Back to Top Button
 */
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * Task filter functionality
 */
function initTaskFilter() {
    const filterBtns = document.querySelectorAll('.tasks-filter .filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            filterTasks(filter);
        });
    });
}

function filterTasks(filter) {
    const taskCards = document.querySelectorAll('.task-card');
    
    taskCards.forEach(card => {
        const category = card.getAttribute('data-category');
        
        if (filter === 'all' || category === filter) {
            card.style.display = 'flex';
            card.style.animation = 'fadeInUp 0.5s ease forwards';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Show notification toast
 */
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    const icon = notification.querySelector('i');
    
    notificationText.textContent = message;
    
    // Update icon based on type
    icon.className = '';
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
        notification.style.borderLeftColor = 'var(--success)';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
        notification.style.borderLeftColor = 'var(--error)';
    } else {
        icon.className = 'fas fa-info-circle';
        notification.style.borderLeftColor = 'var(--primary)';
    }
    
    notification.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

/**
 * Contact Form Handler
 */
function handleContactSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const name = formData.get('name');
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading"></span> Mengirim...';
    submitBtn.disabled = true;
    
    // Simulate form submission
    setTimeout(() => {
        showNotification(`Terima kasih ${name}! Pesan Anda telah terkirim.`, 'success');
        form.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

/**
 * Admin Panel Functions
 */
function initAdminPanel() {
    const adminToggle = document.getElementById('adminToggle');
    
    adminToggle.addEventListener('click', function() {
        openAdminModal();
    });
    
    // Check if admin is already logged in
    if (localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true') {
        showAdminDashboard();
    }
}

function openAdminModal() {
    const modal = document.getElementById('admin-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Load admin lists
    loadAdminTasksList();
    loadAdminCertsList();
    updateCVStatus();
}

function closeAdminModal() {
    const modal = document.getElementById('admin-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function loginAdmin() {
    const password = document.getElementById('adminPassword').value;
    
    if (password === ADMIN_PASSWORD) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
        showNotification('Login berhasil!', 'success');
        showAdminDashboard();
    } else {
        showNotification('Password salah!', 'error');
    }
}

function logoutAdmin() {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    document.getElementById('admin-login').style.display = 'block';
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('adminPassword').value = '';
    showNotification('Logout berhasil!', 'success');
}

function showAdminDashboard() {
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    loadAdminTasksList();
    loadAdminCertsList();
    updateCVStatus();
}

function switchAdminTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');
    document.getElementById('admin-' + tab).style.display = 'block';
}

/**
 * Task Management Functions
 */
function loadTasks() {
    const tasksGrid = document.getElementById('tasksGrid');
    const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS)) || [];
    
    if (tasks.length === 0) {
        tasksGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-tasks"></i>
                <h4>Belum Ada Tugas</h4>
                <p>Tugas akan ditampilkan di sini setelah ditambahkan oleh admin.</p>
            </div>
        `;
        return;
    }
    
    tasksGrid.innerHTML = tasks.map(task => createTaskCard(task)).join('');
}

function createTaskCard(task) {
    const statusClass = task.status;
    const statusText = {
        'completed': 'Selesai',
        'in-progress': 'Dalam Proses',
        'pending': 'Menunggu'
    }[task.status];
    
    const statusIcon = {
        'completed': 'fa-check-circle',
        'in-progress': 'fa-clock',
        'pending': 'fa-hourglass-start'
    }[task.status];
    
    return `
        <article class="task-card ${statusClass}" data-category="${task.category}" data-id="${task.id}">
            <div class="task-header">
                <span class="task-course">${task.course}</span>
                <span class="task-date">${task.date}</span>
            </div>
            <h3 class="task-title">${task.title}</h3>
            <p class="task-description">${task.description}</p>
            <div class="task-footer">
                <span class="task-status ${statusClass}">
                    <i class="fas ${statusIcon}"></i> ${statusText}
                </span>
                <button class="btn btn-small" onclick="showTaskDetail('${task.id}')">
                    <i class="fas fa-eye"></i> Rincian
                </button>
            </div>
        </article>
    `;
}

function handleAddTask(event) {
    event.preventDefault();
    
    const title = document.getElementById('taskTitle').value;
    const course = document.getElementById('taskCourse').value;
    const category = document.getElementById('taskCategory').value;
    const status = document.getElementById('taskStatus').value;
    const description = document.getElementById('taskDescription').value;
    const pdfFile = document.getElementById('taskPdfFile').files[0];
    const pptFile = document.getElementById('taskPptFile').files[0];
    
    const task = {
        id: 'task_' + Date.now(),
        title,
        course,
        category,
        status,
        description,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        pdfFile: null,
        pptFile: null
    };
    
    // Handle file uploads
    const promises = [];
    
    if (pdfFile) {
        promises.push(readFileAsDataURL(pdfFile).then(data => {
            task.pdfFile = { name: pdfFile.name, data: data };
        }));
    }
    
    if (pptFile) {
        promises.push(readFileAsDataURL(pptFile).then(data => {
            task.pptFile = { name: pptFile.name, data: data };
        }));
    }
    
    Promise.all(promises).then(() => {
        const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS)) || [];
        tasks.push(task);
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        
        // Reset form and reload
        document.getElementById('addTaskForm').reset();
        loadTasks();
        loadAdminTasksList();
        updateStats();
        showNotification('Tugas berhasil ditambahkan!', 'success');
    });
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function deleteTask(taskId) {
    if (!confirm('Apakah Anda yakin ingin menghapus tugas ini?')) return;
    
    const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS)) || [];
    const filteredTasks = tasks.filter(t => t.id !== taskId);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(filteredTasks));
    
    loadTasks();
    loadAdminTasksList();
    updateStats();
    showNotification('Tugas berhasil dihapus!', 'success');
}

function loadAdminTasksList() {
    const list = document.getElementById('adminTasksList');
    const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS)) || [];
    
    if (tasks.length === 0) {
        list.innerHTML = '<div class="admin-list-item"><p style="color: var(--text-muted);">Belum ada tugas</p></div>';
        return;
    }
    
    list.innerHTML = tasks.map(task => `
        <div class="admin-list-item">
            <div class="admin-list-item-info">
                <h5>${task.title}</h5>
                <p>${task.course} • ${task.date}</p>
            </div>
            <div class="admin-list-item-actions">
                <button class="btn-icon" onclick="deleteTask('${task.id}')" title="Hapus">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function showTaskDetail(taskId) {
    const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS)) || [];
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
        showNotification('Tugas tidak ditemukan!', 'error');
        return;
    }
    
    const modal = document.getElementById('task-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = task.title;
    
    let fileLinksHtml = '';
    if (task.pdfFile || task.pptFile) {
        fileLinksHtml = '<h4>File Tugas</h4><div class="file-links">';
        if (task.pdfFile) {
            fileLinksHtml += `
                <a href="${task.pdfFile.data}" download="${task.pdfFile.name}" class="file-link">
                    <i class="fas fa-file-pdf"></i> Laporan PDF
                </a>
            `;
        }
        if (task.pptFile) {
            fileLinksHtml += `
                <a href="${task.pptFile.data}" download="${task.pptFile.name}" class="file-link">
                    <i class="fas fa-file-powerpoint"></i> Presentasi PPT
                </a>
            `;
        }
        fileLinksHtml += '</div>';
    }
    
    modalBody.innerHTML = `
        <div class="task-detail-content">
            <h4>Deskripsi Tugas</h4>
            <p>${task.description}</p>
            
            <h4>Informasi</h4>
            <ul>
                <li><strong>Mata Kuliah:</strong> ${task.course}</li>
                <li><strong>Kategori:</strong> ${task.category}</li>
                <li><strong>Status:</strong> <span class="status-badge ${task.status}">${
                    task.status === 'completed' ? 'Selesai' : 
                    task.status === 'in-progress' ? 'Dalam Proses' : 'Menunggu'
                }</span></li>
                <li><strong>Tanggal:</strong> ${task.date}</li>
            </ul>
            
            ${fileLinksHtml}
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('task-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Certificate Management Functions
 */
function loadCertificates() {
    const grid = document.getElementById('certificatesGrid');
    const certificates = JSON.parse(localStorage.getItem(STORAGE_KEYS.CERTIFICATES)) || [];
    
    if (certificates.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-certificate"></i>
                <h4>Belum Ada Sertifikat</h4>
                <p>Sertifikat akan ditampilkan di sini setelah ditambahkan oleh admin.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = certificates.map(cert => createCertificateCard(cert)).join('');
}

function createCertificateCard(cert) {
    return `
        <div class="certificate-card" onclick="showCertificateDetail('${cert.id}')">
            <div class="certificate-icon">
                <i class="fas ${cert.icon}"></i>
            </div>
            <h3 class="certificate-title">${cert.title}</h3>
            <p class="certificate-issuer">${cert.issuer}</p>
            <span class="certificate-date">${cert.year}</span>
            <button class="certificate-view-btn">
                <i class="fas fa-eye"></i> Lihat Sertifikat
            </button>
        </div>
    `;
}

function handleAddCertificate(event) {
    event.preventDefault();
    
    const title = document.getElementById('certTitle').value;
    const issuer = document.getElementById('certIssuer').value;
    const year = document.getElementById('certYear').value;
    const icon = document.getElementById('certIcon').value;
    const file = document.getElementById('certFile').files[0];
    
    const certificate = {
        id: 'cert_' + Date.now(),
        title,
        issuer,
        year,
        icon,
        file: null
    };
    
    if (file) {
        readFileAsDataURL(file).then(data => {
            certificate.file = { name: file.name, data: data, type: file.type };
            saveCertificate(certificate);
        });
    } else {
        saveCertificate(certificate);
    }
}

function saveCertificate(certificate) {
    const certificates = JSON.parse(localStorage.getItem(STORAGE_KEYS.CERTIFICATES)) || [];
    certificates.push(certificate);
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certificates));
    
    document.getElementById('addCertificateForm').reset();
    loadCertificates();
    loadAdminCertsList();
    updateStats();
    showNotification('Sertifikat berhasil ditambahkan!', 'success');
}

function deleteCertificate(certId) {
    if (!confirm('Apakah Anda yakin ingin menghapus sertifikat ini?')) return;
    
    const certificates = JSON.parse(localStorage.getItem(STORAGE_KEYS.CERTIFICATES)) || [];
    const filtered = certificates.filter(c => c.id !== certId);
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(filtered));
    
    loadCertificates();
    loadAdminCertsList();
    updateStats();
    showNotification('Sertifikat berhasil dihapus!', 'success');
}

function loadAdminCertsList() {
    const list = document.getElementById('adminCertsList');
    const certificates = JSON.parse(localStorage.getItem(STORAGE_KEYS.CERTIFICATES)) || [];
    
    if (certificates.length === 0) {
        list.innerHTML = '<div class="admin-list-item"><p style="color: var(--text-muted);">Belum ada sertifikat</p></div>';
        return;
    }
    
    list.innerHTML = certificates.map(cert => `
        <div class="admin-list-item">
            <div class="admin-list-item-info">
                <h5>${cert.title}</h5>
                <p>${cert.issuer} • ${cert.year}</p>
            </div>
            <div class="admin-list-item-actions">
                <button class="btn-icon" onclick="deleteCertificate('${cert.id}')" title="Hapus">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function showCertificateDetail(certId) {
    const certificates = JSON.parse(localStorage.getItem(STORAGE_KEYS.CERTIFICATES)) || [];
    const cert = certificates.find(c => c.id === certId);
    
    if (!cert) {
        showNotification('Sertifikat tidak ditemukan!', 'error');
        return;
    }
    
    const modal = document.getElementById('certificate-modal');
    const modalTitle = document.getElementById('cert-modal-title');
    const modalBody = document.getElementById('cert-modal-body');
    
    modalTitle.textContent = cert.title;
    
    let filePreview = '';
    if (cert.file) {
        if (cert.file.type.startsWith('image/')) {
            filePreview = `<img src="${cert.file.data}" alt="${cert.title}" style="max-width: 100%; border-radius: var(--radius-sm);">`;
        } else {
            filePreview = `
                <div class="certificate-preview-icon">
                    <i class="fas fa-file-pdf"></i>
                </div>
                <p>File: ${cert.file.name}</p>
            `;
        }
    } else {
        filePreview = `
            <div class="certificate-preview-icon">
                <i class="fas ${cert.icon}"></i>
            </div>
            <p>Sertifikat ${cert.title}</p>
        `;
    }
    
    modalBody.innerHTML = `
        <div class="certificate-preview">
            ${filePreview}
            <h4>${cert.title}</h4>
            <p>Diterbitkan oleh: ${cert.issuer}</p>
            <p>Tahun: ${cert.year}</p>
        </div>
        <div class="certificate-actions">
            ${cert.file ? `
                <a href="${cert.file.data}" download="${cert.file.name}" class="btn btn-primary">
                    <i class="fas fa-download"></i> Download Sertifikat
                </a>
            ` : ''}
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCertificateModal() {
    const modal = document.getElementById('certificate-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * CV Management Functions
 */
function handleUploadCV(event) {
    event.preventDefault();
    
    const file = document.getElementById('cvFile').files[0];
    
    if (!file) {
        showNotification('Pilih file CV terlebih dahulu!', 'error');
        return;
    }
    
    readFileAsDataURL(file).then(data => {
        const cvData = {
            name: file.name,
            data: data,
            uploadedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.CV, JSON.stringify(cvData));
        
        document.getElementById('uploadCvForm').reset();
        updateCVStatus();
        initCVDownload();
        showNotification('CV berhasil diupload!', 'success');
    });
}

function updateCVStatus() {
    const statusDiv = document.getElementById('cvStatus');
    const cv = JSON.parse(localStorage.getItem(STORAGE_KEYS.CV));
    
    if (cv) {
        statusDiv.innerHTML = `
            <div style="padding: 16px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-sm);">
                <i class="fas fa-check-circle" style="color: var(--success);"></i>
                <span style="color: var(--success); margin-left: 8px;">CV sudah diupload: ${cv.name}</span>
            </div>
        `;
    } else {
        statusDiv.innerHTML = `
            <div style="padding: 16px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-sm);">
                <i class="fas fa-exclamation-triangle" style="color: var(--warning);"></i>
                <span style="color: var(--warning); margin-left: 8px;">CV belum diupload</span>
            </div>
        `;
    }
}

function initCVDownload() {
    const downloadBtn = document.getElementById('downloadCVBtn');
    
    downloadBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        const cv = JSON.parse(localStorage.getItem(STORAGE_KEYS.CV));
        
        if (cv && cv.data) {
            const link = document.createElement('a');
            link.href = cv.data;
            link.download = cv.name || 'CV_Murpyyandi_Muslih.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showNotification('CV sedang didownload!', 'success');
        } else {
            showNotification('CV belum tersedia. Silakan upload CV melalui Admin Panel.', 'error');
        }
    });
}

/**
 * Update Statistics
 */
function updateStats() {
    const tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS)) || [];
    const certificates = JSON.parse(localStorage.getItem(STORAGE_KEYS.CERTIFICATES)) || [];
    
    const taskCountEl = document.getElementById('taskCount');
    const certCountEl = document.getElementById('certCount');
    
    if (taskCountEl) {
        taskCountEl.textContent = tasks.length;
        taskCountEl.setAttribute('data-count', tasks.length);
    }
    
    if (certCountEl) {
        certCountEl.textContent = certificates.length;
        certCountEl.setAttribute('data-count', certificates.length);
    }
}

// Close modals when clicking outside
window.addEventListener('click', function(e) {
    const taskModal = document.getElementById('task-modal');
    const certModal = document.getElementById('certificate-modal');
    const adminModal = document.getElementById('admin-modal');
    
    if (e.target === taskModal) {
        closeModal();
    }
    if (e.target === certModal) {
        closeCertificateModal();
    }
    if (e.target === adminModal) {
        closeAdminModal();
    }
});

// Close modals with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
        closeCertificateModal();
        closeAdminModal();
    }
});

// Initialize CV download on page load
document.addEventListener('DOMContentLoaded', function() {
    initCVDownload();
});
