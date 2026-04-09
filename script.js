/**
 * MURPYYANDI - PORTFOLIO JAVASCRIPT
 * Professional Portfolio dengan Firebase (Firestore + Storage)
 * Real-time sync, offline support, file storage
 * 
 * UPDATED: Fixed CORS & Upload Issues + 🎬 Video Support
 */

// ============================================
// STORAGE KEYS (untuk local cache & settings)
// ============================================
const STORAGE_KEYS = {
    THEME: 'theme',
    ADMIN_SESSION: 'admin_session',
    OFFLINE_QUEUE: 'offline_queue'
};

// Admin password (untuk panel admin)
const ADMIN_PASSWORD = 'Siapa123apa@@1#';

// PDF.js variables
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let scale = 1.5;
let currentPdfData = null;
let currentPdfName = null;

// 🎬 Video variables
let currentVideoUrl = null;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

// Data cache lokal untuk UI
let appData = {
    tasks: [],
    certificates: [],
    cv: null
};

// Unsubscribe functions untuk real-time listeners
let unsubscribers = [];

// ============================================
// FIREBASE SERVICE
// ============================================
const FirebaseService = {
    // Inisialisasi dan enable offline
    init: async () => {
        try {
            await FirebaseHelper.enableOffline();
            console.log('✅ Offline persistence enabled');
        } catch (error) {
            console.warn('⚠️ Offline persistence not enabled:', error);
        }

        // Setup auth anonim untuk security rules
        try {
            if (typeof auth !== 'undefined') {
                await auth.signInAnonymously();
                console.log('✅ Signed in anonymously');
            }
        } catch (error) {
            console.log('ℹ️ Auth error (non-critical):', error.message);
        }
    },

    // Test Storage Connection
    testStorageConnection: async () => {
        try {
            console.log('🧪 Testing Storage connection...');
            const testRef = storage.ref('test/connection.txt');
            await testRef.putString('test-' + Date.now());
            console.log('✅ Storage connection OK');
            return true;
        } catch (error) {
            console.error('❌ Storage connection failed:', error);
            if (error.code === 'storage/unauthorized') {
                showNotification('Storage unauthorized. Periksa Storage Rules!', 'error');
            } else if (error.code === 'storage/cors-error') {
                showNotification('CORS error. Periksa CORS configuration!', 'error');
            }
            return false;
        }
    },

    // Real-time listener untuk Tasks
    subscribeTasks: (callback) => {
        if (!db) {
            console.error('❌ Firestore not initialized');
            return null;
        }

        const unsub = db.collection(COLLECTIONS.TASKS)
            .orderBy('createdAt', 'desc')
            .onSnapshot((snapshot) => {
                const tasks = [];
                snapshot.forEach(doc => {
                    tasks.push({ id: doc.id, ...doc.data() });
                });
                appData.tasks = tasks;
                callback(tasks);
            }, (error) => {
                console.error('Tasks listener error:', error);
                const cached = localStorage.getItem('cached_tasks');
                if (cached) {
                    appData.tasks = JSON.parse(cached);
                    callback(appData.tasks);
                }
            });
        unsubscribers.push(unsub);
        return unsub;
    },

    // Real-time listener untuk Certificates
    subscribeCertificates: (callback) => {
        if (!db) {
            console.error('❌ Firestore not initialized');
            return null;
        }

        const unsub = db.collection(COLLECTIONS.CERTIFICATES)
            .orderBy('year', 'desc')
            .onSnapshot((snapshot) => {
                const certs = [];
                snapshot.forEach(doc => {
                    certs.push({ id: doc.id, ...doc.data() });
                });
                appData.certificates = certs;
                callback(certs);
            }, (error) => {
                console.error('Certificates listener error:', error);
                const cached = localStorage.getItem('cached_certificates');
                if (cached) {
                    appData.certificates = JSON.parse(cached);
                    callback(appData.certificates);
                }
            });
        unsubscribers.push(unsub);
        return unsub;
    },

    // One-time fetch untuk CV
    fetchCV: async () => {
        try {
            const doc = await db.collection(COLLECTIONS.CV).doc('main').get();
            if (doc.exists) {
                appData.cv = doc.data();
                return appData.cv;
            }
            return null;
        } catch (error) {
            console.error('CV fetch error:', error);
            const cached = localStorage.getItem('cached_cv');
            return cached ? JSON.parse(cached) : null;
        }
    },

    // CRUD Operations
    // Add Task
    addTask: async (taskData, files) => {
        try {
            showNotification('📤 Mengupload tugas...', 'info');
            
            let pdfFile = null;
            let pptFile = null;
            let videoFile = null;
            
            if (files.pdf) {
                console.log('Uploading PDF:', files.pdf.name);
                pdfFile = await FirebaseHelper.uploadFile(files.pdf, 'tasks/pdfs');
                console.log('PDF uploaded:', pdfFile.url);
            }
            
            if (files.ppt) {
                console.log('Uploading PPT:', files.ppt.name);
                pptFile = await FirebaseHelper.uploadFile(files.ppt, 'tasks/ppts');
                console.log('PPT uploaded:', pptFile.url);
            }

            // 🎬 Upload Video
            if (files.video) {
                if (files.video.size > MAX_VIDEO_SIZE) throw new Error('Ukuran video melebihi batas 100MB');
                console.log('Uploading Video:', files.video.name);
                showNotification('📤 Mengupload video...', 'info');
                videoFile = await FirebaseHelper.uploadFile(files.video, 'tasks/videos');
                console.log('Video uploaded:', videoFile.url);
            }

            // Save ke Firestore
            const taskRef = await db.collection(COLLECTIONS.TASKS).add({
                ...taskData,
                pdfFile,
                pptFile,
                videoFile,
                createdAt: FirebaseHelper.timestamp(),
                updatedAt: FirebaseHelper.timestamp()
            });
            
            showNotification('✅ Tugas berhasil ditambahkan!', 'success');
            return taskRef.id;
            
        } catch (error) {
            console.error('❌ Add task error:', error);
            let errorMsg = 'Gagal menambahkan tugas';
            
            if (error.code === 'storage/unauthorized') {
                errorMsg = 'Storage unauthorized. Periksa Storage Rules!';
            } else if (error.message.includes('CORS')) {
                errorMsg = 'CORS error. Periksa CORS configuration!';
            } else {
                errorMsg += ': ' + error.message;
            }
            
            showNotification(errorMsg, 'error');
            throw error;
        }
    },

    // Update Task
    updateTask: async (taskId, updates, files) => {
        try {
            const updateData = {
                ...updates,
                updatedAt: FirebaseHelper.timestamp()
            };

            if (files && files.pdf) {
                const oldTask = appData.tasks.find(t => t.id === taskId);
                if (oldTask?.pdfFile?.path) await FirebaseHelper.deleteFile(oldTask.pdfFile.path);
                updateData.pdfFile = await FirebaseHelper.uploadFile(files.pdf, 'tasks/pdfs');
            }
            
            if (files && files.ppt) {
                const oldTask = appData.tasks.find(t => t.id === taskId);
                if (oldTask?.pptFile?.path) await FirebaseHelper.deleteFile(oldTask.pptFile.path);
                updateData.pptFile = await FirebaseHelper.uploadFile(files.ppt, 'tasks/ppts');
            }

            if (files && files.video) {
                const oldTask = appData.tasks.find(t => t.id === taskId);
                if (oldTask?.videoFile?.path) await FirebaseHelper.deleteFile(oldTask.videoFile.path);
                updateData.videoFile = await FirebaseHelper.uploadFile(files.video, 'tasks/videos');
            }

            await db.collection(COLLECTIONS.TASKS).doc(taskId).update(updateData);
            showNotification('✅ Tugas berhasil diupdate!', 'success');
        } catch (error) {
            console.error('❌ Update task error:', error);
            showNotification('Gagal mengupdate tugas: ' + error.message, 'error');
            throw error;
        }
    },

    // Delete Task
    deleteTask: async (taskId) => {
        if (!confirm('Apakah Anda yakin ingin menghapus tugas ini?')) return false;
        
        try {
            const task = appData.tasks.find(t => t.id === taskId);
            if (task?.pdfFile?.path) await FirebaseHelper.deleteFile(task.pdfFile.path);
            if (task?.pptFile?.path) await FirebaseHelper.deleteFile(task.pptFile.path);
            if (task?.videoFile?.path) await FirebaseHelper.deleteFile(task.videoFile.path);
            
            await db.collection(COLLECTIONS.TASKS).doc(taskId).delete();
            showNotification('✅ Tugas berhasil dihapus!', 'success');
            return true;
        } catch (error) {
            console.error('❌ Delete task error:', error);
            showNotification('Gagal menghapus tugas: ' + error.message, 'error');
            throw error;
        }
    },

    // Add Certificate
    addCertificate: async (certData, file) => {
        try {
            showNotification('📤 Mengupload sertifikat...', 'info');
            
            let certFile = null;
            if (file) {
                const folder = file.type.startsWith('image/') ? 'certificates/images' : 'certificates/docs';
                certFile = await FirebaseHelper.uploadFile(file, folder);
            }

            const certRef = await db.collection(COLLECTIONS.CERTIFICATES).add({
                ...certData,
                file: certFile,
                createdAt: FirebaseHelper.timestamp(),
                updatedAt: FirebaseHelper.timestamp()
            });
            
            showNotification('✅ Sertifikat berhasil ditambahkan!', 'success');
            return certRef.id;
        } catch (error) {
            console.error('❌ Add certificate error:', error);
            showNotification('Gagal menambahkan sertifikat: ' + error.message, 'error');
            throw error;
        }
    },

    // Delete Certificate
    deleteCertificate: async (certId) => {
        if (!confirm('Apakah Anda yakin ingin menghapus sertifikat ini?')) return false;
        
        try {
            const cert = appData.certificates.find(c => c.id === certId);
            if (cert?.file?.path) await FirebaseHelper.deleteFile(cert.file.path);
            
            await db.collection(COLLECTIONS.CERTIFICATES).doc(certId).delete();
            showNotification('✅ Sertifikat berhasil dihapus!', 'success');
            return true;
        } catch (error) {
            console.error('❌ Delete certificate error:', error);
            showNotification('Gagal menghapus sertifikat: ' + error.message, 'error');
            throw error;
        }
    },

    // Upload CV
    uploadCV: async (file) => {
        try {
            showNotification('📤 Mengupload CV...', 'info');
            
            const oldCV = appData.cv;
            if (oldCV?.file?.path) {
                await FirebaseHelper.deleteFile(oldCV.file.path);
            }
            
            const cvFile = await FirebaseHelper.uploadFile(file, 'cv');
            
            await db.collection(COLLECTIONS.CV).doc('main').set({
                file: cvFile,
                uploadedAt: FirebaseHelper.timestamp(),
                name: file.name
            });
            
            appData.cv = { file: cvFile, name: file.name };
            showNotification('✅ CV berhasil diupload!', 'success');
            return true;
        } catch (error) {
            console.error('❌ Upload CV error:', error);
            showNotification('Gagal mengupload CV: ' + error.message, 'error');
            throw error;
        }
    },

    // Cache ke localStorage untuk offline
    cacheData: () => {
        try {
            localStorage.setItem('cached_tasks', JSON.stringify(appData.tasks));
            localStorage.setItem('cached_certificates', JSON.stringify(appData.certificates));
            localStorage.setItem('cached_cv', JSON.stringify(appData.cv));
            localStorage.setItem('last_sync', new Date().toISOString());
        } catch (error) {
            console.warn('⚠️ Cache error:', error);
        }
    }
};

