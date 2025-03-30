// Post Display Functions
class PostDisplay {
    constructor() {
        this.posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
        this.currentPage = 1;
        this.postsPerPage = 6;
        this.setupEventListeners();
        this.displayPosts();
        this.setupPagination();
    }

    setupEventListeners() {
        // Add event listeners for post actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-post')) {
                const postId = parseInt(e.target.dataset.postId);
                this.deletePost(postId);
            } else if (e.target.classList.contains('like-post')) {
                const postId = parseInt(e.target.dataset.postId);
                this.likePost(postId);
            } else if (e.target.classList.contains('dislike-post')) {
                const postId = parseInt(e.target.dataset.postId);
                this.dislikePost(postId);
            } else if (e.target.classList.contains('submit-comment')) {
                const postId = parseInt(e.target.dataset.postId);
                this.addComment(postId);
            } else if (e.target.classList.contains('delete-comment')) {
                const postId = parseInt(e.target.dataset.postId);
                const commentId = parseInt(e.target.dataset.commentId);
                this.deleteComment(postId, commentId);
            } else if (e.target.classList.contains('page-link')) {
                e.preventDefault();
                this.currentPage = parseInt(e.target.dataset.page);
                this.displayPosts();
                this.setupPagination();
            }
        });

        // Add image upload preview
        const imageInput = document.getElementById('image');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('imagePreview');
                if (preview) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                }
            };
            reader.readAsDataURL(file);
        }
    }

    createCommentSection(post) {
        return `
            <div class="comments-section mt-3">
                <h6 class="mb-2">Comments (${post.comments?.length || 0})</h6>
                <div class="comment-form mb-3">
                    <div class="input-group">
                        <input type="text" class="form-control comment-input" 
                               placeholder="Write a comment..." 
                               data-post-id="${post.id}">
                        <button class="btn btn-primary submit-comment" data-post-id="${post.id}">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
                <div class="comments-list">
                    ${(post.comments || []).map(comment => `
                        <div class="comment-item d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <strong>${comment.author}</strong>
                                <p class="mb-0">${comment.content}</p>
                                <small class="text-muted">${comment.date}</small>
                            </div>
                            <button class="btn btn-sm btn-outline-danger delete-comment" 
                                    data-post-id="${post.id}" 
                                    data-comment-id="${comment.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    createPostCard(post) {
        return `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100">
                    ${post.image ? `<img src="${post.image}" class="card-img-top" alt="${post.title}">` : ''}
                    <div class="card-body">
                        <h5 class="card-title">${post.title}</h5>
                        <p class="card-text">${post.content.substring(0, 150)}...</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">By ${post.author}</small>
                            <small class="text-muted">${post.date}</small>
                        </div>
                        <div class="mt-2">
                            ${post.tags.map(tag => `<span class="badge bg-secondary me-1">${tag}</span>`).join('')}
                        </div>
                        <div class="mt-3">
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-primary like-post ${post.liked ? 'active' : ''}" 
                                        data-post-id="${post.id}">
                                    <i class="fas fa-thumbs-up"></i> ${post.likes || 0}
                                </button>
                                <button class="btn btn-sm btn-outline-danger dislike-post ${post.disliked ? 'active' : ''}" 
                                        data-post-id="${post.id}">
                                    <i class="fas fa-thumbs-down"></i> ${post.dislikes || 0}
                                </button>
                            </div>
                            <button class="btn btn-sm btn-outline-danger delete-post ms-2" data-post-id="${post.id}">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                        ${this.createCommentSection(post)}
                    </div>
                </div>
            </div>
        `;
    }

    displayPosts() {
        const blogPostsContainer = document.getElementById('blog-posts');
        if (blogPostsContainer) {
            const startIndex = (this.currentPage - 1) * this.postsPerPage;
            const endIndex = startIndex + this.postsPerPage;
            const paginatedPosts = this.posts.slice(startIndex, endIndex);
            
            blogPostsContainer.innerHTML = paginatedPosts.map(post => this.createPostCard(post)).join('');
        }
    }

    setupPagination() {
        const totalPages = Math.ceil(this.posts.length / this.postsPerPage);
        const paginationContainer = document.getElementById('pagination');
        
        if (paginationContainer) {
            let paginationHTML = '<ul class="pagination justify-content-center">';
            
            // Previous button
            paginationHTML += `
                <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${this.currentPage - 1}">Previous</a>
                </li>
            `;
            
            // Page numbers
            for (let i = 1; i <= totalPages; i++) {
                paginationHTML += `
                    <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            }
            
            // Next button
            paginationHTML += `
                <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${this.currentPage + 1}">Next</a>
                </li>
            `;
            
            paginationHTML += '</ul>';
            paginationContainer.innerHTML = paginationHTML;
        }
    }

    deletePost(postId) {
        if (confirm('Are you sure you want to delete this post?')) {
            this.posts = this.posts.filter(post => post.id !== postId);
            this.savePosts();
            this.displayPosts();
            this.setupPagination();
        }
    }

    likePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            if (post.disliked) {
                post.dislikes = (post.dislikes || 0) - 1;
                post.disliked = false;
            }
            post.likes = (post.likes || 0) + 1;
            post.liked = true;
            this.savePosts();
            this.displayPosts();
        }
    }

    dislikePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            if (post.liked) {
                post.likes = (post.likes || 0) - 1;
                post.liked = false;
            }
            post.dislikes = (post.dislikes || 0) + 1;
            post.disliked = true;
            this.savePosts();
            this.displayPosts();
        }
    }

    addComment(postId) {
        const post = this.posts.find(p => p.id === postId);
        const commentInput = document.querySelector(`.comment-input[data-post-id="${postId}"]`);
        
        if (post && commentInput.value.trim()) {
            const comment = {
                id: Date.now(),
                content: commentInput.value.trim(),
                author: "Current User", // This will be replaced with actual user data later
                date: new Date().toISOString().split('T')[0]
            };

            if (!post.comments) {
                post.comments = [];
            }
            post.comments.push(comment);
            
            this.savePosts();
            this.displayPosts();
            commentInput.value = '';
        }
    }

    deleteComment(postId, commentId) {
        const post = this.posts.find(p => p.id === postId);
        if (post && post.comments) {
            post.comments = post.comments.filter(comment => comment.id !== commentId);
            this.savePosts();
            this.displayPosts();
        }
    }

    savePosts() {
        localStorage.setItem('blogPosts', JSON.stringify(this.posts));
    }
}

// User engagement features
class EngagementManager {
    constructor() {
        this.bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
        this.reactions = JSON.parse(localStorage.getItem('reactions')) || {};
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Bookmark functionality
        document.querySelectorAll('.bookmark-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleBookmark(e));
        });

        // Reaction functionality
        document.querySelectorAll('.reaction-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleReaction(e));
        });

        // Social sharing
        document.querySelectorAll('.share-twitter').forEach(btn => {
            btn.addEventListener('click', (e) => this.shareOnTwitter(e));
        });
        document.querySelectorAll('.share-facebook').forEach(btn => {
            btn.addEventListener('click', (e) => this.shareOnFacebook(e));
        });
        document.querySelectorAll('.share-linkedin').forEach(btn => {
            btn.addEventListener('click', (e) => this.shareOnLinkedIn(e));
        });
    }

    toggleBookmark(e) {
        const btn = e.currentTarget;
        const postId = btn.closest('.post-card').dataset.postId;
        
        if (this.bookmarks.includes(postId)) {
            this.bookmarks = this.bookmarks.filter(id => id !== postId);
            btn.classList.remove('active');
        } else {
            this.bookmarks.push(postId);
            btn.classList.add('active');
            this.showToast('Post bookmarked!');
        }
        
        localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
    }

    handleReaction(e) {
        const btn = e.currentTarget;
        const postId = btn.closest('.post-card').dataset.postId;
        const reaction = btn.dataset.reaction;
        
        if (!this.reactions[postId]) {
            this.reactions[postId] = {};
        }

        const isActive = btn.classList.contains('active');
        if (isActive) {
            delete this.reactions[postId][reaction];
            btn.classList.remove('active');
        } else {
            this.reactions[postId][reaction] = true;
            btn.classList.add('active', 'animating');
            setTimeout(() => btn.classList.remove('animating'), 300);
            this.updateReactionCount(btn, 1);
        }
        
        localStorage.setItem('reactions', JSON.stringify(this.reactions));
    }

    updateReactionCount(btn, change) {
        const countSpan = btn.querySelector('span');
        const currentCount = parseInt(countSpan.textContent);
        countSpan.textContent = currentCount + change;
    }

    calculateReadingTime(content) {
        const wordsPerMinute = 200;
        const words = content.trim().split(/\s+/).length;
        const time = Math.ceil(words / wordsPerMinute);
        return `${time} min read`;
    }

    shareOnTwitter(e) {
        e.preventDefault();
        const post = e.target.closest('.post-card');
        const title = post.querySelector('.card-title').textContent;
        const url = window.location.href;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
    }

    shareOnFacebook(e) {
        e.preventDefault();
        const url = window.location.href;
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    }

    shareOnLinkedIn(e) {
        e.preventDefault();
        const post = e.target.closest('.post-card');
        const title = post.querySelector('.card-title').textContent;
        const url = window.location.href;
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 2000);
        }, 100);
    }
}

// Initialize Post Display
document.addEventListener('DOMContentLoaded', () => {
    new PostDisplay();
    const engagementManager = new EngagementManager();
});

class PostCreation {
    constructor() {
        this.setupEventListeners();
        this.setupAutoSave();
        this.loadDraft();
        this.setMinDate();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('postForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Image preview
        document.getElementById('coverImage')?.addEventListener('change', (e) => {
            this.handleCoverImageUpload(e);
        });

        // Title input for suggestions
        document.getElementById('title')?.addEventListener('input', (e) => {
            this.generateTitleSuggestions(e.target.value);
        });

        // Content input for auto-save
        document.getElementById('content')?.addEventListener('input', () => {
            this.autoSaveDraft();
        });

        // Tags input
        document.getElementById('tags')?.addEventListener('input', (e) => {
            this.generateTagSuggestions(e.target.value);
        });

        // Schedule inputs
        document.getElementById('scheduleDate')?.addEventListener('change', () => {
            this.updateScheduleInfo();
        });

        document.getElementById('scheduleTime')?.addEventListener('change', () => {
            this.updateScheduleInfo();
        });

        // Clear schedule button
        document.getElementById('clearSchedule')?.addEventListener('click', () => {
            this.clearSchedule();
        });
    }

    setMinDate() {
        const dateInput = document.getElementById('scheduleDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
        }
    }

    updateScheduleInfo() {
        const date = document.getElementById('scheduleDate')?.value;
        const time = document.getElementById('scheduleTime')?.value;
        const scheduleInfo = document.getElementById('scheduleInfo');

        if (date && time && scheduleInfo) {
            const scheduledDate = new Date(`${date}T${time}`);
            const formattedDate = scheduledDate.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            });
            scheduleInfo.innerHTML = `<i class="fas fa-clock"></i> Post will be published on ${formattedDate}`;
            scheduleInfo.style.display = 'block';
        } else {
            scheduleInfo.style.display = 'none';
        }
    }

    clearSchedule() {
        const dateInput = document.getElementById('scheduleDate');
        const timeInput = document.getElementById('scheduleTime');
        const scheduleInfo = document.getElementById('scheduleInfo');

        if (dateInput) dateInput.value = '';
        if (timeInput) timeInput.value = '';
        if (scheduleInfo) scheduleInfo.style.display = 'none';
    }

    autoSaveDraft() {
        const title = document.getElementById('title')?.value;
        const content = document.getElementById('content')?.value;
        const tags = document.getElementById('tags')?.value;
        const scheduleDate = document.getElementById('scheduleDate')?.value;
        const scheduleTime = document.getElementById('scheduleTime')?.value;

        const draft = {
            title,
            content,
            tags,
            scheduleDate,
            scheduleTime,
            lastSaved: new Date().toISOString()
        };

        localStorage.setItem('postDraft', JSON.stringify(draft));
        this.showAutoSaveNotification();
    }

    loadDraft() {
        const draft = JSON.parse(localStorage.getItem('postDraft'));
        if (draft) {
            document.getElementById('title').value = draft.title || '';
            document.getElementById('content').value = draft.content || '';
            document.getElementById('tags').value = draft.tags || '';
            if (draft.scheduleDate) {
                document.getElementById('scheduleDate').value = draft.scheduleDate;
            }
            if (draft.scheduleTime) {
                document.getElementById('scheduleTime').value = draft.scheduleTime;
            }
            this.updateScheduleInfo();
        }
    }

    handleSubmit() {
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim());
        const scheduleDate = document.getElementById('scheduleDate')?.value;
        const scheduleTime = document.getElementById('scheduleTime')?.value;

        const post = {
            id: Date.now(),
            title,
            content,
            tags,
            author: 'Current User',
            date: new Date().toISOString()
        };

        if (scheduleDate && scheduleTime) {
            post.scheduledDateTime = `${scheduleDate}T${scheduleTime}`;
            this.schedulePost(post);
        } else {
            this.publishPost(post);
        }
    }

    // ... rest of existing code ...
}

// Initialize Post Creation
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('postForm')) {
        new PostCreation();
    }
});

/* ... rest of existing code ... */ 