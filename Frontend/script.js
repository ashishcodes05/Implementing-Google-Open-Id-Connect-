const btn = document.querySelector("#btn");

btn.addEventListener("click", async() => {
    const response = await fetch("http://localhost:4000/profile", {
        credentials: "include"
    })
    const data = await response.json();
    console.log(data)
})