       document.addEventListener('DOMContentLoaded', function () {
            const userInput = document.getElementById('userInput');
            const sendButton = document.getElementById('sendButton');
            const messages = document.getElementById('messages');

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

                        // 检查是否包含换行符
                        if (chunk.includes('\n')) {
                            // 分割成多个段落
                            const paragraphs = chunk.split('\n');
                            paragraphs.forEach((paragraph, index) => {
                                // 除去空的段落
                                if (paragraph.trim() !== '') {
                                    // 创建新的段落元素
                                    const paragraphElement = document.createElement('div');
                                    paragraphElement.className = 'message';
                                    paragraphElement.textContent = paragraph.trim(); // 使用 trim() 去除首尾空格
                                    messages.appendChild(paragraphElement);
                                    // 如果不是第一个段落，添加一个换行
                                    if (index !== 0) {
                                        const brElement = document.createElement('br');
                                        messages.appendChild(brElement);
                                    }
                                }
                            });
                        } else {
                            // 如果没有换行符，直接追加内容
                            if (botMessageElement) {
                                botMessageElement.textContent += chunk;
                            }
                        }

                        requestAnimationFrame(() => {
                            messages.scrollTop = messages.scrollHeight;
                        });

                        readStream(); // 递归调用以继续读取流
                    }).catch(error => {
                        console.error('Error reading stream:', error);
                        if (botMessageElement) {
                            botMessageElement.textContent += '\nAn error occurred while processing your request. Please try again later.';
                        }
                    });
                }

                readStream();
            })
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
