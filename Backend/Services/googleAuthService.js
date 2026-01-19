import { OAuth2Client } from "google-auth-library";

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectURI = "http://localhost:4000/auth/google/callback";

const client = new OAuth2Client({
    clientId,
    clientSecret,
    redirectUri: redirectURI
});

export const fetchUserDataFromGoogle = async(code) => {
    const { tokens } = await client.getToken(code);
    const loginTicket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: clientId
    })
    const userData = loginTicket.getPayload();
    return userData;
}

export const getGoogleAuthURI = () => {
    return client.generateAuthUrl({
        scope: ["openid", "email", "profile"],
    })
}