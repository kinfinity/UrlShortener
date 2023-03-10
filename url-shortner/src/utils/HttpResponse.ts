
const Response = (message: any) => {
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        isBase64Encoded: false,
        body: message
    }
}

const Custom = (statusCode: number, message: any) => {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
        isBase64Encoded: false,
        body: message
    }
}

export const HttpResponse = {
    Response,
    Custom
}