// ============================================
// INIT & EVENT LISTENERS
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    
    // Init PDF.js
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    // Init Firebase
    try {
        await FirebaseService.init();
        showNotification('🔗 Terhubung ke database', 'info');
    } catch (error) {
        console.error('Firebase init error:', error);
        showNotification('⚠️ Mode offline - menggunakan data tersimpan', 'warning');
    }

    // Test Storage Connection
    await FirebaseService.testStorageConnection();

    // Setup real-time listeners
    setupRealtimeListeners();

    // Load CV
    await FirebaseService.fetchCV();

    // Init UI
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
    initCVDownload();

    // Cache data periodically
    setInterval(() => FirebaseService.cacheData(), 30000); // Setiap 30 detik

    // Update connection status
    window.addEventListener('online', () => {
        showNotification('🟢 Koneksi online', 'success');
    });
    
    window.addEventListener('offline', () => {
        showNotification('🟡 Mode offline - perubahan akan tersimpan nanti', 'warning');
    });
});

function setupRealtimeListeners() {
    FirebaseService.subscribeTasks((tasks) => {
        renderTasks(tasks);
        updateStats();
        FirebaseService.cacheData();
    });

    FirebaseService.subscribeCertificates((certs) => {
        renderCertificates(certs);
        updateStats();
        FirebaseService.cacheData();
    });
}

