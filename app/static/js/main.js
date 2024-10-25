document.addEventListener('DOMContentLoaded', function() {
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const chatHistory = document.getElementById('chat-history');

    sendButton.addEventListener('click', function() {
        const message = userInput.value;
        if (message) {
            // 将用户消息添加到聊天历史
            const userMessageElement = document.createElement('p');
            userMessageElement.textContent = `You: ${message}`;
            chatHistory.appendChild(userMessageElement);

            // 发送AJAX请求到服务器
            fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: message })
            })
            .then(response => response.json())
            .then(data => {
                // 将机器人的响应添加到聊天历史
                const botMessageElement = document.createElement('p');
                botMessageElement.textContent = `Bot: ${data.response}`;
                chatHistory.appendChild(botMessageElement);
            })
            .catch(error => console.error('Error:', error));

            // 清空输入框
            userInput.value = '';
        }
    });
});