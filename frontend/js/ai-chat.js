
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");
const chatStatus = document.getElementById("chat-status");
const sendButton = document.getElementById("send-button");

function addMessage(text, sender) {
    const messageElement = document.createElement("div");

    messageElement.className =
        "chat-message " +
        (sender === "user" ? "user-message" : "ai-message");

    // Use textContent so responses are displayed as text, not HTML.
    messageElement.textContent = text;

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return messageElement;
}

chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = chatInput.value.trim();

    if (!message) {
        return;
    }

    addMessage(message, "user");

    chatInput.value = "";
    chatInput.disabled = true;
    sendButton.disabled = true;
    chatStatus.textContent = "GymBuddy AI is thinking...";

    try {
        const response = await fetch("/ai/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Unable to get an AI response."
            );
        }

        addMessage(data.reply, "ai");
        chatStatus.textContent = "";

    } catch (error) {
        addMessage(
            "Sorry, I couldn't respond right now. Please try again.",
            "ai"
        );

        chatStatus.textContent = error.message;
        console.error("AI chat error:", error);

    } finally {
        chatInput.disabled = false;
        sendButton.disabled = false;
        chatInput.focus();
    }
});