// ============================================
// RENDER FUNCTIONS
// ============================================
function renderTasks(tasks) {
    const tasksGrid = document.getElementById('tasksGrid');
    if (!tasksGrid) return;
    
    if (!tasks || tasks.length === 0) {
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

function renderCertificates(certificates) {
    const grid = document.getElementById('certificatesGrid');
    if (!grid) return;
    
    if (!certificates || certificates.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-certificate"></i>
                <h4>Belum Ada Sertifikat</h4>
                <p>Sertifikat akan ditampilkan di sini setelah ditambahkan oleh admin.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = certificates.map(cert => `
        <div class="certificate-card" onclick="showCertificateDetail('${cert.id}')">
            <div class="certificate-icon">
                <i class="fas ${cert.icon || 'fa-certificate'}"></i>
            </div>
            <h3>${cert.title}</h3>
            <p>${cert.issuer}</p>
            <span class="certificate-year">${cert.year}</span>
        </div>
    `).join('');
}

// ============================================
// FORM HANDLERS
// ============================================
async function handleAddTask(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
    
    try {
        const taskData = {
            title: document.getElementById('taskTitle').value,
            course: document.getElementById('taskCourse').value,
            category: document.getElementById('taskCategory').value,
            status: document.getElementById('taskStatus').value,
            description: document.getElementById('taskDescription').value,
            date: new Date().toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
            })
        };

        const files = {
            pdf: document.getElementById('taskPdfFile').files[0] || null,
            ppt: document.getElementById('taskPptFile').files[0] || null,
            video: document.getElementById('taskVideoFile')?.files[0] || null // 🎬 Video
        };

        await FirebaseService.addTask(taskData, files);
        
        document.getElementById('addTaskForm').reset();
        loadAdminTasksList();
        
    } catch (error) {
        console.error('❌ handleAddTask error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Tambah Tugas';
    }
}

async function handleAddCertificate(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
    
    try {
        const certData = {
            title: document.getElementById('certTitle').value,
            issuer: document.getElementById('certIssuer').value,
            year: parseInt(document.getElementById('certYear').value),
            icon: document.getElementById('certIcon').value
        };

        const file = document.getElementById('certFile').files[0] || null;
        await FirebaseService.addCertificate(certData, file);
        
        document.getElementById('addCertificateForm').reset();
        loadAdminCertsList();
        
    } catch (error) {
        console.error('❌ handleAddCertificate error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Tambah Sertifikat';
    }
}

async function handleUploadCV(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengupload...';
    
    try {
        const file = document.getElementById('cvFile').files[0];
        
        if (!file) {
            showNotification('⚠️ Pilih file CV terlebih dahulu!', 'error');
            return;
        }
        
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];
 
        if (!allowedTypes.includes(file.type)) {
            showNotification('⚠️ Format file tidak didukung! Gunakan PDF, DOC, DOCX, XLS, XLSX, PPT, atau PPTX', 'error');
            return;
        }

        await FirebaseService.uploadCV(file);
        updateCVStatus();
        document.getElementById('uploadCvForm').reset();
        
    } catch (error) {
        console.error('❌ handleUploadCV error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-upload"></i> Upload CV';
    }
}

// ============================================
// DELETE FUNCTIONS
// ============================================
async function deleteTask(taskId) {
    try {
        const success = await FirebaseService.deleteTask(taskId);
        if (success) loadAdminTasksList();
    } catch (error) {
        console.error('❌ deleteTask error:', error);
    }
}

async function deleteCertificate(certId) {
    try {
        const success = await FirebaseService.deleteCertificate(certId);
        if (success) loadAdminCertsList();
    } catch (error) {
        console.error('❌ deleteCertificate error:', error);
    }
}

// ============================================
// UI HELPERS
// ============================================
function createTaskCard(task) {
    const statusClass = task.status || 'pending';
    const statusText = {
        'completed': 'Selesai',
        'in-progress': 'Dalam Proses',
        'pending': 'Menunggu'
    }[statusClass] || 'Menunggu';
    
    const statusIcon = {
        'completed': 'fa-check-circle',
        'in-progress': 'fa-clock',
        'pending': 'fa-hourglass-start'
    }[statusClass] || 'fa-hourglass-start';
    
    let dateStr = task.date;
    if (task.createdAt && task.createdAt.toDate) {
        dateStr = task.createdAt.toDate().toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    }
    
    return `
        <article class="task-card ${statusClass}" data-category="${task.category || 'other'}" data-id="${task.id}">
            <div class="task-header">
                <span class="task-course">${task.course || '-'}</span>
                <span class="task-date">${dateStr}</span>
            </div>
            <h3 class="task-title">${task.title || 'Untitled'}</h3>
            <p class="task-description">${task.description || ''}</p>
            
            <!-- 🎬 Attachment Badges -->
            <div class="task-attachments" style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
                ${task.pdfFile ? '<span class="attachment-badge pdf"><i class="fas fa-file-pdf"></i> PDF</span>' : ''}
                ${task.pptFile ? '<span class="attachment-badge ppt"><i class="fas fa-file-powerpoint"></i> PPT</span>' : ''}
                ${task.videoFile ? '<span class="attachment-badge video"><i class="fas fa-video"></i> Video</span>' : ''}
            </div>

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

function loadAdminTasksList() {
    const list = document.getElementById('adminTasksList');
    if (!list) return;
    
    const tasks = appData.tasks || [];
    
    if (tasks.length === 0) {
        list.innerHTML = '<div class="admin-list-item"><p style="color: var(--text-muted);">Belum ada tugas</p></div>';
        return;
    }
    
    list.innerHTML = tasks.map(task => {
        const dateStr = task.createdAt && task.createdAt.toDate
            ? task.createdAt.toDate().toLocaleDateString('id-ID')
            : task.date || '-';
        
        return `
            <div class="admin-list-item">
                <div class="admin-list-item-info">
                    <h5>${task.title || 'Untitled'}</h5>
                    <p>${task.course || '-'} • ${dateStr}</p>
                </div>
                <div class="admin-list-item-actions">
                    <button class="btn-icon" onclick="deleteTask('${task.id}')" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function loadAdminCertsList() {
    const list = document.getElementById('adminCertsList');
    if (!list) return;
    
    const certificates = appData.certificates || [];
    
    if (certificates.length === 0) {
        list.innerHTML = '<div class="admin-list-item"><p style="color: var(--text-muted);">Belum ada sertifikat</p></div>';
        return;
    }
    
    list.innerHTML = certificates.map(cert => `
        <div class="admin-list-item">
            <div class="admin-list-item-info">
                <h5>${cert.title || 'Untitled'}</h5>
                <p>${cert.issuer || '-'} • ${cert.year || '-'}</p>
            </div>
            <div class="admin-list-item-actions">
                <button class="btn-icon" onclick="deleteCertificate('${cert.id}')" title="Hapus">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function updateCVStatus() {
    const cvStatus = document.getElementById('cvStatus');
    if (!cvStatus) return;
    
    if (appData.cv && appData.cv.file) {
        const uploadedAt = appData.cv.uploadedAt && appData.cv.uploadedAt.toDate
            ? appData.cv.uploadedAt.toDate().toLocaleString('id-ID')
            : 'Baru saja';
        
        cvStatus.innerHTML = `
            <div class="alert alert-success" style="color: var(--success); margin-top: 1rem;">
                <i class="fas fa-check-circle"></i> CV sudah diupload: ${appData.cv.name || appData.cv.file.name}
                <br><small style="color: var(--text-muted);">Upload: ${uploadedAt}</small>
                <br><small style="color: var(--text-muted);">Status: ${FirebaseHelper.isOnline() ? '🟢 Online' : '🟡 Offline'}</small>
            </div>
        `;
    } else {
        cvStatus.innerHTML = `
            <div class="alert alert-info" style="color: var(--text-muted); margin-top: 1rem;">
                <i class="fas fa-info-circle"></i> Belum ada CV yang diupload
            </div>
        `;
    }
}

function updateStats() {
    const taskCountEl = document.getElementById('taskCount');
    const certCountEl = document.getElementById('certCount');
    
    if (taskCountEl) {
        taskCountEl.textContent = appData.tasks.length || 0;
        taskCountEl.setAttribute('data-count', appData.tasks.length || 0);
    }
    if (certCountEl) {
        certCountEl.textContent = appData.certificates.length || 0;
        certCountEl.setAttribute('data-count', appData.certificates.length || 0);
    }
}

// ============================================
// DETAIL VIEWS
// ============================================
function showTaskDetail(taskId) {
    const task = appData.tasks.find(t => t.id === taskId);
    if (!task) {
        showNotification('❌ Tugas tidak ditemukan!', 'error');
        return;
    }
    
    const modal = document.getElementById('task-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = task.title || 'Detail Tugas';
    
    let fileLinksHtml = '';
    if (task.pdfFile || task.pptFile || task.videoFile) {
        fileLinksHtml = '<h4 style="margin: 1.5rem 0 0.5rem;">📁 File Tugas</h4><div class="file-links" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">';
        
        if (task.pdfFile && task.pdfFile.url) {
            fileLinksHtml += `
                <a href="${task.pdfFile.url}" target="_blank" class="file-link" style="padding: 0.5rem 1rem; background: var(--primary); color: white; border-radius: var(--radius-sm); text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem;">
                    <i class="fas fa-eye"></i> Lihat PDF
                </a>
                <a href="${task.pdfFile.url}" download class="file-link" style="padding: 0.5rem 1rem; background: var(--secondary); color: white; border-radius: var(--radius-sm); text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem;">
                    <i class="fas fa-download"></i> Download PDF
                </a>
            `;
        }
        if (task.pptFile && task.pptFile.url) {
            fileLinksHtml += `
                <a href="${task.pptFile.url}" download class="file-link" style="padding: 0.5rem 1rem; background: var(--accent); color: white; border-radius: var(--radius-sm); text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem;">
                    <i class="fas fa-file-powerpoint"></i> Download PPT
                </a>
            `;
        }
        // 🎬 Video Links
        if (task.videoFile && task.videoFile.url) {
            fileLinksHtml += `
                <button onclick="openVideoPlayer('${task.videoFile.url}', '${task.videoFile.name || 'video.mp4}', '${task.title}')" 
                        class="file-link previewable" style="padding: 0.5rem 1rem; background: linear-gradient(135deg, #8B5CF6, #6D28D9); color: white; border-radius: var(--radius-sm); border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.25rem;">
                    <i class="fas fa-play"></i> Putar Video
                </button>
                <a href="${task.videoFile.url}" download class="file-link" style="padding: 0.5rem 1rem; background: var(--bg-secondary); color: var(--text-primary); border-radius: var(--radius-sm); text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem;">
                    <i class="fas fa-download"></i> Download Video
                </a>
            `;
        }
        fileLinksHtml += '</div>';
    }
    
    const dateStr = task.createdAt && task.createdAt.toDate
        ? task.createdAt.toDate().toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        })
        : task.date || '-';
    
    const statusBadge = {
        'completed': '<span style="background: var(--success); color: white; padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.875rem;">Selesai</span>',
        'in-progress': '<span style="background: var(--warning); color: white; padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.875rem;">Dalam Proses</span>',
        'pending': '<span style="background: var(--text-muted); color: white; padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.875rem;">Menunggu</span>'
    }[task.status] || '<span style="background: var(--text-muted); color: white; padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.875rem;">Menunggu</span>';
    
    modalBody.innerHTML = `
        <div class="task-detail-content">
            <h4 style="margin-bottom: 0.5rem;">📝 Deskripsi Tugas</h4>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">${task.description || 'Tidak ada deskripsi'}</p>
            
            <h4 style="margin-bottom: 0.5rem;">ℹ️ Informasi</h4>
            <ul style="list-style: none; padding: 0; color: var(--text-secondary);">
                <li style="margin: 0.25rem 0;"><strong>Mata Kuliah:</strong> ${task.course || '-'}</li>
                <li style="margin: 0.25rem 0;"><strong>Kategori:</strong> ${task.category || '-'}</li>
                <li style="margin: 0.25rem 0;"><strong>Status:</strong> ${statusBadge}</li>
                <li style="margin: 0.25rem 0;"><strong>Dibuat:</strong> ${dateStr}</li>
            </ul>
            
            ${fileLinksHtml}
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function showCertificateDetail(certId) {
    const cert = appData.certificates.find(c => c.id === certId);
    if (!cert) {
        showNotification('❌ Sertifikat tidak ditemukan!', 'error');
        return;
    }
    
    const modal = document.getElementById('certificate-modal');
    const modalTitle = document.getElementById('cert-modal-title');
    const modalBody = document.getElementById('cert-modal-body');
    
    modalTitle.textContent = cert.title || 'Sertifikat';
    
    let previewHtml = '';
    if (cert.file && cert.file.url) {
        if (cert.file.type && cert.file.type.startsWith('image/')) {
            previewHtml = `<img src="${cert.file.url}" alt="${cert.title}" style="max-width: 100%; border-radius: var(--radius-sm); box-shadow: var(--shadow-lg);">`;
        } else {
            previewHtml = `
                <div class="certificate-preview-icon" style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem;">
                    <i class="fas fa-file-pdf"></i>
                </div>
                <p>File: ${cert.file.name || 'document.pdf'}</p>
            `;
        }
    } else {
        previewHtml = `
            <div class="certificate-preview-icon" style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem;">
                <i class="fas ${cert.icon || 'fa-certificate'}"></i>
            </div>
            <p>Sertifikat ${cert.title || ''}</p>
        `;
    }
    
    modalBody.innerHTML = `
        <div class="certificate-preview" style="text-align: center;">
            ${previewHtml}
            <h4 style="margin: 1rem 0 0.5rem;">${cert.title || ''}</h4>
            <p style="color: var(--text-secondary);">Diterbitkan oleh: ${cert.issuer || '-'}</p>
            <p style="color: var(--text-muted);">Tahun: ${cert.year || '-'}</p>
        </div>
        <div class="certificate-actions" style="margin-top: 1.5rem; text-align: center;">
            ${cert.file && cert.file.url ? `
                <a href="${cert.file.url}" download class="btn btn-primary">
                    <i class="fas fa-download"></i> Download Sertifikat
                </a>
            ` : ''}
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ============================================
// PDF VIEWER
// ============================================
async function openPdfViewer(pdfUrl, title, fileName) {
    try {
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onload = async function(e) {
            const pdfData = e.target.result;
            currentPdfData = pdfData;
            currentPdfName = fileName || 'document.pdf';
            
            const modal = document.getElementById('pdf-viewer-modal');
            const modalTitle = document.getElementById('pdf-viewer-title');
            const canvas = document.getElementById('pdf-canvas');
            const loading = document.getElementById('pdf-loading');
            
            modalTitle.textContent = title || 'Dokumen';
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            canvas.style.display = 'none';
            loading.style.display = 'flex';
            
            let base64Data = pdfData.includes(',') ? pdfData.split(',')[1] : pdfData;
            const raw = window.atob(base64Data);
            const uint8Array = new Uint8Array(raw.length);
            for (let i = 0; i < raw.length; i++) {
                uint8Array[i] = raw.charCodeAt(i);
            }
            
            const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
            pdfDoc = await loadingTask.promise;
            
            loading.style.display = 'none';
            canvas.style.display = 'block';
            
            pageNum = 1;
            scale = 1.5;
            updatePageInfo();
            updateZoomLevel();
            renderPage(pageNum);
        };
        
        reader.readAsDataURL(blob);
    } catch (error) {
        console.error('❌ Error loading PDF:', error);
        showNotification('❌ Gagal memuat PDF. Silakan download file.', 'error');
    }
}

function renderPage(num) {
    if (!pdfDoc) return;
    pageRendering = true;
    
    pdfDoc.getPage(num).then(page => {
        const canvas = document.getElementById('pdf-canvas');
        const ctx = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: scale });
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = { canvasContext: ctx, viewport: viewport };
        const renderTask = page.render(renderContext);
        
        renderTask.promise.then(() => {
            pageRendering = false;
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });
    updatePageInfo();
}

function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

function prevPage() {
    if (pageNum <= 1 || !pdfDoc) return;
    pageNum--;
    queueRenderPage(pageNum);
}

function nextPage() {
    if (!pdfDoc || pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
}

function zoomIn() {
    scale += 0.25;
    updateZoomLevel();
    queueRenderPage(pageNum);
}

function zoomOut() {
    if (scale <= 0.5) return;
    scale -= 0.25;
    updateZoomLevel();
    queueRenderPage(pageNum);
}

function updatePageInfo() {
    const pageInfo = document.getElementById('page-info');
    if (pageInfo && pdfDoc) pageInfo.textContent = `Halaman ${pageNum} dari ${pdfDoc.numPages}`;
}

function updateZoomLevel() {
    const zoomLevel = document.getElementById('zoom-level');
    if (zoomLevel) zoomLevel.textContent = `${Math.round(scale * 100)}%`;
}

function closePdfViewer() {
    const modal = document.getElementById('pdf-viewer-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    pdfDoc = null;
    pageNum = 1;
    currentPdfData = null;
}

// ============================================
// 🎬 VIDEO PLAYER FUNCTIONS
// ============================================
function openVideoPlayer(videoUrl, fileName, title) {
    const modal = document.getElementById('video-modal');
    const videoPlayer = document.getElementById('video-player');
    const videoLoading = document.getElementById('video-loading');
    const videoInfo = document.getElementById('video-info');
    const downloadLink = document.getElementById('video-download-link');
    
    if (!modal || !videoPlayer) {
        showNotification('❌ Video player tidak ditemukan!', 'error');
        return;
    }
    
    document.getElementById('video-modal-title').textContent = title || 'Video';
    downloadLink.href = videoUrl;
    downloadLink.download = fileName || 'video.mp4';
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    videoLoading.style.display = 'flex';
    videoPlayer.style.display = 'none';
    videoPlayer.pause();
    videoPlayer.src = '';
    
    currentVideoUrl = videoUrl;
    videoPlayer.src = videoUrl;
    
    videoPlayer.onloadeddata = function() {
        videoLoading.style.display = 'none';
        videoPlayer.style.display = 'block';
        videoPlayer.play().catch(e => console.log('Auto-play prevented:', e));
        
        if (videoInfo) {
            videoInfo.innerHTML = `
                <strong>${fileName}</strong><br>
                Durasi: ${formatVideoDuration(videoPlayer.duration)} | 
                <a href="${videoUrl}" target="_blank" style="color: var(--primary);">Buka di tab baru</a>
            `;
        }
    };
    
    videoPlayer.onerror = function(e) {
        console.error('Video load error:', e);
        videoLoading.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="color: var(--warning); font-size: 2rem;"></i>
            <p>Gagal memuat video. Silakan <a href="${videoUrl}" target="_blank" style="color: var(--primary);">download</a> untuk memutar.</p>
        `;
    };
}

function closeVideoModal() {
    const modal = document.getElementById('video-modal');
    const videoPlayer = document.getElementById('video-player');
    
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    if (videoPlayer) {
        videoPlayer.pause();
        videoPlayer.src = ''; // Free memory
    }
    
    currentVideoUrl = null;
}

function formatVideoDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================
// UI COMPONENTS
// ============================================
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!hamburger || !navMenu) return;
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

function initScrollEffects() {
    const navbar = document.querySelector('.navbar');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', function() {
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
            } else {
                navbar.style.boxShadow = 'none';
            }
        }
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 200) current = section.getAttribute('id');
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) link.classList.add('active');
        });
    });
}

