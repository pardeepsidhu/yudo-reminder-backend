const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input"); // For user input

const API_ID = "23608320"; // Replace with your API ID
const API_HASH = "13605f352ce27d94bd1b9edfe8c48f31"; // Replace with your API Hash

const stringSession = new StringSession(""); // Empty for first login

const sendMessage = async () => {
    const client = new TelegramClient(stringSession, API_ID, API_HASH, {
        connectionRetries: 5,
    });

    console.log("Connecting to Telegram...");
    await client.start({
        phoneNumber: async () => await input.text("Enter your phone number: "),
        password: async () => await input.text("Enter your password (if 2FA enabled): "),
        phoneCode: async () => await input.text("Enter the OTP you received: "),
        onError: (err) => console.log(err),
    });

    console.log("Connected!");
    console.log("Your session string (save this for future logins):", client.session.save());

    const receiver = await input.text("Enter the username, phone number, or user ID of the recipient: ");
    const message = await input.text("Enter your message: ");

    try {
        await client.sendMessage(receiver, { message });
        console.log("Message sent successfully!");
    } catch (error) {
        console.error("Failed to send message:", error);
    }

    await client.disconnect();
};

export {sendMessage}
