// --- Pusher 配置占位符 ---
// 请在此处替换为你自己的 Pusher Key 和 Cluster
const PUSHER_KEY = '在此处替换你的KEY';
const PUSHER_CLUSTER = '在此处替换你的CLUSTER';

// --- 后端配置 ---
// 你的后端需要一个端点（Endpoint）来接收消息，并将其推送到 Pusher。
// 我们在这里定义这个端点的URL。
const MESSAGE_ENDPOINT = '/send-message'; // 你需要创建这个后端服务

// --- DOM 元素引用 ---
const nicknameInput = document.getElementById('nickname-input');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const messagesDiv = document.getElementById('messages');

// --- 初始化 Pusher ---
// 确保在替换上面的 KEY 和 CLUSTER 后，Pusher 能够正确初始化。
if (PUSHER_KEY === '在此处替换你的KEY' || PUSHER_CLUSTER === '在此处替换你的CLUSTER') {
    console.warn('警告：请在 script.js 文件中设置你的 Pusher Key 和 Cluster。');
}
const pusher = new Pusher(PUSHER_KEY, {
    cluster: PUSHER_CLUSTER,
    encrypted: true
});

// --- 订阅频道并绑定事件 ---
// 我们订阅一个名为 'chat-room' 的公共频道。
// 公共频道不需要身份验证，适合快速原型开发。
const channel = pusher.subscribe('chat-room');

// 我们监听 'new-message' 事件。当你的后端通过 Pusher 发送消息时，
// 它会触发这个事件，然后我们在这里接收并处理它。
channel.bind('new-message', (data) => {
    displayMessage(data.nickname, data.message);
});

/**
 * 在聊天窗口中显示一条新消息。
 * @param {string} nickname - 发送消息的用户的昵称。
 * @param {string} message - 消息内容。
 */
function displayMessage(nickname, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'received'); // 所有接收到的消息都用 'received' 样式

    const nicknameElement = document.createElement('div');
    nicknameElement.classList.add('nickname');
    nicknameElement.textContent = nickname;

    const textElement = document.createElement('div');
    textElement.classList.add('text');
    textElement.textContent = message;

    messageElement.appendChild(nicknameElement);
    messageElement.appendChild(textElement);

    messagesDiv.appendChild(messageElement);

    // 自动滚动到最新消息
    scrollToBottom();
}

/**
 * 将消息发送到后端。
 */
async function sendMessage() {
    const nickname = nicknameInput.value.trim();
    const message = messageInput.value.trim();

    if (!nickname) {
        alert('请输入你的昵称。');
        return;
    }
    if (!message) {
        alert('请输入消息内容。');
        return;
    }

    // 为了即时反馈，我们可以先在界面上显示自己发送的消息
    // 注意：这里我们使用了 'sent' 样式来区分
    const sentMessageElement = document.createElement('div');
    sentMessageElement.classList.add('message', 'sent');

    const nicknameElement = document.createElement('div');
    nicknameElement.classList.add('nickname');
    nicknameElement.textContent = nickname;

    const textElement = document.createElement('div');
    textElement.classList.add('text');
    textElement.textContent = message;

    sentMessageElement.appendChild(nicknameElement);
    sentMessageElement.appendChild(textElement);
    messagesDiv.appendChild(sentMessageElement);
    scrollToBottom();


    try {
        // 使用 fetch API 将消息发送到后端
        await fetch(MESSAGE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nickname, message }),
        });
        // 发送成功后清空输入框
        messageInput.value = '';
    } catch (error) {
        console.error('发送消息失败:', error);
        alert('无法发送消息，请检查控制台获取更多信息。');
        // 如果发送失败，可以移除刚刚乐观添加的消息元素
        messagesDiv.removeChild(sentMessageElement);
    }
}

/**
 * 滚动消息区域到底部。
 */
function scrollToBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// --- 事件监听 ---
// 为发送按钮绑定点击事件
sendButton.addEventListener('click', sendMessage);

// 允许用户通过按 Enter 键发送消息
messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// --- 初始加载 ---
// 页面加载时，自动滚动到底部（如果有历史消息的话）
window.addEventListener('load', scrollToBottom);

/*
后端实现指南 (你需要做的):
1. 选择你喜欢的后端语言 (如 Node.js, Python, PHP, Go 等)。
2. 创建一个项目并引入 Pusher 的官方服务端 SDK。
3. 创建一个 API 端点，其路径为 '/send-message'，并能接收 POST 请求。
4. 在该端点中：
   a. 从请求体 (request body) 中解析出 'nickname' 和 'message'。
   b. 使用 Pusher 服务端 SDK，在 'chat-room' 频道的 'new-message' 事件上触发一个消息。
   c. 消息的数据应该包含 'nickname' 和 'message'。
   d. 例如，在 Node.js 中，代码可能如下：

      const pusher = new Pusher({
        appId: "YOUR_APP_ID",
        key: "YOUR_PUSHER_KEY", // 注意：这里的 key 是你的 Pusher Key
        secret: "YOUR_APP_SECRET",
        cluster: "YOUR_CLUSTER", // 这里的 cluster 是你的 Pusher Cluster
        useTLS: true
      });

      app.post('/send-message', (req, res) => {
        const { nickname, message } = req.body;
        pusher.trigger('chat-room', 'new-message', {
          nickname: nickname,
          message: message
        });
        res.status(200).send('Message sent successfully');
      });
*/
