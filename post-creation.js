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

        // Template actions
        document.getElementById('saveTemplate')?.addEventListener('click', () => {
            this.saveTemplate();
        });

        // Load template from modal
        document.getElementById('templatesList')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('template-item')) {
                this.loadTemplate(e.target.dataset.templateId);
            }
        });
    }

    setupAutoSave() {
        // Auto-save every 30 seconds
        setInterval(() => {
            this.autoSaveDraft();
        }, 30000);
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

    saveTemplate() {
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const tags = document.getElementById('tags').value;

        if (!title || !content) {
            this.showToast('Please fill in at least the title and content before saving as template');
            return;
        }

        const template = {
            id: Date.now(),
            title,
            content,
            tags,
            createdAt: new Date().toISOString()
        };

        const templates = JSON.parse(localStorage.getItem('postTemplates')) || [];
        templates.push(template);
        localStorage.setItem('postTemplates', JSON.stringify(templates));

        this.showToast('Template saved successfully');
        this.loadTemplatesList();
    }

    loadTemplate(templateId) {
        const templates = JSON.parse(localStorage.getItem('postTemplates')) || [];
        const template = templates.find(t => t.id === parseInt(templateId));

        if (template) {
            document.getElementById('title').value = template.title;
            document.getElementById('content').value = template.content;
            document.getElementById('tags').value = template.tags;

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('templatesModal'));
            modal.hide();

            this.showToast('Template loaded successfully');
        }
    }

    loadTemplatesList() {
        const templatesContainer = document.getElementById('templatesList');
        const templates = JSON.parse(localStorage.getItem('postTemplates')) || [];

        if (templatesContainer) {
            templatesContainer.innerHTML = templates.map(template => `
                <div class="list-group-item template-item" data-template-id="${template.id}">
                    <div class="d-flex justify-content-between align-items-center">
                        <h6 class="mb-1">${template.title}</h6>
                        <small class="text-muted">${new Date(template.createdAt).toLocaleDateString()}</small>
                    </div>
                    <p class="mb-1">${template.content.substring(0, 100)}...</p>
                    <small class="text-muted">Tags: ${template.tags}</small>
                </div>
            `).join('') || '<div class="list-group-item">No templates saved</div>';
        }
    }

    generateTitleSuggestions(title) {
        // Implement title suggestions based on content
        const suggestionsContainer = document.getElementById('titleSuggestions');
        if (suggestionsContainer) {
            // Add your title suggestion logic here
        }
    }

    generateTagSuggestions(tags) {
        // Implement tag suggestions based on content
        const suggestionsContainer = document.getElementById('suggestedTags');
        if (suggestionsContainer) {
            // Add your tag suggestion logic here
        }
    }

    handleCoverImageUpload(e) {
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

    showAutoSaveNotification() {
        const status = document.getElementById('autoSaveStatus');
        if (status) {
            status.textContent = `Draft saved at ${new Date().toLocaleTimeString()}`;
            status.style.display = 'block';
            setTimeout(() => {
                status.style.display = 'none';
            }, 3000);
        }
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

    publishPost(post) {
        // Get existing posts from localStorage
        const posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
        
        // Add the new post
        posts.unshift(post);
        
        // Save back to localStorage
        localStorage.setItem('blogPosts', JSON.stringify(posts));
        
        // Clear the draft
        localStorage.removeItem('postDraft');
        
        // Show success message
        this.showToast('Post published successfully!');
        
        // Redirect to home page after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    schedulePost(post) {
        // Get existing scheduled posts
        const scheduledPosts = JSON.parse(localStorage.getItem('scheduledPosts')) || [];
        
        // Add the new scheduled post
        scheduledPosts.push(post);
        
        // Save back to localStorage
        localStorage.setItem('scheduledPosts', JSON.stringify(scheduledPosts));
        
        // Clear the draft
        localStorage.removeItem('postDraft');
        
        // Show success message
        this.showToast('Post scheduled successfully!');
        
        // Redirect to home page after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    setMinDate() {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('scheduleDate');
        if (dateInput) {
            dateInput.min = today;
        }
    }

    updateScheduleInfo() {
        const date = document.getElementById('scheduleDate')?.value;
        const time = document.getElementById('scheduleTime')?.value;
        const scheduleInfo = document.getElementById('scheduleInfo');
        
        if (date && time) {
            scheduleInfo.style.display = 'block';
            scheduleInfo.innerHTML = `<i class="fas fa-clock"></i> Post will be published on ${date} at ${time}`;
        } else {
            scheduleInfo.style.display = 'none';
        }
    }

    clearSchedule() {
        document.getElementById('scheduleDate').value = '';
        document.getElementById('scheduleTime').value = '';
        document.getElementById('scheduleInfo').style.display = 'none';
    }
}

// Initialize Post Creation
document.addEventListener('DOMContentLoaded', () => {
    new PostCreation();
}); 