function initTypingEffect() {
    const textElement = document.getElementById('typing-text');
    if (!textElement) return;
    
    const text = "From Code to Creation.";
    let index = 0;
    
    function type() {
        if (index < text.length) {
            textElement.textContent += text.charAt(index);
            index++;
            setTimeout(type, 100);
        }
    }
    setTimeout(type, 500);
}

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

function initParticleBackground() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
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
    
    const particles = [];
    const particleCount = Math.min(50, Math.floor((canvas.width * canvas.height) / 20000));
    for (let i = 0; i < particleCount; i++) particles.push(new Particle());
    
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
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        drawConnections();
        requestAnimationFrame(animate);
    }
    animate();
}

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    const icon = themeToggle.querySelector('i');
    const body = document.body;
    
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme === 'light') {
        body.classList.add('light-theme');
        if (icon) { icon.classList.remove('fa-sun'); icon.classList.add('fa-moon'); }
    }
    
    themeToggle.addEventListener('click', function() {
        body.classList.toggle('light-theme');
        if (body.classList.contains('light-theme')) {
            if (icon) { icon.classList.remove('fa-sun'); icon.classList.add('fa-moon'); }
            localStorage.setItem(STORAGE_KEYS.THEME, 'light');
        } else {
            if (icon) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
            localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
        }
    });
}

