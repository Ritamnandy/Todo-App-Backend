
class ApiResponse
{
    private statusCode: number;
    private message: string;
    private data: unknown;
    private error: null;
    private success: boolean

    constructor ( statusCode: number, message: string, data: unknown )
    {
        this.statusCode = statusCode;
        this.message = message;
        this.success = true;
        this.data = data;
        this.error = null;

    }
}

export { ApiResponse }