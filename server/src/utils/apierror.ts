
class ApiError extends Error
{
    private status: number;
    message: string;
    private error: string[];
    private data: null;
    private success: boolean;
    stack?: string;
    constructor (
        status: number,
        message: string,
        error: string[] = [ "Something went wrong" ],
        stack: string = "" )
    {
        super( message );
        this.status = status;
        this.message = message;
        this.error = error;
        this.data = null;
        this.success = false;
        if ( stack )
        {
            this.stack = stack;
        } else
        {
            Error.captureStackTrace( this, this.constructor );
        }
    }

}

export { ApiError }