function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) backToTop.classList.add('visible');
        else backToTop.classList.remove('visible');
    });
    backToTop.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
}

function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-count')) || 0;
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

function initTaskFilter() {
    const filterBtns = document.querySelectorAll('.tasks-filter .filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterTasks(this.getAttribute('data-filter'));
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

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
        });
    });
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    const icon = notification?.querySelector('i');
    
    if (!notification || !notificationText) return;
    
    notificationText.textContent = message;
    
    if (icon) {
        icon.className = '';
        if (type === 'success') { icon.className = 'fas fa-check-circle'; notification.style.borderLeftColor = 'var(--success)'; } 
        else if (type === 'error') { icon.className = 'fas fa-exclamation-circle'; notification.style.borderLeftColor = 'var(--error)'; } 
        else if (type === 'warning') { icon.className = 'fas fa-exclamation-triangle'; notification.style.borderLeftColor = 'var(--warning)'; } 
        else { icon.className = 'fas fa-info-circle'; notification.style.borderLeftColor = 'var(--primary)'; }
    }
    
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
}

function handleContactSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const name = formData.get('name');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<span class="loading"></span> Mengirim...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        showNotification(`✅ Terima kasih ${name}! Pesan Anda telah terkirim.`, 'success');
        form.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// Admin Panel
