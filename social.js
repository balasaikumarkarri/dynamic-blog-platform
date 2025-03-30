class SocialFeatures {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
            id: 1,
            name: 'Current User',
            bio: 'Welcome to my blog!',
            avatar: 'https://via.placeholder.com/150'
        };
        
        this.users = JSON.parse(localStorage.getItem('users')) || this.generateSampleUsers();
        this.messages = JSON.parse(localStorage.getItem('messages')) || [];
        this.collaborations = JSON.parse(localStorage.getItem('collaborations')) || [];
        this.activities = JSON.parse(localStorage.getItem('activities')) || [];
        
        this.setupEventListeners();
        this.initializeUI();
    }

    generateSampleUsers() {
        const sampleUsers = [
            {
                id: 2,
                name: 'Alice Johnson',
                bio: 'Tech enthusiast & writer',
                avatar: 'https://via.placeholder.com/150',
                isFollowing: false
            },
            {
                id: 3,
                name: 'Bob Smith',
                bio: 'Travel blogger',
                avatar: 'https://via.placeholder.com/150',
                isFollowing: true
            },
            {
                id: 4,
                name: 'Carol White',
                bio: 'Food & lifestyle blogger',
                avatar: 'https://via.placeholder.com/150',
                isFollowing: false
            }
        ];
        localStorage.setItem('users', JSON.stringify(sampleUsers));
        return sampleUsers;
    }

    setupEventListeners() {
        // Message form submission
        document.getElementById('messageForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        // Collaboration form submission
        document.getElementById('collabForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createCollaboration();
        });

        // Follow button clicks
        document.getElementById('userList')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('follow-btn')) {
                const userId = parseInt(e.target.dataset.userId);
                this.toggleFollow(userId);
            }
        });
    }

    initializeUI() {
        this.renderUserList();
        this.renderActivityFeed();
        this.renderMessageList();
        this.renderCollaborationList();
        this.populateRecipientsList();
        this.populateCollaboratorsList();
    }

    renderUserList() {
        const userList = document.getElementById('userList');
        if (!userList) return;

        userList.innerHTML = this.users.map(user => `
            <div class="user-item">
                <img src="${user.avatar}" alt="${user.name}">
                <div class="user-info">
                    <div class="user-name">${user.name}</div>
                    <div class="user-bio">${user.bio}</div>
                </div>
                <button class="btn ${user.isFollowing ? 'btn-secondary' : 'btn-primary'} follow-btn" data-user-id="${user.id}">
                    ${user.isFollowing ? 'Following' : 'Follow'}
                </button>
            </div>
        `).join('');
    }

    renderActivityFeed() {
        const activityFeed = document.getElementById('activityFeed');
        if (!activityFeed) return;

        activityFeed.innerHTML = this.activities.map(activity => `
            <div class="activity-item">
                <div class="activity-header">
                    <img src="${activity.userAvatar}" alt="${activity.userName}">
                    <div>
                        <strong>${activity.userName}</strong>
                        ${this.formatActivityAction(activity)}
                        <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
                    </div>
                </div>
                ${activity.content ? `<div class="activity-content">${activity.content}</div>` : ''}
            </div>
        `).join('');
    }

    renderMessageList() {
        const messageList = document.getElementById('messageList');
        if (!messageList) return;

        const userMessages = this.messages.filter(msg => 
            msg.senderId === this.currentUser.id || msg.recipientId === this.currentUser.id
        );

        messageList.innerHTML = userMessages.map(message => `
            <div class="message-item ${!message.read && message.recipientId === this.currentUser.id ? 'unread' : ''}">
                <div class="message-header">
                    <span class="message-sender">${this.getUserName(message.senderId)}</span>
                    <span class="message-time">${this.formatTime(message.timestamp)}</span>
                </div>
                <div class="message-preview">${message.content}</div>
            </div>
        `).join('');
    }

    renderCollaborationList() {
        const collabList = document.getElementById('collabList');
        if (!collabList) return;

        const userCollabs = this.collaborations.filter(collab => 
            collab.members.includes(this.currentUser.id)
        );

        collabList.innerHTML = userCollabs.map(collab => `
            <div class="collab-item">
                <div class="collab-title">${collab.title}</div>
                <div class="collab-members">
                    ${collab.members.map(memberId => `
                        <img src="${this.getUserAvatar(memberId)}" 
                             alt="${this.getUserName(memberId)}"
                             class="collab-member"
                             title="${this.getUserName(memberId)}">
                    `).join('')}
                </div>
                <div class="collab-status ${collab.status.toLowerCase()}">
                    ${collab.status}
                </div>
            </div>
        `).join('');
    }

    populateRecipientsList() {
        const recipientSelect = document.getElementById('recipient');
        if (!recipientSelect) return;

        recipientSelect.innerHTML = this.users.map(user => `
            <option value="${user.id}">${user.name}</option>
        `).join('');
    }

    populateCollaboratorsList() {
        const collabUsersSelect = document.getElementById('collabUsers');
        if (!collabUsersSelect) return;

        collabUsersSelect.innerHTML = this.users.map(user => `
            <option value="${user.id}">${user.name}</option>
        `).join('');
    }

    sendMessage() {
        const recipientId = parseInt(document.getElementById('recipient').value);
        const content = document.getElementById('messageContent').value;

        const message = {
            id: Date.now(),
            senderId: this.currentUser.id,
            recipientId,
            content,
            timestamp: new Date().toISOString(),
            read: false
        };

        this.messages.unshift(message);
        localStorage.setItem('messages', JSON.stringify(this.messages));

        this.addActivity({
            type: 'message',
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            userAvatar: this.currentUser.avatar,
            content: `sent a message to ${this.getUserName(recipientId)}`,
            timestamp: new Date().toISOString()
        });

        this.renderMessageList();
        
        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('newMessageModal'));
        modal.hide();
        document.getElementById('messageForm').reset();
    }

    createCollaboration() {
        const title = document.getElementById('collabTitle').value;
        const description = document.getElementById('collabDescription').value;
        const members = Array.from(document.getElementById('collabUsers').selectedOptions)
            .map(option => parseInt(option.value));
        
        // Add current user to members if not already included
        if (!members.includes(this.currentUser.id)) {
            members.push(this.currentUser.id);
        }

        const collaboration = {
            id: Date.now(),
            title,
            description,
            members,
            status: 'Draft',
            timestamp: new Date().toISOString()
        };

        this.collaborations.unshift(collaboration);
        localStorage.setItem('collaborations', JSON.stringify(this.collaborations));

        this.addActivity({
            type: 'collaboration',
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            userAvatar: this.currentUser.avatar,
            content: `started a new collaboration: ${title}`,
            timestamp: new Date().toISOString()
        });

        this.renderCollaborationList();
        
        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('newCollabModal'));
        modal.hide();
        document.getElementById('collabForm').reset();
    }

    toggleFollow(userId) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex === -1) return;

        this.users[userIndex].isFollowing = !this.users[userIndex].isFollowing;
        localStorage.setItem('users', JSON.stringify(this.users));

        this.addActivity({
            type: 'follow',
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            userAvatar: this.currentUser.avatar,
            content: `${this.users[userIndex].isFollowing ? 'followed' : 'unfollowed'} ${this.users[userIndex].name}`,
            timestamp: new Date().toISOString()
        });

        this.renderUserList();
    }

    addActivity(activity) {
        this.activities.unshift(activity);
        localStorage.setItem('activities', JSON.stringify(this.activities));
        this.renderActivityFeed();
    }

    formatActivityAction(activity) {
        switch (activity.type) {
            case 'post':
                return 'published a new post';
            case 'comment':
                return 'commented on a post';
            case 'follow':
                return activity.content;
            case 'message':
                return activity.content;
            case 'collaboration':
                return activity.content;
            default:
                return activity.content;
        }
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    }

    getUserName(userId) {
        const user = this.users.find(u => u.id === userId);
        return user ? user.name : 'Unknown User';
    }

    getUserAvatar(userId) {
        const user = this.users.find(u => u.id === userId);
        return user ? user.avatar : 'https://via.placeholder.com/150';
    }
}

// Initialize Social Features
document.addEventListener('DOMContentLoaded', () => {
    new SocialFeatures();
}); 