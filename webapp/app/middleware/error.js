
module.exports = (error, request, response, next) => {
    if (
        error.message == "Invalid authentication tag length: 0" ||
        error.message == "Invalid IV length" ||
        error.message == "Unsupported state or unable to authenticate data"
    ) {
        return response.status(404).
            send({
                status: false,
                message: "Invalid ID passed."
            });
    }

    const message = {
        message: "Something went wrong.",
    };

    if (process.env.DINE_APP_ENV === "development") {
        message.error = error.message;
    }

    return response.status(500).send(message);
}