function initAdminPanel() {
    const adminToggle = document.getElementById('adminToggle');
    if (!adminToggle) return;
    adminToggle.addEventListener('click', openAdminModal);
    if (localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true') showAdminDashboard();
}

function openAdminModal() {
    const modal = document.getElementById('admin-modal');
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    loadAdminTasksList();
    loadAdminCertsList();
    updateCVStatus();
}

function closeAdminModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
}

function loginAdmin() {
    const password = document.getElementById('adminPassword')?.value;
    if (password === ADMIN_PASSWORD) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
        showNotification('✅ Login berhasil!', 'success');
        showAdminDashboard();
    } else {
        showNotification('❌ Password salah!', 'error');
    }
}

function logoutAdmin() {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    const loginSection = document.getElementById('admin-login');
    const dashboardSection = document.getElementById('admin-dashboard');
    const passwordInput = document.getElementById('adminPassword');
    if (loginSection) loginSection.style.display = 'block';
    if (dashboardSection) dashboardSection.style.display = 'none';
    if (passwordInput) passwordInput.value = '';
    showNotification('✅ Logout berhasil!', 'success');
}

function showAdminDashboard() {
    const loginSection = document.getElementById('admin-login');
    const dashboardSection = document.getElementById('admin-dashboard');
    if (loginSection) loginSection.style.display = 'none';
    if (dashboardSection) dashboardSection.style.display = 'block';
    loadAdminTasksList();
    loadAdminCertsList();
    updateCVStatus();
}

