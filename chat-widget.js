// Padhle Champs Chat Widget
(function() {
    'use strict';

    // Chat widget HTML
    const chatWidgetHTML = `
        <div id="chatWidget" class="fixed bottom-4 right-4 z-50">
            <!-- Chat Button -->
            <div id="chatButton" class="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg cursor-pointer flex items-center justify-center hover:scale-110 transition-all duration-300">
                <i class="fas fa-comments text-white text-xl"></i>
                <div class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span class="text-white text-xs">!</span>
                </div>
            </div>

            <!-- Chat Window -->
            <div id="chatWindow" class="hidden absolute bottom-16 right-0 w-80 sm:w-96 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <!-- Header -->
                <div class="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <i class="fas fa-robot text-sm"></i>
                        </div>
                        <div>
                            <h4 class="font-semibold text-sm">Padhle Champs Support</h4>
                            <p class="text-xs text-blue-100">AI Assistant • Online</p>
                        </div>
                    </div>
                    <button id="closeChatBtn" class="text-white hover:bg-white/20 rounded-lg p-1 transition-colors">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <!-- Messages -->
                <div id="chatMessages" class="h-64 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    <!-- Messages will be added here -->
                </div>

                <!-- Options -->
                <div id="chatOptions" class="p-3 bg-white border-t max-h-20 overflow-y-auto">
                    <!-- Options will be added here -->
                </div>
            </div>
        </div>
    `;

    // Chat flow data
    const chatFlow = {
        start: {
            message: "👋 Hi! How can I help you today?",
            options: [
                { text: "📚 Learning Help", next: "learning" },
                { text: "🔐 Account Issues", next: "account" },
                { text: "🏆 XP & Levels", next: "xp" },
                { text: "📧 Email Support", next: "email" }
            ]
        },
        learning: {
            message: "📚 What do you need help with?",
            options: [
                { text: "📹 Video Issues", answer: "Go to your batch → Select subject → Choose chapter → Click video. If not loading, refresh page or check internet!" },
                { text: "📝 DPP Help", answer: "Find DPP in dashboard → Solve before deadline → Earn +25 XP! They track your daily progress." },
                { text: "⏰ Test Problems", answer: "Tests are timed. Once started, timer begins. Submit before time ends or it auto-submits!" },
                { text: "🔙 Back", next: "start" }
            ]
        },
        account: {
            message: "🔐 Account help available:",
            options: [
                { text: "🔑 Forgot Password", answer: "Click 'Forgot Password' on login → Enter email → Check inbox → Follow reset instructions!" },
                { text: "👤 Update Profile", answer: "Go to Profile → Edit Profile → Make changes → Save. Some changes need parent approval." },
                { text: "🔔 Notifications", answer: "Settings → Notifications → Choose email, SMS, or in-app alerts as preferred!" },
                { text: "🔙 Back", next: "start" }
            ]
        },
        xp: {
            message: "🏆 XP System explained:",
            options: [
                { text: "⚡ Earn XP", answer: "Watch videos (+10), Complete DPP (+25), Pass tests 90%+ (+50), Participate (+15)!" },
                { text: "🎯 Levels", answer: "10 levels: Honhar (0-99) → Beginner (100-499) → Focused (500-999) and more!" },
                { text: "🎁 Rewards", answer: "Each level unlocks: Badges, higher rank, special features, achievements!" },
                { text: "🔙 Back", next: "start" }
            ]
        }
    };

    let currentStep = 'start';
    let chatMessages, chatOptions;

    // Initialize chat widget
    function initChatWidget() {
        // Add CSS
        const style = document.createElement('style');
        style.textContent = `
            #chatWidget * { box-sizing: border-box; }
            #chatWidget { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .chat-message { animation: slideUp 0.3s ease-out; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .chat-option { transition: all 0.2s ease; }
            .chat-option:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        `;
        document.head.appendChild(style);

        // Add widget HTML
        document.body.insertAdjacentHTML('beforeend', chatWidgetHTML);

        // Get elements
        const chatButton = document.getElementById('chatButton');
        const chatWindow = document.getElementById('chatWindow');
        const closeChatBtn = document.getElementById('closeChatBtn');
        chatMessages = document.getElementById('chatMessages');
        chatOptions = document.getElementById('chatOptions');

        // Event listeners
        chatButton.addEventListener('click', toggleChat);
        closeChatBtn.addEventListener('click', closeChat);

        // Initialize first message
        setTimeout(() => {
            addMessage(chatFlow.start.message, true);
            showOptions(chatFlow.start.options);
        }, 1000);
    }

    function toggleChat() {
        const chatWindow = document.getElementById('chatWindow');
        const chatButton = document.getElementById('chatButton');
        
        if (chatWindow.classList.contains('hidden')) {
            chatWindow.classList.remove('hidden');
            chatButton.style.transform = 'scale(0.9)';
        } else {
            chatWindow.classList.add('hidden');
            chatButton.style.transform = 'scale(1)';
        }
    }

    function closeChat() {
        document.getElementById('chatWindow').classList.add('hidden');
        document.getElementById('chatButton').style.transform = 'scale(1)';
    }

    function addMessage(content, isBot = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message flex ${isBot ? 'justify-start' : 'justify-end'}`;
        
        messageDiv.innerHTML = `
            <div class="flex items-start space-x-2 max-w-xs">
                ${isBot ? `<div class="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <i class="fas fa-robot text-white text-xs"></i>
                </div>` : ''}
                <div class="bg-${isBot ? 'white border border-gray-200' : 'blue-500 text-white'} rounded-lg px-3 py-2">
                    <p class="text-xs ${isBot ? 'text-gray-800' : 'text-white'}">${content}</p>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showOptions(options) {
        chatOptions.innerHTML = '';
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'chat-option w-full bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-lg p-2 mb-1 text-left text-xs font-medium transition-all';
            button.textContent = option.text;
            button.onclick = () => handleOptionClick(option);
            chatOptions.appendChild(button);
        });
    }

    function handleOptionClick(option) {
        // Add user message
        addMessage(option.text, false);
        
        // Clear options temporarily
        chatOptions.innerHTML = '<div class="text-center text-xs text-gray-500 py-2">AI is typing...</div>';
        
        setTimeout(() => {
            if (option.next === 'email') {
                addMessage("📧 Please email us at: padhle.champs156@gmail.com");
                showEmailOption();
            } else if (option.answer) {
                addMessage(option.answer);
                setTimeout(() => {
                    showOptions(chatFlow[currentStep].options);
                }, 1000);
            } else if (option.next) {
                currentStep = option.next;
                addMessage(chatFlow[currentStep].message);
                setTimeout(() => {
                    showOptions(chatFlow[currentStep].options);
                }, 1000);
            }
        }, 1000);
    }

    function showEmailOption() {
        chatOptions.innerHTML = `
            <div class="space-y-2">
                <a href="mailto:padhle.champs156@gmail.com" class="block w-full bg-blue-500 text-white text-center py-2 rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors">
                    <i class="fas fa-envelope mr-1"></i> Send Email
                </a>
                <button onclick="restartChat()" class="w-full bg-gray-500 text-white text-center py-2 rounded-lg text-xs font-medium hover:bg-gray-600 transition-colors">
                    <i class="fas fa-redo mr-1"></i> Start Over
                </button>
            </div>
        `;
    }

    window.restartChat = function() {
        chatMessages.innerHTML = '';
        currentStep = 'start';
        setTimeout(() => {
            addMessage(chatFlow.start.message, true);
            showOptions(chatFlow.start.options);
        }, 500);
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initChatWidget);
    } else {
        initChatWidget();
    }

})();