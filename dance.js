// Global variables
let allPerformances = [];
let displayedPerformances = [];
let currentFilter = 'all';
let currentSort = 'newest';
let itemsPerPage = 12;
let currentPage = 1;
let currentVideoId = null;
let performanceToDelete = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadPerformances();
    setupEventListeners();
    setupUploadForm();
});

// Setup upload form and preview
function setupUploadForm() {
    const uploadForm = document.getElementById('uploadForm');
    const videoInput = document.getElementById('video');
    const videoPreview = document.getElementById('videoPreview');
    const previewVideo = videoPreview.querySelector('video');

    // Preview video before upload
    videoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const videoUrl = URL.createObjectURL(file);
            previewVideo.src = videoUrl;
            videoPreview.style.display = 'block';
            previewVideo.style.display = 'none';
            
            // Show placeholder with click to preview functionality
            const placeholder = videoPreview.querySelector('.preview-placeholder');
            if (!placeholder) {
                const placeholderDiv = document.createElement('div');
                placeholderDiv.className = 'preview-placeholder';
                placeholderDiv.onclick = function() {
                    this.style.display = 'none';
                    previewVideo.style.display = 'block';
                    previewVideo.play();
                };
                videoPreview.insertBefore(placeholderDiv, previewVideo.firstChild);
            } else {
                placeholder.style.display = 'block';
            }
        }
    });

    // Handle form submission
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            alert('Please login to upload performances');
            window.location.href = 'login.html';
            return;
        }

        const formData = new FormData(this);
        const videoFile = formData.get('video');
        const thumbnailFile = formData.get('thumbnail');

        if (!videoFile) {
            alert('Please select a video to upload');
            return;
        }

        try {
            // Create video URL and optionally thumbnail URL
            const videoUrl = URL.createObjectURL(videoFile);
            const thumbnailUrl = thumbnailFile ? URL.createObjectURL(thumbnailFile) : '';

            // Create new performance object
            const newPerformance = {
                id: Date.now().toString(),
                title: formData.get('title'),
                description: formData.get('description'),
                category: 'dance',
                subcategory: formData.get('category'),
                videoUrl: videoUrl,
                thumbnail: thumbnailUrl,
                performer: `${currentUser.firstName} ${currentUser.lastName}`,
                userId: currentUser.id,
                date: new Date().toISOString(),
                views: 0,
                likes: 0,
                duration: '0:00' // Would be calculated from the actual video
            };

            // Save to localStorage
            const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
            submissions.push(newPerformance);
            localStorage.setItem('submissions', JSON.stringify(submissions));

            // Show gallery section
            document.getElementById('emptyState').style.display = 'none';
            document.getElementById('galleryContent').style.display = 'block';
            
            // Refresh the display
            loadPerformances();
            
            // Reset form and preview
            this.reset();
            videoPreview.style.display = 'none';
            previewVideo.src = '';
            
            // Smooth scroll to the newly added performance
            document.querySelector('.gallery-section').scrollIntoView({ behavior: 'smooth' });
            
            alert('Performance uploaded successfully!');
        } catch (error) {
            console.error('Error uploading performance:', error);
            alert('There was an error uploading your performance. Please try again.');
        }
    });
}

function checkAuthStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const loginLink = document.getElementById('loginLink');
    const dashboardLink = document.getElementById('dashboardLink');
    const uploadSection = document.getElementById('uploadSection');
    
    if (currentUser) {
        loginLink.style.display = 'none';
        dashboardLink.style.display = 'block';
        uploadSection.style.display = 'block';
    } else {
        loginLink.style.display = 'block';
        dashboardLink.style.display = 'none';
        uploadSection.style.display = 'none';
    }
}

function loadPerformances() {
    // Combine submitted dance performances with any existing ones
    const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    const dancePerformances = submissions.filter(sub => sub.category === 'dance');
    
    allPerformances = [...dancePerformances];
    
    // Show/hide empty state and gallery content based on performances
    const emptyState = document.getElementById('emptyState');
    const galleryContent = document.getElementById('galleryContent');
    
    if (allPerformances.length === 0) {
        emptyState.style.display = 'flex';
        galleryContent.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        galleryContent.style.display = 'block';
        filterAndSortPerformances();
    }
}

function filterAndSortPerformances() {
    let filtered = allPerformances;

    // Apply category filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(perf => 
            perf.subcategory.toLowerCase() === currentFilter.toLowerCase()
        );
    }

    // Apply search
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(perf => 
            perf.title.toLowerCase().includes(searchTerm) ||
            perf.performer.toLowerCase().includes(searchTerm) ||
            perf.description.toLowerCase().includes(searchTerm)
        );
    }

    // Apply sort
    filtered.sort((a, b) => {
        switch (currentSort) {
            case 'newest':
                return new Date(b.date) - new Date(a.date);
            case 'oldest':
                return new Date(a.date) - new Date(b.date);
            case 'popular':
                return (b.likes || 0) - (a.likes || 0);
            case 'views':
                return (b.views || 0) - (a.views || 0);
            default:
                return 0;
        }
    });

    displayedPerformances = filtered;
    renderPerformances();
}

