import express from "express";
import cors from "cors"
import "dotenv/config"
import { fetchUserDataFromGoogle, getGoogleAuthURI } from "./Services/googleAuthService.js";
import { writeFile } from "fs/promises"
import users from "./usersDB.json" with {type: "json"}
import sessions from "./sessionsDB.json" with {type: "json"}
import cookieParser from "cookie-parser";

const app = express();
const PORT = 4000;

app.use(cors({
    origin: "http://localhost:5500",
    credentials: true
}))
app.use(express.json());
app.use(cookieParser());

app.get('/auth/google', (req, res) => {
    const authURI = getGoogleAuthURI();
    res.redirect(authURI);
    return res.end();
})

app.get("/auth/google/callback", async (req, res) => {
    try {
        const { code } = req.query;
        const { sid } = req.cookies;
        const existingSession = sessions.find(({ id }) => id === sid);
        if (existingSession) {
            return res.status(401).json({ message: "User Already logged in" })
        }
        const userData = await fetchUserDataFromGoogle(code);
        const { email, name, sub: id, picture } = userData;
        const existingUser = users.find((user) => user.id === id)
        if (existingUser) {
            const id = crypto.randomUUID();
            sessions.push({ id, userId: existingUser.id });
            await writeFile("sessionsDB.json", JSON.stringify(sessions, null, 2));
            res.redirect(`http://localhost:5500/callback.html?sid=${id}`);
            res.status(200).end();
        }
        users.push({ id, email, name, picture });
        const sessionId = crypto.randomUUID();
        sessions.push({ id: sessionId, userId: id });
        await writeFile("sessionsDB.json", JSON.stringify(sessions, null, 2));
        await writeFile("usersDB.json", JSON.stringify(users, null, 2));
        res.redirect(`http://localhost:5500/callback.html?sid=${sessionId}`);
        res.status(200).end();
    } catch (err) {
        console.log(err)
        return res.status(500).json({message: "Error has occured"})
    }
})

app.get("/profile", (req, res) => {
    const { sid } = req.cookies;
    const existingSession = sessions.find(({ id }) => id === sid);
    if (!existingSession) {
        return res.status(401).json({ message: "User not logged in" })
    }
    const userId = existingSession.userId;
    const user = users.find((user) => user.id === userId)
    return res.status(200).json(user);
})

app.get("/session-cookie", (req, res) => {
    const { sid } = req.query;
    console.log(sid)
    res.cookie("sid", sid, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
    res.status(200).end();
})

app.post("/logout", async (req, res) => {
    const { sid } = req.cookies;
    const existingSessionIdx = sessions.findIndex(({ id }) => id === sid);
    if (existingSessionIdx === -1) {
        return res.status(401).json({ message: "User not logged in" })
    }
    sessions.splice(existingSessionIdx, 1);
    await writeFile("sessionsDB.json", JSON.stringify(sessions, null, 2));
    res.clearCookie("sid")
    return res.status(200).json({ message: "User logout successfully" })
})

app.listen(PORT, () => {
    console.log("app is listening at PORT 4000")
})