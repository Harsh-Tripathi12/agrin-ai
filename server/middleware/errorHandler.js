export function errorHandler(
    error,
    req,
    res,
    next
) {

    console.error(
        "Unhandled error:",
        error
    );


    if (
        res.headersSent
    ) {

        return next(
            error
        );

    }


    return res.status(
        error.status || 500
    ).json({

        success: false,

        message:
            error.message ||
            "Internal server error",

    });
}