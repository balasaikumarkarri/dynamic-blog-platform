class SearchAndDiscovery {
    constructor() {
        this.posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.categories = this.initializeCategories();
        this.setupEventListeners();
        this.initializeUI();
    }

    initializeCategories() {
        return [
            { id: 'technology', name: 'Technology', icon: 'fas fa-laptop-code' },
            { id: 'lifestyle', name: 'Lifestyle', icon: 'fas fa-coffee' },
            { id: 'travel', name: 'Travel', icon: 'fas fa-plane' },
            { id: 'food', name: 'Food', icon: 'fas fa-utensils' },
            { id: 'health', name: 'Health', icon: 'fas fa-heartbeat' }
        ];
    }

    setupEventListeners() {
        // Search form inputs
        document.getElementById('searchQuery')?.addEventListener('input', () => this.handleSearch());
        document.getElementById('searchCategory')?.addEventListener('change', () => this.handleSearch());
        document.getElementById('searchReadingTime')?.addEventListener('change', () => this.handleSearch());

        // Tag cloud
        document.getElementById('tagCloud')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-item')) {
                e.target.classList.toggle('active');
                this.handleSearch();
            }
        });

        // Categories
        document.getElementById('categoriesList')?.addEventListener('click', (e) => {
            const categoryItem = e.target.closest('.category-item');
            if (categoryItem) {
                const categoryId = categoryItem.dataset.categoryId;
                document.getElementById('searchCategory').value = categoryId;
                this.handleSearch();
            }
        });
    }

    initializeUI() {
        this.renderTagCloud();
        this.renderTrendingPosts();
        this.renderFeaturedWriters();
        this.renderCategories();
        this.handleSearch(); // Initial search
    }

    renderTagCloud() {
        const tagCloud = document.getElementById('tagCloud');
        if (!tagCloud) return;

        // Get all tags from posts
        const tagCounts = this.posts.reduce((acc, post) => {
            post.tags.forEach(tag => {
                acc[tag] = (acc[tag] || 0) + 1;
            });
            return acc;
        }, {});

        // Sort tags by count
        const sortedTags = Object.entries(tagCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 20); // Show top 20 tags

        tagCloud.innerHTML = sortedTags.map(([tag, count]) => `
            <div class="tag-item" data-tag="${tag}">
                ${tag}
                <span class="tag-count">${count}</span>
            </div>
        `).join('');
    }

    renderTrendingPosts() {
        const trendingPosts = document.getElementById('trendingPosts');
        if (!trendingPosts) return;

        // Sort posts by engagement (views + likes + comments)
        const sortedPosts = [...this.posts].sort((a, b) => {
            const engagementA = (a.views || 0) + (a.likes || 0) + (a.comments?.length || 0);
            const engagementB = (b.views || 0) + (b.likes || 0) + (b.comments?.length || 0);
            return engagementB - engagementA;
        }).slice(0, 5); // Show top 5 trending posts

        trendingPosts.innerHTML = sortedPosts.map(post => `
            <div class="trending-post">
                <img src="${post.image || 'https://via.placeholder.com/100'}" alt="${post.title}">
                <div class="trending-post-content">
                    <h4>${post.title}</h4>
                    <div class="trending-post-meta">
                        By ${post.author} · ${this.formatDate(post.date)}
                    </div>
                    <div class="trending-post-stats">
                        <span><i class="fas fa-eye"></i> ${post.views || 0}</span>
                        <span><i class="fas fa-heart"></i> ${post.likes || 0}</span>
                        <span><i class="fas fa-comment"></i> ${post.comments?.length || 0}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderFeaturedWriters() {
        const featuredWriters = document.getElementById('featuredWriters');
        if (!featuredWriters) return;

        // Sort users by post count and engagement
        const sortedWriters = [...this.users].sort((a, b) => {
            const postsA = this.posts.filter(post => post.author === a.name);
            const postsB = this.posts.filter(post => post.author === b.name);
            return postsB.length - postsA.length;
        }).slice(0, 5); // Show top 5 writers

        featuredWriters.innerHTML = sortedWriters.map(writer => {
            const writerPosts = this.posts.filter(post => post.author === writer.name);
            const totalViews = writerPosts.reduce((sum, post) => sum + (post.views || 0), 0);
            
            return `
                <div class="featured-writer">
                    <img src="${writer.avatar}" alt="${writer.name}">
                    <div class="featured-writer-info">
                        <h5>${writer.name}</h5>
                        <div class="featured-writer-stats">
                            <div>${writerPosts.length} posts · ${totalViews} views</div>
                            <div>${writer.bio}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderCategories() {
        const categoriesList = document.getElementById('categoriesList');
        if (!categoriesList) return;

        // Count posts in each category
        const categoryCounts = this.categories.map(category => {
            const count = this.posts.filter(post => 
                post.tags.some(tag => tag.toLowerCase() === category.id.toLowerCase())
            ).length;
            return { ...category, count };
        });

        categoriesList.innerHTML = categoryCounts.map(category => `
            <div class="category-item" data-category-id="${category.id}">
                <div>
                    <i class="${category.icon}"></i>
                    ${category.name}
                </div>
                <span class="category-count">${category.count}</span>
            </div>
        `).join('');
    }

    handleSearch() {
        const query = document.getElementById('searchQuery')?.value.toLowerCase();
        const category = document.getElementById('searchCategory')?.value;
        const readingTime = document.getElementById('searchReadingTime')?.value;
        const activeTags = Array.from(document.querySelectorAll('.tag-item.active'))
            .map(tag => tag.dataset.tag);

        let results = [...this.posts];

        // Filter by search query
        if (query) {
            results = results.filter(post =>
                post.title.toLowerCase().includes(query) ||
                post.content.toLowerCase().includes(query) ||
                post.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Filter by category
        if (category) {
            results = results.filter(post =>
                post.tags.some(tag => tag.toLowerCase() === category.toLowerCase())
            );
        }

        // Filter by reading time
        if (readingTime) {
            results = results.filter(post => {
                const minutes = this.calculateReadingTime(post.content);
                switch (readingTime) {
                    case 'short': return minutes < 5;
                    case 'medium': return minutes >= 5 && minutes <= 10;
                    case 'long': return minutes > 10;
                    default: return true;
                }
            });
        }

        // Filter by selected tags
        if (activeTags.length > 0) {
            results = results.filter(post =>
                activeTags.some(tag => post.tags.includes(tag))
            );
        }

        this.renderSearchResults(results);
    }

    renderSearchResults(results) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;

        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h5>No results found</h5>
                    <p class="text-muted">Try adjusting your search criteria</p>
                </div>
            `;
            return;
        }

        searchResults.innerHTML = results.map(post => `
            <div class="search-result">
                <div class="search-result-header">
                    <a href="#" class="search-result-title">${post.title}</a>
                    <span class="reading-time-badge">
                        <i class="far fa-clock"></i>
                        ${this.calculateReadingTime(post.content)} min read
                    </span>
                </div>
                <div class="search-result-meta">
                    By ${post.author} · ${this.formatDate(post.date)}
                </div>
                <div class="search-result-excerpt">
                    ${this.getExcerpt(post.content)}
                </div>
                <div class="search-result-tags">
                    ${post.tags.map(tag => `
                        <span class="search-result-tag">${tag}</span>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    calculateReadingTime(content) {
        const wordsPerMinute = 200;
        const wordCount = content.trim().split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    }

    getExcerpt(content, maxLength = 200) {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength).trim() + '...';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// Initialize Search and Discovery
document.addEventListener('DOMContentLoaded', () => {
    new SearchAndDiscovery();
}); 