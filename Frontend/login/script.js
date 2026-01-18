const btn = document.querySelector("#btn");
const BASE_URL = "http://localhost:4000"
const logoutBtn = document.querySelector("#logout");

btn.addEventListener("click", () => {
    window.open(`${BASE_URL}/auth/google`, "Auth-popup", "left=100,top=100,height=420,width=420")
})

window.addEventListener("message", async({data}) => {
    console.log(data.message)
})

logoutBtn.addEventListener("click", async() => {
    const response = await fetch(`${BASE_URL}/logout`, {
        method: "POST",
        credentials: "include"
    })
    const data = await response.json();
    console.log(data);
})

