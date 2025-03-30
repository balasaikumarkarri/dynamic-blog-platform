class ProfileManager {
    constructor() {
        this.posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
        const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {
            name: 'Bala Sai Kumar',
            bio: '',
            profileImage: null
        };
        this.currentUser = userProfile.name;
        this.setupEventListeners();
        this.loadProfileData();
        this.displayUserPosts();
        this.initializeChart(); // Initialize the chart
        this.updateStatistics(); // Update statistics to show data in the chart
    }

    setupEventListeners() {
        // Save profile changes
        const saveProfileBtn = document.getElementById('saveProfile');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', () => this.saveProfileChanges());
        }

        // Handle profile image upload
        const profileImageInput = document.getElementById('profileImage');
        if (profileImageInput) {
            profileImageInput.addEventListener('change', (e) => this.handleProfileImageUpload(e));
        }
    }

    handleProfileImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const profileImage = document.querySelector('.profile-image img');
                const initialsAvatar = profileImage.nextElementSibling;
                if (profileImage) {
                    profileImage.src = e.target.result;
                    profileImage.style.display = 'block';
                    initialsAvatar.style.display = 'none';
                }
            };
            reader.readAsDataURL(file);
        }
    }

    saveProfileChanges() {
        const name = document.getElementById('profileName').value;
        const bio = document.getElementById('profileBio').value;
        
        // Save to localStorage (in a real app, this would be saved to a backend)
        localStorage.setItem('userProfile', JSON.stringify({
            name,
            bio,
            profileImage: document.querySelector('.profile-image img').src
        }));

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
        modal.hide();

        // Update profile display
        this.loadProfileData();
    }

    loadProfileData() {
        const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {
            name: this.currentUser,
            bio: '',
            profileImage: null
        };

        // Update profile display
        const profileImageElement = document.querySelector('.profile-image img');
        const initialsAvatar = profileImageElement.nextElementSibling;
        
        // Set the name in the edit profile modal and card title
        document.getElementById('profileName').value = userProfile.name;
        document.querySelector('.card-title').textContent = userProfile.name;
        
        if (userProfile.profileImage && userProfile.profileImage !== 'https://via.placeholder.com/150') {
            profileImageElement.src = userProfile.profileImage;
            profileImageElement.style.display = 'block';
            initialsAvatar.style.display = 'none';
        } else {
            profileImageElement.style.display = 'none';
            initialsAvatar.style.display = 'flex';
            initialsAvatar.textContent = userProfile.name.charAt(0).toUpperCase();
            // Generate a consistent color based on the name
            const colors = [
                '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e',
                '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50',
                '#f1c40f', '#e67e22', '#e74c3c', '#95a5a6', '#f39c12',
                '#d35400', '#c0392b', '#bdc3c7', '#7f8c8d'
            ];
            const colorIndex = Math.abs(userProfile.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length;
            initialsAvatar.style.backgroundColor = colors[colorIndex];
        }

        if (userProfile.bio) {
            document.querySelector('.text-muted').textContent = userProfile.bio;
            document.getElementById('profileBio').value = userProfile.bio;
        }

        // Update statistics
        this.updateStatistics();
    }

    updateStatistics() {
        const userPosts = this.posts.filter(post => post.author === this.currentUser);
        const totalPosts = userPosts.length;
        const totalComments = userPosts.reduce((acc, post) => acc + (post.comments?.length || 0), 0);
        const totalLikes = userPosts.reduce((acc, post) => acc + (post.likes || 0), 0);

        document.getElementById('totalPosts').textContent = totalPosts;
        document.getElementById('totalComments').textContent = totalComments;
        document.getElementById('totalLikes').textContent = totalLikes;

        // Update the chart
        this.updateChart(totalPosts, totalComments, totalLikes);
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
                            <small class="text-muted">${post.date}</small>
                        </div>
                        <div class="mt-2">
                            ${post.tags.map(tag => `<span class="badge bg-secondary me-1">${tag}</span>`).join('')}
                        </div>
                        <div class="mt-3">
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-primary">
                                    <i class="fas fa-thumbs-up"></i> ${post.likes || 0}
                                </button>
                                <button class="btn btn-sm btn-outline-danger">
                                    <i class="fas fa-thumbs-down"></i> ${post.dislikes || 0}
                                </button>
                            </div>
                            <button class="btn btn-sm btn-outline-danger delete-post ms-2" data-post-id="${post.id}">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    displayUserPosts() {
        const userPostsContainer = document.getElementById('user-posts');
        if (userPostsContainer) {
            const userPosts = this.posts.filter(post => post.author === this.currentUser);
            userPostsContainer.innerHTML = userPosts.map(post => this.createPostCard(post)).join('');
        }
    }

    // Initialize the statistics chart
    initializeChart() {
        const ctx = document.getElementById('statsChart').getContext('2d');
        this.statsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Posts',
                        data: [0, 0, 0, 0, 0, 0],
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 2
                    },
                    {
                        label: 'Comments',
                        data: [0, 0, 0, 0, 0, 0],
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 2
                    },
                    {
                        label: 'Likes',
                        data: [0, 0, 0, 0, 0, 0],
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            stepSize: 1,
                            font: {
                                size: 12
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 10,
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 13
                        }
                    }
                }
            }
        });
    }

    // Update the chart with new data
    updateChart(posts, comments, likes) {
        if (this.statsChart) {
            const currentDate = new Date();
            const labels = [];
            const postsData = [];
            const commentsData = [];
            const likesData = [];

            // Get user's posts
            const userPosts = this.posts.filter(post => post.author === this.currentUser);

            // Initialize data arrays with zeros
            for (let i = 5; i >= 0; i--) {
                const date = new Date(currentDate);
                date.setMonth(date.getMonth() - i);
                labels.push(date.toLocaleString('default', { month: 'short' }));
                postsData.push(0);
                commentsData.push(0);
                likesData.push(0);
            }

            // Count actual posts, comments, and likes for each month
            userPosts.forEach(post => {
                const postDate = new Date(post.date);
                const monthIndex = 5 - (currentDate.getMonth() - postDate.getMonth());
                
                if (monthIndex >= 0 && monthIndex < 6) {
                    postsData[monthIndex]++;
                    commentsData[monthIndex] += post.comments?.length || 0;
                    likesData[monthIndex] += post.likes || 0;
                }
            });

            this.statsChart.data.labels = labels;
            this.statsChart.data.datasets[0].data = postsData;
            this.statsChart.data.datasets[1].data = commentsData;
            this.statsChart.data.datasets[2].data = likesData;
            this.statsChart.update();
        }
    }

    // Update the updateStats function to include chart update
    updateStats() {
        const userPosts = this.posts.filter(post => post.author === this.currentUser);
        const totalPosts = userPosts.length;
        const totalComments = userPosts.reduce((total, post) => total + (post.comments?.length || 0), 0);
        const totalLikes = userPosts.reduce((total, post) => total + (post.likes || 0), 0);

        document.getElementById('totalPosts').textContent = totalPosts;
        document.getElementById('totalComments').textContent = totalComments;
        document.getElementById('totalLikes').textContent = totalLikes;

        // Update the chart
        this.updateChart(totalPosts, totalComments, totalLikes);
    }
}

// Initialize Profile Manager
document.addEventListener('DOMContentLoaded', () => {
    new ProfileManager();
}); 