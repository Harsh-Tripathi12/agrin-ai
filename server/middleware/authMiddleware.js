import "dotenv/config";


const FIREBASE_API_KEY =
    process.env.VITE_FIREBASE_API_KEY;


export async function requireAuth(
    req,
    res,
    next
) {

    try {

        const authHeader =
            req.headers.authorization;


        if (
            !authHeader ||
            !authHeader.startsWith(
                "Bearer "
            )
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required",

            });

        }


        const idToken =
            authHeader.split(
                "Bearer "
            )[1];


        // Verify the ID token using
        // Firebase Auth REST API.
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify({
                    idToken,
                }),
            }
        );


        const data =
            await response.json();


        if (
            data.error ||
            !data.users ||
            data.users.length === 0
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid or expired authentication token",

            });

        }


        const user = data.users[0];

        req.user = {
            uid: user.localId,
            email: user.email,
            emailVerified:
                user.emailVerified,
        };


        next();


    } catch (error) {

        console.error(
            "Authentication error:",
            error
        );


        return res.status(401).json({

            success: false,

            message:
                "Invalid or expired authentication token",

        });

    }
}