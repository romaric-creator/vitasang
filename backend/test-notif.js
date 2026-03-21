const { sendPushNotifications, buildPushMessage } = require("./utils/expoNotifications");

async function test() {
    const token = "ExponentPushToken[_UdYKdCiwQ1qDtewGzg2n_]";
    console.log("Testing notification for token:", token);

    const message = buildPushMessage({
        to: token,
        title: "Test VitaSang",
        body: "Ceci est un test direct de votre token de notification.",
        data: { type: "test" }
    });

    try {
        const result = await sendPushNotifications([message]);
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Test failed:", error);
    }
}

test();
