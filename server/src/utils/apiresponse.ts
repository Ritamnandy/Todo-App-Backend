
class ApiResponse
{
    private statusCode: number;
    private message: string;
    private data: (string | object)[];
    private error: null;
    private success: boolean

    constructor ( statusCode: number, message: string, data: ( string | object )[] )
    {
        this.statusCode = statusCode;
        this.message = message;
        this.success = true;
        this.data = data;
        this.error = null;

    }
}

export { ApiResponse }