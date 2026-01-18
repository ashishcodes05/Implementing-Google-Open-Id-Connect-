const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectURI = "http://localhost:4000/auth/google/callback";

export const fetchUserDataFromGoogle = async(code) => {
    const payload = `code=${code}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectURI}&grant_type=authorization_code`
    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: payload
    })
    const data = await response.json();
    console.log(data)
    const userToken = data.id_token.split('.')[1];
    const userData = JSON.parse(atob(userToken));
    console.log(userData)
    return userData;
}