function renderPerformances() {
    const grid = document.getElementById('performancesGrid');
    const endIndex = currentPage * itemsPerPage;
    const performancesToShow = displayedPerformances.slice(0, endIndex);

    if (performancesToShow.length === 0) {
        grid.innerHTML = '<div class="no-results">No performances found</div>';
        return;
    }

    grid.innerHTML = performancesToShow.map(performance => `
        <div class="performance-card" data-id="${performance.id}">
            <div class="performance-image">
                <div class="video-placeholder" style="background-image: url('${performance.thumbnail || 'https://via.placeholder.com/300x200'}')">
                    <div class="play-overlay">
                        <button class="play-btn" onclick="playPerformance('${performance.id}')">
                            <i class="fas fa-play"></i>
                        </button>
                        <span class="duration">${performance.duration}</span>
                    </div>
                </div>
            </div>
            <div class="performance-info">
                <h3>${performance.title}</h3>
                <p class="performer">${performance.performer}</p>
                <div class="performance-meta">
                    <span class="views">${performance.views} views</span>
                    <span class="date">${formatDate(performance.date)}</span>
                </div>
                <div class="performance-actions">
                    <button onclick="likePerformance('${performance.id}')" class="action-btn like-btn">
                        <i class="fas fa-heart"></i>
                        <span>${performance.likes}</span>
                    </button>
                    ${isCurrentUserPerformance(performance) ? 
                        `<button onclick="deletePerformance('${performance.id}')" class="action-btn delete-btn">
                            <i class="fas fa-trash"></i>
                        </button>` : ''}
                </div>
            </div>
        </div>
    `).join('');

    // Show/hide load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = endIndex >= displayedPerformances.length ? 'none' : 'block';
    }
}

function setupEventListeners() {
    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            currentFilter = this.value;
            filterAndSortPerformances();
        });
    }

    // Sort filter
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            currentSort = this.value;
            filterAndSortPerformances();
        });
    }

    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterAndSortPerformances();
        });
    }

    // Load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            currentPage++;
            renderPerformances();
        });
    }
}

function playPerformance(performanceId) {
    const performance = allPerformances.find(p => p.id === performanceId);
    if (!performance) return;

    const modal = document.getElementById('videoModal');
    const video = document.getElementById('modalVideo');
    
    // Set video details
    video.src = performance.videoUrl;
    document.getElementById('videoTitle').textContent = performance.title;
    document.getElementById('videoDescription').textContent = performance.description;
    document.getElementById('videoPerformer').textContent = performance.performer;
    document.getElementById('videoDate').textContent = formatDate(performance.date);
    document.getElementById('videoViews').textContent = `${performance.views} views`;
    document.getElementById('likeCount').textContent = performance.likes;

    // Show/hide delete button based on ownership
    const deleteButton = document.getElementById('deleteButton');
    deleteButton.style.display = isCurrentUserPerformance(performance) ? 'block' : 'none';
    
    // Show modal
    modal.style.display = 'block';
    
    // Update views
    performance.views = (performance.views || 0) + 1;
    updateSubmissionInStorage(performance);
    
    currentVideoId = performanceId;
}

function likePerformance(performanceId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please login to like performances');
        return;
    }

    const performance = allPerformances.find(p => p.id === performanceId);
    if (performance) {
        performance.likes = (performance.likes || 0) + 1;
        updateSubmissionInStorage(performance);
        renderPerformances();
    }
}

function deletePerformance(performanceId) {
    performanceToDelete = performanceId;
    document.getElementById('deleteConfirmModal').style.display = 'flex';
}

function closeDeleteConfirmModal() {
    document.getElementById('deleteConfirmModal').style.display = 'none';
    performanceToDelete = null;
}

function confirmDelete() {
    if (!performanceToDelete) return;

    const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    const updatedSubmissions = submissions.filter(sub => sub.id !== performanceToDelete);
    localStorage.setItem('submissions', JSON.stringify(updatedSubmissions));

    // Close video modal if open
    if (currentVideoId === performanceToDelete) {
        document.getElementById('videoModal').style.display = 'none';
    }

    // Close confirmation modal
    closeDeleteConfirmModal();

    // Refresh performances
    loadPerformances();
    
    alert('Performance deleted successfully!');
}

function isCurrentUserPerformance(performance) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser && performance.userId === currentUser.id;
}

function updateSubmissionInStorage(performance) {
    const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    const index = submissions.findIndex(sub => sub.id === performance.id);
    if (index !== -1) {
        submissions[index] = performance;
        localStorage.setItem('submissions', JSON.stringify(submissions));
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Modal close handlers
window.addEventListener('click', function(event) {
    const videoModal = document.getElementById('videoModal');
    const deleteModal = document.getElementById('deleteConfirmModal');
    
    if (event.target === videoModal) {
        videoModal.style.display = 'none';
        document.getElementById('modalVideo').pause();
    } else if (event.target === deleteModal) {
        closeDeleteConfirmModal();
    }
});

// Close button handlers
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const modal = this.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
            if (modal.id === 'videoModal') {
                document.getElementById('modalVideo').pause();
            }
        }
    });
});