function switchAdminTab(tab) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    event?.target?.classList?.add('active');
    document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');
    const tabContent = document.getElementById('admin-' + tab);
    if (tabContent) tabContent.style.display = 'block';
}

function initCVDownload() {
    const downloadBtn = document.getElementById('downloadCVBtn');
    if (!downloadBtn) return;
    downloadBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (appData.cv && appData.cv.file) window.open(appData.cv.file.url, '_blank');
        else showNotification('⚠️ CV belum tersedia. Silakan upload CV melalui Admin Panel.', 'error');
    });
}

// Modal helpers
function closeModal() {
    const modal = document.getElementById('task-modal');
    if (modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
}

function closeCertificateModal() {
    const modal = document.getElementById('certificate-modal');
    if (modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
}

// Window events
window.addEventListener('click', function(e) {
    const taskModal = document.getElementById('task-modal');
    const certModal = document.getElementById('certificate-modal');
    const adminModal = document.getElementById('admin-modal');
    const pdfModal = document.getElementById('pdf-viewer-modal');
    const videoModal = document.getElementById('video-modal');
    
    if (e.target === taskModal) closeModal();
    if (e.target === certModal) closeCertificateModal();
    if (e.target === adminModal) closeAdminModal();
    if (e.target === pdfModal) closePdfViewer();
    if (e.target === videoModal) closeVideoModal(); // 🎬
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
        closeCertificateModal();
        closeAdminModal();
        closePdfViewer();
        closeVideoModal(); // 🎬
    }
});

// Cleanup saat unload
window.addEventListener('beforeunload', () => {
    unsubscribers.forEach(unsub => { if (typeof unsub === 'function') unsub(); });
});

// ============================================
// GLOBAL FUNCTIONS EXPORT
// ============================================
window.showTaskDetail = showTaskDetail;
window.showCertificateDetail = showCertificateDetail;
window.openPdfViewer = openPdfViewer;
window.closePdfViewer = closePdfViewer;
window.prevPage = prevPage;
window.nextPage = nextPage;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.downloadCurrentPdf = function() {
    if (currentPdfData && currentPdfName) {
        const link = document.createElement('a');
        link.href = currentPdfData;
        link.download = currentPdfName;
        link.click();
    }
};
window.closeModal = closeModal;
window.closeCertificateModal = closeCertificateModal;
window.closeAdminModal = closeAdminModal;
window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;
window.switchAdminTab = switchAdminTab;
window.handleAddTask = handleAddTask;
window.handleAddCertificate = handleAddCertificate;
window.handleUploadCV = handleUploadCV;
window.handleContactSubmit = handleContactSubmit;
window.deleteTask = deleteTask;
window.deleteCertificate = deleteCertificate;

// 🎬 Video exports
window.openVideoPlayer = openVideoPlayer;
window.closeVideoModal = closeVideoModal;
