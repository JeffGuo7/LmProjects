document.addEventListener('DOMContentLoaded', function () {
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const messages = document.getElementById('messages');

    function createMessageElement(text) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = text;
        return messageElement;
    }

    function appendMessage(text) {
        const messageElement = createMessageElement(text);
        messages.appendChild(messageElement);
        requestAnimationFrame(() => {
            messages.scrollTop = messages.scrollHeight;
        });
        return messageElement;
    }

    sendButton.addEventListener('click', function () {
        const userMessage = userInput.value.trim();
        if (userMessage === '') {
            alert('Please enter a message.');
            return;
        }

        // 长度限制
        if (userMessage.length > 1000) {  // 假设最大长度为1000
            alert('Message is too long.');
            return;
        }

        // 创建用户消息元素
        appendMessage(`You: ${userMessage}`);

        // 发送请求到服务器
        fetch('http://localhost:8000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({message: userMessage})
        })
            .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }

                    // 处理流式响应
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder('utf-8');

                    // 创建 Bot 消息元素
                    const botMessageElement = appendMessage('Bot: ');

                    function readStream() {
                        reader.read().then(({done, value}) => {
                                if (done) {
                                    // 流结束
                                    return;
                                }

                                const chunk = decoder.decode(value, {stream: true});
                                console.log(chunk);


                                botMessageElement.innerHTML += chunk.replace(/\n/g, '<br>') // 将换行符替换为 <br>
                                    .replace(/( +)/g, (match, p1) => p1.split(' ').join('&nbsp;'));

                                requestAnimationFrame(() => {
                                    messages.scrollTop = messages.scrollHeight;
                                });
                                readStream();
                            }
                        ).catch(error => {
                            console.error('Error reading stream:', error);
                            botMessageElement.innerHTML += '\nAn error occurred while processing your request. Please try again later.';
                        });
                    }


                    readStream();
                }
            )
            .catch(error => {
                console.error('Error:', error);
                appendMessage('Bot: An error occurred while processing your request. Please try again later.');
            });

        // 清空输入框
        userInput.value = '';
    });

    userInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendButton.click();
        }
    });
});